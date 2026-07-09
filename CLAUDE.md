# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The public website for **[www.oimlsmart.org](https://www.oimlsmart.org)** — the marketing,
about, and documentation pages for the **OIML SMART** pilot programme.

Built with **[Astro](https://astro.build/)** — static HTML output, zero client-side JS
by default. The only inline scripts are the dark-mode toggle and the globe animation.

This repo contains **only the public, non-logged-in** content. The interactive application
lives in the **separate [`smart` repository](https://github.com/oimlsmart/smart)** under
`browser/`. The application's routes under `/app/*` require authentication and are
**never deployed from here**.

## Build / develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to dist/
npm run preview  # preview the production build
```

## Architecture

### Static Site Generator

[Astro v7](https://astro.build/) with Content Collections.

- `astro.config.mjs` — site config, sitemap integration, Shiki markdown highlighting.
- `src/layouts/Base.astro` — the global layout (nav, footer, dark-mode script, font loading).
- `src/layouts/DocsPage.astro` — docs pages with sidebar + prev/next navigation.
- `src/layouts/MarkdownPage.astro` — generic markdown page wrapper (unused by current routes).

### Content Collections

Content lives in `src/content/`, managed by `src/content.config.ts`:

| Collection | Location | Schema |
|---|---|---|
| `blog` | `src/content/blog/*.md` | title, date, author, summary, draft |
| `docs` | `src/content/docs/**/*.md` | title, description, eyebrow, shortTitle, sidebar |
| `pages` | `src/content/pages/**/*.md` | title, description, eyebrow |

Adding a new docs page = adding a `.md` file under `src/content/docs/{section}/`. The sidebar
auto-generates from the collection.

### Routing

File-based routing in `src/pages/`:

| Route | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/app/` | `src/pages/app.astro` |
| `/oiml-cs` | `src/pages/oiml-cs.astro` |
| `/404` | `src/pages/404.astro` |
| `/docs/` | `src/pages/docs/index.astro` |
| `/docs/[...slug]` | `src/pages/docs/[...slug].astro` (catch-all) |
| `/blog/` | `src/pages/blog/index.astro` |
| `/blog/[...slug]` | `src/pages/blog/[...slug].astro` |
| `/about/[...slug]` | `src/pages/about/[...slug].astro` |
| `/recommendations/[...slug]` | `src/pages/recommendations/[...slug].astro` |
| `/library/[...slug]` | `src/pages/library/[...slug].astro` |
| `/feed.xml` | `src/pages/feed.xml.js` (RSS) |

### Components

All components are in `src/components/`:

- `InternalBanner.astro` — persistent DRAFT/pilot notice at the top of every page.
- `PageHero.astro` — hero band with eyebrow, title, lede.
- `DraftCallout.astro` — DRAFT notice (auto-detects variant from URL path).
- `DocsSidebar.astro` — filesystem-derived sidebar for docs section.

### Design System

CSS files in `src/styles/`:

- `tokens.css` — CSS variables (brand colors, semantic tokens, fonts).
- `base.css` — typography (headings, body, code, links).
- `overrides.css` — no longer needed (was for VitePress component overrides).
- `utilities.css` — button styles, swatch grid, logo grid, doc table.
- `global.css` — entry point that imports all of the above + site nav/footer styles.

### Data

- `src/data/site-meta.ts` — site URL, title, description, lang, feed metadata.

### Fonts

Font URL is hardcoded in `src/layouts/Base.astro` frontmatter. The full set:
Fraunces (opsz 9..144, weights 300-700), IBM Plex Sans/Mono, Source Serif 4.

## Deployment

`.github/workflows/build.yml` runs `npx astro build` on push to `main`,
uploads `dist/` as a GitHub Pages artifact, and deploys.

`.github/workflows/links.yml` runs the lychee link checker.

`public/CNAME` contains `www.oimlsmart.org`. `public/robots.txt` blocks crawlers.

## Things future agents trip on

- **No VitePress.** The site was migrated from VitePress to Astro. Don't add `.vitepress/` config or Vue SFC patterns.
- **No Vue.** All components are `.astro` files. No `<script setup>`, no Vue composables, no hydration.
- **Dark mode** is handled by an inline `<script>` in `Base.astro` — not by a composable or component lifecycle.
- **`APP_URL`** is read via `import.meta.env.APP_URL` in `app.astro` (Vite statically replaces it at build time).
- **Content Collections** — adding a new page means adding a `.md` file under `src/content/` with the right frontmatter schema. The routing page automatically picks it up.
- **Docs sidebar** is generated from the `docs` content collection at build time — no manual sidebar config.
- **OCL code blocks** — use ` ```txt ` not ` ```ocl ` (Shiki doesn't have an OCL grammar).
- **`package-lock.json`** IS committed. The GHA workflow uses `npm ci`.
- **DRAFT / pilot** notices are everywhere. The site is internal-only. All content is draft.