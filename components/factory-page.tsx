import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from './page-shell'
import { FactorySnapshot } from './factory-snapshot'
import { loadFactorySections } from '@/lib/public-data.server'
import type { FactorySection } from '@/lib/public-data.server'
import { factoryCapacity } from '@/lib/factory-capacity'

// ---------------------------------------------------------------------------
// /factory — the three photo tiles are DB-driven (`factory_sections` rows with
// kind='hero'); sort_order decides the running order. Their `subtitle` is
// ignored here because each tile carries its own overlay caption.
//
// INTENTIONAL DEVIATION from DESIGN.md principle #2 (2026 restructure): the
// capability-card row that used to follow the tiles was retired. Bulk buyers
// scan this page to answer two questions — "what do you make?" and "can you
// scale?" — and the operational trio (Quality Inspection Protocol / Export
// Packaging / Incoterms & Logistics) pushed that answer below the fold.
//
// The rows were NOT deleted: they sit in `factory_sections` with
// is_active=false, so the copy and photography are one UPDATE away from
// returning. Revisit the trade-off against CTA conversion and time-on-page
// once the new hero has traffic.
//
// FALLBACK_HERO holds the SAME ImageKit URLs the seed writes, so the page
// renders identically whether the rows come from Supabase or not.
// ---------------------------------------------------------------------------

const CDN = 'https://ik.imagekit.io/a2q8u8qtw/factory'

const FALLBACK_HERO: FactorySection[] = [
  { id: 'fallback-hero-1', kind: 'hero', title: 'Textile Trims', subtitle: null, imageUrl: `${CDN}/textile%20production.webp`, sortOrder: 10 },
  { id: 'fallback-hero-2', kind: 'hero', title: 'Braids & Cords', subtitle: null, imageUrl: `${CDN}/Braiding%20Winding.webp`, sortOrder: 20 },
  { id: 'fallback-hero-3', kind: 'hero', title: 'Packed for Export', subtitle: null, imageUrl: `${CDN}/packed%20inventory.png`, sortOrder: 30 },
]

/** Published hero tiles, or the shipped ones when none are published. */
function pickHeroes(sections: FactorySection[]): FactorySection[] {
  const rows = sections.filter((section) => section.kind === 'hero')
  return rows.length > 0 ? rows : FALLBACK_HERO
}

export async function FactoryPage({ embedded = false }: { embedded?: boolean } = {}) {
  const heroes = pickHeroes(await loadFactorySections())
  const Heading = embedded ? 'h2' : 'h1'

  const content = (

    <section className={embedded ? 'homepage-motion-section border-t border-[#101412]/10 bg-[#f7f8f5] px-5 pb-16 pt-8 text-[#101412] sm:px-8 sm:pb-20 sm:pt-10' : 'mx-auto max-w-7xl px-5 py-8 text-[#101412] sm:px-8'}>
      <Heading className={`mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-[#101412] sm:text-5xl`}>{embedded ? 'Sampling to Bulk Production' : '20+ Years of Proven Trims Manufacturing'}</Heading>

      <p className={`mt-3 max-w-2xl text-sm leading-6 text-[#46534c]`}>From sampling to bulk production: ribbons, tassels, elastic, jute cord, conveyor belts, and more.</p>

      <section className="relative z-10 bg-[#f4f7f8] px-4 py-12 sm:px-6 md:py-16 my-8 rounded-2xl">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-fraunces text-3xl font-bold text-[#101412] mb-8">Production Capacity</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="rounded-lg border border-[#101412]/10 bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">Daily Output</div>
              <div className="mt-3 text-lg font-semibold text-[#101412]">{factoryCapacity.production.dailyOutput}</div>
            </div>
            <div className="rounded-lg border border-[#101412]/10 bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">Min Order</div>
              <div className="mt-3 text-lg font-semibold text-[#101412]">{factoryCapacity.production.minOrderQuantity} meters</div>
            </div>
            <div className="rounded-lg border border-[#101412]/10 bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">Lead Time</div>
              <div className="mt-3 text-lg font-semibold text-[#101412]">{factoryCapacity.production.standardLeadTime}</div>
            </div>
            <div className="rounded-lg border border-[#101412]/10 bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#00c853]">Max Batch</div>
              <div className="mt-3 text-lg font-semibold text-[#101412]">{factoryCapacity.production.maxBatchSize}</div>
            </div>
          </div>

          <div className="mb-12 rounded-lg border border-[#101412]/10 bg-white p-8">
            <h3 className="mb-4 text-xl font-semibold text-[#101412]">Workforce</h3>
            <p className="mb-3 text-[#101412]/80">{factoryCapacity.workforce.teamSize}</p>
            <p className="text-sm text-[#101412]/70">Expertise: {factoryCapacity.workforce.expertise.join(' • ')}</p>
            <p className="mt-3 text-sm text-[#101412]/70">{factoryCapacity.workforce.training}</p>
          </div>

          <div className="mb-12 rounded-lg border border-[#101412]/10 bg-white p-8">
            <h3 className="mb-4 text-xl font-semibold text-[#101412]">Equipment</h3>
            <ul className="space-y-2 text-sm text-[#101412]/70">
              <li>Braiding: {factoryCapacity.equipment.braiding}</li>
              <li>Weaving: {factoryCapacity.equipment.weaving}</li>
              <li>Packaging: {factoryCapacity.equipment.packaging}</li>
              <li>QC: {factoryCapacity.equipment.qc}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#101412]/10 bg-white p-8">
            <h3 className="mb-4 text-xl font-semibold text-[#101412]">Logistics</h3>
            <p className="text-sm text-[#101412]/70">Terms: {factoryCapacity.logistics.incoterms.join(' | ')}</p>
            <p className="text-sm text-[#101412]/70 mt-2">Partners: {factoryCapacity.logistics.shippingPartners.join(' • ')}</p>
            <p className="text-sm text-[#101412]/70 mt-2">Export Lead: {factoryCapacity.logistics.exportLeadTime}</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{heroes.map((tile) =>

      <figure key={tile.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#101412]/12">

        <Image src={tile.imageUrl} alt={`${tile.title} manufacturing at Mohid Enterprises`} fill loading="lazy" quality={70} sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 92vw" className="size-full object-cover" />

        {/* The visible caption carries the tile's meaning, so the image stays
            decorative (alt="") instead of repeating itself to screen readers. */}
        <figcaption className="absolute bottom-3 left-3 text-xs font-medium text-white drop-shadow-md">{tile.title}</figcaption>

      </figure>)}

      </div>

      <div className="flex justify-center">
        {/* <Link href="/quote" className="inline-flex items-center gap-2 rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98]">Request a Quote<ArrowUpRight className="size-4" strokeWidth={1.6} /></Link> */}
      </div>

    </section>
  )

  return embedded ? content : <PageShell>{content}</PageShell>
}
