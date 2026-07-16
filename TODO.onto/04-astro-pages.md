# 04 — Port the Astro ontology pages (3-ontology aware)

## Why
The current site only has `/ontology/` (flat list) and `/ontology/[...slug]` (Vue detail). The isq-smart reference has 9 pages: a real landing with nav cards, per-type listings (classes, properties, individuals, concepts, shapes), a class diagram, a statistics page, and a Turtle download endpoint. We need the same structure adapted for our 3 ontologies: IEC-ISO SMART, OIML Core, OIML R 60.

## Source
Port from `/Users/mulgogi/src/mn/isq-smart/browser/src/pages/ontology/`:

| Source file | Target file | Adaptations |
|---|---|---|
| `index.astro` | `src/pages/ontology/index.astro` | Map `DefaultLayout` → our `Base`. Map `asset(...)` → direct paths (we're not in a subroute). Update hero copy: 3 ontologies, not 1. Add 4 namespace cards (smart + oiml + oiml-r60 + oiml-pubtype). Keep nav card grid (Classes, Properties, Concepts, Shapes, Individuals, Statistics, Diagram). |
| `[slug].astro` | `src/pages/ontology/[slug].astro` | Same layout mapping. Use `OntologyLink` (TODO #5). Use `resolveOntologyEntityView` (TODO #5). Tab JS for Overview/RDF + Turtle/JSON-LD toggle stays inline. |
| `individuals.astro` | `src/pages/ontology/individuals.astro` | Same. |
| `properties.astro` | `src/pages/ontology/properties.astro` | Same. |
| `shapes.astro` | `src/pages/ontology/shapes.astro` | Same. |
| `concepts.astro` | `src/pages/ontology/concepts.astro` | Same. |
| `diagram.astro` | `src/pages/ontology/diagram.astro` | Same. |
| `statistics.astro` | `src/pages/ontology/statistics.astro` | Same. |
| `full.ttl.ts` | `src/pages/ontology/full.ttl.ts` | Concatenate our 4 TTL sources and serve with `text/turtle` content type. |

## Page-by-page notes

### `index.astro`
- Hero: replace `ISQ Browser` with `OIML SMART`. Eyebrow `Semantic Ontology`.
- Breadcrumb: Home › Ontology.
- Nav cards (6): Classes / Properties / SKOS Concepts / SHACL Shapes / Named Individuals / Statistics / Diagram (7 total — keep all that have data).
- Namespace cards: 4 — one each for `smart`, `oiml`, `oiml-r60`, `oiml-pubtype`. Each card shows prefix chip, title, URI (mono), description, version, entity count, "View ontology definition →".
- Download row: `full.ttl` + per-ontology TTLs from `/ontologies/*.ttl`.

### `[slug].astro`
- getStaticPaths filters to entities with slug matching `^[a-zA-Z0-9_-]+$`. Drop the existing `[...slug].astro` catch-all.
- The page renders (per entity type):
  - URI, qname, definition, scopeNote, example, altLabel, seeAlso
  - Class: ancestors tree, this entity highlighted, subclasses; grouped inherited properties table; instances; SHACL constraints targeting this class; "in range of"; where-used
  - Property: domain/range/functional
  - Shape: target class, targetSubjectsOf, targetObjectsOf, constraints table
  - Concept: scheme, instanceOf, related shapes
  - ConceptScheme: top concepts list
  - Individual: instanceOf, identifier, isPartOf
  - Ontology: version, imports, namespace URI, entity summary tiles, per-type tables (classes, obj/datatype/annotation properties, shapes, concept schemes, concepts, individuals)
  - Where-used back-references
- Tabs: Overview / RDF Source. RDF Source has Turtle/JSON-LD toggle and a download button. Inline `<script define:vars={{ slug }}>` for tab switching.

### `diagram.astro`
Class tree starting from roots (entities with no parent OR parent not in the entity set). Indented `└`-style tree, click-to-expand. Inline script for collapse/expand.

### `statistics.astro`
Charts: entity count by type (bar), entity count by ontology (donut), properties per class (top 10). Use Chart.js (already in isq-smart — add as dependency).

### `properties.astro`
Table of all `objectProperty`, `datatypeProperty`, `annotationProperty` entities with domain, range, type chip.

### `shapes.astro`
Table of SHACL `NodeShape`/`PropertyShape` entities with target, constraint count, expandable constraint rows.

### `concepts.astro`
SKOS concepts grouped by concept scheme.

### `individuals.astro`
Table of named individuals with instanceOf, description, ontology chip.

### `full.ttl.ts`
GET endpoint that concatenates and serves all 4 source TTL files. Used by the "Download complete ontology (Turtle)" link on the index page.

## Acceptance
- All 9 pages exist, build clean, and render with real data.
- `/ontology/` shows 4 ontology cards (smart, oiml, oiml-r60, oiml-pubtype) and 7 nav cards.
- `/ontology/smart-Entity` resolves to a real internal page (not an external stub).
- `/ontology/full.ttl` returns Turtle with the 4 ontologies' contents concatenated.
