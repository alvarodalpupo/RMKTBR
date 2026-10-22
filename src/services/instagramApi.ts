
import { InstagramPost, InstagramApiResponse } from '../types/instagram'

// Configuração da API
const INSTAGRAM_API_BASE = 'https://graph.instagram.com'
const ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

// Cache simples
let cachedData: { posts: InstagramPost[], timestamp: number } | null = null

// Dados mockados para desenvolvimento
const mockInstagramPosts: InstagramPost[] = [
  {
    id: '1',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '🔥 Civic Si preparado com mais de 400cv! Que máquina incrível! #CivicSi #Turbo #RaceMarketBR',
    permalink: 'https://instagram.com/p/example1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    username: 'racemarketbr'
  },
  {
    id: '2',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '⚡ Golf GTI Stage 2 - A perfeição alemã em forma de hatch! #GolfGTI #Aspirado #PerformanceCars',
    permalink: 'https://instagram.com/p/example2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    username: 'racemarketbr'
  },
  {
    id: '3',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '🏁 Subaru WRX dominando a pista! AWD + Turbo = Combinação perfeita! #SubaruWRX #Pista #Rally',
    permalink: 'https://instagram.com/p/example3',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    username: 'racemarketbr'
  },
  {
    id: '4',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '🎯 BMW M3 E46 - O clássico que nunca sai de moda! Aspirado V6 puro! #BMWM3 #E46 #Aspirado',
    permalink: 'https://instagram.com/p/example4',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    username: 'racemarketbr'
  },
  {
    id: '5',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '💨 Porsche 911 Turbo - Quando a engenharia alemã encontra a velocidade! #Porsche911 #Turbo #SuperCar',
    permalink: 'https://instagram.com/p/example5',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    username: 'racemarketbr'
  },
  {
    id: '6',
    media_type: 'IMAGE',
    media_url: 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=500',
    caption: '🚀 Lancer Evolution X - A lenda japonesa que conquistou o mundo! #LancerEvo #Mitsubishi #JDM',
    permalink: 'https://instagram.com/p/example6',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    username: 'racemarketbr'
  }
]

export const fetchInstagramPosts = async (): Promise<InstagramPost[]> => {
  // Verificar cache
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.posts
  }

  try {
    // Sem token: exemplos só em desenvolvimento; em produção o feed fica oculto
    if (!ACCESS_TOKEN || ACCESS_TOKEN === 'your_access_token_here') {
      const posts = import.meta.env.DEV ? mockInstagramPosts : []
      cachedData = { posts, timestamp: Date.now() }
      return posts
    }

    // Chamada real da API do Instagram
    const response = await fetch(
      `${INSTAGRAM_API_BASE}/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,username&limit=8&access_token=${ACCESS_TOKEN}`
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`)
    }

    const data: InstagramApiResponse = await response.json()
    
    // Filtrar apenas imagens e vídeos válidos
    const validPosts = data.data
      .filter(post => post.media_url && (post.media_type === 'IMAGE' || post.media_type === 'VIDEO'))
      .slice(0, 6) // Limitar a 6 posts

    // Atualizar cache
    cachedData = { posts: validPosts, timestamp: Date.now() }
    
    return validPosts
  } catch (error) {
    console.error('❌ Erro ao buscar posts do Instagram:', error)
    
    // Em produção não mostramos posts falsos: o erro é exibido pelo componente
    if (!import.meta.env.DEV) throw error
    const posts = mockInstagramPosts
    cachedData = { posts, timestamp: Date.now() }
    return posts
  }
}

export const clearInstagramCache = () => {
  cachedData = null
}
