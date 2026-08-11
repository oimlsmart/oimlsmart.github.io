import { describe, it, expect } from 'vitest'
import { STANDARDS, getStandardById, getStandardBySlug, getStandardByNumber, STANDARDS_STATS, approximate } from './standards'

describe('standards registry', () => {
  describe('STANDARDS shape', () => {
    it('contains 3 standards (R 60, R 129, R 144)', () => {
      expect(STANDARDS.length).toBe(3)
    })

    it('every standard declares all required fields', () => {
      for (const s of STANDARDS) {
        expect(s.id).toMatch(/^OIML-R-\d+$/)
        expect(s.slug).toMatch(/^[a-z0-9-]+$/)
        expect(s.recommendationNumber).toMatch(/^R \d+$/)
        expect(s.title.length).toBeGreaterThan(0)
        expect(s.scope.length).toBeGreaterThan(0)
        expect(s.year).toBeGreaterThan(1990)
        expect(s.counts.requirements).toBeGreaterThan(0)
        expect(s.counts.tests).toBeGreaterThan(0)
        expect(s.counts.forms).toBeGreaterThan(0)
        expect(s.recommendationsPath).toMatch(/^\/recommendations\/[a-z0-9-]+$/)
        expect(s.libraryPath).toMatch(/^\/library\/[a-z0-9-]+$/)
      }
    })

    it('slugs are unique', () => {
      const slugs = STANDARDS.map(s => s.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it('ids are unique', () => {
      const ids = STANDARDS.map(s => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('paths are unique', () => {
      const paths = STANDARDS.flatMap(s => [s.recommendationsPath, s.libraryPath])
      expect(new Set(paths).size).toBe(paths.length)
    })

    it('slugs match the suffix of paths', () => {
      for (const s of STANDARDS) {
        expect(s.recommendationsPath.endsWith(s.slug)).toBe(true)
        expect(s.libraryPath.endsWith(s.slug)).toBe(true)
      }
    })
  })

  describe('lookup helpers', () => {
    it('getStandardById returns the matching standard', () => {
      const r60 = getStandardById('OIML-R-60')
      expect(r60?.recommendationNumber).toBe('R 60')
    })

    it('getStandardById returns undefined for unknown id', () => {
      expect(getStandardById('OIML-R-999')).toBeUndefined()
    })

    it('getStandardBySlug returns the matching standard', () => {
      expect(getStandardBySlug('r60')?.recommendationNumber).toBe('R 60')
      expect(getStandardBySlug('r129')?.recommendationNumber).toBe('R 129')
      expect(getStandardBySlug('r144')?.recommendationNumber).toBe('R 144')
    })

    it('getStandardByNumber returns the matching standard', () => {
      expect(getStandardByNumber('R 60')?.slug).toBe('r60')
    })
  })

  describe('STANDARDS_STATS', () => {
    it('total matches STANDARDS.length', () => {
      expect(STANDARDS_STATS.total).toBe(STANDARDS.length)
    })

    it('totalRequirements is the sum of all standards', () => {
      const manual = STANDARDS.reduce((sum, s) => sum + s.counts.requirements, 0)
      expect(STANDARDS_STATS.totalRequirements).toBe(manual)
    })

    it('totalTests is the sum of all standards', () => {
      const manual = STANDARDS.reduce((sum, s) => sum + s.counts.tests, 0)
      expect(STANDARDS_STATS.totalTests).toBe(manual)
    })

    it('totalForms is the sum of all standards', () => {
      const manual = STANDARDS.reduce((sum, s) => sum + s.counts.forms, 0)
      expect(STANDARDS_STATS.totalForms).toBe(manual)
    })
  })

  describe('approximate', () => {
    it('returns the number as-is for values under 100', () => {
      expect(approximate(42)).toBe('42')
      expect(approximate(99)).toBe('99')
      expect(approximate(0)).toBe('0')
    })

    it('rounds up to nearest 10 and appends + for values >= 100', () => {
      expect(approximate(100)).toBe('100+')
      expect(approximate(101)).toBe('110+')
      expect(approximate(105)).toBe('110+')
      expect(approximate(195)).toBe('200+')
    })
  })
})
