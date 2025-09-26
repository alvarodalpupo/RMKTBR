
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  status: 'nova' | 'lida' | 'respondida' | 'arquivada'
  priority: 'baixa' | 'media' | 'alta'
  created_at: string
  read_at?: string
  response?: string
  responded_at?: string
  responded_by?: string
  admin_notes?: string
  tags?: string[]
  attachments?: string[]
}

export interface ContactMessageFilters {
  search: string
  status: 'all' | 'nova' | 'lida' | 'respondida' | 'arquivada'
  priority: 'all' | 'baixa' | 'media' | 'alta'
  dateFrom?: string
  dateTo?: string
  subject: 'all' | 'duvida' | 'anuncio' | 'venda' | 'compra' | 'parceria' | 'outro'
}

export interface ContactMessageStats {
  total: number
  novas: number
  lidas: number
  respondidas: number
  arquivadas: number
  avgResponseTime: number
  subjectStats: Record<string, number>
}
