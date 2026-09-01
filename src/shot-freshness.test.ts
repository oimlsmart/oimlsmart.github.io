// ─────────────────────────────────────────────────────────────────────
// The shot-freshness unit legs (TODO.promotion/08). The staleness gate
// itself is the nightly's (scripts/check-shot-freshness.ts — a stale
// capture must never break an unrelated push); what per-push proves:
//
//   1. the checker behaves: fresh today, every page stale past its TTL,
//      and a stale verdict always carries the page's regenerate command;
//   2. every declared regenerate command names a script that exists
//      (a renamed capture script cannot strand the record);
//   3. the walkthrough manifest carries its own `regenerate` field (the
//      regeneration command recorded next to the captures themselves).
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROOF_MAP } from './data/proof-map'
import { REPO } from '../scripts/promotion-lib'
import { checkShotFreshness } from '../scripts/check-shot-freshness'

describe('the screenshot-freshness machinery (TODO.promotion/08)', () => {
  it('nothing is stale as of the last capture run, and the far-future rehearsal flags everything', () => {
    const fresh = checkShotFreshness('2026-09-01')
    expect(fresh.length).toBeGreaterThan(30)
    expect(fresh.filter((r) => r.stale)).toEqual([])
    const rehearsed = checkShotFreshness('2027-06-01')
    expect(rehearsed.filter((r) => r.stale).length).toBe(rehearsed.length)
    for (const r of rehearsed) expect(r.regenerate.length).toBeGreaterThan(0)
  })

  it('every regenerate command names a script that exists', () => {
    for (const page of PROOF_MAP) {
      if (!page.shots) continue
      const script = page.shots.regenerate.match(/scripts\/[\w.-]+\.ts/)?.[0]
      expect(script, `${page.route} regenerate names a script: ${page.shots.regenerate}`).toBeTruthy()
      expect(existsSync(join(REPO, script!)), `${page.route} → ${script} exists`).toBe(true)
    }
  })

  it('the walkthrough manifest carries the regeneration command next to the captures', () => {
    const manifest = JSON.parse(readFileSync(join(REPO, 'public/img/walkthroughs/manifest.json'), 'utf-8'))
    expect(manifest.regenerate, 'manifest.regenerate').toContain('capture-walkthroughs.ts')
    expect(manifest.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(manifest.captures.length).toBeGreaterThan(40)
  })
})
