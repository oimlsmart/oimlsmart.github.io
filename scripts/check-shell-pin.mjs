#!/usr/bin/env node
/**
 * The packages-pin leg of the freshness sentinel. The studio pin leg
 * asserts that a pinned npm package equals npm's latest release; this
 * repo consumes its one house package differently, so the invariant is
 * adapted rather than copied. The site's shell (@oimlsmart/site-shell)
 * is pinned as a vendored checkout (file:vendor/site-shell in
 * package.json, materialized by the workflow shell checkout), and the
 * shell repo is the publish source: its default branch routinely runs
 * ahead of its own npm channel, and that cadence belongs to the shell
 * repo, not to this site. The staleness this leg can honestly assert
 * is the other direction: npm's published channel must never carry a
 * release the vendored checkout lacks. A red here means the vendor pin
 * has fallen behind a real published release, or someone moved the
 * dependency off the file:vendor channel, and both are this repo's
 * rot to fix.
 *
 * The leg exits 0 when the pin is coherent and npm carries nothing the
 * vendor lacks, and exits 1 with the two versions printed otherwise.
 */

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

function fail(message) {
  console.error(`::error::${message}`)
  process.exit(1)
}

function parseVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version || '')
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function isAhead(candidate, base) {
  for (let i = 0; i < 3; i++) {
    if (candidate[i] !== base[i]) return candidate[i] > base[i]
  }
  return false
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const spec = pkg.dependencies['@oimlsmart/site-shell']
if (spec !== 'file:vendor/site-shell') {
  fail(`the house shell moved off the vendored pin: package.json carries @oimlsmart/site-shell "${spec}", expected "file:vendor/site-shell"`)
}

const pinned = JSON.parse(readFileSync('vendor/site-shell/package.json', 'utf8')).version
const pinnedTriple = parseVersion(pinned)
if (!pinnedTriple) fail(`the vendored shell's package.json carries an unparseable version "${pinned}"`)

let latest
try {
  latest = execFileSync('npm', ['view', '@oimlsmart/site-shell', 'version'], { encoding: 'utf8' }).trim()
} catch {
  fail('npm view failed: the registry did not answer, so the pin cannot be judged')
}
const latestTriple = parseVersion(latest)
if (!latestTriple) fail(`npm's published channel carries an unparseable version "${latest}"`)

console.log(`vendored shell: ${pinned} · npm latest: ${latest}`)
if (isAhead(latestTriple, pinnedTriple)) {
  fail(`the vendored shell pin is behind the published channel: npm carries ${latest}, the vendor checkout declares ${pinned} — move vendor/site-shell forward to the published release`)
}
console.log('the vendored shell pin satisfies the published channel')
