# 07 — OntologyLayout sidebar (follow-up)

## Why
The initial port from isq-smart only had top-nav. A real "ontology browser" needs a persistent sidebar so you can navigate between entities without going back to the landing page.

## Deliverable

Created `src/layouts/OntologyLayout.astro` — a wrapper around `Base.astro` that adds a left sidebar with:

1. **Section nav** — Overview, Classes, Properties, Individuals, Concepts, Shapes, Class Tree, Statistics. Active section highlighted.
2. **Search input** — client-side filter over qname + label + description (inline `<script is:inline>`, no hydration).
3. **Type filter chips** — All / Classes / Obj Prop / Indiv / Concepts. Combined with the search text.
4. **Scrollable entity list** — 167 entries sorted by type then label, each linking to its detail page. Ontology indicated by a colored dot (smart=emerald, oiml=brand, oiml-r60=teal, oiml-pubtype=orange).
5. **Active entity highlight** — on detail pages, the current entity's row is highlighted in brand-100 and scrolled into view on load.

## Wiring

All 9 `/ontology/*.astro` pages now import `OntologyLayout` instead of `Base`:

```astro
---
import OntologyLayout from '../../layouts/OntologyLayout.astro'
---
<OntologyLayout title="…" section="…" activeSlug={slug}>
  …page content…
</OntologyLayout>
```

Pages that pass `activeSlug` highlight that entity in the sidebar. Pages that pass `section` highlight that section in the nav. Pages can opt out of the sidebar entirely with `sidebar={false}`.

## Mobile
Sidebar is `hidden lg:block` — on mobile, the page content stacks below the normal site nav. The section nav and search are only available on large screens. A future enhancement could add a mobile drawer triggered by a hamburger button.

## Acceptance
- All `/ontology/*` pages render with the sidebar on lg+ screens.
- Typing in the search input filters the entity list live (no network round-trip).
- Clicking a type chip filters by type, combined with any active text search.
- On `/ontology/smart-Entity`, the `smart:Entity` row is highlighted in the sidebar.
- Build is clean, 267 pages, no compiler errors.
