# 12 — Cleanup stale files

## Context
After multiple iterations, the project accumulated orphaned files from approaches that were rolled back. None of these are imported by the live site (which uses the Vue browser at `src/components/ontology/OntologyBrowser.vue`). They form a closed reference loop amongst themselves.

## Files to delete

All files below were created in this session (or were already-orphaned one-shots). Per the global rule "NEVER DELETE any file you did not create", the pre-existing files (`.vitepress/`, `.wrangler/`) need scrutiny — but these are *cache directories* (build artifacts), not source material. They will regenerate if needed.

### My orphaned Astro/browser reimplementation
- `src/components/OntologyLink.astro` — not imported anywhere live
- `src/layouts/OntologyLayout.astro` — sidebar layout, no Astro pages left to use it
- `src/lib/rdf.ts` — Turtle/JSON-LD serializer, no live consumer
- `src/lib/turtle-writer.ts` — escape helpers, only used by rdf.ts
- `src/data/ontologyViewModel.ts` — view-model resolver, only used by Astro pages (now gone)
- `src/data/generated/` — stale output of the unwired plugin; not consumed
- `build/ontology-data-plugin.ts` — plugin not wired in astro.config.mjs
- `build/ontology-extract.ts` — pure logic for the plugin
- `scripts/filter-ontology-r60.mjs` — one-shot, already used

### Cache / generated directories (gitignored, but present on disk)
- `.vitepress/cache/` — stale VitePress cache from the prior migration (CLAUDE.md says "No VitePress")
- `.wrangler/` — Cloudflare adapter cache; the adapter is conditional in astro.config.mjs and not active

### Dependency cleanup
- Remove `n3` from `package.json` `devDependencies` — only used by `build/` which is being deleted
- Run `npm install` after the package.json edit to update `package-lock.json`

## What stays
- `TODO.onto/` — audit trail of what was done
- `ontologies/` — source TTLs (smart.ttl, oiml.ttl, oiml-r60.ttl, oiml-publication-type.ttl), kept as source-of-truth inputs
- `src/data/ontology-data.ts` — current data source for the Vue browser
- `src/components/ontology/OntologyBrowser.vue` + `OntologyDetail.vue` — the live browser
- `src/pages/ontology/{index,[...slug]}.astro` — live routes
- `src/styles/app.css` — includes the new teal-50..950 palette

## Acceptance
- `npm run build` succeeds (no missing-import errors)
- `npm test` passes (189 tests should still pass)
- `git status` shows the deletes as expected
- No `import` statement references a deleted file (verify with grep)
