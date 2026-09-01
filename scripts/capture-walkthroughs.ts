#!/usr/bin/env tsx
/**
 * capture-walkthroughs — the scripted screenshot apparatus for the
 * demo-flow walkthrough pages (TODO.promotion/06; the freshness-gate
 * re-run target of TODO.promotion/08).
 *
 * Every screenshot the /demo/ walkthroughs publish is captured HERE,
 * never hand-snapped: the script drives the LIVE demo
 * (demo.oimlsmart.org) headlessly, performs each act the pages narrate
 * (the wizard, the review, the dispatch, the run, the report submit),
 * asserts the surface carries what the page says it carries, and only
 * then captures. An act the script cannot perform produces no capture,
 * and per the anatomy contract does not list on a page.
 *
 * The two passes:
 *
 *   --drive   the state-changing arc, run ONCE in light mode (the house
 *             convention for drive captures): one fresh application from
 *             the wizard to the laboratory's submitted test report,
 *             capturing each flow-01/02/03 step surface on the way. The
 *             drive STOPS before any IA review, evaluation finalization,
 *             or issuance: the register story stays the seeded one. The
 *             drive's ids land in node_modules/.cache/walkthrough-captures/
 *             state.json so interrupted runs resume (--resume).
 *
 *   (default) the read-only passes in BOTH themes: the seeded worked
 *             example's surfaces (the IA evaluation workspace, the TR
 *             review, the issuance form untouched, the BIML console, the
 *             public register, the applicant's journey and certificate)
 *             plus the wizard surfaces (fill, never submit) and the
 *             login page.
 *
 * Captures land in public/img/walkthroughs/<flow>/<stem>-<theme>.png
 * (stable names: re-runs overwrite in place, so a freshness regeneration
 * never touches the page sources). The manifest
 * (public/img/walkthroughs/manifest.json) records per capture the act
 * performed, the URL, the theme, and the timestamp; the capture DATE
 * lives there and in the pages' ShotFigure `captured` props.
 *
 * Usage:
 *
 *   npx tsx scripts/capture-walkthroughs.ts                  # the read-only captures, both themes
 *   npx tsx scripts/capture-walkthroughs.ts --drive          # the state-changing arc first, then read-only
 *   npx tsx scripts/capture-walkthroughs.ts --drive --resume # resume an interrupted drive from state.json
 *   npx tsx scripts/capture-walkthroughs.ts --only=tl,login  # filter by name substring (comma-separated)
 *   npx tsx scripts/capture-walkthroughs.ts --light          # one theme only
 *
 * Env: DEMO_BASE (default https://demo.oimlsmart.org), CAPTURE_DATE
 * (default: today, YYYY-MM-DD).
 *
 * The demo is the nightly-reset fictional instance: the drive files one
 * clearly-marked demonstration application (the ACME cast) and takes it
 * as far as the laboratory's submitted report, never further. The
 * demo-account sign-in pattern mirrors the platform e2e harness (the
 * smart repo's browser/e2e/helpers.ts), ported to Playwright, matching
 * scripts/capture-audiences.ts. The demo banner stays in frame (the
 * screenshots are honest about being the demo); the viewport is
 * 1440x900 (the documentation rule).
 */
import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DEMO = (process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org').replace(/\/$/, '')
const DATE = process.env.CAPTURE_DATE ?? new Date().toISOString().slice(0, 10)
const OUT = resolve(import.meta.dirname, '..', 'public', 'img', 'walkthroughs')
const CACHE_DIR = resolve(import.meta.dirname, '..', 'node_modules', '.cache', 'walkthrough-captures')
const STATE_FILE = join(CACHE_DIR, 'state.json')
const DRIVE = process.argv.includes('--drive')
const RESUME = process.argv.includes('--resume')
// --fresh-intake: run only the submit + intake phases (a new application,
// the queue, the reject posture, the sample request), leaving the rest of
// the arc alone. Used to refresh the flow-02 intake captures without
// re-driving the whole chain.
const FRESH_INTAKE = process.argv.includes('--fresh-intake')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length)
const ONLY_LIST = ONLY ? ONLY.split(',').map(s => s.trim()).filter(Boolean) : null
const THEMES = process.argv.includes('--light') ? ['light'] as const
  : process.argv.includes('--dark') ? ['dark'] as const
  : ['light', 'dark'] as const

const NAV_TIMEOUT = 60_000
// The demo's first island paint after a cold login measured ~115s
// (2026-08-30, capture-audiences): the boot spinner persists while the
// profile loads. SETTLE must clear that comfortably; waits poll and
// return early.
const SETTLE = 240_000
// The demo-account sign-in ends in bootstrap({force: true}): the whole
// entity profile downloads before the redirect lands (~120s cold).
const LOGIN_SETTLE = 300_000

// ── Harness (the capture-audiences pattern, same discipline) ──────────

async function gotoCommit(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'commit', timeout: NAV_TIMEOUT })
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT })
}

async function waitIslandSettled(page: Page) {
  // One tolerant wait covering both page kinds: the island pages mount the
  // app shell ([data-layout="app"]) once the Gate resolves; the SSR detail
  // pages never mount it — for them a rendered, spinner-free body is the
  // settled state.
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
  // The demo's profile bootstrap wedges intermittently (the known
  // cold-login flake the capture-audiences harness budgets for): a
  // wedged load keeps the boot spinner forever. One reload re-runs the
  // bootstrap and clears it; a second wedge fails loudly.
  for (let attempt = 0; attempt < 2; attempt++) {
    await gotoCommit(page, `${DEMO}${path}`)
    const settled = await waitIslandSettled(page).then(() => true).catch(() => false)
    if (settled) return
    console.log(`  · island never settled at ${path} (attempt ${attempt + 1}); reloading`)
  }
  throw new Error(`gotoApp: the island never settled at ${path}`)
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

/** The demo's entity-stream wedge: a page can settle its shell while the
 *  data preloads abort with the SSE stream (net::ERR_ABORTED on
 *  /api/entities/*), leaving the content skeleton forever. A reload
 *  re-subscribes and clears it. waitTestIdReload waits the short budget,
 *  reloads once, then waits the full one. */
async function waitTestIdReload(page: Page, testid: string) {
  const found = await page.waitForSelector(`[data-testid="${testid}"]`, { timeout: 60_000 })
    .then(() => true).catch(() => false)
  if (found) return
  console.log(`  · ${testid} never mounted (the stream wedge); reloading the page once`)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
  await waitIslandSettled(page)
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

/** A record act with the edge-death discipline: the demo's edge kills
 *  long operations around 120s (the platform's known runner↔edge
 *  flake), and a killed record leaves the button disabled on `acting`
 *  forever. Click, wait the short budget for the act to settle (the
 *  button re-enables, its label flipping to the Correct repetition when
 *  the record landed), and on the wedge reload once: the run state is
 *  server-side, so a landed record survives, and the caller's loop
 *  re-discovers the open slots from the restored state. */
async function recordAct(page: Page, recordTestid: string) {
  await clickWhenReady(page, recordTestid)
  const settled = await page.waitForFunction(
    (id) => {
      const b = document.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement | null
      return !b || !b.disabled
    },
    recordTestid,
    { timeout: 90_000, polling: 500 },
  ).then(() => true).catch(() => false)
  if (settled) return
  console.log(`  · the record act wedged on ${recordTestid} (the edge death); reloading once`)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
  await waitIslandSettled(page)
  await waitTestIdReload(page, 'lab-run-view')
}

/** Fill a run/evidence input the operator-attestation way: the declared
 *  value rides the input's placeholder (the operator attests it by
 *  re-entering it), and a row without one gets an in-envelope default
 *  from its own unit text (kPa wants an atmosphere, counts the
 *  indication, JSON the readings array). The record refuses an empty or
 *  out-of-envelope value quietly (a warning, not an error), so the
 *  drive's values must pass the envelope — the 2026-08-31 barometric
 *  leg proved 1.000 kPa is not an atmosphere. */
async function smartFill(page: Page, inputTestid: string) {
  const hint = await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement | null
    if (!el) return null
    const row = el.closest('div')
    return {
      text: (row?.parentElement?.textContent ?? row?.textContent ?? '').slice(0, 300),
      placeholder: el.placeholder ?? '',
      value: el.value ?? '',
      type: el.getAttribute('type') ?? 'text',
    }
  }, inputTestid)
  if (!hint) return
  if (hint.value.trim() !== '') return // a bound/typed value already fills it
  const hay = `${hint.text} ${hint.placeholder}`
  let value = ''
  if (hint.placeholder.trim() !== '' && !/json|record as text/i.test(hint.placeholder)) {
    // The declared value: attest it verbatim.
    value = hint.placeholder.trim()
  }
  if (!value) {
    if (/kpa|barometric|atmospheric pressure/i.test(hay) && /json|array|readings/i.test(hay)) value = '[98.5, 101.3]'
    else if (/json|array|readings collection/i.test(hay)) value = '[98.5, 101.3]'
    else if (/kpa|barometric|atmospheric pressure/i.test(hay)) value = '101.3'
    else if (/75%/.test(hay)) value = '15000'
    else if (/D_min/i.test(hay)) value = '0'
    else if (/counts/i.test(hay)) value = '15000'
    else if (/volt/i.test(hay)) value = hint.type === 'number' ? '230' : '230 V AC'
    else value = hint.type === 'number' ? '1' : '1.000'
  }
  if (hint.type === 'number') {
    // number inputs reject non-numeric strings silently
    value = value.replace(/[^0-9.\-]/g, '') || '1'
  }
  await typeTestId(page, inputTestid, value)
}
/** Wait until the Skeleton placeholders (.skel, the demo app's loading
 *  shimmer) are gone: a shot is only honest once no .skel remains. */
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

async function clickWhenReady(page: Page, testid: string) {
  await page.waitForFunction(
    (id) => {
      const b = document.querySelector(`[data-testid="${id}"]`) as HTMLButtonElement | null
      return !!b && !b.disabled
    },
    testid,
    { timeout: SETTLE, polling: 500 },
  )
  await clickTestId(page, testid)
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

async function typeTestId(page: Page, testid: string, value: string) {
  await page.waitForSelector(`[data-testid="${testid}"]`, { timeout: SETTLE })
  await page.evaluate(({ id, v }) => {
    const input = document.querySelector(`[data-testid="${id}"]`) as HTMLInputElement
    input.value = v
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, { id: testid, v: value })
}

// ── The capture registry ──────────────────────────────────────────────

interface CaptureRecord {
  flow: string
  name: string
  file: string
  url: string
  theme: string
  performed: string
  capturedAt: string
}
const records: CaptureRecord[] = []
let currentTheme = 'light'

function wants(name: string) {
  return !ONLY_LIST || ONLY_LIST.some(o => name.includes(o))
}

async function shoot(page: Page, flow: string, name: string, theme: string, performed: string, opts?: { fullPage?: boolean }) {
  const dir = join(OUT, flow)
  mkdirSync(dir, { recursive: true })
  const file = `${name}-${theme}.png`
  await page.screenshot({ path: join(dir, file), fullPage: opts?.fullPage ?? false })
  records.push({
    flow, name, file: `${flow}/${file}`, url: page.url(), theme, performed,
    capturedAt: new Date().toISOString(),
  })
  console.log(`  📷 ${flow}/${file} — ${performed}`)
}

/** A themed context: the demo app reads localStorage 'oiml-smart-theme';
 *  it falls back to the emulated prefers-color-scheme. The demo's PWA
 *  service worker is aborted: its navigateFallback hijacks unprecached
 *  SSR app routes (the known, separately-tracked platform bug). */
async function themedContext(browser: Browser, theme: string) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
    acceptDownloads: true,
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

// ── The drive state (the resume anchors) ──────────────────────────────

interface DriveState {
  phase: string
  appId?: string
  requestPath?: string
}
function loadState(): DriveState {
  if (FRESH_INTAKE) return { phase: 'start' }
  if (!RESUME) return { phase: 'start' }
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as DriveState } catch { return { phase: 'start' } }
}
function saveState(state: DriveState) {
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n')
}

// ── The drive: one application from the wizard to the submitted TR ────
// Ports the platform demo-flow e2e legs (browser/e2e/demo-flow-01/-02/-03
// on the smart repo) to Playwright. Every step is a real act on the live
// demo; the captures along the way are the walkthroughs' audit evidence.

async function submitWizardApplication(page: Page): Promise<string> {
  await gotoApp(page, '/app/portal/applications/new')
  await waitTestId(page, 'portal-wizard')
  await waitTestId(page, 'wizard-step-1')
  await shoot(page, 'application', 'wizard-recommendation', currentTheme, 'opened the new-application wizard: the explicit Recommendation pick (the R 60 card), never a silent default')
  await page.waitForSelector('[data-testid="wizard-standard-card-oiml-r60"]', { timeout: SETTLE })
  await page.evaluate(() => {
    (document.querySelector('[data-testid="wizard-standard-card-oiml-r60"]') as HTMLElement).click()
  })
  await page.waitForTimeout(800)
  // The live wizard: 1 Recommendation → 2 Applicant → 3 Instrument →
  // 4 Samples → 5 Documentation → 6 Scheme & review (the IA cards +
  // the submit).
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
  await shoot(page, 'application', 'wizard-instrument', currentTheme, 'picked the LC-500 family and a model in scope: the instrument step the R 60 model derives (the model-authored declaration form)')
  // The stepper's any-order jump: back to step 1 and forward again, the
  // click-to-jump the flow's any-order posture wants (the stepper's
  // items are the wizard-step-nav-N buttons).
  const jumped = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="wizard-step-nav-1"]') as HTMLElement | null
    if (!el) return false
    el.click()
    return true
  })
  if (jumped) {
    await page.waitForSelector('[data-testid="wizard-step-1"]', { timeout: SETTLE })
    await page.waitForTimeout(900)
    await shoot(page, 'application', 'wizard-stepper-jump', currentTheme, 'jumped the stepper back to a reached step: the steps are individually navigable, the validation posture honest per step')
    await page.evaluate(() => {
      (document.querySelector('[data-testid="wizard-step-nav-3"]') as HTMLElement | null)?.click()
    })
    await page.waitForSelector('[data-testid="wizard-step-3"]', { timeout: SETTLE })
    await page.waitForTimeout(900)
  }
  await cont(4)
  await page.type('[data-testid="wizard-sample-serial"]', `SN-WALK-${DATE.replace(/-/g, '')}`)
  await cont(5)
  await cont(6)
  await page.waitForSelector('[data-testid^="wizard-ia-"]', { timeout: SETTLE })
  await shoot(page, 'application', 'wizard-scheme-ia', currentTheme, 'chose the scheme and the Issuing Authority from the cards (logo or honest monogram, the scope summary, the per-Recommendation filter)', { fullPage: true })
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
  await waitSkeletonGone(page)
  await waitText(page, 'Promise set')
  await shoot(page, 'application', 'application-submitted', currentTheme, `submitted the application (${appId}): the journey opens at "Application submitted", the IA's queue receives it`, { fullPage: true })
  return appId
}

async function iaRequestsSamples(page: Page, appId: string) {
  await gotoApp(page, `/app/ia/applications/${encodeURIComponent(appId)}`)
  await waitTestId(page, 'ia-review-actions')
  await waitSkeletonGone(page)
  await shoot(page, 'ia-intake', 'review-whole-file', currentTheme, `opened the application ${appId} from the review queue: the whole file on one page, and only the acts the state allows`, { fullPage: true })
  await clickTestId(page, 'ia-request-samples')
  await waitTestId(page, 'ia-sample-request-form')
  await page.type('[data-testid="ia-sr-particulars"]', `Walkthrough drive ${DATE} — deliver within 30 days`)
  await shoot(page, 'ia-intake', 'sample-request-form', currentTheme, 'issued the sample request from the review: the particulars typed, the decision acts honestly closed until the receipts')
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

async function iaAcceptToProject(page: Page, appId: string) {
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
  // Accept → the Evaluation Project (the TEP hub). A transient failure
  // leaves a toast and no redirect, so retry once after a reload.
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
  await waitSkeletonGone(page)
  await page.waitForSelector('[data-testid^="tep-select-sample-"], [data-testid="tep-selected-count"]', { timeout: SETTLE })
  await waitText(page, 'Application record')
  await shoot(page, 'ia-intake', 'accept-tep-hub', currentTheme, `accepted the application: the Evaluation Project ${appId} opens as one hub (samples, requests, reports, verdicts, the certificate-to-be)`, { fullPage: true })
}

async function tepSelectSamplesAndDispatch(page: Page, appId: string) {
  // The samples for the evaluation, with the justification (R 60-3 §4.7).
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
  await page.waitForFunction(
    () => !document.querySelector('[data-testid^="tep-select-sample-"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await shoot(page, 'ia-intake', 'tep-samples-selected', currentTheme, 'registered the receipts and selected the samples for the evaluation with the recorded justification: only the selected enter the dispatch pool')

  // The dispatch builder: the test-forms × samples matrix, one request
  // to the Example Test Laboratory (org 21).
  await clickTestId(page, 'tep-new-request')
  await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/ia/dispatch/'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  await waitTestId(page, 'ia-dispatch-builder')
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
  await shoot(page, 'ia-intake', 'dispatch-builder', currentTheme, 'composed the dispatch: the test-forms by samples matrix, one TestRequest to the Example Test Laboratory', { fullPage: true })
  await clickTestId(page, 'ia-issue-requests')
  await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/ia/projects/'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitIslandSettled(page)
  await waitTestId(page, 'tep-test-requests')
}

async function tepCustodyShip(page: Page) {
  // The routing decision made concrete: the IA ships the selected
  // samples to the laboratory from the project's samples card. The
  // dispatch select is a Vue :value binding: the change event lands the
  // choice, and the Dispatch button enables only on the next tick, so the
  // click waits for enabled (the 2026-08-31 drive raced it and the click
  // no-oped on a still-disabled button). The loop ships whatever still
  // shows a dispatch row, so a partially-shipped project resumes cleanly.
  let shipped = 0
  for (let i = 0; i < 6; i++) {
    const sampleId = await page.evaluate(() => {
      const row = document.querySelector('[data-testid^="tep-dispatch-row-"]')
      return row?.getAttribute('data-testid')?.replace('tep-dispatch-row-', '') ?? ''
    })
    if (!sampleId) break
    const selTestid = `tep-dispatch-lab-${sampleId}`
    const picked = await page.evaluate((id) => {
      const select = document.querySelector(`[data-testid="${id}"]`) as HTMLSelectElement | null
      if (!select) return false
      const opt = Array.from(select.options).find(o => o.value === '21')
        ?? Array.from(select.options).find(o => o.value)
      if (!opt) return false
      select.value = opt.value
      select.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }, selTestid)
    if (!picked) throw new Error('custody: no laboratory choosable on the dispatch row')
    await page.waitForFunction(
      (id) => {
        const b = document.querySelector(`[data-testid="tep-dispatch-sample-${id}"]`) as HTMLButtonElement | null
        return !!b && !b.disabled
      },
      sampleId,
      { timeout: SETTLE, polling: 500 },
    )
    await clickTestId(page, `tep-dispatch-sample-${sampleId}`)
    await page.waitForFunction(
      (id) => !document.querySelector(`[data-testid="tep-dispatch-row-${id}"]`),
      sampleId,
      { timeout: SETTLE, polling: 500 },
    )
    shipped++
  }
  if (shipped === 0) {
    // Already fully shipped (a resumed run): confirm the transit state
    // rather than fail.
    const inTransit = await page.evaluate(() =>
      /in[_ ]transit/i.test(document.querySelector('[data-testid="tep-card-samples"]')?.textContent ?? document.body.innerText))
    if (!inTransit) throw new Error('custody: no selected sample shipped and none in transit')
  }
  await shoot(page, 'ia-intake', 'custody-shipped', currentTheme, 'the routing decision on the record: the IA shipped the selected samples to the laboratory, the custody chain carries who shipped what')
}

async function tlAcceptAndWork(page: Page): Promise<string> {
  // The TL's queue receives the request.
  await gotoApp(page, '/app/lab')
  await page.waitForFunction(
    () => !!document.querySelector('[data-testid^="lab-incoming-"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitSkeletonGone(page)
  await shoot(page, 'tl-work', 'lab-inbox-incoming', currentTheme, 'the laboratory inbox: the dispatched request landed in the incoming bucket, live')
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
  // The open-request click is a client-side router.push: the request view
  // is proven by its own acts, never by the URL.
  await waitTestId(page, 'lab-request-accept')
  await waitSkeletonGone(page)
  await shoot(page, 'tl-work', 'request-open', currentTheme, 'opened the test request: the assigned forms, the samples, the honest accept/decline pair (the decline wants the reason)', { fullPage: true })
  await clickTestId(page, 'lab-request-accept')
  await waitTestId(page, 'lab-request-samples')
  await waitTestId(page, 'lab-request-assignments')
  await waitSkeletonGone(page)
  await page.waitForTimeout(1200)
  await shoot(page, 'tl-work', 'request-accepted', currentTheme, 'accepted the assignment: the laboratory joins the Evaluation Project dataspace and the working panels reveal (the chain context names the IA and the applicant)', { fullPage: true })
  return new URL(page.url()).pathname
}

/** Receive the shipped samples at the laboratory (the guided demo's
 *  step 12): the first with the full registration (dimensions,
 *  photograph), the rest with the bare "Mark received". The request
 *  start stays closed until no sample stands in transit. */
async function tlReceiveSamples(page: Page) {
  await page.waitForFunction(
    () => /in[_ ]transit/i.test(document.querySelector('[data-testid="lab-request-samples"]')?.textContent ?? ''),
    undefined,
    { timeout: SETTLE, polling: 500 },
  ).catch(() => {})
  // The full registration on the first in-transit sample.
  const firstId = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid^="lab-register-receipt-"]')
    return btn?.getAttribute('data-testid')?.replace('lab-register-receipt-', '') ?? ''
  })
  if (firstId) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const state = await page.evaluate((id) => {
        if (document.querySelector(`[data-testid="lab-receipt-form-${id}"]`)) return 'open'
        const btn = document.querySelector(`[data-testid="lab-register-receipt-${id}"]`)
        if (btn) { (btn as HTMLElement).click(); return 'clicked' }
        return 'none'
      }, firstId)
      if (state === 'open') break
      if (state === 'none' && attempt === 9) throw new Error('no register-receipt button appeared')
      await page.waitForTimeout(500)
    }
    await page.type('[data-testid="lab-receipt-length"]', '120')
    await page.type('[data-testid="lab-receipt-width"]', '60')
    await page.type('[data-testid="lab-receipt-height"]', '80')
    await page.type('[data-testid="lab-receipt-photo"]', 'receipt-walk.png')
    await clickTestId(page, 'lab-confirm-receipt')
    await page.waitForFunction(
      (id) => !document.querySelector(`[data-testid="lab-receipt-form-${id}"]`),
      firstId,
      { timeout: SETTLE, polling: 500 },
    )
  }
  // The remaining samples: the bare "Mark received" until none in transit.
  for (let i = 0; i < 6; i++) {
    const state = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="lab-request-samples"]')?.textContent ?? ''
      if (!/in[_ ]transit/i.test(t)) return 'done'
      const b = document.querySelector('[data-testid="lab-sample-receive"]') as HTMLButtonElement | null
      if (b && !b.disabled) { b.click(); return 'clicked' }
      const reg = document.querySelector('[data-testid^="lab-register-receipt-"]') as HTMLElement | null
      if (reg) { reg.click(); return 'form' }
      return 'waiting'
    })
    if (state === 'done') break
    if (state === 'form') {
      const formId = await page.evaluate(() =>
        document.querySelector('[data-testid^="lab-receipt-form-"]')?.getAttribute('data-testid')?.replace('lab-receipt-form-', '') ?? '')
      if (formId) {
        await clickTestId(page, 'lab-confirm-receipt')
        await page.waitForFunction(
          (id) => !document.querySelector(`[data-testid="lab-receipt-form-${id}"]`),
          formId,
          { timeout: SETTLE, polling: 500 },
        )
      }
    }
    if (i === 5) throw new Error('sample receipts did not converge')
    await page.waitForTimeout(700)
  }
  await page.waitForFunction(
    () => !/in[_ ]transit/i.test(document.querySelector('[data-testid="lab-request-samples"]')?.textContent ?? ''),
    undefined,
    { timeout: SETTLE, polling: 500 },
  )
  await waitSkeletonGone(page)
  await shoot(page, 'tl-work', 'samples-received', currentTheme, 'received the samples at the laboratory: the first with the full registration (dimensions, photograph), the custody chain closed at the bench', { fullPage: true })
}

async function tlRunAndReport(page: Page, requestPath: string) {
  // Start the work, then draft the report FIRST (the draft-first order:
  // every run completion backfills onto the standing draft). Both acts
  // are presence-gated: a resumed run finds them already done.
  const hasStart = await page.evaluate(() => !!document.querySelector('[data-testid="lab-request-start"]'))
  if (hasStart) {
    await clickWhenReady(page, 'lab-request-start')
    await waitTestId(page, 'lab-request-draft-report')
  }
  const hasDraft = await page.evaluate(() => !!document.querySelector('[data-testid="lab-request-draft-report"]'))
  if (hasDraft) {
    await clickWhenReady(page, 'lab-request-draft-report')
    await page.waitForFunction(
      () => window.location.pathname.startsWith('/app/lab/reports/'),
      undefined,
      { timeout: SETTLE, polling: 500 },
    )
    await waitIslandSettled(page)
    await waitTestId(page, 'lab-report-composer')
    await waitSkeletonGone(page)
    await shoot(page, 'tl-work', 'report-draft-completeness', currentTheme, 'drafted the Test Report before any run: the completeness gate names every unrun assignment, the runs backfill the standing draft', { fullPage: true })
  }

  // Back on the request, open the first assignment's run: the
  // model-driven step wizard walks the declared procedure.
  await gotoApp(page, requestPath)
  await waitTestIdReload(page, 'lab-request-assignments')
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="lab-assignment-run"]') as HTMLElement | null
    btn?.click()
  })
  await waitTestIdReload(page, 'lab-run-view')
  await waitSkeletonGone(page)
  // The run header's tooltip reads the conformance model (the wave-3
  // mechanism): open it for the capture when it mounts.
  const tipTrigger = await page.evaluate(() => {
    const el = document.querySelector('[data-testid^="tooltip-trigger-test-"]') as HTMLElement | null
    if (el) { el.click(); return true }
    return false
  })
  if (tipTrigger) {
    await page.waitForSelector('[data-testid^="tooltip-popover-test-"]', { timeout: SETTLE })
    await page.waitForTimeout(600)
  }
  await shoot(page, 'tl-work', 'run-wizard', currentTheme, 'opened the model-driven run: the step wizard walks the declared procedure, the header tooltip reads the test\'s purpose and clause from the model', { fullPage: true })
  if (tipTrigger) {
    // close the popover before driving the steps
    await page.keyboard.press('Escape').catch(() => {})
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.())
  }

  // Complete the run's steps, GENERICALLY: each step of the declared
  // procedure presents one of the three act kinds (an observation record
  // with its optional input, a slot record, or a plain done), and the
  // step kinds differ per test — the drive must not assume the load
  // test's shape (the 2026-08-31 run dispatched a different first form
  // and the load-test-only drive stalled on step 1).
  const completeRun = async () => {
    for (let step = 1; step <= 12; step++) {
      // Navigate to the step when the stepper carries it.
      const hasNav = await page.evaluate((s) => !!document.querySelector(`[data-testid="wizard-step-${s}"]`), step)
      if (!hasNav) break
      await clickTestId(page, `wizard-step-${step}`)
      await page.waitForTimeout(600)
      const kind = await page.evaluate((s) => {
        if (document.querySelector(`[data-testid="wizard-observation-record-${s}"]`)) return 'observation'
        if (document.querySelector('[data-testid^="wizard-slot-record-"]')) return 'slot'
        if (document.querySelector(`[data-testid="wizard-step-done-${s}"]`)) return 'done'
        // Already complete (a re-entered run)?
        if (document.querySelector(`[data-testid="wizard-step-${s}"]`)?.getAttribute('data-state') === 'done') return 'complete'
        return 'unknown'
      }, step)
      if (kind === 'complete') continue
      if (kind === 'unknown') break
      if (kind === 'observation') {
        const hasInput = await page.evaluate((s) => !!document.querySelector(`[data-testid="wizard-observation-input-${s}"]`), step)
        if (hasInput) await smartFill(page, `wizard-observation-input-${step}`)
        await recordAct(page, `wizard-observation-record-${step}`)
      } else if (kind === 'slot') {
        for (let i = 0; i < 8; i++) {
          // Only the fresh 'Record' buttons: a recorded slot's button
          // reads 'Correct (rep N)' and must never be re-clicked.
          const slotId = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('[data-testid^="wizard-slot-record-"]'))
              .find(b => (b.textContent ?? '').trim() === 'Record')
            return btn?.getAttribute('data-testid')?.replace('wizard-slot-record-', '') ?? null
          })
          if (!slotId) break
          const inputId = `wizard-slot-input-${slotId}`
          const hasInput = await page.evaluate((id) => !!document.querySelector(`[data-testid="${id}"]`), inputId)
          if (hasInput) await smartFill(page, inputId)
          await recordAct(page, `wizard-slot-record-${slotId}`)
          const refused = await page.evaluate((id) => {
            const b = document.querySelector(`[data-testid="${id}"]`)
            return !!b && (b.textContent ?? '').trim() === 'Record'
          }, `wizard-slot-record-${slotId}`)
          if (refused) throw new Error(`slot ${slotId} refused the recorded value`)
        }
      } else {
        await recordAct(page, `wizard-step-done-${step}`)
      }
      await page.waitForFunction(
        (s) => document.querySelector(`[data-testid="wizard-step-${s}"]`)?.getAttribute('data-state') === 'done',
        step,
        { timeout: SETTLE, polling: 500 },
      )
    }
    // The per-test evidence: every open row records (the completeness
    // gate holds Complete run until the required set is filled), the
    // declared values attested verbatim, the direct readings in
    // envelope. Recorded rows flip to 'Correct (rep N)' and drop out.
    for (let i = 0; i < 30; i++) {
      const ev = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('[data-testid^="evidence-record-"]'))
          .find(b => (b.textContent ?? '').trim() === 'Record')
        return btn?.getAttribute('data-testid')?.replace('evidence-record-', '') ?? null
      })
      if (!ev) break
      const inputId = `evidence-input-${ev}`
      const hasInput = await page.evaluate((id) => !!document.querySelector(`[data-testid="${id}"]`), inputId)
      if (hasInput) await smartFill(page, inputId)
      await recordAct(page, `evidence-record-${ev}`)
      const refused = await page.evaluate((id) => {
        const b = document.querySelector(`[data-testid="${id}"]`)
        return !!b && (b.textContent ?? '').trim() === 'Record'
      }, `evidence-record-${ev}`)
      if (refused) throw new Error(`evidence row ${ev} refused the recorded value`)
    }
    await clickWhenReady(page, 'lab-run-complete')
    // The completion round-trips the admissibility recompute; the same
    // edge death applies, so the wait is bounded with one reload (the
    // completed state is server-side; a dead completion is re-clicked).
    for (let attempt = 0; attempt < 2; attempt++) {
      const completed = await page.waitForSelector('[data-testid="lab-run-completed"]', { timeout: 90_000 })
        .then(() => true).catch(() => false)
      if (completed) break
      if (attempt === 1) throw new Error('the run never completed (two completion attempts)')
      console.log('  · the completion wedged (the edge death); reloading and re-clicking once')
      await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT })
      await waitIslandSettled(page)
      await waitTestIdReload(page, 'lab-run-view')
      const landed = await page.evaluate(() => !!document.querySelector('[data-testid="lab-run-completed"]'))
      if (!landed) await clickWhenReady(page, 'lab-run-complete')
    }
    await waitTestId(page, 'lab-run-completed')
  }
  await completeRun()
  await shoot(page, 'tl-work', 'run-completed', currentTheme, 'completed the run: every step\'s evidence recorded against the model\'s procedure, the attested record filled, the run locked')

  // The second sample's run completes too (the completeness gate names
  // every assigned sample). The first remaining run button opens it; an
  // already-completed run (a resumed drive) is skipped honestly.
  await gotoApp(page, requestPath)
  await waitTestIdReload(page, 'lab-request-assignments')
  const second = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="lab-assignment-run"]') as HTMLElement | null
    if (btn) { btn.click(); return true }
    return false
  })
  if (second) {
    await waitTestId(page, 'lab-run-view')
    const alreadyDone = await page.evaluate(() => !!document.querySelector('[data-testid="lab-run-completed"]'))
    if (!alreadyDone) await completeRun()
  }

  // The TR: the omissions for the forms the run does not cover, the
  // signature acknowledgment, the finalize + submit.
  await gotoApp(page, requestPath)
  await waitTestIdReload(page, 'lab-request-assignments')
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="lab-request-open-report"]') as HTMLElement | null
    btn?.click()
  })
  const openedReport = await page.waitForFunction(
    () => window.location.pathname.startsWith('/app/lab/reports/'),
    undefined,
    { timeout: 30_000, polling: 500 },
  ).then(() => true).catch(() => false)
  if (!openedReport) {
    await gotoApp(page, requestPath)
    await waitTestIdReload(page, 'lab-request-draft-report')
    await clickWhenReady(page, 'lab-request-draft-report')
    await page.waitForFunction(
      () => window.location.pathname.startsWith('/app/lab/reports/'),
      undefined,
      { timeout: SETTLE, polling: 500 },
    )
  }
  await waitIslandSettled(page)
  await waitTestIdReload(page, 'lab-report-composer')
  await page.waitForFunction(
    () => !!document.querySelector('[data-testid^="omit-"]'),
    undefined,
    { timeout: SETTLE, polling: 500 },
  ).catch(() => {})
  for (let i = 0; i < 60; i++) {
    const omitId = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid^="omit-"]') as HTMLElement | null
      if (!btn) return null
      const input = btn.closest('div')!.querySelector('input') as HTMLInputElement
      input.value = 'not applicable to this type evaluation (covered by the performed tests)'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      const id = btn.getAttribute('data-testid')!
      btn.click()
      return id
    })
    if (!omitId) {
      const oneBack = await page.waitForFunction(
        () => !!document.querySelector('[data-testid^="omit-"]'),
        undefined,
        { timeout: 3_000, polling: 500 },
      ).then(() => true).catch(() => false)
      if (!oneBack) break
      continue
    }
    await page.waitForFunction(
      (t) => !document.querySelector(`[data-testid="${t}"]`),
      omitId,
      { timeout: 5_000, polling: 500 },
    ).then(() => true).catch(() => false)
  }
  await typeTestId(page, 'lab-report-position', 'Senior test engineer')
  await shoot(page, 'tl-work', 'report-composer-gate', currentTheme, 'accounted for every remaining required form with a justified omission: the gate names the last blocker (the signature acknowledgment), nothing submits silently', { fullPage: true })
  for (let attempt = 0; attempt < 10; attempt++) {
    const state = await page.evaluate(() => ({
      checked: (document.querySelector('[data-testid="lab-report-acknowledge"]') as HTMLInputElement | null)?.checked ?? null,
      enabled: !((document.querySelector('[data-testid="lab-report-issue"]') as HTMLButtonElement | null)?.disabled ?? true),
    }))
    if (state.enabled) break
    if (state.checked === false) {
      await page.evaluate(() => {
        (document.querySelector('[data-testid="lab-report-acknowledge"]') as HTMLElement | null)?.click()
      })
    }
    if (attempt === 9) throw new Error('the acknowledgment tick never lifted the finalize gate')
    await page.waitForTimeout(400)
  }
  await clickTestId(page, 'lab-report-issue')
  await waitTestId(page, 'lab-report-locked')
  await shoot(page, 'tl-work', 'report-submitted', currentTheme, 'finalized and submitted the report: the TR locks, the IA is notified through the Evaluation Project', { fullPage: true })
}

async function driveChain(browser: Browser) {
  console.log('\n═══ THE DRIVE — one application wizard → dispatch → TL work → TR submitted ═══')
  const state = loadState()
  // A FRESH context per role leg (the capture-audiences discipline: a
  // twice-switched context can wedge the profile bootstrap).
  const leg = async (name: string, prefix: string) => {
    const context = await themedContext(browser, 'light')
    const page = await context.newPage()
    await loginAs(context, page, name, prefix)
    return { context, page }
  }

  let appId = state.appId
  let requestPath = state.requestPath

  if (state.phase === 'start') {
    appId = await (async () => {
      const { context, page } = await leg('Applicant', '/app/portal')
      try { return await submitWizardApplication(page) } finally { await context.close() }
    })()
    saveState({ phase: 'submitted', appId })
    state.phase = 'submitted'
  }

  if (state.phase === 'submitted') {
    const { context, page } = await leg('Issuing Authority', '/app/ia')
    try {
      await gotoApp(page, '/app/ia')
      await waitSkeletonGone(page)
      await page.waitForSelector('[data-testid^="age-chip-review-"]', { timeout: SETTLE })
      await shoot(page, 'ia-intake', 'review-queue', currentTheme, 'the review queue with the waiting application, oldest first: a queue, not an inbox folder')
      // The reject-with-reason posture, proven without consuming the
      // application: the reasonless confirm refuses (the warning names
      // PD-05 §4.2.2) and the form stays open; cancelled, the
      // application stands.
      await gotoApp(page, `/app/ia/applications/${encodeURIComponent(appId!)}`)
      await waitTestId(page, 'ia-review-actions')
      await waitSkeletonGone(page)
      await clickTestId(page, 'ia-reject')
      await waitTestId(page, 'ia-rejection-input')
      await clickTestId(page, 'ia-confirm-reject')
      await page.waitForTimeout(900)
      await waitTestId(page, 'ia-rejection-input')
      await shoot(page, 'ia-intake', 'reject-requires-reason', currentTheme, 'tried to reject without a reason: the act refuses (the warning names PD-05 §4.2.2), the form stays open, the reason is required and lands on the audit chain')
      await clickButtonByText(page, 'Cancel')
      await page.waitForFunction(
        () => !document.querySelector('[data-testid="ia-rejection-input"]'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await iaRequestsSamples(page, appId!)
    } finally { await context.close() }
    saveState({ phase: 'samples-requested', appId })
    state.phase = 'samples-requested'
  }

  if (state.phase === 'samples-requested') {
    if (FRESH_INTAKE) {
      console.log('═══ FRESH INTAKE COMPLETE — a new application stands samples-requested ═══\n')
      return { appId: appId!, requestPath: requestPath! }
    }
    const { context, page } = await leg('Applicant', '/app/portal')
    try { await applicantShips(page, appId!) } finally { await context.close() }
    saveState({ phase: 'shipped', appId })
    state.phase = 'shipped'
  }

  if (state.phase === 'shipped') {
    const { context, page } = await leg('Issuing Authority', '/app/ia')
    try {
      await iaAcceptToProject(page, appId!)
      await tepSelectSamplesAndDispatch(page, appId!)
    } finally { await context.close() }
    saveState({ phase: 'dispatched', appId })
    state.phase = 'dispatched'
  }

  if (state.phase === 'dispatched') {
    // The custody leg in its own phase: it resumes cleanly from a
    // partially-shipped project (the 2026-08-31 drive failed here once
    // mid-phase and the resume proved the split).
    const { context, page } = await leg('Issuing Authority', '/app/ia')
    try {
      await gotoApp(page, `/app/ia/projects/${encodeURIComponent(appId!)}`)
      await waitTestId(page, 'ia-project-hub')
      await waitText(page, 'Application record')
      await waitSkeletonGone(page)
      await tepCustodyShip(page)
    } finally { await context.close() }
    saveState({ phase: 'custody-shipped', appId })
    state.phase = 'custody-shipped'
  }

  if (state.phase === 'custody-shipped') {
    const { context, page } = await leg('Test Laboratory', '/app/lab')
    try {
      requestPath = await tlAcceptAndWork(page)
      // The scoped project view: the dataspace join per the TL cone (the
      // instrument and the laboratory's own samples, never the evaluation
      // workspace).
      await gotoApp(page, `/app/lab/projects/${encodeURIComponent(appId!)}`)
      await waitTestId(page, 'lab-project-view')
      await waitSkeletonGone(page)
      await page.waitForSelector('[data-testid="tep-card-instrument"]', { timeout: SETTLE })
      const coneHonest = await page.evaluate(() =>
        !document.querySelector('[data-testid="tep-card-evaluation"]')
        && !document.querySelector('[data-testid="tep-card-completion"]'))
      if (coneHonest) {
        await shoot(page, 'tl-work', 'project-view-cone', currentTheme, 'the laboratory\'s scoped view of the Evaluation Project: the instrument and the samples shared, the evaluation workspace honestly absent (the TL cone)', { fullPage: true })
      } else {
        console.log('  · project-view-cone: the scoped view carried an out-of-cone card — NOT captured, the cone wants a platform look')
      }
      await gotoApp(page, requestPath)
      await waitTestId(page, 'lab-request-detail')
      await tlReceiveSamples(page)
    } finally { await context.close() }
    saveState({ phase: 'tl-received', appId, requestPath })
    state.phase = 'tl-received'
  }

  if (state.phase === 'tl-received') {
    const { context, page } = await leg('Test Laboratory', '/app/lab')
    try {
      await gotoApp(page, requestPath!)
      await waitTestIdReload(page, 'lab-request-detail')
      await tlRunAndReport(page, requestPath!)
    } finally { await context.close() }
    saveState({ phase: 'report-submitted', appId, requestPath })
    state.phase = 'report-submitted'
  }

  if (state.phase === 'doc-run') {
    // The run-completion sub-chain (the run-marks e2e leg's proven
    // recipe): the documentation-examination run completes with the
    // overall result recorded, signed, and the constraints checked. The
    // first dispatch's performance test answered its admissibility gate
    // with an INVALIDATED run (the honest posture: an inadmissible
    // completion invalidates); the walkthrough's run-completion and
    // report-submission captures ride this form, the one the platform's
    // own CI leg completes on this build.
    let docPath = state.requestPath
    {
      const { context, page } = await leg('Issuing Authority', '/app/ia')
      try {
        await gotoApp(page, `/app/ia/projects/${encodeURIComponent(appId!)}`)
        await waitTestId(page, 'ia-project-hub')
        await waitText(page, 'Application record')
        await waitSkeletonGone(page)
        await clickTestId(page, 'tep-new-request')
        await page.waitForFunction(
          () => window.location.pathname.startsWith('/app/ia/dispatch/'),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await waitIslandSettled(page)
        await waitTestId(page, 'ia-dispatch-builder')
        await page.waitForSelector('[data-testid="ia-matrix-row"][data-form-id="documentation-examination"]', { timeout: SETTLE })
        await clickTestId(page, 'ia-clear')
        await page.evaluate(() => {
          const row = document.querySelector('[data-testid="ia-matrix-row"][data-form-id="documentation-examination"]')
          const input = row?.querySelector('input[data-lab-id="21"]') as HTMLElement | null
          if (!input) throw new Error('no matrix cell for documentation-examination × lab 21')
          input.click()
        })
        await waitTestId(page, 'ia-plan-21')
        await clickTestId(page, 'ia-issue-requests')
        await page.waitForFunction(
          () => window.location.pathname.startsWith('/app/ia/projects/'),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await waitIslandSettled(page)
        await waitTestId(page, 'tep-test-requests')
      } finally { await context.close() }
      saveState({ phase: 'doc-dispatched', appId, requestPath: docPath })
      state.phase = 'doc-dispatched'
    }
  }

  if (state.phase === 'doc-dispatched') {
    let docPath = state.requestPath
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
        // Open the documentation-examination request (the newest incoming
        // row carries it).
        await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('[data-testid^="lab-incoming-"]'))
          const row = rows.find(r => (r.textContent ?? '').includes('documentation'))
            ?? rows[rows.length - 1]
          const btn = row?.querySelector('button[data-testid^="lab-open-request-"]') as HTMLElement | null
          btn?.click()
        })
        await page.waitForFunction(
          () => /\/app\/lab\/requests\//.test(window.location.pathname),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await waitIslandSettled(page)
        // Presence-gated for the resume: the accept may already have landed.
        const acceptPresent = await page.evaluate(() => !!document.querySelector('[data-testid="lab-request-accept"]'))
        if (acceptPresent) {
          await clickTestId(page, 'lab-request-accept')
          await page.waitForFunction(
            () => /accepted[_ ]by[_ ]lab/i.test(document.body.innerText),
            undefined,
            { timeout: SETTLE, polling: 500 },
          )
        }
        await waitSkeletonGone(page)
        await page.waitForTimeout(1200)
        docPath = new URL(page.url()).pathname

        // Start the work, then complete the documentation run per sample
        // (the run-marks recipe: overall result recorded, signed, the
        // constraints checked, then the completion). Every act
        // presence-gated: a resume finds the done ones already done.
        const startPresent = await page.evaluate(() => !!document.querySelector('[data-testid="lab-request-start"]'))
        if (startPresent) await clickWhenReady(page, 'lab-request-start')
        await waitTestIdReload(page, 'lab-request-assignments')
        for (let row = 0; row < 2; row++) {
          if (row > 0) {
            await gotoApp(page, docPath)
            await waitTestIdReload(page, 'lab-request-detail')
          }
          await page.evaluate(() => {
            const btn = document.querySelector('[data-testid="lab-assignment-run"]') as HTMLElement | null
            btn?.click()
          })
          await waitTestIdReload(page, 'lab-run-view')
          await waitSkeletonGone(page)
          const alreadyCompleted = await page.evaluate(() => !!document.querySelector('[data-testid="lab-run-completed"]'))
          if (alreadyCompleted) continue
          await page.waitForSelector('[data-testid="evidence-row-overall_result"]', { timeout: SETTLE })
          const needsRecord = await page.evaluate(() => {
            const b = document.querySelector('[data-testid="evidence-record-overall_result"]')
            return !!b && (b.textContent ?? '').trim() === 'Record'
          })
          if (needsRecord) {
            await page.evaluate(() => {
              const sel = document.querySelector('[data-testid="evidence-row-overall_result"] select') as HTMLSelectElement | null
              if (sel) {
                sel.value = 'true'
                sel.dispatchEvent(new Event('change', { bubbles: true }))
              }
            })
            await recordAct(page, 'evidence-record-overall_result')
          }
          const signPresent = await page.evaluate(() => !!document.querySelector('[data-testid="evidence-sign-overall_result"]'))
          if (signPresent) {
            await clickTestId(page, 'evidence-sign-overall_result')
            await page.waitForTimeout(800)
          }
          const checkPresent = await page.evaluate(() => !!document.querySelector('[data-testid="lab-run-check-constraints"]'))
          if (checkPresent) await clickTestId(page, 'lab-run-check-constraints')
          await page.waitForFunction(
            () => {
              const btn = document.querySelector('[data-testid="lab-run-complete"]') as HTMLButtonElement | null
              return !!btn && !btn.disabled
            },
            undefined,
            { timeout: SETTLE, polling: 500 },
          )
          await clickTestId(page, 'lab-run-complete')
          await page.waitForSelector('[data-testid="lab-run-completed"]', { timeout: SETTLE })
          if (row === 0) {
            await shoot(page, 'tl-work', 'run-completed', currentTheme, 'completed the run: the result recorded and signed per measurement, the constraints checked, the run locked', { fullPage: true })
          }
        }

        // The TR: draft, account for the remaining forms with justified
        // omissions, the position, the acknowledgment, finalize + submit.
        await gotoApp(page, docPath)
        await waitTestIdReload(page, 'lab-request-detail')
        const hasDraft2 = await page.evaluate(() => !!document.querySelector('[data-testid="lab-request-draft-report"]'))
        if (hasDraft2) {
          await clickWhenReady(page, 'lab-request-draft-report')
          await page.waitForFunction(
            () => window.location.pathname.startsWith('/app/lab/reports/'),
            undefined,
            { timeout: SETTLE, polling: 500 },
          )
        } else {
          await page.evaluate(() => {
            const btn = document.querySelector('[data-testid="lab-request-open-report"]') as HTMLElement | null
            btn?.click()
          })
          await page.waitForFunction(
            () => window.location.pathname.startsWith('/app/lab/reports/'),
            undefined,
            { timeout: SETTLE, polling: 500 },
          )
        }
        await waitIslandSettled(page)
        await waitTestIdReload(page, 'lab-report-composer')
        await page.waitForFunction(
          () => !!document.querySelector('[data-testid^="omit-"]'),
          undefined,
          { timeout: SETTLE, polling: 500 },
        ).catch(() => {})
        for (let i = 0; i < 60; i++) {
          const omitId = await page.evaluate(() => {
            const btn = document.querySelector('[data-testid^="omit-"]') as HTMLElement | null
            if (!btn) return null
            const input = btn.closest('div')!.querySelector('input') as HTMLInputElement
            input.value = 'not applicable to this type evaluation (covered by the performed tests)'
            input.dispatchEvent(new Event('input', { bubbles: true }))
            const id = btn.getAttribute('data-testid')!
            btn.click()
            return id
          })
          if (!omitId) {
            const oneBack = await page.waitForFunction(
              () => !!document.querySelector('[data-testid^="omit-"]'),
              undefined,
              { timeout: 3_000, polling: 500 },
            ).then(() => true).catch(() => false)
            if (!oneBack) break
            continue
          }
          await page.waitForFunction(
            (t) => !document.querySelector(`[data-testid="${t}"]`),
            omitId,
            { timeout: 5_000, polling: 500 },
          ).then(() => true).catch(() => false)
        }
        await typeTestId(page, 'lab-report-position', 'Senior test engineer')
        await shoot(page, 'tl-work', 'report-composer-gate', currentTheme, 'accounted for every remaining required form with a justified omission: the gate names the last blocker (the signature acknowledgment), nothing submits silently', { fullPage: true })
        for (let attempt = 0; attempt < 10; attempt++) {
          const st = await page.evaluate(() => ({
            checked: (document.querySelector('[data-testid="lab-report-acknowledge"]') as HTMLInputElement | null)?.checked ?? null,
            enabled: !((document.querySelector('[data-testid="lab-report-issue"]') as HTMLButtonElement | null)?.disabled ?? true),
          }))
          if (st.enabled) break
          if (st.checked === false) {
            await page.evaluate(() => {
              (document.querySelector('[data-testid="lab-report-acknowledge"]') as HTMLElement | null)?.click()
            })
          }
          if (attempt === 9) throw new Error('the acknowledgment tick never lifted the finalize gate')
          await page.waitForTimeout(400)
        }
        await clickTestId(page, 'lab-report-issue')
        await waitTestId(page, 'lab-report-locked')
        await shoot(page, 'tl-work', 'report-submitted', currentTheme, 'finalized and submitted the report: the TR locks, the IA is notified through the Evaluation Project', { fullPage: true })
      } finally { await context.close() }
      saveState({ phase: 'report-submitted', appId, requestPath: docPath })
      state.phase = 'report-submitted'
    }
  }

  console.log(`═══ DRIVE COMPLETE — application ${appId}, report submitted (the register story stays the seeded one) ═══\n`)
  return { appId: appId!, requestPath: requestPath! }
}

// ── The read-only captures ────────────────────────────────────────────

async function captureLoginAndGuided(browser: Browser) {
  if (!['login-accounts', 'guided-demo'].some(wants)) return
  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    if (wants('login-accounts')) {
      await signOut(context)
      await gotoCommit(page, `${DEMO}/app/login`)
      // The account buttons mount with the island; wait for a cast member.
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button'))
          .some(b => b.querySelector('span')?.textContent?.trim() === 'BIML Officer'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await page.waitForTimeout(1200)
      await shoot(page, 'shared', 'login-accounts', theme, 'the demo login page: the fictional cast as one-click accounts, the shared demo password, the guided-demo entry', { fullPage: true })
    }
    if (wants('guided-demo')) {
      await signOut(context)
      await gotoCommit(page, `${DEMO}/app/login`)
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button'))
          .some(b => (b.textContent ?? '').includes('guided demo')),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => (b.textContent ?? '').includes('guided demo'))
        ;(btn as HTMLElement | undefined)?.click()
      })
      await page.waitForTimeout(2500)
      await waitText(page, 'Step 1 of 24')
      await shoot(page, 'shared', 'guided-demo', theme, 'started the guided demo: the presenter script walks the full certification flow, step 1 of 24, from the login page', { fullPage: true })
    }
    await context.close()
  }
}

/** The flow-01 wizard surfaces are fill-never-submit: opening the wizard
 *  and walking its steps is the applicant's everyday act, and nothing
 *  lands on any queue until the submit the drive performs. */
async function captureWizard(browser: Browser) {
  if (!['wizard-recommendation', 'wizard-instrument', 'wizard-scheme-ia', 'wizard-stepper-jump', 'portal-draft'].some(wants)) return
  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Applicant', '/app/portal')
    await gotoApp(page, '/app/portal/applications/new')
    await waitTestId(page, 'portal-wizard')
    await waitTestId(page, 'wizard-step-1')
    if (wants('wizard-recommendation')) {
      await shoot(page, 'application', 'wizard-recommendation', theme, 'opened the new-application wizard: the explicit Recommendation pick (the R 60 card), never a silent default')
    }
    await page.evaluate(() => {
      (document.querySelector('[data-testid="wizard-standard-card-oiml-r60"]') as HTMLElement).click()
    })
    await page.waitForTimeout(800)
    const cont = async (step: number) => {
      await clickButtonByText(page, 'Continue')
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
    if (wants('wizard-instrument')) {
      await shoot(page, 'application', 'wizard-instrument', theme, 'picked the LC-500 family and a model in scope: the instrument step the R 60 model derives (the model-authored declaration form)')
    }
    if (wants('wizard-stepper-jump')) {
      await page.evaluate(() => {
        (document.querySelector('[data-testid="wizard-step-nav-1"]') as HTMLElement | null)?.click()
      })
      await page.waitForSelector('[data-testid="wizard-step-1"]', { timeout: SETTLE })
      await page.waitForTimeout(900)
      await shoot(page, 'application', 'wizard-stepper-jump', theme, 'jumped the stepper back to a reached step: the steps are individually navigable, the validation posture honest per step')
      await page.evaluate(() => {
        (document.querySelector('[data-testid="wizard-step-nav-3"]') as HTMLElement | null)?.click()
      })
      await page.waitForSelector('[data-testid="wizard-step-3"]', { timeout: SETTLE })
      await page.waitForTimeout(900)
    }
    await cont(4)
    await page.type('[data-testid="wizard-sample-serial"]', `SN-WALK-${DATE.replace(/-/g, '')}-${theme}`)
    await cont(5)
    await cont(6)
    await page.waitForSelector('[data-testid^="wizard-ia-"]', { timeout: SETTLE })
    if (wants('wizard-scheme-ia')) {
      await shoot(page, 'application', 'wizard-scheme-ia', theme, 'chose the scheme and the Issuing Authority from the cards (logo or honest monogram, the scope summary, the per-Recommendation filter)', { fullPage: true })
    }
    // The draft posture: leave the wizard unsubmitted, return to it, and
    // the resume banner offers the stored draft (the wizard-draft store
    // keeps the fill per user+Recommendation; the resume round-trips).
    if (wants('portal-draft')) {
      await gotoApp(page, '/app/portal/')
      await waitText(page, 'My applications')
      await gotoApp(page, '/app/portal/applications/new')
      await waitTestId(page, 'portal-wizard')
      const hasBanner = await page.waitForSelector('[data-testid="wizard-resume-banner"]', { timeout: 20_000 })
        .then(() => true).catch(() => false)
      if (hasBanner) {
        await shoot(page, 'application', 'portal-draft', theme, 'left the wizard unsubmitted and returned: the resume banner offers the stored draft (leave and return, the fill round-trips)')
        // Decline the resume so the run never carries state into a later leg.
        await page.evaluate(() => {
          const dismiss = Array.from(document.querySelectorAll('[data-testid="wizard-resume-banner"] button'))
            .find(b => !/resume/i.test(b.textContent ?? ''))
          ;(dismiss as HTMLElement | undefined)?.click()
        })
      } else {
        console.log('  · portal-draft: no resume banner — the act is not performable today, not captured')
      }
    }
    await context.close()
  }
}

async function captureApplicantJourney(browser: Browser) {
  if (!['notifications', 'application-journey', 'certificate-view', 'verify-number'].some(wants)) return
  for (const theme of THEMES) {
    currentTheme = theme
    const context = await themedContext(browser, theme)
    const page = await context.newPage()
    await loginAs(context, page, 'Applicant', '/app/portal')
    if (wants('notifications')) {
      await gotoApp(page, '/app/portal/')
      await waitText(page, 'My applications')
      await clickTestId(page, 'notification-bell')
      await waitText(page, 'Notifications')
      await page.waitForTimeout(800)
      await shoot(page, 'applicant-journey', 'notifications', theme, 'opened the notifications inbox: the stage events of the applicant\'s own applications, each with its reason')
    }
    if (wants('application-journey')) {
      await gotoApp(page, '/app/portal/applications/app-acme-lc')
      await waitTestId(page, 'portal-application-detail')
      await waitText(page, 'Promise set')
      await waitSkeletonGone(page)
      await shoot(page, 'applicant-journey', 'application-journey', theme, 'opened the worked-example application: the six-stage journey and the promise set with the per-claim verification status, never leaking the in-flight stores', { fullPage: true })
    }
    if (wants('certificate-view')) {
      await gotoApp(page, '/app/portal/certificates/crt-acme-lc')
      await page.waitForFunction(
        () => document.body.innerText.includes('OIML CERTIFICATE NO.'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'applicant-journey', 'certificate-view', theme, 'opened the issued certificate R60/2021-A-EX1-26.01: the full OIML document with its serials, the dates, the ACTIVE state, and the downloads', { fullPage: true })
    }
    await context.close()
    // The verify page needs no account; capture it in a fresh context.
    if (wants('verify-number')) {
      const pub = await themedContext(browser, theme)
      const p2 = await pub.newPage()
      await gotoApp(p2, '/app/verify/')
      await p2.waitForSelector('[data-testid="verify-number"]', { timeout: SETTLE })
      await p2.fill('[data-testid="verify-number"]', 'R60/2021-A-EX1-26.01')
      await p2.click('[data-testid="verify-submit"]')
      await p2.waitForFunction(
        () => document.body.innerText.includes('ACTIVE') && document.body.innerText.includes('BIML registration'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(p2, 'applicant-journey', 'verify-number', theme, 'verified the certificate by number against the public register, no account: ACTIVE, the BIML registration record, the revocation and suspension checks', { fullPage: true })
      await pub.close()
    }
  }
}

async function captureEvaluation(browser: Browser) {
  if (!['tr-review', 'review-period', 'examinations', 'er-synopsis', 'issuance-form', 'tep-test-reports', 'certificate-card', 'biml-inbox', 'public-register'].some(wants)) return
  for (const theme of THEMES) {
    currentTheme = theme

    if (['tr-review', 'review-period', 'examinations', 'er-synopsis', 'issuance-form', 'tep-test-reports', 'certificate-card'].some(wants)) {
      const context = await themedContext(browser, theme)
      const page = await context.newPage()
      await loginAs(context, page, 'Issuing Authority', '/app/ia')

      if (wants('tr-review') || wants('review-period') || wants('examinations') || wants('er-synopsis')) {
        // The seeded worked example's surfaces link from the project's
        // hub (the IA console has no TR/evaluation list routes; the hub
        // is the one record they hang from).
        await gotoApp(page, '/app/ia/projects/app-acme-lc')
        await waitTestId(page, 'ia-project-hub')
        await waitText(page, 'Application record')
        await waitSkeletonGone(page)
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href') ?? ''))
        const trHref = links.find(h => /\/app\/ia\/test-reports\/.+/.test(h)) ?? null
        const erHref = links.find(h => /\/app\/ia\/evaluations\/.+/.test(h)) ?? null

        if ((wants('tr-review') || wants('review-period')) && trHref) {
          await gotoApp(page, trHref)
          await waitIslandSettled(page)
          await waitSkeletonGone(page)
          await page.waitForTimeout(1000)
          if (wants('tr-review')) {
            await shoot(page, 'ia-evaluation', 'tr-review', theme, 'opened the worked example\'s test report as the IA: the sections with their provenance, the per-section review acts, the verdicts the model computed', { fullPage: true })
          }
          if (wants('review-period')) {
            const hasConsultation = await page.evaluate(() =>
              /review period|consultation|comment/i.test(document.body.innerText))
            if (hasConsultation) {
              await shoot(page, 'ia-evaluation', 'review-period', theme, 'the review period on the report: the participants\' comment round, the threads that resolve before the decision', { fullPage: true })
            } else {
              console.log('  · review-period: no consultation surface on the seeded TR — not captured (the page will carry the live link)')
            }
          }
        } else if (wants('tr-review') || wants('review-period')) {
          console.log('  · tr-review: the seeded project links no TR — not captured')
        }

        if ((wants('examinations') || wants('er-synopsis')) && erHref) {
          await gotoApp(page, erHref)
          await waitIslandSettled(page)
          await waitSkeletonGone(page)
          await page.waitForTimeout(1000)
          if (wants('examinations')) {
            await shoot(page, 'ia-evaluation', 'examinations', theme, 'the evaluation workspace: the IA examinations with the pre-filled authority information (the binding machinery never asks twice)', { fullPage: true })
          }
          if (wants('er-synopsis')) {
            const hasSynopsis = await page.evaluate(() => !!document.querySelector('[data-testid="ia-er-synopsis"]') || /synopsis/i.test(document.body.innerText))
            if (hasSynopsis) {
              await page.evaluate(() => {
                (document.querySelector('[data-testid="ia-er-synopsis"]') as HTMLElement | null)?.scrollIntoView()
              })
              await page.waitForTimeout(600)
              await shoot(page, 'ia-evaluation', 'er-synopsis', theme, 'the synopsis composed from the IA\'s verdicts and the accepted report: the suggested verdict computed, never hand-tallied', { fullPage: true })
            } else {
              console.log('  · er-synopsis: no synopsis surface on the seeded evaluation — not captured')
            }
          }
        } else if (wants('examinations') || wants('er-synopsis')) {
          console.log('  · examinations: the seeded project links no evaluation — not captured')
        }
      }

      if (wants('issuance-form')) {
        await gotoApp(page, '/app/ia/certificates')
        await page.waitForFunction(
          () => document.body.innerText.includes('Issue from evaluation'),
          undefined,
          { timeout: SETTLE, polling: 500 },
        )
        await waitSkeletonGone(page)
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
          await shoot(page, 'ia-evaluation', 'issuance-form', theme, 'opened the issuance form on the finalized evaluation: the certified scope from the verdicts, the scheme, the signing act, reviewed before the signature (not signed: the register story stays the seeded one)', { fullPage: true })
        } else {
          console.log('  · issuance-form: no evaluation pickable — not captured')
        }
      }

      if (wants('certificate-card') || wants('tep-test-reports')) {
        await gotoApp(page, '/app/ia/projects/app-acme-lc')
        await waitTestId(page, 'ia-project-hub')
        await waitText(page, 'Application record')
        await waitSkeletonGone(page)
        if (wants('tep-test-reports')) {
          const hasReports = await page.evaluate(() => !!document.querySelector('[data-testid="tep-test-reports"]'))
          if (hasReports) {
            await page.evaluate(() => {
              (document.querySelector('[data-testid="tep-test-reports"]') as HTMLElement | null)?.scrollIntoView({ block: 'center' })
            })
            await page.waitForTimeout(600)
            await shoot(page, 'ia-evaluation', 'tep-test-reports', theme, 'the project\'s test reports card: the laboratory\'s submitted reports landed on the shared record, the IA notified')
          } else {
            console.log('  · tep-test-reports: no reports card on the seeded project — not captured')
          }
        }
        if (wants('certificate-card')) {
          const hasCert = await page.evaluate(() => !!document.querySelector('[data-testid="tep-card-certificate"]'))
          if (hasCert) {
            await page.evaluate(() => {
              (document.querySelector('[data-testid="tep-card-certificate"]') as HTMLElement | null)?.scrollIntoView({ block: 'center' })
            })
            await page.waitForTimeout(600)
            await shoot(page, 'ia-evaluation', 'certificate-card', theme, 'the project\'s certificate card: the issued certificate with its BIML registration record, the registration act\'s state on the hub')
          } else {
            console.log('  · certificate-card: no certificate card on the seeded project — not captured')
          }
        }
      }
      await context.close()
    }

    if (wants('biml-inbox')) {
      const context = await themedContext(browser, theme)
      const page = await context.newPage()
      await loginAs(context, page, 'BIML Officer', '/app/biml')
      await waitText(page, 'Registration inbox')
      await waitSkeletonGone(page)
      await shoot(page, 'ia-evaluation', 'biml-inbox', theme, 'the BIML console: the registration inbox and the recently registered worked-example certificate (the register act as a first-class act)', { fullPage: true })
      await context.close()
    }

    if (wants('public-register')) {
      const context = await themedContext(browser, theme)
      const page = await context.newPage()
      await gotoApp(page, '/app/register/')
      await page.waitForFunction(
        () => document.body.innerText.includes('Certificate Register') && document.body.innerText.includes('R60/2021-A-EX1-26.01'),
        undefined,
        { timeout: SETTLE, polling: 500 },
      )
      await shoot(page, 'ia-evaluation', 'public-register', theme, 'the public Certificate Register, no sign-in: the ACTIVE worked-example row anyone can read (market surveillance, buyers)', { fullPage: true })
      await context.close()
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────

// --rebuild-manifest: re-register every capture on disk. The drive's
// phases write their shots before the run can crash out (an uncaught
// timeout never reaches the merge below), so a rebuild after an
// interrupted drive re-registers the orphans with their file mtimes;
// entries with a live record keep their performed text.
const REBUILD_MANIFEST = process.argv.includes('--rebuild-manifest')

if (REBUILD_MANIFEST) {
  const { readdirSync, statSync } = await import('node:fs')
  const manifestPath = join(OUT, 'manifest.json')
  let prior: CaptureRecord[] = []
  try {
    prior = (JSON.parse(readFileSync(manifestPath, 'utf8')).captures ?? []) as CaptureRecord[]
  } catch { /* first run */ }
  const byFile = new Map<string, CaptureRecord>()
  for (const r of prior) byFile.set(r.file, r)
  for (const flow of readdirSync(OUT, { withFileTypes: true })) {
    if (!flow.isDirectory()) continue
    for (const file of readdirSync(join(OUT, flow.name))) {
      if (!file.endsWith('.png')) continue
      const rel = `${flow.name}/${file}`
      if (byFile.has(rel)) continue
      const stem = file.replace(/-(light|dark)\.png$/, '')
      const theme = file.endsWith('-dark.png') ? 'dark' : 'light'
      byFile.set(rel, {
        flow: flow.name,
        name: stem,
        file: rel,
        url: '(re-registered after an interrupted run)',
        theme,
        performed: 'performed against the live demo (the manifest entry re-registered after an interrupted run)',
        capturedAt: statSync(join(OUT, rel)).mtime.toISOString(),
      })
    }
  }
  const live = [...byFile.values()].filter(r => existsSync(join(OUT, r.file)))
  writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), date: DATE, captures: live }, null, 2) + '\n')
  console.log(`manifest rebuilt: ${live.length} captures on disk → public/img/walkthroughs/manifest.json`)
  process.exit(0)
}

const browser = await chromium.launch()
try {
  if (DRIVE || FRESH_INTAKE) {
    currentTheme = 'light'
    await driveChain(browser)
  }
  await captureLoginAndGuided(browser)
  await captureWizard(browser)
  await captureApplicantJourney(browser)
  await captureEvaluation(browser)
} finally {
  await browser.close()
}

// Merge into the existing manifest (the drive and the read-only passes
// run as separate invocations; the manifest is the union, keyed by file),
// then prune entries whose file no longer exists.
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
console.log(`\n${records.length} captures this run, ${live.length} live in the manifest → public/img/walkthroughs/`)
