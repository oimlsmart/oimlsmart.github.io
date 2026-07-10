// ─────────────────────────────────────────────────────────────────────
// Standards registry — single source of truth for OIML Recommendations
// modeled in this site.
//
// Every page that references a Recommendation (home, library, docs,
// nav links, search) reads from STANDARDS. Adding a new Recommendation
// = appending one entry to this array.
//
// Why centralize:
// - 'OIML-R-60' / 'r60' / 'R 60' / '/recommendations/r60/' were
//   previously scattered across pages. Each was an implicit convention.
// - Type safety: StandardRef enforces that every standard declares
//   every required field. No more half-filled inline objects.
// - Schema validation: tests assert that every STANDARDS entry has a
//   corresponding /library/<slug>/ and /recommendations/<slug>/ page.
// ─────────────────────────────────────────────────────────────────────

export interface StandardRef {
  /** Canonical identifier used in YAML data, IndexedDB, and URLs. */
  readonly id: string
  /** URL-safe slug — appears in paths like /library/<slug>/. */
  readonly slug: string
  /** Display number, e.g. "R 60". */
  readonly recommendationNumber: string
  /** Short display title. */
  readonly title: string
  /** One-sentence scope summary. */
  readonly scope: string
  /** Publication year (number for type safety). */
  readonly year: number
  /** Counts shown on the home/recommendations cards. */
  readonly counts: {
    readonly requirements: number
    readonly tests: number
    readonly forms: number
  }
  /** Path to the multi-page Recommendation writeup. */
  readonly recommendationsPath: string
  /** Path to the library entry (source-document view). */
  readonly libraryPath: string
  /** External OIML PDF reference, if available. */
  readonly oimlPdfUrl?: string
}

export const STANDARDS: readonly StandardRef[] = [
  {
    id: 'OIML-R-60',
    slug: 'r60',
    recommendationNumber: 'R 60',
    title: 'Load Cells',
    scope:
      'Metrological regulation for load cells used in nonautomatic weighing instruments. The pilot SMART Recommendation.',
    year: 2021,
    counts: { requirements: 42, tests: 18, forms: 12 },
    recommendationsPath: '/recommendations/r60',
    libraryPath: '/library/r60',
    oimlPdfUrl: 'https://www.oiml.org/en/files/pdf_r/r060-e21.pdf',
  },
  {
    id: 'OIML-R-129',
    slug: 'r129',
    recommendationNumber: 'R 129',
    title: 'Mass Road Vehicles',
    scope:
      'Dynamic measuring instruments for the determination of mass of road vehicles in motion.',
    year: 2000,
    counts: { requirements: 35, tests: 14, forms: 9 },
    recommendationsPath: '/recommendations/r129',
    libraryPath: '/library/r129',
  },
  {
    id: 'OIML-R-144',
    slug: 'r144',
    recommendationNumber: 'R 144',
    title: 'Gas Meters',
    scope: 'Gas meters — diaphragm gas meters deployed for custody transfer and billing.',
    year: 2006,
    counts: { requirements: 28, tests: 11, forms: 8 },
    recommendationsPath: '/recommendations/r144',
    libraryPath: '/library/r144',
  },
] as const

/** Look up by canonical id (e.g. 'OIML-R-60'). Returns undefined if missing. */
export function getStandardById(id: string): StandardRef | undefined {
  return STANDARDS.find(s => s.id === id)
}

/** Look up by slug (e.g. 'r60'). Returns undefined if missing. */
export function getStandardBySlug(slug: string): StandardRef | undefined {
  return STANDARDS.find(s => s.slug === slug)
}

/** Look up by recommendation number (e.g. 'R 60'). Returns undefined if missing. */
export function getStandardByNumber(number: string): StandardRef | undefined {
  return STANDARDS.find(s => s.recommendationNumber === number)
}

/** Aggregate counts derived from STANDARDS — single source for home-page stats. */
export const STANDARDS_STATS = {
  total: STANDARDS.length,
  totalRequirements: STANDARDS.reduce((sum, s) => sum + s.counts.requirements, 0),
  totalTests: STANDARDS.reduce((sum, s) => sum + s.counts.tests, 0),
  totalForms: STANDARDS.reduce((sum, s) => sum + s.counts.forms, 0),
} as const

/** Display helper: round up to nearest 10 and append '+' for large counts. */
export function approximate(n: number): string {
  if (n >= 100) return `${Math.ceil(n / 10) * 10}+`
  return String(n)
}
