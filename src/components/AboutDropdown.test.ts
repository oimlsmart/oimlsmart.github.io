import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutDropdown from './AboutDropdown.vue'

// Component was refactored: trigger is a bare <button>, panel is a
// bare <div> with Tailwind utilities. Selectors below target by
// structure (root > button, root > div, div > a) rather than class.

describe('AboutDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts and renders the trigger with all 6 links', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.findAll('a').length).toBe(6)
    wrapper.unmount()
  })

  it('starts with the panel hidden', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const panel = wrapper.find('div:not([class*="relative"])')
    expect(panel.classes()).toContain('hidden')
    wrapper.unmount()
  })

  it('opens on trigger click', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    await wrapper.find('button').trigger('click')
    const panel = wrapper.find('div:not([class*="relative"])')
    expect(panel.classes()).toContain('flex')
    expect(panel.classes()).not.toContain('hidden')
    wrapper.unmount()
  })

  it('toggles closed when opened again', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const trigger = wrapper.find('button')
    await trigger.trigger('click')
    expect(wrapper.find('div:not([class*="relative"])').classes()).toContain('flex')
    await trigger.trigger('click')
    expect(wrapper.find('div:not([class*="relative"])').classes()).toContain('hidden')
    wrapper.unmount()
  })

  it('closes when clicking outside the dropdown', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('div:not([class*="relative"])').classes()).toContain('flex')
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div:not([class*="relative"])').classes()).toContain('hidden')
    wrapper.unmount()
  })

  it('uses real anchor tags with the expected hrefs', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href'))
    expect(hrefs).toEqual([
      '/about/what-is-smart',
      '/about/why-smart',
      '/about/how-it-works',
      '/about/technology',
      '/about/contact',
      '/about/branding',
    ])
    wrapper.unmount()
  })
})
