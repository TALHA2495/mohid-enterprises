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
 * Null until Supabase env vars are configured. Admin pages render a
 * "not configured" state instead of crashing the build/dev server.
 */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null
