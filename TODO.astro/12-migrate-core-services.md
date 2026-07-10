# 12 — Migrate core services

**Status:** pending
**Depends on:** 11 (persistence)

## Why

Pure-function services (lab-selection, sample-selection, evaluation-aggregator, dispatch-planner, state-cascade) are the heart of the certification workflow. They have the most thorough test coverage in the browser app and should migrate cleanly since they don't depend on DOM or persistence.

## What to migrate

From `smart/browser/src/services/`:
- `lab-selection.service.ts` — rank labs by capability
- `sample-selection.service.ts` — R 60-2 §2.4 algorithm
- `evaluation-aggregator.service.ts` — 3-level synthesis (TR → Model → Family)
- `dispatch-planner.service.ts` — per-form lab assignment (recent)
- `state-cascade.service.ts` — declarative state-machine side-effects
- `program.service.ts` — requiredFormsFor(model) derivation

## How

1. Copy each file into `src/lib/services/`
2. Copy the matching tests from `smart/browser/src/__tests__/` into `src/lib/services/*.test.ts`
3. Run tests; they should pass without modification (services are pure)

## Acceptance criteria

- [ ] All 6 services copied
- [ ] All existing tests ported and passing
- [ ] No changes to service logic (if a change is needed, document why)
