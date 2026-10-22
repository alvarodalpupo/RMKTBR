
import { create } from 'zustand'
import toast from 'react-hot-toast'
import { supabase, mensagemDeErro } from '../lib/supabase'
import { useNotificationsStore } from './notificationsStore'

export interface User {
  id: string
  nome: string
  email: string
  role: 'user' | 'admin'
  status: 'ativo' | 'banido' | 'suspenso'
  created_at: string
  last_login: string
  total_listings: number
  total_views: number
  telefone?: string
  cidade?: string
  uf?: string
  avatar?: string
  verified: boolean
}

export interface UserFilters {
  search: string
  role: 'all' | 'user' | 'admin'
  status: 'all' | 'ativo' | 'banido' | 'suspenso'
}

interface UsersState {
  users: User[]
  loading: boolean
  filters: UserFilters
  setFilters: (filters: Partial<UsersState['filters']>) => void
  getFilteredUsers: () => User[]
  getUserStats: () => {
    total: number
    active: number
    banned: number
    suspended: number
    admins: number
    verified: number
  }
  banUser: (userId: string, reason: string) => Promise<boolean>
  unbanUser: (userId: string) => Promise<boolean>
  suspendUser: (userId: string, reason: string, days: number) => Promise<boolean>
  promoteToAdmin: (userId: string) => Promise<boolean>
  demoteFromAdmin: (userId: string) => Promise<boolean>
  verifyUser: (userId: string) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>
  /** Carrega os usuários (do banco, ou de exemplo no modo demonstração). */
  initializeUsers: () => Promise<void>
}

// Mock data para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    nome: 'Alvaro Dalp',
    email: 'admin@racemarket.com',
    role: 'admin',
    status: 'ativo',
    created_at: '2024-01-15T10:30:00Z',
    last_login: '2024-01-20T14:20:00Z',
    total_listings: 0,
    total_views: 0,
    telefone: '(11) 99999-9999',
    cidade: 'São Paulo',
    uf: 'SP',
    verified: true
  },
  {
    id: '2',
    nome: 'Carlos Silva',
    email: 'carlos@email.com',
    role: 'user',
    status: 'ativo',
    created_at: '2024-01-10T08:15:00Z',
    last_login: '2024-01-19T16:45:00Z',
    total_listings: 5,
    total_views: 1250,
    telefone: '(11) 88888-8888',
    cidade: 'São Paulo',
    uf: 'SP',
    verified: true
  },
  {
    id: '3',
    nome: 'Ana Santos',
    email: 'ana@email.com',
    role: 'user',
    status: 'ativo',
    created_at: '2024-01-08T12:00:00Z',
    last_login: '2024-01-18T20:30:00Z',
    total_listings: 3,
    total_views: 890,
    telefone: '(21) 77777-7777',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    verified: false
  },
  {
    id: '4',
    nome: 'Pedro Costa',
    email: 'pedro@email.com',
    role: 'user',
    status: 'suspenso',
    created_at: '2024-01-05T14:30:00Z',
    last_login: '2024-01-15T11:20:00Z',
    total_listings: 2,
    total_views: 450,
    telefone: '(31) 66666-6666',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    verified: true
  },
  {
    id: '5',
    nome: 'Lucas Oliveira',
    email: 'lucas@email.com',
    role: 'user',
    status: 'banido',
    created_at: '2024-01-03T09:45:00Z',
    last_login: '2024-01-12T13:15:00Z',
    total_listings: 1,
    total_views: 120,
    telefone: '(41) 55555-5555',
    cidade: 'Curitiba',
    uf: 'PR',
    verified: false
  }
]

type ProfileRow = {
  id: string
  nome: string
  email: string
  role: User['role']
  status: User['status']
  verified: boolean
  telefone: string | null
  cidade: string | null
  uf: string | null
  avatar_url: string | null
  created_at: string
  last_login: string | null
}

const deLinha = (p: ProfileRow, stats?: { total_listings: number; total_views: number }): User => ({
  id: p.id,
  nome: p.nome,
  email: p.email,
  role: p.role,
  status: p.status,
  verified: p.verified,
  telefone: p.telefone ?? undefined,
  cidade: p.cidade ?? undefined,
  uf: p.uf ?? undefined,
  avatar: p.avatar_url ?? undefined,
  created_at: p.created_at,
  last_login: p.last_login ?? p.created_at,
  total_listings: stats?.total_listings ?? 0,
  total_views: stats?.total_views ?? 0,
})

/** Colunas da tabela profiles que o admin pode alterar. */
const paraLinha = (u: Partial<User> & { suspended_until?: string | null; status_reason?: string | null }) => {
  const row: Record<string, unknown> = {}
  for (const k of ['nome', 'role', 'status', 'verified', 'telefone', 'cidade', 'uf', 'suspended_until', 'status_reason'] as const) {
    if (k in u) row[k] = (u as Record<string, unknown>)[k] ?? null
  }
  if ('avatar' in u) row.avatar_url = u.avatar ?? null
  return row
}

export const useUsersStore = create<UsersState>((set, get) => {
  /** Muda na tela, grava no banco e avisa o usuário; desfaz se falhar. */
  const alterar = async (
    userId: string,
    updates: Partial<User> & { suspended_until?: string | null; status_reason?: string | null },
    aviso?: { title: string; message: string },
  ) => {
    const antes = get().users
    set({ users: antes.map((u) => (u.id === userId ? { ...u, ...updates } : u)), loading: true })
    if (supabase) {
      const { data, error } = await supabase.from('profiles').update(paraLinha(updates)).eq('id', userId).select('id')
      if (error || !data?.length) {
        set({ users: antes, loading: false })
        toast.error(error ? mensagemDeErro(error, 'Não foi possível alterar o usuário.') : 'Usuário não encontrado ou sem permissão.')
        return false
      }
    }
    set({ loading: false })
    if (aviso) {
      useNotificationsStore.getState().addNotification({ user_id: userId, type: 'account', read: false, ...aviso })
    }
    return true
  }

  return {
    users: [],
    loading: false,
    filters: { search: '', role: 'all', status: 'all' },

    setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

    getFilteredUsers: () => {
      const { users, filters } = get()
      const busca = filters.search.toLowerCase()
      return users.filter(
        (u) =>
          (!busca || u.nome.toLowerCase().includes(busca) || u.email.toLowerCase().includes(busca)) &&
          (filters.role === 'all' || u.role === filters.role) &&
          (filters.status === 'all' || u.status === filters.status),
      )
    },

    getUserStats: () => {
      const { users } = get()
      return {
        total: users.length,
        active: users.filter((u) => u.status === 'ativo').length,
        banned: users.filter((u) => u.status === 'banido').length,
        suspended: users.filter((u) => u.status === 'suspenso').length,
        admins: users.filter((u) => u.role === 'admin').length,
        verified: users.filter((u) => u.verified).length,
      }
    },

    banUser: (userId, reason) =>
      alterar(userId, { status: 'banido', status_reason: reason }, { title: 'Conta bloqueada', message: `Sua conta foi bloqueada. Motivo: ${reason}` }),

    unbanUser: (userId) =>
      alterar(userId, { status: 'ativo', status_reason: null, suspended_until: null }, { title: 'Conta reativada', message: 'Sua conta foi reativada.' }),

    suspendUser: (userId, reason, days) => {
      const ate = new Date(Date.now() + days * 86400000)
      return alterar(
        userId,
        { status: 'suspenso', status_reason: reason, suspended_until: ate.toISOString() },
        { title: 'Conta suspensa', message: `Sua conta está suspensa até ${ate.toLocaleDateString('pt-BR')}. Motivo: ${reason}` },
      )
    },

    promoteToAdmin: (userId) =>
      alterar(userId, { role: 'admin' }, { title: 'Você agora é administrador', message: 'Sua conta recebeu acesso ao painel administrativo.' }),

    demoteFromAdmin: (userId) => alterar(userId, { role: 'user' }),

    verifyUser: (userId) =>
      alterar(userId, { verified: true }, { title: 'Conta verificada', message: 'Sua conta foi verificada pela equipe RaceMarketBR.' }),

    // Excluir o login de vez exige a chave secreta do Supabase, que não pode
    // ficar no site. Aqui a conta é bloqueada e some da lista.
    deleteUser: async (userId) => {
      const ok = await alterar(userId, { status: 'banido', status_reason: 'Conta excluída pelo administrador' })
      if (ok) {
        set((state) => ({ users: state.users.filter((u) => u.id !== userId) }))
        if (supabase) toast('Conta bloqueada. Para apagar o login de vez: Supabase → Authentication → Users.', { duration: 7000 })
      }
      return ok
    },

    updateUser: (userId, updates) => alterar(userId, updates),

    initializeUsers: async () => {
      if (!supabase) {
        set({ users: mockUsers })
        return
      }
      set({ loading: true })
      const [perfis, stats] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, nome, email, role, status, status_reason, verified, telefone, cidade, uf, avatar_url, created_at, last_login')
          .order('created_at', { ascending: false }),
        supabase.from('profile_stats').select('id, total_listings, total_views'),
      ])
      set({ loading: false })
      if (perfis.error) {
        toast.error(mensagemDeErro(perfis.error, 'Não foi possível carregar os usuários.'))
        return
      }
      const porId = new Map((stats.data ?? []).map((s) => [s.id as string, s as { total_listings: number; total_views: number }]))
      const excluidos = (p: ProfileRow & { status_reason?: string }) => p.status_reason === 'Conta excluída pelo administrador'
      set({
        users: (perfis.data as ProfileRow[]).filter((p) => !excluidos(p)).map((p) => deLinha(p, porId.get(p.id))),
      })
    },
  }
})
