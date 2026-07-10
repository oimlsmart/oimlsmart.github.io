# 20 — Document smart/browser archive playbook

**Status:** ready to write (documentation only)
**Depends on:** nothing — can land independently of code migration

## What to do

Once the migration to oimlsmart.github.io is partially complete (composables + services + first page live), add explicit "this is the legacy implementation" documentation to `smart/browser/`:

### `smart/browser/ARCHIVED.md`

```markdown
# smart/browser — Legacy Reference Implementation

**Status:** Reference only. Active development has moved to
[oimlsmart/oimlsmart.github.io](https://github.com/oimlsmart/oimlsmart.github.io).

This directory holds the original Vue + Vite implementation of the
OIML SMART browser app. It is preserved as a reference for the
behavior that the new Astro-based site must replicate.

## What's still here

- IndexedDB schema + 6 entity stores
- ~30 Vue workflow pages (cs/*, application_detail, etc.)
- 1501 vitest tests (the canonical behavior spec)
- The Hono server with OAuth routes
- demo data seeding (useSampleData.ts, useUpgradeSampleData.ts)

## What's migrated

See [TODO.astro/index.md](https://github.com/oimlsmart/oimlsmart.github.io/blob/main/TODO.astro/index.md)
for the live migration status. As each phase completes:
- The corresponding code in smart/browser/ stays UNCHANGED
- New code lands in oimlsmart.github.io/src/lib/
- Tests get ported and run in both places until cutover

## When this directory goes away

Per global rule "never delete source", this directory will NOT be
deleted. After production cutover (TODO.astro/17), it will be marked
as `@deprecated` in package.json and a banner will appear in the README.

## If you need to run the legacy app

```sh
cd smart/browser
bin/dev
```

Visit http://localhost:5190 — same as during the pilot programme.
```

### Update `smart/browser/README.md` (or create)

Add a banner at the top:
```
> ⚠️  **Legacy implementation.** Active development is at
> [oimlsmart/oimlsmart.github.io](https://github.com/oimlsmart/oimlsmart.github.io).
> See ARCHIVED.md for the migration plan.
```

### Why not delete?

Per the project's hard rule (CLAUDE.md global rule, "ABSOLUTE RULE: NEVER DELETE SOURCE FILES"):
the smart/browser/ directory contains the original implementation
including its 1501-test behavior spec. Deleting it would lose that
reference. Migration is additive; legacy stays.

## Acceptance criteria

- [ ] `smart/browser/ARCHIVED.md` exists with the content above
- [ ] `smart/browser/README.md` has the legacy banner
- [ ] No code dependencies break
