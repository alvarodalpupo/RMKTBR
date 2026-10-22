
import { create } from 'zustand'
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
  initializeUsers: () => void
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

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  filters: {
    search: '',
    role: 'all',
    status: 'all'
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  getFilteredUsers: () => {
    const { users, filters } = get()
    return users.filter(user => {
      const matchesSearch = !filters.search || 
        user.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesRole = filters.role === 'all' || user.role === filters.role
      const matchesStatus = filters.status === 'all' || user.status === filters.status
      
      return matchesSearch && matchesRole && matchesStatus
    })
  },

  getUserStats: () => {
    const { users } = get()
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ativo').length,
      banned: users.filter(u => u.status === 'banido').length,
      suspended: users.filter(u => u.status === 'suspenso').length,
      admins: users.filter(u => u.role === 'admin').length,
      verified: users.filter(u => u.verified).length
    }
  },

  banUser: async (userId: string, reason: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, status: 'banido' as const } : user
        ),
        loading: false
      }))

      const user = get().users.find(u => u.id === userId)
      if (user) {
        useNotificationsStore.getState().addNotification({
          user_id: userId,
          type: 'account',
          title: 'Conta Banida',
          message: `Sua conta foi banida. Motivo: ${reason}`,
          read: false
        })
      }

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  unbanUser: async (userId: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, status: 'ativo' as const } : user
        ),
        loading: false
      }))

      const user = get().users.find(u => u.id === userId)
      if (user) {
        useNotificationsStore.getState().addNotification({
          user_id: userId,
          type: 'account',
          title: 'Conta Reativada',
          message: 'Sua conta foi reativada e você pode usar a plataforma novamente.',
          read: false
        })
      }

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  suspendUser: async (userId: string, reason: string, days: number) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, status: 'suspenso' as const } : user
        ),
        loading: false
      }))

      const user = get().users.find(u => u.id === userId)
      if (user) {
        useNotificationsStore.getState().addNotification({
          user_id: userId,
          type: 'account',
          title: 'Conta Suspensa',
          message: `Sua conta foi suspensa por ${days} dias. Motivo: ${reason}`,
          read: false
        })
      }

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  promoteToAdmin: async (userId: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, role: 'admin' as const } : user
        ),
        loading: false
      }))

      const user = get().users.find(u => u.id === userId)
      if (user) {
        useNotificationsStore.getState().addNotification({
          user_id: userId,
          type: 'account',
          title: 'Promovido a Administrador',
          message: 'Parabéns! Você foi promovido a administrador da plataforma.',
          read: false
        })
      }

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  demoteFromAdmin: async (userId: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, role: 'user' as const } : user
        ),
        loading: false
      }))

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  verifyUser: async (userId: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, verified: true } : user
        ),
        loading: false
      }))

      const user = get().users.find(u => u.id === userId)
      if (user) {
        useNotificationsStore.getState().addNotification({
          user_id: userId,
          type: 'account',
          title: 'Conta Verificada',
          message: 'Sua conta foi verificada com sucesso!',
          read: false
        })
      }

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  deleteUser: async (userId: string) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.filter(user => user.id !== userId),
        loading: false
      }))

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        ),
        loading: false
      }))

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  initializeUsers: () => {
    set({ users: mockUsers })
  }
}))
