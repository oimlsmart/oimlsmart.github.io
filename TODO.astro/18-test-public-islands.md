# 18 — Add vitest tests for all public-site Vue islands

**Status:** in progress
**Depends on:** 09

## Currently tested

- `ThemeToggle.vue` — 5 tests
- `MobileNav.vue` — 4 tests
- `AboutDropdown.vue` — 6 tests
- `SearchBox.vue` — 4 tests

Total: 19 tests, all passing.

## What's not yet tested

Each remaining component and page on the public site should have at minimum:
- A "mounts without error" test
- A "renders the expected DOM" test
- One behavioral test (interaction, state, or side effect)

### Vue components on `src/components/`

- (none remaining — all 4 components tested)

### Astro components (`*.astro`)

These render server-side; tested with @testing-library/astro or just snapshot-tested. Lower priority since Astro components are mostly layout/presentational and easier to verify by eye.

- `InternalBanner.astro`
- `PageHero.astro`
- `DraftCallout.astro`
- `DocsSidebar.astro`
- `Base.astro` (layout)

### Pages

- `index.astro` (home)
- `app.astro` (launcher)
- `login.astro`
- `blog/index.astro`
- `404.astro`
- Doc section indexes (`/docs/`, `/docs/guides/`, `/docs/arch/`, `/docs/ref/`, `/docs/specifications/`, `/docs/workflow/`)

## Approach

Rather than write 4–6 tests per page (Astro pages are mostly `getStaticPaths() + template` with little logic), focus tests on pages that have non-trivial logic:
- `index.astro` — link generation, content grouping
- `blog/index.astro` — RSS integration, sort order
- Each `useForm/form Yaml` → JSON test

For presentational pages without logic, skip tests. We already have build verification + manual visual review.

## Acceptance criteria

- [ ] Test count grows from 19 to ~30 with presentational-page smoke tests
- [ ] No regression in existing tests
