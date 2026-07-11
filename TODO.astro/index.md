# OIML SMART Public Site — Migration Status

**Last updated:** 2026-07-11

## Stack (active on main)

| Layer | Tech | Status |
|---|---|---|
| Framework | Astro 7.0.7 | ✓ |
| Bundler | Vite 8.1.3 (bundled with Astro) | ✓ |
| CSS | Tailwind 4.3.2 + @tailwindcss/vite | ✓ |
| Vue integration | @astrojs/vue 7.0.1 | ✓ |
| Vue runtime | 3.5.39 | ✓ |
| Tests | vitest 4.1 + @vue/test-utils + jsdom | ✓ |
| Search | Pagefind (static) | ✓ |

All scoped CSS migrated to Tailwind 4 utility classes. Zero `--vp-*` legacy references. Zero inline styles in source.

## Vue islands (4 on public site, 4 on app pages)

| Component | Client directive | Purpose |
|---|---|---|
| `ThemeToggle.vue` | `client:load` | Dark mode toggle |
| `MobileNav.vue` | `client:load` | Hamburger menu |
| `AboutDropdown.vue` | `client:load` | About-section dropdown |
| `SearchBox.vue` | `client:idle` | Pagefind-driven search |
| `DispatchWizard.vue` | `client:load` | Dispatch wizard (app) |
| `LabInbox.vue` | `client:load` | Lab inbox (app) |
| `TestRequestList.vue` | `client:load` | Test request list (app) |
| `EvaluationList.vue` | `client:load` | Evaluation list (app) |

## Goal

Unify the public site (`oimlsmart.github.io`) and the browser app (`smart/browser/`) under one Astro deployment. Replace the localhost-server dance with a single deployable artifact.

## What's done

| # | Task | File |
|---|---|---|
| 01-08 | Initial Astro migration + framework stack | (pre-PR #8) |
| 09 | Add vitest infrastructure | [09-add-vitest.md](09-add-vitest.md) |
| 10 | Migrate auth + utility composables (entity-composables factory + 15 composables) | [10-migrate-auth-utility-composables.md](10-migrate-auth-utility-composables.md) |
| 11 | Migrate persistence layer (IndexedDB via Repository<T>) | [11-migrate-persistence-layer.md](11-migrate-persistence-layer.md) |
| 12 | Migrate all 6 core services (dispatch-planner, evaluation-aggregator, lab-selection, program, sample-selection, state-cascade) | [12-migrate-core-services.md](12-migrate-core-services.md) |
| 14 | Migrate dispatch wizard POC (first workflow page) | [14-migrate-first-workflow-page.md](14-migrate-first-workflow-page.md) |
| 15 | Migrate remaining workflow pages (lab-inbox, test-requests, evaluations) — partial | [15-migrate-remaining-pages.md](15-migrate-remaining-pages.md) |
| 18 | Test all Vue islands | [18-test-public-islands.md](18-test-public-islands.md) |
| 31 | Convert scoped `<style>` blocks to Tailwind utilities | [31-convert-scoped-styles-to-tailwind.md](31-convert-scoped-styles-to-tailwind.md) |

## What's remaining

| # | Task | File | Depends on |
|---|---|---|---|
| 13 | Migrate auth flow + SSR endpoints | [13-migrate-auth-flow.md](13-migrate-auth-flow.md) | 10 |
| 16 | App subpath routing via vue-router | [16-app-subpath-routing.md](16-app-subpath-routing.md) | 14 |
| 17 | Production deployment cutover (Cloudflare Pages + adapter) | [17-production-cutover.md](17-production-cutover.md) | 13, 16 |
| 19 | Migrate edge validation scripts (validate-r60) into vitest | [19-migrate-edge-validation-tests.md](19-migrate-edge-validation-tests.md) | 09 |
| 20 | Document migration playbook (archive smart/browser) | [20-archived-playbook.md](20-archived-playbook.md) | 10-15 |

## Audit findings (architectural improvements)

These are NOT blockers for the migration but improve code quality. Each can be picked up independently. Items marked ✓ are implemented.

| # | Finding | File | Type | Status |
|---|---|---|---|---|
| 21 | Result<T, E> wrapper for service return values | [21-audit-result-wrapper.md](21-audit-result-wrapper.md) | architecture | ✓ implemented |
| 22 | Encapsulate module singletons behind Pinia stores | [22-audit-pinia-stores.md](22-audit-pinia-stores.md) | architecture | ✓ implemented |
| 23 | Playwright E2E for auth + workflow critical paths | [23-audit-playwright-e2e.md](23-audit-playwright-e2e.md) | test infra | ✓ implemented |
| 24 | Data-driven standard metadata (no hardcoded OIML-R-60) | [24-audit-data-driven-standards.md](24-audit-data-driven-standards.md) | model-driven | ✓ implemented |
| 25 | Visual regression baseline via Playwright snapshots | [25-audit-visual-regression.md](25-audit-visual-regression.md) | test infra | ✓ implemented |
| 26 | Structural Lab type instead of importing TestLaboratory | [26-audit-structural-types.md](26-audit-structural-types.md) | architecture | ✓ implemented |
| 27 | Type-safe criteria loader (drop `loadedStandards` magic) | [27-audit-criteria-loader.md](27-audit-criteria-loader.md) | architecture | ✓ implemented |
| 28 | Criterion operator registry (true OCP) | [28-audit-operator-registry.md](28-audit-operator-registry.md) | architecture | ✓ implemented |
| 29 | Extract inline constants (stats, durations) | [29-audit-extract-constants.md](29-audit-extract-constants.md) | DRY | ✓ implemented |
| 30 | Page-render contract test (STANDARDS ↔ pages) | [30-audit-page-contract-test.md](30-audit-page-contract-test.md) | test infra | ✓ implemented |

## Test status

| Surface | Tests | Status |
|---|---|---|
| Vue islands (public + app) | 219 | ✓ passing |
| smart/browser app (original repo) | 1501 | ✓ passing |

## What this doesn't change

Per the global rule (never delete source): the `smart/browser/` repo remains in place. After cutover it becomes "legacy reference implementation"; new work happens in this repo.

## Decisions still pending user input

- Cloudflare Pages vs Netlify vs Vercel for cutover (TODO 17) — adapter choice is the first PR
- DNS TTL during cutover — affects rollback speed
- GitHub OAuth app callback URL update — affects when OAuth callback works in dev
- Pinia adoption (TODO 22) — adds ~7KB, provides devtools + test isolation + SSR-readiness
- Playwright adoption (TODO 23/25) — adds E2E + visual regression test infrastructure

## How to add a new TODO file

Numbered `{n}-{kebab-case-name}.md`. Update this index when adding.
