# Add per-Recommendation landing pages

**Status**: not started.

## Goal

Add dedicated landing pages for each modelled OIML Recommendation:

- `/recommendations/r60/` — OIML R 60: Load cells.
- `/recommendations/r129/` — OIML R 129: Mass road vehicles.
- `/recommendations/r144/` — OIML R 144: Gas meters.

Each page should show:

- The standard's scope and current modelling status.
- Counts (requirements, tests, forms).
- Links into the documentation specific to that standard.
- Link to the canonical PDF on oiml.org.

## Why

Currently the three modelled standards are mentioned only in passing on the home page and the docs index. Dedicated pages give each Recommendation a proper home and make the site more findable for search queries about specific Recommendations.

## Approach

- Source data is in `smart/data/oiml-r<N>/standard.yaml` and `smart/data/platform/catalog.yaml`.
- Either mirror the catalogue at build time, or hand-author each page initially and automate later.
- Add a "Recommendations" entry to the top nav.
