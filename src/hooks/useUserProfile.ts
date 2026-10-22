
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface UserProfile {
  _id?: string
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
  updated_at?: string
}

export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Buscar perfil do usuário
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfile(null)
      return
    }

    setLoading(true)
    try {
      const { list: profiles } = await lumi.entities.user_profiles.list({
        filter: { user_id: user.id }
      })

      if (profiles && profiles.length > 0) {
        setProfile(profiles[0] as unknown as UserProfile)
      } else {
        // Criar perfil padrão se não existir
        const defaultProfile: UserProfile = {
          user_id: user.id,
          preferencias_notificacao: {
            email_anuncios: true,
            email_promocoes: false,
            push_notifications: true,
            sms_notifications: false
          },
          configuracoes_privacidade: {
            perfil_publico: true,
            mostrar_telefone: false,
            mostrar_email: false
          },
          email_verified: false,
          two_factor_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const newProfile = await lumi.entities.user_profiles.create(defaultProfile)
        setProfile(newProfile as unknown as UserProfile)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast.error('Erro ao carregar perfil do usuário')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return false

    setUpdating(true)
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const updatedProfile = await lumi.entities.user_profiles.update(
        profile._id!,
        updatedData
      )
      
      setProfile(updatedProfile as unknown as UserProfile)
      toast.success('Perfil atualizado com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
      return false
    } finally {
      setUpdating(false)
    }
  }

  // Upload de avatar
  const uploadAvatar = async (file: File) => {
    if (!profile) return false

    setUpdating(true)
    try {
      const uploadResult = await lumi.tools.file.upload([file])
      
      if (uploadResult[0]?.fileUrl) {
        await updateProfile({ avatar: uploadResult[0].fileUrl })
        return true
      } else {
        toast.error('Erro no upload da imagem')
        return false
      }
    } catch (error) {
      console.error('Erro no upload do avatar:', error)
      toast.error('Erro no upload da imagem')
      return false
    } finally {
      setUpdating(false)
    }
  }

  // Remover avatar
  const removeAvatar = async () => {
    if (!profile?.avatar) return false

    try {
      // Deletar arquivo antigo
      await lumi.tools.file.delete([profile.avatar])
      
      // Atualizar perfil
      await updateProfile({ avatar: '' })
      return true
    } catch (error) {
      console.error('Erro ao remover avatar:', error)
      toast.error('Erro ao remover avatar')
      return false
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    updating,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    refreshProfile: fetchProfile
  }
}
