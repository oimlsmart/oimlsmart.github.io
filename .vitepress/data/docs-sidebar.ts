/**
 * Docs sidebar — derived from the filesystem + per-page frontmatter.
 *
 * Previously this module hand-listed every docs page with its title,
 * shortTitle, and description. That duplicated what was already in
 * each page's frontmatter and required manual sync when pages moved.
 *
 * Now: read the filesystem at config time. Pages are grouped by
 * top-level directory under `docs/`. Section labels and ordering
 * come from the SECTION_LABELS map below; everything else comes
 * from each page's `title:` and `shortTitle:` frontmatter.
 *
 * Pages can opt out of the sidebar by setting `sidebar: false` in
 * their frontmatter.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

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

/** Parse a minimal subset of YAML frontmatter. */
function parseFrontmatter(content: string): PageFrontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm: PageFrontmatter = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, rawValue] = kv
    let value = rawValue.trim()
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1).replace(/''/g, "'")
    }
    if (key === 'title') fm.title = value
    else if (key === 'shortTitle') fm.shortTitle = value
    else if (key === 'sidebar') fm.sidebar = value !== 'false'
  }
  return fm
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