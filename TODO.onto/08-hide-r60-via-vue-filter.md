# 08 — Hide R60 via Vue-layer filter (respects data file)

## Context
Earlier attempt filtered `oiml-r60` entries out of `src/data/ontology-data.ts` directly. That was reverted — the data file is the source of truth and should not be mutated by a one-shot script.

The new approach: **filter at the view layer**. The data file keeps its full content (including R60 for future use), but the public site never renders R60 entities.

## Deliverables

### 8.1 `OntologyBrowser.vue`
In the `filtered` computed, add:
```ts
list = list.filter(e => e.ontology !== 'oiml-r60')
```
Apply BEFORE the search/type filters so the count and namespace groups never include R60.

Also filter `namespaceGroups`: skip any namespace whose `prefix === 'oiml-r60'`. (It's already filtered out of `ontologyNamespaces` per TODO #09, but defensive filtering here is cheap.)

### 8.2 `[...slug].astro` getStaticPaths
```ts
export async function getStaticPaths() {
  return ontologyEntities
    .filter(e => e.ontology !== 'oiml-r60')
    .map(entity => ({ params: { slug: entity.slug }, props: { slug: entity.slug } }))
}
```
This prevents R60 entity pages from being generated at all. Direct URLs like `/ontology/oiml-r60-LoadCell` will 404.

### 8.3 Source TTL stays out of public/
The `oiml-r60.ttl` file was moved from `public/ontologies/` to `ontologies/` (repo root). It is no longer served as a static asset. The TTL is preserved as source material (per global "never delete source" rule) but is not publicly downloadable.

## Acceptance
- `/ontology/` shows 3 ontology groups (smart, oiml, oiml-pubtype) — no R60.
- Searching "load cell" or "R 60" returns no results.
- Direct URL `/ontology/oiml-r60-LoadCell` returns 404.
- `oiml-r60.ttl` is not accessible at any public URL.
