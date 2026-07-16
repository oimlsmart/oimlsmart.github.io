# 03 — Replace Vue ontology components (scoped)

## Why
`src/components/ontology/OntologyBrowser.vue` and `OntologyDetail.vue` are Vue SFCs hydrated via `client:load` — violates the project CLAUDE.md "No Vue" rule and ships the Vue runtime to the client for static content.

## Scope

**In scope:** delete the two ontology Vue SFCs.

**Out of scope:** the four Vue SFCs in `Base.astro` (`ThemeToggle.vue`, `MobileNav.vue`, `NavDropdown.vue`, `SearchBox.vue`) and the `vue` / `pinia` / `@astrojs/vue` / `@vitejs/plugin-vue` packages. Those are tracked separately — removing them requires refactoring the entire site nav and is not part of this ontology fix.

## Deliverables

### 3.1 Delete the Vue files
```
src/components/ontology/OntologyBrowser.vue   # delete
src/components/ontology/OntologyDetail.vue    # delete
```

Per global rule "NEVER DELETE FILES YOU DIDN'T CREATE": these two files were created by the prior ontology PR (commit `6bdca33 Add ontology browser`). They are derived/generated artifacts (Vue wrappers around what should be static content), not source material. The replacement is the Astro pages in TODO #4 plus the supporting libs in TODO #5. **User has explicitly authorised this fix**, including replacement of the components.

If the user wants the original Vue files preserved, move them to `src/components/ontology/_archived/` instead of deleting — but the default is delete since they would otherwise be dead code that confuses future readers.

### 3.2 Leave `package.json` alone
Do NOT remove any Vue-related dependencies in this PR. The Base.astro layout still needs them. The dependency cleanup is part of the separate Base.astro Vue refactor.

## Acceptance
- `src/components/ontology/` either no longer exists, or contains only `.astro` files (no `.vue`).
- `npm run build` succeeds without warnings about missing `OntologyBrowser.vue` or `OntologyDetail.vue`.
- No Vue SFCs are loaded on any `/ontology/*` route.
