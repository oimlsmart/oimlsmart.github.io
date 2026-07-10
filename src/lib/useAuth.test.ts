import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useAuth } from './useAuth'

// ─────────────────────────────────────────────────────────────────────
// useAuth tests — locks in the session-check / login / logout behavior.
// Uses vi.fn() to mock global fetch.
// ─────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'u1',
  email: 'alice@example.org',
  name: 'Alice',
  role: 'ia-staff',
}

describe('useAuth', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    globalThis.fetch = fetchMock as unknown as typeof fetch
    // Reset module-scoped state by calling logout
    const { logout } = useAuth()
    logout()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts unauthenticated', () => {
      const { isAuthenticated, user, loading, initialized } = useAuth()
      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(initialized.value).toBe(false)
    })
  })

  describe('checkSession', () => {
    it('sets user when session is valid', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const { checkSession, user, isAuthenticated, initialized } = useAuth()
      const result = await checkSession()

      expect(result).toBe(true)
      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
      expect(initialized.value).toBe(true)
    })

    it('clears user when session is invalid', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false })

      const { checkSession, user, initialized } = useAuth()
      const result = await checkSession()

      expect(result).toBe(false)
      expect(user.value).toBeNull()
      expect(initialized.value).toBe(true)
    })

    it('clears user on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network'))

      const { checkSession, user } = useAuth()
      const result = await checkSession()

      expect(result).toBe(false)
      expect(user.value).toBeNull()
    })

    it('sends credentials', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false })

      const { checkSession } = useAuth()
      await checkSession()

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/session', { credentials: 'include' })
    })
  })

  describe('loginDemo', () => {
    it('sets user on success', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const { loginDemo, user, isAuthenticated } = useAuth()
      const result = await loginDemo('alice@example.org', 'secret')

      expect(result).toBe(true)
      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
    })

    it('returns false on auth failure', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false })

      const { loginDemo, user } = useAuth()
      const result = await loginDemo('bad@example.org', 'wrong')

      expect(result).toBe(false)
      expect(user.value).toBeNull()
    })

    it('sends POST with credentials', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false })

      const { loginDemo } = useAuth()
      await loginDemo('a@b.c', 'p')

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.c', password: 'p' }),
        credentials: 'include',
      })
    })
  })

  describe('logout', () => {
    it('clears user', async () => {
      // First log in
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })
      const { loginDemo, logout, user, isAuthenticated } = useAuth()
      await loginDemo('alice@example.org', 'secret')
      expect(isAuthenticated.value).toBe(true)

      // Then log out
      fetchMock.mockResolvedValueOnce({ ok: true })
      await logout()

      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
    })

    it('calls /api/auth/signout', async () => {
      const { logout } = useAuth()
      await logout()

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
    })

    it('clears user even on network error', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockUser })
      const { loginDemo, logout, user } = useAuth()
      await loginDemo('a@b.c', 'p')
      expect(user.value).not.toBeNull()

      fetchMock.mockRejectedValueOnce(new Error('network'))
      await logout()

      expect(user.value).toBeNull()
    })
  })
})
