// ─────────────────────────────────────────────────────────────────────
// promotion-lib — the shared half of the TODO.promotion/08 machinery:
// the claim→evidence map walker, the screenshot-date extraction, and the
// demo-link inventory. Three consumers:
//
//   src/proof-map.test.ts        the per-push leg (structure + site/
//                                source/smart anchors + shot coverage)
//   scripts/check-proof-map.ts   the live leg (the nightly: fetch every
//                                live anchor, assert status + probe)
//   e2e/demo-liveness.spec.ts    the playwright smoke (the demo links)
//
// The map itself is src/data/proof-map.ts (the house data-file
// convention: typed TS, never a parallel YAML that drifts).
// ─────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const REPO = resolve(import.meta.dirname, '..')

/** The smart repo (the SSOT), when declared — the same posture as
 *  src/platform-freshness.test.ts: SMART_REPO, else the sibling
 *  checkout; absent ⇒ the smart anchors skip loudly, never a false
 *  green. */
export const SMART = process.env.SMART_REPO ?? resolve(REPO, '..', 'oimlsmart', 'smart')

// ── Route → source resolution ────────────────────────────────────────

function* walk(dir: string, exts: RegExp): Generator<string> {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) {
      if (e.startsWith('.')) continue
      yield* walk(p, exts)
    } else if (exts.test(e)) {
      yield p
    }
  }
}

/** Every route this site serves from src/pages (*.astro) and
 *  src/content/pages (*.md/.mdx), as route → repo-relative source. The
 *  mapping is the house routing rule: file path IS the route
 *  (index.astro/index.mdx → the directory route; [...slug] dynamic
 *  routes are skipped — their concrete routes come from the content
 *  collection). */
export function routeIndex(): Map<string, string> {
  const idx = new Map<string, string>()
  const pagesDir = join(REPO, 'src', 'pages')
  for (const f of walk(pagesDir, /\.astro$/)) {
    const rel = f.slice(REPO.length + 1)
    let route = rel.slice('src/pages'.length).replace(/\.astro$/, '')
    if (route.endsWith('/index')) route = route.slice(0, -'/index'.length)
    if (route.includes('[')) continue
    idx.set(route === '' ? '/' : route, rel)
  }
  const contentDir = join(REPO, 'src', 'content', 'pages')
  for (const f of walk(contentDir, /\.(md|mdx)$/)) {
    const rel = f.slice(REPO.length + 1)
    let route = rel.slice('src/content/pages'.length).replace(/\.(md|mdx)$/, '')
    if (route.endsWith('/index')) route = route.slice(0, -'/index'.length)
    idx.set(route === '' ? '/' : route, rel)
  }
  return idx
}

/** The promotion pages' routes (the sections waves 01–07 shipped). The
 *  per-push leg asserts every one has a proof-map entry, so a new
 *  promotion page without its claims mapped fails the build. */
export const PROMOTION_ROUTE_PREFIXES = [
  '/audiences',
  '/technologies',
  '/use-cases',
  '/services',
  '/demo',
  '/tour',
  '/about/audiences',
] as const

// ── Anchor checking (the offline kinds) ──────────────────────────────

export interface AnchorFailure {
  readonly claimId: string
  readonly anchor: string
  readonly problem: string
}

function probeFile(claimId: string, label: string, absPath: string, probe: string): AnchorFailure[] {
  if (!existsSync(absPath)) {
    return [{ claimId, anchor: label, problem: `file not found: ${absPath}` }]
  }
  const text = readFileSync(absPath, 'utf-8')
  if (!text.includes(probe)) {
    return [
      {
        claimId,
        anchor: label,
        problem: `the probe ${JSON.stringify(probe)} is not carried by ${label} — the anchor no longer shows what the page claims`,
      },
    ]
  }
  return []
}

export interface SmartRepoStatus {
  readonly available: boolean
  readonly path: string
}

export function smartRepoStatus(): SmartRepoStatus {
  return { available: existsSync(join(SMART, 'AGENTS.md')), path: SMART }
}

/** Walk one page's anchors against the offline targets (site routes,
 *  repo sources, smart-repo files). Live anchors are the nightly's job
 *  (scripts/check-proof-map.ts --live). */
export function checkOfflineAnchors(
  claims: ReadonlyArray<{ id: string; anchors: ReadonlyArray<Record<string, unknown>> }>,
): AnchorFailure[] {
  const failures: AnchorFailure[] = []
  const routes = routeIndex()
  const smart = smartRepoStatus()
  for (const claim of claims) {
    for (const a of claim.anchors) {
      if (a.kind === 'site') {
        const src = routes.get(a.route as string)
        if (!src) {
          failures.push({ claimId: claim.id, anchor: `site:${a.route}`, problem: 'no such route on this site' })
          continue
        }
        failures.push(...probeFile(claim.id, `site:${a.route}`, join(REPO, src), a.probe as string))
      } else if (a.kind === 'source') {
        failures.push(
          ...probeFile(claim.id, `source:${a.path}`, join(REPO, a.path as string), a.probe as string),
        )
      } else if (a.kind === 'smart' && smart.available) {
        failures.push(
          ...probeFile(claim.id, `smart:${a.path}`, join(SMART, a.path as string), a.probe as string),
        )
      }
    }
  }
  return failures
}

/** The smart anchors present in the map (for the loud-skip report when
 *  SMART_REPO is undeclared). */
export function smartAnchors(
  claims: ReadonlyArray<{ id: string; anchors: ReadonlyArray<Record<string, unknown>> }>,
): string[] {
  const out: string[] = []
  for (const c of claims) for (const a of c.anchors) if (a.kind === 'smart') out.push(`${c.id} → smart:${a.path}`)
  return out
}

// ── Screenshot-date extraction (the freshness leg's input) ───────────

const DATE_RE = /\d{4}-\d{2}-\d{2}/

/** Every capture date a page source carries: the mdx frontmatter
 *  `captured:` field, the `captured="…"` / `captured={…}` props, the
 *  `.astro` `const captured = '…'` convention, and the ServiceShot
 *  `date={captured}` indirection (resolved through the same const). */
export function pageCaptureDates(absSource: string): string[] {
  const text = readFileSync(absSource, 'utf-8')
  const dates = new Set<string>()
  const frontmatter = text.match(/^captured:\s*'(\d{4}-\d{2}-\d{2})'/m)
  if (frontmatter) dates.add(frontmatter[1])
  for (const m of text.matchAll(/captured="(\d{4}-\d{2}-\d{2})"/g)) dates.add(m[1])
  for (const m of text.matchAll(/const captured\s*=\s*'(\d{4}-\d{2}-\d{2})'/g)) dates.add(m[1])
  return [...dates].filter((d) => DATE_RE.test(d))
}

/** The dated-shot inventory of one page source: every ShotFigure /
 *  FlowStep / ServiceShot's image path that must exist under public/. */
export function pageShotFiles(absSource: string): string[] {
  const text = readFileSync(absSource, 'utf-8')
  const files = new Set<string>()
  // ShotFigure: page/stem required, section defaults to "technologies".
  for (const m of text.matchAll(/<ShotFigure[\s\S]*?\/>/g)) {
    const span = m[0]
    const stem = span.match(/stem="([^"]+)"/)?.[1]
    const page = span.match(/page="([^"]+)"/)?.[1]
    if (!stem || !page) continue
    const section = span.match(/section="([^"]+)"/)?.[1] ?? 'technologies'
    files.add(`public/img/${section}/${page}/${stem}-light.png`)
    const darkFalse = /dark=\{false\}/.test(span)
    if (!darkFalse) files.add(`public/img/${section}/${page}/${stem}-dark.png`)
  }
  // FlowStep: renders a walkthroughs capture; page defaults to "shared".
  for (const m of text.matchAll(/<FlowStep[\s\S]*?\/>/g)) {
    const span = m[0]
    const stem = span.match(/stem="([^"]+)"/)?.[1]
    if (!stem) continue
    const page = span.match(/page="([^"]+)"/)?.[1] ?? 'shared'
    files.add(`public/img/walkthroughs/${page}/${stem}-light.png`)
    const darkFalse = /dark=\{false\}/.test(span)
    if (!darkFalse) files.add(`public/img/walkthroughs/${page}/${stem}-dark.png`)
  }
  // ServiceShot: service/id props, the .light/.dark naming.
  for (const m of text.matchAll(/<ServiceShot[\s\S]*?\/>/g)) {
    const span = m[0]
    const service = span.match(/service="([^"]+)"/)?.[1]
    const id = span.match(/id="([^"]+)"/)?.[1]
    if (!service || !id) continue
    files.add(`public/img/services/${service}/${id}.light.png`)
    files.add(`public/img/services/${service}/${id}.dark.png`)
  }
  return [...files]
}

/** The tour's fallback date rides src/data/tour-slides.ts
 *  (TOUR_CAPTURED); the tour pages carry no captured props of their
 *  own. */
export function tourCapturedDate(): string | null {
  const f = join(REPO, 'src', 'data', 'tour-slides.ts')
  if (!existsSync(f)) return null
  const m = readFileSync(f, 'utf-8').match(/TOUR_CAPTURED\s*=\s*'(\d{4}-\d{2}-\d{2})'/)
  return m ? m[1] : null
}

/** The tour slides' fallback captures (section walkthroughs, per-slide
 *  page/stem from the same source). */
export function tourShotFiles(): string[] {
  const f = join(REPO, 'src', 'data', 'tour-slides.ts')
  if (!existsSync(f)) return []
  const text = readFileSync(f, 'utf-8')
  const files: string[] = []
  for (const m of text.matchAll(/shot:\s*\{[\s\S]*?\}/g)) {
    const span = m[0]
    const page = span.match(/page:\s*'([^']+)'/)?.[1]
    const stem = span.match(/stem:\s*'([^']+)'/)?.[1]
    const dark = span.match(/dark:\s*(true|false)/)?.[1]
    if (!page || !stem) continue
    files.push(`public/img/walkthroughs/${page}/${stem}-light.png`)
    if (dark !== 'false') files.push(`public/img/walkthroughs/${page}/${stem}-dark.png`)
  }
  return files
}

// ── The demo-link inventory (the smoke leg's target list) ────────────

export interface DemoLink {
  /** Where the link is published (repo-relative source). */
  readonly from: string
  readonly url: string
}

/** Every deep link into the demo the promotion surfaces publish:
 *  the FlowStep `live=` props, the ActionBox / prose demo hrefs on the
 *  walkthrough + tour pages, and the tour slides' live steps. The
 *  smoke leg exercises exactly this set — a link that leaves the map
 *  leaves the smoke, and the map walks every promotion page. */
export function demoLinks(sources: ReadonlyArray<{ from: string; abs: string }>): DemoLink[] {
  const out: DemoLink[] = []
  const seen = new Set<string>()
  const push = (from: string, url: string) => {
    const key = url.replace(/\/$/, '')
    if (seen.has(key)) return
    seen.add(key)
    out.push({ from, url })
  }
  for (const { from, abs } of sources) {
    const text = readFileSync(abs, 'utf-8')
    for (const m of text.matchAll(/https:\/\/demo\.oimlsmart\.org\/[^\s"'<>)\]]*/g)) {
      push(from, m[0])
    }
  }
  // The tour's live steps ride the data source.
  const slides = join(REPO, 'src', 'data', 'tour-slides.ts')
  if (existsSync(slides)) {
    const text = readFileSync(slides, 'utf-8')
    for (const m of text.matchAll(/href:\s*'(https:\/\/demo\.oimlsmart\.org\/[^']*)'/g)) {
      push('src/data/tour-slides.ts', m[1])
    }
  }
  return out
}
