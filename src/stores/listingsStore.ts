import { create } from 'zustand'
import toast from 'react-hot-toast'
import { extrairValorNumerico } from '../utils/formatters'
import { supabase, mensagemDeErro, enviarSemEsperar } from '../lib/supabase'
import { enviarFotos, apagarFotos } from '../lib/fotos'
import { useAuthStore } from './authStore'

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
  user_id: string | null
  power_whp?: number
  torque_kgfm?: number
  tracao?: 'dianteira' | 'traseira' | 'integral'
  status: 'em_revisao' | 'rejeitado' | 'publicado' | 'arquivado' | 'vendido'
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

/** Dados do formulário "Anuncie seu carro". */
export type NovoAnuncio = Omit<Listing, 'id' | 'views' | 'clicks_whatsapp' | 'created_at' | 'status' | 'user_id'> & {
  user_id?: string
  /** Só para quem anuncia sem conta: fica guardado em separado, visível só ao admin. */
  nome_anunciante?: string
  email?: string
}

interface ListingsStore {
  listings: Listing[]
  filteredListings: Listing[]
  filters: ListingFilters
  isLoading: boolean
  /** Erro ao carregar do banco (mostrado na tela). */
  loadError: string | null
  showNoResultsMessage: boolean
  searchedModel: string
  /** Busca os anúncios no banco (sem efeito no modo demonstração). */
  fetchListings: () => Promise<void>
  setListings: (listings: Listing[]) => void
  setFilters: (filters: Partial<ListingFilters>) => void
  clearFilters: () => void
  createListing: (listing: NovoAnuncio) => Promise<boolean>
  incrementViews: (id: string) => void
  incrementWhatsAppClicks: (id: string) => void
  deleteListing: (id: string) => Promise<boolean>
  applyFilters: () => void
  searchByModel: (model: string) => void
  clearModelSearch: () => void
  approveListing: (id: string, adminNotes?: string) => Promise<boolean>
  rejectListing: (id: string, reason: string) => Promise<boolean>
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>
  markAsSold: (id: string, adminNotes?: string) => Promise<boolean>
  getSoldListings: () => Listing[]
  getListingsByStatus: (status: string) => Listing[]
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
    else {
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
      const priceNumber = extrairValorNumerico(listing.preco)
      if (filters.minPrice && priceNumber < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && priceNumber > filters.maxPrice) {
        return false
      }
    }

    // Filtro por faixa de preço
    if (filters.price && filters.price !== 'todos') {
      const priceNumber = extrairValorNumerico(listing.preco)
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

// ---------------------------------------------------------------------
// Banco (Supabase) <-> formato usado nas telas
// ---------------------------------------------------------------------
type ListingRow = {
  id: string
  user_id: string | null
  titulo: string
  categoria: Listing['categoria']
  ano: number
  preco: number | string
  cidade: string
  uf: string
  descricao: string | null
  telefone: string | null
  destaque: boolean
  views: number
  clicks_whatsapp: number
  power_whp: number | string | null
  torque_kgfm: number | string | null
  tracao: Listing['tracao'] | null
  status: Listing['status']
  aceita_troca: boolean
  images: string[]
  sold_at: string | null
  admin_notes: string | null
  rejection_reason: string | null
  created_at: string
}

const precoFormatado = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)

const numeroOuUndefined = (v: number | string | null) => (v === null || v === '' ? undefined : Number(v))

const deLinha = (r: ListingRow): Listing => ({
  id: r.id,
  user_id: r.user_id,
  titulo: r.titulo,
  categoria: r.categoria,
  ano: r.ano,
  // Vendido: preço e telefone saem da vitrine
  preco: r.status === 'vendido' ? 'VENDIDO' : precoFormatado(Number(r.preco)),
  cidade: r.cidade,
  uf: r.uf,
  descricao: r.descricao ?? undefined,
  telefone: r.status === 'vendido' ? '' : r.telefone ?? '',
  destaque: r.destaque,
  views: r.views,
  clicks_whatsapp: r.clicks_whatsapp,
  power_whp: numeroOuUndefined(r.power_whp),
  torque_kgfm: numeroOuUndefined(r.torque_kgfm),
  tracao: r.tracao ?? undefined,
  status: r.status,
  aceita_troca: r.aceita_troca,
  images: r.images ?? [],
  sold_at: r.sold_at ?? undefined,
  admin_notes: r.admin_notes ?? undefined,
  rejection_reason: r.rejection_reason ?? undefined,
  created_at: r.created_at,
})

/** Campos do formato da tela que viram colunas do banco. */
const paraLinha = (l: Partial<Listing>): Partial<ListingRow> => {
  const row: Partial<ListingRow> = {}
  const copiar = [
    'titulo', 'categoria', 'ano', 'cidade', 'uf', 'destaque', 'status', 'aceita_troca',
    'images', 'sold_at', 'admin_notes', 'rejection_reason',
  ] as const
  for (const k of copiar) if (l[k] !== undefined) (row as Record<string, unknown>)[k] = l[k]
  if (l.preco !== undefined && l.preco !== 'VENDIDO') row.preco = extrairValorNumerico(l.preco)
  if (l.descricao !== undefined) row.descricao = l.descricao || null
  if (l.telefone !== undefined && l.telefone !== '') row.telefone = l.telefone.replace(/\D/g, '')
  if ('power_whp' in l) row.power_whp = l.power_whp ?? null
  if ('torque_kgfm' in l) row.torque_kgfm = l.torque_kgfm ?? null
  if ('tracao' in l) row.tracao = l.tracao ?? null
  return row
}

const filtrosPadrao: ListingFilters = {
  category: 'todos',
  search: '',
  city: 'todas',
  price: 'todos',
  aceita_troca: null,
  modelSearch: '',
  status: 'todos',
  showSoldOnly: false, // vendidos ficam na página própria
}

const listaInicial = supabase ? [] : mockListings

export const useListingsStore = create<ListingsStore>((set, get) => {
  /** Troca a lista e recalcula o que está filtrado na tela. */
  const atualizar = (listings: Listing[]) => {
    const { filters } = get()
    const filteredListings = applyFiltersToListings(listings, filters)
    set({
      listings,
      filteredListings,
      showNoResultsMessage: !!filters.modelSearch && filteredListings.length === 0,
      searchedModel: filters.modelSearch && filteredListings.length === 0 ? filters.modelSearch : '',
    })
  }

  /** Aplica a mudança na tela e grava no banco; desfaz se o banco recusar. */
  const alterar = async (id: string, updates: Partial<Listing>, msgErro: string) => {
    const antes = get().listings
    atualizar(antes.map((l) => (l.id === id ? { ...l, ...updates } : l)))
    if (!supabase) return true

    const { data, error } = await supabase.from('listings').update(paraLinha(updates)).eq('id', id).select().maybeSingle()
    if (error || !data) {
      atualizar(antes)
      toast.error(error ? mensagemDeErro(error, msgErro) : 'Você não tem permissão para alterar este anúncio.')
      return false
    }
    // O banco pode ajustar campos (ex.: edição volta o anúncio para revisão)
    atualizar(get().listings.map((l) => (l.id === id ? deLinha(data as ListingRow) : l)))
    return true
  }

  return {
    listings: listaInicial,
    filteredListings: applyFiltersToListings(listaInicial, filtrosPadrao),
    filters: filtrosPadrao,
    isLoading: false,
    loadError: null,
    showNoResultsMessage: false,
    searchedModel: '',

    fetchListings: async () => {
      if (!supabase) return
      set({ isLoading: true, loadError: null })
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000)
      if (error) {
        set({ isLoading: false, loadError: mensagemDeErro(error, 'Não foi possível carregar os anúncios.') })
        return
      }
      atualizar((data as ListingRow[]).map(deLinha))
      set({ isLoading: false })
    },

    setListings: (listings) => atualizar(listings || []),

    setFilters: (newFilters) => {
      set({ filters: { ...get().filters, ...newFilters } })
      atualizar(get().listings)
    },

    clearFilters: () => {
      set({ filters: filtrosPadrao, showNoResultsMessage: false, searchedModel: '' })
      atualizar(get().listings)
    },

    applyFilters: () => atualizar(get().listings),

    searchByModel: (model) => {
      set({ filters: { ...get().filters, modelSearch: model, search: '', showSoldOnly: false } })
      atualizar(get().listings)
    },

    clearModelSearch: () => {
      set({ filters: { ...get().filters, modelSearch: '', showSoldOnly: false } })
      atualizar(get().listings)
    },

    createListing: async (dados) => {
      set({ isLoading: true })
      const { nome_anunciante, email, ...anuncio } = dados
      const userId = useAuthStore.getState().user?.id ?? null

      try {
        if (!supabase) {
          const novo: Listing = {
            ...anuncio,
            id: crypto.randomUUID(),
            user_id: userId,
            views: 0,
            clicks_whatsapp: 0,
            created_at: new Date().toISOString(),
            status: 'em_revisao',
          }
          atualizar([novo, ...get().listings])
          return true
        }

        const id = crypto.randomUUID()
        const images = await enviarFotos(anuncio.images, userId)
        const row = { ...paraLinha({ ...anuncio, images }), id, user_id: userId }

        // Visitante não consegue ler o anúncio de volta (está em revisão), então sem .select()
        const { error } = await supabase.from('listings').insert(row)
        if (error) throw error

        if (!userId && nome_anunciante && email) {
          const { error: contatoErro } = await supabase
            .from('listing_contacts')
            .insert({ listing_id: id, nome: nome_anunciante, email })
          if (contatoErro) console.warn('Contato do anunciante não salvo:', contatoErro)
        }

        if (userId) await get().fetchListings()
        return true
      } catch (error) {
        console.error('Erro ao criar anúncio:', error)
        toast.error(mensagemDeErro(error, 'Não foi possível enviar o anúncio.'))
        return false
      } finally {
        set({ isLoading: false })
      }
    },

    incrementViews: (id) => {
      atualizar(get().listings.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)))
      if (supabase) enviarSemEsperar(supabase.rpc('increment_listing_views', { listing_id: id }))
    },

    incrementWhatsAppClicks: (id) => {
      atualizar(get().listings.map((l) => (l.id === id ? { ...l, clicks_whatsapp: l.clicks_whatsapp + 1 } : l)))
      if (supabase) enviarSemEsperar(supabase.rpc('increment_listing_whatsapp', { listing_id: id }))
    },

    deleteListing: async (id) => {
      const antes = get().listings
      const alvo = antes.find((l) => l.id === id)
      atualizar(antes.filter((l) => l.id !== id))
      if (!supabase) return true
      const { error, count } = await supabase.from('listings').delete({ count: 'exact' }).eq('id', id)
      if (error || count === 0) {
        atualizar(antes)
        toast.error(error ? mensagemDeErro(error, 'Não foi possível excluir.') : 'Você não tem permissão para excluir este anúncio.')
        return false
      }
      if (alvo) void apagarFotos(alvo.images)
      return true
    },

    approveListing: (id, adminNotes) =>
      alterar(id, { status: 'publicado', admin_notes: adminNotes || undefined, rejection_reason: undefined }, 'Não foi possível aprovar.'),

    rejectListing: (id, reason) =>
      alterar(id, { status: 'rejeitado', rejection_reason: reason }, 'Não foi possível rejeitar.'),

    updateListing: (id, updates) => alterar(id, updates, 'Não foi possível salvar o anúncio.'),

    markAsSold: (id, adminNotes) =>
      alterar(
        id,
        { status: 'vendido', sold_at: new Date().toISOString(), admin_notes: adminNotes || undefined },
        'Não foi possível marcar como vendido.',
      ),

    getSoldListings: () => get().listings.filter((l) => l.status === 'vendido'),

    getListingsByStatus: (status) => get().listings.filter((l) => l.status === status),
  }
})

// Carrega do banco ao abrir o site e de novo quando alguém entra ou sai
// (o admin e o dono enxergam mais anúncios que o visitante).
if (supabase) {
  void useListingsStore.getState().fetchListings()
  let ultimoUsuario: string | null | undefined
  useAuthStore.subscribe((state) => {
    const atual = state.ready ? state.user?.id ?? null : undefined
    if (atual !== undefined && atual !== ultimoUsuario) {
      if (ultimoUsuario !== undefined) void useListingsStore.getState().fetchListings()
      ultimoUsuario = atual
    }
  })
}
