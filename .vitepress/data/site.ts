/**
 * Canonical site-wide data.
 *
 * Anything referenced from more than one page belongs here. Components
 * import this module — they never inline this data. Adding a new
 * acronym letter, stat, feature, or audience path is a single-line
 * edit here, with zero touch to any Vue file.
 */

import type {
  AcronymItem,
  AudiencePath,
  DraftNotice,
  Feature,
  OAuthConfig,
  Recommendation,
  Stat,
} from '../types'

/** S.M.A.R.T. acronym — the conceptual spine of the programme. */
export const acronym: readonly AcronymItem[] = [
  {
    letter: 'S',
    word: 'Standards',
    description: 'International metrology recommendations as structured digital artifacts.',
  },
  {
    letter: 'M',
    word: 'Machine-Actionable',
    description: 'Embedded computation engines perform metrological calculations directly.',
  },
  {
    letter: 'A',
    word: 'Accessible',
    description: 'Instant search, cross-references, and real-time calculation in the browser.',
  },
  {
    letter: 'R',
    word: 'Readable',
    description: 'Machine-readable requirements, tests, and terminology in open formats.',
  },
  {
    letter: 'T',
    word: 'Transferrable',
    description: 'A shared ontology layer enables cross-Recommendation interoperability.',
  },
] as const

/** Headline pilot figures — shown on the home page stat row. */
export const pilotStats: readonly Stat[] = [
  { label: 'Recommendations', value: '3' },
  { label: 'Requirements', value: '180+' },
  { label: 'Conformance Tests', value: '60+' },
  { label: 'Forms', value: '40+' },
] as const

/** Six capabilities delivered by the SMART platform. */
export const platformFeatures: readonly Feature[] = [
  {
    num: '01',
    title: 'Structured Requirements',
    description: 'Machine-readable requirements with explicit acceptance criteria and applicability filters.',
  },
  {
    num: '02',
    title: 'Conformance Testing',
    description: 'Structured test procedures linked to requirements via explicit dependency chains.',
  },
  {
    num: '03',
    title: 'Smart Forms',
    description: 'Calculation-powered forms that auto-compute field values based on instrument classification.',
  },
  {
    num: '04',
    title: 'Certification Workflow',
    description: 'End-to-end digital certification: application → test report → evaluation → certificate.',
  },
  {
    num: '05',
    title: 'Semantic Ontology',
    description: 'OWL-based ontology for cross-Recommendation interoperability and semantic queries.',
  },
  {
    num: '06',
    title: 'Document Library',
    description: 'Browse all OIML documents in structured, searchable format with instant full-text search.',
  },
] as const

/** Audience-aware entry paths — one per primary reader persona. */
export const audiencePaths: readonly AudiencePath[] = [
  {
    num: 'i',
    title: 'For OIML Member States',
    description:
      'Understand what SMART means for national legal metrology programmes and how to participate in the technical committees shaping the SMART agenda.',
    link: { label: 'About →', href: '/about/what-is-smart.html' },
  },
  {
    num: 'ii',
    title: 'For Standards Developers',
    description:
      'Author new SMART International Recommendations in YAML using the developer guides, schemas, and the Primmel modelling language.',
    link: { label: 'Guides →', href: '/docs/guides/getting-started.html' },
  },
  {
    num: 'iii',
    title: 'For OIML-CS Participants',
    description:
      'Issuing Authorities, Test Laboratories, and Manufacturers use the digital certification tools for end-to-end OIML-CS workflows.',
    link: { label: 'OIML-CS →', href: '/oiml-cs.html' },
  },
  {
    num: 'iv',
    title: 'For Metrology Professionals',
    description:
      'Browse the structured library of OIML documents, requirements, and ontology terms across all modelled Recommendations.',
    link: { label: 'Library →', href: '/library/' },
  },
] as const

/**
 * Default OAuth configuration for the /app/ page.
 *
 * The client secret is intentionally absent — it lives only in the
 * smart app's server env (`GITHUB_CLIENT_SECRET`). The public site
 * exposes only the client ID, which is safe to publish.
 */
export const oauthConfig: OAuthConfig = {
  clientId: 'Ov23li14hMhdjgtfWKBA',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  scopes: ['read:user', 'user:email'],
  devRedirectUri: 'http://localhost:5190/api/auth/callback/github',
} as const

/**
 * Canonical DRAFT notice text — referenced by every page that needs
 * to display it. Keeping this in one place means a wording change
 * is a one-line edit, not a 34-file find-and-replace.
 */
export const draftNotice: DraftNotice = {
  title: 'DRAFT — Pilot programme',
  body:
    'This page documents the OIML SMART pilot programme. Every requirement, ' +
    'test, form, ontology entity, and specification described here is a ' +
    'draft and may change without notice as the pilot evolves. OIML Member ' +
    'States and Corresponding Members seeking engagement should contact ' +
    'OIML through official channels. Not for external distribution.',
} as const

/**
 * Demo accounts surfaced on the /app/ page.
 *
 * These mirror the seed data in the smart app's
 * `browser/scripts/reset-db.ts`. The source of truth remains the smart
 * app; this array is mirrored here for documentation. If they drift,
 * the /app/ page is the consumer that needs updating.
 */
export const demoAccounts: readonly {
  readonly email: string
  readonly role: string
  readonly password: string
}[] = [
  { email: 'admin@oiml.org', role: 'Admin', password: 'demo2026' },
  { email: 'ia@oiml.org', role: 'Issuing Authority', password: 'demo2026' },
  { email: 'tl@oiml.org', role: 'Test Laboratory', password: 'demo2026' },
  { email: 'viewer@oiml.org', role: 'Viewer', password: 'demo2026' },
  { email: 'developer@ribose.com', role: 'Developer / Admin', password: 'demo2026' },
] as const

/** Convenience: the canonical Recommendations import (re-exported). */
export type { Recommendation } from '../types'
