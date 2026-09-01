#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────
// check-proof-map — the LIVE half of the claim→evidence map
// (TODO.promotion/08), run by the nightly freshness workflow. Every
// `live` anchor in src/data/proof-map.ts is fetched: the HTTP status
// must be in the anchor's `expect` (default [200]), and a 2xx body must
// carry the anchor's `probe` when one is declared. Anchors with `skip`
// report the declared reason — an honest skip, printed, never silent.
//
//   npx tsx scripts/check-proof-map.ts --live     # the live leg
//
// Per-push, lychee already proves the site's links resolve; this leg
// adds the semantic layer the links gate cannot: the anchor still
// SHOWS what the page claims.
// ─────────────────────────────────────────────────────────────────────

import { PROOF_MAP, type ProofAnchor } from '../src/data/proof-map'

interface LiveResult {
  readonly claimId: string
  readonly url: string
  readonly outcome: 'ok' | 'skip' | 'fail'
  readonly detail: string
}

const TIMEOUT_MS = 20_000

async function checkLive(claimId: string, anchor: Extract<ProofAnchor, { kind: 'live' }>): Promise<LiveResult> {
  const expect = anchor.expect ?? [200]
  let res: Response
  try {
    res = await fetch(anchor.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'oimlsmart-proof-map/1.0 (the TODO.promotion/08 honesty leg)' },
    })
  } catch (e) {
    return { claimId, url: anchor.url, outcome: 'fail', detail: `fetch failed: ${(e as Error).message}` }
  }
  if (!expect.includes(res.status)) {
    return {
      claimId,
      url: anchor.url,
      outcome: 'fail',
      detail: `HTTP ${res.status}, expected ${expect.join('/')}`,
    }
  }
  if (anchor.probe && expect.includes(res.status)) {
    // The probe reads the accepted response's body — including an
    // honest non-200 the page documents as the answer (the trust
    // registry's 404 refusal carries the refusal's text).
    const body = await res.text()
    if (!body.includes(anchor.probe)) {
      return {
        claimId,
        url: anchor.url,
        outcome: 'fail',
        detail: `HTTP 200 but the probe ${JSON.stringify(anchor.probe)} is not carried — the anchor no longer shows what the page claims`,
      }
    }
  }
  const note = anchor.probe ? `HTTP ${res.status}, probe carried` : `HTTP ${res.status}${anchor.skip ? ` (no content probe: ${anchor.skip})` : ''}`
  return { claimId, url: anchor.url, outcome: anchor.probe ? 'ok' : anchor.skip ? 'skip' : 'ok', detail: note }
}

const isMain = process.argv[1] && process.argv[1].endsWith('check-proof-map.ts')
if (isMain) {
  if (!process.argv.includes('--live')) {
    console.error('usage: npx tsx scripts/check-proof-map.ts --live')
    process.exit(2)
  }
  const jobs: Array<Promise<LiveResult>> = []
  for (const page of PROOF_MAP) {
    for (const claim of page.claims) {
      for (const a of claim.anchors) {
        if (a.kind === 'live') jobs.push(checkLive(claim.id, a))
      }
    }
  }
  const results = await Promise.all(jobs)
  const failures = results.filter((r) => r.outcome === 'fail')
  const skips = results.filter((r) => r.outcome === 'skip')
  for (const r of results) {
    const mark = r.outcome === 'ok' ? 'ok  ' : r.outcome === 'skip' ? 'skip' : 'FAIL'
    console.log(`${mark}  ${r.claimId}  ${r.url}  ${r.detail}`)
  }
  console.log(
    `\nproof-map live leg: ${results.length - failures.length - skips.length} probed, ` +
      `${skips.length} honestly skipped, ${failures.length} failed`,
  )
  if (failures.length > 0) process.exit(1)
}
