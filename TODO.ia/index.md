# TODO.ia — Information Architecture Redesign

**Created:** 2026-07-12
**Last updated:** 2026-07-12

## Goal

Redesign the site IA with a data-driven nav system: generic NavDropdown component + single-source-of-truth nav config. Group all resource-type content under "Resources." Add a Vocabularies intro page. Eliminate code duplication and enforce architecture principles throughout.

## Architecture principles

- **MECE:** Each nav item appears in exactly one group
- **OCP:** Adding a nav item = adding data to config, not editing components
- **DRY:** One NavDropdown component replaces 3 duplicated dropdowns; ContentPage replaces 6 route patterns
- **Single source of truth:** `nav-config.ts` drives nav rendering everywhere
- **Model-driven:** Nav structure is data, not hardcoded markup
- **Encapsulation:** Footer, banner, dropdowns all self-contained components

## Phase 1 — IA foundation (PR #29, merged)

| # | Task | Status |
|---|---|---|
| 01 | Nav config: single source of truth | ✓ done |
| 02 | Generic NavDropdown component | ✓ done |
| 03 | Vocabularies intro page | ✓ done |
| 04 | Refactor Base.astro nav to use config + NavDropdown | ✓ done |
| 05 | Mobile nav CSS for new structure | ✓ done |
| 06 | NavDropdown + nav-config tests | ✓ done |
| 07 | E2E + visual regression for new nav | ✓ done |

## Phase 2 — Architecture improvements (this PR)

| # | Task | Status |
|---|---|---|
| 08 | Architecture audit findings | ✓ done |
| 09 | ContentPage layout extraction (DRY) | ✓ done |
| 10 | Contract test: nav-config ↔ pages | ✓ done |
| 11 | Deprecated dropdown facades → NavDropdown | ✓ done |
| 12 | Footer extraction to SiteFooter.astro | ✓ done |
| 13 | Mobile nav: inline dropdown expansion | ✓ done |
| 14 | Content schema: title required | ✓ done |
| 15 | Audit findings document | ✓ done |

## Future work (identified in audit)

1. Workflow page SSR `window is not defined` errors — guard with `onMounted` or `typeof window` checks
2. Cloudflare adapter deployment cutover (TODO 17 in TODO.astro)
3. Visual regression Linux baselines for CI
4. `[slug].astro` catch-all filter simplification
