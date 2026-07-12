import { test, expect } from '@playwright/test'

test.describe('Visual regression — key pages', () => {
  test('home page (light mode)', async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(page).toHaveScreenshot('home-light.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    })
  })

  test('home page (dark mode)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await expect(page).toHaveScreenshot('home-dark.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    })
  })

  test('docs index page', async ({ page }) => {
    await page.goto('/docs/')
    await expect(page).toHaveScreenshot('docs-index.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    })
  })

  test('login page', async ({ page }) => {
    await page.goto('/login/')
    await expect(page).toHaveScreenshot('login.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    })
  })
})
