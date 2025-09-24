
import { create } from 'zustand'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface CustomizationConfig {
  _id: string
  section: 'visual' | 'content' | 'layout' | 'social' | 'seo' | 'advanced'
  key: string
  value: string
  type: 'color' | 'image' | 'text' | 'boolean' | 'number' | 'object'
  label: string
  description: string
  category: string
  order: number
  active: boolean
}

interface CustomizationState {
  configs: CustomizationConfig[]
  loading: boolean
  saving: boolean
  
  // Getters organizados por seção
  getConfigsBySection: (section: string) => CustomizationConfig[]
  getConfigValue: (key: string) => string | null
  
  // CRUD Operations
  fetchConfigs: () => Promise<void>
  updateConfig: (key: string, value: string) => Promise<boolean>
  createConfig: (config: Omit<CustomizationConfig, '_id'>) => Promise<boolean>
  deleteConfig: (id: string) => Promise<boolean>
  
  // Bulk operations
  saveAllConfigs: (configs: Partial<CustomizationConfig>[]) => Promise<boolean>
  resetSection: (section: string) => Promise<boolean>
  exportConfigs: () => string
  importConfigs: (jsonData: string) => Promise<boolean>
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  configs: [],
  loading: false,
  saving: false,

  getConfigsBySection: (section: string) => {
    return get().configs
      .filter(config => config.section === section && config.active)
      .sort((a, b) => a.order - b.order)
  },

  getConfigValue: (key: string) => {
    const config = get().configs.find(c => c.key === key && c.active)
    return config ? config.value : null
  },

  fetchConfigs: async () => {
    set({ loading: true })
    try {
      const { list } = await lumi.entities.site_customization.list({
        sort: { section: 1, order: 1 }
      })
      set({ configs: list || [], loading: false })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
      set({ loading: false })
    }
  },

  updateConfig: async (key: string, value: string) => {
    set({ saving: true })
    try {
      const configs = get().configs
      const existingConfig = configs.find(c => c.key === key)
      
      if (existingConfig) {
        const updated = await lumi.entities.site_customization.update(existingConfig._id, {
          value,
          updatedAt: new Date().toISOString()
        })
        
        set({
          configs: configs.map(c => c.key === key ? { ...c, value, updatedAt: updated.updatedAt } : c),
          saving: false
        })
      } else {
        // Criar nova configuração se não existir
        const newConfig = await lumi.entities.site_customization.create({
          section: 'visual',
          key,
          value,
          type: 'text',
          label: key,
          description: '',
          category: 'general',
          order: 999,
          active: true,
          creator: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        set({
          configs: [...configs, newConfig],
          saving: false
        })
      }
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao salvar configuração')
      set({ saving: false })
      return false
    }
  },

  createConfig: async (config) => {
    try {
      const newConfig = await lumi.entities.site_customization.create({
        ...config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      set({
        configs: [...get().configs, newConfig]
      })
      
      toast.success('Configuração criada com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao criar configuração:', error)
      toast.error('Erro ao criar configuração')
      return false
    }
  },

  deleteConfig: async (id: string) => {
    try {
      await lumi.entities.site_customization.delete(id)
      set({
        configs: get().configs.filter(c => c._id !== id)
      })
      toast.success('Configuração removida!')
      return true
    } catch (error) {
      console.error('Erro ao deletar configuração:', error)
      toast.error('Erro ao remover configuração')
      return false
    }
  },

  saveAllConfigs: async (configUpdates) => {
    set({ saving: true })
    try {
      const promises = configUpdates.map(async (update) => {
        if (update._id) {
          return lumi.entities.site_customization.update(update._id, {
            ...update,
            updatedAt: new Date().toISOString()
          })
        }
        return null
      })
      
      await Promise.all(promises)
      await get().fetchConfigs() // Recarregar dados
      
      toast.success('Todas as configurações foram salvas!')
      set({ saving: false })
      return true
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
      set({ saving: false })
      return false
    }
  },

  resetSection: async (section: string) => {
    try {
      const sectionConfigs = get().getConfigsBySection(section)
      const deletePromises = sectionConfigs.map(config => 
        lumi.entities.site_customization.delete(config._id)
      )
      
      await Promise.all(deletePromises)
      await get().fetchConfigs()
      
      toast.success(`Seção ${section} resetada!`)
      return true
    } catch (error) {
      console.error('Erro ao resetar seção:', error)
      toast.error('Erro ao resetar seção')
      return false
    }
  },

  exportConfigs: () => {
    const configs = get().configs
    return JSON.stringify(configs, null, 2)
  },

  importConfigs: async (jsonData: string) => {
    try {
      const importedConfigs = JSON.parse(jsonData)
      
      if (!Array.isArray(importedConfigs)) {
        throw new Error('Formato inválido')
      }
      
      // Deletar configurações existentes
      const existingIds = get().configs.map(c => c._id)
      await Promise.all(existingIds.map(id => 
        lumi.entities.site_customization.delete(id)
      ))
      
      // Criar novas configurações
      const createPromises = importedConfigs.map(config => 
        lumi.entities.site_customization.create({
          ...config,
          _id: undefined, // Remove _id para criar novo
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      )
      
      await Promise.all(createPromises)
      await get().fetchConfigs()
      
      toast.success('Configurações importadas com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao importar configurações:', error)
      toast.error('Erro ao importar - verifique o formato JSON')
      return false
    }
  }
}))
