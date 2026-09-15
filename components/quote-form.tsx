'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { createRfqSchema, parseMoq, type ProductContext, type RfqFormInput, type RfqInput } from '@/lib/rfq-schema'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '92XXXXXXXXXX'

export function QuoteForm() {
  const [sent, setSent] = useState(false)

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
  // WhatsApp URL is always compiled from clean, validated inputs.
  const onSubmit = handleSubmit((values: RfqInput) => {
    const { product, material, width, moq } = productContext
    const lines = [
      '*New RFQ — Mohid Enterprises Showroom*',
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
    ]

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
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

      <button type="submit" disabled={sent} aria-live="polite" className="rounded-lg bg-[#01aa3f] px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
        {sent ? 'Request received' : 'Submit request'}
      </button>
    </form>
  )
}