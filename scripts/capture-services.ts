#!/usr/bin/env tsx
/**
 * capture-services.ts — the service-page evidence apparatus
 * (TODO.promotion/10). Every screenshot the /services/ pages publish is
 * captured here, never hand-snapped: the script drives the LIVE services
 * headlessly, PERFORMS the act the page claims (the sign-in, the search,
 * the lens switch, the ask), ASSERTS the surface carries what the page
 * says it carries, and only then captures. An act that fails its
 * assertion fails the run — the published capability inventory can never
 * outlive the live service it describes.
 *
 *   npx tsx scripts/capture-services.ts                 # everything
 *   npx tsx scripts/capture-services.ts --only=demo,ai  # a subset
 *   npx tsx scripts/capture-services.ts --date=2026-08-29
 *
 * Outputs land in public/img/services/<service>/<shot>.<light|dark>.png
 * plus public/img/services/manifest.json (the dated audit record; 08's
 * freshness gate re-runs this script). Dark and light are real captures:
 * the estate honors prefers-color-scheme, so each shot runs in both
 * emulated schemes.
 *
 * Frugality: the AI service's anonymous tier is rate-limited per day, so
 * the two asks below (the cited answer, the off-corpus refusal) are the
 * only LLM calls in the run.
 */
import { chromium, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const OUT = join(ROOT, 'public/img/services')
const TODAY = new Date().toISOString().slice(0, 10)
const DATE = process.argv.find((a) => a.startsWith('--date='))?.slice(7) ?? TODAY
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')

const MODES = ['light', 'dark'] as const
type Mode = (typeof MODES)[number]

const VIEWPORT = { width: 1440, height: 900 }

interface Shot {
  /** File stem: public/img/services/<service>/<id>.<mode>.png */
  id: string
  service: string
  /** What the page claims this shot proves. */
  caption: string
  /** The performed act: navigate, click, sign in, ask. */
  act: (page: Page) => Promise<void>
  /** The audit: strings the surface must carry after the act. */
  expect: string[]
  /** Optional extra assertion (element presence etc.). */
  check?: (page: Page) => Promise<void>
  /** Settle time after the act before the assertion + capture. */
  settleMs?: number
}

// ── Shared acts ──────────────────────────────────────────────────────

async function demoSignIn(page: Page, account: RegExp | string, landOn: string) {
  await page.goto('https://demo.oimlsmart.org/app/login', { waitUntil: 'networkidle', timeout: 60000 })
  await page.locator('button', { hasText: account }).first().click()
  await page.waitForURL((u) => !u.pathname.startsWith('/app/login'), { timeout: 45000 })
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {})
  if (!page.url().includes(landOn)) throw new Error(`demo sign-in (${String(account)}) landed at ${page.url()}, expected ${landOn}`)
  await page.waitForTimeout(1500)
}

async function bodyText(page: Page): Promise<string> {
  return page.evaluate(() => document.body?.innerText ?? '')
}

/** Poll the rendered body text until it carries the marker (or the deadline
 *  passes). Used for the streaming AI answers, where the marker element's
 *  exact-text selector does not match (the heading carries extra nodes). */
async function waitForBodyText(page: Page, marker: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if ((await bodyText(page)).includes(marker)) return
    await page.waitForTimeout(2000)
  }
  throw new Error(`body never carried ${JSON.stringify(marker)} within ${timeoutMs}ms`)
}

// ── The shot inventory ───────────────────────────────────────────────

const SHOTS: Shot[] = [
  // ── The demo instance ────────────────────────────────────────────
  {
    id: 'demo-login-accounts',
    service: 'demo',
    caption: 'The demo login page: the one-click demo accounts, the shared demo password, and the guided-demo entry.',
    act: async (page) => {
      await page.goto('https://demo.oimlsmart.org/app/login', { waitUntil: 'networkidle', timeout: 60000 })
    },
    expect: ['demo accounts', 'Applicant', 'Issuing Authority', 'Test Laboratory', 'BIML Officer', 'Demo password:'],
    settleMs: 1500,
  },
  {
    id: 'demo-portal-applicant',
    service: 'demo',
    caption: 'The applicant portal after the one-click sign-in: ACME\'s five applications and three certificates.',
    act: (page) => demoSignIn(page, 'Applicant', '/app/portal'),
    expect: ['ACME Measurement GmbH', 'My applications', 'My certificates', 'R60/2021-A-EX1-26.01'],
  },
  {
    id: 'demo-application-detail',
    service: 'demo',
    caption: 'One application opened: XX-ACME-2026-0001, ACCEPTED, with the link into the evaluation project.',
    act: async (page) => {
      await demoSignIn(page, 'Applicant', '/app/portal')
      await page.locator('text=XX-ACME-2026-0001').first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['XX-ACME-2026-0001', 'ACCEPTED', 'LC-500i'],
  },
  {
    id: 'demo-certificate',
    service: 'demo',
    caption: 'The worked-example certificate R60/2021-A-EX1-26.01: ACTIVE, the full document with its classification table, revision history, and the public-register verify pointer.',
    act: async (page) => {
      await demoSignIn(page, 'Applicant', '/app/portal')
      await page.locator('text=R60/2021-A-EX1-26.01').first().click()
      // The document renders after the record settles; wait for its tail.
      await page.locator('text=OIML CERTIFICATE HISTORY').first().waitFor({ timeout: 30000 })
    },
    expect: ['R60/2021-A-EX1-26.01', 'ACTIVE', 'Print certificate', 'OIML CERTIFICATE HISTORY'],
  },
  {
    id: 'demo-verify',
    service: 'demo',
    caption: 'The public verification path: the certificate number checked against the public BIML register (B 18:2025 §15.8), no sign-in, with the W3C Status List revocation and suspension checks.',
    act: async (page) => {
      await page.goto('https://demo.oimlsmart.org/app/verify?number=R60%2F2021-A-EX1-26.01', { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('text=NOT REVOKED').first().waitFor({ timeout: 30000 })
    },
    expect: ['Verify an OIML certificate', 'ACTIVE', 'BIML registration', 'NOT REVOKED', 'NOT SUSPENDED'],
  },
  {
    id: 'demo-ia-console',
    service: 'demo',
    caption: 'The Issuing Authority console: the review queue, the twelve type-evaluation projects, the dispatch and issuance work.',
    act: (page) => demoSignIn(page, 'Issuing Authority', '/app/ia'),
    expect: ['Review queue', 'Type evaluation projects', 'Ready to issue'],
  },
  {
    id: 'demo-tl-workbench',
    service: 'demo',
    caption: 'The Test Laboratory workbench: the dispatch inbox and the ANR test-capability declaration.',
    act: (page) => demoSignIn(page, 'Test Laboratory', '/app/lab'),
    expect: ['Inbox', 'ANR test capability', 'OIML R 60'],
  },
  {
    id: 'demo-biml-console',
    service: 'demo',
    caption: 'The BIML console: the registration inbox and the recently registered worked-example certificate.',
    act: (page) => demoSignIn(page, 'BIML Officer', '/app/biml'),
    expect: ['Registration inbox', 'R60/2021-A-EX1-26.01', 'ACTIVE'],
  },
  {
    id: 'demo-guided-demo',
    service: 'demo',
    caption: 'The guided demo\'s presenter script: the full certification flow, step 1 of 24, from the login page.',
    act: async (page) => {
      await page.goto('https://demo.oimlsmart.org/app/login', { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('button', { hasText: 'Start the guided demo' }).first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['Guided demo', 'Step 1 of 24', 'Submit the application'],
  },

  // ── The identity service ─────────────────────────────────────────
  {
    id: 'id-sign-in',
    service: 'identity',
    caption: 'The estate sign-in: GitHub, Google, passkey, or password, and the Request an account link.',
    act: async (page) => {
      await page.goto('https://id.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
    },
    expect: ['Sign in with GitHub', 'Sign in with Google', 'passkey', 'Request an account'],
    settleMs: 1500,
  },
  {
    id: 'id-join-flow',
    service: 'identity',
    caption: 'The join flow: full name, work email, and the organization selector fed by the live OIML-CS participants register, labeled by kind.',
    act: async (page) => {
      await page.goto('https://id.oimlsmart.org/op/join', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(1500)
      // Open the organization selector so the register shows.
      await page.locator('text=Organization').first().click().catch(() => {})
      await page.waitForTimeout(1500)
    },
    expect: ['Request an account', 'Full name', 'Work email', 'Member State', 'Corresponding Member'],
  },
  {
    id: 'id-discovery',
    service: 'identity',
    caption: 'The OpenID discovery document every relying party in the estate resolves sign-in through.',
    act: async (page) => {
      await page.goto('https://id.oimlsmart.org/.well-known/openid-configuration', { timeout: 60000 })
    },
    expect: ['issuer', 'authorization_endpoint', 'token_endpoint'],
    settleMs: 1000,
  },

  // ── The status service ───────────────────────────────────────────
  {
    id: 'status-overview',
    service: 'status',
    caption: 'All twelve probe rows operational: identity, the platform instances, the AI service, and the public surfaces, each with its measured uptime and p95.',
    act: async (page) => {
      await page.goto('https://status.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
    },
    expect: ['All systems operational', 'Operational', '30-day uptime', '90-day uptime'],
    settleMs: 1500,
  },
  {
    id: 'status-objectives',
    service: 'status',
    caption: 'Objectives vs reality: the declared availability and latency objectives next to the measured numbers, never rounded up.',
    act: async (page) => {
      await page.goto('https://status.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('text=Objectives vs reality').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
    },
    expect: ['Objectives vs reality', 'Declared availability', 'meeting'],
  },
  {
    id: 'status-incidents',
    service: 'status',
    caption: 'The incident record: human-written, after the fact. When nothing has broken, it says so.',
    act: async (page) => {
      await page.goto('https://status.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('text=Incidents').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(1000)
    },
    expect: ['Incidents', 'No incidents on record'],
  },

  // ── The AI service ───────────────────────────────────────────────
  {
    id: 'ai-ask-cited-answer',
    service: 'ai',
    caption: 'A real question, answered with clause-level citations: the class C load-cell MPE, with the SOURCES panel naming publication, edition, and clause.',
    act: async (page) => {
      await page.goto('https://ai.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(1500)
      await page.locator('textarea').first().fill('What is the maximum permissible error for a class C load cell?')
      await page.locator('button:text-is("Ask")').first().click()
      // The answer streams; wait for the SOURCES panel. A long answer takes
      // a while; the marker is checked on the rendered body text.
      await waitForBodyText(page, 'SOURCES', 180000)
      await page.waitForTimeout(4000)
    },
    expect: ['SOURCES', 'OIML R 60', 'load cell'],
    settleMs: 2000,
  },
  {
    id: 'ai-refusal',
    service: 'ai',
    caption: 'The off-corpus posture: a question the OIML library cannot answer gets a plain refusal, not an invention.',
    act: async (page) => {
      await page.goto('https://ai.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(1500)
      await page.locator('textarea').first().fill('What is the weather in Paris tomorrow?')
      await page.locator('button:text-is("Ask")').first().click()
      await waitForBodyText(page, "don't have information", 180000)
      await page.waitForTimeout(2000)
    },
    expect: ["don't have information", 'indexed OIML publications'],
    settleMs: 1500,
  },
  {
    id: 'ai-how-it-works',
    service: 'ai',
    caption: 'The service\'s own honest account: what happens between your question and the answer, including what it does not do.',
    act: async (page) => {
      await page.goto('https://ai.oimlsmart.org/how-it-works/', { waitUntil: 'networkidle', timeout: 60000 })
    },
    expect: ['How it works', 'close to 900', 'citation'],
    settleMs: 1500,
  },
  {
    id: 'ai-api',
    service: 'ai',
    caption: 'The API reference: anonymous and member tiers with their daily question allowances, SSE streaming or complete JSON.',
    act: async (page) => {
      await page.goto('https://ai.oimlsmart.org/api/', { waitUntil: 'networkidle', timeout: 60000 })
    },
    expect: ['API Reference', 'POST /api/ask', '20 questions/day'],
    settleMs: 1500,
  },

  // ── The Studio viewer ────────────────────────────────────────────
  {
    id: 'studio-tree',
    service: 'studio-viewer',
    caption: 'The model tree of OIML R 60 as data: 13 roles, 31 processes, with the read-only and computed-valid markers.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/studio/view/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
    },
    expect: ['read only', 'valid', 'PROCESSES', 'submit_application'],
  },
  {
    id: 'studio-code',
    service: 'studio-viewer',
    caption: 'The code view: the same model as Primmel source — package, kind, editions, base URN, the modules it composes.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/studio/view/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      await page.locator('button', { hasText: 'Code' }).first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['model.prl', 'package', 'oiml-r60'],
  },
  {
    id: 'studio-mapping',
    service: 'studio-viewer',
    caption: 'The mapping lens, honest about the current model: no mapping profiles declared yet.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/studio/view/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      await page.locator('button', { hasText: 'Mapping' }).first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['no mapping profiles', 'map_profile'],
  },
  {
    id: 'studio-diff',
    service: 'studio-viewer',
    caption: 'The diff lens: load a second version and the kernel\'s model-diff computes added, removed, changed, and moved per element.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/studio/view/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      await page.locator('button', { hasText: 'Diff' }).first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['load a version to compare', 'model-diff'],
  },
  {
    id: 'studio-certificate-preview',
    service: 'studio-viewer',
    caption: 'The certificate preview: the instrument certificate rendered from the model itself.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/studio/view/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      await page.locator('button', { hasText: 'Certificate preview' }).first().click()
      await page.waitForTimeout(2500)
    },
    expect: ['INSTRUMENT CERTIFICATE', 'PREVIEW'],
  },

  // ── The vocabulary service ───────────────────────────────────────
  {
    id: 'vocab-home',
    service: 'vocab',
    caption: 'The eleven datasets: the VIML and VIM edition series with the current editions marked, and the curated Complete Vocabulary.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/vocab/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3500)
    },
    expect: ['11 datasets', 'VIML', 'VIM', 'Complete Vocabulary', '7,451'],
  },
  {
    id: 'vocab-search',
    service: 'vocab',
    caption: 'Search across every edition at once: "calibration" hits grouped per dataset, each with its concept number.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/vocab/search', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      const box = page.locator('input').first()
      await box.fill('calibration')
      await box.press('Enter')
      await page.waitForTimeout(4000)
    },
    expect: ['calibration hierarchy', 'OIML V 2-200:2012', 'COMPLETE VOCABULARY'],
  },
  {
    id: 'vocab-concept',
    service: 'vocab',
    caption: 'One concept, one URL: calibration hierarchy (VIM 2.40) with its definition, relations, edition series, languages, and canonical URI.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/vocab/search', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      const box = page.locator('input').first()
      await box.fill('calibration')
      await box.press('Enter')
      await page.waitForTimeout(4000)
      await page.locator('text=calibration hierarchy').first().click()
      await page.waitForTimeout(3500)
    },
    expect: ['calibration hierarchy', 'LANGUAGES', 'URI', 'current edition'],
  },
  {
    id: 'vocab-graph',
    service: 'vocab',
    caption: 'The graph view: the term relations drawn as a navigable graph.',
    act: async (page) => {
      await page.goto('https://www.oimlsmart.org/vocab/graph', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(5000)
    },
    expect: [],
    check: async (page) => {
      if ((await page.locator('svg, canvas').count()) === 0) throw new Error('vocab graph rendered no svg/canvas')
    },
  },

  // ── The platform ─────────────────────────────────────────────────
  {
    id: 'platform-hub',
    service: 'platform',
    caption: 'The production hub: the published SMART Recommendations with their requirement, test, and form counts.',
    act: async (page) => {
      await page.goto('https://platform.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
    },
    expect: ['OIML SMART', 'R 60', 'R 144'],
  },
  {
    id: 'platform-nmi-instance',
    service: 'platform',
    caption: 'The IA+TL pilot instance at nmi.oimlsmart.org: the same software, booted under the member-state deployment profile.',
    act: async (page) => {
      await page.goto('https://nmi.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
    },
    expect: ['OIML SMART', 'Recommendations'],
  },
  {
    id: 'platform-tl-instance',
    service: 'platform',
    caption: 'The TL-only pilot instance at tl.oimlsmart.org: the laboratory posture of the same codebase.',
    act: async (page) => {
      await page.goto('https://tl.oimlsmart.org/', { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
    },
    expect: ['OIML SMART', 'Recommendations'],
  },
]

// ── The runner ───────────────────────────────────────────────────────

const selected = SHOTS.filter((s) => !ONLY || ONLY.includes(s.service) || ONLY.includes(s.id))
if (selected.length === 0) {
  console.error(`no shots selected (known services: ${[...new Set(SHOTS.map((s) => s.service))].join(', ')})`)
  process.exit(1)
}

console.log(`capture-services: ${selected.length} shot(s) × ${MODES.length} modes, capture date ${DATE}`)

const browser = await chromium.launch()
// Partial runs (--only) merge into the existing manifest instead of
// truncating it: the manifest is the dated audit record for ALL shots.
interface ManifestEntry { service: string; id: string; caption: string; modes: string[]; asserted: string[] }
const manifestPath = join(OUT, 'manifest.json')
const prior: ManifestEntry[] = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, 'utf8')).shots as ManifestEntry[])
  : []
const manifest = { capturedAt: DATE, shots: [] as ManifestEntry[] }
let failures = 0

for (const shot of selected) {
  const passedModes: string[] = []
  for (const mode of MODES) {
    const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, colorScheme: mode })
    const page = await ctx.newPage()
    const dest = join(OUT, shot.service)
    mkdirSync(dest, { recursive: true })
    const file = join(dest, `${shot.id}.${mode}.png`)
    try {
      await shot.act(page)
      if (shot.settleMs) await page.waitForTimeout(shot.settleMs)
      const text = await bodyText(page)
      const missing = shot.expect.filter((e) => !text.includes(e))
      if (missing.length > 0) throw new Error(`assertion(s) missing: ${JSON.stringify(missing)}`)
      if (shot.check) await shot.check(page)
      await page.screenshot({ path: file })
      passedModes.push(mode)
      console.log(`PASS ${shot.id} [${mode}] → ${file.replace(ROOT + '/', '')}`)
    } catch (err) {
      failures++
      console.error(`FAIL ${shot.id} [${mode}]: ${(err as Error).message?.slice(0, 300)}`)
      console.error(`  the act could not be performed — do NOT list it on the page until the service is fixed`)
    } finally {
      await ctx.close()
    }
  }
  // The manifest records only what was actually captured: a shot whose
  // act failed in one mode is not evidence.
  if (passedModes.length > 0) {
    manifest.shots.push({ service: shot.service, id: shot.id, caption: shot.caption, modes: passedModes, asserted: shot.expect })
  }
}

await browser.close()
// Merge: freshly captured shots replace their prior entries; shots not
// selected in this run carry over untouched.
const freshIds = new Set(manifest.shots.map((s) => s.id))
const merged = [...manifest.shots, ...prior.filter((p) => !freshIds.has(p.id))]
writeFileSync(manifestPath, JSON.stringify({ capturedAt: DATE, shots: merged }, null, 2) + '\n')
console.log(`manifest: ${merged.length} shots (${manifest.shots.length} refreshed), capture date ${DATE}`)

if (failures > 0) {
  console.error(`${failures} shot(s) failed their act or assertion`)
  process.exit(1)
}
console.log('capture-services: all acts performed, all assertions held')
