// ─────────────────────────────────────────────────────────────────────
// useAuth — authentication state management.
//
// Migrated from smart/browser/src/composables/useAuth.ts.
// Module-scoped singleton (same pattern as useNotification).
// Pinia migration is TODO.astro/22.
//
// The composable manages:
// - user: reactive ref holding the authenticated user, or null
// - loading: true during async operations
// - initialized: false until first checkSession completes
// - checkSession: GET /api/auth/session to restore session
// - loginDemo: POST /api/auth/demo (dev-only demo login)
// - logout: POST /api/auth/signout then clears user
// ─────────────────────────────────────────────────────────────────────

import { ref, computed } from 'vue'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string
}

const user = ref<AuthUser | null>(null)
const loading = ref(false)
const initialized = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  async function checkSession(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      if (res.ok) {
        user.value = await res.json()
        return true
      }
      user.value = null
      return false
    } catch {
      user.value = null
      return false
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function loginDemo(email: string, password: string): Promise<boolean> {
    loading.value = true
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (res.ok) {
        user.value = await res.json()
        return true
      }
      return false
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    } catch { /* ignore */ }
    user.value = null
  }

  return { user, loading, initialized, isAuthenticated, checkSession, loginDemo, logout }
}
