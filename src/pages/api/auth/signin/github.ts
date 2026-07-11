import type { APIRoute } from 'astro'

// ─────────────────────────────────────────────────────────────────────
// GET /api/auth/signin/github — start the GitHub OAuth flow.
//
// Redirects to github.com/login/oauth/authorize with the client_id
// and a state parameter. GitHub redirects back to /api/auth/callback/github.
// ─────────────────────────────────────────────────────────────────────

export const GET: APIRoute = ({ redirect }) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response('GitHub OAuth not configured', { status: 500 })
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
