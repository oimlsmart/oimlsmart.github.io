import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'functional',
      testMatch: /public-site\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    ...(!isCI ? [{
      name: 'visual-regression',
      testMatch: /visual-regression\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    }] : []),
  ],
  webServer: {
    command: 'npm run build && npx serve dist -l 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !isCI,
    timeout: 120000,
  },
})
