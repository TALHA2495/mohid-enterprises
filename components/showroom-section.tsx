'use client'

import { ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export type Product = {
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
    name: 'Fringe Lace', type: 'LACE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/all%20Cotton%20Fringe.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft, expressive fringe for trims and statement edges.',
    material: 'Cotton blend', width: '10mm�50mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Fringe lace'], ['Material composition', 'Cotton blend'], ['Available widths', '10mm�50mm'], ['Minimum order quantity', '500 meters'], ['Color options', 'Custom color matching'], ['Finish', 'Natural / brushed'], ['Lead time', '2�3 weeks']],
  },
  {
    name: 'Golden Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Golden%20Tassel.webp?tr=w-1200,f-auto,q-70',
    description: 'A polished accent with a warm metallic finish for elevated details.',
    material: 'Polyester', width: '30mm�80mm', colors: 'Gold tones', finish: 'Metallic',
    specs: [['Product type', 'Decorative tassel'], ['Material composition', 'Polyester'], ['Available widths', '30mm�80mm'], ['Minimum order quantity', '250 pieces'], ['Finish', 'Metallic'], ['Lead time', '3�4 weeks']],
  },
  {
    name: 'Metal Cord', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Metal%20Cord.webp?tr=w-1200,f-auto,q-70',
    description: 'Structured cord with a refined surface texture.',
    material: 'Metallic yarn', width: '2mm�8mm', colors: 'Custom', finish: 'Polished',
    specs: [['Product type', 'Metal cord'], ['Material composition', 'Metallic yarn'], ['Available widths', '2mm�8mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Polished'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Pom Pom Trim', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom%20Trim.webp?tr=w-1200,f-auto,q-70',
    description: 'Playful volume for apparel and home details.',
    material: 'Polyester', width: '10mm�25mm', colors: 'Custom', finish: 'Soft',
    specs: [['Product type', 'Pom pom trim'], ['Material composition', 'Polyester'], ['Available widths', '10mm�25mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Soft'], ['Lead time', '2�3 weeks']],
  },
  {
    name: 'Cotton Fringe', type: 'FRINGE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Cotton%20Fringe.webp?tr=w-1200,f-auto,q-70',
    description: 'Natural cotton texture with an easy, soft hand.',
    material: '100% cotton', width: '25mm�100mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Cotton fringe'], ['Material composition', '100% cotton'], ['Available widths', '25mm�100mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Natural'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Woven Belt', type: 'UTILITY', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Woven%20Belt.webp?tr=w-1200,f-auto,q-70',
    description: 'Hard-wearing woven utility trim made for scale.',
    material: 'Polyester', width: '25mm�40mm', colors: 'Custom', finish: 'Durable',
    specs: [['Product type', 'Woven utility belt'], ['Material composition', 'Polyester'], ['Available widths', '25mm�40mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Durable woven'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Needle Loom Elastic', type: 'ELASTIC', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Needle%20Loom%20Elastic.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong, durable elastic with a soft and smooth finish.',
    material: 'Nylon / Polyester', width: 'Various', colors: 'White, Black, Natural, Beige, Grey, Navy Blue, Brown, Multi Color', finish: 'Soft / Smooth',
    specs: [['Product type', 'Needle loom elastic'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
  },
  {
    name: 'Crochet Elastic', type: 'ELASTIC', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Crochet%20Elastic.webp?tr=w-1200,f-auto,q-70',
    description: 'Stretchy, durable crochet elastic designed for comfortable textile applications.',
    material: 'Latex / Polyester', width: 'Various', colors: 'White, Black, Beige, Grey, Navy Blue, Multi Color', finish: 'Soft / Flexible',
    specs: [['Product type', 'Crochet elastic'], ['Material composition', 'Latex / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / flexible'], ['Applications', 'Waistbands, undergarments, crafts']],
  },
  {
    name: 'Jacquard Elastic & Tape', type: 'ELASTIC', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Jacquard%20Elastic%20&%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong jacquard elastic and tape with custom branding and woven designs.',
    material: 'Nylon / Polyester', width: 'Custom', colors: 'Custom', finish: 'Woven / Jacquard',
    specs: [['Product type', 'Jacquard elastic & tape'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Custom'], ['Color options', 'Custom color matching'], ['Design options', 'Logo, text, branded, custom'], ['Finish', 'Woven / jacquard'], ['Applications', 'Garments, waistbands, sportswear']],
  },
  {
    name: 'Elastics', type: 'ELASTIC', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Elastics.webp?tr=w-1200,f-auto,q-70',
    description: 'General-purpose textile elastics available in multiple materials and colors.',
    material: 'Nylon / Polyester / Polypropylene', width: 'Various', colors: 'Multiple colors', finish: 'Flexible',
    specs: [['Product type', 'General elastic'], ['Material composition', 'Nylon / Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Flexible'], ['Applications', 'Garment industry']],
  },
  {
    name: 'Draw Cord', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Draw%20Cord.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong and flexible draw cord available in solid, striped and patterned designs.',
    material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes',
    specs: [['Product type', 'Draw cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Solid, striped, reflective, two-tone, multi color'], ['Design options', 'Flat, round, patterned, custom'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments, sportswear']],
  },
  {
    name: 'Flat Draw Cord', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Flat%20Draw%20Cord.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong, smooth flat draw cord for garment and sportswear applications.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Blue/White, Black/White, Green/White, Red/White, Purple/White, Multi Color', finish: 'Soft / Smooth',
    specs: [['Product type', 'Flat draw cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Hoods, waistbands, sportswear']],
  },
  {
    name: 'Drawstring Cord', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Drawstring%20Cord.webp?tr=w-1200,f-auto,q-70',
    description: 'Durable, flexible drawstring cord available in a range of finishes.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes',
    specs: [['Product type', 'Drawstring cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments']],
  },
  {
    name: 'Cord with Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Cord%20with%20Tassel.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative cord finished with an elegant tassel end.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Gold, Gold/Metallic', finish: 'Metallic',
    specs: [['Product type', 'Cord with tassel'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Gold, Gold/Metallic'], ['Finish', 'Metallic'], ['Applications', 'Garments, bags, accessories, crafts']],
  },
  {
    name: 'Draw Cord Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Draw%20Cord%20with%20Tassel.webp?tr=w-1200,f-auto,q-70',
    description: 'Colorful decorative tassel finish for drawstrings and accessories.',
    material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Tassel',
    specs: [['Product type', 'Draw cord tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color tassels'], ['Finish', 'Tassel'], ['Applications', 'Drawstrings, bags, hoodies, accessories']],
  },
  {
    name: 'Multi Color Tassel', type: 'TASSEL', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Multi%20Color%20Tassel.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft, colorful fringed tassels available in different lengths.',
    material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Fringed',
    specs: [['Product type', 'Multi color tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color'], ['Available lengths', 'Various'], ['Finish', 'Fringed'], ['Applications', 'Garments, bags, crafts, home decor']],
  },
  {
    name: 'Tassels', type: 'TASSEL', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Tassel.webp?tr=w-1200,f-auto,q-70',
    description: 'Classic decorative tassels for garments, bags, and home d�cor.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Tassels'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, home decor']],
  },
  {
    name: 'Flat Shoelaces', type: 'SHOELACE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Flat%20Shoelaces.webp?tr=w-1200,f-auto,q-70',
    description: 'Durable flat shoelaces available in multiple colors and patterns.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'White, Black, Grey, Navy Blue, Red, Royal Blue, Beige, Brown, Neon Green, Purple Metallic, White/Cream, Black/White Striped, Orange/Tan Metallic, Cream/Beige, Yellow, Green, Patterned, Multi Color', finish: 'Woven / Soft',
    specs: [['Product type', 'Flat shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors and patterns'], ['Finish', 'Woven / soft'], ['Applications', 'Sneakers, shoes, boots, hoodies'], ['Customization', 'Custom length, colors and patterns']],
  },
  {
    name: 'Waxy Shoelaces', type: 'SHOELACE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Waxy%20Shoelaces.webp?tr=w-1200,f-auto,q-70',
    description: 'High-strength wax-coated shoelaces designed for durability and a tangle-free finish.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Black, Brown, Dark Brown, Navy Blue, Grey, White, Beige, Multi Color', finish: 'Wax Coated',
    specs: [['Product type', 'Waxy shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Wax coated'], ['Features', 'High strength, tangle free, water resistant'], ['Applications', 'Shoes and boots']],
  },
  {
    name: 'Tricot Knitting Tape', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Tricot%20Knitting%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong and smooth knitted tape for garment construction and finishing.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'White/White, Navy/White/Black, Red/White/Black, Red/Green, Multi, Silver Stripe', finish: 'Soft / Smooth',
    specs: [['Product type', 'Tricot knitting tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
  },
  {
    name: 'Twill Tape', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Twill%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Strong and flexible twill tape available in multiple widths and colors.',
    material: 'Cotton / Polyester', width: '10mm�50mm', colors: 'Multiple colors', finish: 'Twill Weave',
    specs: [['Product type', 'Twill tape'], ['Material composition', 'Cotton / Polyester'], ['Available widths', '10mm, 15mm, 20mm, 25mm, 30mm, 38mm, 50mm'], ['Color options', 'Multiple colors'], ['Finish', 'Twill weave'], ['Applications', 'Garments, bags, accessories'], ['Customization', 'Custom width, length and colors']],
  },
  {
    name: 'Neck Tapes', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Neck%20Tapes.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft woven neck tape designed for comfortable garment finishing.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Red, Green, Light Blue, Black, White, Beige, Royal Blue, Mint, Purple, Multipack', finish: 'Soft / Woven',
    specs: [['Product type', 'Neck tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / woven'], ['Applications', 'T-shirts, polos, hoodies, jackets, sportswear']],
  },
  {
    name: 'Mesh Ribbon', type: 'RIBBON', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Mesh%20Ribbon.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft, breathable decorative mesh ribbon for textile and craft applications.',
    material: 'Polyester', width: 'Various', colors: 'White', finish: 'Soft / Breathable',
    specs: [['Product type', 'Mesh ribbon'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'White'], ['Finish', 'Soft / breathable'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
  },
  {
    name: 'Ribbons', type: 'RIBBON', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Ribbons.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative ribbons available in multiple colors and widths.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Ribbons'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
  },
  {
    name: 'Web Tape', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Web%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Clean woven construction for dependable finishing and repeat production.',
    material: 'Polyester / Polypropylene', width: 'Various', colors: 'Various', finish: 'Woven',
    specs: [['Product type', 'Web tape'], ['Material composition', 'Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'Jute Tape', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Jute%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Natural, strong and biodegradable jute tape.',
    material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural',
    specs: [['Product type', 'Jute tape'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
  },
  {
    name: 'Label Tape', type: 'TAPE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Label%20Tape.webp?tr=w-1200,f-auto,q-70',
    description: 'Printable label tape for branding and garment identification.',
    material: 'Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Printable',
    specs: [['Product type', 'Label tape'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Printable'], ['Applications', 'Garments, branding, identification']],
  },
  {
    name: 'Waste Belt', type: 'UTILITY', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Waste%20Belt.webp?tr=w-1200,f-auto,q-70',
    description: 'Recycled material belt for sustainable garment production.',
    material: 'Recycled material', width: 'Various', colors: 'Various', finish: 'Utility',
    specs: [['Product type', 'Waste belt'], ['Material composition', 'Recycled material'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Utility'], ['Applications', 'Garments, sustainable production']],
  },
  {
    name: 'Cotton Belts', type: 'UTILITY', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Cotton%20Belts.webp?tr=w-1200,f-auto,q-70',
    description: 'Natural cotton belt available in multiple widths and colors.',
    material: '100% Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Natural / Soft',
    specs: [['Product type', 'Cotton belt'], ['Material composition', '100% Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Natural / soft'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'All Types Belts', type: 'UTILITY', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/all%20Cotton%20Belts.webp?tr=w-1200,f-auto,q-70',
    description: 'Multi-material belts including nylon, polyester, polypropylene, and cotton.',
    material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Woven',
    specs: [['Product type', 'Multi-type belt'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'Pom-pom', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft, playful pom-poms available in multiple colors and sizes.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom-pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Pom Pom Lace', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom%20lace.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative pom-pom lace trim for garments and accessories.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom pom lace'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, accessories, crafts']],
  },
  {
    name: 'Pom Pom Ball', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom%20Ball.webp?tr=w-1200,f-auto,q-70',
    description: 'Round pom-pom balls available in multiple sizes and colors.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom pom ball'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Pom Pom Toys', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom%20toys.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft, playful pom-pom toys for children and crafts.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Playful',
    specs: [['Product type', 'Pom pom toy'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / playful'], ['Applications', 'Toys, crafts, children products']],
  },
  {
    name: 'Pom Pom Flower', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Pom%20Pom%20Flower.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative pom-pom flowers for garments and home d�cor.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Decorative',
    specs: [['Product type', 'Pom pom flower'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / decorative'], ['Applications', 'Garments, home decor, crafts']],
  },
  {
    name: 'Multi Pom Pom', type: 'POM POM', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Multi%20Pom%20Pom.webp?tr=w-1200,f-auto,q-70',
    description: 'Multi-colored pom-poms available in various sizes.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Soft / Plush',
    specs: [['Product type', 'Multi pom pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multi-color'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Party Hat / Birthday Cap', type: 'PARTY', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Party%20Hat.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative party hats and birthday caps available in multiple colors.',
    material: 'Paper / Cardboard / Synthetic', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Party hat / birthday cap'], ['Material composition', 'Paper / cardboard / synthetic'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Birthday parties, celebrations, events']],
  },
  {
    name: 'Fancy Lace', type: 'LACE', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Fancy%20Lace.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft and delicate decorative lace available in multiple designs.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Delicate',
    specs: [['Product type', 'Fancy lace'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Soft / delicate'], ['Applications', 'Garments, lingerie, crafts, home decor']],
  },
  {
    name: 'All Fancy Cords', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Fancy%20Cords.webp?tr=w-1200,f-auto,q-70',
    description: 'Decorative and durable cords available in multiple textile materials and designs.',
    material: 'Nylon / Polyester / Polypropylene / Acrylic / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Fancy cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Acrylic / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, accessories, crafts']],
  },
  {
    name: 'Jute Cord', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Jute%20Cord.webp?tr=w-1200,f-auto,q-70',
    description: 'Natural, strong and biodegradable jute cord.',
    material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural',
    specs: [['Product type', 'Jute cord'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
  },
  {
    name: 'Braid Rope', type: 'CORD', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Braid%20Rope.webp?tr=w-1200,f-auto,q-70',
    description: 'High-strength braided rope available in different thicknesses and colors.',
    material: 'Polyester / Nylon / Polypropylene', width: 'Various', colors: 'Multiple colors', finish: 'Braided',
    specs: [['Product type', 'Braid rope'], ['Material composition', 'Polyester / Nylon / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Thickness', 'Various'], ['Finish', 'Braided'], ['Applications', 'Garments, bags, industrial']],
  },
  {
    name: 'Fancy Yarn', type: 'YARN', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/Fancy%20Yarn.webp?tr=w-1200,f-auto,q-70',
    description: 'Soft decorative yarn available in multiple colors and textures.',
    material: 'Acrylic / Cotton / Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Textured',
    specs: [['Product type', 'Fancy yarn'], ['Material composition', 'Acrylic / Cotton / Polyester'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / textured'], ['Applications', 'Knitting, crochet, crafts, embellishments']],
  },
  {
    name: 'Pouch', type: 'POUCH', image: 'https://ik.imagekit.io/wavawecyl/product%20images%20webp/pouch.jpg?tr=w-1200,f-auto,q-70',
    description: 'Durable and soft pouches available in multiple sizes and colors.',
    material: 'Textile / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Durable',
    specs: [['Product type', 'Pouch'], ['Material composition', 'Textile / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / durable'], ['Applications', 'Storage, packaging, gifts']],
  },
]

const filters = ['All trims', 'Elastics', 'Tapes', 'Ribbons', 'Cords', 'Shoelaces', 'Belts', 'Pom Poms', 'Lace', 'Yarn', 'Pouch']

const filterTypes: Record<string, string[]> = {
  'Elastics': ['ELASTIC'],
  'Tapes': ['TAPE'],
  'Ribbons': ['RIBBON'],
  'Cords': ['CORD', 'TASSEL'],
  'Shoelaces': ['SHOELACE'],
  'Belts': ['UTILITY'],
  'Pom Poms': ['POM POM'],
  'Lace': ['LACE'],
  'Yarn': ['YARN'],
  'Pouch': ['POUCH'],
}

const ProductDetail = dynamic(() => import('./showroom-detail'), {
  ssr: false,
  loading: () => <section className="min-h-screen bg-[#0a0c0b]" />,
})

export function ShowroomSection() {
  const [selected, setSelected] = useState<Product | null>(null)
  const [filter, setFilter] = useState('All trims')
  const [loadedCount, setLoadedCount] = useState(8)

  const visible = products.filter((product) => filter === 'All trims' || (filterTypes[filter]?.includes(product.type) ?? false))
  const displayed = visible.slice(0, loadedCount)
  const hasMore = loadedCount < visible.length

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setLoadedCount(8)
  }

  const handleLoadMore = () => {
    setLoadedCount((prev) => prev + 8)
  }

  if (selected) return <ProductDetail key={selected.name} product={selected} onBack={() => setSelected(null)} />

  return (
    <section id="showroom" className="relative z-10 px-4 pb-16 pt-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Product filters">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleFilterChange(item)}
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
          {displayed.map((product, index) => (
            <button
              key={product.name}
              type="button"
              onClick={() => setSelected(product)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101413] text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#00c853]/50 hover:bg-[#151a19]"
            >
              <div className="relative h-56 overflow-hidden bg-black/40">
                <Image
                    src={product.image}
                    alt={`${product.name} textile trim`}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    quality={70}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-medium text-white/80 transition hover:border-[#00c853]/50 hover:text-white"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
