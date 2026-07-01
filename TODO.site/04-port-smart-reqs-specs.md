# Mirror SMART_REQS specification documents

**Status**: index only. The 10 specification documents themselves are not yet mirrored.

## Goal

Mirror each of the 10 SMART_REQS documents as a page under `/docs/ref/smart-reqs/<n>-<slug>.html`.

## Source

- `/Users/mulgogi/src/oimlsmart/smart/SMART_REQS/` — the canonical specification sources.

## Approach

Each document is markdown already. Mirror them into `docs/ref/smart-reqs/` with consistent frontmatter, fix any relative links, and update the index page (`docs/ref/smart-reqs-index.md`) to point at each one.

If the documents are revised in the smart app, automate mirroring via CI to keep this site in sync.

## Acceptance

- All 10 documents are readable on the public site.
- Cross-links between documents work.
- Lychee passes.
