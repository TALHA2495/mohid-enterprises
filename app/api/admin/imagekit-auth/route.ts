import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'
import { createUploadAuth, missingImagekitEnvVars, resolveUploadFolder } from '@/lib/imagekit.server'

// ============================================================================
// POST /api/admin/imagekit-auth — signed upload credentials for the admin area
// ----------------------------------------------------------------------------
// Session-guarded: without a valid admin cookie this returns 401, so an
// anonymous visitor can never obtain a signature that writes to the CDN.
// The signature is short-lived (~30 min) and scoped to the upload token.
// `?folder=` picks the ImageKit folder (products | factory | certificates | logo).
// ============================================================================

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await isValidSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)
  if (!session) {
    return NextResponse.json({ error: 'Session expired — sign in again.' }, { status: 401 })
  }

  const requested = new URL(request.url).searchParams.get('folder')
  const auth = createUploadAuth(resolveUploadFolder(requested))
  if (!auth) {
    return NextResponse.json(
      { error: `ImageKit is not configured. Missing: ${missingImagekitEnvVars.join(', ')}` },
      { status: 503 },
    )
  }

  return NextResponse.json(auth, { headers: { 'Cache-Control': 'no-store' } })
}