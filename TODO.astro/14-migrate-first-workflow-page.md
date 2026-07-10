# 14 — Migrate first workflow page (proof of concept)

**Status:** pending
**Depends on:** 12 (services), 13 (auth)

## Why

Prove the end-to-end migration pattern with one Vue page. If this works, the rest follow the same template. The dispatch wizard is the right candidate because:
- It's the user-facing entry point (IA outsourcing work to labs)
- It exercises the data layer (applications, models, samples, labs)
- It uses recently-added features (per-form lab assignment via dispatch-planner.service)
- It has comprehensive test coverage already (12 dispatch-planner tests)

## What to migrate

- `smart/browser/src/pages/cs/test-request-dispatch.vue` → `src/components/dispatch/DispatchWizard.vue`
- Add a route `/app/dispatch/` that renders the wizard
- Add a route `/app/` that renders the existing app shell

## How

1. Copy the .vue file verbatim
2. Update imports to point at migrated composables/services
3. Replace `vue-router` navigation with Astro route links OR mount a Vue Router subtree under `/app/`
4. Verify all data loads (applications list, family models, sample data)
5. Verify form submission creates TestRequests + TestAssignments via the persistence layer
6. Test the full flow end-to-end in the browser

## Acceptance criteria

- [ ] Visit `/app/dispatch/` while logged in → wizard loads
- [ ] 4 steps work: pick application → see matrix → assign labs per form → review + issue
- [ ] Issuing creates TestRequests in IndexedDB
- [ ] Per-form lab splitting works (audit #5 finding)
- [ ] Visual fidelity matches the original (no broken styles)
- [ ] Existing 12 dispatch-planner tests pass against migrated service
