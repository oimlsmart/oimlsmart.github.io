# 34 — Auth SSR with Cloudflare adapter + KV for role mappings

**Status:** implementation in progress
**Depends on:** TODO 10 (useAuth), TODO 14 (app shell)
**Replaces:** TODO 13 (original auth SSR plan)

## Architecture

```
Cloudflare Worker (Astro SSR)
├── src/pages/api/auth/signin/github.ts   → redirect to GitHub OAuth
├── src/pages/api/auth/callback/github.ts → exchange code, set cookie
├── src/pages/api/auth/session.ts         → read cookie → user JSON
├── src/pages/api/auth/signout.ts         → clear cookie
└── KV namespace "USER_ROLES"
    ├── user:alice → { role: "ia-staff" }
    ├── user:bob   → { role: "lab-staff", labId: "lab-a" }
    └── user:admin → { role: "admin" }
```

## What changes

- `astro.config.mjs`: `output: 'hybrid'` + `adapter: cloudflare()`
- Static pages unchanged (Astro hybrid = static by default)
- API routes automatically server-rendered
- Cookie-based session (HMAC-signed JWT in HTTP-only cookie)
- KV for role lookups (no separate database)

## Environment variables (Cloudflare secrets)

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `AUTH_SECRET` (JWT signing key)

## KV setup

```sh
npx wrangler kv namespace create USER_ROLES
# Add the ID to wrangler.toml
```

Seed a test user:
```sh
npx wrangler kv key put --binding=USER_ROLES user:alice '{"role":"ia-staff"}'
```
