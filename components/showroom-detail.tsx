'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, CircleCheck, Package, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import type { Product } from './showroom-section'

const GALLERY_VIEWS = [
  { label: 'Full view', className: 'object-center' },
  { label: 'Weave detail', className: 'object-left scale-[1.7]' },
  { label: 'Edge detail', className: 'object-right scale-[1.6]' },
  { label: 'Texture macro', className: 'object-center scale-[2.1]' },
  { label: 'Top detail', className: 'object-top scale-[1.35]' },
]

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

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  const [view, setView] = useState(0)
  const [customOpen, setCustomOpen] = useState(false)
  const [titleFirst, ...titleRest] = product.name.split(' ')

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
    <section className="product-detail relative z-10 min-h-screen overflow-hidden bg-[#f4f7f8] px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#00c853] transition-colors hover:text-[#00ff59]">
          <ArrowLeft className="size-4" /> Back to showroom
        </button>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.02fr_1fr] lg:gap-8">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="relative aspect-[16/11] overflow-hidden bg-black/5">
              <Image
                  src={product.image}
                  alt={`${product.name} textile trim � ${GALLERY_VIEWS[view].label}`}
                  fill
                  quality={70}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={`size-full object-cover transition-transform duration-500 ${GALLERY_VIEWS[view].className}`}
                />
              <button type="button" aria-label="Previous image" onClick={() => setView((view - 1 + GALLERY_VIEWS.length) % GALLERY_VIEWS.length)} className="absolute left-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
                <ArrowLeft className="size-4" />
              </button>
              <button type="button" aria-label="Next image" onClick={() => setView((view + 1) % GALLERY_VIEWS.length)} className="absolute right-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
                <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2.5 p-3.5">
              {GALLERY_VIEWS.map((galleryView, index) => (
                <button key={galleryView.label} type="button" onClick={() => setView(index)} aria-label={`Show ${galleryView.label.toLowerCase()}`} aria-pressed={view === index} className={`relative h-14 min-w-16 flex-1 overflow-hidden rounded-lg border transition ${view === index ? 'border-[#00c853] ring-1 ring-[#00c853]' : 'border-black/10 opacity-70 hover:opacity-100'}`}>
                  <Image src={product.image} alt="" fill loading="lazy" quality={70} sizes="100px" className={`size-full object-cover ${galleryView.className}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">{product.type} � {product.material}</p>
            <h1 className="mt-3 font-serif text-2xl font-semibold leading-[1.1] tracking-tight text-black sm:text-3xl lg:text-4xl">
              {titleFirst} {titleRest.length > 0 && <span className="text-[#00c853]">{titleRest.join(' ')}</span>}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-black/60">
              {product.description} Produced to consistent width and finish density.
            </p>

            <div className="mt-4 border-t border-black/[0.07]">
              {product.specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-4 border-b border-black/[0.07] py-2 last:border-0">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-black/40">{label}</dt>
                  <dd className="text-[13px] leading-5 text-black/85 tabular-nums">{value}</dd>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={quoteHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#01aa3f] px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#00ff59]"
              >
                Request quote &amp; sample <ArrowUpRight className="size-4" />
              </a>
              <a
                href={quoteHref}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-black/20 px-6 py-3.5 text-sm text-black transition-colors hover:bg-black/[0.06]"
              >
                Request physical sample
              </a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {PRODUCT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-black/80">
                  <CircleCheck className="size-[18px] text-[#00c853]" strokeWidth={1.6} /> {feature}
                </li>
              ))}
            </ul>

          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-black">
              <button
                type="button"
                onClick={() => setCustomOpen((prev) => !prev)}
                aria-expanded={customOpen}
                aria-controls="customization-drawer"
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <SlidersHorizontal className="size-5 text-black/70" strokeWidth={1.6} />
                  Customization options
                </span>
                <ChevronDown className={`size-5 shrink-0 text-black/40 transition-transform duration-300 ${customOpen ? 'rotate-180' : ''}`} strokeWidth={1.6} />
              </button>
            </h2>
            <div
              id="customization-drawer"
              className={`grid transition-all duration-300 ease-in-out ${customOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div>
                  {CUSTOMIZATION_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center gap-3 border-b border-black/[0.07] py-2.5 text-sm text-black/85 last:border-0">
                      <CircleCheck className="size-[18px] shrink-0 text-[#00c853]" strokeWidth={1.6} /> {option}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 size-5 shrink-0 text-[#00c853]" strokeWidth={1.6} />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00c853]">Sample &amp; production</p>
                      <p className="mt-1.5 text-[13px] leading-6 text-black/55">Samples available on request.</p>
                      <p className="text-[13px] leading-6 text-black/55">Production lead time depends on order quantity and specifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetail
