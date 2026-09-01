#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────
// check-shot-freshness — the screenshot-freshness leg
// (TODO.promotion/08). Screenshots are checked, not promised: every
// promotion page carrying dated captures declares its freshness budget
// in src/data/proof-map.ts (`shots.ttlDays` + the `regenerate` command
// that re-captures them — the declaration coverage is proven per-push
// by src/proof-map.test.ts), and this leg flags any page whose oldest
// capture is older than its budget.
//
// Cadence: the NIGHTLY freshness workflow (declared — a stale capture
// must never break an unrelated push's fast path; the per-push leg
// proves the declarations exist, this leg proves they are kept). Run
// locally:
//
//   npx tsx scripts/check-shot-freshness.ts                  # the gate
//   npx tsx scripts/check-shot-freshness.ts --today=2027-01-01   # rehearse
//
// The dates are read from the pages' own sources (the captured props
// and frontmatter are the single home; the tour's fallbacks ride
// TOUR_CAPTURED in src/data/tour-slides.ts) — this script never
// re-types a date.
// ─────────────────────────────────────────────────────────────────────

import { join } from 'node:path'
import { PROOF_MAP } from '../src/data/proof-map'
import { REPO, pageCaptureDates, tourCapturedDate } from './promotion-lib'

const TODAY =
  process.argv.find((a) => a.startsWith('--today='))?.slice('--today='.length) ??
  new Date().toISOString().slice(0, 10)

interface PageFreshness {
  readonly route: string
  readonly oldest: string
  readonly ageDays: number
  readonly ttlDays: number
  readonly regenerate: string
  readonly stale: boolean
}

export function checkShotFreshness(today = TODAY): PageFreshness[] {
  const out: PageFreshness[] = []
  const now = new Date(today + 'T00:00:00Z').getTime()
  for (const page of PROOF_MAP) {
    if (!page.shots) continue
    const dates =
      page.route === '/tour'
        ? [tourCapturedDate()].filter((d): d is string => d !== null)
        : pageCaptureDates(join(REPO, page.source))
    if (dates.length === 0) continue // the per-push leg already fails this case
    const oldest = dates.sort()[0]
    const ageDays = Math.floor((now - new Date(oldest + 'T00:00:00Z').getTime()) / 86_400_000)
    out.push({
      route: page.route,
      oldest,
      ageDays,
      ttlDays: page.shots.ttlDays,
      regenerate: page.shots.regenerate,
      stale: ageDays > page.shots.ttlDays,
    })
  }
  return out
}

const isMain = process.argv[1] && process.argv[1].endsWith('check-shot-freshness.ts')
if (isMain) {
  const rows = checkShotFreshness()
  for (const r of rows) {
    const mark = r.stale ? 'STALE' : 'fresh'
    console.log(`${mark}  ${r.route}  oldest capture ${r.oldest} (${r.ageDays}d of ${r.ttlDays}d)`)
    if (r.stale) console.log(`      regenerate: ${r.regenerate}`)
  }
  const stale = rows.filter((r) => r.stale)
  console.log(
    `\nshot freshness as of ${TODAY}: ${rows.length - stale.length} fresh, ${stale.length} stale ` +
      `(the stale pages name their regeneration command above)`,
  )
  if (stale.length > 0) process.exit(1)
}
