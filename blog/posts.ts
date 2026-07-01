/**
 * Blog posts — canonical post model + transformation.
 *
 * Single source of truth for what counts as a "post". Consumed by
 * - `blog/posts.data.ts` for the blog index page
 * - `.vitepress/rss.ts` for the RSS feed generator
 *
 * The set of fields here is the contract. Adding a new frontmatter
 * field = edit this file + both consumers pick it up.
 */

export interface Post {
  /** Post title from frontmatter.title. */
  readonly title: string
  /** ISO date string from frontmatter.date. */
  readonly date: string
  /** Author from frontmatter.author, defaulting to the team name. */
  readonly author: string
  /** Short summary from frontmatter.summary. */
  readonly summary: string
  /** Route path within the site, e.g. /blog/2026-07-01-pilot-launch.html */
  readonly url: string
}

/**
 * Shape of each raw entry from VitePress's createContentLoader.
 * The `frontmatter` is loose because it comes from YAML; we narrow it
 * via the map() below.
 */
interface RawPost {
  readonly url: string
  readonly frontmatter: {
    title?: unknown
    date?: unknown
    author?: unknown
    summary?: unknown
  }
}

const DEFAULT_AUTHOR = 'OIML SMART team'

/**
 * Sort comparator — newest first.
 */
function compareByDate(a: Post, b: Post): number {
  return +new Date(b.date) - +new Date(a.date)
}

/**
 * Filter — exclude the index page (no frontmatter.title) and any
 * entries missing required fields.
 */
function isIndexPage(raw: RawPost): boolean {
  return raw.url === '/blog/'
}

function hasTitleAndDate(raw: RawPost): raw is RawPost & { frontmatter: { title: string; date: string } } {
  return (
    typeof raw.frontmatter.title === 'string' &&
    typeof raw.frontmatter.date === 'string'
  )
}

/**
 * Pure transformation: raw VitePress content entries → typed Posts.
 * No I/O. Testable in isolation.
 */
export function transformPosts(raw: readonly RawPost[]): readonly Post[] {
  return raw
    .filter((p): p is RawPost & { frontmatter: { title: string; date: string } } => {
      if (isIndexPage(p)) return false
      return hasTitleAndDate(p)
    })
    .map((p) => ({
      title: p.frontmatter.title,
      date: p.frontmatter.date,
      author:
        typeof p.frontmatter.author === 'string'
          ? p.frontmatter.author
          : DEFAULT_AUTHOR,
      summary:
        typeof p.frontmatter.summary === 'string' ? p.frontmatter.summary : '',
      url: p.url,
    }))
    .sort(compareByDate)
}