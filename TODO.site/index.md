# TODO.site

An index of work remaining on the public OIML SMART website (`oimlsmart.github.io`).

**Deployed**: <https://www.oimlsmart.org> · **Status**: DRAFT pilot programme.

## Done

The following items are complete and shipped:

- ✅ [01-port-full-docs-content.md](01-port-full-docs-content.md) — all 13 guides, 11 SMART_REQS specs, arch/workflow pages ported
- ✅ [02-mirror-yaml-schemas.md](02-mirror-yaml-schemas.md) — schema docs at `/docs/ref/yaml-schema.html`
- ✅ [03-mirror-type-definitions.md](03-mirror-type-definitions.md) — types at `/docs/ref/type-definitions.html`
- ✅ [04-port-smart-reqs-specs.md](04-port-smart-reqs-specs.md) — 11 specs mirrored with page heroes
- ✅ [06-verify-links.md](06-verify-links.md) — lychee passes (4 known false positives from Vue `:href`)
- ✅ [07-configure-custom-domain.md](07-configure-custom-domain.md) — `www.oimlsmart.org` live
- ✅ [09-add-favicon-variants.md](09-add-favicon-variants.md) — 16/32/48/96/180/192/512 generated
- ✅ [10-add-search-index-tuning.md](10-add-search-index-tuning.md) — title/heading boost applied
- ✅ [12-add-sitemap-extra.md](12-add-sitemap-extra.md) — VitePress sitemap, `noindex` meta + robots.txt
- ✅ [13-port-landing-page-visuals.md](13-port-landing-page-visuals.md) — animated SMART globe
- ✅ [14-add-standards-detail-pages.md](14-add-standards-detail-pages.md) — `/recommendations/{r60,r129,r144}/`

## Deferred

- 🟡 [05-add-blog.md](05-add-blog.md) — user declined; not in scope for the pilot
- 🟡 [08-tighten-design-polish.md](08-tighten-design-polish.md) — partial; visual review pending
- 🟡 [11-add-rss-feed.md](11-add-rss-feed.md) — depends on blog; deferred
- 🟡 [15-expand-library-documents.md](15-expand-library-documents.md) — OD/PD/D documents still stubs
- 🟡 [16-add-recommendation-source-text.md](16-add-recommendation-source-text.md) — Recommendation text not yet extracted

## Architecture audit (2026-07-02)

Completed during the audit:

- **SSOT**: central data modules at `.vitepress/data/{site,recommendations,nav}.ts`
- **Types**: `.vitepress/types.ts` with interfaces for every shared concept
- **OCP**: 10 reusable components at `.vitepress/theme/components/`
- **DRY**: 33 inline DRAFT notices replaced with `<DraftCallout />`
- **MECE**: removed redundant '—' separator in About dropdown
- **Encapsulation**: HomePage refactored to compose components, no inline data
- **Performance**: fonts loaded with `font-display: swap`, preload critical weights
- **Dark mode**: hero globe swaps logo variant; nav/sidebar/search theme-aware
