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
 * A second twist sits on top of the first. A cross-deployment route
 * that serves a CLIENT-RENDERED app shell cannot pass the tool's
 * fetched-body heuristics, because the fetched body is the pre-hydration
 * shell: /vocab retired its post-build shell injection on 2026-09-26
 * (vocab#126) and now serves the Glossarist-native app, whose fetched
 * <main> carries a heading's worth of words while the hydrated page
 * renders hundreds. The page is healthy; the body heuristics are simply
 * meaningless for a route whose content arrives only after hydration.
 * The wrapper therefore checks the declared client-rendered routes
 * itself — resolution only, a 2xx against the origin, or a reported
 * skip under --offline — and removes them from the model handed to the
 * package tool, so the stub/placeholder legs never see them.
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

// The cross-deployment routes that serve a CLIENT-RENDERED app shell,
// declared as exact prefixes out of the set above. Their fetched body
// is the pre-hydration shell, so the tool's stub/placeholder legs would
// condemn a healthy page (the header comment carries the /vocab story);
// the wrapper checks these itself, resolution only, and keeps them out
// of the model the tool sees. A route joins this list only when its
// deployment serves a hydrated application rather than static HTML.
const CLIENT_RENDERED_ROUTES = [
  '/vocab',
]

// The per-request timeout of the wrapper's own fetches, matching the
// package tool's default so both legs fail on the same clock.
const FETCH_TIMEOUT_MS = 10000

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

// --- the client-rendered routes: the wrapper's own resolution-only leg -----

function entryHref(item) {
  if (item?.type === 'dropdown') return (item.config?.links ?? []).map(l => l.href)
  if (item?.type === 'link') return [item.href]
  return []
}

function isClientRendered(href) {
  return CLIENT_RENDERED_ROUTES.some(p => href === p || href.startsWith(p + '/') || href.startsWith(p + '?') || href.startsWith(p + '#'))
}

// Remove the client-rendered entries from the model (the tool's body
// heuristics must never see them) and return their hrefs for the
// wrapper's own resolution-only leg.
function extractClientRendered(model) {
  const removed = []
  model.items = (model.items ?? []).filter(item => {
    if (item.type === 'dropdown') {
      const links = item.config?.links ?? []
      item.config.links = links.filter(link => {
        if (isClientRendered(link.href)) { removed.push(link.href); return false }
        return true
      })
      return true
    }
    if (item.type === 'link' && isClientRendered(item.href)) { removed.push(item.href); return false }
    return true
  })
  if (model.productCta && isClientRendered(model.productCta.href)) {
    removed.push(model.productCta.href)
    delete model.productCta
  }
  return removed
}

// The resolution-only leg: a 2xx against the origin proves the sibling
// deployment serves the route; the body says nothing about a page that
// hydrates in the browser. Returns null on success, a problem string
// otherwise.
async function checkClientRendered(href, origin) {
  const target = origin.replace(/\/$/, '') + href
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) return `${href}: HTTP ${res.status} at ${res.url} — a client-rendered route is checked resolution-only, but it must resolve`
    return null
  } catch (e) {
    return `${href}: unreachable (${e.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS}ms` : e.message})`
  }
}

// --- mark the cross-deployment entries external for the check --------------

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

// The client-rendered routes leave the model before the tool sees it;
// the wrapper runs their resolution-only leg itself. Under --offline
// the leg reports a skip, the same posture the tool gives the other
// external fetches.
const clientRendered = extractClientRendered(model)
if (clientRendered.length) {
  if (offline) {
    console.log(`www check-nav: ${clientRendered.length} client-rendered route(s) skipped under --offline (resolution-only): ${clientRendered.join(', ')}`)
  } else {
    const failures = []
    for (const href of clientRendered) {
      const problem = await checkClientRendered(href, ORIGIN)
      if (problem) failures.push(problem)
      else console.log(`www check-nav: ${href} — client-rendered (resolution-only): resolves at ${ORIGIN}`)
    }
    if (failures.length) {
      console.error(`www check-nav FAILED: ${failures.length} client-rendered route(s) do not resolve:`)
      for (const f of failures) console.error(`  - ${f}`)
      process.exit(1)
    }
  }
}

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
  const crLeg = offline ? 'skipped under --offline' : 'checked resolution-only by the wrapper'
  console.log(`www check-nav: ${flipped.length} entries checked live as cross-deployment routes (${CROSS_DEPLOYMENT_PREFIXES.length} declared prefixes), ${clientRendered.length} client-rendered route(s) ${crLeg}, the rest against dist/.`)
}
process.exit(run.status ?? 1)
