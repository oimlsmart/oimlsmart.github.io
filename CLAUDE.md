# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The public website for **[www.oimlsmart.org](https://www.oimlsmart.org)** — the marketing, about, and documentation pages for the **OIML SMART** pilot programme.

This repo contains **only the public, non-logged-in** content. The interactive application lives in the **separate [`smart` repository](https://github.com/oimlsmart/smart)** under `browser/`. The application's routes under `/app/*` require authentication and are **never deployed from here**. This static site is the front door — not the app.

## Build / develop

```bash
npm install      # install dependencies
npm run dev      # http://localhost:5173
npm run build    # output to .vitepress/dist
npm run preview  # preview the production build
npm test         # run vitest unit tests
```

## Architecture

### Data layer (`.vitepress/data/`)

All site content lives in typed TypeScript modules. Components import these; they never inline data.

| Module | Purpose |
|---|---|
| `site-meta.ts` | `SITE` constant (url, title, description, lang, feedTitle, feedDescription) — single source of truth consumed by `config.ts` and `rss.ts` |
| `site.ts` | Content data: `acronym`, `pilotStats`, `platformFeatures`, `audiencePaths`, `draftNotice` |
| `nav.ts` | Top-level nav items |
| `recommendations.ts` | R 60/R 129/R 144 metadata + `findRecommendation` helper |
| `fonts.ts` | `FONT_URL` builder (typed, single source for Google Fonts URL) |
| `docs-sidebar.ts` | Filesystem-derived sidebar generator (reads `docs/{section}/*.md` at config time using `js-yaml`) |

### Type definitions (`.vitepress/types.ts`)

9 TypeScript interfaces covering every shared concept: `AcronymItem`, `Stat`, `Feature`, `AudiencePath`, `Recommendation`, `RecommendationStats`, `LibraryDocument`, `NavItem`, `DraftNotice`.

### Theme (`.vitepress/theme/`)

**Entry**: `index.ts` — extends DefaultTheme, registers 4 globally-available components for markdown use (`PageHero`, `DraftCallout`, `LoginCard`, `BlogList`). All other components are imported explicitly by their parent `.vue` files.

**Styles**: `custom.css` is a 20-line pointer to `styles/index.css` which imports `tokens.css` (CSS variables), `base.css` (typography), `overrides.css` (VitePress component overrides), and `utilities.css` (steps, swatch-grid, logo-grid, doc-table, buttons, utilities).

**Composables**: `composables/useTheme.ts` (reactive dark-mode detection), `composables/useAppUrl.ts` (reads `import.meta.env.APP_URL` — Vite statically injects at build time).

**Components**: 14 Vue SFCs. Markdown-consumed (globally registered): `PageHero` (reads frontmatter `title`/`description`/`eyebrow`), `DraftCallout` (auto-detects variant from URL), `LoginCard`, `BlogList`. Composition components (locally imported): `HomePage`, `HomeHero`, `HomeSection`, `AcronymStrip`, `StatRow`, `FeatureGrid`, `AudienceGrid`, `RecCard`, `InternalBanner`.

### Build-time (`.vitepress/rss.ts`)

RSS 2.0 feed generator. Called via `buildEnd` in `config.ts`. Consumes `blog/posts.ts` (canonical post transform) and `data/site-meta.ts` (SITE constant).

### Blog (`blog/`)

`posts.ts` — pure `transformPosts` function (typed, tested). `posts.data.ts` — VitePress data loader (delegates to `posts.ts`). Blog posts are `*.md` files with frontmatter `title`/`date`/`author`/`summary`.

### Markdown conventions

Every page with a hero uses frontmatter:
```yaml
---
title: Page Title
description: Short description (becomes PageHero lede + meta description)
eyebrow: Section · Number
---
```

Then in the body:
```markdown
<PageHero />
<DraftCallout />
```

No props needed — `PageHero` reads frontmatter; `DraftCallout` auto-detects variant from the page URL. Adding a new page = add frontmatter + `<PageHero />` + content.

### Tests (`tests/`)

Vitest unit tests for pure functions: `transformPosts`, `FONT_URL`, `recommendations`. Run with `npm test`.

## Deployment

`.github/workflows/build.yml` runs `npm run build` on push to `main`, uploads `.vitepress/dist/` as a GitHub Pages artifact, and deploys it. `.github/workflows/links.yml` runs the lychee link checker.

`public/CNAME` contains `www.oimlsmart.org`. `public/robots.txt` blocks all crawlers (`noindex, nofollow` meta tag also on every page).

## Things future agents trip on

- `package-lock.json` **is** committed. The workflows use `npm ci`, which requires it.
- **Never add `/app/*` content here.** This site is the public front door only.
- **Markdown `{{ }}` is interpreted by Vue.** Use `${ }` placeholder syntax in YAML code blocks, or `:v-pre` fence modifier.
- **OCL language alias is not registered with Shiki.** Use ` ```txt ` for OCL snippets.
- **Font URL** is built in `data/fonts.ts` and consumed via `config.ts` `<link>`. No `@import` in CSS.
- **APP_URL** is read via `composables/useAppUrl.ts` (Vite statically injects `import.meta.env.APP_URL`). No `window.__APP_URL__` global.
- **`DraftCallout` variant** is auto-detected from the page URL. `/docs/specifications/*` gets `specs`, `/blog/*` gets `compact`, everything else gets `default`. Override via `<DraftCallout variant="..." />` prop if needed.
- **`docs-sidebar.ts`** reads the filesystem at config time. Adding a new page = adding a `.md` file under `docs/{section}/`. No manual sidebar edit needed.