import { defineConfig, devices } from '@playwright/test'

// The demo-liveness config (TODO.promotion/08): the smoke runs against
// the LIVE demo instance, so no local webServer, no build — and the
// default playwright.config.ts never matches this spec, keeping the
// per-push e2e suite hermetic. The nightly freshness workflow runs:
//
//   npx playwright test -c playwright.demo.config.ts
//
// DEMO_BASE overrides the target (default https://demo.oimlsmart.org).

export default defineConfig({
  testDir: './e2e',
  testMatch: /demo-liveness\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.DEMO_BASE ?? 'https://demo.oimlsmart.org',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'demo-liveness', use: { ...devices['Desktop Chrome'] } }],
})
