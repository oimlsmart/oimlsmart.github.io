# Port full docs content from the smart app

**Status**: stubs only. Content needs to be ported from the Vue source files.

## Source files

The smart application's documentation lives in `/Users/mulgogi/src/oimlsmart/smart/browser/src/pages/docs/`. Each Vue file contains substantial body copy (paragraphs, tables, code samples, diagrams) that has not yet been mirrored here.

## Pages needing fuller content

### Architecture (`/docs/arch/`)

- `overview.md` — ported, but the original has more detail on data flow and file organization. Expand.
- `design-principles.md` — ported, but the original has more examples per principle.
- `standards.md` — first-pass summary. Original lists each Recommendation's status.
- `requirements-tests.md` — first-pass summary. Original has detailed field-by-field breakdown.
- `forms.md` — first-pass summary. Original has detailed field kinds and lifecycle.
- `instances-evaluation.md` — first-pass summary.
- `computation-engine.md` — first-pass summary. Original has worked examples.
- `expression-language.md` — first-pass summary. Original has fuller AsciiMath reference.
- `tables-lookups.md` — first-pass summary. Original has multiple worked examples per table kind.

### Workflow (`/docs/workflow/`)

- `overview.md` — ported. Original has more detail per step.
- `instrument-model.md` — first-pass summary.
- `dimension-schemas.md` — first-pass summary.
- `application.md` — first-pass summary.
- `test-commissioning.md` — first-pass summary.
- `test-report.md` — first-pass summary.
- `form-data-binding.md` — first-pass summary.
- `evaluation-certificate.md` — first-pass summary.
- `state-machines.md` — first-pass summary.
- `adding-a-standard.md` — first-pass summary.

### Reference (`/docs/ref/`)

- `ocl-reference.md` — first-pass summary. Original has a fuller syntax table.
- `urn-specification.md` — first-pass summary.

## How to port

For each page:

1. Open the corresponding `.vue` file under `smart/browser/src/pages/docs/<section>/<slug>.vue`.
2. Read the `<template>` block — extract the textual content (paragraphs, headings, lists).
3. Translate the Tailwind-styled HTML into Markdown.
4. Drop interactive SVGs and replace with prose descriptions where appropriate (or port the SVGs into static images under `public/`).
5. Preserve any code blocks verbatim — they are critical.
6. Verify links resolve (use `npm run build && npx lychee .vitepress/dist/**/*.html`).

## Acceptance

- Each page reads as standalone, useful documentation.
- No "stub" warnings remain.
- All internal links resolve.
- Lychee passes.
