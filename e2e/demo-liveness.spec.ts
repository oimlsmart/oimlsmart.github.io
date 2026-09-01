// ─────────────────────────────────────────────────────────────────────
// demo-liveness.spec.ts — the demo-link liveness smoke
// (TODO.promotion/08). The walkthrough and tour pages deep-link the
// live demo; the demo reseeds nightly; this leg is the guarantee the
// tour never silently breaks on that reset. Declared cadence: NIGHTLY
// (.github/workflows/freshness.yml), never the per-push path — the
// per-push suite stays hermetic, and this spec lives behind its own
// config (playwright.demo.config.ts) so `npm run test:e2e` never picks
// it up.
//
//   DEMO_BASE=https://demo.oimlsmart.org npx playwright test -c playwright.demo.config.ts
//
// Three legs:
//   1. the public surfaces render anonymously (the landing, the login
//      grid, the register, the verify page — the pages' "no account"
//      claims, exercised as claimed);
//   2. every deep link the walkthroughs and the tour publish answers
//      200 at the HTTP layer (the demo 404s unknown /app routes — a
//      moved route is a broken tour, caught here);
//   3. the cheap signed-in smokes: the Applicant console boots, and the
//      model-content allowlist's `live` pins are asserted on their
//      surfaces (today: the R 60 requirements page carrying the counts
//      the pages quote).
// ─────────────────────────────────────────────────────────────────────

import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { join } from 'node:path'
import { PROOF_MAP } from '../src/data/proof-map'
import { MODEL_CONTENT_ALLOWLIST } from '../src/data/model-content-allowlist'
import { REPO, demoLinks } from '../scripts/promotion-lib'

const DEMO = (process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org').replace(/\/$/, '')

// The demo's first island paint after a cold sign-in measured ~115s
// (scripts/capture-audiences.ts, 2026-08-30): the signed-in legs get
// room; the anonymous legs stay quick.
test.setTimeout(300_000)

async function signOut(context: BrowserContext) {
  await context.request.post(`${DEMO}/api/auth/signout`).catch(() => {})
}

/** The one-click demo-account sign-in (the login page's public grid —
 *  no credentials, the same pattern the capture apparatus uses). */
async function loginAs(context: BrowserContext, page: Page, name: string) {
  await signOut(context)
  await page.goto(`${DEMO}/app/login`, { waitUntil: 'commit' })
  const offered = page.locator(`button:has(span:text-is("${name}"))`)
  await expect(offered.first(), `the login grid offers the "${name}" demo account`).toBeVisible({ timeout: 240_000 })
  await offered.first().click()
  await page.waitForFunction(() => !window.location.pathname.startsWith('/app/login'), undefined, {
    timeout: 240_000,
    polling: 500,
  })
}

test.describe('the demo-link liveness smoke (TODO.promotion/08)', () => {
  test('the public surfaces render anonymously', async ({ page }) => {
    await page.goto(`${DEMO}/`)
    await expect(page.getByText('Demonstration environment').first()).toBeVisible()

    await page.goto(`${DEMO}/app/login`)
    await expect(page.getByText('Sign in to OIML SMART').first()).toBeVisible({ timeout: 120_000 })
    // The one-click demo cast the walkthroughs name.
    for (const account of ['Applicant', 'Issuing Authority', 'Test Laboratory']) {
      await expect(
        page.locator(`button:has(span:text-is("${account}"))`).first(),
        `the login grid offers "${account}"`,
      ).toBeVisible({ timeout: 120_000 })
    }

    // The public faces the walkthroughs claim need no sign-in.
    await page.goto(`${DEMO}/app/register/`)
    await expect(page.getByText('Certificate Register').first()).toBeVisible({ timeout: 120_000 })
    await page.goto(`${DEMO}/app/verify/`)
    await expect(page.getByText('Verify an OIML certificate').first()).toBeVisible({ timeout: 120_000 })
  })

  test('every deep link the walkthroughs and the tour publish answers', async ({ request }) => {
    const sources = PROOF_MAP.filter((p) => p.route.startsWith('/demo') || p.route.startsWith('/tour')).map((p) => ({
      from: p.source,
      abs: join(REPO, p.source),
    }))
    const links = demoLinks(sources)
    expect(links.length, 'the demo-link inventory is non-empty').toBeGreaterThan(10)
    const failures: string[] = []
    for (const { from, url } of links) {
      const res = await request.get(url, { timeout: 30_000 }).catch(() => null)
      // The demo 404s unknown /app routes and 200s the real ones (gated
      // consoles answer 200 and bounce the anonymous client to the
      // login page) — so the HTTP status alone separates alive from
      // broken.
      if (!res || res.status() !== 200) {
        failures.push(`${from} → ${url} answered ${res ? res.status() : 'no response'}`)
      }
    }
    expect(failures, 'broken demo deep links').toEqual([])
  })

  test('the Applicant console boots (the cheap signed-in smoke)', async ({ context, page }) => {
    await loginAs(context, page, 'Applicant')
    expect(page.url()).toContain('/app/portal')
    await expect(page.getByText(/[Aa]pplication/).first()).toBeVisible({ timeout: 240_000 })
  })

  test('the model-content live pins hold on their surfaces', async ({ context, page }) => {
    const pins = MODEL_CONTENT_ALLOWLIST.flatMap((e) => e.verify)
      .filter((v) => v.kind === 'live')
      .map((v) => (v.kind === 'live' ? v : null))
      .filter((v): v is { kind: 'live'; url: string; account: string; probe: string } => v !== null)
    expect(pins.length, 'the allowlist carries live pins').toBeGreaterThan(0)
    const byAccount = new Map<string, typeof pins>()
    for (const pin of pins) {
      const list = byAccount.get(pin.account) ?? []
      list.push(pin)
      byAccount.set(pin.account, list)
    }
    for (const [account, accountPins] of byAccount) {
      await loginAs(context, page, account)
      for (const pin of accountPins) {
        await page.goto(pin.url, { waitUntil: 'commit' })
        await expect(
          page.getByText(pin.probe).first(),
          `${pin.url} (as ${account}) shows ${JSON.stringify(pin.probe)}`,
        ).toBeVisible({ timeout: 240_000 })
      }
    }
  })
})
