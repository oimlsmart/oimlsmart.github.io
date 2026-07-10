# 23 — Audit: Playwright E2E for the auth + workflow critical paths

**Status:** proposal
**Type:** test infrastructure
**Audit finding:** existing 27 vitest tests cover component + service behavior, but the END-TO-END user flow (visit /login → auth → /app/dispatch → issue TestRequest) has no automation

## Finding

Vitest covers:
- Vue island behavior (19 tests)
- Composables (8 tests)
- Service pure functions (12 tests, after dispatch-planner port)

What's NOT covered:
- Click "Continue with GitHub" → real OAuth flow → cookie set → redirect
- Dispatch wizard full 4-step flow in a real browser
- Cross-component state (e.g., creating a TR in the wizard shows up in the lab inbox)
- Visual regression (page renders correctly in Chrome, Firefox, Safari)
- Build output actually serves + hydrates

## Proposal

Add **Playwright** for E2E. It can:
- Run a real browser (Chromium, Firefox, WebKit)
- Click through the OAuth flow (with a test GitHub user or mocked provider)
- Assert against actual DOM state
- Capture screenshots for visual review
- Run in CI

## What to test (priority order)

1. **Auth flow** (highest value):
   - Visit `/login/` → click "Continue with GitHub" → mock OAuth → land at `/app/` logged in
   - Refresh page → still logged in (cookie persisted)
   - Click "Sign out" → cleared, back at `/login/`

2. **Dispatch wizard** (covers all composables + services together):
   - Start at `/app/dispatch/` (logged in)
   - Step 1: pick accepted application
   - Step 2: see matrix render
   - Step 3: assign lab per form (test per-form lab splitting)
   - Step 4: review + issue
   - Assert TestRequests appear in IndexedDB

3. **Lab inbox**:
   - Lab user logs in → sees assigned TRs
   - Accept → status changes
   - Fill a form → FormInstance created

4. **Evaluation**:
   - Multiple TRs submitted → aggregator runs
   - Per-TR + per-model + family decisions visible
   - CONDITIONALLY_APPROVED preserved (audit #3 fix regression test)

## Setup

```sh
npm install -D @playwright/test
npx playwright install
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4321',
    browserName: 'chromium',
    storageState: 'e2e/.auth/user.json',  // pre-authenticated session
  },
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
})
```

## Trade-offs

**Pros**
- Catches UI plumbing bugs that vitest can't (the audit #3 bugs would have been caught here)
- Visual regression via screenshot diffing
- CI confidence: "does the deploy actually work?"

**Cons**
- Slower than unit tests (each test ~500ms vs ~5ms)
- Browser binary download (~200MB) in CI
- OAuth mocking is complex (need fake GitHub or test OAuth app)

## Acceptance criteria

- [ ] Playwright installed and configured
- [ ] `e2e/auth.spec.ts` covers login → callback → logout
- [ ] `e2e/dispatch.spec.ts` covers the wizard end-to-end
- [ ] CI workflow runs E2E on every PR
- [ ] Auth state is reused via storageState (no per-test re-login)
