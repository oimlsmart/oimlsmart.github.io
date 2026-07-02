import { describe, expect, it } from 'vitest'
import { recommendations, findRecommendation } from '../.vitepress/data/recommendations'

describe('recommendations', () => {
  it('has three entries', () => {
    expect(recommendations).toHaveLength(3)
  })

  it('includes R 60, R 129, R 144', () => {
    const numbers = recommendations.map((r) => r.number)
    expect(numbers).toContain('R 60')
    expect(numbers).toContain('R 129')
    expect(numbers).toContain('R 144')
  })

  it('every recommendation has a valid href', () => {
    for (const r of recommendations) {
      expect(r.href).toMatch(/^\/recommendations\/r\d+\.html$/)
    }
  })

  it('every recommendation has non-zero stats', () => {
    for (const r of recommendations) {
      expect(r.stats.requirements).toBeGreaterThan(0)
      expect(r.stats.tests).toBeGreaterThan(0)
      expect(r.stats.forms).toBeGreaterThan(0)
    }
  })
})

describe('findRecommendation', () => {
  it('finds R 60 by number', () => {
    const r = findRecommendation('R 60')
    expect(r).toBeDefined()
    expect(r!.title).toBe('Load Cells')
  })

  it('returns undefined for unknown number', () => {
    expect(findRecommendation('R 999')).toBeUndefined()
  })
})