# 15 — Migrate remaining workflow pages + components

**Status:** pending
**Depends on:** 14 (first page works as the template)

## Why

With the dispatch wizard proving the pattern, the remaining 30+ components and pages migrate mechanically. This is the bulk of the work but each piece is straightforward.

## What to migrate

### Pages (`smart/browser/src/pages/cs/*.vue`)
- `test-requests.vue` — IA index
- `test-request-detail.vue` — TR view + assignments
- `lab-inbox.vue` — Lab bucketed inbox
- `evaluation-detail.vue` — 3-level synthesis visualizer
- `model-family-editor.vue` — 3-panel catalog editor
- `cs-form-fill.vue` — Form filling page (largest single component)
- `application_detail.vue` — Application overview with matrix

### Layouts / shell
- `App.vue` (the app shell — top nav, routing container)
- Router configuration

### Components
- `ModelFamilyMatrix.vue`
- `MultiTRAggregator.vue`
- `ModelEvaluationPanel.vue`
- `TestAssignmentTable.vue`
- `Skeleton.vue`
- `EmptyState.vue`
- `FormInstanceViewer.vue`
- ~15 other small components

### Composables
- `useTestRequest.ts`
- `useTestAssignment.ts`
- `useModelFamily.ts`
- `useInstrumentSample.ts`
- `useModelEvaluation.ts`
- `useEvaluationReport.ts`
- `useApplication.ts`
- `useOimlCsBootstrap.ts`
- `useSampleData.ts` (demo seeding)
- `useUpgradeSampleData.ts`

## How

For each page:
1. Copy the .vue file
2. Update imports to migrated paths
3. Add route under `/app/<path>/`
4. Test in browser

For each composable:
1. Copy
2. Update imports
3. Use existing tests (or write new ones)

## Acceptance criteria

- [ ] All pages listed above render at `/app/...`
- [ ] Navigation between pages works (Vue Router under `/app/`)
- [ ] All composables copied with passing tests
- [ ] No `console.error` in production builds
- [ ] Bundle size reasonable (each page ideally < 200KB JS)
