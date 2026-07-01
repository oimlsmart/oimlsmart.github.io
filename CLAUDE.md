
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The public website for **[www.oimlsmart.org](https://www.oimlsmart.org)** — the marketing,
about, and documentation pages for the **OIML SMART** programme.

OIML SMART stands for *Standards that are Machine-Actionable, Readable and Transferrable* —
OIML's programme to transform International Recommendations from static PDF documents into
structured, executable digital artifacts.

This repo contains **only the public, non-logged-in** content of the OIML SMART platform.
The interactive application (requirements browser, conformance test runner, certification
workflow, OIML-CS administration) lives in the **separate [`smart` repository](https://github.com/oimlsmart/smart)**
under `browser/`. The application's routes under `/app/*` require authentication and are
**never deployed from here**. This static site is the front door — not the app.

## Build / develop

```bash
npm install      # install dependencies
npm run dev      # http://localhost:5173
npm run build    # output to .vitepress/dist
npm run preview  # preview the production build
```

To check links locally after a build:

```bash
npx lychee --config lychee.toml .vitepress/dist/**/*.html
```

## Information architecture

Top-nav structure (5 sections + Enter App CTA):

```
[SMART logo] OIML SMART    Recommendations   Documents   Developers   OIML-CS   About   [Enter App ↗]
```

### Sections

- `/` — home page (animated SMART globe hero, acronym strip, Recommendations showcase, audience paths).
- `/about/` — programme-level info, with sub-pages: `what-is-smart`, `why-smart`, `how-it-works`, `technology`, `contact`, `branding`. (Branding and Contact live under `/about/` URL-wise but are also exposed in the top-level About dropdown.)
- `/recommendations/` — catalogue of SMART-modelled Recommendations. Per-Recommendation pages (`r60`, `r129`, `r144`) with scope, what's modelled, key tests, links into the app and library.
- `/library/` — normative OIML document library. Includes the source documents for the modelled Recommendations plus B 18, OD/PD, D guides. Document detail pages (`/library/<slug>.html`).
- `/docs/` — developer documentation hub. Five sub-sections in the sidebar:
  - `/docs/guides/` — 13 narrative developer guides.
  - `/docs/arch/` — 9 architecture deep-dive pages.
  - `/docs/workflow/` — 10 certification workflow pages.
  - `/docs/specifications/` — 11 formal SMART_REQS specifications (mirrored from the smart app).
  - `/docs/ref/` — reference material (YAML schema, types, OCL, URN).
- `/docs/ontology/` — ontology browser landing.
- `/docs/urn-specification.html` — top-level URN reference.
- `/oiml-cs` — OIML Certification System overview.

### About section

The user explicitly chose to **keep About sub-pages as separate routes** rather than collapse them into a single page. Do not collapse them. See `TODO.site/01-port-full-docs-content.md` for the per-page status.

## Design system

- **Aesthetic**: Precision Cosmopolitan — editorial serif headlines, precision sans body, warm cream paper, OIML blue/teal/amber accents.
- **Type**: Fraunces (display serif) + IBM Plex Sans (body) + IBM Plex Mono (data). Loaded via Google Fonts in `.vitepress/config.ts` head.
- **Color tokens**: full brand ramp (50–950) plus cream, teal, amber. Defined as CSS variables in `.vitepress/theme/custom.css`. Light mode uses brand-600 (#004996) as the primary accent; dark mode inverts to brand-300 (#89b4ef).
- **Logo**: OIML SMART logo (globe with horizontal transit), copied from `smart/assets/oiml-logo_smart-new-{light,dark}.svg` into `public/smart-logo-{light,dark}.svg` and `public/smart-mark-{light,dark}.svg`. Animated rotation on the home page hero via CSS.
- **Page heroes**: most major pages start with a `<div class="page-hero">` band — eyebrow, h1, lede. See `.vitepress/theme/custom.css` for the styles.

## Architecture

Standard [VitePress](https://vitepress.dev/) project, modelled after
[lutaml.github.io](https://github.com/lutaml/lutaml.github.io) and
[primmel.github.io](https://github.com/primmel/primmel.github.io).

- `.vitepress/config.ts` — site config: nav, sidebar, logo, theme color, search, head (Google Fonts, favicon, manifest), `srcExclude` (keeps `README.md`, `CLAUDE.md`, `TODO.site/*` out of the deployed HTML).
- `.vitepress/data/docs-sidebar.ts` — generated sidebar for the `/docs/*` section. Five top-level sections: Guides / Architecture / Workflow / Specifications / Reference.
- `.vitepress/theme/index.ts` — extends the default VitePress theme and registers `<HomePage />` globally.
- `.vitepress/theme/custom.css` — the design system. Edit here, not per-page.
- `.vitepress/theme/components/HomePage.vue` — the home page (hero, acronym strip, stats, Recommendations showcase, features, audience paths).
- `public/` — brand assets: SMART logos (`smart-logo-*`, `smart-mark-*`), full OIML logo set (`oiml-logo-*`), favicons, manifest.

## Deployment

`.github/workflows/build.yml` runs `npm run build` on every push to `main`, uploads `.vitepress/dist/` as a GitHub Pages artifact, and deploys it to GitHub Pages.

`.github/workflows/links.yml` runs the [lychee](https://github.com/lycheeverse/lychee) link checker over the built HTML.

The site is served from `www.oimlsmart.org`. See
[`TODO.site/07-configure-custom-domain.md`](TODO.site/07-configure-custom-domain.md)
for the DNS / Pages configuration steps.

## Source content for ports

The smart application's content lives in `/Users/mulgogi/src/oimlsmart/smart/`:

- `browser/src/pages/{public,about,docs,guides}/*.vue` — the Vue source for pages. Convert to Markdown by extracting the textual content from the `<template>` block.
- `SMART_REQS/*.md` — already markdown. Mirror into `docs/specifications/`.
- `assets/oiml-logo_smart-*.{svg,png}` — the OIML SMART logos.
- `data/platform/docs/*.yaml` — content data for about / oiml-cs pages.
- `TODO.remaining/20-website.md` — the canonical IA spec (note: user chose to keep About sub-pages separate, NOT collapse as the TODO spec suggests).

## Things future agents trip on

- `package-lock.json` **is** committed (matching the lutaml.github.io pattern). The workflows use `npm ci`, which requires it. Don't gitignore it.
- The `docs/` directory is partially ported from the smart app. Most pages have substantive content but may need polishing. See [`TODO.site/`](TODO.site/) for the per-page status.
- **Never add `/app/*` content here.** This site is the public front door only. Anything that requires authentication, IndexedDB, or the Hono auth server belongs in the `smart` repo's `browser/` app, not here. The build's `srcExclude` keeps `README.md`, `CLAUDE.md`, `TODO.site/*` out of the deployed HTML.
- The home page `<HomePage />` is the only Vue component. If you add a second one, register it in `.vitepress/theme/index.ts` the same way.
- **Inline `<style>` blocks should be avoided** — put shared styles in `.vitepress/theme/custom.css`. One-off inline styles in Markdown (`style="..."`) are OK for things like color swatches on the branding page.
- **Markdown `{{ }}` is interpreted by Vue.** VitePress does NOT auto-escape `{{ }}` outside `<pre>`. Inline backticks (`` `{{ ... }}` ``) are also processed. Either:
  - Wrap in `<span v-pre>{{ ... }}</span>` for inline, or
  - Use `:v-pre` modifier on code fences: ` ```yaml:v-pre `, or
  - Replace `{{ }}` with `${ }` (or other placeholder syntax) if illustrative only.
- **Markdown links use plain URLs** (e.g. `/docs/arch/overview.html`) rather than `[text](./file.md)` form. The `.html` suffix is intentional and matches the deployed URL structure.
- **OCL language alias is not registered with Shiki.** Use ` ```txt ` for OCL snippets, not ` ```ocl ` — otherwise Shiki errors and the build fails.
- **External font loading.** Google Fonts are loaded via `head` in `config.ts`. Don't add `@import url(...)` to `custom.css` — duplicate loading.
- The SMART logo's animated rotation is via CSS in `.vitepress/theme/custom.css` (`.home-globe svg`). `prefers-reduced-motion` users see the static logo.
