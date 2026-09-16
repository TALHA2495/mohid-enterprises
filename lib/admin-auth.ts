// ============================================================================
// ADMIN SESSION HELPERS — used by proxy.ts, the login route, and server actions
// ----------------------------------------------------------------------------
// The session cookie holds an HMAC-SHA256 of a fixed secret keyed by the
// admin password — so a leaked cookie value can't be reversed into the
// password, and the proxy can verify it statelessly without a database.
// Uses Web Crypto (crypto.subtle) so it runs in both edge and node runtimes.
// ============================================================================

export const ADMIN_SESSION_COOKIE = 'mohid_admin'

const SESSION_CONTEXT = 'mohid-admin-session-v1'

export async function computeSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(SESSION_CONTEXT))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** Constant-time-ish comparison of a presented cookie against the expected token. */
export async function isValidSession(token: string | undefined): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password || !token) return false

  const expected = await computeSessionToken(password)
  if (expected.length !== token.length) return false

  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return diff === 0
}
