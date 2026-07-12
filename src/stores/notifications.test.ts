import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotificationStore, NOTIFICATION_DURATION } from './notifications'

describe('useNotificationStore (Pinia)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes reactive notifications array and 4 typed helpers', () => {
    const store = useNotificationStore()
    expect(store.notifications).toBeDefined()
    expect(typeof store.success).toBe('function')
    expect(typeof store.error).toBe('function')
    expect(typeof store.warning).toBe('function')
    expect(typeof store.info).toBe('function')
    expect(typeof store.dismiss).toBe('function')
  })

  it('adds success notification with default duration', () => {
    const store = useNotificationStore()
    store.success('Saved', 'All changes applied')
    expect(store.notifications.length).toBe(1)
    expect(store.notifications[0]).toMatchObject({
      type: 'success',
      title: 'Saved',
      message: 'All changes applied',
    })
    expect(store.notifications[0].id).toMatch(/[0-9a-f-]{36}/i)
  })

  it('error notifications have a longer default duration', () => {
    const store = useNotificationStore()
    store.error('Boom')
    vi.advanceTimersByTime(NOTIFICATION_DURATION.default)
    expect(store.notifications.length).toBe(1)
    vi.advanceTimersByTime(NOTIFICATION_DURATION.error - NOTIFICATION_DURATION.default + 1)
    expect(store.notifications.length).toBe(0)
  })

  it('success notifications auto-dismiss at default duration', () => {
    const store = useNotificationStore()
    store.success('OK')
    vi.advanceTimersByTime(NOTIFICATION_DURATION.default - 1)
    expect(store.notifications.length).toBe(1)
    vi.advanceTimersByTime(2)
    expect(store.notifications.length).toBe(0)
  })

  it('dismiss removes the right notification by id', () => {
    const store = useNotificationStore()
    store.success('first')
    store.success('second')
    store.success('third')
    const ids = store.notifications.map(n => n.id)
    store.dismiss(ids[1])
    expect(store.notifications.map(n => n.title)).toEqual(['first', 'third'])
  })

  it('dismiss is a no-op for unknown ids', () => {
    const store = useNotificationStore()
    store.success('only')
    store.dismiss('does-not-exist')
    expect(store.notifications.length).toBe(1)
  })

  it('each test gets a fresh store (no state leakage)', () => {
    const store = useNotificationStore()
    expect(store.notifications.length).toBe(0)
  })
})
