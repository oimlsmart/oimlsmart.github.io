import { describe, expect, it } from 'vitest'
import { FONT_URL } from '../.vitepress/data/fonts'

describe('FONT_URL', () => {
  it('is a non-empty string', () => {
    expect(FONT_URL).toBeTruthy()
    expect(typeof FONT_URL).toBe('string')
  })

  it('starts with the Google Fonts CSS2 endpoint', () => {
    expect(FONT_URL.startsWith('https://fonts.googleapis.com/css2?')).toBe(true)
  })

  it('includes all four font families', () => {
    expect(FONT_URL).toContain('Fraunces')
    expect(FONT_URL).toContain('IBM+Plex+Sans')
    expect(FONT_URL).toContain('IBM+Plex+Mono')
    expect(FONT_URL).toContain('Source+Serif+4')
  })

  it('ends with display=swap', () => {
    expect(FONT_URL.endsWith('&display=swap')).toBe(true)
  })

  it('uses the full Fraunces optical-size range (9..144)', () => {
    expect(FONT_URL).toContain('9..144')
  })
})