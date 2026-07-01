---
title: Enter the OIML SMART app
---

<script setup>
const appUrl = (typeof window !== 'undefined')
  ? (window.__APP_URL__ || 'http://localhost:5190')
  : 'http://localhost:5190'
const oauthUrl = `${appUrl}/api/auth/signin/github`
const demoUrl = `${appUrl}/app/login`
const oauthClientId = 'Ov23li14hMhdjgtfWKBA'
</script>

<div class="page-hero">
  <span class="eyebrow">Pilot application · DRAFT</span>
  <h1>Enter the OIML SMART app</h1>
  <p class="lede">
    The OIML SMART application runs locally as part of the pilot programme.
    Sign in below to access the interactive interface for browsing
    Recommendations, running conformance tests, and issuing certificates.
  </p>
</div>


<div class="callout draft-notice">
<strong>DRAFT — Pilot programme</strong>
<p>
The application is part of the OIML SMART pilot and is intended for
internal use. Authentication is handled by the application's own server.
</p>
</div>

## How sign-in works

The OIML SMART app handles authentication on its own server. Clicking
**Sign in with GitHub** below will:

1. Redirect your browser to the application's sign-in endpoint.
2. The application initiates a GitHub OAuth flow with redirect_uri pointing back to its own callback.
3. After GitHub authenticates, the app exchanges the code for an access token and starts a session.
4. The app loads at `${appUrl}/app/login` and you can begin work.

For local development, the app runs at **`${appUrl}`**. In production,
the canonical URL is `https://app.oimlsmart.org`.

### OAuth app

The OAuth flow uses a registered GitHub OAuth App:

| Field | Value |
| --- | --- |
| Client ID | `{{ oauthClientId }} |
| Authorization endpoint | `https://github.com/login/oauth/authorize` |
| Token endpoint | `https://github.com/login/oauth/access_token` |
| Requested scopes | `read:user user:email` |
| Redirect URI (dev) | `http://localhost:5190/api/auth/callback/github` |

The redirect URI is derived from the request origin by the application's
Hono server (`getForwardedOrigin`). For production, the URI becomes
`https://app.oimlsmart.org/api/auth/callback/github`. The GitHub OAuth
App must allow both — configure it at
[github.com/settings/developers](https://github.com/settings/developers).

## Sign in

<div class="signin-grid">
  <a class="signin-card primary" :href="oauthUrl">
    <div class="signin-icon">↗</div>
    <div>
      <h3>Sign in with GitHub</h3>
      <p>OAuth flow — authenticates via GitHub OAuth and returns you to the app with a signed-in session.</p>
      <span class="card-meta">OAuth App · {{ oauthClientId }}</span>
    </div>
  </a>
  <a class="signin-card" :href="demoUrl">
    <div class="signin-icon">⌂</div>
    <div>
      <h3>Demo accounts</h3>
      <p>Open the login page to choose from pre-configured demo accounts (admin, IA, TL, viewer, developer).</p>
      <span class="card-meta">No OAuth required</span>
    </div>
  </a>
</div>

## Demo accounts

The application's login page exposes the following demo accounts for
exploring the pilot:

| Email | Role | Password |
| --- | --- | --- |
| `admin@oiml.org` | Admin | `demo2026` |
| `ia@oiml.org` | Issuing Authority | `demo2026` |
| `tl@oiml.org` | Test Laboratory | `demo2026` |
| `viewer@oiml.org` | Viewer | `demo2026` |
| `developer@ribose.com` | Developer / Admin | `demo2026` |

These accounts live in the application's SQLite database and are seeded
by `npm run reset-db`. They are demo users with no access outside the
local development server.

## Configuration

For other deployments, rebuild this site with the `APP_URL` environment
variable set:

```bash
APP_URL=https://app.staging.oimlsmart.org npm run build
```

The site's `window.__APP_URL__` global is set at build time from this
variable. The default is `http://localhost:5190` for local development.

To change the OAuth client, edit the value in `app/index.md`. The
client secret stays on the application server (`GITHUB_CLIENT_SECRET`
env var in `smart/browser/`).

## What lives where

| Concern | Lives in | URL |
| --- | --- | --- |
| Public content (this site) | `oimlsmart.github.io` | `www.oimlsmart.org` |
| Application (interactive) | `oiml-smart/browser` | `localhost:5190` (dev) / `app.oimlsmart.org` (prod) |
| Authentication | The app's Hono server | `/api/auth/*` |
| OAuth app config | GitHub developer settings | `Ov23li14hMhdjgtfWKBA` |
| Source documents | `oiml-smart/SMART_REQS/` | mirrored to `/docs/specifications/` |
| Recommendations data | `oiml-smart/data/oiml-r{60,129,144}/` | loaded by the app at runtime |

The two deployments are independent: this site is pure static content; the
app is a Vue SPA + Hono API.

<style scoped>
.signin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 2rem 0;
}

@media (min-width: 720px) {
  .signin-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.signin-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.signin-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -12px rgba(10, 22, 40, 0.18);
}

.signin-card.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.signin-card.primary:hover {
  background: var(--vp-c-brand-3);
  border-color: var(--vp-c-brand-3);
}

.signin-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 1.25rem;
  opacity: 0.7;
}

.signin-card h3 {
  font-family: var(--vp-font-family-serif);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.25rem;
  color: inherit;
}

.signin-card p {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 0.75rem;
  opacity: 0.85;
}

.card-meta {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.signin-card:not(.primary) .card-meta {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.875rem;
}

table th, table td {
  text-align: left;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

table th {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

table code {
  font-size: 0.8125rem;
}
</style>