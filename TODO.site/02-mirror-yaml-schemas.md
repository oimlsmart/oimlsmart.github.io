# Mirror YAML schemas

**Status**: stub only. The `data/schemas/` directory in the smart app is the canonical source.

## Goal

Make the JSON Schemas for `rc.yaml`, `cc.yaml`, `form.yaml`, `standard.yaml`, and `dimensions.yaml` available as both:

1. Downloadable files from this site (e.g. `/schemas/rc.schema.json`).
2. Inline reference documentation on `/docs/ref/yaml-schema.html` — each top-level field explained with examples.

## Source

- `/Users/mulgogi/src/oimlsmart/smart/data/schemas/` — the canonical schemas.
- `/Users/mulgogi/src/oimlsmart/smart/browser/src/data/generated/` — the TypeScript types generated from those schemas.

## Approach

- Copy the JSON Schemas into `public/schemas/` so they're downloadable.
- Generate human-readable schema docs (use `@json-schema-tools/docs` or similar) into `/docs/ref/yaml-schema/<file>.md`.
- Cross-link from the [Adding a Standard](/docs/workflow/adding-a-standard.html) guide.

## Automation

Consider a GitHub Action that mirrors schemas on every smart-app release tag, so this site stays in sync.
