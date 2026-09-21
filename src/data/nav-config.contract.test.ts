import { describe, it, expect } from 'vitest'
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NAV_MODEL, type NavItem } from './nav-config'

const ROOT = join(import.meta.dirname, '..', '..')
const PAGES_DIR = join(ROOT, 'src', 'pages')
const CONTENT_PAGES_DIR = join(ROOT, 'src', 'content', 'pages')

const EXTERNAL_HREFS = new Set(['/vocab/', '/resolutions/', '/resolutions/en', '/resolutions/en/', '/publications/', '/vocab', '/publications', '/recs', '/studio', '/smi', '/sst', '/cnml', '/concepts-management/', '/vocabularies/', '/certificates/'])

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

  // Dropdown links + the standalone links sitting directly in NAV_MODEL's
  // items: every surface renders from these, so every one must resolve.
  const allNavLinks = NAV_MODEL.items.flatMap((item: NavItem) =>
    item.type === 'dropdown' ? [...item.config.links] : [item]
  )

  it('carries at most five top-level entries (the nav width directive)', () => {
    expect(NAV_MODEL.items.length).toBeLessThanOrEqual(5)
  })

  it('every nav link resolves to a page or is whitelisted as external', () => {
    const unresolved: string[] = []
    for (const link of allNavLinks) {
      if (!hrefResolves(link.href, pageRoutes, contentSlugs)) {
        unresolved.push(`${link.label} → ${link.href}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('no two nav links within the same dropdown share href and label', () => {
    // Tier-paired routes share an href deliberately (the SMART-tier CNML
    // and SMART+-tier CNML both live at /cnml, distinguished by a tier
    // toggle on the destination page — and since track 02 they share the
    // ONE Components dropdown, so the pair rule is href + label). A
    // repeated href under the SAME label is still a copy-paste bug.
    const unresolved: string[] = []
    for (const item of NAV_MODEL.items) {
      if (item.type !== 'dropdown') continue
      const entries = item.config.links.map(l => `${l.href} :: ${l.label}`)
      const dupes = entries.filter((h, i) => entries.indexOf(h) !== i)
      for (const dupe of new Set(dupes)) {
        unresolved.push(`${item.config.id}: duplicate link ${dupe}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('every dropdown has a unique id', () => {
    const ids = NAV_MODEL.items.filter((i): i is Extract<NavItem, { type: 'dropdown' }> => i.type === 'dropdown').map(i => i.config.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
