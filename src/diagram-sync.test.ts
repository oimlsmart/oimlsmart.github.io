import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SMART = process.env.SMART_REPO ?? resolve(ROOT, '..', 'oimlsmart', 'smart')

/**
 * Skip-loud when the (private) smart checkout is absent — the same
 * skip-guard pattern as the smart repo's own freshness suite: this is a
 * public repo, so clones without the SSOT beside them get a visible
 * warning and a skip; wherever the sources ARE present (local dev, the
 * gates.yml CI job), real drift hard-fails.
 */
const HAS_SOURCES = existsSync(join(SMART, 'docs', 'architecture', 'diagrams'))
if (!HAS_SOURCES) {
  console.warn(
    `diagram-sync gate SKIPPED: no diagram sources under ${SMART} ` +
      '(check out oimlsmart/smart beside this repo, or set SMART_REPO)',
  )
}

describe.skipIf(!HAS_SOURCES)('the shared diagram set (the pipeline)', () => {
  it("the site's shared diagrams are byte-identical to the sources", () => {
    const out = execFileSync('node', [join(ROOT, 'scripts/sync-diagrams.mjs'), '--check'], {
      encoding: 'utf-8',
      cwd: ROOT,
    })
    expect(out).toContain('≡ the sources')
  })
})
