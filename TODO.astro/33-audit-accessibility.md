# 33 — Audit: accessibility testing via axe-core

**Status:** proposal
**Audit finding:** no automated a11y checks; the site's accessibility is verified by eye only

## Finding

OIML SMART is a public-sector tool. Accessibility is not optional — it's a legal requirement for government-adjacent services in most jurisdictions (WCAG 2.1 AA). Currently:
- No axe-core or similar automated a11y scanner
- No keyboard-navigation test
- No color-contrast check
- No screen-reader test

## Proposal

Add `vitest-axe` (or `@axe-core/playwright` once Playwright is set up per TODO.astro/23):

```sh
npm install -D vitest-axe
```

```ts
// src/components/ThemeToggle.a11y.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import ThemeToggle from './ThemeToggle.vue'

describe('ThemeToggle a11y', () => {
  it('has no axe violations', async () => {
    const wrapper = mount(ThemeToggle, { attachTo: document.body })
    const results = await axe(wrapper.element)
    expect(results.violations).toEqual([])
    wrapper.unmount()
  })
})
```

## Priority targets

1. `ThemeToggle` — must have aria-label (already verified in unit tests)
2. `AboutDropdown` — must trap focus, close on Escape, announce expanded state
3. `SearchBox` — must have proper input label
4. `MobileNav` — must be keyboard-operable

## Acceptance criteria

- [ ] `vitest-axe` installed
- [ ] Each Vue island has an a11y test
- [ ] Zero axe violations in all islands
- [ ] CI runs a11y checks
