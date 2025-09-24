
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'

interface AuthUser {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(lumi.auth.user)
  const [isAuthenticated, setIsAuthenticated] = useState(lumi.auth.isAuthenticated)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar sessão existente
    const currentUser = lumi.auth.user
    const isLoggedIn = lumi.auth.isAuthenticated

    if (isLoggedIn && currentUser) {
      setUser(currentUser)
      setIsAuthenticated(true)
    }

    // Escutar mudanças de estado
    const unsubscribe = lumi.auth.onAuthChange(({ isAuthenticated, user }) => {
      setUser(user)
      setIsAuthenticated(isAuthenticated)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      await lumi.auth.signIn()
      // O estado será atualizado automaticamente via onAuthChange
    } catch (error) {
      setLoading(false)
      console.error('Login failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await lumi.auth.signOut()
      // O estado será atualizado automaticamente via onAuthChange
    } catch (error) {
      setLoading(false)
      console.error('Logout failed:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    userRole: user?.userRole,
    isAdmin: user?.userRole === 'ADMIN'
  }
}
