import { describe, it, expect } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { STANDARDS } from './standards'

const CONTENT_ROOT = join(import.meta.dirname, '..', 'content', 'pages')

function collectSlugs(dir: string): string[] {
  try {
    return readdirSync(join(CONTENT_ROOT, dir))
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .map(f => f.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

describe('STANDARDS ↔ pages contract', () => {
  const librarySlugs = new Set(collectSlugs('library'))
  const recommendationSlugs = new Set(collectSlugs('recommendations'))

  it('every STANDARDS entry has a /library/<slug>/ page', () => {
    for (const s of STANDARDS) {
      expect(librarySlugs.has(s.slug)).toBe(true)
    }
  })

  it('every STANDARDS entry has a /recommendations/<slug>/ page', () => {
    for (const s of STANDARDS) {
      expect(recommendationSlugs.has(s.slug)).toBe(true)
    }
  })
})
