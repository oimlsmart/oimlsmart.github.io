/**
 * Site-wide type definitions.
 *
 * These interfaces are the canonical model for shared data across the
 * OIML SMART public site. Every component that consumes site data
 * imports from here — no structural duplication anywhere.
 *
 * Principles:
 *   - Single source of truth for every concept.
 *   - MECE: each interface covers exactly one concern.
 *   - Open-closed: add new union members by extending, not editing.
 */

/** A lettered entry in the S.M.A.R.T. acronym strip on the home page. */
export interface AcronymItem {
  readonly letter: string
  readonly word: string
  readonly description: string
}

/** A single headline figure shown in the home page stat row. */
export interface Stat {
  readonly label: string
  readonly value: string
}

/** A numbered card in the home page feature grid. */
export interface Feature {
  readonly num: string
  readonly title: string
  readonly description: string
}

/**
 * One of the four audience-aware entry paths on the home page.
 * Roman numerals are used as the visible ordinal to evoke an
 * institutional / publication feel.
 */
export interface AudiencePath {
  readonly num: string
  readonly title: string
  readonly description: string
  readonly link: AudienceLink
}

/** Internal CTA link inside an audience path or recommendation card. */
export interface AudienceLink {
  readonly label: string
  readonly href: string
}

/** Status of a Recommendation in the pilot. */
export type RecommendationStatus = 'modelled' | 'in-progress' | 'planned'

/** Catalogue entry for one OIML Recommendation modelled in SMART. */
export interface Recommendation {
  readonly number: string
  readonly title: string
  readonly scope: string
  readonly year: string
  readonly status: RecommendationStatus
  readonly stats: RecommendationStats
  readonly href: string
}

/** Counts surfaced on the Recommendation card. */
export interface RecommendationStats {
  readonly requirements: number
  readonly tests: number
  readonly forms: number
}

/** GitHub OAuth app configuration surfaced on the /app/ page. */
export interface OAuthConfig {
  readonly clientId: string
  readonly authorizationEndpoint: string
  readonly tokenEndpoint: string
  readonly scopes: readonly string[]
  readonly devRedirectUri: string
}

/** A document library entry — Recommendation, B/OD/PD/D document. */
export interface LibraryDocument {
  readonly code: string
  readonly title: string
  readonly year?: string
  readonly href: string
  readonly series: DocumentSeries
  readonly status?: string
}

/** OIML publication series — used as a MECE classification axis. */
export type DocumentSeries =
  | 'recommendation'
  | 'framework'
  | 'operational'
  | 'guide'

/** Top-level nav descriptor consumed by VitePress. */
export interface NavItem {
  readonly text: string
  readonly link?: string
  readonly items?: readonly NavItem[]
}

/** A draft-status disclaimer rendered as a callout. */
export interface DraftNotice {
  readonly title: string
  readonly body: string
}
