/**
 * The canonical host registry — the ONE machine-readable list of the
 * public OIML SMART properties. It moved into this repository when the
 * site-shell package went machinery-only (0.2.0, TODO.public track 02):
 * the footer's "The sites" column renders from it (via the footer
 * config), and the freshness sentinel's cross-host leg imports it
 * (scripts/check-host-registry.mjs), so a host added here is probed
 * with no second list to drift.
 */
export interface HostEntry {
  /** The stable key (the sentinel's log label). */
  key: string
  /** The host's public URL. */
  url: string
  /** The footer's display label. */
  label: string
  /** What the host is, one line. */
  desc: string
}

export const HOST_REGISTRY: readonly HostEntry[] = [
  {
    key: 'www',
    url: 'https://www.oimlsmart.org',
    label: 'Public site',
    desc: 'The public site',
  },
  {
    key: 'platform',
    url: 'https://platform.oimlsmart.org',
    label: 'Platform',
    desc: 'The production OIML-CS SMART platform',
  },
  {
    key: 'demo',
    url: 'https://demo.oimlsmart.org',
    label: 'Demo',
    desc: 'The public demo instance',
  },
  {
    key: 'id',
    url: 'https://id.oimlsmart.org',
    label: 'Identity',
    desc: 'The identity service',
  },
  {
    key: 'status',
    url: 'https://status.oimlsmart.org',
    label: 'Status',
    desc: 'The status page',
  },
  {
    key: 'ommisa',
    url: 'https://www.ommisa.org',
    label: 'Ommisa',
    desc: 'The OIML SMART assistant',
  },
  {
    key: 'primmel',
    url: 'https://www.primmel.org',
    label: 'Primmel',
    desc: 'The Primmel language site and specification',
  },
  {
    key: 'studio',
    url: 'https://www.oimlsmart.org/studio/',
    label: 'Studio',
    desc: 'The studio minisite',
  },
]
