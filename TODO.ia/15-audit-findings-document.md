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

1. ~~Workflow page SSR errors~~ — **FIXED (TODO 16)**: Guarded `window` access in `onMounted` for ApplicationDetail, EvaluationDetail, TestRequestDetail.
2. **Cloudflare adapter deployment** — Adapter is opt-in (`CLOUDFLARE_DEPLOY=true`). Production cutover requires choosing hosting and DNS.
3. **Visual regression on CI** — Needs Linux baseline snapshots. Currently visual regression runs only locally.
4. ~~`[slug].astro` catch-all complexity~~ — **FIXED (TODO 17)**: Simplified to `!p.id.includes('/')`.

## Phase 3 — Additional cleanup (TODO 16-20)

| # | Finding | Principle | Resolution |
|---|---|---|---|
| 16 | SSR `window is not defined` in 3 workflow components | SSR safety | Moved `window.location.search` into `onMounted`; made `id` a `ref` |
| 17 | `[slug].astro` exclusion list grows with each section | OCP, simplicity | Replaced with `!p.id.includes('/')` — top-level filter |
| 18 | `any` types in ContentPage + EvaluationDetail | Type safety | Proper typing: `ComponentRenderer`, removed `as any` casts |
| 19 | Duplicated docs sort logic (12 lines across 6 files) | DRY | Extracted `byDocsOrder()` in `src/lib/docs-sort.ts`; 4 tests |
| 20 | Audit document update | Documentation | Updated remaining items status |
