// ─────────────────────────────────────────────────────────────────────
// demo-sso.ts — the demo's SSO persona round-trip, ONE shared
// implementation. The demo instance (demo.oimlsmart.org) is
// OIDC-configured (smart#378): the one-click local demo cast is dead
// there — the personas are real accounts at id.oimlsmart.org whose
// credentials are never published. The only way in is the provider's
// grant-based persona assumption: a GRANTEE account
// (DEMO_SSO_EMAIL/DEMO_SSO_PASSWORD, held as this repo's secrets)
// signs in at the provider, and the account chooser
// (prompt=select_account) continues the flow AS the persona.
//
// The doctrine is the sentinel's: declared ⇒ verified; undeclared ⇒ a
// loud skip, never a false green. Every consumer — the demo-liveness
// smoke (e2e/demo-liveness.spec.ts) and the capture harnesses
// (scripts/capture-walkthroughs.ts, capture-audiences.ts,
// capture-usecases.ts) — rides this module, so the round-trip exists
// exactly once and the skip reason reads the same everywhere.
//
// The round-trip (the liveness spec's sequence, factored out):
//   1. the sign-in cone's persona strip names the persona and carries
//      its email as the card's login_hint — the email is READ from the
//      strip, never duplicated in a consumer;
//   2. the flow starts with prompt=select_account, which always routes
//      through the provider's account chooser (the persona assumption's
//      only surface);
//   3. a cold context signs the grantee in first (the chooser's "use
//      another account" → the provider's form, whose prefill is the
//      persona hint — the grantee's own address replaces it), then the
//      flow starts again with the live session the persona rows need;
//   4. the chooser's persona row completes the flow AS the persona, and
//      the demo callback lands the session on the persona's role home.
// ─────────────────────────────────────────────────────────────────────

import type { BrowserContext, Page } from '@playwright/test'

// The grantee account the signed-in legs sign in with at the identity
// provider (the freshness-sentinel workflow carries the pair as
// secrets). The personas' own credentials are never published — the
// chooser's grant-based assumption is the only way in.
export const SSO_EMAIL = process.env.DEMO_SSO_EMAIL ?? ''
export const SSO_PASSWORD = process.env.DEMO_SSO_PASSWORD ?? ''
export const SSO_REASON =
  'DEMO_SSO_EMAIL/DEMO_SSO_PASSWORD undeclared — the signed-in legs ride the SSO persona ' +
  'assumption, which needs a grantee account’s credentials (the persona credentials are never ' +
  'published). Provision the pair as this repo’s secrets; the freshness-sentinel workflow passes them.'

/** The sentinel's doctrine as one predicate: declared ⇒ the signed-in
 *  legs run; undeclared ⇒ the consumer skips them loudly with
 *  SSO_REASON, never a stale capture produced silently. */
export function ssoCredentialsDeclared(): boolean {
  return Boolean(SSO_EMAIL && SSO_PASSWORD)
}

/** Sign out through the context's own request client — an in-page
 *  fetch races the login page's signed-in redirect and dies with
 *  "Failed to fetch". */
export async function signOutDemo(demo: string, context: BrowserContext) {
  await context.request.post(`${demo}/api/auth/signout`).catch(() => {})
}

/** Tolerant landing wait for the SSO round-trip: the consent page is
 *  the one admitted interstitial (clicked through); the wait ends when
 *  the browser is back on the demo origin past the /api/auth callback. */
export async function waitForDemoLanding(demo: string, page: Page, timeoutMs = 240_000) {
  const origin = new URL(demo).origin
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const url = new URL(page.url())
    if (url.origin === origin && !url.pathname.startsWith('/api/auth')) return
    const allow = page.locator('[data-testid="op-consent-allow"]')
    if (await allow.isVisible().catch(() => false)) await allow.click()
    else await page.waitForTimeout(1_000)
  }
  throw new Error(`the SSO round-trip never landed back on ${origin} (last URL: ${page.url()})`)
}

/** Sign in AS a demonstration persona (the grant round-trip — the
 *  module header narrates the four steps). Returns once the browser is
 *  back on the demo origin past the auth callback; the caller waits
 *  for the persona's role-home prefix and the island settle (those
 *  budgets differ per consumer). */
export async function loginAsPersona(opts: {
  demo: string
  context: BrowserContext
  page: Page
  name: string
  timeoutMs?: number
}) {
  const { demo, context, page, name } = opts
  const timeout = opts.timeoutMs ?? 240_000
  await signOutDemo(demo, context)
  await page.goto(`${demo}/app/login`, { waitUntil: 'commit' })
  const card = page.locator(`a[data-testid^="sso-persona-"]:has(span:text-is("${name}"))`).first()
  await card.waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(`the sign-in cone's persona strip never offered "${name}"`)
  })
  const href = await card.getAttribute('href')
  const personaEmail = href ? new URL(href, new URL(demo).origin).searchParams.get('login_hint') : null
  if (!personaEmail) throw new Error(`the "${name}" persona card carries no login_hint`)

  const startPersonaFlow = () =>
    page.goto(
      `${demo}/api/auth/signin/oidc?login_hint=${encodeURIComponent(personaEmail!)}&prompt=select_account`,
      { waitUntil: 'commit' },
    )

  await startPersonaFlow()
  await page.waitForSelector('[data-testid="op-choose-account"]', { timeout })
  const personaRow = page.locator(`[data-testid="chooser-account-${personaEmail}"]`)
  if ((await personaRow.count()) === 0) {
    // No live provider session: sign the grantee in, then re-enter the
    // persona flow (the chooser's persona rows render only for a live
    // session the grant declaration names).
    await page.locator('[data-testid="chooser-use-another"]').click()
    const emailField = page.locator('[data-testid="login-email"]')
    await emailField.waitFor({ state: 'visible', timeout }).catch(() => {
      throw new Error('the provider’s sign-in form never answered')
    })
    await page
      .waitForFunction((wanted) => (document.querySelector('[data-testid="login-email"]') as HTMLInputElement | null)?.value === wanted,
        personaEmail, { timeout, polling: 500 })
      .catch(() => {
        throw new Error('the persona’s login_hint never prefilled the provider’s sign-in form')
      })
    await emailField.fill(SSO_EMAIL)
    await page.locator('[data-testid="login-password"]').fill(SSO_PASSWORD)
    await page.locator('[data-testid="login-submit"]').click()
    // The grantee sign-in continues the carried authorize request,
    // minted as the GRANTEE; the persona flow restarts on the live
    // session, and this time the chooser offers the persona row.
    await waitForDemoLanding(demo, page, timeout)
    await startPersonaFlow()
    await page.waitForSelector('[data-testid="op-choose-account"]', { timeout })
  }
  await personaRow.waitFor({ state: 'visible', timeout }).catch(() => {
    throw new Error(`the chooser never offered the "${name}" persona to the declared grantee`)
  })
  await personaRow.click()
  await waitForDemoLanding(demo, page, timeout)
}
