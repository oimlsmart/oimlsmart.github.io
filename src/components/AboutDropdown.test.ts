import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutDropdown from './AboutDropdown.vue'

describe('AboutDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts and renders the trigger with all 6 links', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    expect(wrapper.find('button.dropdown-trigger').exists()).toBe(true)
    expect(wrapper.findAll('.dropdown-panel a').length).toBe(6)
    wrapper.unmount()
  })

  it('starts closed (panel hidden)', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const panel = wrapper.find('.dropdown-panel')
    expect(panel.classes()).toContain('hidden')
    expect(panel.classes()).not.toContain('flex')
    wrapper.unmount()
  })

  it('opens on trigger click', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    await wrapper.find('button.dropdown-trigger').trigger('click')
    const panel = wrapper.find('.dropdown-panel')
    expect(panel.classes()).toContain('flex')
    expect(panel.classes()).not.toContain('hidden')
    wrapper.unmount()
  })

  it('toggles closed when opened again', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const trigger = wrapper.find('button.dropdown-trigger')
    await trigger.trigger('click')
    expect(wrapper.find('.dropdown-panel').classes()).toContain('flex')
    await trigger.trigger('click')
    expect(wrapper.find('.dropdown-panel').classes()).toContain('hidden')
    wrapper.unmount()
  })

  it('closes when clicking outside the dropdown', async () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    // Open
    await wrapper.find('button.dropdown-trigger').trigger('click')
    expect(wrapper.find('.dropdown-panel').classes()).toContain('flex')
    // Click outside
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown-panel').classes()).toContain('hidden')
    wrapper.unmount()
  })

  it('uses real anchor tags with the expected hrefs', () => {
    const wrapper = mount(AboutDropdown, { attachTo: document.body })
    const hrefs = wrapper.findAll('.dropdown-panel a').map(a => a.attributes('href'))
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
