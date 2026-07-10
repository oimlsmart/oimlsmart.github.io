# 13 — Migrate auth flow + server routes

**Status:** pending
**Depends on:** 10 (useAuth composable)

## Why

The browser app has Hono server routes for OAuth (`/api/auth/signin/github`, `/api/auth/callback/github`, `/api/auth/session`, `/api/auth/signout`, `/api/auth/demo`). For the unified Astro deployment, we need server-side rendering (SSR) mode and these routes ported as Astro endpoints.

## What to migrate

From `smart/browser/server/routes/auth.ts`:
- `GET  /api/auth/signin/github` — redirect to GitHub OAuth
- `GET  /api/auth/callback/github` — exchange code, set session cookie
- `GET  /api/auth/session` — current user
- `POST /api/auth/signout` — clear cookie
- `POST /api/auth/demo` — demo login (dev only)

## How

1. Switch Astro to SSR mode (`output: 'server'`) — or hybrid with these specific routes as server endpoints
2. Create `src/pages/api/auth/*.ts` endpoints (Astro's convention)
3. Use Astro's `Astro.cookies` API instead of Hono's
4. Keep the existing GitHub OAuth env vars (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`)
5. Update `/login/` button to point at `/api/auth/signin/github` (relative URL, no more localhost)

## Deployment caveat

SSR requires a server runtime, not static GitHub Pages. Options:
- **Cloudflare Pages with `@astrojs/cloudflare` adapter** — recommended (free tier sufficient)
- **Netlify with `@astrojs/netlify`** — alternative
- **Vercel with `@astrojs/vercel`** — alternative

This migration step changes the deployment target from "pure static" to "edge/serverless". That's a significant operational change.

## Acceptance criteria

- [ ] Astro SSR mode enabled with adapter configured
- [ ] All 5 auth endpoints ported and tested (curl-test in dev)
- [ ] OAuth flow works end-to-end: click "Continue with GitHub" → GitHub auth → cookie set → redirected back logged in
- [ ] `/api/auth/session` returns the logged-in user
- [ ] `/api/auth/signout` clears the session
- [ ] `.env.example` updated with all required vars
