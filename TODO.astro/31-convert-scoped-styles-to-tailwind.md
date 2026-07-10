# 31 — Convert scoped `<style>` blocks to Tailwind utilities

## Status: ✓ Implemented

## What was done

Converted 16 of 20 files from scoped `<style>` blocks to Tailwind utility classes on elements. The 4 files that retain scoped CSS contain only selectors that genuinely cannot be Tailwind utilities.

### Converted to pure Tailwind utilities (0 scoped CSS)

| File | Before | After |
|---|---|---|
| `src/pages/index.astro` | 154 lines | 24 lines (pseudo-elements + keyframes only) |
| `src/pages/app.astro` | 23 lines | 0 |
| `src/pages/404.astro` | 23 lines | 0 |
| `src/pages/blog/index.astro` | 19 lines | 0 |
| `src/layouts/DocsPage.astro` | 53 lines | 0 (.docs-body moved to @layer components) |
| `src/layouts/DocsLayout.astro` | 35 lines | 0 |
| `src/components/PageHero.astro` | 22 lines | 0 |
| `src/components/InternalBanner.astro` | 34 lines | 0 |
| `src/components/DraftCallout.astro` | 30 lines | 0 |
| `src/components/DocsSidebar.astro` | 37 lines | 0 |
| `src/components/ThemeToggle.vue` | 19 lines | 0 |
| `src/components/SearchBox.vue` | 5 lines | 0 |
| `src/pages/docs/index.astro` | 37 lines | 0 |
| `src/pages/docs/guides/index.astro` | 24 lines | 0 |
| `src/pages/docs/arch/index.astro` | 24 lines | 0 |
| `src/pages/docs/workflow/index.astro` | 24 lines | 0 |
| `src/pages/docs/specifications/index.astro` | 24 lines | 0 |
| `src/pages/docs/ref/index.astro` | 24 lines | 0 |

### Retains minimal scoped CSS (genuinely needs CSS)

| File | Lines remaining | Why it needs CSS |
|---|---|---|
| `src/pages/login.astro` | 253 | `@keyframes rise/rule-draw`, 7 animation declarations, `.specimen-grid` / `.specimen-marks::before` pseudo-elements, `prefers-reduced-motion` media query, `color-mix()` |
| `src/pages/index.astro` | 24 | `.home-hero::before` grid background, `.home-globe::before` glow, `@keyframes globe-rotate`, `prefers-reduced-motion` |
| `src/layouts/Base.astro` | 17 | Dark-mode logo switching (`.dark .logo-*`), mobile nav slide-in `@media` query |
| `src/components/MobileNav.vue` | 11 | `.is-open span:nth-child()` hamburger X animation |

### Additional changes

- Added `.docs-body` markdown styles to `@layer components` in app.css (was in DocsPage.astro `is:global`)
- Cleaned up `--vp-font-family-*` references in login.astro → semantic `--font-*` tokens
- Added `data-testid="search-box"` to SearchBox.vue for test-stable selector (replaced removed `.search-wrapper` class)
- Updated SearchBox tests to use `[data-testid="search-box"]` selector

## Build + test verification

- 81 pages built
- 158/160 tests pass (2 failures in `state-cascade.service.test.ts` are pre-existing on main, unrelated to CSS changes)
