import type { APIRoute } from 'astro'

// ─────────────────────────────────────────────────────────────────────
// GET /api/auth/session — returns the current user from the session cookie.
//
// The cookie is a JWT signed with AUTH_SECRET. This endpoint verifies
// it and returns the user JSON, or 401 if no valid session.
// ─────────────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ cookies }) => {
  const jwt = cookies.get('session')?.value
  if (!jwt) {
    return new Response(JSON.stringify(null), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return new Response('Auth not configured', { status: 500 })
  }

  // Verify JWT
  const parts = jwt.split('.')
  if (parts.length !== 3) {
    return new Response(JSON.stringify(null), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const [headerB64, payloadB64, sigB64] = parts
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const sigValid = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(sigB64),
      enc.encode(`${headerB64}.${payloadB64}`),
    )
    if (!sigValid) {
      return new Response(JSON.stringify(null), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)))
    if (payload.exp && Date.now() > payload.exp) {
      return new Response(JSON.stringify(null), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Return user without internal fields
    const user = {
      id: String(payload.id),
      email: payload.email ?? '',
      name: payload.name ?? payload.login,
      role: payload.role,
      avatarUrl: payload.avatar_url,
      labId: payload.labId,
    }

    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify(null), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
