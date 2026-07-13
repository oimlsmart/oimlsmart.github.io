export type NavBadge = 'internal' | 'new'

export interface NavLink {
  readonly label: string
  readonly href: string
  readonly desc?: string
  readonly badge?: NavBadge
}

export interface NavDropdownConfig {
  readonly id: string
  readonly label: string
  readonly variant: 'default' | 'internal'
  readonly sectionHeader?: string
  readonly links: readonly NavLink[]
}

export interface NavStandaloneLink {
  readonly label: string
  readonly href: string
  readonly matchPrefix: string
}

export const NAV_DROPDOWNS: readonly NavDropdownConfig[] = [
  {
    id: 'resources',
    label: 'Resources',
    variant: 'default',
    links: [
      { label: 'Recommendations', href: '/recommendations/', desc: 'SMART-modeled OIML Recommendations' },
      { label: 'Library', href: '/library/', desc: 'Structured OIML document library' },
      { label: 'Vocabularies', href: '/vocabularies/', desc: 'OIML terminology and concept browser' },
      { label: 'Developer Docs', href: '/docs/', desc: 'Guides, architecture, specifications' },
    ],
  },
  {
    id: 'about',
    label: 'About',
    variant: 'default',
    links: [
      { label: 'What is OIML SMART?', href: '/about/what-is-smart' },
      { label: 'Why SMART', href: '/about/why-smart' },
      { label: 'How It Works', href: '/about/how-it-works' },
      { label: 'Technology', href: '/about/technology' },
      { label: 'Contact', href: '/about/contact' },
      { label: 'Branding', href: '/about/branding' },
    ],
  },
  {
    id: 'internal',
    label: 'Internal',
    variant: 'internal',
    sectionHeader: 'OIML internal use only',
    links: [
      { label: 'Concepts Management', href: '/concepts-management/', desc: 'Term-usage registry', badge: 'internal' },
    ],
  },
] as const

export type NavItem =
  | { type: 'dropdown'; config: NavDropdownConfig }
  | { type: 'link'; label: string; href: string; matchPrefix: string }

export const NAV_ITEMS: readonly NavItem[] = [
  { type: 'dropdown', config: NAV_DROPDOWNS.find(d => d.id === 'resources')! },
  { type: 'link', label: 'News', href: '/news/', matchPrefix: '/news' },
  { type: 'link', label: 'OIML-CS', href: '/oiml-cs', matchPrefix: '/oiml-cs' },
  { type: 'dropdown', config: NAV_DROPDOWNS.find(d => d.id === 'about')! },
  { type: 'dropdown', config: NAV_DROPDOWNS.find(d => d.id === 'internal')! },
]

export const NAV_STANDALONE: readonly NavStandaloneLink[] = [
  { label: 'OIML-CS', href: '/oiml-cs', matchPrefix: '/oiml-cs' },
] as const

export function isLinkActive(href: string, currentPath: string): boolean {
  const normalized = href.replace(/\/$/, '')
  if (normalized === '') return currentPath === '/'
  return currentPath === href || currentPath.startsWith(href.endsWith('/') ? href : href + '/')
}

export function isDropdownActive(dropdown: NavDropdownConfig, currentPath: string): boolean {
  return dropdown.links.some(link => isLinkActive(link.href, currentPath))
}
