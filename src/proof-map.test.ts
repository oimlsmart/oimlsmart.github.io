// ─────────────────────────────────────────────────────────────────────
// The proof-map leg (TODO.promotion/08): the per-push half of the
// claim→evidence map. Proves, on every push:
//
//   1. every promotion page has a map entry (a new page without its
//      claims mapped fails the build), and every entry's route + source
//      agree with the site's routing;
//   2. every offline anchor (site / source / smart) still SHOWS what
//      the page claims — the probe string is carried by the anchor's
//      own bytes;
//   3. the screenshot-freshness declarations are complete: a page
//      carries dated captures exactly when its entry declares `shots`,
//      and every capture the pages publish exists under public/img.
//
// The smart anchors follow the freshness gate's posture
// (src/platform-freshness.test.ts): SMART_REPO declared ⇒ probed;
// undeclared ⇒ a loud skip, never a false green. The live anchors are
// the nightly's job (scripts/check-proof-map.ts --live).
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { PROOF_MAP } from './data/proof-map'
import {
  REPO,
  PROMOTION_ROUTE_PREFIXES,
  checkOfflineAnchors,
  demoLinks,
  pageCaptureDates,
  pageShotFiles,
  routeIndex,
  smartAnchors,
  smartRepoStatus,
  tourCapturedDate,
  tourShotFiles,
} from '../scripts/promotion-lib'

const smart = smartRepoStatus()
if (!smart.available) {
  console.warn(
    `proof-map leg: the SSOT checkout is not readable at ${smart.path} — ` +
      `the ${smartAnchors(PROOF_MAP.flatMap((p) => p.claims)).length} smart anchors SKIP ` +
      '(check out oimlsmart/smart beside this repo, or set SMART_REPO)',
  )
}

describe('the claim→evidence map (TODO.promotion/08)', () => {
  it('every promotion route has a map entry, and every entry resolves', () => {
    const routes = routeIndex()
    const promotionRoutes = [...routes.keys()].filter((r) =>
      PROMOTION_ROUTE_PREFIXES.some((p) => r === p || r.startsWith(p + '/')),
    )
    const mapped = new Set(PROOF_MAP.map((p) => p.route))
    const unmapped = promotionRoutes.filter((r) => !mapped.has(r))
    expect(unmapped, `promotion routes without a proof-map entry: ${unmapped.join(', ')}`).toEqual([])
    for (const page of PROOF_MAP) {
      expect(routes.get(page.route), `${page.route} resolves on this site`).toBe(page.source)
      expect(existsSync(join(REPO, page.source)), `${page.source} exists`).toBe(true)
    }
  })

  it('claim ids are unique and every claim carries at least one anchor', () => {
    const ids = PROOF_MAP.flatMap((p) => p.claims.map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const page of PROOF_MAP) {
      expect(page.claims.length, `${page.route} maps at least one claim`).toBeGreaterThan(0)
      for (const c of page.claims) {
        expect(c.anchors.length, `${c.id} carries an anchor`).toBeGreaterThan(0)
      }
    }
  })

  it('every offline anchor still shows what the page claims', () => {
    const failures = checkOfflineAnchors(PROOF_MAP.flatMap((p) => p.claims))
    expect(
      failures.map((f) => `${f.claimId} [${f.anchor}]: ${f.problem}`),
      'anchor probes failed',
    ).toEqual([])
  })

  it('a live anchor either probes content or says why not', () => {
    for (const page of PROOF_MAP) {
      for (const claim of page.claims) {
        for (const a of claim.anchors) {
          if (a.kind !== 'live') continue
          expect(
            a.probe !== undefined || a.skip !== undefined,
            `${claim.id} live anchor ${a.url} carries neither a probe nor a skip reason`,
          ).toBe(true)
        }
      }
    }
  })

  it('the screenshot declarations cover exactly the dated pages', () => {
    for (const page of PROOF_MAP) {
      const dates = pageCaptureDates(join(REPO, page.source))
      if (page.route === '/tour') {
        // The tour's fallback date rides TOUR_CAPTURED, not the page source.
        expect(tourCapturedDate(), 'TOUR_CAPTURED declared').toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(page.shots, '/tour declares its freshness budget').toBeTruthy()
        continue
      }
      if (dates.length > 0) {
        expect(
          page.shots,
          `${page.route} carries capture dates (${dates.join(', ')}) but declares no shots block (ttl + regenerate)`,
        ).toBeTruthy()
      } else {
        expect(
          page.shots,
          `${page.route} declares a shots block but carries no dated capture`,
        ).toBeFalsy()
      }
    }
  })

  it('every capture the pages publish exists under public/img', () => {
    const missing: string[] = []
    for (const page of PROOF_MAP) {
      for (const f of pageShotFiles(join(REPO, page.source))) {
        if (!existsSync(join(REPO, f))) missing.push(`${page.route} → ${f}`)
      }
    }
    for (const f of tourShotFiles()) {
      if (!existsSync(join(REPO, f))) missing.push(`/tour → ${f}`)
    }
    expect(missing, 'published captures missing from public/img').toEqual([])
  })

  it('the demo-link inventory is non-empty (the nightly smoke walks it)', () => {
    const links = demoLinks(
      PROOF_MAP.filter((p) => p.route.startsWith('/demo') || p.route.startsWith('/tour')).map((p) => ({
        from: p.source,
        abs: join(REPO, p.source),
      })),
    )
    expect(links.length).toBeGreaterThan(10)
    for (const l of links) expect(l.url).toMatch(/^https:\/\/demo\.oimlsmart\.org\//)
  })

  it.skipIf(!smart.available)('the SSOT checkout is declared, and the map carries smart anchors worth probing', () => {
    // When SMART_REPO is absent this test SKIPS — the visible record
    // that the smart-anchor probes did not run (the console warning
    // above names the count); the freshness gate's declared-env
    // posture, never a false green. When declared, the offline-anchor
    // test already probed every smart anchor above.
    expect(smartAnchors(PROOF_MAP.flatMap((p) => p.claims)).length).toBeGreaterThan(5)
  })
})
