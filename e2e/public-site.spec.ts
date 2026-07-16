import { test, expect } from '@playwright/test'

test.describe('Public site — critical paths', () => {
  test('home page renders with hero and stats', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('machine-actionable')
    await expect(page.getByText('What "SMART" stands for')).toBeVisible()
    await expect(page.getByText('Recommendations in the pilot')).toBeVisible()
  })

  test('resources dropdown contains grouped nav items', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByTestId('nav-dropdown-resources')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Resources')

    const dropdownContainer = trigger.locator('xpath=..')
    await expect(dropdownContainer.locator('a[href="/recommendations/"]')).toHaveCount(1)
    await expect(dropdownContainer.locator('a[href="/library/"]')).toHaveCount(1)
    await expect(dropdownContainer.locator('a[href="/ontology/"]')).toHaveCount(1)
    await expect(dropdownContainer.locator('a[href="/docs/"]')).toHaveCount(1)
  })

  test('about dropdown trigger is present', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const trigger = page.getByTestId('nav-dropdown-about')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('About')
  })

  test('internal dropdown shows internal-only indicator', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const trigger = page.getByTestId('nav-dropdown-internal')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Internal')
  })

  test('OIML-CS is a standalone top-level nav link', async ({ page }) => {
    await page.goto('/')
    // Scope to the site nav so we don't match footer or audience-card duplicates.
    const link = page.locator('#nav-menu').getByRole('link', { name: 'OIML-CS' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/oiml-cs')
  })

  test('vocabularies page renders with action box', async ({ page }) => {
    await page.goto('/vocabularies/')
    await expect(page.locator('h1')).toContainText('Vocabularies')
    const actionLink = page.getByRole('link', { name: /Access the OIML Vocabularies/ })
    await expect(actionLink).toBeVisible()
    await expect(actionLink).toHaveAttribute('href', '/vocab/')
  })

  test('docs page loads with sidebar and content', async ({ page }) => {
    await page.goto('/docs/')
    await expect(page.locator('h1')).toBeVisible()
    const headings = page.locator('h2')
    await expect(headings.first()).toBeVisible()
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
