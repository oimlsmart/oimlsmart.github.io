/**
 * The www footer config — the content the site injects into the house
 * shell's footer frame (TODO.public track 02; the columns, legal pages,
 * attribution, and copyright were literals inside the shell's
 * SiteFooter.astro until 0.2.0 moved them out). The shape is the
 * package's FooterConfig (@oimlsmart/site-shell/config); the Explore
 * column is NOT here — the footer derives it from the nav model, while
 * the Programme column stays a curated shortlist (ADR-0002's principle,
 * now riding injected config). "Service status" stays in the column:
 * the pre-0.2.0 footer rendered it, and the host-registry's status host
 * is its target.
 */
import type { FooterConfig } from '@oimlsmart/site-shell/config'
import { SITE, LEGAL, PARTNERS, SERVICES } from './site-meta'
import { HOST_REGISTRY } from './host-registry'

export const FOOTER: FooterConfig = {
  origin: SITE.url,
  description:
    'Machine-actionable Recommendations for the International Organization of Legal Metrology.',
  columns: [
    {
      heading: 'Programme',
      links: [
        { label: 'About OIML SMART', href: '/about/what-is-smart' },
        { label: 'Pilot programme', href: '/pilot' },
        { label: 'Contact', href: '/about/contact' },
        { label: 'Service status', href: SERVICES.status },
        { label: 'GitHub', href: PARTNERS.github, external: true, icon: 'github' },
      ],
    },
  ],
  hosts: HOST_REGISTRY.map(h => ({ label: h.label, href: h.url })),
  attribution: [
    'A programme of the ',
    { label: 'International Organization of Legal Metrology', href: PARTNERS.oiml, external: true },
    ', delivered by ',
    { label: 'Ribose', href: PARTNERS.ribose, external: true },
  ],
  legal: [
    { label: 'Privacy', href: LEGAL.privacy },
    { label: 'Terms', href: LEGAL.terms },
  ],
  copyright: 'Content © OIML · Code © Ribose',
}
