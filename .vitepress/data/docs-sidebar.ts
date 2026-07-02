/**
 * Docs sidebar — derived from the filesystem + per-page frontmatter.
 *
 * Pages are grouped by top-level directory under `docs/`. Section
 * labels and ordering come from SECTION_LABELS / SECTION_ORDER;
 * per-page text comes from frontmatter `shortTitle:` (fallback
 * `title:`). Pages can opt out via `sidebar: false` in frontmatter.
 *
 * Frontmatter is parsed with `js-yaml` (canonical YAML parser).
 * The previous hand-rolled regex parser was replaced in v3 — it
 * couldn't handle multi-line values, nested keys, or arrays.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { load as yamlLoad } from 'js-yaml'

interface PageFrontmatter {
  title?: string
  shortTitle?: string
  sidebar?: boolean
}

/** Display label for each docs section. */
const SECTION_LABELS: Readonly<Record<string, string>> = {
  guides: 'Developer Guides',
  arch: 'Architecture',
  workflow: 'Workflow',
  specifications: 'Formal Specifications',
  ref: 'Reference',
}

/** Section order in the sidebar. Sections not listed are excluded. */
const SECTION_ORDER: readonly string[] = [
  'guides',
  'arch',
  'workflow',
  'specifications',
  'ref',
]

/** Pages to skip even if their file exists. */
const SKIP_FILES: ReadonlySet<string> = new Set(['index.md'])

/** Parse YAML frontmatter using js-yaml. Returns {} if no frontmatter. */
function parseFrontmatter(content: string): PageFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  try {
    const parsed = yamlLoad(match[1]) as Record<string, unknown> | null
    if (!parsed || typeof parsed !== 'object') return {}
    return {
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      shortTitle: typeof parsed.shortTitle === 'string' ? parsed.shortTitle : undefined,
      sidebar: typeof parsed.sidebar === 'boolean' ? parsed.sidebar : undefined,
    }
  } catch {
    // Malformed YAML — return empty so the page falls back to slug.
    return {}
  }
}

interface SidebarItem {
  readonly text: string
  readonly link: string
}

/** Build the sidebar items for one docs section directory. */
function buildSection(section: string, docsRoot: string): SidebarItem[] {
  const sectionDir = join(docsRoot, section)
  if (!existsSync(sectionDir)) return []

  return readdirSync(sectionDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .filter((entry) => !SKIP_FILES.has(entry.name))
    .map((entry) => {
      const slug = entry.name.replace(/\.md$/, '')
      const fm = parseFrontmatter(readFileSync(join(sectionDir, entry.name), 'utf8'))
      if (fm.sidebar === false) return null
      const text = fm.shortTitle || fm.title || slug
      return { text, link: `/docs/${section}/${slug}` }
    })
    .filter((item): item is SidebarItem => item !== null)
    .sort((a, b) => a.link.localeCompare(b.link))
}

/** Build the full docs sidebar from the filesystem. */
export function buildDocsSidebar(docsRoot: string = join(process.cwd(), 'docs')) {
  return SECTION_ORDER
    .map((section) => ({
      text: SECTION_LABELS[section] || section,
      collapsed: false,
      items: buildSection(section, docsRoot),
    }))
    .filter((section) => section.items.length > 0)
}

/** Convenience export consumed by `config.ts > themeConfig.sidebar`. */
export const docsSidebar = buildDocsSidebar()