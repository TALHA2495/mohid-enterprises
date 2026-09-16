'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin.server'
import type { QuoteStatus } from '@/lib/supabase'

export type UpdateQuoteStatusResult = { ok: boolean; error?: string }

/**
 * Admin-only quote status transition. Runs on the server with the service-role
 * key (RLS is fully locked — no client key can mutate quotes), writes an
 * audit_log row, and revalidates the quotes list.
 */
export async function updateQuoteStatus(quoteId: string, newStatus: QuoteStatus): Promise<UpdateQuoteStatusResult> {
  const session = await isValidSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)
  if (!session) return { ok: false, error: 'Session expired — sign in again.' }

  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('quotes')
    .update({
      quote_status: newStatus,
      quote_status_updated_at: now,
      ...(newStatus === 'accepted' ? { accepted_at: now } : {}),
      ...(newStatus === 'rejected' ? { rejected_at: now } : {}),
    })
    .eq('id', quoteId)

  if (error) {
    console.error('[updateQuoteStatus] update failed:', error)
    return { ok: false, error: error.message }
  }

  // Audit trail — best-effort; never blocks the status change on failure.
  await supabaseAdmin
    .from('audit_log')
    .insert({
      entity_type: 'quote',
      entity_id: quoteId,
      action: 'status_changed',
      new_state: { quote_status: newStatus },
      changed_by: 'admin_dashboard',
      change_reason: 'Status changed from the admin dashboard',
    })
    .then(() => {}, () => {})

  revalidatePath('/admin/quotes')
  return { ok: true }
}
