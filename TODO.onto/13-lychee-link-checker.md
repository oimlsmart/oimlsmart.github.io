# 13 — Lychee link checker (already wired — verify + run)

## Context
A link checker job **already exists** at `.github/workflows/links.yml`. It uses `lycheeverse/lychee-action@v2` against `dist/**/*.html` with config from `lychee.toml`. Lychee is already installed locally at `/opt/homebrew/bin/lychee` (v0.24.2).

The task is to **run it locally** to ensure the job will pass on GHA, and fix any broken links found.

## Existing setup

### `.github/workflows/links.yml`
- Triggers: push to main, PRs, manual dispatch
- Builds the site via `npm ci` + `npm run build`
- Restores lychee cache from `.lycheecache`
- Runs `lychee-action@v2` against `dist/**/*.html` with `lychee.toml` config
- Uploads `link-check-results.md` as an artifact
- Comments on PR if link check fails (currently `fail: false`, so action won't fail the build)

### `lychee.toml`
- Accepts 100..308 status codes (redirects OK)
- Excludes `localhost`, `127.0.0.1`, `https://www.oiml.org` (the last has aggressive redirect chain)
- 20s timeout, 16 concurrent threads, 2 retries
- Caches results, 1-day max cache age

## Local verification

Run lychee against the freshly built `dist/`:

```bash
npm run build
lychee \
  --verbose \
  --no-progress \
  --config lychee.toml \
  --root-dir "$PWD/dist" \
  'dist/**/*.html'
```

## Expected broken-link categories

1. **External OIML/w3id.org URLs** — slow or temporary failures, will likely pass on retry
2. **Old `/ontologies/*.ttl` paths** — these TTLs were moved to `ontologies/` (repo root). If any HTML still links to `/ontologies/*.ttl`, it'll 404. **Must fix**.
3. **`urn:` URIs** in entity descriptions — lychee doesn't check these by default; verify config excludes them
4. **Anchor links** within markdown content — may be invalid if heading slugs changed

## Deliverables

1. Run lychee locally — capture output
2. Fix any internal broken links (the `/ontologies/*.ttl` ones are most likely)
3. Update `lychee.toml` if needed to exclude legitimate patterns
4. Confirm the GHA job is correctly configured to upload results + comment on PRs
5. Consider changing `fail: false` to `fail: true` once link check is green (so future regressions are caught)

## Acceptance
- `lychee` exits with code 0 (or only fails on external links that are excluded by config)
- No internal `/ontologies/*.ttl` link 404s
- The GHA workflow file is valid and will produce a `link-check-results.md` artifact
- Document any external links that consistently fail so they can be added to `exclude` in `lychee.toml`
