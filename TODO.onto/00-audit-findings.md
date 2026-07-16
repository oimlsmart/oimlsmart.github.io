# 00 — Deep Audit Findings: Ontology Browser

## User complaint
> http://localhost:4322/ontology/ is NOT SHOWING A PROPER ONTOLOGY BROWSER like the one in `smart/`. It is just listing out all the things. We have 3 ontologies on our site: IEC-ISO SMART, OIML SMART and OIML R60. WHERE ARE THE OTHERS? WE NEED TO SHOW CLASSES, INDIVIDUALS, ETC!!!! DO A DEEP AUDIT! TELL ME WHAT THE FUCK IS WRONG! INVESTIGATE isq-smart!!!

## The 3 ontologies that should be present

| Prefix | Namespace URI | Source | Status on current site |
|---|---|---|---|
| `smart:` | `https://w3id.org/standards/smart/ontologies/core/` | IEC-ISO SMART core ontology | **MISSING** (referenced via `owl:imports` from `oiml.ttl` but no entities rendered) |
| `oiml:` | `https://w3id.org/standards/oiml/ontologies/core/` | OIML Core Ontology | Present (413 entities) |
| `oiml-r60:` | `https://w3id.org/standards/oiml/r60/ontologies/core/` | OIML R 60 Domain Ontology | Present |

The `smart:` namespace is referenced from `oiml.ttl` via `rdfs:subClassOf` for 10 classes (Entity, PublicationDocument, Organization, Activity, ProvisionSet, Provision, Requirement, TermEntry, ExternalConstraint, PublicationDocumentType). All 10 currently show up as broken "external" stubs in the browser because no SMART core TTL ships with the site.

## What's wrong with the current implementation

### 1. Vue SFCs violate the project's own CLAUDE.md
`CLAUDE.md` explicitly states:

> **No Vue.** All components are `.astro` files. No `<script setup>`, no Vue composables, no hydration.

But `src/components/ontology/` contains:
- `OntologyBrowser.vue` (135 lines, full `<script setup lang="ts">`)
- `OntologyDetail.vue`

These are loaded with `client:load` — full client hydration for what should be a static catalog. **Worse**: `Base.astro` itself imports 4 other Vue SFCs (`ThemeToggle.vue`, `MobileNav.vue`, `NavDropdown.vue`, `SearchBox.vue`) — so the "No Vue" rule is currently aspirational across the entire site, not just the ontology section. The ontology fix should at least stop making it worse here.

### 2. No generator — `src/data/ontology-data.ts` is hand-maintained
The file is 5,350 lines of hard-coded JSON literals with the header:
```
// Auto-generated from TTL files by ontology-data Vite plugin
// Do not edit manually
```
But **there is no Vite plugin in this repo**. There is no build script. There are no source TTL files in the repo. The data was generated offline in another project and pasted here, and has drifted from the canonical TTL in the `smart` repo (`/Users/mulgogi/src/oimlsmart/smart/browser/public/ontologies/*.ttl`).

When `smart.ttl` is later added or `oiml.ttl` is updated upstream, this site will not pick up the changes.

### 3. The "browser" is just a flat list
`OntologyBrowser.vue` only renders:
- A search box
- A type filter dropdown
- A flat list of entities grouped by namespace prefix

It does NOT show:
- A landing page with cards linking to **Classes / Properties / Individuals / Concepts / Shapes / Statistics / Diagram**
- Class hierarchies (subclasses, ancestors, descendants)
- Property domain/range tables
- Inherited properties (Ontospy-style grouped usage)
- SHACL shape constraints
- SKOS concept schemes with their top concepts
- Named individuals with their `instanceOf` classes
- Per-ontology landing pages (Namespace URI, version, imports, entity counts)
- Class hierarchy tree visualization
- RDF export per entity (Turtle + JSON-LD, with download button)
- "Where Used" back-references
- Statistics charts (entity counts by type, namespace distribution)
- Download link for the complete merged ontology as Turtle

All of the above exists in the `isq-smart` reference repo at `/Users/mulgogi/src/mn/isq-smart/browser/src/pages/ontology/` and should be ported.

### 4. Entity detail page is also a Vue SFC
`src/pages/ontology/[...slug].astro` just shells out to `<OntologyDetail client:load slug={slug} />`. The detail page therefore ships the entire Vue runtime to the client just to display a single entity.

### 5. Stale VitePress cache
`/Users/mulgogi/src/oimlsmart/oimlsmart.github.io/.vitepress/cache/` still exists despite CLAUDE.md saying "No VitePress" — leftover from the prior migration.

### 6. The Vue/Pinia cloudflare baggage
`package.json` pulls in `vue`, `pinia`, `@astrojs/vue`, `@astrojs/cloudflare`, `@vitejs/plugin-vue`, `@vue/test-utils`, `@pinia/testing`. The CLAUDE.md describes a static-only Astro site — none of these should be needed for the ontology pages.

## Reference: isq-smart's ontology browser

`/Users/mulgogi/src/mn/isq-smart/browser/src/pages/ontology/` contains the gold-standard implementation that we should port:

```
ontology/
├── index.astro         # Hero + nav cards (Classes, Properties, Concepts, Shapes, Individuals, Statistics, Diagram) + ontology namespace cards + downloads
├── [slug].astro        # Entity detail: URI, qname, hierarchy tree, inherited properties, grouped usage, SHACL constraints, instances, where-used, RDF export (Turtle + JSON-LD, tabbed, downloadable)
├── diagram.astro       # Class hierarchy tree
├── statistics.astro    # Charts: entity counts by type, namespace distribution
├── properties.astro    # All properties with domain/range
├── shapes.astro        # SHACL shapes listing
├── concepts.astro      # SKOS concepts
├── individuals.astro   # Named individuals table
└── full.ttl.ts         # Endpoint serving the merged Turtle ontology
```

Supporting modules:
- `build/ontology-data-plugin.ts` — Vite plugin that runs at build time
- `build/ontology-extract.ts` — pure TTL parsing + classification logic
- `src/data/ontologyViewModel.ts` — pure view-model resolver (ancestors, subclasses, grouped usage, etc.)
- `src/lib/rdf.ts` — per-entity Turtle/JSON-LD serializer
- `src/components/OntologyLink.astro` — qname → entity page linker
- `src/data/generated/ontology.ts` — build output, gitignored

The isq-smart plugin uses `n3` for Turtle parsing (a 30 KB dependency with no transitive deps).

## What needs to happen

1. **TODO.onto/01-smart-core-ontology.md** — ship a minimal but real `smart.ttl` defining the 10 referenced SMART core classes plus the ontology declaration. Resolves the "WHERE ARE THE OTHERS?" complaint.
2. **TODO.onto/02-vite-plugin.md** — port `ontology-data-plugin.ts` + `ontology-extract.ts` adapted for OIML namespaces. Drive data from real TTL files in `public/ontologies/`.
3. **TODO.onto/03-replace-vue-ontology-components.md** — delete `OntologyBrowser.vue` and `OntologyDetail.vue`; only touch the ontology-scoped Vue usage. (Site-wide Vue removal is out of scope and tracked separately.)
4. **TODO.onto/04-astro-pages.md** — port the 9 pages from isq-smart, adapted for 3 ontologies and our `Base.astro` layout.
5. **TODO.onto/05-supporting-libs.md** — port `ontologyViewModel.ts`, `lib/rdf.ts`, `OntologyLink.astro`.
6. **TODO.onto/06-verify.md** — build, dev, visually confirm.

## Out of scope (but flagged for separate work)

- Removing Vue from `Base.astro` (ThemeToggle, MobileNav, NavDropdown, SearchBox) — large refactor, separate PR.
- Removing `pinia`, `@astrojs/cloudflare`, `@vitejs/plugin-vue` from `package.json` — depends on the Base.astro refactor.
- Removing the stale `.vitepress/` cache directory — `git rm -r .vitepress` once CI is confirmed to not reference it.
