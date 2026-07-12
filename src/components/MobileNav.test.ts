import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from './MobileNav.vue'

describe('MobileNav', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  it('renders hamburger trigger button', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('button[aria-label="Open menu"]').exists()).toBe(true)
  })

  it('overlay hidden initially', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('[aria-label="Close menu"]').exists()).toBe(false)
  })

  it('opens overlay on hamburger click and locks body scroll', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    expect(wrapper.find('[aria-label="Close menu"]').exists()).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes overlay on close button click', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await wrapper.find('button[aria-label="Close menu"]').trigger('click')
    expect(document.body.style.overflow).toBe('')
  })

  it('shows all nav items when open', async () => {
    const wrapper = mount(MobileNav)
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    const text = wrapper.text()
    expect(text).toContain('Resources')
    expect(text).toContain('Blog')
    expect(text).toContain('OIML-CS')
    expect(text).toContain('About')
    expect(text).toContain('Sign in')
    expect(wrapper.find('[aria-label*="mode"]').exists()).toBe(true)
  })
})
