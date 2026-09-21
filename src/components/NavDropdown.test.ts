import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NavDropdown from './NavDropdown.vue'
import {
  NAV_MODEL,
  RESOURCES_DROPDOWN,
  INTERNAL_DROPDOWN,
} from '../data/nav-config'
import { isLinkActive, isDropdownActive } from '@oimlsmart/site-shell/config'

const ORIGIN = NAV_MODEL.origin ?? ''
// The 0.2.0 shell resolves internal hrefs against the nav model's
// origin at render (ADR-0003); external links render as written.
const expectedHref = (link: { href: string; external?: boolean }) =>
  link.external ? link.href : `${ORIGIN}${link.href}`

describe('nav model', () => {
  it('carries exactly the five consolidated dropdowns', () => {
    const ids = NAV_MODEL.items.map(i => (i.type === 'dropdown' ? i.config.id : i.label))
    expect(ids).toEqual(['components', 'discover', 'resources', 'about', 'internal'])
  })

  it('components dropdown carries the SMART tier then the SMART+ tier (R 60 first)', () => {
    const components = NAV_MODEL.items.find(i => i.type === 'dropdown' && i.config.id === 'components')!
    if (components.type !== 'dropdown') throw new Error('unreachable')
    const hrefs = components.config.links.map(l => l.href)
    expect(hrefs).toEqual([
      // SMART tier: the published artifacts + the Type-approval level.
      '/recs',
      '/vocab',
      '/publications',
      '/studio',
      '/cnml',
      '/smart',
      '/platform',
      // SMART+ tier: the full Type-instance + measurement lifecycle.
      '/cnml',
      '/smi',
      '/sst',
      '/smart',
      '/platform',
    ])
    // R 60's primacy: the pilot reference Recommendation is the first
    // link the dropdown offers.
    expect(components.config.links[0].label).toBe('SMART Recommendations')
  })

  it('resources dropdown contains expected links in correct order', () => {
    const labels = RESOURCES_DROPDOWN.links.map(l => l.label)
    expect(labels).toEqual(['Document Library', 'Publications', 'Resolutions', 'Certificate Corpus', 'Ontology', 'Learn', 'Developer Docs', 'The OIML SMART Program', 'Component Architecture', 'The Docs Federation'])
  })

  it('internal dropdown has variant "internal"', () => {
    expect(INTERNAL_DROPDOWN.variant).toBe('internal')
  })

  it('every dropdown has at least one link', () => {
    for (const item of NAV_MODEL.items) {
      if (item.type === 'dropdown') expect(item.config.links.length).toBeGreaterThan(0)
    }
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
      expect(isDropdownActive(RESOURCES_DROPDOWN, '/docs/guides')).toBe(true)
      expect(isDropdownActive(RESOURCES_DROPDOWN, '/library/r60')).toBe(true)
    })

    it('returns false when no link matches', () => {
      expect(isDropdownActive(RESOURCES_DROPDOWN, '/about/')).toBe(false)
    })
  })
})

describe('NavDropdown', () => {
  it('mounts with a testid based on config id', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    expect(wrapper.find('[data-testid="nav-dropdown-resources"]').exists()).toBe(true)
  })

  it('renders the config label', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    expect(wrapper.text()).toContain('Resources')
  })

  it('renders all links from config', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    for (const link of RESOURCES_DROPDOWN.links) {
      // Internal links render front-door absolute (ADR-0003: the chrome
      // must resolve from any minisite origin); external links as given.
      expect(wrapper.find(`a[href="${expectedHref(link)}"]`).exists()).toBe(true)
    }
  })

  it('renders labels only — no link desc reaches the menu', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    expect(wrapper.text()).toContain('Document Library')
    expect(wrapper.text()).not.toContain('Structured OIML document library')
  })

  it('internal variant renders section header', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: INTERNAL_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    expect(wrapper.text()).toContain('OIML internal use only')
  })

  it('internal variant renders internal badge on badged links', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: INTERNAL_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    expect(wrapper.text()).toContain('internal')
  })

  it('trigger has aria-expanded attribute', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/', origin: ORIGIN },
    })
    const trigger = wrapper.find('[data-testid="nav-dropdown-resources"]')
    expect(trigger.attributes('aria-expanded')).toBeDefined()
  })

  it('shows active styling when current path matches a link', () => {
    const wrapper = mount(NavDropdown, {
      props: { config: RESOURCES_DROPDOWN, currentPath: '/docs/guides/getting-started', origin: ORIGIN },
    })
    const trigger = wrapper.find('[data-testid="nav-dropdown-resources"]')
    expect(trigger.classes()).toContain('text-accent')
  })
})
