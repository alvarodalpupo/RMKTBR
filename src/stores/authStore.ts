import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, isDemoMode, mensagemDeErro, enviarSemEsperar } from '../lib/supabase'

/**
 * Autenticação com Supabase Auth: e-mail e senha, Google e recuperação de senha.
 *
 * O papel (user/admin) vem da tabela `profiles`, protegida no banco: o usuário
 * não consegue se promover. A checagem aqui só decide o que aparece na tela;
 * quem protege os dados são as regras (RLS) em supabase/migrations.
 */

export interface User {
  id: string
  nome: string
  email: string
  role: 'user' | 'admin'
  status: 'ativo' | 'banido' | 'suspenso'
  avatarUrl?: string
  createdAt?: string
}

export interface AuthResult {
  ok: boolean
  /** Mensagem pronta para mostrar ao usuário quando ok = false. */
  error?: string
  /** Cadastro feito, mas falta confirmar o e-mail. */
  needsConfirmation?: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  /** true depois de verificar se havia sessão salva (evita piscar a tela de login). */
  ready: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (nome: string, email: string, password: string) => Promise<AuthResult>
  loginWithGoogle: () => Promise<AuthResult>
  forgotPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  /** Só no modo demonstração (sem Supabase): entra sem senha para conhecer as telas. */
  loginDemo: (role: 'user' | 'admin') => void
}

const demoIndisponivel: AuthResult = {
  ok: false,
  error: 'Login indisponível no modo demonstração. Configure o Supabase (veja o README).',
}

const siteUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`

async function carregarUsuario(session: Session | null): Promise<User | null> {
  if (!supabase || !session?.user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, email, role, status, avatar_url, created_at')
    .eq('id', session.user.id)
    .maybeSingle()

  const meta = session.user.user_metadata ?? {}
  return {
    id: session.user.id,
    nome: profile?.nome || meta.nome || meta.full_name || session.user.email?.split('@')[0] || 'Usuário',
    email: profile?.email || session.user.email || '',
    role: profile?.role === 'admin' ? 'admin' : 'user',
    status: profile?.status ?? 'ativo',
    avatarUrl: profile?.avatar_url || meta.avatar_url,
    createdAt: profile?.created_at ?? session.user.created_at,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  ready: isDemoMode,

  login: async (email, password) => {
    if (!supabase) return demoIndisponivel
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      set({ isLoading: false })
      return { ok: false, error: mensagemDeErro(error, 'Não foi possível entrar.') }
    }
    const user = await carregarUsuario(data.session)
    if (user?.status === 'banido') {
      await supabase.auth.signOut()
      set({ user: null, isAuthenticated: false, isLoading: false })
      return { ok: false, error: 'Esta conta foi bloqueada. Fale com o suporte pelo Contato.' }
    }
    set({ user, isAuthenticated: !!user, isLoading: false })
    enviarSemEsperar(supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id))
    return { ok: true }
  },

  register: async (nome, email, password) => {
    if (!supabase) return demoIndisponivel
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nome: nome.trim() }, emailRedirectTo: `${siteUrl()}painel` },
    })
    if (error) {
      set({ isLoading: false })
      return { ok: false, error: mensagemDeErro(error, 'Não foi possível criar a conta.') }
    }
    if (!data.session) {
      set({ isLoading: false })
      return { ok: true, needsConfirmation: true }
    }
    const user = await carregarUsuario(data.session)
    set({ user, isAuthenticated: !!user, isLoading: false })
    return { ok: true }
  },

  loginWithGoogle: async () => {
    if (!supabase) return demoIndisponivel
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl()}painel` },
    })
    if (error) return { ok: false, error: mensagemDeErro(error, 'Não foi possível entrar com o Google.') }
    return { ok: true } // o navegador vai para o Google e volta logado
  },

  forgotPassword: async (email) => {
    if (!supabase) return demoIndisponivel
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl()}nova-senha`,
    })
    if (error) return { ok: false, error: mensagemDeErro(error, 'Não foi possível enviar o e-mail.') }
    return { ok: true }
  },

  updatePassword: async (password) => {
    if (!supabase) return demoIndisponivel
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { ok: false, error: mensagemDeErro(error, 'Não foi possível trocar a senha.') }
    return { ok: true }
  },

  logout: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  loginDemo: (role) => {
    if (!isDemoMode) return
    set({
      user: {
        id: role === 'admin' ? 'demo-admin' : 'demo-user',
        nome: role === 'admin' ? 'Admin (demonstração)' : 'Usuário (demonstração)',
        email: role === 'admin' ? 'admin@demo.racemarketbr' : 'usuario@demo.racemarketbr',
        role,
        status: 'ativo',
      },
      isAuthenticated: true,
    })
  },

  refresh: async () => {
    if (!supabase) return
    const { data } = await supabase.auth.getSession()
    const user = await carregarUsuario(data.session)
    set({ user, isAuthenticated: !!user, ready: true })
    void get()
  },
}))

// Sessão salva, login pelo Google (volta com o token na URL) e outras abas.
if (supabase) {
  void useAuthStore.getState().refresh()
  supabase.auth.onAuthStateChange((_event, session) => {
    // Não chamar o Supabase direto aqui dentro (recomendação da biblioteca)
    setTimeout(async () => {
      const user = await carregarUsuario(session)
      useAuthStore.setState({ user, isAuthenticated: !!user, ready: true })
    }, 0)
  })
}
