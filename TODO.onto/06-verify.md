# 06 — Verify build and visual check

## Acceptance

### Build
```bash
npm install                # picks up n3 + chart.js
npm run build              # completes without errors
```

### Runtime check (dev)
```bash
npm run dev
```

Visit each URL and confirm:

| URL | Expected content |
|---|---|
| `http://localhost:4322/ontology/` | Hero, 7 nav cards, **4 ontology cards** (smart, oiml, oiml-r60, oiml-pubtype) with correct entity counts, download links work |
| `/ontology/smart-Entity` | Class detail page, hierarchy showing smart:Entity as a root, "0 subclasses" or actual subclasses if R60/OIML extend it, working RDF tab |
| `/ontology/oiml-Standard` | Class detail, ancestors tree (smart:PublicationDocument → smart:Entity), subclasses (TestReport), instances (R-60), grouped usage table for inherited properties |
| `/ontology/oiml-r60-LoadCell` | Class detail showing parent `oiml:DeviceUnderTest`, instances (none — R60 has no individual load cells in TTL), where-used |
| `/ontology/oiml-` | Ontology detail page — version, imports (smart:), entity summary tiles, tables for each entity type scoped to oiml |
| `/ontology/classes/` or `/ontology/#classes` | (if separate page exists) list of all classes |
| `/ontology/individuals/` | Table of all named individuals (R-60, part-1..3, requirements classes, accuracy classes, etc.) |
| `/ontology/concepts/` | SKOS concepts grouped by scheme (publication types, accuracy classes, humidity classes, technology classes) |
| `/ontology/diagram/` | Class hierarchy tree |
| `/ontology/statistics/` | Charts render |
| `/ontology/full.ttl` | Downloads or displays Turtle containing all 4 ontologies |

### Visual regressions to check
- Header / nav still renders (Vue components still in Base.astro should still work).
- Dark mode toggle still works.
- Footer still renders.
- InternalBanner still shows the DRAFT/pilot notice.

### Type check
```bash
npx astro check
```
No errors. Warnings OK.

### Things to confirm NOT broken
- Home page (`/`) still renders.
- `/docs/` still renders.
- `/blog/` still renders.
- `/feed.xml` still serves.
- Sitemap (`/sitemap-index.xml`) still includes `/ontology/`.
