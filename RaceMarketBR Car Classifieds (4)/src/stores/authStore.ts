
import { create } from 'zustand'

interface User {
  id: string
  nome: string
  email: string
  role: 'user' | 'admin'
  photoURL?: string
  provider?: 'email' | 'google' | 'facebook'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  loginWithFacebook: () => Promise<boolean>
  register: (nome: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (token: string, newPassword: string) => Promise<boolean>
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

// Simulação de Firebase Auth para desenvolvimento
const simulateFirebaseAuth = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simular 90% de sucesso
      if (Math.random() > 0.1) {
        resolve(true)
      } else {
        reject(new Error('Simulated auth error'))
      }
    }, 1000 + Math.random() * 1000) // 1-2 segundos
  })
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      
      // Mock user data - em produção viria da API/Firebase
      const mockUser: User = {
        id: '1',
        nome: email === 'admin@racemarket.com' ? 'Alvaro Dalp' : 'Usuário Teste',
        email,
        role: email === 'admin@racemarket.com' ? 'admin' : 'user',
        provider: 'email'
      }
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      
      // Simular diferentes tipos de erro Firebase
      const errorTypes = [
        { code: 'auth/wrong-password', message: 'Senha incorreta' },
        { code: 'auth/user-not-found', message: 'Usuário não encontrado' },
        { code: 'auth/invalid-email', message: 'E-mail inválido' },
        { code: 'auth/too-many-requests', message: 'Muitas tentativas' }
      ]
      
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      const firebaseError = new Error(randomError.message) as any
      firebaseError.code = randomError.code
      
      throw firebaseError
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      
      const googleUser: User = {
        id: 'google_' + Date.now(),
        nome: 'Usuário Google',
        email: 'usuario@gmail.com',
        role: 'user',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google'
      }
      
      set({ user: googleUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  loginWithFacebook: async () => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      
      const facebookUser: User = {
        id: 'facebook_' + Date.now(),
        nome: 'Usuário Facebook',
        email: 'usuario@facebook.com',
        role: 'user',
        photoURL: 'https://graph.facebook.com/v3.0/me/picture?type=large',
        provider: 'facebook'
      }
      
      set({ user: facebookUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (nome: string, email: string, password: string) => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      
      const newUser: User = {
        id: Date.now().toString(),
        nome,
        email,
        role: 'user',
        provider: 'email'
      }
      
      set({ user: newUser, isAuthenticated: true, isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      
      // Simular erros específicos do Firebase para registro
      const registerErrors = [
        { code: 'auth/email-already-in-use', message: 'E-mail já está em uso' },
        { code: 'auth/invalid-email', message: 'E-mail inválido' },
        { code: 'auth/weak-password', message: 'Senha muito fraca' },
        { code: 'auth/operation-not-allowed', message: 'Operação não permitida' }
      ]
      
      const randomError = registerErrors[Math.floor(Math.random() * registerErrors.length)]
      const firebaseError = new Error(randomError.message) as any
      firebaseError.code = randomError.code
      
      throw firebaseError
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      
      // Simular erros de recuperação de senha
      const resetErrors = [
        { code: 'auth/invalid-email', message: 'E-mail inválido' },
        { code: 'auth/user-not-found', message: 'Usuário não encontrado' }
      ]
      
      const randomError = resetErrors[Math.floor(Math.random() * resetErrors.length)]
      const firebaseError = new Error(randomError.message) as any
      firebaseError.code = randomError.code
      
      throw firebaseError
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true })
    try {
      await simulateFirebaseAuth()
      
      const currentUser = get().user
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data }
        set({ user: updatedUser, isLoading: false })
        return true
      }
      
      set({ isLoading: false })
      return false
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  }
}))
