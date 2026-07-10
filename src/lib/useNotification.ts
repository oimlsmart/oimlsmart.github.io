// ─────────────────────────────────────────────────────────────────────
// useNotification — global toast notification store.
//
// Migrated from smart/browser/src/composables/useNotification.ts.
// Pure: depends only on vue's reactivity. No IndexedDB, no auth, no fetch.
//
// Note: this is a module-scoped singleton (notifications ref). Multiple
// useNotification() calls share the same list. That's intentional —
// it matches the original behavior and lets any Vue component show
// toasts that any other component renders.
// ─────────────────────────────────────────────────────────────────────

import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])

function add(n: Omit<Notification, 'id'>): void {
  const id = crypto.randomUUID()
  notifications.value.push({ ...n, id })
  const duration = n.duration ?? (n.type === 'error' ? 6000 : 3000)
  setTimeout(() => dismiss(id), duration)
}

function dismiss(id: string): void {
  const idx = notifications.value.findIndex(n => n.id === id)
  if (idx !== -1) notifications.value.splice(idx, 1)
}

export function useNotification() {
  return {
    notifications,
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error: (title: string, message?: string) => add({ type: 'error', title, message }),
    warning: (title: string, message?: string) => add({ type: 'warning', title, message }),
    info: (title: string, message?: string) => add({ type: 'info', title, message }),
    dismiss,
  }
}
