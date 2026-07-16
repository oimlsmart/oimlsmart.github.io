# 05 — Port supporting libraries

## Why
The Astro pages in TODO #4 depend on three supporting modules that we don't yet have:
1. `ontologyViewModel.ts` — pure resolver computing ancestors, subclasses, grouped usage, where-used, etc.
2. `lib/rdf.ts` — per-entity Turtle + JSON-LD serializer used by the RDF Source tab on detail pages.
3. `OntologyLink.astro` — qname → entity-page hyperlink component.

## Deliverables

### 5.1 `src/data/ontologyViewModel.ts`
Copy `mn/isq-smart/browser/src/data/ontologyViewModel.ts` (442 lines) verbatim — it is pure TypeScript with no isq-specific assumptions. The `OntologyEntityData` interface and `resolveOntologyEntityView()` function are fully generic over the generated entity shape.

### 5.2 `src/lib/rdf.ts` + `src/lib/turtle-writer.ts`
Copy from `mn/isq-smart/browser/src/lib/`:
- `rdf.ts` (240 lines) — exports `toTurtle(entity)` and `toJsonLd(entity)`. Pure, no I/O.
- `turtle-writer.ts` — exports `escapeTurtle(str)` and `declareStandardPrefixes()`.

Skip `lib/download.ts` — we use a build-time inline `<a download>` instead of a runtime helper. The RDF download button in `[slug].astro` constructs a Blob and triggers a download from an inline script.

### 5.3 `src/components/OntologyLink.astro`
Simplified port — drop the `composables/useOntology` dep:

```astro
---
import { ontologyEntities } from '../data/generated/ontology'
interface Props { qname: string; label?: string; spanClass?: string }
const { qname, label, spanClass } = Astro.props
const target = ontologyEntities.find(e => e.qname === qname)
const href = target ? `/ontology/${target.slug}` : undefined
const text = label ?? qname
---
{href
  ? <a href={href} class="text-blue-600 hover:underline">{text}</a>
  : <span class={spanClass}>{text}</span>}
```

### 5.4 `src/lib/asset.ts` (optional)
isq-smart has `asset(path)` to prepend `import.meta.env.BASE_URL`. Our site is served from root, so we don't strictly need this. Inline path strings directly in the ported pages.

## Acceptance
- The three modules exist and import cleanly.
- `npm run build` produces no TypeScript errors.
- `[slug].astro` resolves `view.ancestors`, `view.groupedUsage`, `view.whereUsed`, etc. without runtime errors.
- The RDF tab on a class detail page renders valid Turtle and JSON-LD.
