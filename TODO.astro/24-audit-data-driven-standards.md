# 24 — Audit: data-driven standard metadata (eliminate hardcoded `OIML-R-60`)

**Status:** proposal
**Type:** model-driven architecture improvement
**Audit finding:** the public site has the standard ID `OIML-R-60` baked into many places

## Finding

Searching the codebase reveals constants like:
- `'OIML-R-60'`
- `'r60'`
- `'R 60'`
- `'/recommendations/r60/'`

These are scattered across pages, components, and content files. When R 144 or R 129 becomes the pilot target, every reference needs updating.

## Proposal

Treat standard identity as data, not code. Define a single source of truth:

```ts
// src/data/standards.ts
export interface StandardRef {
  id: string           // 'OIML-R-60'
  slug: string         // 'r60'
  recommendationNumber: string  // 'R 60'
  title: string        // 'Metrological regulation for load cells'
  libraryPath: string  // '/library/r60/'
  recommendationsPath: string   // '/recommendations/r60/'
  oimlReference: string // 'OIML R 60:2021'
}

export const STANDARDS: StandardRef[] = [
  {
    id: 'OIML-R-60',
    slug: 'r60',
    recommendationNumber: 'R 60',
    title: 'Metrological regulation for load cells',
    libraryPath: '/library/r60/',
    recommendationsPath: '/recommendations/r60/',
    oimlReference: 'OIML R 60:2021',
  },
  // R 144, R 129, etc. follow the same shape
]
```

### Consumers

- Pages import `STANDARDS` and iterate, not hardcode
- Content collection schema declares `standard: string` (the slug) so markdown files reference a standard by slug
- The site map / search index is generated from `STANDARDS`

### Migration

1. Create `src/data/standards.ts`
2. Find all hardcoded references via grep
3. Replace each with `STANDARDS.find(s => s.slug === 'r60')` or similar
4. Add test that all standards in the data file have valid library + recommendations pages

## Why this matters

The user's directive: "fully model-driven, semantically-driven". Currently, the standard identity is encoded implicitly in URLs and prose. A new contributor has to reverse-engineer the conventions. With `STANDARDS` as a typed registry, the schema enforces completeness.

This also closes a gap with the smart/browser app, which already has `loadedStandards` and a similar concept (see audit #1).

## Acceptance criteria

- [ ] `src/data/standards.ts` exists with the StandardRef interface + STANDARDS array
- [ ] All hardcoded references to `r60`, `OIML-R-60`, `R 60` replaced
- [ ] Test that for every standard in STANDARDS, the corresponding `/library/<slug>/` and `/recommendations/<slug>/` pages exist
- [ ] Adding a new standard is a 1-line change (add to STANDARDS array)
