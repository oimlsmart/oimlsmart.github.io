# Mirror generated type definitions

**Status**: stub only.

## Goal

Publish the generated TypeScript types as a reference on `/docs/ref/type-definitions.html`. Currently that page is a placeholder pointing to the smart app's `browser/src/data/generated/`.

## Source

- `/Users/mulgogi/src/oimlsmart/smart/browser/src/data/generated/` — generated types.

## Approach

Either:

- **Option A**: Mirror the generated `.d.ts` files into the site as code blocks, refreshed by a CI job.
- **Option B**: Use [TypeDoc](https://typedoc.org/) to generate HTML API docs and host them as a subsite (e.g. `/api/`).

Option B is the better long-term choice if/when the application opens its public API.
