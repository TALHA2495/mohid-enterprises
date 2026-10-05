import { notFound } from 'next/navigation'
import ProductDetail from '@/components/showroom-detail'
import { loadShowroomProducts } from '@/lib/public-data.server'
import { CATALOG_DATA } from '@/lib/catalog-data'
import { SiteHeader } from '@/components/site-header'
import type { Product } from '@/components/showroom-section'

export const revalidate = 3600

type Props = {
  params: Promise<{ productName: string }>
}

function normalize(str: string): string {
  let decoded = str
  try {
    decoded = decodeURIComponent(str)
  } catch {}
  try {
    decoded = decodeURIComponent(decoded)
  } catch {}
  return decoded.replace(/\+/g, ' ').trim().toLowerCase()
}

export default async function ProductPage({ params }: Props) {
  const { productName } = await params
  const live = await loadShowroomProducts()
  const products: Product[] =
    live.length > 0 ? live : CATALOG_DATA.map((p) => ({ ...p, images: [p.image] }))

  const target = normalize(productName)
  const product = products.find((p) => normalize(p.name) === target)

  if (!product) notFound()

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <ProductDetail product={product} isDetailPage={true} />
    </div>
  )
}

export async function generateStaticParams() {
  const live = await loadShowroomProducts()
  const products = live.length > 0 ? live : CATALOG_DATA
  return products.map((p) => ({ productName: p.name }))
}

