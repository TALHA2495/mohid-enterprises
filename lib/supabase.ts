import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// CLIENT-SAFE SUPABASE CLIENT (anon key only — zero table access, RLS locked)
// ----------------------------------------------------------------------------
// The public quote form is the ONLY consumer. All writes go through the
// `create_quote` SECURITY DEFINER RPC; anon has no SELECT/INSERT on any table.
// Never import the admin client from here — use `lib/supabase-admin.server.ts`
// (server components / server actions only).
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** True when both public env vars are present — gates persistence in the form. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Null until Supabase env vars are configured. The quote form degrades
 * gracefully: without persistence it still opens WhatsApp (previous behavior).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null

// ============================================================================
// TYPE DEFINITIONS (mirror supabase/schema.sql)
// ============================================================================

export type AccountStatus = 'active' | 'suspended' | 'blacklisted'

export type Customer = {
  id: string
  email: string
  phone: string | null
  name: string
  company_name: string | null
  billing_address: string | null
  shipping_address: string | null
  city: string | null
  country: string
  account_status: AccountStatus
  credit_limit: number
  credit_terms_enabled: boolean
  customer_since: string
  total_orders_count: number
  total_orders_value: number
  last_order_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ProductImage = {
  /** Public CDN URL (ImageKit URL endpoint). */
  url: string
  /**
   * ImageKit file id. `null` for images seeded from the existing showroom —
   * those were uploaded outside this app, so nothing may delete them remotely.
   */
  fileId: string | null
  name: string
  width: number | null
  height: number | null
}

export type ProductCategory = {
  id: string
  name: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  category: string
  /** Managed taxonomy (migration 0002). `category` stays in sync with this name. */
  category_id: string | null
  description: string | null
  material: string
  width_mm: number | null
  available_colors: string[]
  available_finishes: string[]
  moq_units: number | null
  price_per_unit: number | null
  currency: string
  stock_available: number
  is_active: boolean
  /** Ordered gallery, max 6 (enforced by chk_products_images_is_array). */
  images: ProductImage[]
  supplier_id: string | null
  last_price_update: string | null
  created_at: string
  updated_at: string
}

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'

export type Quote = {
  id: string // "Q-20260916-AB12CD"
  customer_id: string
  quote_number: string // "QT-0001"
  quote_status: QuoteStatus
  quote_status_updated_at: string | null
  total_amount: number | null
  currency: string
  tax_rate: number | null
  tax_amount: number | null
  valid_from: string
  valid_until: string | null
  whatsapp_message_text: string | null
  whatsapp_sent_at: string | null
  whatsapp_delivery_confirmed: boolean
  whatsapp_delivery_confirmed_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  rfq_details: Record<string, unknown> | null
  customer_notes: string | null
  internal_notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type QuoteLineItem = {
  id: string
  quote_id: string
  product_id: string | null
  product_name: string
  material: string | null
  width_mm: number | null
  color: string | null
  finish: string | null
  quantity_requested: number
  quantity_accepted: number | null
  unit_price: number | null
  line_total: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'quality_check'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'fully_paid' | 'overdue'

export type Order = {
  id: string
  order_number: string // "ORD-20260916-001"
  customer_id: string
  quote_id: string | null
  order_status: OrderStatus
  order_status_updated_at: string
  total_amount: number
  tax_rate: number | null
  tax_amount: number | null
  discount_applied: number
  currency: string
  production_start_date: string | null
  production_end_date: string | null
  quality_check_passed: boolean | null
  quality_check_date: string | null
  quality_notes: string | null
  tracking_number: string | null
  shipped_date: string | null
  estimated_delivery: string | null
  delivered_date: string | null
  payment_status: PaymentStatus
  amount_due: number | null
  amount_paid: number
  customer_notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
}

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'partially_paid'
  | 'fully_paid'
  | 'overdue'
  | 'cancelled'

export type Invoice = {
  id: string
  invoice_number: string // "INV-20260916-001"
  order_id: string
  customer_id: string
  invoice_status: InvoiceStatus
  invoice_status_updated_at: string
  invoice_date: string
  due_date: string | null
  payment_terms: string | null
  subtotal: number
  tax_rate: number | null
  tax_amount: number | null
  shipping_cost: number
  total_amount: number
  currency: string
  amount_due: number
  amount_paid: number
  balance_remaining: number
  sent_to_customer_at: string | null
  sent_via: 'email' | 'whatsapp' | 'print' | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PaymentMethod = 'bank_transfer' | 'cheque' | 'cash' | 'stripe' | 'easypaisa'

export type Payment = {
  id: string
  payment_number: string // "PAY-20260916-001"
  invoice_id: string
  customer_id: string
  payment_amount: number
  payment_date: string
  payment_method: PaymentMethod
  payment_status: 'completed' | 'failed' | 'pending' | 'reversed'
  bank_name: string | null
  transaction_id: string | null
  transaction_date: string | null
  reconciled_at: string | null
  reconciled_by: string | null
  reconciliation_notes: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export type AuditEntityType = 'customer' | 'product' | 'quote' | 'order' | 'invoice' | 'payment' | 'hero'

export type AuditLog = {
  id: string
  entity_type: AuditEntityType
  entity_id: string
  action: 'created' | 'updated' | 'status_changed' | 'deleted'
  old_state: Record<string, unknown> | null
  new_state: Record<string, unknown> | null
  changed_by: string | null
  change_reason: string | null
  timestamp: string
}

/** Row shape returned by the `create_quote` RPC. */
export type CreateQuoteResult = {
  quote_id: string
  customer_id: string
  duplicate: boolean
}

// ============================================================================
// ERROR HANDLING HELPER
// ============================================================================

export function handleSupabaseError(error: unknown, context: string): string {
  const err = error as { code?: string; message?: string } | null
  console.error(`[Supabase Error - ${context}]`, err)

  if (err?.code === 'PGRST116') return 'Record not found'
  if (err?.code === '23505' || err?.message?.includes('duplicate')) return 'This entry already exists'
  if (err?.code === '23503') return 'Referenced record not found'
  if (err?.message?.includes('invalid_email')) return 'The email address is not valid'

  return err?.message || 'Database error occurred'
}
