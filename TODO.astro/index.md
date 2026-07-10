# Astro 7 + Vite 8 + Tailwind 4 + Vue — Migration Complete

## Stack

| Component | Version | Status |
|---|---|---|
| Astro | 7.0.7 | ✓ active |
| Vite | 8.1.3 | ✓ bundled with Astro |
| Tailwind CSS | 4.3.2 | ✓ @theme configured, utilities demonstrated |
| Vue | 3.5.39 | ✓ 4 islands via @astrojs/vue |

## Vue islands (4)

| Component | Hydration | Purpose |
|---|---|---|
| ThemeToggle.vue | client:load | Dark mode toggle (reactive, localStorage) |
| MobileNav.vue | client:load | Hamburger menu (reactive, body class toggle) |
| AboutDropdown.vue | client:load | About dropdown (reactive, click-outside, Tailwind classes) |
| SearchBox.vue | client:idle | Pagefind search (lazy-loads JS+CSS on focus) |

## Tailwind 4

- `@theme` in app.css maps brand palette → utilities (bg-brand-600, text-ink, etc.)
- AboutDropdown.vue demonstrates utility class usage
- All 97 legacy `--vp-*` refs replaced with semantic names
- Remaining 10 are in login.astro (user-authored file)

## Remaining incremental work

- Convert page-level scoped CSS to Tailwind utilities (each page can migrate independently)
- Add vitest tests for Vue components (9 tests already written)
- Explore Tailwind typography plugin for `.prose` styles