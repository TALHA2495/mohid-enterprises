// ---------------------------------------------------------------------------
// lib/catalog-data.ts — SOURCE OF TRUTH for the static catalog fallback.
//
// This module is hand-maintained. It used to be generated from the array that
// lived inline in components/showroom-section.tsx; that array has since been
// removed, so this file IS the record of what the showroom shipped.
//
// It exists so:
//   (a) app/showroom/page.tsx can fall back to it when Supabase is
//       unconfigured or the `products` table is empty, and
//   (b) scripts/generate-catalog-seed.mjs has a typed copy to read, and
//   (c) lib/public-data.server.ts can backfill individual fields
//       (type/description/material/width/colors/finish/specs/image) when a DB
//       row does not carry them.
//
// The LIVE catalog is the `products` table (read server-side through the
// service-role client in lib/public-data.server.ts). Keep the two in step when
// the product line changes.
//
// DO NOT import this from a 'use client' component — the array is ~27 KB and
// would bloat every bundle that touches the showroom. Server components only.
// ---------------------------------------------------------------------------
import type { ProductType } from '@/lib/showroom'

export type CatalogProduct = {
  name: string
  type: ProductType
  image: string
  description: string
  material: string
  width: string
  colors: string
  finish: string
  specs: [string, string][]
  moq?: number
  pricingTiers?: { quantity: number; pricePerMeter: number }[]
  leadTime?: string
  weight?: string
  compliance?: { oekotex?: boolean; certificates?: string[] }
}

export const CATALOG_DATA: CatalogProduct[] = [
  { name: 'Fringe Lace', type: 'LACE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/all_Cotton_Fringe.webp?tr=w-1200,f-auto,q-70', description: 'Soft, expressive fringe for trims and statement edges.', material: 'Cotton blend', width: '10mm�50mm', colors: 'Custom', finish: 'Natural', specs: [['Product type', 'Fringe lace'], ['Material composition', 'Cotton blend'], ['Available widths', '10mm�50mm'], ['Minimum order quantity', '500 meters'], ['Color options', 'Custom color matching'], ['Finish', 'Natural / brushed'], ['Lead time', '2�3 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Golden Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Golden_Tassel.webp?tr=w-1200,f-auto,q-70', description: 'A polished accent with a warm metallic finish for elevated details.', material: 'Polyester', width: '30mm�80mm', colors: 'Gold tones', finish: 'Metallic', specs: [['Product type', 'Decorative tassel'], ['Material composition', 'Polyester'], ['Available widths', '30mm�80mm'], ['Minimum order quantity', '250 pieces'], ['Finish', 'Metallic'], ['Lead time', '3�4 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Metal Cord', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Metal%20Cord.webp', description: 'Structured cord with a refined surface texture.', material: 'Metallic yarn', width: '2mm�8mm', colors: 'Custom', finish: 'Polished', specs: [['Product type', 'Metal cord'], ['Material composition', 'Metallic yarn'], ['Available widths', '2mm�8mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Polished'], ['Lead time', '3 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom Pom Trim', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom_Trim.webp?tr=w-1200,f-auto,q-70', description: 'Playful volume for apparel and home details.', material: 'Polyester', width: '10mm�25mm', colors: 'Custom', finish: 'Soft', specs: [['Product type', 'Pom pom trim'], ['Material composition', 'Polyester'], ['Available widths', '10mm�25mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Soft'], ['Lead time', '2�3 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Cotton Fringe', type: 'FRINGE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Cotton_Fringe.webp?tr=w-1200,f-auto,q-70', description: 'Natural cotton texture with an easy, soft hand.', material: '100% cotton', width: '25mm�100mm', colors: 'Custom', finish: 'Natural', specs: [['Product type', 'Cotton fringe'], ['Material composition', '100% cotton'], ['Available widths', '25mm�100mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Natural'], ['Lead time', '3 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Woven Belt', type: 'UTILITY', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Woven%20Belt.png', description: 'Hard-wearing woven utility trim made for scale.', material: 'Polyester', width: '25mm�40mm', colors: 'Custom', finish: 'Durable', specs: [['Product type', 'Woven utility belt'], ['Material composition', 'Polyester'], ['Available widths', '25mm�40mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Durable woven'], ['Lead time', '3 weeks']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Needle Loom Elastic', type: 'ELASTIC', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Needle_Loom_Elastic.webp?tr=w-1200,f-auto,q-70', description: 'Strong, durable elastic with a soft and smooth finish.', material: 'Nylon / Polyester', width: 'Various', colors: 'White, Black, Natural, Beige, Grey, Navy Blue, Brown, Multi Color', finish: 'Soft / Smooth', specs: [['Product type', 'Needle loom elastic'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Crochet Elastic', type: 'ELASTIC', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Crochet%20Elastic.png', description: 'Stretchy, durable crochet elastic designed for comfortable textile applications.', material: 'Latex / Polyester', width: 'Various', colors: 'White, Black, Beige, Grey, Navy Blue, Multi Color', finish: 'Soft / Flexible', specs: [['Product type', 'Crochet elastic'], ['Material composition', 'Latex / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / flexible'], ['Applications', 'Waistbands, undergarments, crafts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Jacquard Elastic & Tape', type: 'ELASTIC', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Jacquard_Elastic___Tape.webp?tr=w-1200,f-auto,q-70', description: 'Strong jacquard elastic and tape with custom branding and woven designs.', material: 'Nylon / Polyester', width: 'Custom', colors: 'Custom', finish: 'Woven / Jacquard', specs: [['Product type', 'Jacquard elastic & tape'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Custom'], ['Color options', 'Custom color matching'], ['Design options', 'Logo, text, branded, custom'], ['Finish', 'Woven / jacquard'], ['Applications', 'Garments, waistbands, sportswear']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Elastics', type: 'ELASTIC', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Loom%20Elastic_XnZ43cMo2.webp', description: 'General-purpose textile elastics available in multiple materials and colors.', material: 'Nylon / Polyester / Polypropylene', width: 'Various', colors: 'Multiple colors', finish: 'Flexible', specs: [['Product type', 'General elastic'], ['Material composition', 'Nylon / Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Flexible'], ['Applications', 'Garment industry']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Draw Cord', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Draw%20Cord.avif', description: 'Strong and flexible draw cord available in solid, striped and patterned designs.', material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes', specs: [['Product type', 'Draw cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Solid, striped, reflective, two-tone, multi color'], ['Design options', 'Flat, round, patterned, custom'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments, sportswear']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Flat Draw Cord', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Flat_Draw_Cord.webp?tr=w-1200,f-auto,q-70', description: 'Strong, smooth flat draw cord for garment and sportswear applications.', material: 'Polyester / Nylon', width: 'Various', colors: 'Blue/White, Black/White, Green/White, Red/White, Purple/White, Multi Color', finish: 'Soft / Smooth', specs: [['Product type', 'Flat draw cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Hoods, waistbands, sportswear']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Drawstring Cord', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Drawstring_Cord.webp?tr=w-1200,f-auto,q-70', description: 'Durable, flexible drawstring cord available in a range of finishes.', material: 'Polyester / Nylon', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes', specs: [['Product type', 'Drawstring cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Cord with Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Cord_with_Tassel.webp?tr=w-1200,f-auto,q-70', description: 'Decorative cord finished with an elegant tassel end.', material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Gold, Gold/Metallic', finish: 'Metallic', specs: [['Product type', 'Cord with tassel'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Gold, Gold/Metallic'], ['Finish', 'Metallic'], ['Applications', 'Garments, bags, accessories, crafts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Draw Cord Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Draw_Cord_with_Tassel.webp?tr=w-1200,f-auto,q-70', description: 'Colorful decorative tassel finish for drawstrings and accessories.', material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Tassel', specs: [['Product type', 'Draw cord tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color tassels'], ['Finish', 'Tassel'], ['Applications', 'Drawstrings, bags, hoodies, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Multi Color Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Multi_Color_Tassel.webp?tr=w-1200,f-auto,q-70', description: 'Soft, colorful fringed tassels available in different lengths.', material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Fringed', specs: [['Product type', 'Multi color tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color'], ['Available lengths', 'Various'], ['Finish', 'Fringed'], ['Applications', 'Garments, bags, crafts, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Tassels', type: 'TASSEL', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Tassel.webp?tr=w-1200,f-auto,q-70', description: 'Classic decorative tassels for garments, bags, and home d�cor.', material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative', specs: [['Product type', 'Tassels'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Flat Shoelaces', type: 'SHOELACE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Flat_Shoelaces.webp?tr=w-1200,f-auto,q-70', description: 'Durable flat shoelaces available in multiple colors and patterns.', material: 'Polyester / Nylon', width: 'Various', colors: 'White, Black, Grey, Navy Blue, Red, Royal Blue, Beige, Brown, Neon Green, Purple Metallic, White/Cream, Black/White Striped, Orange/Tan Metallic, Cream/Beige, Yellow, Green, Patterned, Multi Color', finish: 'Woven / Soft', specs: [['Product type', 'Flat shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors and patterns'], ['Finish', 'Woven / soft'], ['Applications', 'Sneakers, shoes, boots, hoodies'], ['Customization', 'Custom length, colors and patterns']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Waxy Shoelaces', type: 'SHOELACE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Waxy_Shoelaces.webp?tr=w-1200,f-auto,q-70', description: 'High-strength wax-coated shoelaces designed for durability and a tangle-free finish.', material: 'Polyester / Nylon', width: 'Various', colors: 'Black, Brown, Dark Brown, Navy Blue, Grey, White, Beige, Multi Color', finish: 'Wax Coated', specs: [['Product type', 'Waxy shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Wax coated'], ['Features', 'High strength, tangle free, water resistant'], ['Applications', 'Shoes and boots']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Tricot Knitting Tape', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Tricot_Knitting_Tape.webp?tr=w-1200,f-auto,q-70', description: 'Strong and smooth knitted tape for garment construction and finishing.', material: 'Polyester / Nylon', width: 'Various', colors: 'White/White, Navy/White/Black, Red/White/Black, Red/Green, Multi, Silver Stripe', finish: 'Soft / Smooth', specs: [['Product type', 'Tricot knitting tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Twill Tape', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Twill_Tape.webp?tr=w-1200,f-auto,q-70', description: 'Strong and flexible twill tape available in multiple widths and colors.', material: 'Cotton / Polyester', width: '10mm�50mm', colors: 'Multiple colors', finish: 'Twill Weave', specs: [['Product type', 'Twill tape'], ['Material composition', 'Cotton / Polyester'], ['Available widths', '10mm, 15mm, 20mm, 25mm, 30mm, 38mm, 50mm'], ['Color options', 'Multiple colors'], ['Finish', 'Twill weave'], ['Applications', 'Garments, bags, accessories'], ['Customization', 'Custom width, length and colors']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Neck Tapes', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Neck%20Tapes.png', description: 'Soft woven neck tape designed for comfortable garment finishing.', material: 'Polyester / Nylon', width: 'Various', colors: 'Red, Green, Light Blue, Black, White, Beige, Royal Blue, Mint, Purple, Multipack', finish: 'Soft / Woven', specs: [['Product type', 'Neck tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / woven'], ['Applications', 'T-shirts, polos, hoodies, jackets, sportswear']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Mesh Ribbon', type: 'RIBBON', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Mesh_Ribbon.webp?tr=w-1200,f-auto,q-70', description: 'Soft, breathable decorative mesh ribbon for textile and craft applications.', material: 'Polyester', width: 'Various', colors: 'White', finish: 'Soft / Breathable', specs: [['Product type', 'Mesh ribbon'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'White'], ['Finish', 'Soft / breathable'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Ribbons', type: 'RIBBON', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Ribbons.webp?tr=w-1200,f-auto,q-70', description: 'Decorative ribbons available in multiple colors and widths.', material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative', specs: [['Product type', 'Ribbons'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Web Tape', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Web_Tape.webp?tr=w-1200,f-auto,q-70', description: 'Clean woven construction for dependable finishing and repeat production.', material: 'Polyester / Polypropylene', width: 'Various', colors: 'Various', finish: 'Woven', specs: [['Product type', 'Web tape'], ['Material composition', 'Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Jute Tape', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Jute_Tape.webp?tr=w-1200,f-auto,q-70', description: 'Natural, strong and biodegradable jute tape.', material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural', specs: [['Product type', 'Jute tape'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Label Tape', type: 'TAPE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Label_Tape.webp?tr=w-1200,f-auto,q-70', description: 'Printable label tape for branding and garment identification.', material: 'Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Printable', specs: [['Product type', 'Label tape'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Printable'], ['Applications', 'Garments, branding, identification']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Waist Belt', type: 'UTILITY', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Waste_Belt.webp?tr=w-1200,f-auto,q-70', description: 'Recycled material belt for sustainable garment production.', material: 'Recycled material', width: 'Various', colors: 'Various', finish: 'Utility', specs: [['Product type', 'Waist belt'], ['Material composition', 'Recycled material'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Utility'], ['Applications', 'Garments, sustainable production']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Cotton Belts', type: 'UTILITY', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Cotton_Belts.webp?tr=w-1200,f-auto,q-70', description: 'Natural cotton belt available in multiple widths and colors.', material: '100% Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Natural / Soft', specs: [['Product type', 'Cotton belt'], ['Material composition', '100% Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Natural / soft'], ['Applications', 'Garments, bags, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'All Types Belts', type: 'UTILITY', image: 'https://ik.imagekit.io/a2q8u8qtw/products/all_Cotton_Belts.webp?tr=w-1200,f-auto,q-70', description: 'Multi-material belts including nylon, polyester, polypropylene, and cotton.', material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Woven', specs: [['Product type', 'Multi-type belt'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom-pom', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom.webp?tr=w-1200,f-auto,q-70', description: 'Soft, playful pom-poms available in multiple colors and sizes.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush', specs: [['Product type', 'Pom-pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom Pom Lace', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom_lace.webp?tr=w-1200,f-auto,q-70', description: 'Decorative pom-pom lace trim for garments and accessories.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush', specs: [['Product type', 'Pom pom lace'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, accessories, crafts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom Pom Ball', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom_Ball.webp?tr=w-1200,f-auto,q-70', description: 'Round pom-pom balls available in multiple sizes and colors.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush', specs: [['Product type', 'Pom pom ball'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom Pom Toys', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom_toys.webp?tr=w-1200,f-auto,q-70', description: 'Soft, playful pom-pom toys for children and crafts.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Playful', specs: [['Product type', 'Pom pom toy'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / playful'], ['Applications', 'Toys, crafts, children products']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pom Pom Flower', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Pom_Pom_Flower.webp?tr=w-1200,f-auto,q-70', description: 'Decorative pom-pom flowers for garments and home d�cor.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Decorative', specs: [['Product type', 'Pom pom flower'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / decorative'], ['Applications', 'Garments, home decor, crafts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Multi Pom Pom', type: 'POM POM', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Multi_Pom_Pom.webp?tr=w-1200,f-auto,q-70', description: 'Multi-colored pom-poms available in various sizes.', material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Soft / Plush', specs: [['Product type', 'Multi pom pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multi-color'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Party Hat / Birthday Cap', type: 'PARTY', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Party_Hat.webp?tr=w-1200,f-auto,q-70', description: 'Decorative party hats and birthday caps available in multiple colors.', material: 'Paper / Cardboard / Synthetic', width: 'Various', colors: 'Multiple colors', finish: 'Decorative', specs: [['Product type', 'Party hat / birthday cap'], ['Material composition', 'Paper / cardboard / synthetic'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Birthday parties, celebrations, events']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Fancy Lace', type: 'LACE', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Fancy_Lace.webp?tr=w-1200,f-auto,q-70', description: 'Soft and delicate decorative lace available in multiple designs.', material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Delicate', specs: [['Product type', 'Fancy lace'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Soft / delicate'], ['Applications', 'Garments, lingerie, crafts, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'All Fancy Cords', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Fancy_Cords.webp?tr=w-1200,f-auto,q-70', description: 'Decorative and durable cords available in multiple textile materials and designs.', material: 'Nylon / Polyester / Polypropylene / Acrylic / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Decorative', specs: [['Product type', 'Fancy cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Acrylic / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, accessories, crafts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Jute Cord', type: 'CORD', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Jute_Cord.webp?tr=w-1200,f-auto,q-70', description: 'Natural, strong and biodegradable jute cord.', material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural', specs: [['Product type', 'Jute cord'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Braid Rope', type: 'EGG BELT', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Braid_Rope.webp?tr=w-1200,f-auto,q-70', description: 'Durable braided rope manufactured from Nylon, Polyester, and Polypropylene, available in 5mm–20mm thicknesses and customized lengths according to customer requirements.', material: 'Nylon, Polyester & Polypropylene', width: '5mm–20mm', colors: 'White', finish: 'Braided rope', specs: [['Product type', 'Braid rope'], ['Material', 'Nylon, Polyester & Polypropylene'], ['Thickness', '5mm to 20mm'], ['Length', 'Depends on customer requirements'], ['Color', 'White'], ['Construction', 'Braided rope'], ['Packing', 'Standard package']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Fancy Yarn', type: 'YARN', image: 'https://ik.imagekit.io/a2q8u8qtw/products/Fancy_Yarn.webp?tr=w-1200,f-auto,q-70', description: 'Soft decorative yarn available in multiple colors and textures.', material: 'Acrylic / Cotton / Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Textured', specs: [['Product type', 'Fancy yarn'], ['Material composition', 'Acrylic / Cotton / Polyester'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / textured'], ['Applications', 'Knitting, crochet, crafts, embellishments']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'Pouch', type: 'POUCH', image: 'https://ik.imagekit.io/a2q8u8qtw/products/pouch.jpg', description: 'Durable and soft pouches available in multiple sizes and colors.', material: 'Textile / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Durable', specs: [['Product type', 'Pouch'], ['Material composition', 'Textile / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / durable'], ['Applications', 'Storage, packaging, gifts']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
  { name: 'PP Woven Egg Conveyor Belt', type: 'EGG BELT', image: 'https://ik.imagekit.io/a2q8u8qtw/products/pp_woven_egg_conveyor_belt.avif?tr=w-1200,f-auto,q-70', description: 'UV and anti-static treated PP woven belt for egg collection in poultry farms, with an egg broken rate below 0.3%.', material: 'Nylon / Polyester / Polypropylene', width: '90mm–120mm', colors: 'Custom', finish: 'UV & anti-static treated', specs: [['Product type', 'PP woven egg conveyor belt'], ['Material composition', 'Nylon, polyester & polypropylene'], ['Available widths', '90–120mm'], ['Length', 'Custom'], ['Egg broken rate', 'Below 0.3%'], ['Applications', 'Poultry farm egg collecting, assembly-line conveyor belts'], ['Finish', 'UV & anti-static treated, washable in cold water']],
    moq: 500,
    pricingTiers: [
      { quantity: 500, pricePerMeter: 0.45 },
      { quantity: 1000, pricePerMeter: 0.38 },
      { quantity: 5000, pricePerMeter: 0.32 },
    ],
    leadTime: '14–21 days',
    weight: '12g/m',
    compliance: {
      oekotex: true,
      certificates: ['OEKO-TEX Standard 100'],
    },
  },
]
