/**
 * Top-level navigation.
 *
 * This is the single source of truth for the site's primary nav.
 * `config.ts` consumes it directly. The About dropdown is MECE —
 * each entry appears once.
 */

import type { NavItem } from '../types'

export const navItems: readonly NavItem[] = [
  { text: 'Recommendations', link: '/recommendations/' },
  { text: 'Documents', link: '/library/' },
  { text: 'Developers', link: '/docs/' },
  { text: 'OIML-CS', link: '/oiml-cs' },
  { text: 'Blog', link: '/blog/' },
  {
    text: 'About',
    items: [
      { text: 'What is OIML SMART?', link: '/about/what-is-smart' },
      { text: 'Why SMART', link: '/about/why-smart' },
      { text: 'How It Works', link: '/about/how-it-works' },
      { text: 'Technology', link: '/about/technology' },
      { text: 'Contact', link: '/about/contact' },
      { text: 'Branding', link: '/about/branding' },
    ],
  },
  { text: 'Enter App ↗', link: '/app/' },
] as const
