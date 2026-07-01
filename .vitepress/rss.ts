/**
 * RSS 2.0 feed generator.
 *
 * Reads the same posts as posts.data.ts and emits /feed.xml into the
 * VitePress dist directory at build time. Mounted as a build plugin
 * via `buildEnd` in the site config.
 *
 * Single source of truth: this loader reuses the blog markdown loader
 * — no duplicate post list.
 */
import type { Plugin } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createContentLoader, type SiteConfig } from 'vitepress'

const SITE_URL = 'https://www.oimlsmart.org'
const SITE_TITLE = 'OIML SMART pilot updates'
const SITE_DESC =
  'Working notes and milestone snapshots from the OIML SMART pilot programme.'

interface Post {
  title: string
  date: string
  author: string
  summary: string
  url: string
  html?: string
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc822(iso: string): string {
  return new Date(iso).toUTCString()
}

function renderFeed(posts: readonly Post[]): string {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}${p.url}</link>
      <guid isPermaLink="true">${SITE_URL}${p.url}</guid>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <dc:creator>${escapeXml(p.author)}</dc:creator>
      <description>${escapeXml(p.summary)}</description>
    </item>`
    )
    .join('\n')

  const lastBuild = posts.length
    ? toRfc822(posts[0].date)
    : toRfc822(new Date().toISOString())

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`
}

export async function generateRssFeed(siteConfig: SiteConfig): Promise<void> {
  const loader = createContentLoader('blog/*.md', {
    excerpt: true,
    includeSrc: false,
  })
  const raw = await loader.load()
  const posts: Post[] = raw
    .filter((p) => p.frontmatter.title && p.url !== '/blog/')
    .map((p) => ({
      title: String(p.frontmatter.title),
      date: String(p.frontmatter.date),
      author: String(p.frontmatter.author || 'OIML SMART team'),
      summary: String(p.frontmatter.summary || ''),
      url: p.url,
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const xml = renderFeed(posts)
  const outDir = siteConfig.outDir || resolve(process.cwd(), '.vitepress/dist')
  writeFileSync(resolve(outDir, 'feed.xml'), xml, 'utf8')
}

export function rssPlugin(): Plugin {
  return {
    name: 'oimlsmart-rss',
    apply: 'build',
    closeBundle: async () => {
      // Stub — actual generation wired via buildEnd in config.ts
    },
  }
}