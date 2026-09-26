// ─────────────────────────────────────────────────────────────────────
// demo-liveness.spec.ts — the demo-link liveness smoke
// (TODO.promotion/08). The walkthrough and tour pages deep-link the
// live demo; the demo reseeds nightly; this leg is the guarantee the
// tour never silently breaks on that reset. Declared cadence: NIGHTLY
// (.github/workflows/freshness-sentinel.yml), never the per-push path — the
// per-push suite stays hermetic, and this spec lives behind its own
// config (playwright.demo.config.ts) so `npm run test:e2e` never picks
// it up.
//
//   DEMO_BASE=https://demo.oimlsmart.org npx playwright test -c playwright.demo.config.ts
//
// Three legs:
//   1. the public surfaces render anonymously (the instance front door,
//      the sign-in cone, the register, the verify page — the pages'
//      "no account" claims, exercised as claimed);
//   2. every deep link the walkthroughs and the tour publish answers
//      200 at the HTTP layer (the demo 404s unknown /app routes — a
//      moved route is a broken tour, caught here);
//   3. the cheap signed-in smokes: the Applicant console boots, and the
//      model-content allowlist's `live` pins are asserted on their
//      surfaces (today: the R 60 requirements page carrying the counts
//      the pages quote).
//
// The 2026-09-26 front-door wave (smart#422/#423, TODO.ia/01+02+04)
// rebuilt the anonymous surfaces: the instance root is the front door
// (the `front-door-*` markers, the instance identity, no marketing
// hero), and the sign-in cone presents the instance identity with the
// SSO persona strip. The demo instance is OIDC-configured (smart#378):
// the one-click local demo cast is dead there — the personas are real
// accounts at id.oimlsmart.org whose credentials are never published,
// so the signed-in legs ride the grant-based persona assumption: a
// GRANTEE account (DEMO_SSO_EMAIL/DEMO_SSO_PASSWORD, held as the
// repo's secrets) signs in at the provider, and the account chooser
// (`prompt=select_account`) continues the flow AS the persona. The
// doctrine is "declared ⇒ verified; undeclared ⇒ a loud skip": without
// the pair the signed-in legs skip with the reason printed, never a
// false green.
// ─────────────────────────────────────────────────────────────────────

import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { join } from 'node:path'
import { PROOF_MAP } from '../src/data/proof-map'
import { MODEL_CONTENT_ALLOWLIST } from '../src/data/model-content-allowlist'
import { REPO, demoLinks } from '../scripts/promotion-lib'
import { SSO_EMAIL, SSO_PASSWORD, SSO_REASON, loginAsPersona } from '../scripts/demo-sso'

const DEMO = (process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org').replace(/\/$/, '')

// The demo's first island paint after a cold sign-in measured ~115s
// (scripts/capture-audiences.ts, 2026-08-30): the signed-in legs get
// room; the anonymous legs stay quick.
test.setTimeout(300_000)

/** Sign in AS a demonstration persona: the grant round-trip lives in
 *  scripts/demo-sso.ts (ONE shared implementation — this spec and the
 *  capture harnesses ride the same code). */
async function loginAs(context: BrowserContext, page: Page, name: string) {
  await loginAsPersona({ demo: DEMO, context, page, name })
}

test.describe('the demo-link liveness smoke (TODO.promotion/08)', () => {
  test('the public surfaces render anonymously', async ({ page }) => {
    // The instance front door (TODO.ia/02): the instance identity and
    // the doors — sign-in, the public register, the verification
    // surface. The marketing hero is retired.
    await page.goto(`${DEMO}/`)
    await expect(page.getByTestId('front-door')).toBeVisible()
    await expect(page.getByTestId('front-door-name')).toHaveText('OIML-CS SMART Platform (Demonstration)')
    await expect(page.getByTestId('front-door-sign-in')).toBeVisible()
    await expect(page.getByTestId('front-door-register')).toBeVisible()
    await expect(page.getByTestId('front-door-verify')).toBeVisible()

    // The sign-in cone (TODO.ia/01): the instance identity, the SSO
    // button, and the persona strip — one card per kept persona, each
    // entering the provider flow with the persona's login_hint. The
    // one-click local cast never renders on an OIDC-configured instance
    // (smart#378).
    await page.goto(`${DEMO}/app/login`)
    await expect(page.getByText('Sign in to OIML-CS SMART Platform (Demonstration)').first()).toBeVisible({
      timeout: 120_000,
    })
    await expect(page.getByTestId('sso-login')).toBeVisible({ timeout: 120_000 })
    // The demo cast the walkthroughs name, as the persona strip's cards.
    for (const persona of ['sso-persona-applicant', 'sso-persona-issuing-authority', 'sso-persona-test-laboratory']) {
      await expect(page.getByTestId(persona), `the persona strip offers "${persona}"`).toBeVisible({
        timeout: 120_000,
      })
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
    test.skip(!SSO_EMAIL || !SSO_PASSWORD, SSO_REASON)
    await loginAs(context, page, 'Applicant')
    expect(page.url()).toContain('/app/portal')
    await expect(page.getByText(/[Aa]pplication/).first()).toBeVisible({ timeout: 240_000 })
  })

  test('the model-content live pins hold on their surfaces', async ({ context, page }) => {
    test.skip(!SSO_EMAIL || !SSO_PASSWORD, SSO_REASON)
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
