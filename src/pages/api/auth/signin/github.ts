import type { APIRoute } from 'astro'

// ─────────────────────────────────────────────────────────────────────
// GET /api/auth/signin/github — start the GitHub OAuth flow.
//
// In Cloudflare-deploy mode: redirects to github.com/login/oauth/authorize
// with the client_id and a state parameter. GitHub redirects back to
// /api/auth/callback/github.
//
// In static mode: GitHub OAuth can't be brokered (no server runtime, no
// env vars), so we return an honest HTML explanation page. The static
// build emits this page as a normal browsable file — not a mystery
// download — so visitors landing here directly understand the situation.
// ─────────────────────────────────────────────────────────────────────

const UNCONFIGURED_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign-in unavailable · OIML SMART</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1.5rem;color:#1a1a1a}
  h1{font-size:1.5rem;margin:0 0 1rem}
  a{color:#004996}
  code{background:#f3f0e8;padding:1px 5px;border-radius:2px;font-size:0.875rem}
</style>
</head>
<body>
<h1>GitHub sign-in isn’t available on the public site.</h1>
<p>OIML SMART is operating as a closed pilot. Authentication is brokered by the <strong>local SMART application</strong>, not by www.oimlsmart.org.</p>
<p>To sign in, run the app locally. From a clone of the <code>smart</code> repository:</p>
<pre><code>bin/dev</code></pre>
<p>The local server listens at <a href="/app/">www.oimlsmart.org/app</a>. The login button on <a href="/login/">/login/</a> opens it directly when the server is running.</p>
</body>
</html>`

export const GET: APIRoute = ({ redirect }) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response(UNCONFIGURED_HTML, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const state = crypto.randomUUID()
  const ghUrl = new URL('https://github.com/login/oauth/authorize')
  ghUrl.searchParams.set('client_id', clientId)
  ghUrl.searchParams.set('state', state)
  ghUrl.searchParams.set('scope', 'read:user user:email')

  // Store state in a short-lived cookie for CSRF protection
  const res = redirect(ghUrl.toString(), 302)
  res.headers.set(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  )
  return res
}
