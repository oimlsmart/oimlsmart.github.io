/**
 * Site-wide metadata — single source of truth.
 *
 * VitePress's `UserConfig.title` and `UserConfig.description` are page-
 * level metadata consumed by the HTML head. The RSS feed needs the
 * same data plus a few feed-specific variants. Without this module
 * those facts lived in two files (`config.ts` and `rss.ts`) and could
 * drift.
 *
 * Anything site-wide that has a canonical value lives here.
 * Page-specific values belong in that page's frontmatter, not here.
 */

export interface SiteMeta {
  /** Canonical public URL, no trailing slash. */
  readonly url: string
  /** Site title — shown in nav and <title> tag suffix. */
  readonly title: string
  /** Default meta description for SEO. */
  readonly description: string
  /** Title for the RSS feed. Defaults to "{title} updates" if unset. */
  readonly feedTitle: string
  /** Description for the RSS feed. */
  readonly feedDescription: string
  /** Default language for html[lang] and date formatting. */
  readonly lang: string
}

const TITLE = 'OIML SMART'

export const SITE: SiteMeta = {
  url: 'https://www.oimlsmart.org',
  title: TITLE,
  description:
    'Standards that are Machine-Actionable, Readable and Transferrable.',
  feedTitle: `${TITLE} pilot updates`,
  feedDescription:
    'Working notes and milestone snapshots from the OIML SMART pilot programme.',
  lang: 'en-US',
} as const
