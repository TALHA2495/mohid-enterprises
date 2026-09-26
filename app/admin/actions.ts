'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/admin-auth'
import { deleteImageKitFile } from '@/lib/imagekit.server'
import { categoryFormSchema, csvToArray, productFormSchema } from '@/lib/product-schema'
import { heroFormSchema } from '@/lib/hero-schema'
import type { CategoryFormInput, ProductFormInput } from '@/lib/product-schema'
import type { HeroFormInput } from '@/lib/hero-schema'
import { typeForCategoryName } from '@/lib/showroom'
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

// ============================================================================
// PRODUCT CATALOG — categories & products
// ----------------------------------------------------------------------------
// Every mutation below: (1) requires a live admin session, (2) re-parses its
// input with the same Zod schema the form used, (3) writes an audit_log row,
// (4) revalidates the affected admin routes.
//
// Updates use compare-and-set on `updated_at`: two admins editing one product
// cannot silently overwrite each other — the second save is refused loudly.
// ============================================================================

export type CatalogActionResult = { ok: boolean; error?: string; id?: string }

type CatalogEntity = 'product' | 'product_category' | 'hero'

/** Null when the caller holds a valid admin session, else the error message. */
async function sessionError(): Promise<string | null> {
  const session = await isValidSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)
  return session ? null : 'Session expired — sign in again.'
}

function issueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Invalid input.'
}

/** Translate Postgres constraint violations into messages an operator can act on. */
function catalogError(error: { code?: string; message: string }, subject: 'product' | 'category' | 'hero'): string {
  if (error.code === '23505') {
    return subject === 'product'
      ? 'A product with that name already exists.'
      : subject === 'category'
        ? 'A category with that name already exists.'
        : 'A hero card with that label already exists.'
  }
  if (error.code === '23503') return 'That category no longer exists — reload the page and pick another.'
  if (error.code === '23514') return 'One of the values is outside the range the database allows.'
  return error.message
}

/** Best-effort audit row — never blocks the mutation that produced it. */
async function logCatalogEvent(
  entityType: CatalogEntity,
  entityId: string,
  action: 'created' | 'updated' | 'status_changed' | 'deleted',
  oldState: Record<string, unknown> | null,
  newState: Record<string, unknown> | null,
): Promise<void> {
  if (!supabaseAdmin) return
  await supabaseAdmin
    .from('audit_log')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      action,
      old_state: oldState,
      new_state: newState,
      changed_by: 'admin_dashboard',
      change_reason: 'Catalog change from the admin dashboard',
    })
    .then(() => {}, () => {})
}

/** Create (no `id`) or update (with `id` + the `updatedAt` revision) a product. */
export async function saveProduct(
  input: ProductFormInput & { id?: string; updatedAt?: string },
): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const parsed = productFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: issueMessage(parsed.error) }
  const values = parsed.data

  // The legacy `category` text column mirrors the managed category, so existing
  // queries, indexes and filters keep working after the taxonomy was introduced.
  const { data: category, error: categoryLookupError } = await supabaseAdmin
    .from('product_categories')
    .select('id, name')
    .eq('id', values.categoryId)
    .maybeSingle()

  if (categoryLookupError) return { ok: false, error: catalogError(categoryLookupError, 'category') }
  if (!category) return { ok: false, error: 'That category no longer exists — reload the page and pick another.' }

  // The showroom filters by the legacy `type` tag, not by category. Derive it
  // from the chosen category (the seeded categories match the showroom filters
  // 1:1) so a product created here lands under the matching showroom filter.
  const type = typeForCategoryName(category.name)

  const record = {
    name: values.name,
    category: category.name,
    category_id: category.id,
    ...(type ? { type } : {}),
    description: values.description === '' ? null : values.description,
    material: values.material,
    width_mm: values.widthMm === '' ? null : Number(values.widthMm),
    available_colors: csvToArray(values.colors),
    available_finishes: csvToArray(values.finishes),
    moq_units: values.moqUnits === '' ? null : Number(values.moqUnits),
    price_per_unit: values.pricePerUnit === '' ? null : Number(values.pricePerUnit),
    stock_available: Number(values.stockAvailable),
    is_active: values.isActive,
    images: values.images,
    // Stamp the price review date only when a price was actually supplied.
    ...(values.pricePerUnit === '' ? {} : { last_price_update: new Date().toISOString() }),
  }

  if (!input.id) {
    const { data, error } = await supabaseAdmin.from('products').insert(record).select('id').single()
    if (error) return { ok: false, error: catalogError(error, 'product') }

    await logCatalogEvent('product', data.id, 'created', null, { name: values.name, category: category.name })
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/showroom')
    return { ok: true, id: data.id }
  }

  if (!input.updatedAt) return { ok: false, error: 'Missing revision — reload the page and try again.' }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(record)
    .eq('id', input.id)
    .eq('updated_at', input.updatedAt)
    .select('id')

  if (error) return { ok: false, error: catalogError(error, 'product') }
  if (!data || data.length === 0) {
    return { ok: false, error: 'This product changed in another tab or was removed. Reload to see the current values.' }
  }

  await logCatalogEvent('product', input.id, 'updated', null, { name: values.name, category: category.name })
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${input.id}`)
  revalidatePath('/admin')
  revalidatePath('/showroom')
  return { ok: true, id: input.id }
}

/** Show/hide a product without losing its data. */
export async function setProductActive(id: string, isActive: boolean): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('id')

  if (error) return { ok: false, error: catalogError(error, 'product') }
  if (!data || data.length === 0) return { ok: false, error: 'That product no longer exists.' }

  await logCatalogEvent('product', id, 'status_changed', null, { is_active: isActive })
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/showroom')
  return { ok: true, id }
}

/**
 * Delete a product. Quote history is preserved: `quote_line_items.product_id`
 * is ON DELETE SET NULL and each line keeps its own name/spec snapshot.
 * Uploaded gallery files are removed from ImageKit afterwards, best-effort.
 */
export async function deleteProduct(id: string): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const { data: existing } = await supabaseAdmin.from('products').select('id, name, images').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'That product no longer exists.' }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return { ok: false, error: catalogError(error, 'product') }

  const fileIds = ((existing.images ?? []) as { fileId: string | null }[])
    .map((image) => image.fileId)
    .filter((fileId): fileId is string => Boolean(fileId))
  await Promise.all(fileIds.map((fileId) => deleteImageKitFile(fileId).catch(() => ({ ok: false }))))

  await logCatalogEvent('product', id, 'deleted', { name: existing.name }, null)
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/showroom')
  return { ok: true, id }
}

/** Remove one uploaded file from ImageKit when an admin drops it from the gallery. */
export async function deleteUploadedImage(fileId: string): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!fileId) return { ok: true }

  const result = await deleteImageKitFile(fileId)
  return result.ok ? { ok: true } : { ok: false, error: result.error }
}

/** Create (no `id`) or rename/retune (with `id` + `updatedAt`) a category. */
export async function saveCategory(
  input: CategoryFormInput & { id?: string; updatedAt?: string },
): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const parsed = categoryFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: issueMessage(parsed.error) }
  const values = parsed.data

  if (!input.id) {
    const { data, error } = await supabaseAdmin
      .from('product_categories')
      .insert({ name: values.name, sort_order: Number(values.sortOrder), is_active: values.isActive })
      .select('id')
      .single()

    if (error) return { ok: false, error: catalogError(error, 'category') }

    await logCatalogEvent('product_category', data.id, 'created', null, { name: values.name })
    revalidatePath('/admin/products')
    return { ok: true, id: data.id }
  }

  if (!input.updatedAt) return { ok: false, error: 'Missing revision — reload the page and try again.' }

  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .update({ name: values.name, sort_order: Number(values.sortOrder), is_active: values.isActive })
    .eq('id', input.id)
    .eq('updated_at', input.updatedAt)
    .select('id')

  if (error) return { ok: false, error: catalogError(error, 'category') }
  if (!data || data.length === 0) {
    return { ok: false, error: 'This category changed in another tab or was removed. Reload to see the current values.' }
  }

  // Keep the mirrored text column consistent for every product in the category.
  await supabaseAdmin.from('products').update({ category: values.name }).eq('category_id', input.id)

  await logCatalogEvent('product_category', input.id, 'updated', null, { name: values.name })
  revalidatePath('/admin/products')
  return { ok: true, id: input.id }
}

/**
 * Delete a category. The foreign key is ON DELETE RESTRICT, so Postgres refuses
 * while any product still points at it — surfaced as an actionable message
 * rather than a silent reassignment of those products.
 */
export async function deleteCategory(id: string): Promise<CatalogActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const { count } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return { ok: false, error: `${count} product${count === 1 ? '' : 's'} still use this category. Move them first.` }
  }

  const { data: existing } = await supabaseAdmin.from('product_categories').select('name').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'That category no longer exists.' }

  const { error } = await supabaseAdmin.from('product_categories').delete().eq('id', id)
  if (error) return { ok: false, error: catalogError(error, 'category') }

    await logCatalogEvent('product_category', id, 'deleted', { name: existing.name }, null)
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { ok: true, id }
}

// ============================================================================\
// HERO SECTIONS — home-page category cards
// ----------------------------------------------------------------------------
// Editable from /admin/hero: reorder, set active, add, delete. Every change
// revalidates the admin list AND the home page so the hero reflects edits
// instantly without a redeploy.
// ============================================================================

export type HeroActionResult = { ok: boolean; error?: string; id?: string }

/** Create a new hero card, or edit an existing one (compare-and-set on updated_at). */
export async function saveHero(input: HeroFormInput & { id?: string; updatedAt?: string }): Promise<HeroActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const parsed = heroFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: issueMessage(parsed.error) }
  const values = parsed.data

  const record = {
    label: values.label,
    description: values.desc ?? null,
    filter: values.filter,
    image: values.image,
    sort_order: values.sortOrder === '' ? 0 : Number(values.sortOrder),
    is_active: values.isActive,
  }

  if (!input.id) {
    const { data, error } = await supabaseAdmin.from('hero_sections').insert(record).select('id').single()
        if (error) return { ok: false, error: catalogError(error, 'hero') }
    await logCatalogEvent('hero', data.id, 'created', null, record)
    revalidatePath('/admin/hero')
    revalidatePath('/')
    return { ok: true, id: data.id }
  }

  if (!input.updatedAt) return { ok: false, error: 'Missing revision — reload the page and try again.' }

  const { data, error } = await supabaseAdmin
    .from('hero_sections')
    .update(record)
    .eq('id', input.id)
    .eq('updated_at', input.updatedAt)
    .select('id')

  if (error) return { ok: false, error: catalogError(error, 'hero') }
  if (!data || data.length === 0) {
    return { ok: false, error: 'This hero card changed in another tab or was removed. Reload to see the current values.' }
  }

      await logCatalogEvent('hero', input.id, 'updated', null, record)
  revalidatePath('/admin/hero')
  revalidatePath('/')
  return { ok: true, id: input.id }
}

/** Delete a hero card. ImageKit files are only removed for uploads made here. */
export async function deleteHero(id: string): Promise<HeroActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  const { data: existing } = await supabaseAdmin.from('hero_sections').select('label, image').eq('id', id).maybeSingle()
  if (!existing) return { ok: false, error: 'That hero card no longer exists.' }

  const { error } = await supabaseAdmin.from('hero_sections').delete().eq('id', id)
  if (error) return { ok: false, error: catalogError(error, 'hero') }

    await logCatalogEvent('hero', id, 'deleted', { label: existing.label, image: existing.image }, null)
  revalidatePath('/admin/hero')
  revalidatePath('/')
  return { ok: true, id }
}

/** Reorder the published hero cards (called from move buttons / drag-and-drop). */
export async function reorderHero(ids: string[]): Promise<HeroActionResult> {
  const authError = await sessionError()
  if (authError) return { ok: false, error: authError }
  if (!supabaseAdmin) return { ok: false, error: 'Supabase is not configured on the server.' }

  // Per-row UPDATE, not upsert({ id, sort_order }). PostgREST renders that
  // upsert as INSERT ... ON CONFLICT, and the INSERT arm still requires every
  // NOT NULL column (label, filter, image) — so every reorder failed with
  // 23502 "null value in column label" and sort_order never changed.
  for (const [index, id] of ids.entries()) {
    const { error } = await supabaseAdmin.from('hero_sections').update({ sort_order: index }).eq('id', id)
    if (error) return { ok: false, error: catalogError(error, 'hero') }
  }

  // Revalidate by refreshing each card's row path individually is not possible;
  // clear the home + admin caches wholesale.
  revalidatePath('/admin/hero')
  revalidatePath('/')
  return { ok: true }
}
