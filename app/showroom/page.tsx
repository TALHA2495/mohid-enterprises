import Image from 'next/image'
import { ShowroomSection } from '@/components/showroom-section'
import type { Product } from '@/components/showroom-section'
import { SiteHeader } from '@/components/site-header'
import { CATALOG_DATA } from '@/lib/catalog-data'
import { loadShowroomProducts } from '@/lib/public-data.server'

// Revalidate so catalog edits made in /admin appear without a redeploy; the
// page would otherwise be frozen at build time.
export const revalidate = 60

// Live catalog. The server reads the published `products` rows through the
// service-role client (same pattern as loadHeroCategories on the home page) and
// hands them to the client grid, which owns filtering, deep links and the
// detail view. When Supabase is unconfigured, the table is missing, or no rows
// are published, the catalog the showroom already shipped is used instead — so
// a misconfigured deployment renders products rather than a blank grid.
export default async function Page() {
  const live = await loadShowroomProducts()
  // Static fallback gains the `images` array the detail-page switcher expects
  // (catalog entries carry a single `image`, so it becomes a one-element list).
  const products: Product[] =
    live.length > 0 ? live : CATALOG_DATA.map((p) => ({ ...p, images: [p.image] }))

  return <main id="main" className="relative bg-[#f4f7f8]"><div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 h-[100vh] overflow-hidden"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill quality={70} sizes="100vw" className="size-full object-cover" /></div><SiteHeader /><ShowroomSection products={products} /></main>
}
