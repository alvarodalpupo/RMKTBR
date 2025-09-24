
import { create } from 'zustand'

export interface Notification {
  id: string
  user_id: string
  type: 'aprovacao' | 'rejeicao' | 'status_change' | 'destaque' | 'geral'
  title: string
  message: string
  listing_id?: string
  read: boolean
  created_at: string
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: (userId: string) => void
  getNotificationsForUser: (userId: string) => Notification[]
  getUnreadCountForUser: (userId: string) => number
  deleteNotification: (notificationId: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))
  },

  markAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    }))
  },

  markAllAsRead: (userId) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.user_id === userId
          ? { ...notification, read: true }
          : notification
      )
    }))
  },

  getNotificationsForUser: (userId) => {
    return get().notifications.filter(notification => notification.user_id === userId)
  },

  getUnreadCountForUser: (userId) => {
    return get().notifications.filter(notification => 
      notification.user_id === userId && !notification.read
    ).length
  },

  deleteNotification: (notificationId) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== notificationId)
    }))
  }
}))
