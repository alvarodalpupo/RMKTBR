
import { create } from 'zustand'
import { InstagramStore } from '../types/instagram'
import { fetchInstagramPosts } from '../services/instagramApi'

export const useInstagramStore = create<InstagramStore>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchPosts: async () => {
    const { lastFetch } = get()
    const now = Date.now()
    
    // Evitar múltiplas requisições em pouco tempo
    if (lastFetch && now - lastFetch < 5 * 60 * 1000) { // 5 minutos
      return
    }

    set({ isLoading: true, error: null })

    try {
      const posts = await fetchInstagramPosts()
      set({ 
        posts, 
        isLoading: false, 
        error: null,
        lastFetch: now
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar posts do Instagram'
      set({ 
        isLoading: false, 
        error: errorMessage
      })
    }
  },

  clearError: () => set({ error: null })
}))
