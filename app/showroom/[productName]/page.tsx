import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetail from '@/components/showroom-detail'
import { loadShowroomProducts } from '@/lib/public-data.server'
import { CATALOG_DATA } from '@/lib/catalog-data'
import { SiteHeader } from '@/components/site-header'
import { StructuredData } from '@/components/structured-data'
import type { Product } from '@/components/showroom-section'
import { ORGANIZATION_ID, breadcrumbSchema, webPageSchema } from '@/lib/seo'

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

// Shared by generateMetadata and the page so slug resolution stays identical
// to the Link hrefs in the showroom grid (`encodeURIComponent(product.name)`).
function productPath(product: Product) {
  return `/showroom/${encodeURIComponent(product.name)}`
}

function productDescription(product: Product) {
  const base = product.description?.trim()
  return base
    ? `${base} Available from Mohid Enterprises, a textile trims manufacturer in Faisalabad, Pakistan.`
    : `${product.name} from Mohid Enterprises, a textile trims manufacturer in Faisalabad, Pakistan.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productName } = await params
  const live = await loadShowroomProducts()
  const products: Product[] =
    live.length > 0 ? live : CATALOG_DATA.map((p) => ({ ...p, images: [p.image] }))
  const product = products.find((p) => normalize(p.name) === normalize(productName))
  if (!product) notFound()

  const path = productPath(product)
  const description = productDescription(product)
  const image = product.images[0] ?? product.image
  const title = `${product.name} ${product.type.toLowerCase()} trim`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website', siteName: 'Mohid Enterprises', url: path,
      title: `${title} | Mohid Enterprises`, description,
      images: [{ url: image, alt: `${product.name} - ${product.type} trim` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mohid Enterprises`, description,
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { productName } = await params
  const live = await loadShowroomProducts()
  const products: Product[] =
    live.length > 0 ? live : CATALOG_DATA.map((p) => ({ ...p, images: [p.image] }))

  const target = normalize(productName)
  const product = products.find((p) => normalize(p.name) === target)

  if (!product) notFound()

  const path = productPath(product)
  const description = productDescription(product)
  // No Offer/price markup: prices are indicative and not published as data.
  const productSchema = {
    '@type': 'Product',
    name: product.name,
    description,
    image: product.images.length > 0 ? product.images : [product.image],
    category: product.type,
    brand: { '@type': 'Brand', name: 'Mohid Enterprises' },
    manufacturer: { '@id': ORGANIZATION_ID },
    material: product.material,
  }

  return (
    <div className="min-h-screen bg-white">
      <StructuredData
        data={[
          webPageSchema(`${product.name} ${product.type.toLowerCase()} trim`, path, description),
          breadcrumbSchema(product.name, path),
          productSchema,
        ]}
      />
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

