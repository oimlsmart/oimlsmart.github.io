import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ThemeToggle from './ThemeToggle.vue'

// ─────────────────────────────────────────────────────────────────────
// Smoke tests for ThemeToggle.vue — proves vitest + @vue/test-utils
// can mount Vue SFCs under Astro before we migrate anything larger.
//
// What this locks in:
// - localStorage 'oiml-theme' key is the source of truth for the
//   initial theme
// - Click toggles the theme, persists to localStorage, updates the
//   <html> classlist
// - aria-label reflects the current state (accessibility)
// ─────────────────────────────────────────────────────────────────────

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('mounts without error', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a button with accessible label', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').attributes('aria-label')).toMatch(/mode/)
  })

  it('defaults to light mode when no stored preference', () => {
    const wrapper = mount(ThemeToggle)
    // Initial state is light (isDark=false), so label says "dark mode"
    // is what we'd switch TO.
    expect(wrapper.find('button').attributes('aria-label')).toMatch(/dark mode/)
  })

  it('reads stored dark preference on mount', async () => {
    localStorage.setItem('oiml-theme', 'dark')
    const wrapper = mount(ThemeToggle)
    await flushPromises()
    // applyTheme should have added the dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    wrapper.unmount()
  })

  it('toggles theme on click and persists', async () => {
    const wrapper = mount(ThemeToggle)
    const button = wrapper.find('button')

    // Initially light
    expect(localStorage.getItem('oiml-theme')).toBeNull()

    // Click → dark
    await button.trigger('click')
    expect(localStorage.getItem('oiml-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Click again → light
    await button.trigger('click')
    expect(localStorage.getItem('oiml-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
