import { describe, it, expect } from 'vitest'
import { byDocsOrder } from './docs-sort'
import type { CollectionEntry } from 'astro:content'

function mockEntry(id: string, order: number | undefined): CollectionEntry<'docs'> {
  return { id, data: { order } } as unknown as CollectionEntry<'docs'>
}

describe('byDocsOrder', () => {
  it('sorts by order ascending', () => {
    const entries = [mockEntry('b', 2), mockEntry('a', 1), mockEntry('c', 3)]
    const sorted = [...entries].sort(byDocsOrder)
    expect(sorted.map(e => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('falls back to 999 when order is undefined', () => {
    const entries = [mockEntry('unordered', undefined), mockEntry('ordered', 5)]
    const sorted = [...entries].sort(byDocsOrder)
    expect(sorted[0].id).toBe('ordered')
  })

  it('breaks ties by id alphabetically', () => {
    const entries = [mockEntry('z', 1), mockEntry('a', 1)]
    const sorted = [...entries].sort(byDocsOrder)
    expect(sorted[0].id).toBe('a')
  })

  it('all undefined orders sort by id', () => {
    const entries = [mockEntry('c', undefined), mockEntry('a', undefined), mockEntry('b', undefined)]
    const sorted = [...entries].sort(byDocsOrder)
    expect(sorted.map(e => e.id)).toEqual(['a', 'b', 'c'])
  })
})
