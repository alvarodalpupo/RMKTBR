import { create } from 'zustand'

export interface Listing {
  id: string
  titulo: string
  preco: string
  ano: number
  cidade: string
  uf: string
  categoria: 'turbo' | 'aspirado' | 'original' | 'pista'
  images: string[]
  descricao?: string
  telefone: string  // Removido quando vendido
  destaque: boolean
  views: number
  clicks_whatsapp: number
  created_at: string
  user_id: string
  power_whp?: number
  torque_kgfm?: number
  tracao?: 'dianteira' | 'traseira' | 'integral'
  status: 'ativo' | 'em_revisao' | 'rejeitado' | 'publicado' | 'arquivado' | 'vendido'  // Novo status
  aceita_troca: boolean
  sold_at?: string  // Data da venda
  admin_notes?: string  // Observações do admin
  rejection_reason?: string  // Motivo da rejeição
}

export interface ListingFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  city?: string
  state?: string
  search?: string
  price?: string
  aceita_troca?: boolean | null
  modelSearch?: string
  status?: string  // Novo filtro por status
  showSoldOnly?: boolean  // Novo filtro específico para vendidos
}

interface ListingsStore {
  listings: Listing[]
  filteredListings: Listing[]
  filters: ListingFilters
  isLoading: boolean
  showNoResultsMessage: boolean
  searchedModel: string
  selectedCategory: string
  searchTerm: string
  selectedCity: string
  priceRange: string
  setListings: (listings: Listing[]) => void
  setFilters: (filters: Partial<ListingFilters>) => void
  clearFilters: () => void
  addListing: (listing: Omit<Listing, 'id' | 'views' | 'clicks_whatsapp' | 'created_at'>) => void
  createListing: (listing: Omit<Listing, 'id' | 'views' | 'clicks_whatsapp' | 'created_at' | 'status'>) => Promise<boolean>
  incrementViews: (id: string) => void
  incrementWhatsAppClicks: (id: string) => void
  deleteListing: (id: string) => void
  applyFilters: () => void
  searchByModel: (model: string) => void
  clearModelSearch: () => void
  // Novas funções para administração
  approveListing: (id: string, adminNotes?: string) => Promise<boolean>
  rejectListing: (id: string, reason: string) => Promise<boolean>
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>
  markAsSold: (id: string, adminNotes?: string) => Promise<boolean>  // Nova função
  getSoldListings: () => Listing[]  // Nova função para filtrar vendidos
  getListingsByStatus: (status: string) => Listing[]  // Função genérica por status
}

// Dados de exemplo atualizados com mais veículos vendidos
const mockListings: Listing[] = [
  {
    id: '1',
    titulo: 'Civic Si Turbo Preparado',
    preco: 'R$ 85.000',
    ano: 2018,
    cidade: 'São Paulo',
    uf: 'SP',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg',
      'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'
    ],
    descricao: 'Honda Civic Si com preparação turbo completa. Motor K20 com turbo Garrett, intercooler frontal, injeção programável e muito mais.',
    telefone: '11999887766',
    destaque: true,
    views: 245,
    clicks_whatsapp: 12,
    created_at: '2024-01-15',
    user_id: 'user1',
    power_whp: 320,
    torque_kgfm: 42.5,
    tracao: 'dianteira',
    status: 'publicado',
    aceita_troca: true
  },
  {
    id: '2',
    titulo: 'Golf GTI MK7 Stage 2',
    preco: 'VENDIDO',
    ano: 2020,
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg'
    ],
    descricao: 'Volkswagen Golf GTI MK7 com Stage 2, downpipe, intercooler e reprogramação.',
    telefone: '', // Removido - veículo vendido
    destaque: false,
    views: 189,
    clicks_whatsapp: 8,
    created_at: '2024-01-20',
    user_id: 'user2',
    power_whp: 280,
    torque_kgfm: 38.2,
    tracao: 'dianteira',
    status: 'vendido',
    aceita_troca: false,
    sold_at: '2024-01-25',
    admin_notes: 'Vendido rapidamente, excelente negócio'
  },
  {
    id: '3',
    titulo: 'Subaru WRX STI',
    preco: 'R$ 180.000',
    ano: 2019,
    cidade: 'Curitiba',
    uf: 'PR',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'
    ],
    descricao: 'Subaru WRX STI original de fábrica, tração integral, motor boxer turbo.',
    telefone: '41987654321',
    destaque: true,
    views: 312,
    clicks_whatsapp: 15,
    created_at: '2024-01-18',
    user_id: 'user3',
    power_whp: 310,
    torque_kgfm: 40.8,
    tracao: 'integral',
    status: 'publicado',
    aceita_troca: true
  },
  {
    id: '4',
    titulo: 'Honda S2000 AP1',
    preco: 'VENDIDO',
    ano: 2003,
    cidade: 'Belo Horizonte',
    uf: 'MG',
    categoria: 'aspirado',
    images: [
      'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg'
    ],
    descricao: 'Honda S2000 AP1 original, motor F20C aspirado, câmbio manual 6 marchas.',
    telefone: '', // Removido - veículo vendido
    destaque: false,
    views: 156,
    clicks_whatsapp: 6,
    created_at: '2024-01-22',
    user_id: 'user4',
    power_whp: 240,
    torque_kgfm: 22.4,
    tracao: 'traseira',
    status: 'vendido',
    aceita_troca: false,
    sold_at: '2024-01-28',
    admin_notes: 'Cliente muito satisfeito com a compra'
  },
  {
    id: '5',
    titulo: 'Porsche 911 GT3',
    preco: 'R$ 850.000',
    ano: 2021,
    cidade: 'São Paulo',
    uf: 'SP',
    categoria: 'pista',
    images: [
      'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg'
    ],
    descricao: 'Porsche 911 GT3 para pista, suspensão regulável, gaiola de segurança.',
    telefone: '11965432109',
    destaque: true,
    views: 567,
    clicks_whatsapp: 23,
    created_at: '2024-01-10',
    user_id: 'user5',
    power_whp: 500,
    torque_kgfm: 47.9,
    tracao: 'traseira',
    status: 'publicado',
    aceita_troca: true
  },
  {
    id: '6',
    titulo: 'BMW E46 M3 Original',
    preco: 'R$ 165.000',
    ano: 2004,
    cidade: 'Porto Alegre',
    uf: 'RS',
    categoria: 'original',
    images: [
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'
    ],
    descricao: 'BMW E46 M3 completamente original, motor S54 aspirado, manual.',
    telefone: '51954321098',
    destaque: false,
    views: 203,
    clicks_whatsapp: 9,
    created_at: '2024-01-25',
    user_id: 'user6',
    power_whp: 343,
    torque_kgfm: 37.2,
    tracao: 'traseira',
    status: 'em_revisao',
    aceita_troca: false
  },
  // Novos veículos vendidos adicionados
  {
    id: '7',
    titulo: 'Mitsubishi Lancer Evolution X',
    preco: 'VENDIDO',
    ano: 2015,
    cidade: 'Brasília',
    uf: 'DF',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'
    ],
    descricao: 'Lancer Evolution X final edition, tração integral, turbo 4B11T.',
    telefone: '', // Removido - veículo vendido
    destaque: false,
    views: 278,
    clicks_whatsapp: 14,
    created_at: '2024-01-12',
    user_id: 'user7',
    power_whp: 295,
    torque_kgfm: 36.7,
    tracao: 'integral',
    status: 'vendido',
    aceita_troca: false,
    sold_at: '2024-01-30',
    admin_notes: 'Venda concluída após test drive'
  },
  {
    id: '8',
    titulo: 'Nissan 350Z Drift',
    preco: 'VENDIDO',
    ano: 2006,
    cidade: 'Florianópolis',
    uf: 'SC',
    categoria: 'pista',
    images: [
      'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'
    ],
    descricao: 'Nissan 350Z preparado para drift, motor VQ35DE, suspensão coilover.',
    telefone: '', // Removido - veículo vendido
    destaque: false,
    views: 334,
    clicks_whatsapp: 18,
    created_at: '2024-01-08',
    user_id: 'user8',
    power_whp: 280,
    torque_kgfm: 35.2,
    tracao: 'traseira',
    status: 'vendido',
    aceita_troca: true,
    sold_at: '2024-02-01',
    admin_notes: 'Comprador ficou impressionado com o carro'
  },
  {
    id: '9',
    titulo: 'Audi TT RS',
    preco: 'VENDIDO',
    ano: 2017,
    cidade: 'Campinas',
    uf: 'SP',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg'
    ],
    descricao: 'Audi TT RS com motor 2.5 TFSI, tração quattro, 400cv de fábrica.',
    telefone: '', // Removido - veículo vendido
    destaque: true,
    views: 445,
    clicks_whatsapp: 22,
    created_at: '2024-01-05',
    user_id: 'user9',
    power_whp: 400,
    torque_kgfm: 48.0,
    tracao: 'integral',
    status: 'vendido',
    aceita_troca: false,
    sold_at: '2024-02-03',
    admin_notes: 'Negociação rápida, pagamento à vista'
  },
  {
    id: '10',
    titulo: 'Toyota Supra MK4',
    preco: 'VENDIDO',
    ano: 1998,
    cidade: 'Salvador',
    uf: 'BA',
    categoria: 'turbo',
    images: [
      'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'
    ],
    descricao: 'Toyota Supra MK4 Turbo, motor 2JZ-GTE, preparação stage 2.',
    telefone: '', // Removido - veículo vendido
    destaque: true,
    views: 623,
    clicks_whatsapp: 35,
    created_at: '2024-01-03',
    user_id: 'user10',
    power_whp: 450,
    torque_kgfm: 52.3,
    tracao: 'traseira',
    status: 'vendido',
    aceita_troca: true,
    sold_at: '2024-02-05',
    admin_notes: 'Carro icônico, venda muito disputada'
  }
]

// Função auxiliar para aplicar filtros - CORRIGIDA
const applyFiltersToListings = (listings: Listing[], filters: ListingFilters): Listing[] => {
  if (!listings || !Array.isArray(listings)) {
    return []
  }

  return listings.filter(listing => {
    // NOVA LÓGICA: Separação automática de vendidos
    // Se showSoldOnly é true, mostrar apenas vendidos
    if (filters.showSoldOnly === true) {
      if (listing.status !== 'vendido') {
        return false
      }
    }
    // Se showSoldOnly é false ou undefined, EXCLUIR vendidos automaticamente
    else if (filters.showSoldOnly !== true) {
      if (listing.status === 'vendido') {
        return false
      }
    }

    // Filtro por status específico (usado no admin)
    if (filters.status && filters.status !== 'todos' && listing.status !== filters.status) {
      return false
    }

    // Filtro por busca específica de modelo
    if (filters.modelSearch && filters.modelSearch.trim() !== '') {
      const searchTerm = filters.modelSearch.toLowerCase()
      const titleMatch = listing.titulo.toLowerCase().includes(searchTerm)
      const descriptionMatch = listing.descricao?.toLowerCase().includes(searchTerm) || false
      
      if (!titleMatch && !descriptionMatch) {
        return false
      }
    }

    // Filtro por categoria
    if (filters.category && filters.category !== 'todos' && listing.categoria !== filters.category.toLowerCase()) {
      return false
    }

    // Filtro por cidade
    if (filters.city && filters.city !== 'todas' && !listing.cidade.toLowerCase().includes(filters.city.toLowerCase())) {
      return false
    }

    // Filtro por estado
    if (filters.state && listing.uf !== filters.state.toUpperCase()) {
      return false
    }

    // Filtro por busca de texto (geral)
    if (filters.search && filters.search.trim() !== '' && !filters.modelSearch) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = `${listing.titulo} ${listing.descricao || ''}`.toLowerCase()
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Filtro por aceita troca
    if (filters.aceita_troca !== null && filters.aceita_troca !== undefined) {
      if (listing.aceita_troca !== filters.aceita_troca) {
        return false
      }
    }

    // Filtros por preço customizável
    if (filters.minPrice || filters.maxPrice) {
      const priceNumber = parseInt(listing.preco.replace(/\D/g, ''))
      if (filters.minPrice && priceNumber < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && priceNumber > filters.maxPrice) {
        return false
      }
    }

    // Filtro por faixa de preço
    if (filters.price && filters.price !== 'todos') {
      const priceNumber = parseInt(listing.preco.replace(/\D/g, ''))
      switch (filters.price) {
        case 'até R$ 100.000':
          if (priceNumber > 100000) return false
          break
        case 'R$ 100.000 - R$ 300.000':
          if (priceNumber < 100000 || priceNumber > 300000) return false
          break
        case 'R$ 300.000 - R$ 500.000':
          if (priceNumber < 300000 || priceNumber > 500000) return false
          break
        case 'acima de R$ 500.000':
          if (priceNumber <= 500000) return false
          break
      }
    }

    return true
  })
}

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: mockListings,
  // FILTRO PADRÃO: Excluir vendidos automaticamente
  filteredListings: applyFiltersToListings(mockListings, { showSoldOnly: false }),
  filters: {
    category: 'todos',
    search: '',
    city: 'todas',
    price: 'todos',
    aceita_troca: null,
    modelSearch: '',
    status: 'todos',
    showSoldOnly: false // Padrão: não mostrar vendidos
  },
  isLoading: false,
  showNoResultsMessage: false,
  searchedModel: '',
  
  // Getters seguros
  get selectedCategory() {
    return get().filters?.category || 'todos'
  },
  get searchTerm() {
    return get().filters?.search || ''
  },
  get selectedCity() {
    return get().filters?.city || 'todas'
  },
  get priceRange() {
    return get().filters?.price || 'todos'
  },
  
  setListings: (listings) => {
    set({ listings: listings || [] })
    const { filters } = get()
    const filteredListings = applyFiltersToListings(listings || [], filters || {})
    set({ filteredListings })
  },
  
  setFilters: (newFilters) => {
    const currentFilters = get().filters || {}
    const filters = { ...currentFilters, ...newFilters }
    set({ filters })
    
    const { listings } = get()
    const filteredListings = applyFiltersToListings(listings || [], filters)
    set({ filteredListings })
    
    if (filters.modelSearch && filteredListings.length === 0) {
      set({ showNoResultsMessage: true, searchedModel: filters.modelSearch })
    } else {
      set({ showNoResultsMessage: false, searchedModel: '' })
    }
  },
  
  clearFilters: () => {
    const defaultFilters = {
      category: 'todos',
      search: '',
      city: 'todas',
      price: 'todos',
      aceita_troca: null,
      modelSearch: '',
      status: 'todos',
      showSoldOnly: false // Manter padrão de não mostrar vendidos
    }
    set({ 
      filters: defaultFilters, 
      showNoResultsMessage: false, 
      searchedModel: '' 
    })
    const { listings } = get()
    set({ filteredListings: applyFiltersToListings(listings || [], defaultFilters) })
  },
  
  applyFilters: () => {
    const { listings, filters } = get()
    const filteredListings = applyFiltersToListings(listings || [], filters || {})
    set({ filteredListings })
    
    if (filters?.modelSearch && filteredListings.length === 0) {
      set({ showNoResultsMessage: true, searchedModel: filters.modelSearch })
    } else {
      set({ showNoResultsMessage: false, searchedModel: '' })
    }
  },

  searchByModel: (model) => {
    const currentFilters = get().filters || {}
    const filters = { 
      ...currentFilters, 
      modelSearch: model,
      search: '',
      showSoldOnly: false // Garantir que busca por modelo não inclua vendidos
    }
    set({ filters, searchedModel: model })
    
    const { listings } = get()
    const filteredListings = applyFiltersToListings(listings || [], filters)
    set({ filteredListings })
    
    if (model && filteredListings.length === 0) {
      set({ showNoResultsMessage: true })
    } else {
      set({ showNoResultsMessage: false })
    }
  },

  clearModelSearch: () => {
    const currentFilters = get().filters || {}
    const filters = { 
      ...currentFilters, 
      modelSearch: '',
      showSoldOnly: false // Manter exclusão de vendidos
    }
    set({ 
      filters, 
      showNoResultsMessage: false, 
      searchedModel: '' 
    })
    
    const { listings } = get()
    const filteredListings = applyFiltersToListings(listings || [], filters)
    set({ filteredListings })
  },
  
  addListing: (listing) => {
    const newListing = {
      ...listing,
      id: Date.now().toString(),
      views: 0,
      clicks_whatsapp: 0,
      created_at: new Date().toISOString().split('T')[0],
      status: 'em_revisao' as const
    }
    
    const currentListings = get().listings || []
    const newListings = [...currentListings, newListing]
    set({ listings: newListings })
    
    const { filters } = get()
    const filteredListings = applyFiltersToListings(newListings, filters || {})
    set({ filteredListings })
  },

  createListing: async (listing) => {
    set({ isLoading: true })
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newListing = {
        ...listing,
        id: Date.now().toString(),
        views: 0,
        clicks_whatsapp: 0,
        created_at: new Date().toISOString().split('T')[0],
        status: 'em_revisao' as const
      }
      
      const currentListings = get().listings || []
      const newListings = [...currentListings, newListing]
      set({ listings: newListings })
      
      const { filters } = get()
      const filteredListings = applyFiltersToListings(newListings, filters || {})
      set({ filteredListings })
      
      return true
    } catch (error) {
      console.error('Erro ao criar anúncio:', error)
      return false
    } finally {
      set({ isLoading: false })
    }
  },
  
  incrementViews: (id) => {
    const currentListings = get().listings || []
    const listings = currentListings.map(listing =>
      listing.id === id ? { ...listing, views: listing.views + 1 } : listing
    )
    set({ listings })
    
    const { filters } = get()
    const filteredListings = applyFiltersToListings(listings, filters || {})
    set({ filteredListings })
  },
  
  incrementWhatsAppClicks: (id) => {
    const currentListings = get().listings || []
    const listings = currentListings.map(listing =>
      listing.id === id ? { ...listing, clicks_whatsapp: listing.clicks_whatsapp + 1 } : listing
    )
    set({ listings })
    
    const { filters } = get()
    const filteredListings = applyFiltersToListings(listings, filters || {})
    set({ filteredListings })
  },
  
  deleteListing: (id) => {
    const currentListings = get().listings || []
    const listings = currentListings.filter(listing => listing.id !== id)
    set({ listings })
    
    const { filters } = get()
    const filteredListings = applyFiltersToListings(listings, filters || {})
    set({ filteredListings })
  },

  // Novas funções administrativas
  approveListing: async (id, adminNotes) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentListings = get().listings || []
      const listings = currentListings.map(listing =>
        listing.id === id ? { 
          ...listing, 
          status: 'publicado' as const,
          admin_notes: adminNotes || ''
        } : listing
      )
      set({ listings })
      
      const { filters } = get()
      const filteredListings = applyFiltersToListings(listings, filters || {})
      set({ filteredListings })
      
      return true
    } catch (error) {
      console.error('Erro ao aprovar anúncio:', error)
      return false
    }
  },

  rejectListing: async (id, reason) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentListings = get().listings || []
      const listings = currentListings.map(listing =>
        listing.id === id ? { 
          ...listing, 
          status: 'rejeitado' as const,
          rejection_reason: reason
        } : listing
      )
      set({ listings })
      
      const { filters } = get()
      const filteredListings = applyFiltersToListings(listings, filters || {})
      set({ filteredListings })
      
      return true
    } catch (error) {
      console.error('Erro ao rejeitar anúncio:', error)
      return false
    }
  },

  updateListing: async (id, updates) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const currentListings = get().listings || []
      const listings = currentListings.map(listing =>
        listing.id === id ? { ...listing, ...updates } : listing
      )
      set({ listings })
      
      const { filters } = get()
      const filteredListings = applyFiltersToListings(listings, filters || {})
      set({ filteredListings })
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error)
      return false
    }
  },

  // Nova função para marcar como vendido
  markAsSold: async (id, adminNotes) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentListings = get().listings || []
      const listings = currentListings.map(listing =>
        listing.id === id ? { 
          ...listing, 
          status: 'vendido' as const,
          sold_at: new Date().toISOString(),
          admin_notes: adminNotes || '',
          telefone: '', // Remove informações de contato
          preco: 'VENDIDO' // Altera o preço para "VENDIDO"
        } : listing
      )
      set({ listings })
      
      const { filters } = get()
      const filteredListings = applyFiltersToListings(listings, filters || {})
      set({ filteredListings })
      
      return true
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error)
      return false
    }
  },

  // Função para obter anúncios vendidos - ATUALIZADA
  getSoldListings: () => {
    const { listings } = get()
    const soldListings = listings.filter(listing => listing.status === 'vendido')
    console.log('Veículos vendidos encontrados:', soldListings.length)
    return soldListings
  },

  // Função genérica para filtrar por status
  getListingsByStatus: (status) => {
    const { listings } = get()
    return listings.filter(listing => listing.status === status)
  }
}))
