import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase, mensagemDeErro } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

interface UserSession {
  _id: string
  session_id: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  location?: string
  ip_address?: string
  is_active: boolean
  created_at: string
  ended_at?: string
}

const tipoDeAparelho = (): UserSession['device_type'] => {
  const ua = navigator.userAgent
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

const navegador = () => {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Navegador'
}

/**
 * Sessões de login. O Supabase não expõe a lista de aparelhos para o site,
 * então mostramos este aparelho e oferecemos "sair dos outros aparelhos",
 * que encerra de verdade todas as outras sessões da conta.
 * (Antes o site enviava o IP de quem entrava para um serviço externo; isso saiu.)
 */
export const useUserSessions = () => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [loading, setLoading] = useState(false)

  const sessions = useMemo<UserSession[]>(
    () =>
      user
        ? [{
            _id: 'atual',
            session_id: 'atual',
            device_type: tipoDeAparelho(),
            location: `${navegador()} · este aparelho`,
            is_active: true,
            created_at: new Date().toISOString(),
          }]
        : [],
    [user],
  )

  const endSession = async (_sessionId?: string) => {
    void _sessionId
    await logout()
    toast.success('Você saiu da conta neste aparelho.')
    return true
  }

  const endAllOtherSessions = async () => {
    if (!supabase) {
      toast('Indisponível no modo demonstração.')
      return false
    }
    setLoading(true)
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    setLoading(false)
    if (error) {
      toast.error(mensagemDeErro(error, 'Não foi possível encerrar as outras sessões.'))
      return false
    }
    toast.success('Sua conta foi desconectada de todos os outros aparelhos.')
    return true
  }

  return { sessions, loading, endSession, endAllOtherSessions, refreshSessions: async () => {} }
}
