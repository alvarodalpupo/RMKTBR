import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase, mensagemDeErro } from '../lib/supabase'
import { enviarFotos, apagarFotos } from '../lib/fotos'
import { useAuthStore } from '../stores/authStore'

interface UserProfile {
  user_id: string
  avatar?: string
  biografia?: string
  telefone?: string
  cidade?: string
  uf?: string
  preferencias_notificacao?: {
    email_anuncios: boolean
    email_promocoes: boolean
    push_notifications: boolean
    sms_notifications: boolean
  }
  configuracoes_privacidade?: {
    perfil_publico: boolean
    mostrar_telefone: boolean
    mostrar_email: boolean
  }
  last_login?: string
  email_verified?: boolean
  two_factor_enabled?: boolean
  created_at?: string
}

const preferenciasPadrao = {
  preferencias_notificacao: {
    email_anuncios: true,
    email_promocoes: false,
    push_notifications: true,
    sms_notifications: false,
  },
  configuracoes_privacidade: {
    perfil_publico: true,
    mostrar_telefone: false,
    mostrar_email: false,
  },
  two_factor_enabled: false,
}

type Preferencias = typeof preferenciasPadrao

/** Perfil do usuário logado, guardado na tabela `profiles`. */
export const useUserProfile = () => {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!user) return setProfile(null)

    if (!supabase) {
      // Modo demonstração: perfil só na memória
      setProfile((p) => p ?? { user_id: user.id, created_at: new Date().toISOString(), ...preferenciasPadrao })
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, avatar_url, biografia, telefone, cidade, uf, preferencias, last_login, verified, created_at')
      .eq('id', user.id)
      .maybeSingle()
    setLoading(false)
    if (error || !data) {
      if (error) toast.error(mensagemDeErro(error, 'Não foi possível carregar seu perfil.'))
      return
    }
    const prefs = { ...preferenciasPadrao, ...((data.preferencias as Partial<Preferencias>) ?? {}) }
    setProfile({
      user_id: data.id,
      avatar: data.avatar_url ?? undefined,
      biografia: data.biografia ?? undefined,
      telefone: data.telefone ?? undefined,
      cidade: data.cidade ?? undefined,
      uf: data.uf ?? undefined,
      last_login: data.last_login ?? undefined,
      email_verified: data.verified,
      created_at: data.created_at,
      ...prefs,
    })
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return false
    setUpdating(true)
    const novo = { ...profile, ...updates }

    if (supabase) {
      const linha: Record<string, unknown> = {}
      if ('avatar' in updates) linha.avatar_url = updates.avatar || null
      for (const k of ['biografia', 'telefone', 'cidade', 'uf'] as const) {
        if (k in updates) linha[k] = updates[k] || null
      }
      if ('preferencias_notificacao' in updates || 'configuracoes_privacidade' in updates || 'two_factor_enabled' in updates) {
        linha.preferencias = {
          preferencias_notificacao: novo.preferencias_notificacao,
          configuracoes_privacidade: novo.configuracoes_privacidade,
          two_factor_enabled: novo.two_factor_enabled,
        }
      }
      const { error } = await supabase.from('profiles').update(linha).eq('id', user.id)
      if (error) {
        setUpdating(false)
        toast.error(mensagemDeErro(error, 'Não foi possível salvar o perfil.'))
        return false
      }
    }

    setProfile(novo)
    setUpdating(false)
    toast.success('Perfil atualizado.')
    return true
  }

  const uploadAvatar = async (file: File) => {
    if (!profile || !user) return false
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem.')
      return false
    }
    setUpdating(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result as string)
        r.onerror = () => reject(r.error)
        r.readAsDataURL(file)
      })
      const [url] = await enviarFotos([dataUrl], user.id)
      const antigo = profile.avatar
      const ok = await updateProfile({ avatar: url })
      if (ok && antigo) void apagarFotos([antigo])
      return ok
    } catch (error) {
      toast.error(mensagemDeErro(error, 'Não foi possível enviar a foto.'))
      return false
    } finally {
      setUpdating(false)
    }
  }

  const removeAvatar = async () => {
    if (!profile?.avatar) return false
    const antigo = profile.avatar
    const ok = await updateProfile({ avatar: '' })
    if (ok) void apagarFotos([antigo])
    return ok
  }

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  return { profile, loading, updating, updateProfile, uploadAvatar, removeAvatar, refreshProfile: fetchProfile }
}
