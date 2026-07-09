# Astro Migration Plan

Migrate the OIML SMART public site from VitePress to Astro.

## Why

VitePress's Vue SSR hydration model causes persistent console errors
(hydration mismatches), component registration confusion, and font
loading fragility. Astro ships zero JS by default — no hydration
mismatches are possible. Interactive components (dark-mode toggle,
spinning globe) become opt-in islands.

## Scope

- 77 markdown pages → Astro Content Collections
- 14 Vue components → .astro components
- 6 data modules → Astro frontmatter / content collections
- 2 composables → eliminated (useTheme: CSS-only; useAppUrl: build-time env)
- RSS, sitemap, search, dark mode, 404

## What stays

- All written content (markdown body text, frontmatter)
- Brand assets (logos, favicons, spinning-globe JS)
- GHA workflow structure (build → Pages deploy)
- Domain (www.oimlsmart.org), CNAME, robots.txt, noindex meta

## Task index

| # | Task | Status |
|---|---|---|
| 01 | Scaffold Astro project + integrations | pending |
| 02 | Port design system (tokens, base CSS) | pending |
| 03 | Port InternalBanner, PageHero, DraftCallout | pending |
| 04 | Port home page components | pending |
| 05 | Port LoginCard | pending |
| 06 | Port BlogList + blog content collection | pending |
| 07 | Set up docs content collection + sidebar | pending |
| 08 | Migrate all markdown pages | pending |
| 09 | RSS feed via @astrojs/rss | pending |
| 10 | Sitemap via @astrojs/sitemap | pending |
| 11 | Dark mode (CSS-only + toggle) | pending |
| 12 | 404 page | pending |
| 13 | GHA workflow for Astro → Pages | pending |
| 14 | Remove VitePress files | pending |
| 15 | Update CLAUDE.md | pending |

## Key decisions

- **Static output** — no SSR server needed; pure SSG.
- **Content Collections** for blog and docs — type-safe, validated.
- **File-based routing** — `src/pages/**` maps to URLs.
- **Global CSS** for design tokens; scoped `<style>` in .astro files.
- **pagefind** for search (built post-build, indexes static HTML).
- **No Vue/React** — pure .astro components. The only JS is the
  dark-mode toggle and the spinning-globe animation (both tiny
  inline scripts).