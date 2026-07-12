# TODO.ia — Information Architecture Redesign

**Created:** 2026-07-12
**Branch:** `feature/resources-ia-redesign`

## Goal

Redesign the site IA with a data-driven nav system: generic NavDropdown component + single-source-of-truth nav config. Group all resource-type content under "Resources." Add a Vocabularies intro page.

## Tasks

| # | Task | File | Status |
|---|---|---|---|
| 01 | Nav config: single source of truth | [01-nav-config.md](01-nav-config.md) | ✓ done |
| 02 | Generic NavDropdown component | [02-nav-dropdown-component.md](02-nav-dropdown-component.md) | ✓ done |
| 03 | Vocabularies intro page | [03-vocabularies-page.md](03-vocabularies-page.md) | ✓ done |
| 04 | Refactor Base.astro nav to use config + NavDropdown | [04-refactor-base-nav.md](04-refactor-base-nav.md) | ✓ done |
| 05 | Update mobile nav for new structure | [05-mobile-nav.md](05-mobile-nav.md) | pending (mobile nav inherits desktop via .nav-menu CSS) |
| 06 | Tests: NavDropdown + nav-config contract | [06-nav-tests.md](06-nav-tests.md) | ✓ done |
| 07 | Update E2E + visual regression for new nav | [07-e2e-visual.md](07-e2e-visual.md) | ✓ done |
| 08 | Architecture audit findings | [08-audit-findings.md](08-audit-findings.md) | pending (future audit work) |

## Principles

- **MECE:** Each nav item appears in exactly one group
- **OCP:** Adding a nav item = adding data to config, not editing components
- **DRY:** One NavDropdown component replaces 3 duplicated dropdowns
- **Single source of truth:** `nav-config.ts` drives nav rendering everywhere
- **Model-driven:** Nav structure is data, not hardcoded markup
