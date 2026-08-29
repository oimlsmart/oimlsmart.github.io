#!/usr/bin/env tsx
/**
 * capture-technologies.ts — the technology pages' screenshot apparatus
 * (TODO.promotion/10: screenshots are scripted, never hand-snapped).
 *
 * Drives the LIVE surfaces headlessly (Playwright chromium), per page,
 * light + dark, and writes the captures into
 * `public/img/technologies/<page>/` next to a `manifest.json` recording
 * the capture date, the source URL, and the probe status of every live
 * link the pages cite (the capability inventory's audit artifact).
 *
 * Usage:
 *   npx tsx scripts/capture-technologies.ts [--only <page>] [--skip-probes]
 *
 * Node 24 runs this file directly (`node scripts/capture-technologies.ts`);
 * older Nodes need the tsx shim. Requires the chromium browser once:
 * `npx playwright install chromium`.
 *
 * The demo captures sign in with the demo's one-click role accounts (the
 * login page's public demo-account grid). No credentials leave the
 * machine; the session lives only inside the Playwright context and a
 * state file under the OS temp dir (never inside the repo).
 */
import { chromium, type Browser, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const OUT = resolve(process.cwd(), 'public/img/technologies')
const ONLY = (() => {
  const i = process.argv.indexOf('--only')
  return i >= 0 ? process.argv[i + 1] : null
})()
const SKIP_PROBES = process.argv.includes('--skip-probes')
const CAPTURED = new Date().toISOString().slice(0, 10)

const VIEWPORT = { width: 1440, height: 900 }

interface Shot {
  /** File stem: <page>/<stem>-light.png + -dark.png (or -light only when dark === false). */
  stem: string
  url: string
  /** Sign in to the demo first with this role-button name (the login page's one-click grid). */
  demoRole?: string
  /** Capture the dark variant too (default true). */
  dark?: boolean
  /** Extra settle time in ms after networkidle (client-rendered surfaces). */
  settle?: number
  /** Optional readiness probe: a selector that must appear before the shot. */
  ready?: string
  /** Optional interaction before the shot: click this exact text (e.g. a
   *  tree row in the studio viewer) so the inspector shows real content. */
  clickText?: string
  /** Settle time in ms after the click (provisioning a twin takes seconds). */
  postClickSettle?: number
}

const SHOTS: Record<string, Shot[]> = {
  'smart-recommendations': [
    { stem: 'studio-viewer', url: 'https://www.oimlsmart.org/studio/view/', settle: 6000, clickText: 'submit_application' },
    { stem: 'r60-page', url: 'https://www.oimlsmart.org/recommendations/r60/', settle: 4000 },
  ],
  primmel: [
    { stem: 'studio-viewer', url: 'https://www.oimlsmart.org/studio/view/', settle: 6000, clickText: 'submit_application' },
    { stem: 'language-volume', url: 'https://www.primmel.org/primmel-smart-docs/primmel/', settle: 4000 },
  ],
  'smart-twin': [
    { stem: 'twin-console', url: 'https://demo.oimlsmart.org/app/twin', demoRole: 'Admin', settle: 8000, clickText: 'Provision the demo twin', postClickSettle: 15000 },
    { stem: 'twin-lab', url: 'https://demo.oimlsmart.org/app/twin-lab', demoRole: 'Admin', settle: 8000 },
    { stem: 'smi-site', url: 'https://www.oimlsmart.org/smi/', settle: 4000 },
  ],
  sst: [
    { stem: 'sim-bench', url: 'https://demo.oimlsmart.org/app/sim', demoRole: 'Admin', settle: 8000 },
    { stem: 'sst-site', url: 'https://www.oimlsmart.org/sst/', settle: 4000 },
  ],
  cnml: [
    { stem: 'verify', url: 'https://www.oimlsmart.org/cnml/verify', settle: 5000 },
    { stem: 'cnml-site', url: 'https://www.oimlsmart.org/cnml/', settle: 4000 },
  ],
  'identity-federation': [
    { stem: 'id-service', url: 'https://id.oimlsmart.org/', settle: 5000 },
    { stem: 'join-flow', url: 'https://id.oimlsmart.org/op/join', settle: 5000 },
  ],
  'trust-registry': [
    // The resolution contract IS the surface: the registry's answer, in the browser.
    { stem: 'resolve-member-state', url: 'https://id.oimlsmart.org/op/keys/ms-de.json', dark: false, settle: 2000 },
    { stem: 'resolve-unknown-org', url: 'https://id.oimlsmart.org/op/keys/EX1.json', dark: false, settle: 2000 },
  ],
  'dataspace-interop': [
    // The DPP carrier form on the demo's certificate is the live interop
    // proof; it is a JSON endpoint (probed below), and the demo's nightly
    // reset can leave the certificate awaiting its signing pass (the
    // endpoints answer 409 until re-sealed), so the visual evidence is
    // the interop chapter.
    { stem: 'interop-chapter', url: 'https://www.primmel.org/primmel-smart-docs/primmel/12-interop/', settle: 4000 },
  ],
}

/** Every live URL the technology pages cite; probed at capture time and
 *  recorded in the manifest (the inventory's honesty audit). The demo's
 *  certificate carrier forms accept 409 as the documented reset window:
 *  the demo resets nightly, and an unsigned certificate answers 409
 *  ("carries no signed CNML record") until the signing pass re-seals it. */
const PROBES: Record<string, string[]> = {
  'smart-recommendations': [
    'https://www.oimlsmart.org/recommendations/r60/',
    'https://www.oimlsmart.org/recs/',
    'https://www.oimlsmart.org/studio/view/',
    'https://demo.oimlsmart.org/',
  ],
  primmel: [
    'https://www.primmel.org/primmel-smart-docs/primmel/',
    'https://www.primmel.org/primmel-smart-docs/shared/alternatives-audit/',
    'https://github.com/primmel/primmel-ts',
    'https://github.com/primmel/primmel-ts/tree/v1/conformance',
    'https://github.com/primmel/editor',
    'https://www.primmel.org/primmel-smart-docs/foundation/',
  ],
  'smart-twin': [
    'https://www.oimlsmart.org/smi/',
    'https://www.oimlsmart.org/smi/docs/',
    'https://www.primmel.org/primmel-smart-docs/platform/',
    'https://demo.oimlsmart.org/',
  ],
  sst: [
    'https://www.oimlsmart.org/sst/',
    'https://demo.oimlsmart.org/',
    'https://github.com/primmel/sst',
    'https://github.com/oimlsmart/sst-instruments',
  ],
  cnml: [
    'https://www.oimlsmart.org/cnml/',
    'https://www.oimlsmart.org/cnml/verify',
    'https://github.com/oimlsmart/cnml',
    'https://demo.oimlsmart.org/',
    'https://demo.oimlsmart.org/api/certificates/crt-acme-lc/vc',
    'https://demo.oimlsmart.org/api/certificates/crt-acme-lc/vc?format=sd-jwt',
    'https://demo.oimlsmart.org/api/certificates/crt-acme-lc/dpp',
    'https://demo.oimlsmart.org/api/certificates/crt-acme-lc/aas-submodel',
    'https://www.oimlsmart.org/cnml/docs/specifications/composition',
    'https://www.signatif.org/',
  ],
  'identity-federation': [
    'https://id.oimlsmart.org/',
    'https://id.oimlsmart.org/.well-known/openid-configuration',
    'https://github.com/oimlsmart/identity',
    'https://github.com/oimlsmart/identity/blob/main/docs/deployment/identity-self-host.md',
  ],
  'trust-registry': [
    'https://id.oimlsmart.org/op/keys/ms-de.json',
    'https://id.oimlsmart.org/',
    'https://demo.oimlsmart.org/.well-known/did.json',
  ],
  'dataspace-interop': [
    'https://www.primmel.org/primmel-smart-docs/primmel/12-interop/',
    'https://demo.oimlsmart.org/',
    'https://demo.oimlsmart.org/api/certificates/crt-acme-lc/dpp',
    'https://www.w3.org/TR/odrl-model/',
    'https://docs.internationaldataspaces.org/ids-knowledgebase/ids-ram-4/',
  ],
}

interface ManifestFile {
  file: string
  source: string
  demoRole?: string
}
interface Manifest {
  captured: string
  pages: Record<string, { files: ManifestFile[]; probes: Record<string, number> }>
}

async function demoSignIn(page: Page, role: string): Promise<void> {
  await page.goto('https://demo.oimlsmart.org/app/login/', { waitUntil: 'networkidle', timeout: 60000 })
  // The login page's demo grid lists the one-click role accounts.
  const button = page.getByRole('button', { name: new RegExp(`^${role}\\b`) }).first()
  await button.waitFor({ state: 'visible', timeout: 30000 })
  await button.click()
  await page.waitForURL((url) => !url.pathname.startsWith('/app/login'), { timeout: 60000 })
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {})
}

async function shoot(
  browser: Browser,
  pageName: string,
  shot: Shot,
  variant: 'light' | 'dark',
  storageState?: string,
): Promise<{ ok: boolean; note?: string }> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: variant,
    storageState,
  })
  try {
    const page = await context.newPage()
    // The demo app's theme key differs from the shell's; seed both so the
    // variant is deterministic even where a surface stores the choice.
    await page.addInitScript((v) => {
      try {
        localStorage.setItem('oiml-theme', v)
        localStorage.setItem('oiml-smart-theme', v)
      } catch { /* cross-origin init pages: ignore */ }
    }, variant)
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 90000 })
    if (shot.ready) await page.waitForSelector(shot.ready, { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(shot.settle ?? 3000)
    if (shot.clickText) {
      await page.getByText(shot.clickText, { exact: true }).first().click().catch(() => {})
      await page.waitForTimeout(shot.postClickSettle ?? 1500)
    }
    const dir = join(OUT, pageName)
    mkdirSync(dir, { recursive: true })
    await page.screenshot({ path: join(dir, `${shot.stem}-${variant}.png`), fullPage: false })
    return { ok: true }
  } catch (err) {
    return { ok: false, note: String(err).slice(0, 200) }
  } finally {
    await context.close()
  }
}

async function probe(url: string): Promise<number> {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) })
    return res.status
  } catch {
    return 0
  }
}

/** Statuses that count as honest answers per URL pattern. The demo's
 *  certificate carrier forms accept 409 (the documented reset window:
 *  the demo resets nightly and an unsealed certificate answers 409 until
 *  the signing pass re-seals it). Everything else expects 2xx/3xx. */
function probeOk(url: string, status: number): boolean {
  if (url.includes('/api/certificates/')) return (status >= 200 && status < 400) || status === 409
  return status >= 200 && status < 400
}

async function main() {
  const browser = await chromium.launch()
  const manifest: Manifest = { captured: CAPTURED, pages: {} }
  let failures = 0

  // One demo session per role, reused across that role's captures.
  const roleStates = new Map<string, string>()
  async function stateFor(role: string): Promise<string | undefined> {
    const cached = roleStates.get(role)
    if (cached) return cached
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 })
    try {
      const page = await context.newPage()
      await demoSignIn(page, role)
      const file = join(tmpdir(), `oimlsmart-capture-session-${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`)
      await context.storageState({ path: file })
      roleStates.set(role, file)
      return file
    } catch (err) {
      console.error(`  demo sign-in as ${role} FAILED: ${String(err).slice(0, 160)}`)
      return undefined
    } finally {
      await context.close()
    }
  }

  for (const [pageName, shots] of Object.entries(SHOTS)) {
    if (ONLY && pageName !== ONLY) continue
    console.log(`\n== ${pageName} ==`)
    manifest.pages[pageName] = { files: [], probes: {} }
    for (const shot of shots) {
      const storageState = shot.demoRole ? await stateFor(shot.demoRole) : undefined
      if (shot.demoRole && !storageState) {
        console.error(`  SKIP ${shot.stem}: no demo session`)
        failures++
        continue
      }
      for (const variant of ['light', 'dark'] as const) {
        if (variant === 'dark' && shot.dark === false) continue
        const res = await shoot(browser, pageName, shot, variant, storageState)
        const file = `${pageName}/${shot.stem}-${variant}.png`
        if (res.ok) {
          manifest.pages[pageName].files.push({ file, source: shot.url, demoRole: shot.demoRole })
          console.log(`  ${file}  <-  ${shot.url}`)
        } else {
          console.error(`  FAIL ${file}: ${res.note}`)
          failures++
        }
      }
    }
    if (!SKIP_PROBES) {
      for (const url of PROBES[pageName] ?? []) {
        const status = await probe(url)
        manifest.pages[pageName].probes[url] = status
        const bad = !probeOk(url, status)
        if (bad) failures++
        console.log(`  probe ${status} ${url}${bad ? '  <-- FAILED' : ''}`)
      }
    }
  }

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\nmanifest.json written (${CAPTURED}); ${failures} failure(s)`)
  await browser.close()
  if (failures > 0) process.exit(1)
}

await main()
