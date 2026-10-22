
import { create } from 'zustand'

export interface SystemConfig {
  // Configurações de Moderação
  auto_approval: boolean
  require_phone_verification: boolean
  max_images_per_listing: number
  min_price: number
  max_price: number
  
  // Configurações de Notificações
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  
  // Configurações de Upload
  max_file_size_mb: number
  allowed_image_formats: string[]
  image_compression_quality: number
  
  // Configurações de Segurança
  max_login_attempts: number
  session_timeout_hours: number
  require_email_verification: boolean
  
  // Configurações Gerais
  site_maintenance: boolean
  registration_enabled: boolean
  contact_email: string
  support_phone: string
  
  // Configurações de Anúncios
  featured_ads_limit: number
  listing_duration_days: number
  auto_renew_listings: boolean
  
  // Redes Sociais
  instagram_feed_enabled: boolean
  instagram_hashtag: string
  facebook_page_url: string
  whatsapp_support: string
}

interface ConfigState {
  config: SystemConfig
  loading: boolean
  updateConfig: (updates: Partial<SystemConfig>) => Promise<boolean>
  resetToDefaults: () => void
  exportConfig: () => string
  importConfig: (configJson: string) => boolean
}

const defaultConfig: SystemConfig = {
  // Moderação
  auto_approval: false,
  require_phone_verification: true,
  max_images_per_listing: 10,
  min_price: 1000,
  max_price: 1000000,
  
  // Notificações
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  
  // Upload
  max_file_size_mb: 5,
  allowed_image_formats: ['jpg', 'jpeg', 'png', 'webp'],
  image_compression_quality: 85,
  
  // Segurança
  max_login_attempts: 5,
  session_timeout_hours: 24,
  require_email_verification: true,
  
  // Gerais
  site_maintenance: false,
  registration_enabled: true,
  contact_email: 'contato@racemarket.com.br',
  support_phone: '(11) 99999-9999',
  
  // Anúncios
  featured_ads_limit: 20,
  listing_duration_days: 30,
  auto_renew_listings: false,
  
  // Redes Sociais
  instagram_feed_enabled: true,
  instagram_hashtag: '#racemarket',
  facebook_page_url: 'https://facebook.com/racemarket',
  whatsapp_support: '5511999999999'
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  loading: false,

  updateConfig: async (updates: Partial<SystemConfig>) => {
    set({ loading: true })
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => ({
        config: { ...state.config, ...updates },
        loading: false
      }))

      return true
    } catch {
      set({ loading: false })
      return false
    }
  },

  resetToDefaults: () => {
    set({ config: defaultConfig })
  },

  exportConfig: () => {
    const { config } = get()
    return JSON.stringify(config, null, 2)
  },

  importConfig: (configJson: string) => {
    try {
      const importedConfig = JSON.parse(configJson)
      set({ config: { ...defaultConfig, ...importedConfig } })
      return true
    } catch {
      return false
    }
  }
}))
