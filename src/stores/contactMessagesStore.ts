
import { create } from 'zustand'
import { ContactMessage, ContactMessageFilters, ContactMessageStats } from '../types/contactMessage'
import toast from 'react-hot-toast'
import { supabase, mensagemDeErro, enviarSemEsperar } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface ContactMessagesState {
  messages: ContactMessage[]
  filters: ContactMessageFilters
  loading: boolean
  
  // Actions
  fetchMessages: () => Promise<void>
  /** Envia a mensagem do formulário de contato. Retorna false se não gravou. */
  addMessage: (message: Omit<ContactMessage, 'id' | 'created_at' | 'status' | 'priority'>) => Promise<boolean>
  markAsRead: (messageId: string, adminId: string) => void
  markAsResponded: (messageId: string, response: string, adminId: string) => void
  archiveMessage: (messageId: string) => void
  updatePriority: (messageId: string, priority: ContactMessage['priority']) => void
  updateStatus: (messageId: string, status: ContactMessage['status']) => void
  addAdminNotes: (messageId: string, notes: string) => void
  addTags: (messageId: string, tags: string[]) => void
  deleteMessage: (messageId: string) => void
  
  // Filters and Search
  setFilters: (filters: Partial<ContactMessageFilters>) => void
  getFilteredMessages: () => ContactMessage[]
  
  // Stats and Analytics
  getStats: () => ContactMessageStats
  getUnreadCount: () => number
  getMessagesByStatus: (status: ContactMessage['status']) => ContactMessage[]
  getMessagesByPriority: (priority: ContactMessage['priority']) => ContactMessage[]
  
  // Bulk Actions
  markMultipleAsRead: (messageIds: string[], adminId: string) => void
  archiveMultiple: (messageIds: string[]) => void
  updateMultiplePriority: (messageIds: string[], priority: ContactMessage['priority']) => void
  
  // Response Templates
  responseTemplates: Record<string, string>
  addResponseTemplate: (name: string, template: string) => void
  removeResponseTemplate: (name: string) => void
}

/** Grava no banco a mesma mudança feita na tela (só admin consegue). */
const sincronizar = (ids: string[], patch: Partial<ContactMessage>) => {
  if (!supabase || ids.length === 0) return
  const { id: _ignorar, ...campos } = patch
  void _ignorar
  void supabase
    .from('contact_messages')
    .update(campos)
    .in('id', ids)
    .then(({ error }) => {
      if (error) toast.error(mensagemDeErro(error, 'Não foi possível salvar a alteração da mensagem.'))
    })
}

export const useContactMessagesStore = create<ContactMessagesState>((set, get) => ({
  messages: [],
  loading: false,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    subject: 'all'
  },
  responseTemplates: {
    'boas-vindas': 'Olá {name}, obrigado por entrar em contato conosco! Recebemos sua mensagem e retornaremos em breve.',
    'duvida-geral': 'Olá {name}, agradecemos seu contato. Nossa equipe analisará sua dúvida e retornará com uma resposta detalhada.',
    'problema-anuncio': 'Olá {name}, recebemos seu relato sobre o anúncio. Nossa equipe técnica irá verificar e resolver a questão.',
    'suporte-venda': 'Olá {name}, nossa equipe especializada em vendas entrará em contato para auxiliá-lo no processo.',
    'suporte-compra': 'Olá {name}, recebemos sua consulta sobre compra. Um consultor entrará em contato em breve.'
  },

  fetchMessages: async () => {
    if (!supabase || useAuthStore.getState().user?.role !== 'admin') return
    set({ loading: true })
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    set({ loading: false })
    if (error) return void toast.error(mensagemDeErro(error, 'Não foi possível carregar as mensagens.'))
    set({ messages: (data ?? []).map((m) => ({ ...m, phone: m.phone ?? undefined, tags: m.tags ?? [] })) as ContactMessage[] })
  },

  addMessage: async (messageData) => {
    if (supabase) {
      const { error } = await supabase.from('contact_messages').insert({
        name: messageData.name,
        email: messageData.email,
        phone: messageData.phone || null,
        subject: messageData.subject,
        message: messageData.message,
      })
      if (error) {
        toast.error(mensagemDeErro(error, 'Não foi possível enviar a mensagem.'))
        return false
      }
      return true
    }
    const newMessage: ContactMessage = {
      ...messageData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: 'nova',
      priority: ['venda', 'parceria'].includes(messageData.subject) ? 'alta' : 'media'
    }
    set(state => ({ messages: [newMessage, ...state.messages] }))
    return true
  },

  markAsRead: (messageId) => {
    sincronizar([messageId], { status: 'lida', read_at: new Date().toISOString() })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId
          ? { 
              ...message, 
              status: 'lida' as const,
              read_at: new Date().toISOString()
            }
          : message
      )
    }))
  },

  markAsResponded: (messageId, response, adminId) => {
    sincronizar([messageId], { status: 'respondida', response, responded_at: new Date().toISOString(), responded_by: supabase ? useAuthStore.getState().user?.id : adminId })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId
          ? {
              ...message,
              status: 'respondida' as const,
              response,
              responded_at: new Date().toISOString(),
              responded_by: adminId
            }
          : message
      )
    }))
  },

  archiveMessage: (messageId) => {
    sincronizar([messageId], { status: 'arquivada' })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId
          ? { ...message, status: 'arquivada' as const }
          : message
      )
    }))
  },

  updatePriority: (messageId, priority) => {
    sincronizar([messageId], { priority })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, priority } : message
      )
    }))
  },

  updateStatus: (messageId, status) => {
    sincronizar([messageId], { status })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, status } : message
      )
    }))
  },

  addAdminNotes: (messageId, notes) => {
    sincronizar([messageId], { admin_notes: notes })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, admin_notes: notes } : message
      )
    }))
  },

  addTags: (messageId, tags) => {
    sincronizar([messageId], { tags })

    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, tags } : message
      )
    }))
  },

  deleteMessage: (messageId) => {
    if (supabase) enviarSemEsperar(supabase.from('contact_messages').delete().eq('id', messageId))
    set(state => ({
      messages: state.messages.filter(message => message.id !== messageId)
    }))
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  getFilteredMessages: () => {
    const { messages, filters } = get()
    
    return messages.filter(message => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          message.name.toLowerCase().includes(searchLower) ||
          message.email.toLowerCase().includes(searchLower) ||
          message.subject.toLowerCase().includes(searchLower) ||
          message.message.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }
      
      // Status filter
      if (filters.status !== 'all' && message.status !== filters.status) {
        return false
      }
      
      // Priority filter
      if (filters.priority !== 'all' && message.priority !== filters.priority) {
        return false
      }
      
      // Subject filter
      if (filters.subject !== 'all' && message.subject !== filters.subject) {
        return false
      }
      
      // Date filters
      if (filters.dateFrom) {
        const messageDate = new Date(message.created_at)
        const fromDate = new Date(filters.dateFrom)
        if (messageDate < fromDate) return false
      }
      
      if (filters.dateTo) {
        const messageDate = new Date(message.created_at)
        const toDate = new Date(filters.dateTo)
        if (messageDate > toDate) return false
      }
      
      return true
    })
  },

  getStats: () => {
    const messages = get().messages
    
    const stats: ContactMessageStats = {
      total: messages.length,
      novas: messages.filter(m => m.status === 'nova').length,
      lidas: messages.filter(m => m.status === 'lida').length,
      respondidas: messages.filter(m => m.status === 'respondida').length,
      arquivadas: messages.filter(m => m.status === 'arquivada').length,
      avgResponseTime: 0,
      subjectStats: {}
    }
    
    // Calculate average response time
    const respondedMessages = messages.filter(m => m.responded_at && m.created_at)
    if (respondedMessages.length > 0) {
      const totalResponseTime = respondedMessages.reduce((sum, message) => {
        const created = new Date(message.created_at).getTime()
        const responded = new Date(message.responded_at!).getTime()
        return sum + (responded - created)
      }, 0)
      stats.avgResponseTime = totalResponseTime / respondedMessages.length / (1000 * 60 * 60) // hours
    }
    
    // Subject statistics
    messages.forEach(message => {
      stats.subjectStats[message.subject] = (stats.subjectStats[message.subject] || 0) + 1
    })
    
    return stats
  },

  getUnreadCount: () => {
    return get().messages.filter(m => m.status === 'nova').length
  },

  getMessagesByStatus: (status) => {
    return get().messages.filter(m => m.status === status)
  },

  getMessagesByPriority: (priority) => {
    return get().messages.filter(m => m.priority === priority)
  },

  markMultipleAsRead: (messageIds) => {
    sincronizar(messageIds, { status: 'lida', read_at: new Date().toISOString() })

    set(state => ({
      messages: state.messages.map(message =>
        messageIds.includes(message.id)
          ? { 
              ...message, 
              status: 'lida' as const,
              read_at: new Date().toISOString()
            }
          : message
      )
    }))
  },

  archiveMultiple: (messageIds) => {
    sincronizar(messageIds, { status: 'arquivada' })

    set(state => ({
      messages: state.messages.map(message =>
        messageIds.includes(message.id)
          ? { ...message, status: 'arquivada' as const }
          : message
      )
    }))
  },

  updateMultiplePriority: (messageIds, priority) => {
    sincronizar(messageIds, { priority })

    set(state => ({
      messages: state.messages.map(message =>
        messageIds.includes(message.id) ? { ...message, priority } : message
      )
    }))
  },

  addResponseTemplate: (name, template) => {
    set(state => ({
      responseTemplates: { ...state.responseTemplates, [name]: template }
    }))
  },

  removeResponseTemplate: (name) => {
    set(state => {
      const rest = { ...state.responseTemplates }
      delete rest[name]
      return { responseTemplates: rest }
    })
  }
}))

// Admin entrou: carrega as mensagens do banco
// (esta parte do site carrega depois do login, então confere já na abertura)
if (supabase) {
  let eraAdmin = false
  const conferir = (admin: boolean) => {
    if (admin && !eraAdmin) void useContactMessagesStore.getState().fetchMessages()
    if (!admin && eraAdmin) useContactMessagesStore.setState({ messages: [] })
    eraAdmin = admin
  }
  conferir(useAuthStore.getState().user?.role === 'admin')
  useAuthStore.subscribe((state) => conferir(state.user?.role === 'admin'))
}
