import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the repository layer — tests focus on factory logic, not IndexedDB.
vi.mock('./repository', () => {
  class MockRepo<T extends { id: string }> {
    private cache = new Map<string, T>()
    private listeners = new Set<(id: string) => void>()

    get(id: string) { return this.cache.get(id) }
    list() { return Array.from(this.cache.values()) }
    async persist(item: T) {
      this.cache.set(item.id, item)
      this.listeners.forEach(l => l(item.id))
    }
    async remove(id: string) {
      this.cache.delete(id)
      this.listeners.forEach(l => l(id))
    }
    async preload() {}
    async getByIndex() { return [] }
    filter(fn: (item: T) => boolean) { return this.list().filter(fn) }
    findFirst(fn: (item: T) => boolean) { return this.list().find(fn) }
    onChange(l: (id: string) => void) { this.listeners.add(l); return () => this.listeners.delete(l) }
  }

  const repos = new Map()
  return {
    getRepository: vi.fn(<T extends { id: string }>(store: string) => {
      if (!repos.has(store)) repos.set(store, new MockRepo<T>())
      return repos.get(store)
    }),
    clearRepositories: vi.fn(() => repos.clear()),
    Repository: MockRepo,
  }
})

import { defineEntityComposable } from './entity-composable'
import { clearRepositories } from './repository'
import {
  useApplication,
  useTestRequest,
  useFormInstance,
  useModelFamily,
  useTestAssignment,
  useTestReport,
  useEvaluationReport,
  useModelEvaluation,
  useInstrumentSample,
  useOrganization,
} from './entity-composables'

interface Widget { id: string; name: string; status: string }

beforeEach(() => {
  clearRepositories()
})

describe('defineEntityComposable', () => {
  it('returns all required methods', () => {
    const api = defineEntityComposable<Widget>('testRequests')
    expect(typeof api.list).toBe('function')
    expect(typeof api.get).toBe('function')
    expect(typeof api.create).toBe('function')
    expect(typeof api.update).toBe('function')
    expect(typeof api.remove).toBe('function')
    expect(typeof api.preload).toBe('function')
    expect(typeof api.filter).toBe('function')
    expect(typeof api.findFirst).toBe('function')
    expect(typeof api.onChange).toBe('function')
  })

  it('starts empty', () => {
    const api = defineEntityComposable<Widget>('testRequests')
    expect(api.list()).toEqual([])
    expect(api.get('x')).toBeUndefined()
  })

  it('create auto-generates UUID when id not provided', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    const w = await api.create({ name: 'A', status: 'DRAFT' })
    expect(w.id).toMatch(/[0-9a-f-]{36}/i)
    expect(w.name).toBe('A')
    expect(api.get(w.id)).toEqual(w)
  })

  it('create uses provided id', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    const w = await api.create({ id: 'custom', name: 'A', status: 'DRAFT' })
    expect(w.id).toBe('custom')
  })

  it('list returns all cached items', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    await api.create({ name: 'A', status: 'DRAFT' })
    await api.create({ name: 'B', status: 'ISSUED' })
    expect(api.list().length).toBe(2)
  })

  it('update persists changes', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    const w = await api.create({ name: 'A', status: 'DRAFT' })
    await api.update({ ...w, status: 'ISSUED' })
    expect(api.get(w.id)!.status).toBe('ISSUED')
  })

  it('remove deletes from cache', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    const w = await api.create({ name: 'A', status: 'DRAFT' })
    await api.remove(w.id)
    expect(api.get(w.id)).toBeUndefined()
  })

  it('filter returns matching items', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    await api.create({ name: 'A', status: 'DRAFT' })
    await api.create({ name: 'B', status: 'ISSUED' })
    await api.create({ name: 'C', status: 'DRAFT' })
    expect(api.filter(w => w.status === 'DRAFT').length).toBe(2)
  })

  it('findFirst returns first match', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    await api.create({ name: 'A', status: 'ISSUED' })
    expect(api.findFirst(w => w.status === 'ISSUED')?.name).toBe('A')
    expect(api.findFirst(w => w.status === 'X')).toBeUndefined()
  })

  it('onChange fires after create', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    let changedId = ''
    api.onChange(id => { changedId = id })
    const w = await api.create({ name: 'A', status: 'DRAFT' })
    expect(changedId).toBe(w.id)
  })

  it('onChange unsubscribe works', async () => {
    const api = defineEntityComposable<Widget>('testRequests')
    let calls = 0
    const unsub = api.onChange(() => { calls++ })
    await api.create({ name: 'A', status: 'DRAFT' })
    expect(calls).toBe(1)
    unsub()
    await api.create({ name: 'B', status: 'DRAFT' })
    expect(calls).toBe(1)
  })

  it('same store returns same repo (singleton)', () => {
    const a = defineEntityComposable<Widget>('testRequests')
    const b = defineEntityComposable<Widget>('testRequests')
    expect(a.repo).toBe(b.repo)
  })
})

describe('pre-built entity composables', () => {
  const composables = [
    useApplication, useTestRequest, useFormInstance, useModelFamily,
    useTestAssignment, useTestReport, useEvaluationReport,
    useModelEvaluation, useInstrumentSample, useOrganization,
  ]

  for (const fn of composables) {
    it(`${fn.name} returns a valid EntityApi`, () => {
      const api = fn()
      expect(typeof api.list).toBe('function')
      expect(typeof api.create).toBe('function')
      expect(typeof api.get).toBe('function')
      expect(typeof api.update).toBe('function')
      expect(typeof api.remove).toBe('function')
    })
  }
})
