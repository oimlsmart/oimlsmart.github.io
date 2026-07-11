import { test, expect } from '@playwright/test'

test.describe('Public site — critical paths', () => {
  test('home page renders with hero and stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('machine-actionable')
    await expect(page.getByText('What "SMART" stands for')).toBeVisible()
    await expect(page.getByText('Recommendations in the pilot')).toBeVisible()
  })

  test('nav links navigate to correct pages', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Developers' }).click()
    await expect(page).toHaveURL(/\/docs\//)
    await expect(page.locator('h1')).toBeVisible()

    await page.getByRole('link', { name: 'Documents' }).click()
    await expect(page).toHaveURL(/\/library\//)

    await page.getByRole('link', { name: 'Recommendations' }).click()
    await expect(page).toHaveURL(/\/recommendations\//)
  })

  test('docs page loads with sidebar and content', async ({ page }) => {
    await page.goto('/docs/')
    await expect(page.locator('h1')).toBeVisible()
    const headings = page.locator('h2')
    await expect(headings.first()).toBeVisible()
  })

  test('about dropdown trigger is present and interactive', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const trigger = page.getByTestId('dropdown-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('About')
  })

  test('theme toggle switches dark mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const toggle = page.getByTestId('theme-toggle')
    await expect(toggle).toBeVisible({ timeout: 10000 })

    const before = await page.locator('html').getAttribute('class') || ''
    await toggle.click()
    await page.waitForTimeout(200)
    const after = await page.locator('html').getAttribute('class') || ''
    expect(after).not.toBe(before)
  })

  test('DRAFT banner is present on all pages', async ({ page }) => {
    for (const path of ['/', '/docs/', '/blog/', '/recommendations/']) {
      await page.goto(path)
      await expect(page.getByText('pilot programme').first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.locator('h1')).toContainText('404')
  })
})
