
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface UserSession {
  _id: string
  user_id: string
  session_id: string
  ip_address?: string
  user_agent?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  location?: string
  is_active: boolean
  created_at: string
  expires_at?: string
  ended_at?: string
}

export const useUserSessions = () => {
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar sessões do usuário
  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSessions([])
      return
    }

    setLoading(true)
    try {
      const { list: userSessions } = await lumi.entities.user_sessions.list({
        filter: { user_id: user.id },
        sort: { created_at: -1 }
      })

      setSessions((userSessions || []) as unknown as UserSession[])
    } catch (error) {
      console.error('Erro ao buscar sessões:', error)
      toast.error('Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Terminar sessão específica
  const endSession = async (sessionId: string) => {
    try {
      const sessionToEnd = sessions.find(s => s._id === sessionId)
      if (!sessionToEnd) return false

      await lumi.entities.user_sessions.update(sessionId, {
        is_active: false,
        ended_at: new Date().toISOString()
      })

      setSessions(prev => prev.map(s => 
        s._id === sessionId 
          ? { ...s, is_active: false, ended_at: new Date().toISOString() }
          : s
      ))

      toast.success('Sessão encerrada com sucesso')
      return true
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error)
      toast.error('Erro ao encerrar sessão')
      return false
    }
  }

  // Terminar todas as outras sessões
  const endAllOtherSessions = async () => {
    try {
      const activeSessions = sessions.filter(s => s.is_active)
      const currentSessionId = getCurrentSessionId() // Implementar lógica para identificar sessão atual
      
      const otherSessions = activeSessions.filter(s => s.session_id !== currentSessionId)
      
      for (const session of otherSessions) {
        await lumi.entities.user_sessions.update(session._id, {
          is_active: false,
          ended_at: new Date().toISOString()
        })
      }

      await fetchSessions()
      toast.success(`${otherSessions.length} sessão(ões) encerrada(s)`)
      return true
    } catch (error) {
      console.error('Erro ao encerrar sessões:', error)
      toast.error('Erro ao encerrar sessões')
      return false
    }
  }

  // Registrar nova sessão (chamado no login)
  const registerSession = async () => {
    if (!user) return

    try {
      const sessionData = {
        user_id: user.id,
        session_id: generateSessionId(),
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        location: await getLocation(),
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      }

      await lumi.entities.user_sessions.create(sessionData)
    } catch (error) {
      console.error('Erro ao registrar sessão:', error)
    }
  }

  // Funções auxiliares
  const getCurrentSessionId = (): string => {
    // Implementar lógica para identificar sessão atual
    return localStorage.getItem('currentSessionId') || ''
  }

  const generateSessionId = (): string => {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('currentSessionId', sessionId)
    return sessionId
  }

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'Unknown'
    }
  }

  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile'
    if (/tablet|ipad/.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  const getLocation = async (): Promise<string> => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      return `${data.city}, ${data.region}`
    } catch {
      return 'Unknown'
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    loading,
    fetchSessions,
    endSession,
    endAllOtherSessions,
    registerSession,
    activeSessions: sessions.filter(s => s.is_active),
    totalSessions: sessions.length
  }
}
