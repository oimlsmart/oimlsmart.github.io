// ─────────────────────────────────────────────────────────────────────
// entitlement-matrix.ts — the ONE source for the service-entitlement
// matrix (TODO.promotion/09): which services each member category may
// USE on the hosted estate and which they may RUN themselves. Every
// page that answers the entitlement question renders or quotes from
// here — never a hand-copied table that drifts.
//
// The determination rules are the program owner's verbatim policy
// (2026-08-29, TODO.promotion/09 in oimlsmart/smart):
//   - EVERYONE gets an account on the estate.
//   - The identity service software may be self-hosted by any member
//     (and, the repo being public, inspected by any organization).
//   - The SMART Platform self-deploy entitlement attaches to the
//     MEMBER STATE; an IA/TL operates its own instance UNDER its
//     proposing member state's entitlement. Member States receive
//     streaming updates (the rolling channel the deployment runbook
//     names).
//   - The hosted OIML-CS SMART Platform is used by Member States AND
//     Corresponding Members alike — the hosted path never requires
//     the self-host entitlement.
//
// Cells marked `proposed` are the coordinator's extrapolation, NOT
// yet policy — the renderer badges them "proposed".
//
// Verification (2026-08-29): every href below was probed live (HTTP
// 200); the self-host runbooks exist (identity repo
// docs/deployment/identity-self-host.md; smart repo
// docs/deployment/); every repo in SOFTWARE_REPOS was checked for a
// LICENSE — see the per-repo `license` notes.
// ─────────────────────────────────────────────────────────────────────

/** The marks a cell can carry (the legend the renderer shows). */
export type EntitlementMark = 'use' | 'self-host' | 'streaming' | 'upsell'

export interface EntitlementCell {
  /** The entitlement marks; empty + no note = not available ('—'). */
  readonly marks: readonly EntitlementMark[]
  /** Plain-language qualifier, e.g. 'join flow', 'their consoles'. */
  readonly note?: string
  /** Coordinator's extrapolation — NOT yet owner-confirmed policy. */
  readonly proposed?: boolean
  /** Whole cell is a roadmap statement (the future tier). */
  readonly roadmap?: boolean
}

export const MEMBER_CATEGORIES = [
  { id: 'member-state', label: 'Member State' },
  { id: 'corresponding-member', label: 'Corresponding Member' },
  { id: 'ia-tl', label: 'Issuing Authority / Test Laboratory (of a Member State)' },
  { id: 'utilizer-associate', label: 'Utilizer / Associate' },
  { id: 'applicant-public', label: 'Applicant / public' },
] as const

export type MemberCategoryId = (typeof MEMBER_CATEGORIES)[number]['id']

export interface EntitlementService {
  readonly id: string
  readonly name: string
  /** The live surface (probed 2026-08-29) or the site's own page for it. */
  readonly href?: string
  /** What the href is, for the link label — e.g. 'live', 'repo'. */
  readonly hrefLabel?: string
  readonly cells: Readonly<Record<MemberCategoryId, EntitlementCell>>
}

const cell = (
  marks: readonly EntitlementMark[],
  note?: string,
  proposed = false,
): EntitlementCell => ({ marks, note, proposed })

const NONE: EntitlementCell = { marks: [] }
const ROADMAP: EntitlementCell = { marks: [], roadmap: true }

export const ENTITLEMENT_MATRIX: readonly EntitlementService[] = [
  {
    id: 'estate-account',
    name: 'Estate account (the identity service)',
    href: 'https://id.oimlsmart.org',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'join flow'),
    },
  },
  {
    id: 'identity-software',
    name: 'Identity service software',
    href: 'https://github.com/oimlsmart/identity',
    hrefLabel: 'repo',
    cells: {
      'member-state': cell(['use', 'self-host', 'streaming']),
      'corresponding-member': cell(['use', 'self-host']),
      'ia-tl': cell([], 'operates under its Member State'),
      'utilizer-associate': NONE,
      // The policy says "open source"; the repo is public but carries
      // no license yet — see SOFTWARE_REPOS. Honest wording until the
      // license lands.
      'applicant-public': cell([], 'source available — license pending'),
    },
  },
  {
    id: 'cs-smart-platform',
    name: 'OIML-CS SMART Platform (cloud)',
    href: '/smart',
    hrefLabel: 'component page',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use'], 'their consoles'),
      'utilizer-associate': cell(['use'], 'designated access'),
      'applicant-public': cell(['use'], 'applicant portal'),
    },
  },
  {
    id: 'smart-platform-software',
    name: 'SMART Platform software (self-host)',
    // oimlsmart/smart is private during the pilot — cited, never linked.
    cells: {
      'member-state': cell(['self-host', 'streaming']),
      'corresponding-member': cell(['upsell'], 'available on ratification'),
      'ia-tl': cell([], 'operates under its Member State’s 🏠'),
      'utilizer-associate': NONE,
      'applicant-public': NONE,
    },
  },
  {
    id: 'demo-instance',
    name: 'The demo instance',
    href: 'https://demo.oimlsmart.org',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'public sandbox'),
    },
  },
  {
    id: 'studio-viewer',
    name: 'The Studio viewer',
    href: '/studio',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'public'),
    },
  },
  {
    id: 'vocab',
    name: 'The Vocabulary',
    href: '/vocab',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'public'),
    },
  },
  {
    id: 'status-service',
    name: 'The status service',
    href: 'https://status.oimlsmart.org',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'public'),
    },
  },
  {
    id: 'ai-service',
    name: 'The AI service',
    href: 'https://ai.oimlsmart.org',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use'], 'member tier'),
      'corresponding-member': cell(['use'], 'member tier'),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use'], 'per designation'),
      'applicant-public': NONE,
    },
  },
  {
    id: 'smart-recs',
    name: 'SMART Recommendations content',
    href: '/recs',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use']),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use']),
      'utilizer-associate': cell(['use']),
      'applicant-public': cell(['use'], 'published'),
    },
  },
  {
    id: 'trust-registry',
    name: 'The trust registry (organization keys)',
    href: 'https://id.oimlsmart.org',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use'], 'registers'),
      'corresponding-member': cell(['use']),
      'ia-tl': cell(['use'], 'their organization keys'),
      'utilizer-associate': cell(['use']),
      'applicant-public': NONE,
    },
  },
  {
    id: 'sst-simulation',
    name: 'The SST simulation',
    href: '/sst',
    hrefLabel: 'live',
    cells: {
      'member-state': cell(['use', 'self-host'], undefined, true),
      'corresponding-member': cell(['use'], 'hosted', true),
      'ia-tl': cell(['use']),
      'utilizer-associate': NONE,
      'applicant-public': NONE,
    },
  },
  {
    id: 'smart-twin',
    name: 'The SMART Twin (SMART+)',
    href: '/platform',
    hrefLabel: 'tier overview',
    cells: {
      'member-state': ROADMAP,
      'corresponding-member': ROADMAP,
      'ia-tl': ROADMAP,
      'utilizer-associate': ROADMAP,
      'applicant-public': ROADMAP,
    },
  },
]

/** The legend, rendered with the matrix. */
export const ENTITLEMENT_LEGEND = [
  { mark: 'use', glyph: '✅', label: 'Use — hosted, on the official estate' },
  { mark: 'self-host', glyph: '🏠', label: 'Self-host — on-prem/cloud, under the category’s own entitlement' },
  { mark: 'streaming', glyph: '🔄', label: 'Streaming updates — the rolling channel the deployment runbook names' },
  { mark: 'upsell', glyph: '⬆️', label: 'The upsell note — see the narratives below the matrix' },
] as const

/** The three upsell narratives (TODO.promotion/09 — honest, never pushy). */
export const UPSELL_NARRATIVES = [
  {
    id: 'cm-to-ms',
    title: 'Corresponding Member → Member State',
    body: 'Ratifying the OIML Convention unlocks the self-host entitlement (your own platform, your own data residency, the streaming update channel), the right to propose Issuing Authorities (a Corresponding Member designates Associates; a Member State proposes the bodies that issue), and voting participation. Membership is governed by the OIML Convention itself — the platform never sells what the Convention governs.',
    href: 'https://www.oiml.org/en/structure/members',
    hrefLabel: 'OIML membership',
  },
  {
    id: 'body-to-ms',
    title: 'A body asks: can we self-host?',
    body: 'The honest answer: the entitlement is your Member State’s. An Issuing Authority or Test Laboratory operates its own instance under its proposing Member State’s entitlement — the Member State is the entitled party; the body operates. The IA-only, TL-only, and IA+TL postures exist exactly for this, and the platform’s federation means your instance talks to the OIML-CS platform either way.',
  },
  {
    id: 'utilizer-associate',
    title: 'Utilizer / Associate → fuller participation',
    body: 'Designated-body access is real access: the evaluation-report and certificate surfaces open per the designation your designating member grants. Talk to your designating Member State or Corresponding Member about what your designation opens.',
  },
] as const

/**
 * The software-availability facts (checked 2026-08-29 against each
 * repo's LICENSE). The rule (TODO.promotion/09): never claim "open
 * source" where the repo carries no license — where absent, the honest
 * wording is "source available to members" (private repos) or "source
 * available, license pending" (public repos).
 */
export const SOFTWARE_REPOS = [
  {
    repo: 'oimlsmart/identity',
    ships: 'the identity service software',
    visibility: 'public' as const,
    license: 'none yet — source available, open-source license pending',
    href: 'https://github.com/oimlsmart/identity',
  },
  {
    repo: 'oimlsmart/smart',
    ships: 'the SMART Platform (workflow engine + certificate PKI)',
    visibility: 'private' as const,
    license: 'none — source available to members',
  },
  {
    repo: 'oimlsmart/platform-server',
    ships: 'the shared server kernel',
    visibility: 'private' as const,
    license: 'none — source available to members',
  },
  {
    repo: 'primmel/editor',
    ships: 'the Studio authoring surface',
    visibility: 'public' as const,
    license: 'none yet — source available, license pending',
    href: 'https://github.com/primmel/editor',
  },
  {
    repo: 'oimlsmart/status',
    ships: 'the status service',
    visibility: 'private' as const,
    license: 'none — source available to members',
  },
  {
    repo: 'oimlsmart/site-shell',
    ships: 'the shared site shell (header, footer, tokens)',
    visibility: 'public' as const,
    license: 'none yet — source available, license pending',
    href: 'https://github.com/oimlsmart/site-shell',
  },
]
