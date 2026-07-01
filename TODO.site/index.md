# TODO.site

An index of work remaining on the public OIML SMART website (`oimlsmart.github.io`).

## Status legend

- **Done in initial scaffold**: pages exist with first-pass content.
- **Stub**: page exists but content is summary-level only.
- **Missing**: page does not exist yet.

## Files

### Content depth

- [01-port-full-docs-content.md](01-port-full-docs-content.md) — Port detailed content from the smart app's Vue pages into the markdown docs (architecture + workflow sub-pages).
- [02-mirror-yaml-schemas.md](02-mirror-yaml-schemas.md) — Publish the JSON Schemas as downloadable references from `/docs/ref/yaml-schema.html`.
- [03-mirror-type-definitions.md](03-mirror-type-definitions.md) — Publish the generated TypeScript type definitions.

### New sections to expand

- [04-port-smart-reqs-specs.md](04-port-smart-reqs-specs.md) — The 11 SMART_REQS specs are mirrored but raw; add page-heroes, cross-link them.
- [05-add-blog.md](05-add-blog.md) — Add a blog/ directory for programme updates.
- [06-verify-links.md](06-verify-links.md) — Run lychee link checker locally and resolve broken links.
- [07-configure-custom-domain.md](07-configure-custom-domain.md) — Configure GitHub Pages to serve from `www.oimlsmart.org`.
- [08-tighten-design-polish.md](08-tighten-design-polish.md) — Audit the visual polish against the smart app's Vue UI.
- [09-add-favicon-variants.md](09-add-favicon-variants.md) — Generate proper favicon variants for `site.webmanifest`.
- [10-add-search-index-tuning.md](10-add-search-index-tuning.md) — Tune the VitePress local search options.
- [11-add-rss-feed.md](11-add-rss-feed.md) — Add an RSS/Atom feed.
- [12-add-sitemap-extra.md](12-add-sitemap-extra.md) — Submit sitemap to Google Search Console.
- [13-port-landing-page-visuals.md](13-port-landing-page-visuals.md) — Port the spinning-globe Three.js animation from `smart/browser/src/components/SpinningGlobeWrapper.vue`.

### Library content

- [15-expand-library-documents.md](15-expand-library-documents.md) — Add Library entries for the OD/PD/D documents (currently only B 18 and the 3 Recommendations are detailed).
- [16-add-recommendation-source-text.md](16-add-recommendation-source-text.md) — Extract and publish the actual Recommendation text (currently the Library entries are summaries).

### Misc

- [14-add-standards-detail-pages.md](14-add-standards-detail-pages.md) — Already done as `/recommendations/`; review and deepen.
