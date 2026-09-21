#!/usr/bin/env node
/**
 * The nav completeness gate for this site — the CI check that every
 * href in the nav model resolves to a real page (TODO.public track 02,
 * where the nav moved into this repository and grew its own gate).
 *
 * It wraps the installed shell package's check-nav (the one completeness
 * gate, no second implementation) with this site's one twist: a handful
 * of nav routes are served by SIBLING deployments on the same front
 * door (the component minisites under /recs, /cnml, /studio, … and the
 * concepts-management app), so this repo's dist cannot carry them —
 * the same split the lychee config encodes as exclusions and the
 * links workflow verifies live. The wrapper reads the render model
 * (src/data/nav-config.ts, the ONE copy every surface renders), marks
 * exactly those entries external for the check, and hands the result
 * to the package tool:
 *
 *   - www-served routes are checked against the built --dist tree,
 *     including the page-quality legs (redirect stubs, coming-soon
 *     markers, thin mains);
 *   - the cross-deployment routes are fetched against --origin (or
 *     skipped, reported as skipped, under --offline);
 *
 * Usage (the npm script `check:nav` runs the first form):
 *
 *   node scripts/check-nav.mjs                      # build dist first
 *   node scripts/check-nav.mjs --offline            # no-network runs
 *
 * Exit 0 when every entry resolves; exit 1 with each failing entry
 * named otherwise.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MODEL_FILE = join(ROOT, 'src', 'data', 'nav-config.ts')
const DIST_DIR = join(ROOT, 'dist')
const ORIGIN = 'https://www.oimlsmart.org'

// The routes another deployment serves on the shared front door — the
// lychee config's sibling list is the canonical statement of this set
// (links.yml curls each one live per push). Everything else in the nav
// is this repo's to serve and is checked against dist.
const CROSS_DEPLOYMENT_PREFIXES = [
  '/recs',
  '/vocab',
  '/publications',
  '/resolutions',
  '/certificates',
  '/studio',
  '/smi',
  '/sst',
  '/cnml',
  '/concepts-management',
]

function fail(message) {
  console.error(`check-nav: ${message}`)
  process.exit(1)
}

// --- load the render model under node's type stripping ---------------------

function loadModel(file) {
  if (!existsSync(file)) fail(`the nav model is missing: ${file}`)
  const specifier = JSON.stringify(pathToFileURL(file).href)
  const code = `import(${specifier}).then(m => { process.stdout.write(JSON.stringify(m.NAV_MODEL ?? m.nav ?? m.default ?? m)) })`
  const run = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', code], { encoding: 'utf8' })
  if (run.status !== 0 || !run.stdout) {
    fail(`could not load the nav model (node >= 22.6 required): ${(run.stderr || '').trim()}`)
  }
  return JSON.parse(run.stdout)
}

// --- mark the cross-deployment entries external for the check --------------

function entryHref(item) {
  if (item?.type === 'dropdown') return (item.config?.links ?? []).map(l => l.href)
  if (item?.type === 'link') return [item.href]
  return []
}

function isCrossDeployment(href) {
  return CROSS_DEPLOYMENT_PREFIXES.some(p => href === p || href.startsWith(p + '/') || href.startsWith(p + '?') || href.startsWith(p + '#'))
}

function transform(model) {
  const flipped = []
  for (const item of model.items ?? []) {
    if (item.type === 'dropdown') {
      for (const link of item.config?.links ?? []) {
        if (!link.external && isCrossDeployment(link.href)) {
          link.external = true
          flipped.push(link.href)
        }
      }
    } else if (item.type === 'link' && !item.external && isCrossDeployment(item.href)) {
      item.external = true
      flipped.push(item.href)
    }
  }
  if (model.productCta && !model.productCta.external && isCrossDeployment(model.productCta.href)) {
    model.productCta.external = true
    flipped.push(model.productCta.href)
  }
  return flipped
}

// --- main -------------------------------------------------------------------

const argv = process.argv.slice(2)
const offline = argv.includes('--offline')

if (!offline && !existsSync(DIST_DIR)) {
  fail(`no dist/ to check against — run \`npm run build\` first (or pass --offline)`)
}

const model = loadModel(MODEL_FILE)
const flipped = transform(model)

const dir = mkdtempSync(join(tmpdir(), 'www-check-nav-'))
const checkModel = join(dir, 'nav-model.check.json')
writeFileSync(checkModel, JSON.stringify(model))

// The direct dependency's install path (npm's layout guarantees it; the
// package's exports map exposes no package.json to import-resolve).
const packageCheckNav = join(ROOT, 'node_modules', '@oimlsmart', 'site-shell', 'scripts', 'check-nav.mjs')
if (!existsSync(packageCheckNav)) fail(`the shell package's check-nav is missing: ${packageCheckNav} — is @oimlsmart/site-shell installed?`)

const args = [packageCheckNav, checkModel, '--dist', DIST_DIR, '--origin', ORIGIN, ...argv]
const run = spawnSync(process.execPath, args, { stdio: 'inherit' })
if (run.status === 0) {
  console.log(`www check-nav: ${flipped.length} entries checked live as cross-deployment routes (${CROSS_DEPLOYMENT_PREFIXES.length} declared prefixes), the rest against dist/.`)
}
process.exit(run.status ?? 1)
