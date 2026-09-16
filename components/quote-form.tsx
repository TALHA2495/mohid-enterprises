'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { createRfqSchema, parseMoq, type ProductContext, type RfqFormInput, type RfqInput } from '@/lib/rfq-schema'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '92XXXXXXXXXX'

/** "10mm–50mm" → 10 (first integer); unparseable → null (DB column is nullable). */
function parseWidthMm(width: string): number | null {
  const match = width.match(/\d+/)
  if (!match) return null
  const value = Number.parseInt(match[0], 10)
  return Number.isFinite(value) && value > 0 ? value : null
}

export function QuoteForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [quoteId, setQuoteId] = useState('')
  const [submitError, setSubmitError] = useState('')

  // Product context arrives from the showroom detail page via /quote?product=...&material=...&width=...&moq=...
  const productContext = useMemo<Partial<ProductContext>>(() => {
    const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
    return {
      product: params.get('product') ?? '',
      material: params.get('material') ?? '',
      width: params.get('width') ?? '',
      moq: params.get('moq') ?? '',
    }
  }, [])

  const schema = useMemo(() => createRfqSchema(productContext), [productContext])
  const moqFloor = parseMoq(productContext.moq ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RfqFormInput, unknown, RfqInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      inquiry: productContext.product
        ? `Custom ${productContext.product.toLowerCase()} — material: ${productContext.material}, width: ${productContext.width}. `
        : '',
    },
  })

  // Runs only after React Hook Form + Zod validation succeeds, so the
  // persistence payload and the WhatsApp URL are compiled from clean inputs.
  const onSubmit = handleSubmit(async (values: RfqInput) => {
    setSubmitting(true)
    setSubmitError('')
    setQuoteId('')

    // Persist through the create_quote RPC (server-side dedup + customer
    // upsert + audit log, all atomic). A persistence failure never blocks the
    // lead: WhatsApp still opens, exactly like before Supabase existed.
    let persistedQuoteId = ''
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('create_quote', {
          p_full_name: values.companyName,
          p_company_name: values.companyName,
          p_email: values.workEmail.toLowerCase(),
          p_phone: values.phone,
          p_product_name: productContext.product || 'General RFQ',
          p_material: productContext.material || null,
          p_width_mm: parseWidthMm(productContext.width ?? ''),
          p_quantity: values.quantity,
          p_rfq_details: {
            inquiry: values.inquiry,
            notes: values.notes || null,
            destination_port: values.destinationPort,
            product_context: productContext,
          },
          p_validity_days: 7,
        })

        if (error) throw error

        const result = Array.isArray(data) ? data[0] : data
        if (result?.duplicate) {
          setSubmitError(
            `You already submitted a quote (ID: ${result.quote_id}). Our team is reviewing it — check your WhatsApp for confirmation.`,
          )
          setSubmitting(false)
          return
        }
        persistedQuoteId = result?.quote_id ?? ''
      } catch (err) {
        console.error('Quote persistence failed — falling back to WhatsApp-only handoff:', err)
        setSubmitError(
          'Your request will still be sent via WhatsApp, but we could not save a quote ID at the moment.',
        )
      }
    }

    const { product, material, width, moq } = productContext
    const lines = [
      '*New RFQ — Mohid Enterprises Showroom*',
      '',
      `*Quote ID:* ${persistedQuoteId || '—'}`,
      '',
      `*Product:* ${product || '—'}`,
      `*Material:* ${material || '—'}`,
      `*Width:* ${width || '—'}`,
      `*Product MOQ:* ${moq || 'On request'}`,
      '',
      `*Requested quantity:* ${values.quantity}`,
      `*Destination port:* ${values.destinationPort}`,
      '',
      `*Specifications:* ${values.inquiry}`,
      `*Additional notes:* ${values.notes || '—'}`,
      '',
      `*Company:* ${values.companyName}`,
      `*Work email:* ${values.workEmail}`,
      `*Phone:* ${values.phone}`,
    ]

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setQuoteId(persistedQuoteId)
    setSent(true)
    setSubmitting(false)
  })

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      {productContext.product && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-black/10 bg-black/[0.03] p-3">
          {[productContext.product, productContext.material, productContext.width, productContext.moq]
            .filter(Boolean)
            .map((chip) => (
              <span key={chip} className="rounded-full border border-[#00c853]/30 px-2.5 py-1 text-[11px] font-medium text-[#00c853]">
                {chip}
              </span>
            ))}
        </div>
      )}

      <label className="grid gap-1 text-xs font-medium text-black/85">
        Inquiry details
        <textarea
          rows={3}
          autoComplete="off"
          placeholder="Tell us about your material, width, color, or trimming specifications…"
          className="mt-1 resize-none rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none placeholder:text-black/45 focus:border-[#00c853]"
          {...register('inquiry')}
          id="rfq-inquiry" aria-describedby={errors.inquiry ? 'rfq-inquiry-error' : undefined}
        />
        {errors.inquiry && <span role="alert" id="rfq-inquiry-error" className="text-[11px] font-normal text-[#c62828]">{errors.inquiry.message}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium text-black/85">
          Company name
          <input
            autoComplete="organization"
            className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none focus:border-[#00c853]"
            {...register('companyName')}
          id="rfq-companyName" aria-describedby={errors.companyName ? 'rfq-companyName-error' : undefined}
          />
          {errors.companyName && <span role="alert" id="rfq-companyName-error" className="text-[11px] font-normal text-[#c62828]">{errors.companyName.message}</span>}
        </label>

        <label className="grid gap-1 text-xs font-medium text-black/85">
          Work email
          <input
            type="email"
            autoComplete="email"
            spellCheck={false}
            className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none focus:border-[#00c853]"
            {...register('workEmail')}
          id="rfq-workEmail" aria-describedby={errors.workEmail ? 'rfq-workEmail-error' : undefined}
          />
          {errors.workEmail && <span role="alert" id="rfq-workEmail-error" className="text-[11px] font-normal text-[#c62828]">{errors.workEmail.message}</span>}
        </label>

        <label className="grid gap-1 text-xs font-medium text-black/85">
          Quantity{moqFloor !== null ? ` (MOQ: ${productContext.moq})` : ''}
          <input
            type="number"
            min="0"
            inputMode="decimal"
            autoComplete="off"
            className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none focus:border-[#00c853]"
            {...register('quantity')}
          id="rfq-quantity" aria-describedby={errors.quantity ? 'rfq-quantity-error' : undefined}
          />
          {errors.quantity && <span role="alert" id="rfq-quantity-error" className="text-[11px] font-normal text-[#c62828]">{errors.quantity.message}</span>}
        </label>

        <label className="grid gap-1 text-xs font-medium text-black/85">
          Destination port
          <input
            autoComplete="off"
            placeholder="e.g. Istanbul, Yokohama"
            className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none placeholder:text-black/45 focus:border-[#00c853]"
            {...register('destinationPort')}
          id="rfq-destinationPort" aria-describedby={errors.destinationPort ? 'rfq-destinationPort-error' : undefined}
          />
          {errors.destinationPort && <span role="alert" id="rfq-destinationPort-error" className="text-[11px] font-normal text-[#c62828]">{errors.destinationPort.message}</span>}
        </label>
      </div>

      <label className="grid gap-1 text-xs font-medium text-black/85">
        Phone (WhatsApp)
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          spellCheck={false}
          placeholder="+92 300 1234567…"
          className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none placeholder:text-black/45 focus:border-[#00c853]"
          {...register('phone')}
          id="rfq-phone" aria-describedby={errors.phone ? 'rfq-phone-error' : undefined}
        />
        {errors.phone && <span role="alert" id="rfq-phone-error" className="text-[11px] font-normal text-[#c62828]">{errors.phone.message}</span>}
      </label>

      <label className="grid gap-1 text-xs font-medium text-black/85">
        Additional notes
        <textarea
          rows={2}
          autoComplete="off"
          className="resize-none rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none focus:border-[#00c853]"
          {...register('notes')}
          id="rfq-notes" aria-describedby={errors.notes ? 'rfq-notes-error' : undefined}
        />
        {errors.notes && <span role="alert" id="rfq-notes-error" className="text-[11px] font-normal text-[#c62828]">{errors.notes.message}</span>}
      </label>

      <div aria-live="polite">
        {submitError && (
          <p role="alert" className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-3 text-xs font-normal text-[#c62828]">
            {submitError}
          </p>
        )}

        {sent && (
          <div className="rounded-lg border border-[#00c853]/30 bg-[#00c853]/[0.04] p-3 text-xs font-normal text-black">
            <p className="font-semibold">Request received. WhatsApp has opened with your details.</p>
            {quoteId ? (
              <p className="mt-1 text-black/70">
                Quote ID: <span className="font-mono font-semibold text-black">{quoteId}</span> — reference it in any follow-up messages.
              </p>
            ) : (
              <p className="mt-1 text-black/70">Our team will respond on WhatsApp shortly.</p>
            )}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting || sent} aria-live="polite" className="rounded-lg bg-[#01aa3f] px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? 'Submitting…' : sent ? 'Request received' : 'Submit request'}
      </button>
    </form>
  )
}