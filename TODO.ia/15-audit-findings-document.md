---
status: done
---

# 15 — Architecture audit findings

**Date:** 2026-07-12

## What was audited

Full codebase audit for: OOP, MECE, model-driven design, OCP, DRY, performance, single source of truth, encapsulation, high-level architecture.

## Findings implemented this cycle

| # | Finding | Principle | Resolution |
|---|---|---|---|
| 09 | Content page rendering duplication (6 routes same pattern) | DRY | Extracted `ContentPage.astro` layout; refactored 5 routes |
| 10 | No contract test for nav-config ↔ pages | Test coverage | `nav-config.contract.test.ts` verifies every link resolves |
| 11 | AboutDropdown + InternalToolsDropdown dead code | DRY | Refactored to thin facades over NavDropdown |
| 12 | Footer inline in Base.astro | Encapsulation | Extracted to `SiteFooter.astro` |
| 13 | Dropdown panels break on mobile vertical nav | Responsive UX | CSS media query for inline expansion in mobile nav |
| 14 | `pages` schema title was optional | Type safety | Made `title: z.string()` required |

## Architecture scorecard (post-improvements)

| Principle | Score | Notes |
|---|---|---|
| MECE | pass | Each nav item in exactly one group; content collections non-overlapping |
| OCP | pass | Adding nav item = data entry; adding dropdown = config entry |
| DRY | pass | NavDropdown replaces 3 components; ContentPage replaces 6 patterns |
| Single source of truth | pass | nav-config.ts drives all nav; STANDARDS drives all pages |
| Model-driven | pass | Nav, standards, content collections all data-driven |
| Encapsulation | pass | Footer, banner, dropdowns all self-contained components |
| Performance | pass | Static output, lazy Vue islands, Pagefind search |

## Remaining items for future consideration

1. **Workflow page SSR errors** — `application-detail` and `evaluation-detail` Vue components access `window` during SSR. Build completes but with warnings. Fix: wrap `window` access in `onMounted` or `typeof window !== 'undefined'` guards.
2. **Cloudflare adapter deployment** — Adapter is opt-in (`CLOUDFLARE_DEPLOY=true`). Production cutover requires choosing hosting and DNS.
3. **Visual regression on CI** — Needs Linux baseline snapshots. Currently visual regression runs only locally.
4. **`[slug].astro` catch-all complexity** — The filter logic for excluding subdirectories could be simplified if content collections were reorganized.
