# 17 — Production deployment cutover

**Status:** pending
**Depends on:** 13 (SSR/auth), 16 (routing)

## Why

Once the app is unified under Astro, deployment target must change from "static GitHub Pages" to "edge/serverless with SSR support". The current Pages deploy won't work for the new architecture.

## What to do

### 1. Choose adapter

**Recommended: `@astrojs/cloudflare`** (Cloudflare Pages + Workers)

Rationale:
- Free tier is generous (100K requests/day on Workers)
- Closest to the existing GitHub Pages simplicity
- Edge SSR = fast globally
- Easy OAuth secret management via Cloudflare dashboard

Alternative: `@astrojs/netlify` (similar properties, slightly different pricing).

### 2. Configure adapter in `astro.config.mjs`

```js
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'hybrid',  // or 'server' if everything needs SSR
  adapter: cloudflare(),
  // ...
})
```

### 3. Set environment secrets

In Cloudflare dashboard:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `AUTH_SECRET`

Or via wrangler:
```sh
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put AUTH_SECRET
```

### 4. Update GitHub OAuth app

Callback URL becomes:
```
https://www.oimlsmart.org/api/auth/callback/github
```

(Same-origin — no more cross-origin callback to localhost.)

### 5. DNS cutover

The current `www.oimlsmart.org` points at GitHub Pages. Switch to Cloudflare Pages:
- Add `www` CNAME to the Pages deployment URL
- Or use Cloudflare's custom domain feature

### 6. CI workflow update

Replace `.github/workflows/deploy-astro-to-pages.yml` (or similar) with:
```yaml
- name: Deploy to Cloudflare Pages
  run: npx wrangler pages deploy ./dist --project-name oimlsmart
```

### 7. Local dev: simplify

The "user must run local server" workflow disappears. Local dev becomes:
```sh
npm run dev
```
→ visit `http://localhost:4321/app/`

OAuth callbacks during dev use Cloudflare's `wrangler dev` or a dev OAuth app on a different port.

## Acceptance criteria

- [ ] Cloudflare Pages project created
- [ ] Adapter configured; build succeeds
- [ ] Secrets set
- [ ] DNS cutover complete (www → Cloudflare)
- [ ] GitHub OAuth callback updated
- [ ] End-to-end test: visit `www.oimlsmart.org/login/` → auth → redirect to `/app/` → workflow works
- [ ] Old GitHub Pages site redirects to new Cloudflare deployment (or is decommissioned)
- [ ] Local dev still works via `npm run dev`

## Rollback plan

If something breaks post-cutover:
- Cloudflare Pages shows last-known-good deploy; one-click rollback
- DNS TTL was set low (300s) before cutover, so reverting DNS is fast
- The smart/browser/ repo still works standalone as a fallback
