// ─────────────────────────────────────────────────────────────────────
// The model-content leg (TODO.promotion/08): the derive-never-invent
// rule for the promotion surfaces, adapted from the smart repo's
// AGENTS.d/16 tripwire. Runs the gate (scripts/check-model-content.ts)
// and proves the machinery itself bites: a model-fact literal with no
// dated entry is flagged, and the clause pins read the publication
// trees for real.
//
// The SSOT pins follow the freshness gate's posture: SMART_REPO
// declared ⇒ verified; undeclared ⇒ the gate's own warning counts the
// skipped pins and this suite stays green without them (never a false
// green: the skip is visible in the output).
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkModelContent, checkClausePin, flaggedLiterals } from '../scripts/check-model-content'
import { MODEL_CONTENT_ALLOWLIST, MODEL_CONTENT_CEILING } from './data/model-content-allowlist'
import { smartRepoStatus } from '../scripts/promotion-lib'

describe('the model-content rule (TODO.promotion/08)', () => {
  it('the gate is clean on the current promotion surfaces', () => {
    const { violations, smartVerified, smartSkipped } = checkModelContent()
    expect(
      violations.map((v) => `${v.file} [${v.rule}] ${v.literal} — ${v.problem}`),
      'model-content violations',
    ).toEqual([])
    if (smartRepoStatus().available) expect(smartVerified).toBeGreaterThan(15)
    else expect(smartSkipped).toBeGreaterThan(15)
  })

  it('the tripwire flags the model-fact shapes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mc-'))
    const f = join(dir, 'page.astro')
    writeFileSync(
      f,
      `<p>per B 18:2025 §14.8 and clause 5.2, see urn:oiml:pub:r:60-1:2021; the MDLO order is R 60-2 2.10/2.11; 180 requirements and 14 requirement classes.</p>`,
    )
    const got = flaggedLiterals(f)
    const literals = got.map((g) => g.literal)
    for (const want of ['§14.8', 'clause 5.2', 'urn:oiml:pub:r:60-1:2021', 'R 60-2 2.10/2.11', '180 requirements', '14 requirement classes']) {
      expect(literals, `flags ${want}`).toContain(want)
    }
  })

  it('a wrapped count is still one literal (the prose line break is not an evasion)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mc-'))
    const f = join(dir, 'page.mdx')
    writeFileSync(f, 'R 60 as data: 14 requirement classes, 180\nrequirements, clause by clause.')
    expect(flaggedLiterals(f).map((g) => g.literal)).toContain('180 requirements')
  })

  it('the clause pin reads the publication tree, not a hope', () => {
    const smart = smartRepoStatus()
    if (!smart.available) {
      console.warn('clause-pin legs SKIP: SMART_REPO undeclared')
      return
    }
    expect(checkClausePin(join(smart.path, 'data/oiml-b018-e25/document.presentation.xml'), '14.8', 'The only valid version of an OIML certificate')).toBeNull()
    expect(checkClausePin(join(smart.path, 'data/oiml-b018-e25/document.presentation.xml'), '15.8', 'The only valid version')).toMatch(/clause 15.8 not found/)
    expect(checkClausePin(join(smart.path, 'data/oiml-cs-pd-05/document.presentation.xml'), '5.1', 'send a copy of each OIML certificate')).toBeNull()
  })

  it('the allowlist is dated, pinned, and at or under its ceiling', () => {
    expect(MODEL_CONTENT_ALLOWLIST.length).toBeLessThanOrEqual(MODEL_CONTENT_CEILING)
    expect(MODEL_CONTENT_ALLOWLIST.length).toBeGreaterThan(10)
    for (const e of MODEL_CONTENT_ALLOWLIST) {
      expect(e.added).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.verify.length).toBeGreaterThan(0)
    }
    // The live pins are the demo-liveness leg's assertions: every one
    // names its account and the probe the smoke asserts.
    for (const e of MODEL_CONTENT_ALLOWLIST) {
      for (const v of e.verify) {
        if (v.kind !== 'live') continue
        expect(v.account.length).toBeGreaterThan(0)
        expect(v.probe.length).toBeGreaterThan(0)
        expect(v.url).toMatch(/^https:\/\/demo\.oimlsmart\.org\//)
      }
    }
  })
})
