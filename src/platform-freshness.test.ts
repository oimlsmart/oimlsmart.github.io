// ─────────────────────────────────────────────────────────────────────
// The content-freshness gate (TODO.integration/26): the claims this
// site makes about the live platform (src/data/platform-facts.ts) are
// pinned against the SSOT architecture doc —
// smart/docs/architecture/for-agents.md. The numbers are PARSED from
// that doc, never re-typed here: when the platform's gates move, this
// suite fails until the site's claims move with them.
//
// Local contract: run with the smart repo checked out beside this one
// (or set SMART_REPO). In CI the gates workflow (gates.yml) checks the
// private repo out and provides SMART_REPO. Where the SSOT is absent
// (a public clone) the suite skips with a loud warning — the same
// skip-guard pattern as the smart repo's own freshness suite.
// ─────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GATE_NUMBERS, PLATFORM_REPOS, PROGRAM_RECS } from './data/platform-facts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SMART = process.env.SMART_REPO ?? resolve(ROOT, '..', 'oimlsmart', 'smart')
const FOR_AGENTS_PATH = join(SMART, 'docs', 'architecture', 'for-agents.md')

const FOR_AGENTS = existsSync(FOR_AGENTS_PATH) ? readFileSync(FOR_AGENTS_PATH, 'utf-8') : null

// Skip-loud when the (private) SSOT checkout is absent — the same
// skip-guard pattern as the smart repo's own freshness suite: this is a
// public repo, so clones without the SSOT beside them get a visible
// warning and a skip; wherever the doc IS present (local dev, the
// gates.yml CI job), stale claims hard-fail.
const HAS_DOC = FOR_AGENTS !== null
if (!HAS_DOC) {
  console.warn(
    `freshness gate SKIPPED: the SSOT architecture doc is not readable at ${FOR_AGENTS_PATH} ` +
      '(check out oimlsmart/smart beside this repo, or set SMART_REPO)',
  )
}

function needDoc(): string {
  if (FOR_AGENTS === null) {
    throw new Error('freshness gate: needDoc() called without the SSOT doc — this suite skips in that case')
  }
  return FOR_AGENTS
}

describe.skipIf(!HAS_DOC)('the content-freshness gate (site claims ≡ SSOT)', () => {
  it('the SSOT architecture doc is present', () => {
    expect(needDoc().length).toBeGreaterThan(0)
  })

  it('the package count matches (primmel check → 0 errors ×N)', () => {
    const m = needDoc().match(/0 errors ×(\d+)/)
    expect(m, 'for-agents.md states "0 errors ×N"').toBeTruthy()
    expect(GATE_NUMBERS.packages).toBe(Number(m![1]))
  })

  it('the vitest numbers match (N tests / M files)', () => {
    const m = needDoc().match(/\((\d+) tests \/ (\d+) files\)/)
    expect(m, 'for-agents.md states "(N tests / M files)"').toBeTruthy()
    expect(GATE_NUMBERS.vitestTests).toBe(Number(m![1]))
    expect(GATE_NUMBERS.vitestFiles).toBe(Number(m![2]))
  })

  it('the e2e number matches', () => {
    const m = needDoc().match(/test:e2e`? \((\d+\/\d+)\)/) ?? needDoc().match(/e2e (\d+\/\d+)/)
    expect(m, 'for-agents.md states the e2e count').toBeTruthy()
    expect(GATE_NUMBERS.e2e).toBe(m![1])
  })

  it('the validate numbers match (validate E/W)', () => {
    const m = needDoc().match(/validate (\d+)\/(\d+)/)
    expect(m, 'for-agents.md states "validate E/W"').toBeTruthy()
    expect(GATE_NUMBERS.validateErrors).toBe(Number(m![1]))
    expect(GATE_NUMBERS.validateWarnings).toBe(Number(m![2]))
  })

  it('every claimed repo is a row in the SSOT repo table', () => {
    const doc = needDoc()
    for (const { repo } of PLATFORM_REPOS) {
      expect(doc.includes(`\`${repo}\``), `${repo} named in for-agents.md`).toBe(true)
    }
  })

  it('every claimed Recommendation has a package in the SSOT tree', () => {
    for (const { id } of PROGRAM_RECS) {
      const pkg = join(SMART, 'primmel-packages', `oiml-r${id.replace('R ', '')}`, 'package.primmel')
      expect(existsSync(pkg), `${id} → ${pkg}`).toBe(true)
    }
  })
})
