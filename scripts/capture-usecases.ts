#!/usr/bin/env tsx
/**
 * capture-usecases — the scripted screenshot apparatus for the use-case
 * pages (TODO.promotion/05, under the page-depth anatomy of
 * TODO.promotion/10; the freshness-gate re-run target of
 * TODO.promotion/08). Sibling of capture-audiences.ts /
 * capture-services.ts / capture-technologies.ts — this script owns
 * public/img/usecases/ ONLY and never writes the siblings' folders.
 *
 * Every screenshot the use-case pages publish is captured HERE, never
 * hand-snapped: the script drives the LIVE demo (demo.oimlsmart.org),
 * the pilot instances (nmi.oimlsmart.org, tl.oimlsmart.org), the
 * identity service (id.oimlsmart.org) and the SST site headlessly,
 * performs each act the pages list, and saves the artifact under
 * public/img/usecases/<page>/ as `<stem>-<theme>.png` (stable names:
 * re-runs overwrite in place, so a freshness regeneration never touches
 * the page sources; the capture DATE lives in the manifest record and
 * each page's ShotFigure `captured` prop). The manifest
 * (public/img/usecases/manifest.json) records per capture: the page,
 * the act performed, the URL, the theme, the timestamp. An act the
 * script cannot perform does not get a capture, and per the anatomy
 * contract does not list on a page.
 *
 * Usage:
 *
 *   npx tsx scripts/capture-usecases.ts              # everything
 *   npx tsx scripts/capture-usecases.ts --only=twin,anr
 *   npx tsx scripts/capture-usecases.ts --light      # one theme only
 *
 * Env: DEMO_BASE (default https://demo.oimlsmart.org), NMI_BASE
 * (https://nmi.oimlsmart.org), TL_BASE (https://tl.oimlsmart.org),
 * ID_BASE (https://id.oimlsmart.org), CAPTURE_DATE (default: today).
 *
 * The demo is the nightly-reset fictional instance; every leg here is
 * READ-ONLY against it (the register story stays the seeded one). The
 * sign-in pattern mirrors the platform e2e harness ported to Playwright
 * (see capture-audiences.ts for the drive-chain variant). The house
 * rules hold: the demo banner stays in frame, the viewport is 1440x900.
 */
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DEMO = (process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org').replace(/\/$/, '')
const NMI = (process.env.NMI_BASE ?? 'https://nmi.oimlsmart.org').replace(/\/$/, '')
const TL = (process.env.TL_BASE ?? 'https://tl.oimlsmart.org').replace(/\/$/, '')
const ID = (process.env.ID_BASE ?? 'https://id.oimlsmart.org').replace(/\/$/, '')
const SST = (process.env.SST_BASE ?? 'https://www.oimlsmart.org/sst/').replace(/\/$/, '') + '/'
const DATE = process.env.CAPTURE_DATE ?? new Date().toISOString().slice(0, 10)
const OUT = resolve(import.meta.dirname, '..', 'public', 'img', 'usecases')
const MANIFEST = join(OUT, 'manifest.json')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length)
const ONLY_LIST = ONLY ? ONLY.split(',').map(s => s.trim()).filter(Boolean) : null
const THEMES = process.argv.includes('--light') ? ['light'] as const
  : process.argv.includes('--dark') ? ['dark'] as const
  : ['light', 'dark'] as const

const NAV_TIMEOUT = 60_000
// The demo's first island paint after a cold login measured ~115s
// (2026-08-30, capture-audiences.ts): waits poll and return early.
const SETTLE = 240_000
const LOGIN_SETTLE = 300_000

// ── Harness (the same ported pattern as capture-audiences.ts) ────────

async function gotoCommit(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'commit', timeout: NAV_TIMEOUT })
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT })
}

async function waitIslandSettled(page: Page) {
  await page.waitForFunction(
    () => {
      if (document.querySelector('.animate-spin')) return false
      if (document.querySelector('[data-layout="app"]')) return true
      return (document.body?.innerText?.length ?? 0) > 1200
    },
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
}

async function gotoApp(page: Page, path: string) {
  await gotoCommit(page, `${DEMO}${path}`)
  try {
    await waitIslandSettled(page)
  } catch {
    // A long role context can wedge a settle on a later navigation (the
    // boot spinner persists). One honest reload unsticks it; a second
    // wedge fails the leg for real.
    console.log(`  · settle wedged on ${path}; reloading once`)
    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }).catch(() => {})
    await waitIslandSettled(page)
  }
}

async function signOut(context: BrowserContext) {
  await context.request.post(`${DEMO}/api/auth/signout`).catch(() => {})
}

async function loginAs(context: BrowserContext, page: Page, name: string, prefix: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await signOut(context)
    await gotoCommit(page, `${DEMO}/app/login`)
    const landed = await page.waitForFunction(
      (wanted) => {
        if (!window.location.pathname.startsWith('/app/login')) return 'redirected'
        return Array.from(document.querySelectorAll('button'))
          .some(b => b.querySelector('span')?.textContent?.trim() === wanted) ? 'ready' : false
      },
      name,
      { timeout: SETTLE, polling: 500 },
    ).then(h => h.jsonValue()).catch(() => 'timeout')
    if (landed === 'ready') break
    await page.evaluate(async () => {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    }).catch(() => {})
    if (attempt === 2) throw new Error(`login page never offered the "${name}" demo account`)
  }
  await page.evaluate((wanted) => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.querySelector('span')?.textContent?.trim() === wanted)
    ;(btn as HTMLElement).click()
  }, name)
  // The redirect trails bootstrap({force: true}); a wedged bootstrap
  // (the demo under load) is retried once from a clean sign-out.
  for (let attempt = 0; attempt < 2; attempt++) {
    const landed = await page.waitForFunction(
      (p) => window.location.pathname.startsWith(p) && window.location.pathname !== '/app/login',
      prefix,
      { timeout: LOGIN_SETTLE, polling: 500 },
    ).then(() => true).catch(() => false)
    if (landed) break
    if (attempt === 1) throw new Error(`login as "${name}" never redirected`)
    console.log(`  · login as "${name}" wedged before the redirect; retrying once`)
    await signOut(context)
    await gotoCommit(page, `${DEMO}/app/login`)
    await page.waitForFunction(
      (wanted) => Array.from(document.querySelectorAll('button'))
        .some(b => b.querySelector('span')?.textContent?.trim() === wanted),
      name,
      { timeout: SETTLE, polling: 500 },
    )
    await page.evaluate((wanted) => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.querySelector('span')?.textContent?.trim() === wanted)
      ;(btn as HTMLElement).click()
    }, name)
  }
  await waitIslandSettled(page)
}

async function waitTestId(page: Page, testid: string) {
  await page.waitForSelector(`[data-testid="${testid}"]`, { timeout: SETTLE })
}

/** Wait for content, not just shell: a shot is only honest once a string
 *  only real data produces is on the page. */
async function waitText(page: Page, text: string) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    text,
    { timeout: SETTLE, polling: 500 },
  )
}

/** The Skeleton placeholders (.skel) mount WITH the shell while the data
 *  trails; a shot before they clear photographs the shimmer. */
async function waitSkeletonGone(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('.skel'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
}

async function clickTestId(page: Page, testid: string) {
  await page.waitForSelector(`[data-testid="${testid}"]`, { timeout: SETTLE })
  const found = await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`)
    if (el) { (el as HTMLElement).click(); return true }
    return false
  }, testid)
  if (!found) throw new Error(`clickTestId: ${testid} not on the page`)
}

// ── The capture registry ─────────────────────────────────────────────

interface CaptureRecord {
  page: string
  name: string
  file: string
  url: string
  theme: string
  performed: string
  capturedAt: string
}
const records: CaptureRecord[] = []

function wants(name: string) {
  return !ONLY_LIST || ONLY_LIST.some(o => name.includes(o))
}

// The manifest flushes after EVERY shot (partial runs and crashes kept
// their records: the 2026-08-31 run watched a single bad leg discard a
// run's worth of audit trail). Merge is file-keyed; the manifest is the
// dated audit record for ALL captures.
interface Manifest { generatedAt: string; captureDate: string; records: CaptureRecord[] }
function flushManifest() {
  let existing: CaptureRecord[] = []
  try {
    existing = (JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest).records ?? []
  } catch { /* first run */ }
  const fresh = new Set(records.map(r => r.file))
  const merged = [...existing.filter(r => !fresh.has(r.file)), ...records]
  mkdirSync(OUT, { recursive: true })
  writeFileSync(MANIFEST, JSON.stringify({ generatedAt: new Date().toISOString(), captureDate: DATE, records: merged }, null, 2) + '\n')
}

async function shoot(page: Page, pageFolder: string, name: string, theme: string, performed: string, opts?: { fullPage?: boolean }) {
  const dir = join(OUT, pageFolder)
  mkdirSync(dir, { recursive: true })
  const file = `${name}-${theme}.png`
  await page.screenshot({ path: join(dir, file), fullPage: opts?.fullPage ?? false })
  records.push({
    page: pageFolder, name, file: `${pageFolder}/${file}`, url: page.url(), theme, performed,
    capturedAt: new Date().toISOString(),
  })
  flushManifest()
  console.log(`  📷 ${pageFolder}/${file} — ${performed}`)
}

/** A themed context (the demo reads localStorage 'oiml-smart-theme',
 *  the site-shell surfaces 'oiml-theme'; both fall back to the emulated
 *  prefers-color-scheme). The demo's PWA service worker is aborted: its
 *  navigateFallback would serve the landing shell for the SSR detail
 *  routes these legs drive (same workaround as capture-audiences.ts). */
async function themedContext(browser: Browser, theme: string) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  })
  await context.route('**/sw.js', r => r.abort())
  await context.route('**/registerSW.js', r => r.abort())
  await context.addInitScript((t) => {
    try {
      localStorage.setItem('oiml-smart-theme', t)
      localStorage.setItem('oiml-theme', t)
      navigator.serviceWorker?.getRegistrations?.().then(rs => rs.forEach(r => r.unregister()))
    } catch { /* cross-origin init pages — the media query covers them */ }
  }, theme)
  return context
}

let currentTheme = 'light'

// ── The public legs (no account) ──────────────────────────────────────

async function capturePublic(browser: Browser) {
  if (!['register', 'verify', 'hub-login', 'nmi-instance', 'tl-instance', 'sst-site', 'identity-join'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()

    if (wants('register')) {
      await gotoApp(page, '/app/register/')
      await page.waitForFunction(
        () => document.body.innerText.includes('Certificate Register') && document.body.innerText.includes('R60/2021-A-EX1-26.01'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'type-evaluation-end-to-end', 'register', theme, 'browsed the public Certificate Register to the published R60/2021-A-EX1-26.01 row — no account', { fullPage: true })
      await shoot(page, 'member-state-view', 'register', theme, 'the public register your regime reads as the validity reference — no account', { fullPage: true })
    }

    if (wants('verify')) {
      for (const pageFolder of ['type-evaluation-end-to-end', 'member-state-view'] as const) {
        await gotoApp(page, '/app/verify/')
        await page.waitForSelector('[data-testid="verify-number"]', { timeout: SETTLE })
        await page.fill('[data-testid="verify-number"]', 'R60/2021-A-EX1-26.01')
        await page.click('[data-testid="verify-submit"]')
        await page.waitForFunction(
          () => document.body.innerText.includes('ACTIVE') && document.body.innerText.includes('BIML registration'),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await shoot(page, pageFolder, 'verify-verdict', theme, 'typed the certificate number R60/2021-A-EX1-26.01 and read the verdict: ACTIVE from the BIML-registered copy, no account', { fullPage: true })
      }
    }

    if (wants('hub-login')) {
      await signOut(context)
      await gotoCommit(page, `${DEMO}/app/login`)
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button'))
          .some(b => b.querySelector('span')?.textContent?.trim() === 'Applicant'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'deployment-modes', 'hub-login', theme, 'the CS-operated hub posture: the demo instance\u2019s login with the one-click demo accounts, every role on one deployment', { fullPage: true })
    }

    if (wants('nmi-instance')) {
      await page.goto(`${NMI}/`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT }).catch(() => {})
      await page.waitForTimeout(2500)
      await shoot(page, 'deployment-modes', 'nmi-instance', theme, 'opened the IA+TL pilot instance at nmi.oimlsmart.org — the same software booted under the member deployment profile', { fullPage: true })
    }

    if (wants('tl-instance')) {
      await page.goto(`${TL}/`, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT }).catch(() => {})
      await page.waitForTimeout(2500)
      await shoot(page, 'deployment-modes', 'tl-instance', theme, 'opened the TL-only pilot instance at tl.oimlsmart.org — the laboratory posture of the same codebase', { fullPage: true })
    }

    if (wants('sst-site')) {
      await gotoCommit(page, SST)
      await page.waitForTimeout(3500)
      await shoot(page, 'training-on-the-sst', 'sst-site', theme, 'met the simulated instruments on the SST site: the consoles, the bench, the scenario library', { fullPage: true })
    }

    if (wants('identity-join')) {
      await gotoCommit(page, `${ID}/op/join/`)
      await page.waitForTimeout(3000)
      await shoot(page, 'member-state-view', 'identity-join', theme, 'opened the identity service join flow: accounts per organization, the member directory selectable', { fullPage: true })
    }

    await context.close()
  }
}

// ── The applicant legs ────────────────────────────────────────────────

async function captureApplicant(browser: Browser) {
  if (!['wizard-recommendation', 'application-journey', 'certificate-issued', 'wizard-anr-step'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Applicant', '/app/portal')

    if (wants('wizard-recommendation') || wants('wizard-anr-step')) {
      await gotoApp(page, '/app/portal/applications/new')
      await waitTestId(page, 'portal-wizard')
      await waitTestId(page, 'wizard-step-1')
      if (wants('wizard-recommendation')) {
        await shoot(page, 'type-evaluation-end-to-end', 'wizard-recommendation', theme, 'opened the new-application wizard: step 1 is the explicit Recommendation pick (R 60, R 91, R 129, R 144 cards)')
      }
    }

    if (wants('application-journey')) {
      await gotoApp(page, '/app/portal/applications/app-acme-lc')
      await waitTestId(page, 'portal-application-detail')
      await waitSkeletonGone(page)
      await waitText(page, 'Promise set')
      await shoot(page, 'type-evaluation-end-to-end', 'application-journey', theme, 'followed the application\u2019s six-stage journey: every stage notified, the promise set with per-claim verification status', { fullPage: true })
    }

    if (wants('certificate-issued')) {
      await gotoApp(page, '/app/portal/certificates/crt-acme-lc')
      await page.waitForFunction(
        () => document.body.innerText.includes('OIML CERTIFICATE NO.'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'type-evaluation-end-to-end', 'certificate-issued', theme, 'downloaded-view of the issued certificate R60/2021-A-EX1-26.01 in the OIML layout — the end of the arc', { fullPage: true })
    }

    if (wants('wizard-anr-step')) {
      // Drive the wizard to the scheme/ANR step WITHOUT submitting (the
      // register story stays the seeded one): the same steps the
      // audiences' drive chain walks, stopping before the IA pick.
      // Re-navigate: the journey/certificate legs above moved the page.
      await gotoApp(page, '/app/portal/applications/new')
      await waitTestId(page, 'portal-wizard')
      await waitTestId(page, 'wizard-step-1')
      await page.waitForSelector('[data-testid="wizard-standard-card-oiml-r60"]', { timeout: SETTLE })
      await page.evaluate(() => {
        (document.querySelector('[data-testid="wizard-standard-card-oiml-r60"]') as HTMLElement).click()
      })
      await page.waitForTimeout(800)
      const cont = async (step: number) => {
        const found = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent?.trim().includes('Continue'))
          if (btn) { (btn as HTMLElement).click(); return true }
          return false
        })
        if (!found) throw new Error('wizard: Continue button not found')
        await page.waitForSelector(`[data-testid="wizard-step-${step}"]`, { timeout: SETTLE })
        await page.waitForTimeout(1200)
      }
      await cont(2)
      await cont(3)
      await page.waitForFunction(
        () => {
          const select = document.querySelector('[data-testid="wizard-existing-family"]') as HTMLSelectElement | null
          return !!select && Array.from(select.options).some(o => o.value)
        },
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await page.evaluate(() => {
        const select = document.querySelector('[data-testid="wizard-existing-family"]') as HTMLSelectElement
        const preferred = Array.from(select.options).find(o => o.value === 'fam-acme-lc')
        select.value = (preferred ?? Array.from(select.options).find(o => o.value)!).value
        select.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await page.waitForSelector('[data-testid="wizard-step-3"] input[type="checkbox"]', { timeout: SETTLE })
      await page.waitForTimeout(800)
      await page.evaluate(() => {
        (document.querySelector('[data-testid="wizard-step-3"] input[type="checkbox"]') as HTMLElement).click()
      })
      await page.waitForTimeout(500)
      await cont(4)
      await page.type('[data-testid="wizard-sample-serial"]', `SN-ANR-CAPTURE-${DATE.replace(/-/g, '')}`)
      // The ANR countries sit on the scheme step; on the six-step build
      // that is step 6, on the five-step build step 5. Find the step
      // that carries the ANR fieldset, then shoot it.
      let anrStep = 0
      for (const step of [5, 6]) {
        await cont(step)
        const hasAnr = await page.evaluate(() => document.body.innerText.includes('ANR countries'))
        if (hasAnr) { anrStep = step; break }
      }
      if (!anrStep) throw new Error('wizard: no step carries the ANR countries fieldset')
      const countryCount = await page.evaluate(() =>
        document.querySelectorAll('[data-testid^="wizard-anr-"], fieldset input[type="checkbox"]').length,
      )
      console.log(`  · ANR fieldset on wizard step ${anrStep}; checkbox count ${countryCount}`)
      await shoot(page, 'additional-national-requirements', 'wizard-anr-step', theme, `drove the application wizard to the scheme/ANR step (step ${anrStep}): the target countries' declared ANRs as checkboxes, the application naming what the evaluation must cover`, { fullPage: true })
    }

    await context.close()
  }
}

// ── The Issuing Authority legs ────────────────────────────────────────

async function captureIA(browser: Browser) {
  if (!['review-queue', 'review-file', 'project-hub', 'certificates-desk', 'certificate-lifecycle', 'anr-capability'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Issuing Authority', '/app/ia')

    if (wants('review-queue')) {
      await gotoApp(page, '/app/ia/')
      await waitTestId(page, 'ia-dashboard')
      await waitText(page, 'Review queue')
      await waitSkeletonGone(page)
      await page.waitForSelector('[data-testid^="age-chip-review-"]', { timeout: 20_000 }).catch(() => {})
      await shoot(page, 'type-evaluation-end-to-end', 'review-queue', theme, 'the authority\u2019s intake: the review queue with the applications waiting, oldest first', { fullPage: true })
    }

    if (wants('anr-capability')) {
      // The IA console's ANR test-capability card: the authority declares
      // which ANR tests it can perform, per Recommendation and country
      // (the lifecycle's capability leg).
      await gotoApp(page, '/app/ia/')
      await waitTestId(page, 'ia-dashboard')
      await waitSkeletonGone(page)
      await page.waitForSelector('[data-testid="anr-capability-card"]', { timeout: SETTLE })
      await shoot(page, 'additional-national-requirements', 'anr-capability', theme, 'the authority\u2019s ANR test-capability card on its own console: the declared ANR tests it can perform (the NL damp-heat declaration, tier 2 declared-simple)', { fullPage: true })
    }

    if (wants('review-file')) {
      // Open the application the queue is actually waiting on (its row is
      // a router button, not an anchor; the id changes with the nightly
      // reset). Fallback: the canonical file (accepted long ago; its
      // review record with the closed acts is the same "whole file"
      // surface, honestly labeled).
      await gotoApp(page, '/app/ia/')
      await waitTestId(page, 'ia-dashboard')
      await waitSkeletonGone(page)
      const clicked = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => /SAMPLES_REQUESTED|SUBMITTED/.test(b.textContent ?? '') && /APP-|EX-/.test(b.textContent ?? ''))
        if (btn) { (btn as HTMLElement).click(); return true }
        return false
      })
      if (clicked) {
        await page.waitForFunction(
          () => /\/app\/ia\/applications\//.test(window.location.pathname),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await waitIslandSettled(page)
        await page.waitForSelector('[data-testid="ia-review-actions"]', { timeout: 60_000 }).catch(() => {})
        await waitSkeletonGone(page)
        await page.waitForTimeout(1500)
        await shoot(page, 'type-evaluation-end-to-end', 'review-file', theme, 'opened the application waiting in the review queue: the whole file (the instrument, the documentation, the review acts) on one page', { fullPage: true })
      } else {
        console.log('  · no application waiting in the queue; shooting the canonical file instead')
        await gotoApp(page, '/app/ia/applications/app-acme-lc')
        await waitSkeletonGone(page)
        await page.waitForTimeout(2000)
        await shoot(page, 'type-evaluation-end-to-end', 'review-file', theme, 'opened the canonical application file (accepted long ago): the review record with its closed acts, the whole file on one page', { fullPage: true })
      }
    }

    if (wants('project-hub')) {
      await gotoApp(page, '/app/ia/projects/app-acme-lc')
      await waitTestId(page, 'ia-project-hub')
      await waitSkeletonGone(page)
      await waitText(page, 'Application record')
      await shoot(page, 'type-evaluation-end-to-end', 'project-hub', theme, 'the Evaluation Project hub: samples, test requests, reports, verdicts, and the certificate-to-be share one record', { fullPage: true })
    }

    if (wants('certificates-desk')) {
      await gotoApp(page, '/app/ia/certificates')
      await page.waitForFunction(
        () => document.body.innerText.includes('Issue from evaluation') && document.body.innerText.includes('Issued certificates'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'type-evaluation-end-to-end', 'certificates-desk', theme, 'the certificates desk: issue-from-evaluation plus the issued set with the BIML registration acts', { fullPage: true })
    }

    if (wants('certificate-lifecycle')) {
      await gotoApp(page, '/app/standards/r60/certificates/crt-acme-lc')
      await page.waitForFunction(
        () => document.body.innerText.includes('BIML Registration'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'continuous-compliance', 'certificate-lifecycle', theme, 'the certificate\u2019s lifecycle acts as the authority sees them: annex, revise, renew, suspend, withdraw — the suspension semantics continuous compliance triggers', { fullPage: true })
    }

    await context.close()
  }
}

// ── The Test Laboratory legs ──────────────────────────────────────────

async function captureLab(browser: Browser) {
  if (!['lab-inbox', 'twin-lab'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Test Laboratory', '/app/lab')

    if (wants('lab-inbox')) {
      await gotoApp(page, '/app/lab/')
      await waitTestId(page, 'lab-inbox')
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="lab-incoming"], [data-testid="lab-assignments-active"], [data-testid="lab-reports-pending"], [data-testid="lab-samples-awaiting"]')
          || document.body.innerText.includes('Nothing waiting for your laboratory'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await waitSkeletonGone(page)
      await shoot(page, 'type-evaluation-end-to-end', 'lab-inbox', theme, 'the laboratory\u2019s chapter: the test-request inbox, the dispatched work with its samples and assigned forms', { fullPage: true })
    }

    if (wants('twin-lab')) {
      await gotoApp(page, '/app/twin-lab')
      await page.waitForFunction(
        () => document.body.innerText.includes('Twin lab') || document.body.innerText.includes('Connect'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'continuous-compliance', 'twin-lab', theme, 'the twin lab: connect to a served twin interface and read its declared registers — introspection, never a hard-coded shape')
    }

    await context.close()
  }
}

// ── The Admin legs (the twin console, the sim bench) ──────────────────

async function captureAdmin(browser: Browser) {
  if (!['twin-console', 'sim-bench'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Admin', '/app')

    if (wants('twin-console')) {
      await gotoApp(page, '/app/twin')
      await page.waitForTimeout(8000)
      // Provision the demo twin when the console offers it; an already-
      // provisioned console (an earlier leg today) is the same act done.
      const offered = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.trim().includes('Provision the demo twin'))
        if (btn) { (btn as HTMLElement).click(); return true }
        return false
      })
      if (offered) await page.waitForTimeout(15_000)
      const performed = offered
        ? 'provisioned the demo twin and watched the monitor judge the simulated feed against the modelled R 60 requirement'
        : 'opened the twin console with the monitor judging the provisioned demo twin\u2019s feed against the modelled requirement'
      console.log(`  · twin console: ${offered ? 'provisioned' : 'already provisioned'}`)
      await shoot(page, 'continuous-compliance', 'twin-console', theme, performed, { fullPage: true })
    }

    if (wants('sim-bench')) {
      await gotoApp(page, '/app/sim')
      await page.waitForTimeout(8000)
      await shoot(page, 'training-on-the-sst', 'sim-bench', theme, 'the sim bench: the standalone pairing surface — the hosted demo keeps it unpaired and prints the one-command boot for a locally booted SST', { fullPage: true })
    }

    await context.close()
  }
}

// ── The CS Admin legs (the registry surfaces) ─────────────────────────

async function captureCSAdmin(browser: Browser) {
  if (!['cs-ia-registry', 'cs-participants'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'CS Admin', '/app/cs')

    if (wants('cs-ia-registry')) {
      await gotoApp(page, '/app/cs/issuing-authorities')
      await waitText(page, 'Add Issuing Authority')
      await shoot(page, 'member-state-view', 'cs-ia-registry', theme, 'the designation chain as data: the OIML-CS Issuing Authority registry (PTB, METAS, NIM and the rest) with the scopes your designations belong to', { fullPage: true })
    }

    if (wants('cs-participants')) {
      await gotoApp(page, '/app/cs/participants')
      await page.waitForFunction(
        () => document.body.innerText.length > 1500 && !document.querySelector('.skel'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'member-state-view', 'cs-participants', theme, 'the scheme\u2019s participant registry: the issuing authorities, the test laboratories, the utilizers and associates — the chain the register answers for', { fullPage: true })
    }

    await context.close()
  }
}

// ── The Utilizer legs (the ANR surfaces) ──────────────────────────────

async function captureUtilizer(browser: Browser) {
  if (!['anr-registry', 'anr-declare-form'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Utilizer Officer (NL)', '/app')

    if (wants('anr-registry') || wants('anr-declare-form')) {
      await gotoApp(page, '/app/cs/anr/')
      await page.waitForFunction(
        () => document.body.innerText.includes('ANR Provisions') && document.body.innerText.includes('Declare an ANR'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      if (wants('anr-registry')) {
        await shoot(page, 'additional-national-requirements', 'anr-registry', theme, 'the ANR declaration registry for your market: the declared provisions with their moderation states (only APPROVED is live)', { fullPage: true })
      }
      if (wants('anr-declare-form')) {
        // "Declare an ANR" is a section of the registry page (there is no
        // button to open): scroll it into frame and shoot the viewport.
        const scrolled = await page.evaluate(() => {
          const h = Array.from(document.querySelectorAll('h1, h2, h3'))
            .find(e => e.textContent?.trim() === 'Declare an ANR')
          if (h) { h.scrollIntoView({ block: 'start' }); return true }
          return false
        })
        if (!scrolled) throw new Error('ANR: the declare section never rendered')
        await page.waitForTimeout(1200)
        await shoot(page, 'additional-national-requirements', 'anr-declare-form', theme, 'the declare form on the registry page: the acting utilizer, the market, the content-tier radios (tier 2 declared-simple / tier 1 Primmel-defined), the procedure as text, the reference document; the draft files for moderation')
      }
    }

    await context.close()
  }
}

// ── The runner ────────────────────────────────────────────────────────

console.log(`capture-usecases: themes ${THEMES.join('+')}, capture date ${DATE}${ONLY_LIST ? `, only ${ONLY_LIST.join(',')}` : ''}`)

const browser = await chromium.launch()
try {
  await capturePublic(browser)
  await captureApplicant(browser)
  await captureIA(browser)
  await captureLab(browser)
  await captureAdmin(browser)
  await captureCSAdmin(browser)
  await captureUtilizer(browser)
} finally {
  await browser.close()
}

// The manifest flushed per shot; report the final tally.
const finalCount = (JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest).records.length
console.log(`\n✓ ${records.length} capture(s) this run; manifest carries ${finalCount} → ${MANIFEST}`)
