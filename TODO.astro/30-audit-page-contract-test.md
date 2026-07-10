# 30 — Audit: page-render contract test (every STANDARDS entry has a page)

**Status:** ✓ implemented
**Type:** test infrastructure / model-driven enforcement
**Audit finding:** there's no automated check that every standard in the STANDARDS registry has a corresponding `/library/<slug>/` and `/recommendations/<slug>/` page

## Finding

If someone adds an entry to `STANDARDS` but forgets to create the corresponding
markdown file in `src/content/pages/library/` or `src/content/pages/recommendations/`,
the home page will link to a 404. Currently caught only by manual click-through.

## Proposal

Add a vitest test that scans the build output (or the content collection)
and asserts every STANDARDS entry has both pages:

```ts
// src/data/standards.integration.test.ts
import { describe, it, expect } from 'vitest'
import { glob } from 'node:fs/promises'  // or use Astro's content collection API
import { STANDARDS } from './standards'

describe('STANDARDS ↔ pages contract', () => {
  it('every standard has a /library/<slug>/ page', async () => {
    const libraryPages = await collectContentSlugs('src/content/pages/library')
    for (const s of STANDARDS) {
      expect(libraryPages).toContain(s.slug)
    }
  })

  it('every standard has a /recommendations/<slug>/ page', async () => {
    const recommendationPages = await collectContentSlugs('src/content/pages/recommendations')
    for (const s of STANDARDS) {
      expect(recommendationPages).toContain(s.slug)
    }
  })

  it('no orphan pages (every library/recommendations page is in STANDARDS)', async () => {
    const libraryPages = await collectContentSlugs('src/content/pages/library')
    const standardSlugs = new Set(STANDARDS.map(s => s.slug))
    for (const slug of libraryPages) {
      expect(standardSlugs.has(slug)).toBe(true)
    }
  })
})
```

## Trade-offs

**Pros**
- Catches missing-page regressions in CI before deploy
- Documents the implicit contract between STANDARDS and content
- Encourages keeping the data registry in sync with content

**Cons**
- Test setup needs to know how to enumerate content files (filesystem glob)
- Slightly slower test (filesystem read)
- Brittle if content layout changes

## Acceptance criteria

- [ ] Test exists in `src/data/standards.integration.test.ts`
- [ ] CI runs it
- [ ] Test fails clearly when a standard lacks a page (the message names which standard)
