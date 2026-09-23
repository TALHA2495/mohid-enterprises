import { getProductStats } from '@/lib/public-data.server'

// ---------------------------------------------------------------------------
// Factory snapshot — the credibility strip under the /factory headline.
//
// The two counts are read live from `products` (lib/public-data.server.ts), so
// an admin's catalog edit shows up once the page's 60s ISR window passes; the
// loader falls back to last-verified numbers if Supabase is unreachable, which
// keeps the strip's shape intact.
//
// Accessibility: numbers are `text-black` (21:1 on white — AAA) and labels
// `text-black/55` (4.8:1 — AA). The green dot is decorative only: #00c853 on
// white is 2.2:1, so it is aria-hidden and never carries meaning.
// ---------------------------------------------------------------------------

type Metric = { value: string; label: string }

export async function FactorySnapshot() {
  const stats = await getProductStats()

  const metrics: Metric[] = [
    { value: String(stats.totalProducts), label: 'Products' },
    { value: String(stats.trimTypes), label: 'Trims Types' },
    { value: `${stats.yearsManufacturing}+`, label: 'Years Manufacturing' },
  ]

  return <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">{metrics.map((metric) =>

    // White cards rather than bare figures: the strip overlaps the backdrop
    // photo at most viewports, and black-on-photo would be unreadable.
    <li key={metric.label} className="rounded-2xl border border-black/10 bg-white p-6">

      <p className="flex items-center gap-2 font-mono text-4xl font-semibold tabular-nums text-black">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#00c853]" />
        {metric.value}
      </p>

      <p className="mt-2 text-sm text-black/55">{metric.label}</p>

    </li>)}

  </ul>
}
