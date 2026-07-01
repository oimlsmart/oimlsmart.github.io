# Verify links

**Status**: pending.

## Goal

Run the lychee link checker locally and resolve any broken links before going live.

## How

```bash
npm run build
npx lychee --config lychee.toml .vitepress/dist/**/*.html
```

Or trigger the GitHub Action manually via `workflow_dispatch` on the Links workflow.

## Common issues to watch

- External links to `www.oiml.org` documents — the OIML site sometimes changes URLs.
- Cross-page links using `.html` suffix — VitePress should handle this but verify.
- Anchor links to headings inside docs pages.
- Links to the smart app repository — make sure the org name (`oimlsmart`) is correct.

## Acceptance

- `links.yml` workflow passes on main.
- No broken links in the built HTML.
