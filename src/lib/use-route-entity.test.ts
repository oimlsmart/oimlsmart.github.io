import { describe, it, expect, vi } from 'vitest'
import { useRouteEntity } from './use-route-entity'
import type { EntityApi } from './entity-composable'
import { createApp, nextTick } from 'vue'

function mockApi<T extends { id: string }>(items: T[]): EntityApi<T> {
  return {
    repo: {} as any,
    list: () => items,
    get: (id: string) => items.find(i => i.id === id),
    async create() { return {} as T },
    async update() {},
    async remove() {},
    async preload() {},
    async getByIndex() { return [] },
    filter: (fn: (i: T) => boolean) => items.filter(fn),
    findFirst: (fn: (i: T) => boolean) => items.find(fn),
    onChange: () => () => {},
  }
}

describe('useRouteEntity', () => {
  it('returns loading=true and entity=undefined during setup', () => {
    const items = [{ id: 'abc', name: 'Test' }]
    const api = mockApi(items as any)
    let setupState: { loading: boolean; entity: unknown }

    const app = createApp({
      setup() {
        const result = useRouteEntity(api as any)
        setupState = { loading: result.loading.value, entity: result.entity.value }
        return () => null
      },
    })
    app.mount(document.createElement('div'))

    expect(setupState!.loading).toBe(true)
    expect(setupState!.entity).toBeUndefined()
    app.unmount()
  })

  it('reads id from URL search params after mount', async () => {
    const items = [{ id: 'xyz', name: 'Found' }]
    const api = mockApi(items as any)
    let result: any

    const original = window.location.search
    Object.defineProperty(window, 'location', {
      value: { search: '?id=xyz' },
      writable: true,
    })

    const app = createApp({
      setup() {
        result = useRouteEntity(api as any)
        return () => null
      },
    })
    app.mount(document.createElement('div'))
    await nextTick()

    expect(result.id.value).toBe('xyz')
    expect(result.loading.value).toBe(false)
    expect(result.entity.value).toEqual({ id: 'xyz', name: 'Found' })
    app.unmount()

    Object.defineProperty(window, 'location', { value: { search: original }, writable: true })
  })

  it('returns undefined entity when id is not found in URL', async () => {
    const api = mockApi([{ id: 'a' }] as any)
    let result: any

    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    })

    const app = createApp({
      setup() {
        result = useRouteEntity(api as any)
        return () => null
      },
    })
    app.mount(document.createElement('div'))
    await nextTick()

    expect(result.id.value).toBeNull()
    expect(result.entity.value).toBeUndefined()
    app.unmount()
  })
})
