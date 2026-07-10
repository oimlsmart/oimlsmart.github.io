# 10 — Migrate auth + utility composables

**Status:** pending
**Depends on:** 09 (vitest)

## Why

The browser app has shared composables (`useAuth`, `useNotification`) that need to be available on the public site too. They're the lowest-risk migration unit and unblock everything else.

## What to migrate

From `smart/browser/src/composables/`:
- `useAuth.ts` — session check, login, logout
- `useNotification.ts` — global toast notifications
- `repository-manager.ts` — IndexedDB repository helper
- `database.ts` — IndexedDB schema + migration

## How

1. Copy each file into `src/lib/composables/` (preserve structure)
2. Update imports to point at relative paths under `src/`
3. Write tests for each:
   - `useAuth.test.ts` — mock fetch, assert login/logout flow
   - `useNotification.test.ts` — assert notify.show / dismiss
   - `database.test.ts` — use fake-indexeddb for store creation

## Acceptance criteria

- [ ] Files copied + imports fixed
- [ ] Tests pass against the new location
- [ ] No behavioral change vs. the originals (asserted by identical test results)
