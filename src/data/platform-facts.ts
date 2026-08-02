// ─────────────────────────────────────────────────────────────────────
// platform-facts.ts — the single home for every claim this site makes
// about the live platform (TODO.integration/26). Pages render FROM
// here; the freshness gate (src/platform-freshness.test.ts) pins these
// values against the SSOT architecture doc
// (smart/docs/architecture/for-agents.md). A number that drifts fails
// the gate — the site can never go stale silently.
// ─────────────────────────────────────────────────────────────────────

/** Gate numbers as stated by the SSOT architecture doc (for-agents.md). */
export const GATE_NUMBERS = {
  packages: 28,
  vitestTests: 4070,
  vitestFiles: 240,
  e2e: '60/60',
  validateErrors: 0,
  validateWarnings: 488,
  kernel: '1062/1062',
  sim: '254/254',
} as const

/** The repositories the platform spans (for-agents.md "The repositories"). */
export interface PlatformRepo {
  readonly repo: string
  readonly role: string
  /** Public repos get links; private ones are cited as text only. */
  readonly href?: string
}

export const PLATFORM_REPOS: readonly PlatformRepo[] = [
  { repo: 'oimlsmart/smart', role: 'the platform: Primmel packages (SSOT), generated data trees, the app, the pipelines (private — cited, never linked)' },
  { repo: 'primmel/primmel-ts', role: 'the kernel: parser, linter (C1–C99), coverage calculus, diff', href: 'https://github.com/primmel/primmel-ts' },
  { repo: 'primmel/sst', role: 'the SST framework: kind-agnostic runtime, shell, bench, specs', href: 'https://github.com/primmel/sst' },
  { repo: 'oimlsmart/sst-instruments', role: 'the OIML instrument library for the SST (kinds, instances, the composite)', href: 'https://github.com/oimlsmart/sst-instruments' },
  { repo: 'oimlsmart/cnml', role: 'the OIML CNML project: the certificate format on Confium Mode 3', href: 'https://github.com/oimlsmart/cnml' },
  {
    repo: 'primmel/primmel-smart-docs',
    role: 'the published docs federation (the volumes, the demo manual)',
    href: 'https://primmel.github.io/primmel-smart-docs/',
  },
  { repo: 'primmel/primmel', role: 'the predecessor language (v2; v3 is a strict superset)' },
  { repo: 'oimlsmart/smart-classroom-r60', role: 'the OIML classroom viewer (private — cited, never linked)' },
]

/** The Recommendations modelled in the program (oiml-r* packages). */
export const PROGRAM_RECS = [
  { id: 'R 60', title: 'Load Cells', note: 'the reference pilot — full twin-cert chain' },
  { id: 'R 91', title: 'Traffic Speed Meters', note: 'preview edition 2025' },
  { id: 'R 129', title: 'Mass Road Vehicles', note: 'multi-dimensional measurement' },
  { id: 'R 144', title: 'Gas Meters', note: 'custody-transfer diaphragm meters' },
] as const

/** The eight words of the modelling basis (the foundation volume). */
export const EIGHT_WORDS = [
  { word: 'is', kind: 'relation', gloss: 'identity — which thing, and what kind of thing' },
  { word: 'has', kind: 'relation', gloss: 'attribution — what the thing holds' },
  { word: 'does', kind: 'relation', gloss: 'behavior — what the thing does' },
  { word: 'object', kind: 'sort', gloss: 'anything identity can individuate' },
  { word: 'property', kind: 'sort', gloss: 'the slot — a dimension of variation' },
  { word: 'value', kind: 'sort', gloss: 'what fills the slot — data or a reference' },
  { word: 'transition', kind: 'sort', gloss: 'input → transform → output' },
  { word: 'process', kind: 'sort', gloss: 'a transition reified as an object' },
] as const

const DOCS = 'https://primmel.github.io/primmel-smart-docs'

/** The docs federation — links only, never duplicated content. */
export const FEDERATION = [
  { volume: 'The foundation', href: `${DOCS}/foundation/`, desc: 'the eight terms and the closure rules, proved' },
  { volume: 'The Primmel kernel', href: `${DOCS}/primmel/`, desc: 'the language surface — subjects, processes, mappings, packages, twins' },
  { volume: 'The platform runtime', href: `${DOCS}/platform/`, desc: 'the SMART platform, the twin lab, projection, the composite twin, CNML' },
  { volume: 'OIML Core', href: `${DOCS}/oiml-core/`, desc: 'the shared measuring-instrument modelling framework' },
  { volume: 'Authoring Recommendations', href: `${DOCS}/oiml-rec/`, desc: 'methodology, subjects, requirements, tests, forms, packaging, walkthroughs' },
  { volume: 'The OIML-CS scheme', href: `${DOCS}/oiml-cs/`, desc: 'the certification system modelled on B 18:2025' },
  { volume: 'CNML certificates', href: `${DOCS}/cnml/`, desc: 'the certificate format the verdict chain issues' },
  { volume: 'Confium', href: `${DOCS}/confium/`, desc: 'the threshold-cryptography PKI the certificates ride' },
  { volume: 'The NMI section', href: `${DOCS}/nmi/`, desc: 'the adoption program for legal-metrology authorities' },
  { volume: 'The classroom', href: `${DOCS}/learn/`, desc: 'the layered curriculum, tiers 0–4' },
  { volume: 'The demo manual', href: `${DOCS}/oiml-rec/13-running-the-demo/`, desc: 'run the full certification chain yourself' },
] as const

/** The three live entry points from the home page. */
export const ENTRY_POINTS = [
  { label: 'The app', href: '/app/', desc: 'the certification workflow, in your browser' },
  { label: 'The docs', href: `${DOCS}/`, desc: 'the volumes — methodology to operator guides', external: true },
  { label: 'The demo', href: `${DOCS}/oiml-rec/13-running-the-demo/`, desc: 'certify a simulated load cell end to end', external: true },
] as const
