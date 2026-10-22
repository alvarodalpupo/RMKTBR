
import { create } from 'zustand'
import { supabase, mensagemDeErro } from '../lib/supabase'
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

type CustomizationRow = Omit<CustomizationConfig, '_id'> & { id: string }
const deLinha = ({ id, ...resto }: CustomizationRow): CustomizationConfig => ({ _id: id, ...resto })
const semId = (c: Partial<CustomizationConfig>) => {
  const { _id, ...resto } = c as Partial<CustomizationConfig> & { createdAt?: string; updatedAt?: string; creator?: string }
  void _id
  const r = resto as Record<string, unknown>
  delete r.createdAt; delete r.updatedAt; delete r.creator
  return r
}
const tabela = () => {
  if (!supabase) throw new Error('Supabase não configurado (modo demonstração).')
  return supabase.from('site_customization')
}
const ok = <T,>({ data, error }: { data: T; error: unknown }) => {
  if (error) throw error
  return data
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
      if (!supabase) return set({ loading: false })
      const list = ok(await tabela().select('*').order('section').order('order'))
      set({ configs: (list as CustomizationRow[]).map(deLinha), loading: false })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error(mensagemDeErro(error, 'Erro ao carregar configurações'))
      set({ loading: false })
    }
  },

  updateConfig: async (key: string, value: string) => {
    set({ saving: true })
    try {
      const configs = get().configs
      const existingConfig = configs.find(c => c.key === key)
      
      if (existingConfig) {
        if (supabase) ok(await tabela().update({ value, updated_at: new Date().toISOString() }).eq('id', existingConfig._id))
        set({
          configs: configs.map(c => c.key === key ? { ...c, value } : c),
          saving: false
        })
      } else {
        // Criar nova configuração se não existir
        const base = { section: 'visual' as const, key, value, type: 'text' as const, label: key, description: '', category: 'general', order: 999, active: true }
        const newConfig = supabase
          ? deLinha(ok(await tabela().insert(base).select().single()) as CustomizationRow)
          : { ...base, _id: crypto.randomUUID() }
        set({
          configs: [...configs, newConfig],
          saving: false
        })
      }
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error(mensagemDeErro(error, 'Erro ao salvar configuração'))
      set({ saving: false })
      return false
    }
  },

  createConfig: async (config) => {
    try {
      const newConfig = deLinha(ok(await tabela().insert(semId(config)).select().single()) as CustomizationRow)
      set({
        configs: [...get().configs, newConfig]
      })
      
      toast.success('Configuração criada com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao criar configuração:', error)
      toast.error(mensagemDeErro(error, 'Erro ao criar configuração'))
      return false
    }
  },

  deleteConfig: async (id: string) => {
    try {
      ok(await tabela().delete().eq('id', id))
      set({
        configs: get().configs.filter(c => c._id !== id)
      })
      toast.success('Configuração removida!')
      return true
    } catch (error) {
      console.error('Erro ao deletar configuração:', error)
      toast.error(mensagemDeErro(error, 'Erro ao remover configuração'))
      return false
    }
  },

  saveAllConfigs: async (configUpdates) => {
    set({ saving: true })
    try {
      const promises = configUpdates.map(async (update) => {
        if (update._id) {
          return ok(await tabela().update({ ...semId(update), updated_at: new Date().toISOString() }).eq('id', update._id))
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
      toast.error(mensagemDeErro(error, 'Erro ao salvar configurações'))
      set({ saving: false })
      return false
    }
  },

  resetSection: async (section: string) => {
    try {
      const sectionConfigs = get().getConfigsBySection(section)
      const deletePromises = sectionConfigs.map(config => 
        tabela().delete().eq('id', config._id).then(ok)
      )
      
      await Promise.all(deletePromises)
      await get().fetchConfigs()
      
      toast.success(`Seção ${section} resetada!`)
      return true
    } catch (error) {
      console.error('Erro ao resetar seção:', error)
      toast.error(mensagemDeErro(error, 'Erro ao resetar seção'))
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
      if (existingIds.length) ok(await tabela().delete().in('id', existingIds))
      
      // Criar novas configurações
      if (importedConfigs.length) ok(await tabela().insert(importedConfigs.map((c: Partial<CustomizationConfig>) => semId(c))))
      await get().fetchConfigs()
      
      toast.success('Configurações importadas com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao importar configurações:', error)
      toast.error(mensagemDeErro(error, 'Erro ao importar - verifique o formato JSON'))
      return false
    }
  }
}))
