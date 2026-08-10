#!/usr/bin/env tsx
/**
 * sync-branding — the logo SSOT seam (TODO.components).
 *
 * The canonical logo assets are AUTHORED in the private
 * `oimlsmart/branding` repo. This site carries the ONE public copy at
 * `public/img/components/`; every other component site references those
 * URLs (never its own copy). Run this when the branding repo changes:
 *
 *   npx tsx scripts/sync-branding.ts [--check]
 *
 * `--check` (CI): exit non-zero on any drift, listing the differing
 * files. Without it: refresh the copies. The branding repo is private,
 * so the sync reads a sibling checkout (BRANDING_REPO env, default
 * ~/src/oimlsmart/branding); when the checkout is absent the check
 * skips honestly.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const BRANDING = process.env.BRANDING_REPO ?? null
const DEST = resolve(process.cwd(), 'public/img/components')
const CHECK = process.argv.includes('--check')

/** branding filename → canonical public name */
const MAP: Record<string, string> = {
  'oiml-logo_smart-rec-light.svg': 'smart-rec-light.svg',
  'oiml-logo_smart-rec-dark.svg': 'smart-rec-dark.svg',
  'oiml-logo_smart-studio-light.svg': 'smart-studio-light.svg',
  'oiml-logo_smart-studio-dark.svg': 'smart-studio-dark.svg',
  'oiml-logo_cs-smart-light.svg': 'cs-smart-light.svg',
  'oiml-logo_cs-smart-dark.svg': 'cs-smart-dark.svg',
  'oiml-logo_smi-light.svg': 'smi-light.svg',
  'oiml-logo_smi-dark.svg': 'smi-dark.svg',
  'oiml-logo_sst-light.svg': 'sst-light.svg',
  'oiml-logo_sst-dark.svg': 'sst-dark.svg',
  'oiml-logo_cnml-box-light.svg': 'cnml-box-light.svg',
  'oiml-logo_cnml-box-dark.svg': 'cnml-box-dark.svg',
}

function sha(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

if (BRANDING === null || !existsSync(BRANDING)) {
  console.log('BRANDING_REPO unset or absent — the sync skips honestly (declare the branding checkout via BRANDING_REPO)')
  process.exit(0)
}

let drift = 0
for (const [src, dest] of Object.entries(MAP)) {
  const from = join(BRANDING, src)
  const to = join(DEST, dest)
  if (!existsSync(from)) {
    console.log(`MISSING in branding: ${src}`)
    drift++
    continue
  }
  const same = existsSync(to) && sha(from) === sha(to)
  if (!same) {
    drift++
    if (CHECK) {
      console.log(`DRIFT: ${dest} ≠ branding/${src}`)
    } else {
      mkdirSync(DEST, { recursive: true })
      copyFileSync(from, to)
      console.log(`synced: ${dest}`)
    }
  }
}
// Extra files in DEST that no MAP entry owns.
if (existsSync(DEST)) {
  for (const f of readdirSync(DEST)) {
    if (!Object.values(MAP).includes(f)) {
      console.log(`UNOWNED in dest: ${f}`)
      drift++
    }
  }
}
if (CHECK) {
  if (drift > 0) {
    console.log(`${drift} drift(s) — run npx tsx scripts/sync-branding.ts to refresh`)
    process.exit(1)
  }
  console.log(`branding ≡ public/img/components byte-clean (${Object.keys(MAP).length} files)`)
} else if (drift === 0) {
  console.log('already byte-clean')
}
