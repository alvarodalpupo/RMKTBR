
import { create } from 'zustand'

interface TrustStore {
  todayRegistrations: number
  totalRegistrations: number
  isAnimating: boolean
  lastUpdate: Date
  incrementTodayRegistrations: () => void
  setAnimating: (animating: boolean) => void
  initializeCounts: () => void
}

export const useTrustStore = create<TrustStore>((set, get) => ({
  todayRegistrations: 0,
  totalRegistrations: 15847, // Número base realista
  isAnimating: false,
  lastUpdate: new Date(),

  incrementTodayRegistrations: () => {
    const { todayRegistrations, isAnimating } = get()
    if (!isAnimating) {
      set({ 
        isAnimating: true,
        todayRegistrations: todayRegistrations + 1,
        totalRegistrations: get().totalRegistrations + 1,
        lastUpdate: new Date()
      })
      
      // Reset animação após 2 segundos
      setTimeout(() => {
        set({ isAnimating: false })
      }, 2000)
    }
  },

  setAnimating: (animating: boolean) => set({ isAnimating: animating }),

  initializeCounts: () => {
    // Simula contagem inicial baseada no horário do dia
    const now = new Date()
    const hourOfDay = now.getHours()
    
    // Simula mais atividade durante horário comercial
    let baseCount = 0
    if (hourOfDay >= 8 && hourOfDay <= 18) {
      baseCount = Math.floor(Math.random() * 25) + 15 // 15-40 durante o dia
    } else {
      baseCount = Math.floor(Math.random() * 10) + 5 // 5-15 durante a noite
    }
    
    set({ 
      todayRegistrations: baseCount,
      lastUpdate: now
    })

    // Incrementa automaticamente a cada 30-90 segundos
    const autoIncrement = () => {
      const randomDelay = Math.random() * 60000 + 30000 // 30-90 segundos
      setTimeout(() => {
        get().incrementTodayRegistrations()
        autoIncrement() // Recursivo
      }, randomDelay)
    }

    autoIncrement()
  }
}))
