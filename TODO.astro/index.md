# Astro 7 + Vite 8 + Tailwind 4 + Vue — Full Migration

## Status

| Component | Version | Installed | Actually Used |
|---|---|---|---|
| Astro | 7.0.7 | ✓ | ✓ |
| Vite | 8.1.3 | ✓ | ✓ (bundled) |
| Tailwind CSS | 4.3.2 | ✓ | **minimal** — @theme configured, zero utility classes in source |
| Vue | 3.5.39 | ✓ | **minimal** — 2 islands (ThemeToggle, MobileNav) |

## Audit findings

- **97 references** to legacy `var(--vp-*)` variable names across 10 files
- **0 Tailwind utility classes** used in source code
- **2 Vue components** (out of ~15 interactive patterns)
- **~200 lines** of `is:global` CSS in Base.astro mixing many concerns
- **Multiple inline scripts** that should be Vue islands

## Tasks

| # | Task | Priority |
|---|---|---|
| 01 | Convert Base.astro nav to Tailwind utilities | high |
| 02 | Convert home page to Tailwind utilities | high |
| 03 | Replace all var(--vp-*) with semantic var(--*) | high |
| 04 | Create AboutDropdown.vue island | medium |
| 05 | Create SearchBox.vue island | medium |
| 06 | Convert content layouts to Tailwind | medium |
| 07 | Convert docs layout to Tailwind | medium |
| 08 | Convert blog to Tailwind | low |
| 09 | Convert 404/login/app pages to Tailwind | low |
| 10 | Add vitest tests for Vue components | low |