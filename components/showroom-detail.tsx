'use client'

import { ArrowLeft, ArrowUpRight, ChevronDown, CircleCheck, Package, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { Product } from './showroom-section'

const PRODUCT_FEATURES = ['Consistent quality', 'Custom widths', 'Bulk production', 'Global shipping']

const CUSTOMIZATION_OPTIONS = [
  'Custom width',
  'Printed logo or text',
  'Custom colour',
  'Custom roll length',
  'Special finishing (softening, heat set, etc.)',
]

function findSpec(product: Product, keywords: string[], fallback: string) {
  for (const keyword of keywords) {
    const match = product.specs.find(([label]) => label.toLowerCase().includes(keyword))
    if (match) return match[1]
  }
  return fallback
}

export default function ProductDetail({
  product,
  onBack,
  isDetailPage = false,
}: {
  product: Product
  onBack?: () => void
  isDetailPage?: boolean
}) {
  const [customOpen, setCustomOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const [titleFirst, ...titleRest] = product.name.split(' ')

  // Thumbnail switcher: the strip only renders when the product has multiple
  // uploaded images. Transforms are applied per-slot (large vs thumbnail).
  const hasMultiple = product.images.length > 1
  const FULL = '?tr=w-1200,f-auto,q-70'
  const THUMB = '?tr=w-180,f-auto,q-70'
  const activeImage = hasMultiple ? (product.images[selectedIndex] ?? product.images[0] ?? '') : ''
  const mainSrc = activeImage && !activeImage.includes('?') ? `${activeImage}${FULL}` : activeImage || product.image

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  // Carry the active product's context into the quote form so the RFQ
  // pre-fills and the Zod schema can enforce the product's own MOQ.
  const quoteHref = `/quote?${new URLSearchParams({
    product: product.name,
    material: product.material,
    width: product.width,
    moq: findSpec(product, ['minimum order quantity'], ''),
  }).toString()}`

  return (
    <section className="product-detail relative z-10 min-h-screen overflow-hidden bg-[#f7f8f5] px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl">
        {isDetailPage ? (
          <Link href="/showroom" className="inline-flex items-center gap-2 text-sm font-medium text-[#0a7d31] transition-colors hover:text-[#101412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2">
            <ArrowLeft className="size-4" /> Back to showroom
          </Link>
        ) : (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#0a7d31] transition-colors hover:text-[#101412] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] focus-visible:ring-offset-2">
            <ArrowLeft className="size-4" /> Back to showroom
          </button>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.02fr_1fr] lg:gap-8">
          <div className="overflow-hidden rounded-2xl border border-[#101412]/12 bg-white lg:self-start">
            {hasMultiple && (
              <div className="flex items-center gap-2 overflow-x-auto p-3 pb-0" aria-label="Product images">
                {product.images.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    aria-label={`Show image ${i + 1}`}
                    aria-current={selectedIndex === i ? 'true' : 'false'}
                    onClick={() => setSelectedIndex(i)}
                    className={`shrink-0 overflow-hidden rounded-md border-2 ${selectedIndex === i
                      ? 'border-[#01aa3f]'
                      : 'border-[#101412]/12 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412]'
                    }`}
                  >
                    <Image
                      src={url.includes('?') ? url : `${url}${THUMB}`}
                      alt={`${product.name}, image ${i + 1}`}
                      width={48}
                      height={48}
                      className="size-12 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
            <div
                className="group relative aspect-[16/11] overflow-hidden bg-[#e8eeea]"
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const x = ((event.clientX - rect.left) / rect.width) * 100
                  const y = ((event.clientY - rect.top) / rect.height) * 100
                  imageRef.current?.style.setProperty('transform-origin', `${x}% ${y}%`)
                }}
                onMouseLeave={() => imageRef.current?.style.setProperty('transform-origin', 'center')}
              >
              <Image
                  ref={imageRef}
                  src={mainSrc}
                  alt={`${product.name} - ${product.type} trim`}
                  fill
                  quality={70}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.6]"
                />
            </div>
          </div>
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-[#0a7d31]">{product.type} · {product.material}</p>
            <h1 className="mt-3 font-sans text-2xl font-semibold leading-[1.1] tracking-tight text-[#101412] sm:text-3xl lg:text-4xl">
              {titleFirst} {titleRest.length > 0 && <span className="text-[#0a7d31]">{titleRest.join(' ')}</span>}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#46534c]">
              {product.description} Produced to consistent width and finish density.
            </p>

            {/* dl wrapper: dt/dd are invalid outside a <dl> — fixes HTML
                validity/a11y without touching the styling classes. */}
            <dl className="mt-4 border-t border-[#101412]/12">
              {product.specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-4 border-b border-[#101412]/12 py-2 last:border-0">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#46534c]">{label}</dt>
                  <dd className="text-[13px] leading-5 text-[#101412] tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>

            {product.moq && (
              <section className="border-t border-[#101412]/10 pt-6 mt-8">
                <h3 className="font-fraunces text-xl font-semibold text-[#101412] mb-4">Minimum Order &amp; Pricing</h3>
                <div className="mb-4 rounded-lg bg-[#f4f7f8] p-4 border border-[#101412]/10">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">MOQ</div>
                  <div className="mt-3 text-lg font-semibold text-[#101412]">{product.moq.toLocaleString()} meters</div>
                </div>
                {product.pricingTiers && product.pricingTiers.length > 0 && (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#101412]/15">
                        <th className="text-left py-3 px-0 text-[#101412]/70 font-semibold">Order Quantity (m)</th>
                        <th className="text-right py-3 px-0 text-[#101412]/70 font-semibold">Price/Meter (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.pricingTiers.map((tier, idx) => (
                        <tr key={idx} className="border-b border-[#101412]/10 last:border-0">
                          <td className="py-3 px-0 text-[#101412]">{tier.quantity.toLocaleString()}+</td>
                          <td className="text-right py-3 px-0 text-[#101412] font-semibold">${tier.pricePerMeter.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )}

            {product.leadTime && (
              <div className="mt-6 rounded-lg bg-[#f4f7f8] p-4 border border-[#101412]/10">
                <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">Standard Lead Time</div>
                <div className="mt-2 text-black">{product.leadTime}</div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={quoteHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#01aa3f] px-6 py-3.5 text-sm font-semibold text-[#07120b] transition-colors hover:bg-[#00be48]"
              >
                Request quote &amp; sample <ArrowUpRight className="size-4" />
              </a>
              <a
                href={`mailto:info@mohident.com?subject=${encodeURIComponent(`Physical sample request — ${product.name}`)}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[#101412]/20 px-6 py-3.5 text-sm text-[#101412] transition-colors hover:bg-black/[0.06]"
              >
                Request physical sample
              </a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {PRODUCT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[#101412]">
                  <CircleCheck className="size-[18px] text-[#0a7d31]" strokeWidth={1.6} /> {feature}
                </li>
              ))}
            </ul>

          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-2xl border border-[#101412]/12 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#101412]">
              <button
                type="button"
                onClick={() => setCustomOpen((prev) => !prev)}
                aria-expanded={customOpen}
                aria-controls="customization-drawer"
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <SlidersHorizontal className="size-5 text-[#101412]/70" strokeWidth={1.6} />
                  Customization options
                </span>
                <ChevronDown className={`size-5 shrink-0 text-[#101412]/40 transition-transform duration-300 ${customOpen ? 'rotate-180' : ''}`} strokeWidth={1.6} />
              </button>
            </h2>
            <div
              id="customization-drawer"
              className={`grid transition-all duration-300 ease-in-out ${customOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div>
                  {CUSTOMIZATION_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center gap-3 border-b border-[#101412]/10 py-2.5 text-sm text-[#101412] last:border-0">
                      <CircleCheck className="size-[18px] shrink-0 text-[#0a7d31]" strokeWidth={1.6} /> {option}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-[#101412]/12 bg-[#e8eeea] p-4">
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 size-5 shrink-0 text-[#0a7d31]" strokeWidth={1.6} />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a7d31]">Sample &amp; production</p>
                      <p className="mt-1.5 text-[13px] leading-6 text-[#46534c]">Samples available on request.</p>
                      <p className="text-[13px] leading-6 text-[#46534c]">Production lead time depends on order quantity and specifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasMultiple && (
          <section className="mt-12 border-t border-[#101412]/10 pt-10" aria-label="Product image gallery">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-[#0a7d31]">
                  Gallery &bull; {product.images.length} Views
                </p>
                <h2 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-[#101412]">
                  Product Imagery &amp; Angles
                </h2>
              </div>
              <p className="text-xs text-[#46534c]">
                Select any image to inspect in full view
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {product.images.map((url, idx) => {
                const isCurrent = selectedIndex === idx
                const cardSrc = url.includes('?') ? url : `${url}${FULL}`
                return (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedIndex(idx)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    aria-label={`View ${product.name} angle ${idx + 1}`}
                    aria-current={isCurrent ? 'true' : 'false'}
                    className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl border text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101412] ${
                      isCurrent
                        ? 'border-[#01aa3f] ring-2 ring-[#01aa3f]/20 shadow-md'
                        : 'border-[#101412]/12 bg-white hover:-translate-y-1 hover:border-[#0a7d31]/50 hover:shadow-md'
                    }`}
                  >
                    <Image
                      src={cardSrc}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      quality={70}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
                      <span className="text-[11px] font-medium tracking-wide text-white">
                        View angle {idx + 1} &uarr;
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="absolute top-2 right-2 rounded-full bg-[#01aa3f] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  )
}

