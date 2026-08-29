import { describe, it, expect } from 'vitest'
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NAV_DROPDOWNS, NAV_STANDALONE, NAV_ITEMS, type NavItem } from './nav-config'

const ROOT = join(import.meta.dirname, '..', '..')
const PAGES_DIR = join(ROOT, 'src', 'pages')
const CONTENT_PAGES_DIR = join(ROOT, 'src', 'content', 'pages')

const EXTERNAL_HREFS = new Set(['/vocab/', '/resolutions/', '/publications/', '/vocab', '/publications', '/resolutions', '/recs', '/studio', '/smi', '/sst', '/cnml', '/concepts-management/', '/login/', '/vocabularies/', '/certificates/'])

function collectRoutes(dir: string, base = ''): Set<string> {
  const routes = new Set<string>()
  if (!existsSync(dir)) return routes
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      for (const r of collectRoutes(full, `${base}/${entry}`)) routes.add(r)
    } else if (entry.endsWith('.astro')) {
      const name = entry.replace(/\.astro$/, '').replace(/^index$/, '')
      const route = name ? `${base}/${name}` : base
      routes.add(route)
      routes.add(route + '/')
    }
  }
  return routes
}

function collectContentSlugs(dir: string, base = ''): Set<string> {
  const slugs = new Set<string>()
  if (!existsSync(dir)) return slugs
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      for (const s of collectContentSlugs(full, `${base}/${entry}`)) slugs.add(s)
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      const name = entry.replace(/\.(mdx|md)$/, '').replace(/^index$/, '')
      const slug = name ? `${base}/${name}` : base
      slugs.add(slug)
      slugs.add(slug + '/')
    }
  }
  return slugs
}

function hrefResolves(href: string, routes: Set<string>, slugs: Set<string>): boolean {
  // Absolute URLs are out of scope for the route resolver — the lychee
  // link gate proves their liveness.
  if (/^https?:\/\//.test(href)) return true
  if (EXTERNAL_HREFS.has(href)) return true
  const normalized = href.replace(/\/$/, '')
  if (routes.has(normalized) || routes.has(href)) return true
  if (slugs.has(normalized) || slugs.has(href)) return true
  for (const r of routes) {
    if (r.startsWith(normalized + '/')) return true
  }
  return false
}

describe('nav-config ↔ pages contract', () => {
  const pageRoutes = collectRoutes(PAGES_DIR)
  const contentSlugs = collectContentSlugs(CONTENT_PAGES_DIR)

  // Dropdown links + the NAV_STANDALONE register + the standalone links
  // sitting directly in NAV_ITEMS (News, the TODO.promotion/01 section
  // entries): every surface renders from these, so every one must resolve.
  const allNavLinks = [
    ...NAV_DROPDOWNS.flatMap(d => d.links),
    ...NAV_STANDALONE,
    ...NAV_ITEMS.filter((i): i is Extract<NavItem, { type: 'link' }> => i.type === 'link'),
  ]

  it('every nav link resolves to a page or is whitelisted as external', () => {
    const unresolved: string[] = []
    for (const link of allNavLinks) {
      if (!hrefResolves(link.href, pageRoutes, contentSlugs)) {
        unresolved.push(`${link.label} → ${link.href}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('no two nav links within the same dropdown share the same href', () => {
    // Cross-dropdown sharing is allowed for tier-paired routes (e.g. the
    // SMART-tier CNML and SMART+-tier CNML both live at /cnml, distinguished
    // by a tier toggle on the destination page). Within a single dropdown,
    // hrefs must still be unique.
    const unresolved: string[] = []
    for (const dropdown of NAV_DROPDOWNS) {
      const hrefs = dropdown.links.map(l => l.href)
      const dupes = hrefs.filter((h, i) => hrefs.indexOf(h) !== i)
      for (const dupe of new Set(dupes)) {
        unresolved.push(`${dropdown.id}: duplicate href ${dupe}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('every dropdown has a unique id', () => {
    const ids = NAV_DROPDOWNS.map(d => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
