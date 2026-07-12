import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InternalToolsDropdown from './InternalToolsDropdown.vue'

describe('InternalToolsDropdown (deprecated facade → NavDropdown)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts and renders the Internal trigger button', () => {
    const wrapper = mount(InternalToolsDropdown)
    const trigger = wrapper.find('[data-testid="nav-dropdown-internal"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toContain('Internal')
  })

  it('shows the internal-only header in the dropdown panel', () => {
    const wrapper = mount(InternalToolsDropdown)
    expect(wrapper.text()).toContain('OIML internal use only')
  })

  it('links to concepts-management', () => {
    const wrapper = mount(InternalToolsDropdown)
    const link = wrapper.find('a[href="/concepts-management/"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Concepts Management')
  })

  it('each link has an [internal] chip', () => {
    const wrapper = mount(InternalToolsDropdown)
    const chips = wrapper.findAll('span')
    const internalChips = chips.filter(s => s.text().toLowerCase() === 'internal')
    expect(internalChips.length).toBeGreaterThanOrEqual(1)
  })

  it('trigger has aria-expanded attribute', () => {
    const wrapper = mount(InternalToolsDropdown)
    const trigger = wrapper.find('[data-testid="nav-dropdown-internal"]')
    expect(trigger.attributes('aria-expanded')).toBeDefined()
  })
})
