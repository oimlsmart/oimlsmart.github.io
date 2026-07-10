# 31 — Convert scoped `<style>` blocks to Tailwind utilities

## Context

After the framework-utilization PR (#11), the architectural foundation is in place:
- Semantic colors in `@theme` → `bg-paper`, `text-ink`, `border-rule`, etc. all work
- `@layer base` holds the CSS reset + global UX polish
- `@layer components` holds `.btn` and `.prose`
- Base.astro nav/footer use Tailwind utilities directly
- Base.astro `is:global` reduced from ~199 lines to ~15 lines (logo dark-mode + mobile nav)

What remains: 21 `.astro` / `.vue` files still have scoped `<style>` blocks that could use Tailwind utilities instead of raw CSS. These are page-specific styles that should be converted incrementally.

## Files to convert (by priority — page traffic × block size)

| File | Scoped lines | Priority |
|---|---|---|
| `src/pages/index.astro` | 154 | High — home page |
| `src/layouts/DocsPage.astro` | 53 | High — every docs page |
| `src/components/InternalBanner.astro` | 34 | High — every page |
| `src/components/DraftCallout.astro` | 30 | Medium — content pages |
| `src/components/PageHero.astro` | 22 | Medium — hero sections |
| `src/components/DocsSidebar.astro` | — | Medium |
| `src/pages/docs/index.astro` | — | Medium |
| `src/pages/blog/index.astro` | — | Medium |
| `src/pages/login.astro` | — | Medium |
| `src/pages/app.astro` | — | Low |
| `src/pages/404.astro` | — | Low |
| `src/pages/docs/{ref,workflow,guides,specifications,arch}/index.astro` | — | Low |

## Rules for conversion

1. If the style targets the element itself → move to a Tailwind utility class on the element.
2. If the style uses `var(--xxx)` from `@theme` → use the corresponding utility (`bg-paper`, `text-ink`, etc.).
3. If the style uses `var(--xxx)` not in `@theme` → add the token to `@theme` first, then use the utility.
4. Keep scoped `<style>` only for: pseudo-elements (`::before`, `::after`), complex selectors, or animations that can't be expressed as utilities.
5. After each file, run `npm run build` + `npx vitest run` to verify.

## Done when

- [ ] All files above converted (or explicitly kept with a comment explaining why)
- [ ] `npm run build` passes (81 pages)
- [ ] `npx vitest run` passes (39 tests)
- [ ] Visual spot-check of home, docs, blog, login pages
