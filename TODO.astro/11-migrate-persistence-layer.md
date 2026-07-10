# 11 — Migrate persistence layer

**Status:** pending
**Depends on:** 10 (utility composables, including repository-manager)

## Why

The browser app uses IndexedDB directly via `idb` and a custom `Repository<T>` pattern. Migrating this unlocks data access for all the workflow components.

## What to migrate

From `smart/browser/src/composables/`:
- `database.ts` — DB schema with stores: `formInstances`, `testReports`, `testRequests`, `applications`, `evaluations`, etc.
- `repository-manager.ts` — `getRepository<T>(storeName)` factory
- `useFormPersistence.ts` (and the 6 other `use<Entity>.ts` composables)

From `smart/browser/src/data/`:
- Type definitions in `types/` (auto-generated TS interfaces)
- YAML data declarations in `data-classes.yaml`, `entity-relationships.yaml`, etc. (these become content collections or static imports)

## How

1. Vendor the IndexedDB schema verbatim
2. Vendor the Repository pattern
3. Replace any direct filesystem reads (load YAML via Astro's `import.meta.glob`)
4. Tests: use `fake-indexeddb` to assert each store reads/writes correctly

## Acceptance criteria

- [ ] IndexedDB schema matches the browser app (migration version, store names, indexes)
- [ ] Repository pattern works: `getRepository<TestRequest>('testRequests').list()` etc.
- [ ] fake-indexeddb tests pass for all stores
- [ ] Schema migration test (v15 → v16 if needed) passes
