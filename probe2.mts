import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', e => console.log('PAGE ERR:', String(e).slice(0,200)))
try {
  const resp = await page.goto('https://demo.oimlsmart.org/app/login', { waitUntil: 'commit', timeout: 60000 })
  console.log('status', resp?.status())
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 })
  console.log('dcl ok')
  await page.waitForTimeout(6000)
  console.log('title:', await page.title())
  console.log((await page.evaluate(() => document.body?.innerText?.slice(0, 300))))
} catch (e) { console.log('FAILED:', e.message?.slice(0, 300)) }
await browser.close()
