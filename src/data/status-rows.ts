// ─────────────────────────────────────────────────────────────────────
// status-rows.ts — the probe rows the status service
// (status.oimlsmart.org) publishes, one entry per row, with the
// DECLARED objectives from the status page's "Objectives vs reality"
// table. Service pages (TODO.promotion/04) quote their row from here
// and link the status page for the live actuals — the per-minute probe
// numbers are never copied onto a static page.
//
// Verified 2026-08-29 against https://status.oimlsmart.org/ (the live
// page's cards + the declared-objectives table; all rows "Operational").
// ─────────────────────────────────────────────────────────────────────

export interface StatusProbeRow {
  readonly id: string
  /** The row name exactly as published on status.oimlsmart.org. */
  readonly name: string
  /** What the probe asserts (the status page's own description). */
  readonly desc: string
  /** The declared availability objective. */
  readonly availability: string
  /** The declared latency objective. */
  readonly latency: string
}

export const STATUS_ROWS: readonly StatusProbeRow[] = [
  {
    id: 'identity-op-discovery',
    name: 'Identity: OP discovery',
    desc: 'The OpenID Provider metadata document. Every relying party resolves sign-in through it.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 1.5 s',
  },
  {
    id: 'identity-sign-in',
    name: 'Identity: sign-in page',
    desc: 'The estate single sign-on page, asserted to carry its interactive island, not just any 200.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'platform-hub',
    name: 'Platform hub',
    desc: 'The production certification hub at platform.oimlsmart.org.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'demo-instance',
    name: 'Demo instance',
    desc: 'The public demo hub at demo.oimlsmart.org (the demo cast, the nightly reset).',
    availability: '99.5% / 30d',
    latency: 'p95 ≤ 2.5 s',
  },
  {
    id: 'nmi-instance',
    name: 'NMI instance',
    desc: 'The ia+tl profile instance at nmi.oimlsmart.org.',
    availability: '99.5% / 30d',
    latency: 'p95 ≤ 2.5 s',
  },
  {
    id: 'tl-instance',
    name: 'TL instance',
    desc: 'The tl profile instance at tl.oimlsmart.org.',
    availability: '99.5% / 30d',
    latency: 'p95 ≤ 2.5 s',
  },
  {
    id: 'ai-service',
    name: 'OIML SMART AI',
    desc: 'The estate AI assistant over the OIML library, at ai.oimlsmart.org.',
    availability: '99.5% / 30d',
    latency: 'p95 ≤ 3 s',
  },
  {
    id: 'public-site',
    name: 'Public site',
    desc: 'The estate front door at www.oimlsmart.org.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'vocab-surface',
    name: 'Vocabulary surface',
    desc: 'The OIML Complete Vocabulary at www.oimlsmart.org/vocab/.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'studio-viewer',
    name: 'Studio viewer',
    desc: 'The SMART Studio viewer at www.oimlsmart.org/studio/view/.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'cnml-docs',
    name: 'CNML docs',
    desc: 'The CNML documentation surface at www.oimlsmart.org/cnml/.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
  {
    id: 'concepts-management',
    name: 'Concepts management (G 18)',
    desc: 'The G 18 term-usage registry at www.oimlsmart.org/concepts-management/.',
    availability: '99.9% / 30d',
    latency: 'p95 ≤ 2 s',
  },
]

export const STATUS_PAGE = 'https://status.oimlsmart.org/'
