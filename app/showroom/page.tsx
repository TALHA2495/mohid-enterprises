import type { Metadata } from 'next'
import Image from 'next/image'
import { ShowroomSection } from '@/components/showroom-section'
import type { Product } from '@/components/showroom-section'
import { SiteHeader } from '@/components/site-header'
import { StructuredData } from '@/components/structured-data'
import { CATALOG_DATA } from '@/lib/catalog-data'
import { loadShowroomProducts } from '@/lib/public-data.server'
import { absoluteUrl, breadcrumbSchema, webPageSchema } from '@/lib/seo'

// Revalidate so catalog edits made in /admin appear without a redeploy; the
// page would otherwise be frozen at build time.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Textile Trims Showroom & Product Catalog',
  description:
    'Browse textile trims from Mohid Enterprises, including laces, cords, elastics, tapes, ribbons, tassels and pom poms, and request a quote for your requirements.',
  alternates: { canonical: '/showroom' },
  openGraph: {
    type: 'website', siteName: 'Mohid Enterprises', url: '/showroom',
    title: 'Textile Trims Showroom & Product Catalog | Mohid Enterprises',
    description: 'Browse textile trims manufactured by Mohid Enterprises in Faisalabad, Pakistan.',
    images: ['https://ik.imagekit.io/a2q8u8qtw/Hero/Textile%20Trims%20Manufacturing.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Textile Trims Showroom & Product Catalog | Mohid Enterprises',
    description: 'Browse textile trims manufactured by Mohid Enterprises in Faisalabad, Pakistan.',
    images: ['https://ik.imagekit.io/a2q8u8qtw/Hero/Textile%20Trims%20Manufacturing.jpg'],
  },
}

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

  const collectionDescription = 'Textile trims manufactured by Mohid Enterprises in Faisalabad, Pakistan, with 20+ years of manufacturing experience.'
  const itemList = {
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: { '@type': 'Product', name: product.name, description: product.description, image: product.image, url: absoluteUrl(`/showroom?product=${encodeURIComponent(product.name)}`) },
    })),
  }
  const structuredData = [
    { ...webPageSchema('Textile Trims Showroom & Product Catalog', '/showroom', collectionDescription), mainEntity: itemList },
    breadcrumbSchema('Showroom', '/showroom'),
  ]

  return <main id="main" className="relative bg-[#f4f7f8]"><StructuredData data={structuredData} /><div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 h-[100vh] overflow-hidden"><Image src="/images/trims2.webp" alt="" priority fetchPriority="high" fill quality={70} sizes="100vw" className="size-full object-cover" /></div><SiteHeader /><ShowroomSection products={products} /></main>
}
