'use client'

import { ArrowLeft, ArrowUpRight, ChevronDown, CircleCheck, Package, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
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

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
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
    <section className="product-detail relative z-10 min-h-screen overflow-hidden bg-[#f4f7f8] px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#00c853] transition-colors hover:text-[#00ff59]">
          <ArrowLeft className="size-4" /> Back to showroom
        </button>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.02fr_1fr] lg:gap-8">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white lg:self-start">
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
                      ? 'border-[#00ff59]'
                      : 'border-black/10 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]'
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
                className="group relative aspect-[16/11] overflow-hidden bg-black/5"
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
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">{product.type} · {product.material}</p>
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
                href={`mailto:info@mohident.com?subject=${encodeURIComponent(`Physical sample request — ${product.name}`)}`}
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
