import { describe, it, expect } from 'vitest'
import { useEntityList } from './use-entity-list'
import type { EntityApi } from './entity-composable'
import { createApp, nextTick } from 'vue'

function mockApi<T extends { id: string }>(items: T[]): EntityApi<T> {
  let current = [...items]
  return {
    repo: {} as any,
    list: () => [...current],
    get: (id: string) => current.find(i => i.id === id),
    async create() { return {} as T },
    async update() {},
    async remove() {},
    async preload() {},
    async getByIndex() { return [] },
    filter: (fn: (i: T) => boolean) => current.filter(fn),
    findFirst: (fn: (i: T) => boolean) => current.find(fn),
    onChange: () => () => {},
  }
}

describe('useEntityList', () => {
  it('returns loading=true initially, items empty', () => {
    const api = mockApi([{ id: '1' }, { id: '2' }] as any)
    const app = createApp({
      setup() {
        const result = useEntityList(api as any)
        expect(result.loading.value).toBe(true)
        expect(result.items.value).toEqual([])
        return () => null
      },
    })
    app.mount(document.createElement('div'))
    app.unmount()
  })

  it('loads items and sets loading=false after mount', async () => {
    const items = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }]
    const api = mockApi(items as any)
    let result: any

    const app = createApp({
      setup() {
        result = useEntityList(api as any)
        return () => null
      },
    })
    app.mount(document.createElement('div'))

    await nextTick()
    await nextTick()

    expect(result.loading.value).toBe(false)
    expect(result.items.value.length).toBe(2)
    app.unmount()
  })

  it('reload() refreshes items from the api', async () => {
    const api = mockApi([{ id: '1' }] as any)
    let result: any

    const app = createApp({
      setup() {
        result = useEntityList(api as any)
        return () => null
      },
    })
    app.mount(document.createElement('div'))
    await nextTick()
    await nextTick()

    expect(result.items.value.length).toBe(1)

    await result.reload()
    expect(result.items.value.length).toBe(1)

    app.unmount()
  })
})
