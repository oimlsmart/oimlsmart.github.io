import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBox from './SearchBox.vue'

describe('SearchBox', () => {
  beforeEach(() => {
    // Clean up the script/link tags SearchBox appends
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    // Reset the window-level PagefindUI stub from any previous test
    delete (window as { PagefindUI?: unknown }).PagefindUI
  })

  it('mounts and renders the search container', () => {
    const wrapper = mount(SearchBox)
    expect(wrapper.find('#pagefind-search').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-box"]').exists()).toBe(true)
  })

  it('does NOT eagerly load pagefind script', () => {
    const wrapper = mount(SearchBox)
    const scripts = Array.from(document.head.querySelectorAll('script[src*="pagefind"]'))
    expect(scripts.length).toBe(0)
  })

  it('triggers lazy load on focus', async () => {
    const wrapper = mount(SearchBox)

    // Stub window.PagefindUI
    const fakeUi = vi.fn()
    ;(window as { PagefindUI: unknown }).PagefindUI = fakeUi
    document.getElementById = vi.fn().mockReturnValue(document.createElement('div'))

    const focusTarget = wrapper.find('[data-testid="search-box"]')
    await focusTarget.trigger('focusin')

    // Allow the dynamic script load (Promise) to settle
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    const scripts = Array.from(document.head.querySelectorAll('script[src*="pagefind"]'))
    expect(scripts.length).toBe(1)
  })

  it('idempotent: re-firing focus does not duplicate scripts', async () => {
    const wrapper = mount(SearchBox)

    const focusTarget = wrapper.find('[data-testid="search-box"]')
    await focusTarget.trigger('focusin')
    await focusTarget.trigger('focusin')

    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    const scripts = Array.from(document.head.querySelectorAll('script[src*="pagefind"]'))
    expect(scripts.length).toBe(1)
  })
})
