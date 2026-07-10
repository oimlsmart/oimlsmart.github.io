import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from './MobileNav.vue'

describe('MobileNav', () => {
  beforeEach(() => {
    document.body.classList.remove('nav-open')
  })

  it('mounts and renders a hamburger button', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('button.nav-hamburger').exists()).toBe(true)
    expect(wrapper.findAll('button span').length).toBe(3)
  })

  it('starts closed', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('button').classes()).not.toContain('is-open')
    expect(document.body.classList.contains('nav-open')).toBe(false)
  })

  it('toggles open state and applies body class on click', async () => {
    const wrapper = mount(MobileNav)
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(wrapper.find('button').classes()).toContain('is-open')
    expect(document.body.classList.contains('nav-open')).toBe(true)

    await button.trigger('click')
    expect(wrapper.find('button').classes()).not.toContain('is-open')
    expect(document.body.classList.contains('nav-open')).toBe(false)
  })

  it('has accessible label', () => {
    const wrapper = mount(MobileNav)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Menu')
  })
})
