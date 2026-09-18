import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// SERVER-ONLY SUPABASE ADMIN CLIENT (service role — bypasses RLS)
// ----------------------------------------------------------------------------
// NEVER import this module from a client component ('use client') — the
// service-role key must never reach the browser. Use it exclusively from
// server components, server actions, and route handlers (e.g. app/admin/**).
// ============================================================================

if (typeof window !== 'undefined') {
  throw new Error(
    'lib/supabase-admin.server.ts imported on the client — the service-role key must never be exposed to the browser. Use lib/supabase.ts (anon client) instead.',
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Names (never values) of the variables this module needs but did not receive.
 * The admin dashboard renders them, so a misconfigured deployment explains
 * itself instead of showing a generic notice.
 *
 * NEXT_PUBLIC_* values are inlined by Next.js at build time, so a variable
 * added to the host after the build stays missing until the project is
 * rebuilt. SUPABASE_SERVICE_ROLE_KEY is read at runtime, but the environment is
 * still snapshotted when a deployment is created, so it too needs a fresh
 * deployment.
 */
export const missingAdminEnvVars: string[] = [
  ...(supabaseUrl ? [] : ['NEXT_PUBLIC_SUPABASE_URL']),
  ...(supabaseServiceKey ? [] : ['SUPABASE_SERVICE_ROLE_KEY']),
]

/**
 * Null until Supabase env vars are configured. Admin pages render a
 * "not configured" state instead of crashing the build/dev server.
 */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null
