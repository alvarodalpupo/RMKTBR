
import { create } from 'zustand'

interface User {
  id: string
  nome: string
  email: string
  role: 'user' | 'admin'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (nome: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - em produção viria da API
      const mockUser: User = {
        id: '1',
        nome: email === 'admin@racemarket.com' ? 'Alvaro Dalp' : 'Usuário Teste',
        email,
        role: email === 'admin@racemarket.com' ? 'admin' : 'user'
      }
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      return false
    }
  },

  register: async (nome: string, email: string, password: string) => {
    set({ isLoading: true })
    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: Date.now().toString(),
        nome,
        email,
        role: 'user'
      }
      
      set({ user: newUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      return false
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true })
    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      return false
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true })
    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      return false
    }
  }
}))
