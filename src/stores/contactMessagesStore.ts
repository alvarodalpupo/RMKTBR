
import { create } from 'zustand'
import { ContactMessage, ContactMessageFilters, ContactMessageStats } from '../types/contactMessage'
import { useNotificationsStore } from './notificationsStore'

interface ContactMessagesState {
  messages: ContactMessage[]
  filters: ContactMessageFilters
  loading: boolean
  
  // Actions
  addMessage: (message: Omit<ContactMessage, 'id' | 'created_at' | 'status' | 'priority'>) => void
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

  addMessage: (messageData) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'nova',
      priority: messageData.subject === 'problema' ? 'alta' : 'media'
    }
    
    set(state => ({
      messages: [newMessage, ...state.messages]
    }))
    
    // Adicionar notificação para admins
    const { addNotification } = useNotificationsStore.getState()
    addNotification({
      user_id: 'admin',
      type: 'geral',
      title: 'Nova mensagem de contato',
      message: `${newMessage.name} enviou uma mensagem sobre: ${newMessage.subject}`,
      read: false
    })
  },

  markAsRead: (messageId) => {
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
    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId
          ? { ...message, status: 'arquivada' as const }
          : message
      )
    }))
  },

  updatePriority: (messageId, priority) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, priority } : message
      )
    }))
  },

  updateStatus: (messageId, status) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, status } : message
      )
    }))
  },

  addAdminNotes: (messageId, notes) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, admin_notes: notes } : message
      )
    }))
  },

  addTags: (messageId, tags) => {
    set(state => ({
      messages: state.messages.map(message =>
        message.id === messageId ? { ...message, tags } : message
      )
    }))
  },

  deleteMessage: (messageId) => {
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
    set(state => ({
      messages: state.messages.map(message =>
        messageIds.includes(message.id)
          ? { ...message, status: 'arquivada' as const }
          : message
      )
    }))
  },

  updateMultiplePriority: (messageIds, priority) => {
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
