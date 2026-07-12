import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export const NOTIFICATION_DURATION = {
  default: 3000,
  error: 6000,
} as const

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function add(n: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID()
    notifications.value.push({ ...n, id })
    const duration = n.duration ?? (n.type === 'error' ? NOTIFICATION_DURATION.error : NOTIFICATION_DURATION.default)
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: string): void {
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) notifications.value.splice(idx, 1)
  }

  return {
    notifications,
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error: (title: string, message?: string) => add({ type: 'error', title, message }),
    warning: (title: string, message?: string) => add({ type: 'warning', title, message }),
    info: (title: string, message?: string) => add({ type: 'info', title, message }),
    dismiss,
  }
})
