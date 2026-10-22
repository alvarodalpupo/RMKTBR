import { useAuthStore } from '../stores/authStore'

/**
 * Atalho para o estado de autenticação.
 * Mantido por compatibilidade: a fonte única é o `useAuthStore`.
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore()

  return {
    user,
    isAuthenticated,
    loading: isLoading,
    signIn: login,
    signOut: logout,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
  }
}
