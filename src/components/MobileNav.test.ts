import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MobileNav from './MobileNav.vue'
import { NAV_MODEL } from '../data/nav-config'
import { BRAND } from '../data/brand'

// The overlay renders what SiteHeader threads down: the injected nav
// model plus the site's brand (no package-side defaults exist).
function mountNav() {
  return mount(MobileNav, {
    props: {
      items: NAV_MODEL.items,
      origin: NAV_MODEL.origin,
      brandName: BRAND.brandName,
      logoLight: BRAND.logoLight,
      logoDark: BRAND.logoDark,
      homeHref: BRAND.homeHref,
      signInHref: BRAND.signInHref,
    },
  })
}

describe('MobileNav', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  it('renders hamburger trigger button', () => {
    const wrapper = mountNav()
    expect(wrapper.find('button[aria-label="Open menu"]').exists()).toBe(true)
  })

  it('overlay hidden initially', () => {
    const wrapper = mountNav()
    expect(wrapper.find('[aria-label="Close menu"]').exists()).toBe(false)
  })

  it('opens overlay on hamburger click and locks body scroll', async () => {
    const wrapper = mountNav()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    expect(wrapper.find('[aria-label="Close menu"]').exists()).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes overlay on close button click', async () => {
    const wrapper = mountNav()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await wrapper.find('button[aria-label="Close menu"]').trigger('click')
    expect(document.body.style.overflow).toBe('')
  })

  it('shows all nav items when open', async () => {
    const wrapper = mountNav()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    const text = wrapper.text()
    // The six consolidated top-level entries.
    expect(text).toContain('Components')
    expect(text).toContain('Experimental')
    expect(text).toContain('Discover')
    expect(text).toContain('Resources')
    expect(text).toContain('About')
    expect(text).toContain('Internal')
    expect(text).toContain('Sign in')
  })

  it('expands the components section into the SMART tier, R 60 first', async () => {
    const wrapper = mountNav()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    const section = wrapper.findAll('button').find(b => b.text().includes('Components'))
    expect(section).toBeDefined()
    await section!.trigger('click')
    const text = wrapper.text()
    expect(text).toContain('SMART Recommendations')
  })

  it('expands the experimental section into the SMART+ tier', async () => {
    const wrapper = mountNav()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    const section = wrapper.findAll('button').find(b => b.text().includes('Experimental'))
    expect(section).toBeDefined()
    await section!.trigger('click')
    const text = wrapper.text()
    expect(text).toContain('SMI Simulation')
  })
})
