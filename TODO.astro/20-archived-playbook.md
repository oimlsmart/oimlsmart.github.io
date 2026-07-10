# 20 — Document the migration-from-smart-browser playbook

**Status:** pending
**Depends on:** 09, 10-15 (composable + page migration done)

## Why

Future contributors (including future me) will look at `smart/browser/` and wonder: "is this used, or is it archived?". Without explicit guidance they might:
- Re-introduce dependencies that we worked to remove
- Re-deploy the local-server workflow
- Re-split the codebase into static-site + browser-app

## What to do

Create `smart/browser/ARCHIVED.md` (or whatever doesn't collide with existing docs) that explains:
- The smart browser app was the *original* implementation
- It has been (is being) migrated into `oimlsmart.github.io` (Astro)
- For [period X], `bin/dev` in the smart repo will continue to work as a fallback
- After production cutover (TODO.astro/17), this repo becomes "the legacy implementation"
- Reference back to the new live deployment

## Open question

Should we:
- (A) Keep `smart/browser/` untouched as reference. Mark with ARCHIVED.md.
- (B) Move all useful code into oimlsmart.github.io, then `rm -rf smart/browser/` (but per global rule: NEVER DELETE source).
- (C) Hybrid: move code, leave a tagged final commit and ARCHIVED.md.

Per the never-delete-source rule, option (B) is out. The choice is between A and C.

For the initial migration, (A) is correct: keep the legacy code, mark it clearly. (C) can come later when we're confident the migration is stable.

## Acceptance criteria

- [ ] ARCHIVED.md created in smart/browser
- [ ] README at the smart repo root mentions the migration target
- [ ] No code dependencies break
