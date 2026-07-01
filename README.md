# OIML SMART Website

[![Build](https://github.com/oimlsmart/oimlsmart.github.io/actions/workflows/build.yml/badge.svg)](https://github.com/oimlsmart/oimlsmart.github.io/actions/workflows/build.yml)

The public website for **[www.oimlsmart.org](https://www.oimlsmart.org)** — the marketing, documentation, and about pages for the **OIML SMART** programme.

Built with [VitePress](https://vitepress.dev/). Patterned after [lutaml.github.io](https://github.com/lutaml/lutaml.github.io) and [primmel.github.io](https://github.com/primmel/primmel.github.io).

## What lives here

This repo contains only the **public, non-logged-in** content of the OIML SMART platform:

- The home page (hero, SMART acronym, feature grid).
- About pages (what is OIML SMART, why, how it works, technology, contact, branding).
- The OIML-CS overview.
- The documentation (architecture, workflow, reference).

It does **not** host the interactive application (the requirements browser, conformance test runner, certification workflow). That lives in the [`smart` application repository](https://github.com/oimlsmart/smart) under `browser/`, and its routes are under `/app/*`. Public deployment of the application-shell content from `/app` is intentionally avoided here — this static site is the front door, not the app.

## Development

```bash
npm install      # install dependencies
npm run dev      # http://localhost:5173
npm run build    # build to .vitepress/dist
npm run preview  # preview the production build
```

## Deployment

`.github/workflows/build.yml` runs `npm run build` on every push to `main`, uploads `.vitepress/dist/` as a GitHub Pages artifact, and deploys it.

`.github/workflows/links.yml` runs the [lychee](https://github.com/lycheeverse/lychee) link checker over the built HTML.

## Technology context

The OIML SMART information model is authored in **[Primmel](https://www.primmel.org/)** — Ribose's successor to MMEL, the Multi-Modal Modelling Language developed jointly by Ribose and BSI for the BSI SMART programme. Primmel was adopted as the basis of OIML SMART and is now released as a public language.

## License

- Content: © Organisation Internationale de Métrologie Légale (OIML).
- Code: © Ribose.
