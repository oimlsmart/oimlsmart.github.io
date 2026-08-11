import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavDropdown from './NavDropdown.vue'
import { NAV_DROPDOWNS, NAV_STANDALONE, isLinkActive, isDropdownActive } from '../data/nav-config'

describe('nav-config', () => {
  describe('NAV_DROPDOWNS', () => {
    it('has exactly 5 dropdowns: smart, smartplus, resources, about, internal', () => {
      const ids = NAV_DROPDOWNS.map(d => d.id)
      expect(ids).toEqual(['smart', 'smartplus', 'resources', 'about', 'internal'])
    })

    it('smart dropdown contains the SMART-tier components in order', () => {
      const smart = NAV_DROPDOWNS.find(d => d.id === 'smart')!
      const hrefs = smart.links.map(l => l.href)
      expect(hrefs).toEqual([
        '/recs',
        '/vocab',
        '/publications',
        '/studio',
        '/cnml',
        '/smart',
        '/platform',
      ])
    })

    it('smartplus dropdown contains the SMART+-tier components in order', () => {
      const smartplus = NAV_DROPDOWNS.find(d => d.id === 'smartplus')!
      const hrefs = smartplus.links.map(l => l.href)
      expect(hrefs).toEqual([
        '/cnml',
        '/smi',
        '/sst',
        '/smart',
        '/platform',
      ])
    })

    it('resources dropdown contains expected links in correct order', () => {
      const resources = NAV_DROPDOWNS.find(d => d.id === 'resources')!
      const labels = resources.links.map(l => l.label)
      expect(labels).toEqual(['Document Library', 'Publications', 'Resolutions', 'Certificate Corpus', 'Ontology', 'Learn', 'Developer Docs', 'The OIML SMART Program', 'Component Architecture', 'The Docs Federation'])
    })

    it('internal dropdown has variant "internal"', () => {
      const internal = NAV_DROPDOWNS.find(d => d.id === 'internal')!
      expect(internal.variant).toBe('internal')
    })

    it('every dropdown has at least one link', () => {
      for (const d of NAV_DROPDOWNS) {
        expect(d.links.length).toBeGreaterThan(0)
      }
    })
  })

  describe('NAV_STANDALONE', () => {
    it('is empty (the OIML-CS standalone folded into the /smart component)', () => {
      expect(NAV_STANDALONE).toEqual([])
    })
  })

  describe('isLinkActive', () => {
    it('matches exact path', () => {
      expect(isLinkActive('/oiml-cs', '/oiml-cs')).toBe(true)
    })

    it('matches path prefix for section links', () => {
      expect(isLinkActive('/library/', '/library/r60')).toBe(true)
      expect(isLinkActive('/docs/', '/docs/guides/getting-started')).toBe(true)
    })

    it('does not match unrelated paths', () => {
      expect(isLinkActive('/library/', '/docs/')).toBe(false)
    })

    it('root path only matches root', () => {
      expect(isLinkActive('/', '/')).toBe(true)
      expect(isLinkActive('/', '/other')).toBe(false)
    })
  })

  describe('isDropdownActive', () => {
    it('returns true when any link matches', () => {
      const resources = NAV_DROPDOWNS.find(d => d.id === 'resources')!
      expect(isDropdownActive(resources, '/docs/guides')).toBe(true)
      expect(isDropdownActive(resources, '/library/r60')).toBe(true)
    })

    it('returns false when no link matches', () => {
      const resources = NAV_DROPDOWNS.find(d => d.id === 'resources')!
      expect(isDropdownActive(resources, '/about/')).toBe(false)
    })
  })
})

describe('NavDropdown', () => {
  const resourcesConfig = NAV_DROPDOWNS.find(d => d.id === 'resources')!

  it('mounts with a testid based on config id', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: resourcesConfig, currentPath: '/' },
    })
    expect(wrapper.find('[data-testid="nav-dropdown-resources"]').exists()).toBe(true)
  })

  it('renders the config label', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: resourcesConfig, currentPath: '/' },
    })
    expect(wrapper.text()).toContain('Resources')
  })

  it('renders all links from config', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: resourcesConfig, currentPath: '/' },
    })
    for (const link of resourcesConfig.links) {
      expect(wrapper.find(`a[href="${link.href}"]`).exists()).toBe(true)
    }
  })

  it('internal variant renders section header', () => {
    const internalConfig = NAV_DROPDOWNS.find(d => d.id === 'internal')!
    const wrapper = mount(NavDropdown, {
      props: { config: internalConfig, currentPath: '/' },
    })
    expect(wrapper.text()).toContain('OIML internal use only')
  })

  it('internal variant renders internal badge on badged links', () => {
    const internalConfig = NAV_DROPDOWNS.find(d => d.id === 'internal')!
    const wrapper = mount(NavDropdown, {
      props: { config: internalConfig, currentPath: '/' },
    })
    expect(wrapper.text()).toContain('internal')
  })

  it('trigger has aria-expanded attribute', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: resourcesConfig, currentPath: '/' },
    })
    const trigger = wrapper.find('[data-testid="nav-dropdown-resources"]')
    expect(trigger.attributes('aria-expanded')).toBeDefined()
  })

  it('shows active styling when current path matches a link', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: resourcesConfig, currentPath: '/docs/guides/getting-started' },
    })
    const trigger = wrapper.find('[data-testid="nav-dropdown-resources"]')
    expect(trigger.classes()).toContain('text-accent')
  })
})
