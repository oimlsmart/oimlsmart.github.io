# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The public website for **[www.oimlsmart.org](https://www.oimlsmart.org)** — the public
front door of the whole Primmel SMART / OIML SMART architecture: what the platform is,
what the program is, the component map, the docs federation directory, and the run/demo
entry points. Overview + pointers live here; the deep volumes live in the docs
federation (linked, never duplicated).

Built with **[Astro](https://astro.build/)** — static HTML output, Vue islands where
interactivity is needed (see `TODO.astro/index.md` for the island inventory).

The ladder pages (added in TODO.integration/26) are the spine:

- `/` — hero + the eight words (IS–HAS–DOES) + the ladder + the three live entry points
- `/platform` — the Primmel SMART platform (methodology, twin runtime, SST, certificates)
- `/programs/oiml-smart` — the OIML program (Recommendations, OIML-CS, simulator, classroom)
- `/architecture` — the component map: repos, SSOT flow, live gate numbers
- `/docs/` — the developer quickstart + the docs-federation directory

The production certification app lives in the **private [`smart` repository](https://github.com/oimlsmart/smart)**
under `browser/`. This repo additionally carries an **app-subpath migration in progress**
(`src/pages/app/`, auth/pinia/workflow islands) — state and remaining work are tracked in
`TODO.astro/index.md`; build on that structure, not on stale assumptions.

## Build / develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output to dist/ (+ pagefind index)
npm test         # vitest — includes the SSOT gates below
npm run test:e2e # playwright
```

## The SSOT gates (don't let this site go stale)

- **Facts home:** every claim the site makes about the live platform (gate numbers,
  repo list, program list, federation links) lives in `src/data/platform-facts.ts`.
  Pages render from it — never re-type a number into prose.
- **Freshness gate:** `src/platform-freshness.test.ts` parses
  `smart/docs/architecture/for-agents.md` (sibling checkout or `SMART_REPO`) and fails
  when a pinned claim drifts. No SSOT checkout ⇒ the gate fails loudly.
- **Diagram pipeline:** `scripts/sync-diagrams.mjs` copies the shared SVG set from the
  smart repo into `public/diagrams/shared/`; `--check` proves byte-identity
  (`src/diagram-sync.test.ts`). The smart repo is the only diagram home — never redraw.
- **CI:** `.github/workflows/gates.yml` runs both gates when repo variable
  `SMART_REPO_AVAILABLE=true` + secret `SMART_REPO_PAT` are configured (the smart repo
  is private; until then the gates run locally wherever both repos are checked out).

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
| `/platform` | `src/pages/platform.astro` |
| `/architecture` | `src/pages/architecture.astro` |
| `/programs/oiml-smart` | `src/pages/programs/oiml-smart.astro` |
| `/audiences`, `/technologies`, `/use-cases`, `/services` | `src/pages/<section>/index.astro` (TODO.promotion sections) |
| `/app/*` | `src/pages/app/` (migration in progress — `TODO.astro/`) |
| `/oiml-cs` | `src/pages/oiml-cs.astro` |
| `/404` | `src/pages/404.astro` |
| `/docs/` | `src/pages/docs/index.astro` |
| `/docs/[...slug]` | `src/pages/docs/[...slug].astro` (catch-all) |
| `/news/`, `/blog/[...slug]` | `src/pages/news/`, content `blog` collection |
| `/about/[...slug]` | `src/pages/about/[...slug].astro` |
| `/recommendations/[...slug]` | `src/pages/recommendations/[...slug].astro` |
| `/library/[...slug]` | `src/pages/library/[...slug].astro` |
| `/ontology/*`, `/vocabularies/*` | `src/pages/ontology/`, `src/pages/vocabularies/` |
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

- **No VitePress.** The site was migrated from VitePress to Astro. Don't add `.vitepress/` config.
- **Vue islands are real.** `ThemeToggle`, `MobileNav`, `NavDropdown`, `SearchBox` (public) plus the
  app-subpath workflow islands are Vue SFCs hydrated with `client:*` directives — see
  `TODO.astro/index.md` for the authoritative inventory. The rest is `.astro`.
- **Nav is data.** `src/data/nav-config.ts` is the single nav source for desktop + mobile;
  a contract test (`nav-config.contract.test.ts`) proves every link resolves and no href repeats.
- **Dark mode** is handled by an inline `<script>` in `Base.astro` — not by a composable or component lifecycle.
- **`APP_URL`** is read via `import.meta.env.APP_URL` (Vite statically replaces it at build time).
- **Content Collections** — adding a new page means adding a `.md`/`.mdx` file under `src/content/` with the right frontmatter schema. The routing page automatically picks it up.
- **Docs sidebar** is generated from the `docs` content collection at build time — no manual sidebar config.
- **OCL code blocks** — use ` ```txt ` not ` ```ocl ` (Shiki doesn't have an OCL grammar).
- **`package-lock.json`** IS committed. The GHA workflow uses `npm ci`.
- **DRAFT / pilot** notices are everywhere. The site is internal-only. All content is draft.
- **Platform claims** go in `src/data/platform-facts.ts` (pinned by the freshness gate) —
  never hardcode gate numbers or repo lists into a page.