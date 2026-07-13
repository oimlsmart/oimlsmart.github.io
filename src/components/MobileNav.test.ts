import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from './MobileNav.vue'

describe('MobileNav', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
    document.body.innerHTML = ''
  })

  it('renders hamburger trigger button', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('button[aria-label="Open menu"]').exists()).toBe(true)
  })

  it('overlay hidden initially', () => {
    mount(MobileNav)
    expect(document.body.querySelector('[aria-label="Close menu"]')).toBeNull()
  })

  it('opens overlay on hamburger click and locks body scroll', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))
    expect(document.body.querySelector('[aria-label="Close menu"]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes overlay on close button click', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    const closeBtn = document.body.querySelector('[aria-label="Close menu"]') as HTMLElement
    closeBtn.click()
    await new Promise(r => setTimeout(r, 0))

    expect(document.body.style.overflow).toBe('')
  })

  it('shows all nav items when open', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    const overlay = document.body.querySelector('.fixed.inset-0')
    expect(overlay).not.toBeNull()
    const text = overlay!.textContent || ''
    expect(text).toContain('Resources')
    expect(text).toContain('Blog')
    expect(text).toContain('OIML-CS')
    expect(text).toContain('About')
    expect(text).toContain('Sign in')
    expect(overlay!.querySelector('[aria-label*="mode"]')).not.toBeNull()
  })
})
