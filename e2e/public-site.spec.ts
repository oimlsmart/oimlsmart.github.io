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

    // Dropdown links render front-door absolute (site-shell ADR-0003).
    const dropdownContainer = trigger.locator('xpath=..')
    await expect(dropdownContainer.locator('a[href="https://www.oimlsmart.org/library/"]')).toHaveCount(1)
    await expect(dropdownContainer.locator('a[href="https://www.oimlsmart.org/ontology/"]')).toHaveCount(1)
    await expect(dropdownContainer.locator('a[href="https://www.oimlsmart.org/docs/"]')).toHaveCount(1)
  })

  test('the tier dropdowns carry the component entries', async ({ page }) => {
    await page.goto('/')
    // The SMART tier: published artifacts + the Type-approval level.
    const smart = page.getByTestId('nav-dropdown-smart').locator('xpath=..')
    for (const href of ['/recs', '/vocab', '/publications', '/studio', '/cnml', '/smart', '/platform']) {
      await expect(smart.locator(`a[href="https://www.oimlsmart.org${href}"]`)).toHaveCount(1)
    }
    // The SMART+ tier: the full Type-instance + measurement lifecycle.
    const smartplus = page.getByTestId('nav-dropdown-smartplus').locator('xpath=..')
    for (const href of ['/cnml', '/smi', '/sst', '/smart', '/platform']) {
      await expect(smartplus.locator(`a[href="https://www.oimlsmart.org${href}"]`)).toHaveCount(1)
    }
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

  test('the OIML-CS SMART platform is the /smart component entry', async ({ page }) => {
    await page.goto('/')
    // The standalone top-level link folded into the SMART tier dropdown
    // (the nav contract: one href, one home).
    const trigger = page.getByTestId('nav-dropdown-smart')
    const dropdownContainer = trigger.locator('xpath=..')
    await expect(dropdownContainer.locator('a[href="https://www.oimlsmart.org/smart"]')).toHaveCount(1)
  })

  test('the four promotion sections sit in the nav and render', async ({ page }) => {
    // TODO.promotion/01: Audiences / Technologies / Use Cases / Services
    // are first-class standalone nav entries (front-door absolute).
    await page.goto('/')
    const nav = page.locator('#nav-menu')
    for (const [label, href] of [
      ['Audiences', '/audiences/'],
      ['Technologies', '/technologies/'],
      ['Use Cases', '/use-cases/'],
      ['Services', '/services/'],
    ] as const) {
      const link = nav.locator(`a[href="https://www.oimlsmart.org${href}"]`)
      await expect(link).toHaveCount(1)
      await expect(link).toContainText(label)
    }
    for (const [path, heading] of [
      ['/audiences/', 'Audiences'],
      ['/technologies/', 'Technologies'],
      ['/use-cases/', 'Use Cases'],
      ['/services/', 'Services'],
    ] as const) {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(heading)
      await expect(page.locator('h2', { hasText: 'What you do today' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'What you can try now' })).toBeVisible()
    }
  })

  test('vocabularies page renders with action box', async ({ page }) => {
    await page.goto('/vocabularies/')
    await expect(page.locator('h1')).toContainText('Vocabularies')
    const actionLink = page.getByRole('link', { name: /Access the OIML Vocabularies/ })
    await expect(actionLink).toBeVisible()
    await expect(actionLink).toHaveAttribute('href', '/vocab/')
  })

  test('the seven service pages render the page-depth anatomy', async ({ page }) => {
    // TODO.promotion/10: each service page carries the anatomy — the hero
    // with a real capture, the performed capability inventory, the
    // how-it-works diagram, the SMART/SMART+ split, the entitlement row
    // quoted from the single matrix source (never a copy), the honest
    // questions, and the journey CTAs. The status page answers the Status
    // section differently (it cannot probe itself); the rest is uniform.
    for (const [path, heading] of [
      ['/services/platform', 'The SMART Platform'],
      ['/services/identity', 'The identity service'],
      ['/services/demo', 'The demo instance'],
      ['/services/studio-viewer', 'The Studio viewer'],
      ['/services/vocab', 'The Vocabulary'],
      ['/services/status', 'The status service'],
      ['/services/ai', 'The AI service'],
    ] as const) {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(heading)
      await expect(page.locator('h2', { hasText: 'What you can do' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'How it works' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'SMART today, SMART+ next' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Who can use it, who can run it' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'The honest questions' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Where to go next' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Who can run what' }).first()).toBeVisible()
      // The performed evidence: at least one dated capture on the page.
      await expect(page.locator('figure.service-shot img').first()).toBeVisible()
      // The how-it-works diagram (inline SVG, house style).
      await expect(page.locator('figure.flow-diagram svg, figure.layer-diagram svg').first()).toBeVisible()
    }
  })

  test('the six audience pages render the page-depth anatomy', async ({ page }) => {
    // TODO.promotion/10: each audience page carries the anatomy — the hero
    // with a real capture, the performed capability inventory, the
    // how-it-works diagram, the SMART/SMART+ split, the entitlement row
    // quoted from the single matrix source (never a copy), the honest
    // questions, and the journey CTAs.
    for (const [path, heading] of [
      ['/about/audiences/member-states', 'For Member States'],
      ['/about/audiences/corresponding-members', 'For Corresponding Members'],
      ['/about/audiences/issuing-authorities', 'For Issuing Authorities'],
      ['/about/audiences/laboratories', 'For Test Laboratories'],
      ['/about/audiences/manufacturers', 'For Manufacturers'],
      ['/about/audiences/instrument-users', 'For Instrument Users'],
    ] as const) {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(heading)
      await expect(page.locator('h2', { hasText: 'What you can do' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'How it works' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Today (SMART) and the vision (SMART+)' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'What you can use, and what you can run' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'The honest questions' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Where to go next' })).toBeVisible()
      // The performed evidence: dated captures from the scripted apparatus.
      await expect(page.locator('figure.shot-figure img').first()).toBeVisible()
      // The how-it-works diagram (inline SVG, house style).
      await expect(page.locator('figure.tech-figure svg').first()).toBeVisible()
      // The SMART/SMART+ split, first-class and visually separated.
      await expect(page.locator('.smart-split')).toBeVisible()
      // The entitlement row, quoted from the single matrix source.
      await expect(page.locator('.entitlement-row table')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Who can run what' }).first()).toBeVisible()
    }
  })

  test('the audiences index carries the seven seats, the split, and the matrix', async ({ page }) => {
    await page.goto('/about/audiences/')
    await expect(page.locator('h1')).toContainText('Who OIML SMART is for')
    for (const href of [
      '/about/audiences/member-states',
      '/about/audiences/corresponding-members',
      '/about/audiences/issuing-authorities',
      '/about/audiences/laboratories',
      '/about/audiences/manufacturers',
      '/about/audiences/instrument-users',
      '/about/audiences/educators',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
    await expect(page.locator('figure.shot-figure img').first()).toBeVisible()
    await expect(page.locator('figure.tech-figure svg').first()).toBeVisible()
    await expect(page.locator('.smart-split')).toBeVisible()
    await expect(page.locator('.entitlement-matrix')).toBeVisible()
  })

  test('the services index cards link the service pages', async ({ page }) => {
    await page.goto('/services/')
    for (const href of [
      '/services/platform',
      '/services/demo',
      '/services/identity',
      '/services/studio-viewer',
      '/services/vocab',
      '/services/status',
      '/services/ai',
      '/services/who-can-run-what',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
  })

  test('the six use-case pages render the page-depth anatomy', async ({ page }) => {
    // TODO.promotion/05 under 10's anatomy: the day-in-the-life hero with
    // a real capture, the walkthrough of performed acts with their dated
    // evidence, the how-it-works diagram, the SMART/SMART+ split, the
    // objections FAQ, and the journey CTAs. The deployment-modes page
    // additionally quotes the entitlement determination from the single
    // matrix source (never a copy).
    for (const [path, heading, walkthrough] of [
      ['/use-cases/type-evaluation-end-to-end', 'Type evaluation, end to end', 'The story, chapter by chapter'],
      ['/use-cases/deployment-modes', 'The deployment-mode matrix', 'The four postures, rendered plain'],
      ['/use-cases/continuous-compliance', 'Continuous compliance via the twin', 'What you can do today'],
      ['/use-cases/training-on-the-sst', 'Training on the SST', 'What you can do today'],
      ['/use-cases/member-state-view', 'The member-state view', 'What you can do today'],
      ['/use-cases/additional-national-requirements', 'The additional-national-requirements flow', 'What you can do today'],
    ] as const) {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(heading)
      await expect(page.locator('h2', { hasText: walkthrough })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'How it works' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Today (SMART) and the vision (SMART+)' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'The honest questions' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Where to go next' })).toBeVisible()
      // The performed evidence: dated captures from the scripted apparatus.
      await expect(page.locator('figure.shot-figure img').first()).toBeVisible()
      // The how-it-works diagram (inline SVG, house style).
      await expect(page.locator('figure.tech-figure svg').first()).toBeVisible()
      // The SMART/SMART+ split, first-class and visually separated.
      await expect(page.locator('.smart-split')).toBeVisible()
    }
  })

  test('the deployment-modes page quotes the entitlement source', async ({ page }) => {
    await page.goto('/use-cases/deployment-modes')
    await expect(page.locator('.entitlement-row table')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Who can run what' }).first()).toBeVisible()
  })

  test('the use-cases index cards link the six stories', async ({ page }) => {
    await page.goto('/use-cases/')
    for (const href of [
      '/use-cases/type-evaluation-end-to-end',
      '/use-cases/deployment-modes',
      '/use-cases/continuous-compliance',
      '/use-cases/training-on-the-sst',
      '/use-cases/member-state-view',
      '/use-cases/additional-national-requirements',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
  })

  test('the demo-flow walkthroughs render the walkthrough anatomy', async ({ page }) => {
    // TODO.promotion/06: each walkthrough carries the SIMULATED honesty
    // note, the at-a-glance flow diagram, the keyed steps with their
    // scripted captures and try-it lines, the two presenter scripts
    // (printable, keyed to the steps), the SMART/SMART+ split, the honest
    // questions, and the journey CTAs.
    for (const [path, heading, steps] of [
      ['/demo/application', 'The application', 6],
      ['/demo/ia-intake', "The authority's intake", 8],
      ['/demo/tl-work', "The laboratory's work", 6],
      ['/demo/ia-evaluation', 'The evaluation and the certificate', 8],
      ['/demo/applicant-journey', "The applicant's journey", 5],
    ] as const) {
      await page.goto(path)
      // .first(): the print-only script header carries a second h1
      // (display:none on screen, the printed sheet's title).
      await expect(page.locator('h1').first()).toContainText(heading)
      // The SIMULATED honesty note on every walkthrough page.
      await expect(page.locator('.simulated-note')).toBeVisible()
      // The at-a-glance diagram (inline SVG, house style).
      await expect(page.locator('figure.flow-diagram svg').first()).toBeVisible()
      // The keyed steps, each with its try-it line.
      expect(await page.locator('.flow-step').count()).toBe(steps)
      await expect(page.locator('.flow-step__try').first()).toBeVisible()
      // The performed evidence: dated captures from the scripted apparatus.
      await expect(page.locator('figure.shot-figure img').first()).toBeVisible()
      // The presenter scripts in two lengths, keyed to the steps.
      await expect(page.locator('.presenter-script')).toHaveCount(2)
      await expect(page.locator('.presenter-script__steps').first()).toBeVisible()
      // The SMART/SMART+ split, first-class and visually separated.
      await expect(page.locator('.smart-split')).toBeVisible()
      await expect(page.locator('h2', { hasText: 'The honest questions' })).toBeVisible()
      await expect(page.locator('h2', { hasText: 'Where to go next' })).toBeVisible()
    }
  })

  test('the walkthroughs index and the audit-findings page render', async ({ page }) => {
    await page.goto('/demo/')
    await expect(page.locator('h1')).toContainText('The demo, walked')
    for (const href of [
      '/demo/application',
      '/demo/ia-intake',
      '/demo/tl-work',
      '/demo/ia-evaluation',
      '/demo/applicant-journey',
      '/demo/audit-findings',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
    await expect(page.locator('.simulated-note')).toBeVisible()
    await expect(page.locator('figure.shot-figure img').first()).toBeVisible()

    await page.goto('/demo/audit-findings')
    await expect(page.locator('h1').first()).toContainText('The audit findings')
    await expect(page.locator('.simulated-note')).toBeVisible()
    await expect(page.locator('.presenter-script')).toHaveCount(2)
    await expect(page.locator('.smart-split')).toBeVisible()
    // The gap clusters carry their honest state markers.
    await expect(page.getByText('GAP 4')).toBeVisible()
    await expect(page.getByText('◐ IN REVIEW')).toBeVisible()
    await expect(page.locator('h2', { hasText: 'The honest questions' })).toBeVisible()
  })

  test('the CIML tour deck renders and navigates', async ({ page }) => {
    // TODO.promotion/07: the deck at /tour — 19 slides from one source,
    // keyboard/clicker navigation, the hash as the shareable per-slide
    // address, the estate map as the one diagram, SMART+ labeled.
    await page.goto('/tour/')
    expect(await page.locator('.tour-slide').count()).toBe(19)
    await expect(page.locator('.tour-slide.is-active')).toHaveCount(1)
    await expect(page.locator('.tour-slide.is-active .tour-slide__title')).toContainText('The Digital OIML, live')
    await expect(page.locator('[data-pos]')).toHaveText('1 / 19')
    // Keyboard navigation advances, and the hash becomes the address.
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.tour-slide.is-active')).toHaveAttribute('id', 's02')
    expect(page.url()).toContain('#s02')
    // The deep link lands on the addressed slide directly.
    await page.goto('/tour/#s07')
    await expect(page.locator('.tour-slide.is-active')).toHaveAttribute('id', 's07')
    // The on-screen buttons navigate too (the clicker path).
    await page.getByRole('button', { name: 'Next slide' }).click()
    await expect(page.locator('.tour-slide.is-active')).toHaveAttribute('id', 's08')
    await expect(page.locator('[data-pos]')).toHaveText('8 / 19')
    // Every slide carries its shareable anchor.
    expect(await page.locator('.tour-slide__anchor').count()).toBe(19)
    // The estate map is the one diagram on s03; the twin slide is the
    // labeled SMART+ future.
    await expect(page.locator('#s03 figure.tech-figure svg')).toBeAttached()
    await expect(page.locator('#s10 .tour-chip--plus')).toContainText('SMART+')
  })

  test('the tour demo moments carry the live link and the dated fallback', async ({ page }) => {
    // TODO.promotion/07: every demo moment is a LINK into
    // demo.oimlsmart.org at the exact console/step (the walkthrough
    // vocabulary from 06), with the dated capture for the no-network
    // room — never a recording.
    await page.goto('/tour/')
    for (const [id, live] of [
      ['s04', 'https://demo.oimlsmart.org/app/portal/applications/new'],
      ['s05', 'https://demo.oimlsmart.org/app/ia'],
      ['s06', 'https://demo.oimlsmart.org/app/lab'],
      ['s07', 'https://demo.oimlsmart.org/app/register'],
      ['s08', 'https://demo.oimlsmart.org/app/verify'],
    ] as const) {
      const slide = page.locator(`#${id}`)
      await expect(slide.locator('.tour-live__cta')).toHaveAttribute('href', live)
      await expect(slide.locator('figure.shot-figure img').first()).toBeAttached()
      await expect(slide.locator('.shot-caption').first()).toContainText('captured 2026-09-01')
      // The whole flow's narration is one click from the slide.
      await expect(slide.locator('.tour-live__walk a')).toHaveAttribute('href', /\/demo\//)
    }
  })

  test('the presenter notes carry the two cuts and the rehearsal record', async ({ page }) => {
    // TODO.promotion/07: the notes surface — the mechanics, the 5-minute
    // and 20-minute cuts with beat timings, the per-slide talk track,
    // and the recorded rehearsal walks with the link verification.
    await page.goto('/tour/notes/')
    // .first(): the print-only header carries a second h1 (display:none
    // on screen, the printed notes' title).
    await expect(page.locator('h1').first()).toContainText('The presenter notes')
    await expect(page.locator('h2', { hasText: 'Before you present' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'The 5-minute cut' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'The 20-minute cut' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'The per-slide notes' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'The rehearsal record' })).toBeVisible()
    // The cuts: 8 slides ride the 5-minute cut, all 19 the 20-minute.
    const cut5 = page.locator('h2', { hasText: 'The 5-minute cut' }).locator('xpath=..').locator('tbody tr')
    expect(await cut5.count()).toBe(8)
    const cut20 = page.locator('h2', { hasText: 'The 20-minute cut' }).locator('xpath=..').locator('tbody tr')
    expect(await cut20.count()).toBe(19)
    // The talk track exists per slide, linked back to the deck.
    expect(await page.locator('a[href^="/tour#s"]').count()).toBeGreaterThanOrEqual(19)
    // The rehearsal record: two walks, the live links verified 200.
    await expect(page.getByText('walked end to end').first()).toBeVisible()
    expect(await page.getByText('200 ·', { exact: false }).count()).toBeGreaterThanOrEqual(9)
  })

  test('the seven one-pagers render the sheet anatomy and print clean', async ({ page }) => {
    // TODO.promotion/07: the leave-behind — each audience page condensed
    // to one printable sheet: the pitch, today, the changes, the try-it
    // links, the entitlement line pointing at the single matrix source,
    // the contact, and the honesty footer. On screen the print-only
    // sheet header hides; under print media it shows (the print contract).
    for (const [path, heading] of [
      ['/about/audiences/one-pagers/member-states', 'For Member States & NMIs'],
      ['/about/audiences/one-pagers/corresponding-members', 'For Corresponding Members'],
      ['/about/audiences/one-pagers/issuing-authorities', 'For Issuing Authorities'],
      ['/about/audiences/one-pagers/laboratories', 'For Test Laboratories'],
      ['/about/audiences/one-pagers/manufacturers', 'For Manufacturers'],
      ['/about/audiences/one-pagers/instrument-users', 'For Instrument Users'],
      ['/about/audiences/one-pagers/educators', 'For Educators & Students'],
    ] as const) {
      await page.goto(path)
      await expect(page.locator('h1').first()).toContainText(heading)
      for (const section of ['What you do today', 'What changes', 'Try it now', 'Who to talk to']) {
        await expect(page.locator('h2', { hasText: section })).toBeVisible()
      }
      // The entitlement line points at the single matrix source.
      await expect(page.locator('.one-pager-sheet').getByText('/services/who-can-run-what')).toBeAttached()
      // The honesty footer names the demo simulated and dates the sheet.
      await expect(page.locator('.one-pager-foot')).toContainText('simulated')
      await expect(page.locator('.one-pager-foot')).toContainText('2026-09-01')
      // The print contract: the sheet header shows under print media.
      await expect(page.locator('.one-pager-print-only.one-pager-title')).toBeHidden()
      await page.emulateMedia({ media: 'print' })
      await expect(page.locator('.one-pager-print-only.one-pager-title')).toBeVisible()
      await page.emulateMedia({ media: 'screen' })
    }
    // The index links all seven sheets.
    await page.goto('/about/audiences/one-pagers/')
    await expect(page.locator('h1')).toContainText('The leave-behind')
    for (const slug of [
      'member-states',
      'corresponding-members',
      'issuing-authorities',
      'laboratories',
      'manufacturers',
      'instrument-users',
      'educators',
    ]) {
      await expect(page.locator(`a[href="/about/audiences/one-pagers/${slug}"]`).first()).toBeVisible()
    }
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
