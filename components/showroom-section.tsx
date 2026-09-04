'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight, CircleCheck, Globe, Package, Ruler, SlidersHorizontal, TreePine } from 'lucide-react'
import { useEffect, useState } from 'react'

type Product = {
  name: string
  type: string
  description: string
  material: string
  width: string
  colors: string
  finish: string
  image: string
  specs: [string, string][]
}

const products: Product[] = [
  {
    name: 'Fringe Lace', type: 'LACE', image: '/images/fringe-lace.webp',
    description: 'Soft, expressive fringe for trims and statement edges.',
    material: 'Cotton blend', width: '10mm–50mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Fringe lace'], ['Material composition', 'Cotton blend'], ['Available widths', '10mm–50mm'], ['Minimum order quantity', '500 meters'], ['Color options', 'Custom color matching'], ['Finish', 'Natural / brushed'], ['Lead time', '2–3 weeks']],
  },
  {
    name: 'Twill Tape', type: 'TAPE', image: '/images/twill-tape.webp',
    description: 'Reliable cotton twill tape for garment labeling, binding, and decorative trims.',
    material: 'Cotton', width: '10mm–50mm', colors: 'Custom', finish: 'Soft',
    specs: [['Product type', 'Twill tape (SKU-T-02)'], ['Material composition', 'Cotton'], ['Available widths', '10mm–50mm'], ['Minimum order quantity', '500 meters'], ['Material weight', '180 g/m²'], ['Finish', 'Natural / bleached / dyed'], ['Color options', 'Custom color matching'], ['Roll length', '100m per roll (standard)']],
  },
  {
    name: 'Web Tape', type: 'TAPE', image: '/images/web-tape.webp',
    description: 'Clean woven construction for dependable finishing and repeat production.',
    material: 'Polyester', width: '20mm–60mm', colors: 'Custom', finish: 'Woven',
    specs: [['Product type', 'Woven web tape'], ['Material composition', 'Polyester'], ['Available widths', '20mm–60mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Woven / dyed'], ['Lead time', '2–3 weeks']],
  },
  {
    name: 'Golden Tassel', type: 'TASSEL', image: '/images/golden-tassel.webp',
    description: 'A polished accent with a warm metallic finish for elevated details.',
    material: 'Polyester', width: '30mm–80mm', colors: 'Gold tones', finish: 'Metallic',
    specs: [['Product type', 'Decorative tassel'], ['Material composition', 'Polyester'], ['Available widths', '30mm–80mm'], ['Minimum order quantity', '250 pieces'], ['Finish', 'Metallic'], ['Lead time', '3–4 weeks']],
  },
  {
    name: 'Metal Cord', type: 'CORD', image: '/images/metal-cord.webp',
    description: 'Structured cord with a refined surface texture.',
    material: 'Metallic yarn', width: '2mm–8mm', colors: 'Custom', finish: 'Polished',
    specs: [['Product type', 'Metal cord'], ['Material composition', 'Metallic yarn'], ['Available widths', '2mm–8mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Polished'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Pom Pom Trim', type: 'POM POM', image: '/images/pom-pom-trim.webp',
    description: 'Playful volume for apparel and home details.',
    material: 'Polyester', width: '10mm–25mm', colors: 'Custom', finish: 'Soft',
    specs: [['Product type', 'Pom pom trim'], ['Material composition', 'Polyester'], ['Available widths', '10mm–25mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Soft'], ['Lead time', '2–3 weeks']],
  },
  {
    name: 'Cotton Fringe', type: 'FRINGE', image: '/images/cotton-fringe.webp',
    description: 'Natural cotton texture with an easy, soft hand.',
    material: '100% cotton', width: '25mm–100mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Cotton fringe'], ['Material composition', '100% cotton'], ['Available widths', '25mm–100mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Natural'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Woven Belt', type: 'UTILITY', image: '/images/woven-belt.webp',
    description: 'Hard-wearing woven utility trim made for scale.',
    material: 'Polyester', width: '25mm–40mm', colors: 'Custom', finish: 'Durable',
    specs: [['Product type', 'Woven utility belt'], ['Material composition', 'Polyester'], ['Available widths', '25mm–40mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Durable woven'], ['Lead time', '3 weeks']],
  },
]

const filters = ['All trims', 'Laces', 'Tapes', 'Pom poms', 'Utility']

export function ShowroomSection() {
  const [selected, setSelected] = useState<Product | null>(null)
  const [filter, setFilter] = useState('All trims')
  const visible = products.filter((product) => filter === 'All trims' || product.type.toLowerCase().includes(filter.slice(0, -1).toLowerCase()))

  if (selected) return <ProductDetail key={selected.name} product={selected} onBack={() => setSelected(null)} />

  return (
    <section id="showroom" className="relative z-10 px-4 pb-16 pt-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Product filters">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${
                filter === item
                  ? 'border-[#01aa3f] bg-[#01aa3f] text-[#ffffff]'
                  : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((product) => (
            <button
              key={product.name}
              type="button"
              onClick={() => setSelected(product)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101413] text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#00c853]/50 hover:bg-[#151a19]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-black/40">
                <img
                  src={product.image}
                  alt={`${product.name} textile trim`}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] tracking-[0.18em] text-[#00c853]">{product.type}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-white">{product.name}</h2>
                  <ArrowRight className="mt-1 size-4 text-white/30 group-hover:text-[#00c853]" />
                </div>
                <p className="mt-2 text-xs leading-5 text-white/50">{product.description}</p>
                <span className="mt-4 inline-flex text-xs font-medium text-white/80 underline decoration-white/20 underline-offset-4 transition-colors group-hover:text-[#00c853] group-hover:decoration-[#00c853]">View details</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

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
  const [titleFirst, ...titleRest] = product.name.split(' ')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const specChips = [
    { icon: TreePine, label: 'Material', value: product.material },
    { icon: Ruler, label: 'Width range', value: product.width },
    { icon: Package, label: 'Length', value: findSpec(product, ['roll length', 'length'], 'On request') },
    { icon: Globe, label: 'Origin', value: 'Pakistan' },
  ]


  return (
    <section className="product-detail relative z-10 min-h-screen overflow-hidden bg-[#0a0c0b] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.05),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-[#00c853] transition-colors hover:text-[#00ff59]">
          <ArrowLeft className="size-4" /> Back to showroom
        </button>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-12">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101413]">
            <div className="relative aspect-[16/11] overflow-hidden bg-black/40">
              <img
                src={product.image}
                alt={`${product.name} textile trim — ${GALLERY_VIEWS[view].label}`}
                className={`size-full object-cover transition-transform duration-500 ${GALLERY_VIEWS[view].className}`}
              />
              <button type="button" aria-label="Previous image" onClick={() => setView((view - 1 + GALLERY_VIEWS.length) % GALLERY_VIEWS.length)} className="absolute left-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
                <ArrowLeft className="size-4" />
              </button>
              <button type="button" aria-label="Next image" onClick={() => setView((view + 1) % GALLERY_VIEWS.length)} className="absolute right-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
                <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2.5 p-3.5">
              {GALLERY_VIEWS.map((galleryView, index) => (
                <button key={galleryView.label} type="button" onClick={() => setView(index)} aria-label={`Show ${galleryView.label.toLowerCase()}`} aria-pressed={view === index} className={`relative h-14 min-w-16 flex-1 overflow-hidden rounded-lg border transition ${view === index ? 'border-[#00c853] ring-1 ring-[#00c853]' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                  <img src={product.image} alt="" className={`size-full object-cover ${galleryView.className}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">{product.type} · {product.material}</p>
            <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[64px]">
              {titleFirst} {titleRest.length > 0 && <span className="text-[#00c853]">{titleRest.join(' ')}</span>}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/60">
              {product.description} Produced to consistent width and finish density.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
              {specChips.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-[#101413] p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-[#00c853]" strokeWidth={1.6} />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</p>
                    <p className="mt-1.5 text-sm leading-5 text-white/90">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3.5 sm:flex-row">
              <a
                href="/quote"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#01aa3f] px-6 py-3.5 text-sm font-semibold text-[#ffffff] transition-colors hover:bg-[#00ff59]"
              >
                Request quote &amp; sample <ArrowUpRight className="size-4" />
              </a>
              <a
                href="/quote"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm text-white transition-colors hover:bg-white/10"
              >
                Request physical sample
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
              {PRODUCT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                  <CircleCheck className="size-[18px] text-[#00c853]" strokeWidth={1.6} /> {feature}
                </li>
              ))}
            </ul>

          </div>
        </div>

        <div className="product-cards-grid mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101413] p-6 sm:p-8">
            <span aria-hidden="true" className="absolute left-0 top-8 h-14 w-[3px] rounded-r-full bg-[#00c853]" />
            <h2 className="text-lg font-semibold text-white">Technical specifications</h2>
            <div className="mt-6">
              {product.specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-4 border-b border-white/[0.07] py-3.5 last:border-0">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</dt>
                  <dd className="text-sm leading-6 text-white/85">{value}</dd>
                </div>
              ))}
            </div>
          </div>
          <div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#101413] p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="size-5 text-white/70" strokeWidth={1.6} />
              <h2 className="text-lg font-semibold text-white">Customization options</h2>
            </div>
            <div className="mt-4">
              {CUSTOMIZATION_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-3 border-b border-white/[0.07] py-3.5 text-sm text-white/85 last:border-0">
                    <CircleCheck className="size-[18px] shrink-0 text-[#00c853]" strokeWidth={1.6} /> {option}
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3.5">
                <Package className="mt-0.5 size-5 shrink-0 text-[#00c853]" strokeWidth={1.6} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00c853]">Sample &amp; production</p>
                  <p className="mt-2 text-[13px] leading-6 text-white/55">Samples available on request.</p>
                  <p className="text-[13px] leading-6 text-white/55">Production lead time depends on order quantity and specifications.</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
