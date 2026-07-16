# 02 — Port the Vite ontology-data plugin

## Why
`src/data/ontology-data.ts` is currently a 5,350-line hand-pasted blob that drifts from the canonical TTL. There is no generator in this repo. The isq-smart reference has a clean build-time plugin that parses TTL with `n3` and emits the typed entity model.

## Deliverables

### 2.1 Install dependency
`n3` — Turtle parser, ~30 KB, no transitive runtime deps.
```bash
npm install --save-dev n3
npm install --save-dev @types/n3    # if available; else declare minimal shims like isq-smart does
```

### 2.2 Port build module
Copy `mn/isq-smart/browser/build/ontology-extract.ts` → `oimlsmart.github.io/build/ontology-extract.ts`.

Required adaptations:
- `SMART` constant: keep `https://w3id.org/standards/smart/ontologies/core/`
- `ISO` constant: rename conceptually — we have OIML, not ISQ. Replace the `ISO` constant and the `isq`-vs-`smart`-vs-`external` classification with `oiml`-vs-`oiml-r60`-vs-`oiml-pubtype`-vs-`smart`-vs-`external`. The classifier decides `ontology` based on which namespace URI the subject starts with.
- `buildOntologyNamespaces()` must return 4 entries (oiml, oiml-r60, oiml-pubtype, smart) with proper titles, descriptions, and color tokens compatible with our design system.
- The `externalMeta` stub source (currently `./external-vocabulary`) is not needed for our scope — replace with an empty record and let the `external` ontology absorb all unreferenced qnames.

### 2.3 Port build plugin
Copy `mn/isq-smart/browser/build/ontology-data-plugin.ts` → `oimlsmart.github.io/build/ontology-data-plugin.ts`.

Adapt the TTL file list:
```ts
const ttlFiles = [
  resolve(ontoDir, 'smart.ttl'),                    // new (TODO #1)
  resolve(ontoDir, 'oiml.ttl'),                     // copy from smart/browser/public/ontologies/
  resolve(ontoDir, 'oiml-r60.ttl'),                 // copy from smart/browser/public/ontologies/
  resolve(ontoDir, 'oiml-publication-type.ttl'),    // copy from smart/browser/public/ontologies/
]
```

### 2.4 Ship canonical TTL sources
Copy these 3 files verbatim from `/Users/mulgogi/src/oimlsmart/smart/browser/public/ontologies/` into `oimlsmart.github.io/public/ontologies/`:
- `oiml.ttl`
- `oiml-r60.ttl`
- `oiml-publication-type.ttl`

These are **source files** — never delete or overwrite. Treat them as canonical inputs. (Per global rule "NEVER DELETE SOURCE FILES".)

Note: also keep them in `public/ontologies/` so they're served at `https://www.oimlsmart.org/ontologies/oiml.ttl` for RDF consumers.

### 2.5 Wire into astro.config.mjs
```ts
import { ontologyDataPlugin } from './build/ontology-data-plugin'

const paths = {
  ontologySrcDir: resolve(__dirname, 'public/ontologies'),
  generatedDir:   resolve(__dirname, 'src/data/generated'),
}

export default defineConfig({
  // ...
  vite: {
    plugins: [tailwindcss(), ontologyDataPlugin(paths)],
  },
})
```

### 2.6 Retire the hand-maintained file
- Delete `src/data/ontology-data.ts` (the 5,350-line blob).
- Create `src/data/generated/ontology.ts` as the new home (auto-generated, gitignored if desired — though committing is fine for static sites).
- Update all importers to point at `../data/generated/ontology` instead of `../data/ontology-data`.

## Acceptance
- `npm run build` succeeds and emits `src/data/generated/ontology.ts` containing all entities from the 4 TTL files.
- The generated file declares `ontologyEntities`, `ontologyPrefixes`, `ontologyImportChain`, `ontologyTypeMeta`, `ontologyNamespaces`, and the `OntologyEntity` type.
- `smart:Entity` and the other 9 referenced SMART classes appear with `ontology: 'smart'`, not `ontology: 'external'`.
