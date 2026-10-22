import { create } from 'zustand'
import { lumi } from '../lib/lumi'

/**
 * Autenticação real via Lumi.
 *
 * O login/cadastro acontece na janela segura do Lumi (auth.lumi.new), que
 * cuida de senha, recuperação de senha e provedores sociais. O papel do
 * usuário (ADMIN/USER) vem do servidor do Lumi — não é mais decidido pelo
 * e-mail digitado no navegador.
 *
 * Importante: esta verificação no front-end só controla o que aparece na
 * tela. Quem garante a segurança dos dados são as permissões das entidades
 * configuradas no painel do Lumi.
 */

export interface User {
  id: string
  nome: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
}

/** Formato do usuário retornado pelo Lumi (inclui o papel definido no servidor). */
interface LumiUser {
  userId: string
  email: string
  userName: string
  createdTime: string
  userRole?: 'ADMIN' | 'USER'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Abre a janela de login/cadastro do Lumi. Retorna true se o usuário entrou. */
  login: () => Promise<boolean>
  logout: () => void
  /** Revalida o usuário no servidor (ex.: após mudar o papel no painel do Lumi). */
  refresh: () => Promise<void>
}

const mapUser = (raw: LumiUser | null): User | null => {
  if (!raw) return null
  return {
    id: raw.userId,
    nome: raw.userName || raw.email?.split('@')[0] || 'Usuário',
    email: raw.email,
    role: raw.userRole === 'ADMIN' ? 'admin' : 'user',
    createdAt: raw.createdTime,
  }
}

const readSession = () => {
  const user = mapUser(lumi.auth.user as LumiUser | null)
  return { user, isAuthenticated: lumi.auth.isAuthenticated && !!user }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readSession(),
  isLoading: false,

  login: async () => {
    set({ isLoading: true })
    try {
      await lumi.auth.signIn()
      set({ ...readSession(), isLoading: false })
      return true
    } catch (error) {
      // Janela fechada pelo usuário ou bloqueada pelo navegador
      console.warn('Login não concluído:', error)
      set({ isLoading: false })
      return false
    }
  },

  logout: () => {
    lumi.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  refresh: async () => {
    if (!lumi.auth.isAuthenticated) return
    try {
      await lumi.auth.refreshUser()
      set(readSession())
    } catch {
      // Token expirado ou inválido: encerra a sessão local
      lumi.auth.signOut()
      set({ user: null, isAuthenticated: false })
    }
  },
}))

// Mantém o estado sincronizado entre abas e com mudanças feitas pelo SDK.
lumi.auth.onAuthChange(() => useAuthStore.setState(readSession()))

// Confirma no servidor que a sessão salva ainda é válida e atualiza o papel.
void useAuthStore.getState().refresh()
