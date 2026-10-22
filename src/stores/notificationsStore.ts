import { create } from 'zustand'
import { supabase, enviarSemEsperar } from '../lib/supabase'
import { useAuthStore } from './authStore'

export interface Notification {
  id: string
  user_id: string
  type: 'aprovacao' | 'rejeicao' | 'status_change' | 'destaque' | 'geral' | 'account'
  title: string
  message: string
  listing_id?: string
  read: boolean
  created_at: string
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: () => Promise<void>
  /** Cria uma notificação para um usuário (no banco, só o admin pode). */
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: (userId: string) => void
  getNotificationsForUser: (userId: string) => Notification[]
  getUnreadCountForUser: (userId: string) => number
  deleteNotification: (notificationId: string) => void
}

const contarNaoLidas = (list: Notification[]) => list.filter((n) => !n.read).length

/**
 * Notificações do usuário logado. As de anúncio (aprovado, rejeitado,
 * vendido, destaque) são criadas pelo próprio banco quando o admin age.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => {
  const aplicar = (notifications: Notification[]) =>
    set({ notifications, unreadCount: contarNaoLidas(notifications) })

  return {
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
      const userId = useAuthStore.getState().user?.id
      if (!supabase || !userId) return aplicar([])
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, listing_id, read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)
      if (!error && data) aplicar(data as Notification[])
    },

    addNotification: (notification) => {
      const nova: Notification = { ...notification, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const meu = notification.user_id === useAuthStore.getState().user?.id
      if (meu) aplicar([nova, ...get().notifications])
      if (supabase) {
        const { id, ...semId } = nova
        enviarSemEsperar(supabase.from('notifications').insert({ ...semId, id }))
      }
    },

    markAsRead: (notificationId) => {
      aplicar(get().notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      if (supabase) enviarSemEsperar(supabase.from('notifications').update({ read: true }).eq('id', notificationId))
    },

    markAllAsRead: (userId) => {
      aplicar(get().notifications.map((n) => (n.user_id === userId ? { ...n, read: true } : n)))
      if (supabase) enviarSemEsperar(supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false))
    },

    getNotificationsForUser: (userId) => get().notifications.filter((n) => n.user_id === userId),

    getUnreadCountForUser: (userId) => get().notifications.filter((n) => n.user_id === userId && !n.read).length,

    deleteNotification: (notificationId) => {
      aplicar(get().notifications.filter((n) => n.id !== notificationId))
      if (supabase) enviarSemEsperar(supabase.from('notifications').delete().eq('id', notificationId))
    },
  }
})

if (supabase) {
  let ultimo: string | null | undefined
  const conferir = (atual: string | null) => {
    if (atual !== ultimo) {
      ultimo = atual
      void useNotificationsStore.getState().fetchNotifications()
    }
  }
  conferir(useAuthStore.getState().user?.id ?? null)
  useAuthStore.subscribe((state) => conferir(state.user?.id ?? null))
}
