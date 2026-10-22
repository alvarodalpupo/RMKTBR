import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, ready } = useAuthStore()
  const location = useLocation()

  // Ainda conferindo se há sessão salva: não manda para o login à toa
  if (!ready) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center" role="status" aria-label="Carregando">
        <div className="w-10 h-10 border-4 border-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/painel" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
