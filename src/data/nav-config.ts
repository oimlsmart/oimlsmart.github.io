/**
 * The www nav model — the ordered items the house shell's header, the
 * mobile overlay, and the footer's Explore column render (one model,
 * injected through Base's `nav` prop, TODO.public track 02). It moved
 * into this repository when the site-shell package went machinery-only
 * (0.2.0): it was the package's src/data/nav-config.ts, reshaped to the
 * package's NavModel contract. The shell's reference copy lives at
 * presets/www/nav-config.mjs; this file is www's home copy. The file is
 * data-only: the active-path predicates ship with the package's config
 * contract (@oimlsmart/site-shell/config), never from here.
 *
 * The top level is deliberately narrow (the owner's directive: the nav
 * was too wide). The pre-0.2.0 header carried ten top-level entries —
 * the SMART and SMART+ tier dropdowns, the four first-class section
 * links, Resources, News, About, and Internal. They consolidate to
 * five without losing a destination:
 *
 *   1. Components  — the SMART tier's entries followed by the SMART+
 *                    tier's, straight from the ONE component registry
 *                    (components.ts). SMART Recommendations stays the
 *                    first link — R 60's primacy in any standards
 *                    listing is doctrine.
 *   2. Discover    — the four first-class sections in their original
 *                    order, joined by News (moved up from its spot
 *                    between Resources and About).
 *   3. Resources   — unchanged.
 *   4. About       — unchanged.
 *   5. Internal    — unchanged, still the amber member-only variant.
 *
 * Every href of the old model remains reachable from the nav; the
 * contract test pins that against the page routes.
 *
 * Hrefs stay relative where they are this site's routes (or a sibling
 * deployment's route on the same front door); `origin` absolutizes
 * them at render, so the chrome's links resolve from any host
 * (ADR-0003). Links flagged `external` render as written.
 */
import type { NavDropdownConfig, NavLink, NavModel } from '@oimlsmart/site-shell/config'
import type { SmartComponent } from './components.ts'
import { SMART_COMPONENTS, SMARTPLUS_COMPONENTS } from './components.ts'
import { SITE } from './site-meta.ts'

// The two relative imports above carry explicit .ts extensions on
// purpose (the only such imports in src/data): the nav completeness
// gate (scripts/check-nav.mjs, via the shell's check-nav) loads this
// file under plain node's type stripping, which resolves relative
// specifiers literally — the extensionless house style would 404 it.
// The same constraint keeps this module data-only: the active-path
// predicates stay in the package (@oimlsmart/site-shell/config), and
// re-exporting them here would drag the package's TypeScript source
// into a plain-node load, which node refuses to strip under
// node_modules.

const componentLink = (c: SmartComponent): NavLink => ({ label: c.name, href: c.href, desc: c.desc })

/** The components of both tiers, SMART first (R 60's primacy). */
export const COMPONENTS_DROPDOWN: NavDropdownConfig = {
  id: 'components',
  label: 'Components',
  variant: 'default',
  links: [
    ...SMART_COMPONENTS.map(componentLink),
    ...SMARTPLUS_COMPONENTS.map(componentLink),
  ],
}

/** The public story's role-first sections, News alongside them. */
export const DISCOVER_DROPDOWN: NavDropdownConfig = {
  id: 'discover',
  label: 'Discover',
  variant: 'default',
  links: [
    { label: 'Audiences', href: '/audiences/', desc: 'Who OIML SMART is for' },
    { label: 'Technologies', href: '/technologies/', desc: 'The technologies behind SMART' },
    { label: 'Use Cases', href: '/use-cases/', desc: 'The stories, walked end to end' },
    { label: 'Services', href: '/services/', desc: 'The services the program runs' },
    { label: 'News', href: '/news/', desc: 'Pilot updates and working notes' },
  ],
}

export const RESOURCES_DROPDOWN: NavDropdownConfig = {
  id: 'resources',
  label: 'Resources',
  variant: 'default',
  links: [
    // Internal routes — served by this site (the component minisites
    // live in the Components dropdown — one href, one home). The
    // resolutions entry lands on the minisite's language root: its own
    // /resolutions/ root is a meta-refresh language stub, which the
    // completeness gate (check:nav) fails on principle — the nav points
    // at the page a visitor actually reads.
    { label: 'Document Library', href: '/library/', desc: 'Structured OIML document library' },
    { label: 'Publications', href: '/publications/', desc: 'The full OIML publications archive' },
    { label: 'Resolutions', href: '/resolutions/en/', desc: 'CIML resolutions and council decisions' },
    { label: 'Certificate Corpus', href: '/certificates/', desc: 'Every OIML-CS certificate, browsable and digitalized' },
    { label: 'Ontology', href: '/ontology/', desc: 'Semantic model: classes, properties, individuals' },
    { label: 'Learn', href: '/learn/', desc: 'The layered curriculum, tiers 0–5' },
    { label: 'Developer Docs', href: '/docs/', desc: 'Guides, architecture, specifications' },
    { label: 'The OIML SMART Program', href: '/programs/oiml-smart', desc: 'The program overview' },
    { label: 'Component Architecture', href: '/architecture', desc: 'The repos, the SSOT flow, the gates' },
    { label: 'The Docs Federation', href: 'https://www.primmel.org/primmel-smart-docs/', desc: 'The platform volumes — foundation to classroom', external: true },
  ],
}

export const ABOUT_DROPDOWN: NavDropdownConfig = {
  id: 'about',
  label: 'About',
  variant: 'default',
  links: [
    { label: 'What is OIML SMART?', href: '/about/what-is-smart' },
    { label: 'Who it is for', href: '/about/audiences' },
    { label: 'Why SMART', href: '/about/why-smart' },
    { label: 'How It Works', href: '/about/how-it-works' },
    { label: 'Technology', href: '/about/technology' },
    { label: 'Contact', href: '/about/contact' },
    { label: 'Branding', href: '/about/branding' },
  ],
}

export const INTERNAL_DROPDOWN: NavDropdownConfig = {
  id: 'internal',
  label: 'Internal',
  variant: 'internal',
  sectionHeader: 'OIML internal use only',
  links: [
    { label: 'Concepts Management', href: '/concepts-management/', desc: 'Term-usage registry', badge: 'internal' },
  ],
}

export const NAV_MODEL: NavModel = {
  // Front-door absolute at render (ADR-0003): the chrome's links
  // resolve from any minisite origin.
  origin: SITE.url,
  items: [
    { type: 'dropdown', config: COMPONENTS_DROPDOWN },
    { type: 'dropdown', config: DISCOVER_DROPDOWN },
    { type: 'dropdown', config: RESOURCES_DROPDOWN },
    { type: 'dropdown', config: ABOUT_DROPDOWN },
    { type: 'dropdown', config: INTERNAL_DROPDOWN },
  ],
}
