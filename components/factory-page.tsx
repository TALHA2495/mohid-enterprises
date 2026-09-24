import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from './page-shell'
import { FactorySnapshot } from './factory-snapshot'
import { loadFactorySections } from '@/lib/public-data.server'
import type { FactorySection } from '@/lib/public-data.server'

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

export async function FactoryPage() {
  const heroes = pickHeroes(await loadFactorySections())

  return <PageShell>
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">


    <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-5xl">20+ Years of Proven Trims Manufacturing</h1>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 drop-shadow-sm">From sampling to bulk production: ribbons, tassels, elastic, jute cord, conveyor belts, and more.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{heroes.map((tile) =>

      <figure key={tile.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/10">

        <Image src={tile.imageUrl} alt="" fill loading="lazy" quality={70} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover" />

        {/* The visible caption carries the tile's meaning, so the image stays
            decorative (alt="") instead of repeating itself to screen readers. */}
        <figcaption className="absolute bottom-3 left-3 text-xs font-medium text-white drop-shadow-md">{tile.title}</figcaption>

      </figure>)}

    </div>

    <div className="mt-12 flex justify-center">
      <Link href="/quote" className="inline-flex items-center gap-2 rounded-full bg-[#01aa3f] px-7 py-3.5 text-sm font-medium text-black transition-all hover:-translate-y-px hover:bg-[#00ff59] hover:text-black active:scale-[0.98]">Request a Quote<ArrowUpRight className="size-4" strokeWidth={1.6} /></Link>
    </div>

  </section>
  </PageShell>
}
