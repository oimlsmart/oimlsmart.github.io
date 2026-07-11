import type { APIRoute } from 'astro'

// ─────────────────────────────────────────────────────────────────────
// GET /api/auth/callback/github — GitHub redirects here after user auth.
//
// Exchanges the code for an access_token, fetches the user profile,
// looks up the OIML role from KV, and sets a session cookie.
// ─────────────────────────────────────────────────────────────────────

interface CloudflareLocals {
  runtime?: {
    env?: {
      USER_ROLES?: KVNamespace
    }
  }
}

interface UserProfile {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

interface SessionPayload {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  role: string
  labId: string | null
}

async function signJWT(secret: string, payload: SessionPayload): Promise<string> {
  const enc = new TextEncoder()
  const header = { alg: 'HS256', typ: 'JWT' }
  const data = `${base64url(enc.encode(JSON.stringify(header)))}.${base64url(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })))}`
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
  return `${data}.${base64url(sig)}`
}

function base64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const GET: APIRoute = async ({ url, cookies, redirect, locals }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return new Response('Missing code or state', { status: 400 })

  // Verify state cookie
  const stateCookie = cookies.get('oauth_state')?.value
  if (!stateCookie || stateCookie !== state) {
    return new Response('State mismatch', { status: 400 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const authSecret = process.env.AUTH_SECRET
  if (!clientId || !clientSecret || !authSecret) {
    return new Response('OAuth not configured', { status: 500 })
  }

  // Exchange code for token
  const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const tokenData = await tokenResp.json() as { access_token?: string; error?: string }
  if (tokenData.error || !tokenData.access_token) {
    return new Response(`OAuth error: ${tokenData.error}`, { status: 400 })
  }

  // Fetch user profile
  const userResp = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
  })
  const ghUser = await userResp.json() as UserProfile

  // Look up role from KV
  let role = 'viewer'
  let labId: string | null = null
  const cfLocals = locals as CloudflareLocals
  const kv = cfLocals.runtime?.env?.USER_ROLES
  if (kv) {
    const roleJson = await kv.get(`user:${ghUser.login}`)
    if (roleJson) {
      const roleData = JSON.parse(roleJson) as { role?: string; labId?: string }
      role = roleData.role ?? 'viewer'
      labId = roleData.labId ?? null
    }
  }

  // Create session JWT
  const session: SessionPayload = {
    id: ghUser.id,
    login: ghUser.login,
    name: ghUser.name,
    email: ghUser.email,
    avatar_url: ghUser.avatar_url,
    role,
    labId,
  }
  const jwt = await signJWT(authSecret, session)

  // Set cookie + redirect to app
  cookies.set('session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  // Clear state cookie
  cookies.delete('oauth_state', { path: '/' })

  return redirect('/app/', 302)
}
