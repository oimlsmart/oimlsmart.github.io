import { describe, it, expect } from 'vitest'
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { NAV_DROPDOWNS, NAV_STANDALONE } from './nav-config'

const ROOT = join(import.meta.dirname, '..', '..')
const PAGES_DIR = join(ROOT, 'src', 'pages')
const CONTENT_PAGES_DIR = join(ROOT, 'src', 'content', 'pages')

const EXTERNAL_HREFS = new Set(['/vocab/', '/resolutions/', '/concepts-management/', '/login/', '/vocabularies/'])

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

  const allNavLinks = [
    ...NAV_DROPDOWNS.flatMap(d => d.links),
    ...NAV_STANDALONE,
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

  it('no two nav links share the same href', () => {
    const hrefs = allNavLinks.map(l => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('every dropdown has a unique id', () => {
    const ids = NAV_DROPDOWNS.map(d => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
