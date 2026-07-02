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

  it('includes all three font families', () => {
    expect(FONT_URL).toContain('Fraunces')
    expect(FONT_URL).toContain('IBM+Plex+Sans')
    expect(FONT_URL).toContain('IBM+Plex+Mono')
  })

  it('ends with display=swap', () => {
    expect(FONT_URL.endsWith('&display=swap')).toBe(true)
  })

  it('does not include weights we do not use (300, 700)', () => {
    expect(FONT_URL).not.toContain(';700')
    expect(FONT_URL).not.toContain(';300')
  })
})