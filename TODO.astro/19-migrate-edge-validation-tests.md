# 19 — Migrate `validate-r60.mts` and friends to vitest integration tests

**Status:** pending
**Depends on:** 09 (vitest infrastructure)

## Why

In the primmel-ts repo I authored `validate-r60.mts` (and similar — `validate-parser-integration.mts`) that runs the parser against the R 60 model and asserts element counts. These are integration tests that prove the parser + dumps work end-to-end. They were vitest tests in concept but lived outside the test runner.

## What to migrate

From `primmel-ts/scripts/validate-r60.mts` → oimlsmart.github.io
- Run the R 60 model (would need to vendor it, or skip R 60 and use a small fixture)
- Assert counts: `roles`, `processes`, `forms`, `symbols`, `stateMachines`

From `primmel-ts/scripts/validate-parser-integration.mts` → oimlsmart.github.io
- Round-trip test: `load` then `dump` then `load` again; assert AST equivalence

## Important wrinkle: the package isn't depended on yet

The current setup has `@primmel/primmel` as a published npm package. Adding it as a devDependency here would create a circular dependency (oimlsmart.github.io ↔ primmel-ts) since both could plausibly live in the same monorepo eventually.

**Simpler approach**: add the npm package as a dependency in `package.json` of this site. Pin to a version that's stable. The R 60 model fixture file (~50KB) can also be vendored.

## Acceptance criteria

- [ ] validate-r60 integration test passes
- [ ] Round-trip test passes
- [ ] Both run in normal `npm test`
