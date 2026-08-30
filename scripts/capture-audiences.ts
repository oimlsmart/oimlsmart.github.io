#!/usr/bin/env tsx
/**
 * capture-audiences — the scripted screenshot apparatus for the audience
 * pages (TODO.promotion/10, the page-depth anatomy; the freshness-gate
 * target of TODO.promotion/08).
 *
 * Every screenshot the audience pages publish is captured HERE, never
 * hand-snapped: the script drives the LIVE demo (demo.oimlsmart.org),
 * the identity console (id.oimlsmart.org) and the AI service
 * (ai.oimlsmart.org) headlessly, performs each act the pages list, and
 * saves the artifact under public/img/audiences/<audience>/ as
 * `<name>-<theme>.png` (stable names, the house convention: re-runs
 * overwrite in place, so a freshness regeneration never touches the
 * page sources). The manifest it writes (public/img/audiences/
 * manifest.json) records per capture: the audience, the act performed,
 * the URL, the theme, the timestamp — the capture DATE lives there and
 * in each page's ShotFigure `captured` prop, not in the filenames. An
 * act the script cannot perform does not get a capture — and per the
 * anatomy contract, does not list on a page.
 *
 * Usage:
 *
 *   npx tsx scripts/capture-audiences.ts             # the read-only captures
 *   npx tsx scripts/capture-audiences.ts --drive     # first drive a fresh
 *                                                    #   application → dispatch
 *                                                    #   → TL-accept chain so the
 *                                                    #   queues show live work
 *   npx tsx scripts/capture-audiences.ts --only=ia   # filter by name substring
 *   npx tsx scripts/capture-audiences.ts --light     # light theme only
 *
 * Env: DEMO_BASE (default https://demo.oimlsmart.org), ID_BASE
 * (https://id.oimlsmart.org), AI_BASE (https://ai.oimlsmart.org),
 * CAPTURE_DATE (default: today, YYYY-MM-DD).
 *
 * The demo is the nightly-reset fictional instance: the --drive chain
 * files one clearly-marked demonstration application (the ACME cast)
 * and stops before any certificate issuance — the register story stays
 * the seeded one.
 *
 * The demo-account sign-in pattern mirrors the platform e2e harness
 * (the smart repo's browser/e2e/helpers.ts), ported to Playwright — the
 * www repo's browser convention. Selenium of the house rules: the demo
 * banner stays in frame (the screenshots are honest about being the
 * demo); the viewport is 1440x900 (the documentation rule).
 */
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DEMO = (process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org').replace(/\/$/, '')
const ID = (process.env.ID_BASE ?? 'https://id.oimlsmart.org').replace(/\/$/, '')
const AI = (process.env.AI_BASE ?? 'https://ai.oimlsmart.org').replace(/\/$/, '')
const DATE = process.env.CAPTURE_DATE ?? new Date().toISOString().slice(0, 10)
const OUT = resolve(import.meta.dirname, '..', 'public', 'img', 'audiences')
const VC_CACHE_DIR = resolve(import.meta.dirname, '..', 'node_modules', '.cache', 'audience-captures')
const VC_CACHE = join(VC_CACHE_DIR, 'certificate.vc.json')
const DRIVE = process.argv.includes('--drive')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length)
// Comma-separated substrings: --only=ia-,review-queue runs those legs.
const ONLY_LIST = ONLY ? ONLY.split(',').map(s => s.trim()).filter(Boolean) : null
const THEMES = process.argv.includes('--light') ? ['light'] as const
  : process.argv.includes('--dark') ? ['dark'] as const
  : ['light', 'dark'] as const

const NAV_TIMEOUT = 60_000
// The demo's first island paint after a cold login measured ~115s
// (2026-08-30): the boot spinner persists while the profile loads.
// SETTLE must clear that comfortably; waits poll and return early.
const SETTLE = 240_000
// The demo-account sign-in ends in bootstrap({force: true}): the whole
// entity profile downloads before the redirect lands. Measured at ~120s
// on a cold context (2026-08-30); give the redirect wait real headroom.
const LOGIN_SETTLE = 300_000

// ── Harness (the smart repo's e2e pattern, ported to Playwright) ──────

async function gotoCommit(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'commit', timeout: NAV_TIMEOUT })
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT })
}

async function waitIslandSettled(page: Page) {
  // One tolerant wait covering both page kinds: the island pages mount the
  // app shell ([data-layout="app"]) once the Gate resolves; the SSR detail
  // pages (application/certificate views) never mount it — for them a
  // rendered, spinner-free body is the settled state. (1200 chars clears
  // the boot splash, which is short.)
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
  await waitIslandSettled(page)
}

async function signOut(context: BrowserContext) {
  // Via the context's own request client — an in-page fetch races the
  // login page's signed-in redirect and dies with "Failed to fetch".
  await context.request.post(`${DEMO}/api/auth/signout`).catch(() => {})
}

async function loginAs(context: BrowserContext, page: Page, name: string, prefix: string) {
  // The login page bounces a signed-in session to its console, so sign
  // out first and tolerate the stale-session round-trip.
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
    // A stale session survived — the in-page signout (same-origin now)
    // clears it before the next attempt.
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
  await page.waitForFunction(
    (p) => window.location.pathname.startsWith(p) && window.location.pathname !== '/app/login',
    prefix,
    { timeout: LOGIN_SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
}

async function waitTestId(page: Page, testid: string) {
  await page.waitForSelector(`[data-testid="${testid}"]`, { timeout: SETTLE })
}

/** Wait for content, not just shell: the skeletons carry the testids, so
 *  every capture additionally waits for a string only real data produces. */
async function waitText(page: Page, text: string) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    text,
    { timeout: SETTLE, polling: 500 },
  )
}

/** Wait until the Skeleton placeholders (.skel, the demo app's loading
 *  shimmer) are gone. Several 2026-08-29 captures photographed the shimmer
 *  because the page-level testids mount WITH the shell while the data
 *  trails; a shot is only honest once no .skel remains. */
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

async function clickButtonByText(page: Page, text: string) {
  const found = await page.evaluate((wanted) => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim().includes(wanted))
    if (btn) { (btn as HTMLElement).click(); return true }
    return false
  }, text)
  if (!found) throw new Error(`button "${text}" not found`)
}

// ── The capture registry ──────────────────────────────────────────────

interface CaptureRecord {
  audience: string
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

async function shoot(page: Page, audience: string, name: string, theme: string, performed: string, opts?: { fullPage?: boolean }) {
  const dir = join(OUT, audience)
  mkdirSync(dir, { recursive: true })
  // Stable names (no date prefix): re-runs overwrite in place; the capture
  // date lives in the manifest record and the pages' ShotFigure props.
  const file = `${name}-${theme}.png`
  await page.screenshot({ path: join(dir, file), fullPage: opts?.fullPage ?? false })
  records.push({
    audience, name, file: `${audience}/${file}`, url: page.url(), theme, performed,
    capturedAt: new Date().toISOString(),
  })
  console.log(`  📷 ${audience}/${file} — ${performed}`)
}

/** A themed context: the demo app reads localStorage 'oiml-smart-theme';
 *  the site-shell surfaces (id, ai) read 'oiml-theme'; both fall back to
 *  the emulated prefers-color-scheme. */
async function themedContext(browser: Browser, theme: string) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    acceptDownloads: true,
  })
  // The demo's PWA service worker serves its navigateFallback (the landing
  // shell) for unprecached SSR app routes once it controls the context —
  // the detail pages this script drives would never render. The captures
  // need the real documents, so the SW never registers here. (The fallback
  // hijack on the public demo is a known, separately-tracked platform bug.)
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

// ── The drive: one application from wizard to a live TL assignment ────
// Ports the platform e2e legs' chain (browser/e2e/helpers.ts +
// cs-e2e-04-dispatch + cs-e2e-05-tl-project). Every step is a real act on
// the live demo; the captures along the way are the audit evidence for
// the applicant/IA/TL inventories.

async function submitWizardApplication(page: Page): Promise<string> {
  await gotoApp(page, '/app/portal/applications/new')
  await waitTestId(page, 'portal-wizard')
  await waitTestId(page, 'wizard-step-1')
  await shoot(page, 'manufacturers', 'wizard-step-1-recommendation', currentTheme, 'opened the new-application wizard: the Recommendation pick (R 60, R 91, R 129, R 144)')
  // Step 1 requires the explicit Recommendation pick (the card), not just
  // a Continue — the submit gate names it otherwise.
  await page.waitForSelector('[data-testid="wizard-standard-card-oiml-r60"]', { timeout: SETTLE })
  await page.evaluate(() => {
    (document.querySelector('[data-testid="wizard-standard-card-oiml-r60"]') as HTMLElement).click()
  })
  await page.waitForTimeout(800)
  // The live wizard: 1 Recommendation → 2 Applicant (prefilled from the
  // org record) → 3 Instrument (the family + the models in scope, derived
  // from the Recommendation's model) → 4 Samples → 5 Documentation →
  // 6 Scheme & review (the IA cards + submit).
  const cont = async (step: number) => {
    await clickButtonByText(page, 'Continue')
    await page.waitForSelector(`[data-testid="wizard-step-${step}"]`, { timeout: SETTLE })
    await page.waitForTimeout(1200)
  }
  await cont(2)
  await cont(3)
  // The instrument step derives from the Recommendation's model.
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
  await shoot(page, 'manufacturers', 'wizard-step-3-instrument', currentTheme, 'picked the model family and the models in scope — the instrument step the R 60 model derives')
  await cont(4)
  await page.type('[data-testid="wizard-sample-serial"]', `SN-CAPTURE-${DATE.replace(/-/g, '')}`)
  await cont(5)
  await cont(6)
  await page.waitForSelector('[data-testid^="wizard-ia-"]', { timeout: SETTLE })
  await shoot(page, 'manufacturers', 'wizard-step-6-scheme-ia', currentTheme, 'chose the scheme (OIML-CS) and the Issuing Authority from the registered cards', { fullPage: true })
  await page.evaluate(() => {
    const ex1 = document.querySelector('[data-testid="wizard-ia-EX1"]') as HTMLElement | null
    const first = document.querySelector('[data-testid^="wizard-ia-"]') as HTMLElement | null
    ;(ex1 ?? first)?.click()
  })
  await clickTestId(page, 'wizard-submit')
  await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/portal/applications/')
      && !/\/new\/?$/.test(window.location.pathname),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  await waitTestId(page, 'portal-application-detail')
  const appId = decodeURIComponent(
    page.url().split('/app/portal/applications/')[1]!.split('?')[0]!.replace(/\/$/, ''),
  )
  if (!appId) throw new Error('wizard did not land on an application detail')
  // The detail testid mounts with the shell; the shimmer trails it (both
  // earlier drives photographed it). Wait for the skeleton to clear and
  // for the data-only promise-set section before the shot.
  await waitSkeletonGone(page)
  await waitText(page, 'Promise set')
  await shoot(page, 'manufacturers', 'application-submitted', currentTheme, `submitted the application (${appId}) — the journey opens at "Application submitted"`)
  return appId
}

async function iaRequestsSamples(page: Page, appId: string) {
  await gotoApp(page, `/app/ia/applications/${encodeURIComponent(appId)}`)
  await waitTestId(page, 'ia-review-actions')
  await waitSkeletonGone(page)
  await shoot(page, 'issuing-authorities', 'review-whole-file', currentTheme, `opened the application ${appId} from the review queue — the whole file on one page`, { fullPage: true })
  await clickTestId(page, 'ia-request-samples')
  await waitTestId(page, 'ia-sample-request-form')
  await page.type('[data-testid="ia-sr-particulars"]', `Capture drive ${DATE} — deliver within 30 days`)
  await shoot(page, 'issuing-authorities', 'sample-request-form', currentTheme, 'issued the sample request (R 60-3) from the review — particulars typed, confirm pending')
  await clickTestId(page, 'ia-confirm-sample-request')
  await waitTestId(page, 'ia-sample-request-card')
  await page.waitForFunction(
    () => /samples[_ ]requested|awaiting shipment/i.test(document.body.innerText),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
}

async function applicantShips(page: Page, appId: string) {
  await gotoApp(page, `/app/portal/applications/${encodeURIComponent(appId)}`)
  await waitTestId(page, 'portal-application-detail')
  await waitTestId(page, 'portal-sample-request')
  await clickTestId(page, 'portal-ship-samples')
  await page.waitForFunction(
    () => document.body.innerText.includes('All requested samples are in transit or received'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
}

async function iaRegisterAllReceipts(page: Page) {
  for (let i = 0; i < 6; i++) {
    const has = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid^="ia-register-receipt-"]')
      if (btn) { (btn as HTMLElement).click(); return true }
      return false
    })
    if (!has) return
    await page.waitForSelector('[data-testid="ia-receipt-serial"]', { timeout: SETTLE })
    const prefilled = await page.evaluate(() =>
      (document.querySelector('[data-testid="ia-receipt-serial"]') as HTMLInputElement).value,
    )
    if (!prefilled) await page.type('[data-testid="ia-receipt-serial"]', `SN-REG-${Date.now()}-${i}`)
    await clickTestId(page, 'ia-confirm-receipt')
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="ia-receipt-serial"]'),
      undefined,
      { timeout: SETTLE, polling: 500 },
    )
  }
  throw new Error('receipt registration did not converge after 6 samples')
}

async function driveChain(browser: Browser) {
  console.log('\n═══ THE DRIVE — one application wizard → dispatch → TL accept ═══')
  // A FRESH context per role leg: every demo-account sign-in re-bootstraps
  // the whole profile store (bootstrap({force: true})), and a context that
  // has already switched roles can carry a wedged profile into the next
  // role's acts — the 2026-08-30 captures watched the accept's redirect
  // never land in a twice-switched context while a fresh one lands in
  // seconds. Isolation costs nothing: each leg re-bootstraps anyway.
  const leg = async (name: string, prefix: string) => {
    const context = await themedContext(browser, 'light')
    const page = await context.newPage()
    await loginAs(context, page, name, prefix)
    return { context, page }
  }

  // Applicant: the wizard.
  const appId = await (async () => {
    const { context, page } = await leg('Applicant', '/app/portal')
    try {
      return await submitWizardApplication(page)
    } finally {
      await context.close()
    }
  })()

  // IA: the queue shows the waiting application; the sample request.
  {
    const { context, page } = await leg('Issuing Authority', '/app/ia')
    try {
      await gotoApp(page, '/app/ia')
      await waitSkeletonGone(page)
      // The queue row testids are data-gated; the drive just submitted one,
      // so a row must exist — and the "not the empty state" text check passes
      // during the skeleton, which is how the first drive shot the shimmer.
      await page.waitForSelector('[data-testid^="age-chip-review-"]', { timeout: SETTLE })
      await shoot(page, 'issuing-authorities', 'review-queue-waiting', currentTheme, 'the review queue with the waiting application, oldest first')
      await iaRequestsSamples(page, appId)
    } finally {
      await context.close()
    }
  }

  // Applicant ships.
  {
    const { context, page } = await leg('Applicant', '/app/portal')
    try {
      await applicantShips(page, appId)
    } finally {
      await context.close()
    }
  }

  // IA: the receipts, the samples-received act, the accept, the dispatch.
  {
    const { context, page } = await leg('Issuing Authority', '/app/ia')
    try {
      await gotoApp(page, `/app/ia/applications/${encodeURIComponent(appId)}`)
  await waitTestId(page, 'ia-sample-request-card')
  await iaRegisterAllReceipts(page)
  await waitTestId(page, 'ia-log-samples-received')
  await page.waitForFunction(
    () => {
      const b = document.querySelector('[data-testid="ia-log-samples-received"]') as HTMLButtonElement | null
      return !!b && !b.disabled
    },
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await clickTestId(page, 'ia-log-samples-received')
  await page.waitForFunction(
    () => !!document.querySelector('[data-testid="ia-accept"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )

  // Accept → the Evaluation Project (the TEP hub). The act chains the
  // review result, the ACCEPTED transition, and the TEP's DRAFT evaluation
  // report; a transient failure leaves a toast and no redirect, so retry
  // once. The reload distinguishes a partial landing (ACCEPTED, the act
  // gone, the project URL answers under the application id) from a real
  // refusal (the act still offered → click again).
  for (let attempt = 0; attempt < 2; attempt++) {
    await clickTestId(page, 'ia-accept')
    await waitTestId(page, 'ia-accept-form')
    await clickTestId(page, 'ia-confirm-accept')
    const landed = await page.waitForFunction(
      () => window.location.pathname.startsWith('/app/ia/projects/'),
      undefined,
      { timeout: SETTLE, polling: 500 },
    ).then(() => true).catch(() => false)
    if (landed) break
    if (attempt === 1) throw new Error('accept never opened the Evaluation Project')
    console.log('  · accept did not redirect; reloading to check for a partial landing')
    await gotoApp(page, `/app/ia/applications/${encodeURIComponent(appId)}`)
    await waitTestId(page, 'ia-review-actions')
    const stillOpen = await page.evaluate(() => !!document.querySelector('[data-testid="ia-accept"]'))
    if (!stillOpen) {
      await gotoApp(page, `/app/ia/projects/${encodeURIComponent(appId)}`)
      break
    }
  }
  await waitIslandSettled(page)
  await waitTestId(page, 'ia-project-hub')
  // The hub testid mounts with the shell; the content (the Application
  // record card) trails it — and the section headers render while the
  // cards still shimmer, so header text is not proof (the 2026-08-30
  // drive v3 shot the skeleton with the header already in the DOM). The
  // proof is data: no .skel left and the sample-selection chips (rendered
  // per registered sample) present.
  await waitSkeletonGone(page)
  await page.waitForSelector('[data-testid^="tep-select-sample-"], [data-testid="tep-selected-count"]', { timeout: SETTLE })
  await waitText(page, 'Application record')
  await shoot(page, 'issuing-authorities', 'project-hub', currentTheme, `accepted the application — the Evaluation Project ${appId} hub: samples, requests, verdicts, certificate`, { fullPage: true })
  for (let i = 0; i < 4; i++) {
    const has = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid^="tep-select-sample-"]')
      if (btn) { (btn as HTMLElement).click(); return true }
      return false
    })
    if (!has) break
    await waitTestId(page, 'tep-selection-justification')
    await page.type('[data-testid="tep-selection-justification"]', 'Representative of the group (R 60-2, 2.4)')
    await clickTestId(page, 'tep-confirm-selection')
    await page.waitForFunction(
      () => !document.querySelector('[data-testid^="tep-selection-form-"]'),
      undefined,
      { timeout: SETTLE, polling: 500 },
    )
  }
  // The selection must land before the dispatch builder opens: its matrix
  // pool is exactly the selected samples.
  await page.waitForFunction(
    () => !document.querySelector('[data-testid^="tep-select-sample-"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )

  // The dispatch builder: assign the first test form to laboratory 21.
  await clickTestId(page, 'tep-new-request')
  await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/ia/dispatch/'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  await waitTestId(page, 'ia-dispatch-builder')
  // The matrix populates asynchronously after the builder shell mounts.
  await page.waitForSelector('[data-testid="ia-matrix-row"]', { timeout: SETTLE })
  await clickTestId(page, 'ia-clear')
  const formId = await page.evaluate(() =>
    (document.querySelector('[data-testid="ia-matrix-row"]') as HTMLElement | null)?.dataset.formId ?? '',
  )
  if (!formId) throw new Error('dispatch builder: no matrix rows')
  await page.evaluate((form) => {
    const row = document.querySelector(`[data-testid="ia-matrix-row"][data-form-id="${form}"]`)
    const input = row?.querySelector('input[data-lab-id="21"]') as HTMLElement | null
    input?.click()
  }, formId)
  await waitTestId(page, 'ia-plan-21')
  await shoot(page, 'issuing-authorities', 'dispatch-builder', currentTheme, 'composed the dispatch: the test-forms × samples matrix, one TestRequest to laboratory 21 (ETL)', { fullPage: true })
  await clickTestId(page, 'ia-issue-requests')
  await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/ia/projects/'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  await waitTestId(page, 'tep-test-requests')
    } finally {
      await context.close()
    }
  }

  // TL: the request lands in the inbox; open it; accept.
  {
    const { context, page } = await leg('Test Laboratory', '/app/lab')
    try {
      await gotoApp(page, '/app/lab')
  await page.waitForFunction(
    () => !!document.querySelector('[data-testid^="lab-incoming-"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitSkeletonGone(page)
  await shoot(page, 'laboratories', 'inbox-live-request', currentTheme, 'the laboratory inbox with the dispatched request in the incoming bucket, landed live')
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-testid^="lab-open-request-"]') as HTMLElement | null
    btn?.click()
  })
  await page.waitForFunction(
    () => /\/app\/lab\/requests\//.test(window.location.pathname),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  // The open-request click is a client-side router.push: the URL and the
  // app shell both satisfy the naive waits instantly, and the shot then
  // photographs the inbox it just left (both earlier drives). The request
  // view is proven by its own acts: the accept testid exists only there.
  await waitTestId(page, 'lab-request-accept')
  await waitSkeletonGone(page)
  await shoot(page, 'laboratories', 'request-open', currentTheme, 'opened the test request: the assigned forms, the samples, the accept/decline acts', { fullPage: true })
  await clickTestId(page, 'lab-request-accept')
  // The accept reveals the working panels (samples, assignments, the
  // report panel) — that reveal is the act completed.
  await waitTestId(page, 'lab-request-samples')
  await waitTestId(page, 'lab-request-assignments')
  await waitSkeletonGone(page)
  await page.waitForTimeout(1200)
  await shoot(page, 'laboratories', 'request-accepted', currentTheme, 'accepted the assignment — the laboratory joins the Evaluation Project dataspace; the working panels reveal', { fullPage: true })
    } finally {
      await context.close()
    }
  }

  console.log(`═══ DRIVE COMPLETE — application ${appId} dispatched and accepted ═══\n`)
  return appId
}

// ── The read-only captures ────────────────────────────────────────────

let currentTheme = 'light'

async function capturePublic(browser: Browser, vcJson: string | null) {
  if (!['verify-number', 'verify-vc', 'register', 'id-join', 'ai-answer'].some(wants)) return

  // The VC the applicant capture downloaded this run, else the cached one
  // from an earlier invocation (the file is the cross-role proof).
  const vc = vcJson ?? (() => { try { return readFileSync(VC_CACHE, 'utf8') } catch { return null } })()
  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()

    if (wants('verify-number')) {
      await gotoApp(page, '/app/verify/')
      await page.waitForSelector('[data-testid="verify-number"]', { timeout: SETTLE })
      await page.fill('[data-testid="verify-number"]', 'R60/2021-A-EX1-26.01')
      await page.click('[data-testid="verify-submit"]')
      await page.waitForFunction(
        () => document.body.innerText.includes('ACTIVE') && document.body.innerText.includes('BIML registration'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'shared', 'verify-number-verdict', theme, 'verified certificate R60/2021-A-EX1-26.01 by number — the verdict from the BIML-registered copy, no account', { fullPage: true })
    }

    if (vc && wants('verify-vc')) {
      await gotoApp(page, '/app/verify/')
      await page.waitForSelector('[data-testid="verify-vc-input"]', { timeout: SETTLE })
      await page.fill('[data-testid="verify-vc-input"]', vc)
      await page.click('[data-testid="verify-vc-submit"]')
      await page.waitForFunction(
        () => /verif|valid|ACTIVE|issuer/i.test(document.body.innerText) && !/paste the credential/i.test(document.body.innerText.slice(-400)),
        undefined,
        { timeout: SETTLE, polling: 500 },
      ).catch(() => {})
      await page.waitForTimeout(1500)
      await shoot(page, 'shared', 'verify-vc-verdict', theme, 'verified the certificate file (.vc.json) pasted into the credential panel — the issuer-DID check, no account', { fullPage: true })
    }

    if (wants('register')) {
      await gotoApp(page, '/app/register/')
      await page.waitForFunction(
        () => document.body.innerText.includes('Certificate Register') && document.body.innerText.includes('R60/2021-A-EX1-26.01'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'shared', 'certificate-register', theme, 'browsed the public Certificate Register — the BIML-registered entries with the validity doctrine', { fullPage: true })
    }

    if (wants('id-join')) {
      await gotoCommit(page, `${ID}/op/join/`)
      await page.waitForTimeout(3000)
      // open the organization directory if it is a collapsed select
      await page.evaluate(() => {
        const sel = document.querySelector('select')
        if (sel) sel.focus()
      })
      await shoot(page, 'shared', 'identity-join', theme, 'opened the identity service join flow — accounts per organization, the member directory selectable')
    }

    if (wants('ai-answer')) {
      await gotoCommit(page, `${AI}/`)
      await page.waitForTimeout(3500)
      const clicked = await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('button, a, li, div'))
          .find(e => e.textContent?.trim() === 'What is R 60?')
        if (el) { (el as HTMLElement).click(); return true }
        return false
      })
      if (!clicked) throw new Error('ai: suggestion "What is R 60?" not found')
      // The answer streams; the citations render last. Wait generously.
      await page.waitForFunction(
        () => document.body.innerText.includes('SOURCES') && /OIML R 60/.test(document.body.innerText),
        undefined,
        { timeout: 150_000, polling: 1500 },
      )
      await page.waitForTimeout(1000)
      await shoot(page, 'shared', 'ai-answer-cited', theme, 'asked "What is R 60?" — the answer with clause-level citations from the OIML corpus', { fullPage: true })
    }

    await context.close()
  }
}

async function captureViewer(browser: Browser) {
  if (!['standards-catalog', 'r60-requirements', 'library'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Viewer', '/app')

    if (wants('standards-catalog')) {
      await gotoApp(page, '/app/')
      await waitText(page, 'OIML Recommendations')
      await waitText(page, 'Reqs')
      await shoot(page, 'shared', 'standards-catalog', theme, 'the Standards catalog: the four Recommendations with their model counts (R 60: 180 requirements, 62 tests, 61 forms)')
    }
    if (wants('r60-requirements')) {
      await gotoApp(page, '/app/standards/r60/requirements')
      await page.waitForFunction(
        () => document.body.innerText.includes('180 requirements'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'shared', 'r60-requirements', theme, 'read R 60 as a model: 14 requirement classes, 180 requirements, clause-level structure')
    }
    if (wants('library')) {
      await gotoApp(page, '/app/library')
      await waitText(page, 'Document Library')
      await waitText(page, 'B 18')
      await shoot(page, 'shared', 'library', theme, 'browsed the Document Library: the OIML corpus (R 60/91/129/144, B 18, the PD/OD set)')
    }
    await context.close()
  }
}

async function captureCSAdmin(browser: Browser) {
  if (!['cs-ia-registry'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'CS Admin', '/app/cs')

    if (wants('cs-ia-registry')) {
      await gotoApp(page, '/app/cs/issuing-authorities')
      await waitText(page, 'Add Issuing Authority')
      await shoot(page, 'member-states', 'cs-ia-registry', theme, 'the OIML-CS Issuing Authority registry as data — the real register entries (PTB, METAS, NIM, …) with their scopes', { fullPage: true })
    }

    await context.close()
  }
}

async function captureApplicant(browser: Browser, appId: string | null) {
  if (!['portal-dashboard', 'application-detail', 'certificate-detail', 'notifications'].some(wants)) return

  let vcJson: string | null = null
  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Applicant', '/app/portal')

    if (wants('portal-dashboard')) {
      await gotoApp(page, '/app/portal/')
      await waitTestId(page, 'portal-dashboard')
      await waitText(page, 'My applications')
      await shoot(page, 'manufacturers', 'portal-dashboard', theme, 'the applicant portal: every application with status and age, the certificates in force', { fullPage: true })
    }

    const detailId = appId ?? 'app-acme-lc'
    if (wants('application-detail')) {
      await gotoApp(page, `/app/portal/applications/${encodeURIComponent(detailId)}`)
      await waitTestId(page, 'portal-application-detail')
      await waitText(page, 'Promise set')
      await shoot(page, 'manufacturers', 'application-journey', theme, `opened application ${detailId}: the six-stage journey and the promise set with per-claim verification status`, { fullPage: true })
    }

    if (wants('certificate-detail')) {
      await gotoApp(page, '/app/portal/certificates/crt-acme-lc')
      await page.waitForFunction(
        () => document.body.innerText.includes('OIML CERTIFICATE NO.'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'manufacturers', 'certificate-downloads', theme, 'the issued certificate R60/2021-A-EX1-26.01 in the OIML layout, with its serials and print view', { fullPage: true })
      // The download row (signed CNML / VC / AAS submodel) renders only when
      // the certificate carries a signed CNML record; the demo's canonical
      // certificate is signed by the nightly ops leg. When the buttons are
      // absent the act is honestly not performable today, and the pages do
      // not list it.
      if (!vcJson) {
        const hasVc = await page.evaluate(() =>
          Array.from(document.querySelectorAll('button, a'))
            .some(b => b.textContent?.trim().includes('Download as Verifiable Credential')),
        )
        if (hasVc) {
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }),
            page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('button, a'))
                .find(b => b.textContent?.trim().includes('Download as Verifiable Credential'))
              ;(btn as HTMLElement)?.click()
            }),
          ])
          const path = await download.path()
          vcJson = readFileSync(path, 'utf8')
          // Persist for later invocations (the verify-vc capture reads the
          // cache when this run did not download). node_modules/.cache is
          // local scratch, never shipped.
          mkdirSync(VC_CACHE_DIR, { recursive: true })
          writeFileSync(VC_CACHE, vcJson)
          console.log('  ✓ VC download performed (cached for the verify-vc capture)')
          const [cnml] = await Promise.all([
            page.waitForEvent('download', { timeout: 30_000 }),
            page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('button, a'))
                .find(b => b.textContent?.trim().includes('Download signed CNML'))
              ;(btn as HTMLElement)?.click()
            }),
          ])
          await cnml.path()
          console.log('  ✓ signed-CNML download performed')
        } else {
          console.log('  · downloads absent (certificate currently unsigned) — the act is not listed today')
        }
      }
    }

    if (wants('notifications')) {
      await gotoApp(page, '/app/portal/')
      await waitText(page, 'My applications')
      await clickTestId(page, 'notification-bell')
      await waitText(page, 'Notifications')
      await page.waitForTimeout(800)
      await shoot(page, 'manufacturers', 'notifications', theme, 'opened the notifications inbox — the stage events of your own applications')
    }

    await context.close()
  }
  return vcJson
}

async function captureIA(browser: Browser, appId: string | null) {
  if (!['ia-dashboard', 'review-queue', 'ia-project', 'ia-certificates', 'ia-issue-form', 'ia-cert-lifecycle'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    try {
      await loginAs(context, page, 'Issuing Authority', '/app/ia')

      if (wants('ia-dashboard')) {
      await gotoApp(page, '/app/ia/')
      await waitTestId(page, 'ia-dashboard')
      await waitText(page, 'Review queue')
      await waitText(page, 'Type evaluation projects')
      await waitSkeletonGone(page)
      await shoot(page, 'issuing-authorities', 'ia-console', theme, 'the IA console: the review queue, the projects, the enter-for-client / import / offline-registration entries', { fullPage: true })
    }

    if (wants('review-queue')) {
      await gotoApp(page, '/app/ia/')
      await waitTestId(page, 'ia-dashboard')
      await waitText(page, 'Review queue')
      await waitSkeletonGone(page)
      // a waiting row when the queue has one (the drive leaves several)
      await page.waitForSelector('[data-testid^="age-chip-review-"]', { timeout: 20_000 }).catch(() => {})
      await shoot(page, 'issuing-authorities', 'review-queue-waiting', theme, 'the review queue with the applications waiting on the authority, oldest first', { fullPage: true })
    }

    if (wants('ia-project')) {
      const projId = appId ?? 'app-acme-lc'
      await gotoApp(page, `/app/ia/projects/${encodeURIComponent(projId)}`)
      await waitTestId(page, 'ia-project-hub')
      await waitText(page, 'Application record')
      await shoot(page, 'issuing-authorities', 'project-hub-read', theme, `the Evaluation Project ${projId}: application record, samples, test requests, verdicts, certificate — one hub`, { fullPage: true })
    }

    if (wants('ia-certificates')) {
      await gotoApp(page, '/app/ia/certificates')
      await page.waitForFunction(
        () => document.body.innerText.includes('Issue from evaluation') && document.body.innerText.includes('Issued certificates'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'issuing-authorities', 'certificates-issued', theme, 'the certificates desk: issue-from-evaluation plus the issued list with the BIML-registration acts', { fullPage: true })
    }

    if (wants('ia-issue-form')) {
      await gotoApp(page, '/app/ia/certificates')
      await page.waitForFunction(
        () => document.body.innerText.includes('Issue from evaluation'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await waitSkeletonGone(page)
      // select the finalized evaluation in the picker (the dedicated
      // issuance select, not any select on the page), then wait for the
      // issuance form itself: the signing panel when the gate allows, the
      // blocked panel when it does not. A blind sleep here once captured
      // the desk instead of the form.
      const picked = await page.evaluate(() => {
        const select = document.querySelector('[data-testid="ia-evaluation-select"]') as HTMLSelectElement | null
        if (!select) return false
        const opt = Array.from(select.options).find(o => o.value)
        if (!opt) return false
        select.value = opt.value
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      })
      if (picked) {
        await page.waitForSelector('[data-testid="ia-signing-key"], [data-testid="ia-issuance-blocked"]', { timeout: SETTLE })
        await page.waitForTimeout(800)
        await shoot(page, 'issuing-authorities', 'issue-from-evaluation', theme, 'opened the issuance form on a finalized evaluation: the certified scope, the scheme choice, the signing act (not signed — the register story stays the seeded one)', { fullPage: true })
      }
    }

    if (wants('ia-cert-lifecycle')) {
      await gotoApp(page, '/app/standards/r60/certificates/crt-acme-lc')
      await page.waitForFunction(
        () => document.body.innerText.includes('BIML Registration'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'issuing-authorities', 'certificate-lifecycle', theme, 'the certificate as the authority sees it: the BIML registration record, the lifecycle acts (annex, revise, replace, renew, suspend, withdraw), and the CNML sign panel', { fullPage: true })
    }

    } finally {
      await context.close()
    }
  }
}

async function captureLab(browser: Browser) {
  if (!['lab-inbox', 'lab-test-reports', 'lab-register-offline', 'twin-lab'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Test Laboratory', '/app/lab')

    if (wants('lab-inbox')) {
      await gotoApp(page, '/app/lab/')
      await waitTestId(page, 'lab-inbox')
      // Content, not the loading skeleton: a work section rendered, or the
      // honest empty state. (The shell's "Work assigned to laboratory …"
      // line renders before the island loads — waiting on it captured
      // skeletons.)
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="lab-incoming"], [data-testid="lab-assignments-active"], [data-testid="lab-reports-pending"], [data-testid="lab-samples-awaiting"]')
          || document.body.innerText.includes('Nothing waiting for your laboratory'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await waitSkeletonGone(page)
      await shoot(page, 'laboratories', 'lab-inbox', theme, 'the laboratory inbox: work assigned to laboratory 21')
    }
    if (wants('lab-test-reports')) {
      await gotoApp(page, '/app/lab/test-reports')
      await waitTestId(page, 'lab-reports-list')
      await shoot(page, 'laboratories', 'test-reports', theme, 'the laboratory’s authored reports with form-instance counts and acceptance status', { fullPage: true })
    }
    if (wants('lab-register-offline')) {
      await gotoApp(page, '/app/lab/register-offline')
      await page.waitForFunction(
        () => document.body.innerText.includes('Register a test report issued offline'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'laboratories', 'register-offline', theme, 'the records-mode bridge: register a report performed offline — marked registered-offline, never claiming platform evidence', { fullPage: true })
    }
    if (wants('twin-lab')) {
      await gotoApp(page, '/app/twin-lab')
      await page.waitForFunction(
        () => document.body.innerText.includes('Twin lab') || document.body.innerText.includes('Connect'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'laboratories', 'twin-lab', theme, 'the twin-lab workbench: bind a live SMART twin to a Recommendation — the connect step')
    }

    await context.close()
  }
}

async function captureUtilizer(browser: Browser) {
  if (!['anr'].some(wants)) return

  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Utilizer Officer (NL)', '/app')

    if (wants('anr')) {
      await gotoApp(page, '/app/cs/anr/')
      await page.waitForFunction(
        () => document.body.innerText.includes('ANR Provisions') && document.body.innerText.includes('Declare an ANR'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'instrument-users', 'anr-registry', theme, 'the Utilizer surface: the ANR declaration registry for your market plus the declare form (moderated; only APPROVED is live)', { fullPage: true })
    }

    await context.close()
  }
}

// ── Main ──────────────────────────────────────────────────────────────

const browser = await chromium.launch()
try {
  let drivenAppId: string | null = null
  if (DRIVE) {
    currentTheme = 'light'
    drivenAppId = await driveChain(browser)
  }

  // The applicant captures first — they produce the VC file the public
  // verify capture then checks (the cross-role proof).
  const vcJson = await captureApplicant(browser, drivenAppId)
  await captureIA(browser, drivenAppId)
  await captureLab(browser)
  await captureUtilizer(browser)
  await captureViewer(browser)
  await captureCSAdmin(browser)
  await capturePublic(browser, vcJson)
} finally {
  await browser.close()
}

// Merge into the existing manifest (the drive and the read-only passes
// run as separate invocations; the manifest is the union, keyed by file),
// then prune entries whose file no longer exists — the manifest never
// points at a deleted capture.
const manifestPath = join(OUT, 'manifest.json')
let prior: CaptureRecord[] = []
try {
  prior = (JSON.parse(readFileSync(manifestPath, 'utf8')).captures ?? []) as CaptureRecord[]
} catch { /* first run */ }
const merged = new Map<string, CaptureRecord>()
for (const r of prior) merged.set(r.file, r)
for (const r of records) merged.set(r.file, r)
const live = [...merged.values()].filter(r => existsSync(join(OUT, r.file)))
writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), date: DATE, captures: live }, null, 2) + '\n')
console.log(`\n${records.length} captures this run, ${live.length} live in the manifest → public/img/audiences/`)
