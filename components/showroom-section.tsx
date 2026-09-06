'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight, CircleCheck, Globe, Package, Ruler, SlidersHorizontal, TreePine } from 'lucide-react'
import Image from 'next/image'
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
    name: 'Fringe Lace', type: 'LACE', image: '/product%20images%20compressed/all%20Cotton%20Fringe_compressed.webp',
    description: 'Soft, expressive fringe for trims and statement edges.',
    material: 'Cotton blend', width: '10mm�50mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Fringe lace'], ['Material composition', 'Cotton blend'], ['Available widths', '10mm�50mm'], ['Minimum order quantity', '500 meters'], ['Color options', 'Custom color matching'], ['Finish', 'Natural / brushed'], ['Lead time', '2�3 weeks']],
  },
  {
    name: 'Golden Tassel', type: 'TASSEL', image: '/product%20images%20compressed/Golden%20Tassel_compressed.webp',
    description: 'A polished accent with a warm metallic finish for elevated details.',
    material: 'Polyester', width: '30mm�80mm', colors: 'Gold tones', finish: 'Metallic',
    specs: [['Product type', 'Decorative tassel'], ['Material composition', 'Polyester'], ['Available widths', '30mm�80mm'], ['Minimum order quantity', '250 pieces'], ['Finish', 'Metallic'], ['Lead time', '3�4 weeks']],
  },
  {
    name: 'Metal Cord', type: 'CORD', image: '/product%20images%20compressed/Metal%20Cord_compressed.webp',
    description: 'Structured cord with a refined surface texture.',
    material: 'Metallic yarn', width: '2mm�8mm', colors: 'Custom', finish: 'Polished',
    specs: [['Product type', 'Metal cord'], ['Material composition', 'Metallic yarn'], ['Available widths', '2mm�8mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Polished'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Pom Pom Trim', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom%20Trim_compressed.webp',
    description: 'Playful volume for apparel and home details.',
    material: 'Polyester', width: '10mm�25mm', colors: 'Custom', finish: 'Soft',
    specs: [['Product type', 'Pom pom trim'], ['Material composition', 'Polyester'], ['Available widths', '10mm�25mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Soft'], ['Lead time', '2�3 weeks']],
  },
  {
    name: 'Cotton Fringe', type: 'FRINGE', image: '/product%20images%20compressed/Cotton%20Fringe_compressed.webp',
    description: 'Natural cotton texture with an easy, soft hand.',
    material: '100% cotton', width: '25mm�100mm', colors: 'Custom', finish: 'Natural',
    specs: [['Product type', 'Cotton fringe'], ['Material composition', '100% cotton'], ['Available widths', '25mm�100mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Natural'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Woven Belt', type: 'UTILITY', image: '/product%20images%20compressed/Woven%20Belt_compressed.webp',
    description: 'Hard-wearing woven utility trim made for scale.',
    material: 'Polyester', width: '25mm�40mm', colors: 'Custom', finish: 'Durable',
    specs: [['Product type', 'Woven utility belt'], ['Material composition', 'Polyester'], ['Available widths', '25mm�40mm'], ['Minimum order quantity', '500 meters'], ['Finish', 'Durable woven'], ['Lead time', '3 weeks']],
  },
  {
    name: 'Needle Loom Elastic', type: 'ELASTIC', image: '/product%20images%20compressed/Needle%20Loom%20Elastic_compressed.webp',
    description: 'Strong, durable elastic with a soft and smooth finish.',
    material: 'Nylon / Polyester', width: 'Various', colors: 'White, Black, Natural, Beige, Grey, Navy Blue, Brown, Multi Color', finish: 'Soft / Smooth',
    specs: [['Product type', 'Needle loom elastic'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
  },
  {
    name: 'Crochet Elastic', type: 'ELASTIC', image: '/product%20images%20compressed/Crochet%20Elastic_compressed.webp',
    description: 'Stretchy, durable crochet elastic designed for comfortable textile applications.',
    material: 'Latex / Polyester', width: 'Various', colors: 'White, Black, Beige, Grey, Navy Blue, Multi Color', finish: 'Soft / Flexible',
    specs: [['Product type', 'Crochet elastic'], ['Material composition', 'Latex / Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / flexible'], ['Applications', 'Waistbands, undergarments, crafts']],
  },
  {
    name: 'Jacquard Elastic & Tape', type: 'ELASTIC', image: '/product%20images%20compressed/Jacquard%20Elastic%20&%20Tape_compressed.webp',
    description: 'Strong jacquard elastic and tape with custom branding and woven designs.',
    material: 'Nylon / Polyester', width: 'Custom', colors: 'Custom', finish: 'Woven / Jacquard',
    specs: [['Product type', 'Jacquard elastic & tape'], ['Material composition', 'Nylon / Polyester'], ['Available widths', 'Custom'], ['Color options', 'Custom color matching'], ['Design options', 'Logo, text, branded, custom'], ['Finish', 'Woven / jacquard'], ['Applications', 'Garments, waistbands, sportswear']],
  },
  {
    name: 'Elastics', type: 'ELASTIC', image: '/product%20images%20compressed/Elastics_compressed.webp',
    description: 'General-purpose textile elastics available in multiple materials and colors.',
    material: 'Nylon / Polyester / Polypropylene', width: 'Various', colors: 'Multiple colors', finish: 'Flexible',
    specs: [['Product type', 'General elastic'], ['Material composition', 'Nylon / Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Flexible'], ['Applications', 'Garment industry']],
  },
  {
    name: 'Draw Cord', type: 'CORD', image: '/product%20images%20compressed/Draw%20Cord_compressed.webp',
    description: 'Strong and flexible draw cord available in solid, striped and patterned designs.',
    material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes',
    specs: [['Product type', 'Draw cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Solid, striped, reflective, two-tone, multi color'], ['Design options', 'Flat, round, patterned, custom'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments, sportswear']],
  },
  {
    name: 'Flat Draw Cord', type: 'CORD', image: '/product%20images%20compressed/Flat%20Draw%20Cord_compressed.webp',
    description: 'Strong, smooth flat draw cord for garment and sportswear applications.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Blue/White, Black/White, Green/White, Red/White, Purple/White, Multi Color', finish: 'Soft / Smooth',
    specs: [['Product type', 'Flat draw cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Hoods, waistbands, sportswear']],
  },
  {
    name: 'Drawstring Cord', type: 'CORD', image: '/product%20images%20compressed/Drawstring%20Cord_compressed.webp',
    description: 'Durable, flexible drawstring cord available in a range of finishes.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Custom / Multiple colors', finish: 'Various finishes',
    specs: [['Product type', 'Drawstring cord'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Various finishes'], ['Applications', 'Hoodies, bags, garments']],
  },
  {
    name: 'Cord with Tassel', type: 'TASSEL', image: '/product%20images%20compressed/Cord%20with%20Tassel_compressed.webp',
    description: 'Decorative cord finished with an elegant tassel end.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Gold, Gold/Metallic', finish: 'Metallic',
    specs: [['Product type', 'Cord with tassel'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Gold, Gold/Metallic'], ['Finish', 'Metallic'], ['Applications', 'Garments, bags, accessories, crafts']],
  },
  {
    name: 'Draw Cord Tassel', type: 'TASSEL', image: '/product%20images%20compressed/Draw%20Cord%20with%20Tassel_compressed.webp',
    description: 'Colorful decorative tassel finish for drawstrings and accessories.',
    material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Tassel',
    specs: [['Product type', 'Draw cord tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color tassels'], ['Finish', 'Tassel'], ['Applications', 'Drawstrings, bags, hoodies, accessories']],
  },
  {
    name: 'Multi Color Tassel', type: 'TASSEL', image: '/product%20images%20compressed/Multi%20Color%20Tassel_compressed.webp',
    description: 'Soft, colorful fringed tassels available in different lengths.',
    material: 'Synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Fringed',
    specs: [['Product type', 'Multi color tassel'], ['Material composition', 'Synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multi-color'], ['Available lengths', 'Various'], ['Finish', 'Fringed'], ['Applications', 'Garments, bags, crafts, home decor']],
  },
  {
    name: 'Tassels', type: 'TASSEL', image: '/product%20images%20compressed/Tassel_compressed.webp',
    description: 'Classic decorative tassels for garments, bags, and home d�cor.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Tassels'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, home decor']],
  },
  {
    name: 'Flat Shoelaces', type: 'SHOELACE', image: '/product%20images%20compressed/Flat%20Shoelaces_compressed.webp',
    description: 'Durable flat shoelaces available in multiple colors and patterns.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'White, Black, Grey, Navy Blue, Red, Royal Blue, Beige, Brown, Neon Green, Purple Metallic, White/Cream, Black/White Striped, Orange/Tan Metallic, Cream/Beige, Yellow, Green, Patterned, Multi Color', finish: 'Woven / Soft',
    specs: [['Product type', 'Flat shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors and patterns'], ['Finish', 'Woven / soft'], ['Applications', 'Sneakers, shoes, boots, hoodies'], ['Customization', 'Custom length, colors and patterns']],
  },
  {
    name: 'Waxy Shoelaces', type: 'SHOELACE', image: '/product%20images%20compressed/Waxy%20Shoelaces_compressed.webp',
    description: 'High-strength wax-coated shoelaces designed for durability and a tangle-free finish.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Black, Brown, Dark Brown, Navy Blue, Grey, White, Beige, Multi Color', finish: 'Wax Coated',
    specs: [['Product type', 'Waxy shoelace'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Wax coated'], ['Features', 'High strength, tangle free, water resistant'], ['Applications', 'Shoes and boots']],
  },
  {
    name: 'Tricot Knitting Tape', type: 'TAPE', image: '/product%20images%20compressed/Tricot%20Knitting%20Tape_compressed.webp',
    description: 'Strong and smooth knitted tape for garment construction and finishing.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'White/White, Navy/White/Black, Red/White/Black, Red/Green, Multi, Silver Stripe', finish: 'Soft / Smooth',
    specs: [['Product type', 'Tricot knitting tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple combinations'], ['Finish', 'Soft / smooth'], ['Applications', 'Collars, cuffs, waistbands']],
  },
  {
    name: 'Twill Tape', type: 'TAPE', image: '/product%20images%20compressed/Twill%20Tape_compressed.webp',
    description: 'Strong and flexible twill tape available in multiple widths and colors.',
    material: 'Cotton / Polyester', width: '10mm�50mm', colors: 'Multiple colors', finish: 'Twill Weave',
    specs: [['Product type', 'Twill tape'], ['Material composition', 'Cotton / Polyester'], ['Available widths', '10mm, 15mm, 20mm, 25mm, 30mm, 38mm, 50mm'], ['Color options', 'Multiple colors'], ['Finish', 'Twill weave'], ['Applications', 'Garments, bags, accessories'], ['Customization', 'Custom width, length and colors']],
  },
  {
    name: 'Neck Tapes', type: 'TAPE', image: '/product%20images%20compressed/Neck%20Tapes_compressed.webp',
    description: 'Soft woven neck tape designed for comfortable garment finishing.',
    material: 'Polyester / Nylon', width: 'Various', colors: 'Red, Green, Light Blue, Black, White, Beige, Royal Blue, Mint, Purple, Multipack', finish: 'Soft / Woven',
    specs: [['Product type', 'Neck tape'], ['Material composition', 'Polyester / Nylon'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / woven'], ['Applications', 'T-shirts, polos, hoodies, jackets, sportswear']],
  },
  {
    name: 'Mesh Ribbon', type: 'RIBBON', image: '/product%20images%20compressed/Mesh%20Ribbon_compressed.webp',
    description: 'Soft, breathable decorative mesh ribbon for textile and craft applications.',
    material: 'Polyester', width: 'Various', colors: 'White', finish: 'Soft / Breathable',
    specs: [['Product type', 'Mesh ribbon'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'White'], ['Finish', 'Soft / breathable'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
  },
  {
    name: 'Ribbons', type: 'RIBBON', image: '/product%20images%20compressed/Ribbons_compressed.webp',
    description: 'Decorative ribbons available in multiple colors and widths.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Ribbons'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Garments, crafts, gift wrapping, accessories']],
  },
  {
    name: 'Web Tape', type: 'TAPE', image: '/product%20images%20compressed/Web%20Tape_compressed.webp',
    description: 'Clean woven construction for dependable finishing and repeat production.',
    material: 'Polyester / Polypropylene', width: 'Various', colors: 'Various', finish: 'Woven',
    specs: [['Product type', 'Web tape'], ['Material composition', 'Polyester / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'Jute Tape', type: 'TAPE', image: '/product%20images%20compressed/Jute%20Tape_compressed.webp',
    description: 'Natural, strong and biodegradable jute tape.',
    material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural',
    specs: [['Product type', 'Jute tape'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
  },
  {
    name: 'Label Tape', type: 'TAPE', image: '/product%20images%20compressed/Label%20Tape_compressed.webp',
    description: 'Printable label tape for branding and garment identification.',
    material: 'Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Printable',
    specs: [['Product type', 'Label tape'], ['Material composition', 'Polyester'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Printable'], ['Applications', 'Garments, branding, identification']],
  },
  {
    name: 'Waste Belt', type: 'UTILITY', image: '/product%20images%20compressed/Waste%20Belt_compressed.webp',
    description: 'Recycled material belt for sustainable garment production.',
    material: 'Recycled material', width: 'Various', colors: 'Various', finish: 'Utility',
    specs: [['Product type', 'Waste belt'], ['Material composition', 'Recycled material'], ['Available widths', 'Various'], ['Color options', 'Various'], ['Finish', 'Utility'], ['Applications', 'Garments, sustainable production']],
  },
  {
    name: 'Cotton Belts', type: 'UTILITY', image: '/product%20images%20compressed/Cotton%20Belts_compressed.webp',
    description: 'Natural cotton belt available in multiple widths and colors.',
    material: '100% Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Natural / Soft',
    specs: [['Product type', 'Cotton belt'], ['Material composition', '100% Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Natural / soft'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'All Types Belts', type: 'UTILITY', image: '/product%20images%20compressed/all%20Cotton%20Belts_compressed.webp',
    description: 'Multi-material belts including nylon, polyester, polypropylene, and cotton.',
    material: 'Nylon / Polyester / Polypropylene / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Woven',
    specs: [['Product type', 'Multi-type belt'], ['Material composition', 'Nylon / Polyester / Polypropylene / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Woven'], ['Applications', 'Garments, bags, accessories']],
  },
  {
    name: 'Pom-pom', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom_compressed.webp',
    description: 'Soft, playful pom-poms available in multiple colors and sizes.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom-pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Pom Pom Lace', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom%20lace_compressed.webp',
    description: 'Decorative pom-pom lace trim for garments and accessories.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom pom lace'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, accessories, crafts']],
  },
  {
    name: 'Pom Pom Ball', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom%20Ball_compressed.webp',
    description: 'Round pom-pom balls available in multiple sizes and colors.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Plush',
    specs: [['Product type', 'Pom pom ball'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Pom Pom Toys', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom%20toys_compressed.webp',
    description: 'Soft, playful pom-pom toys for children and crafts.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Playful',
    specs: [['Product type', 'Pom pom toy'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / playful'], ['Applications', 'Toys, crafts, children products']],
  },
  {
    name: 'Pom Pom Flower', type: 'POM POM', image: '/product%20images%20compressed/Pom%20Pom%20Flower_compressed.webp',
    description: 'Decorative pom-pom flowers for garments and home d�cor.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Decorative',
    specs: [['Product type', 'Pom pom flower'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / decorative'], ['Applications', 'Garments, home decor, crafts']],
  },
  {
    name: 'Multi Pom Pom', type: 'POM POM', image: '/product%20images%20compressed/Multi%20Pom%20Pom_compressed.webp',
    description: 'Multi-colored pom-poms available in various sizes.',
    material: 'Acrylic / synthetic fiber', width: 'Various', colors: 'Multi Color', finish: 'Soft / Plush',
    specs: [['Product type', 'Multi pom pom'], ['Material composition', 'Acrylic / synthetic fiber'], ['Available sizes', 'Various'], ['Color options', 'Multi-color'], ['Finish', 'Soft / plush'], ['Applications', 'Garments, crafts, home decor']],
  },
  {
    name: 'Party Hat / Birthday Cap', type: 'PARTY', image: '/product%20images%20compressed/Party%20Hat_compressed.webp',
    description: 'Decorative party hats and birthday caps available in multiple colors.',
    material: 'Paper / Cardboard / Synthetic', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Party hat / birthday cap'], ['Material composition', 'Paper / cardboard / synthetic'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Decorative'], ['Applications', 'Birthday parties, celebrations, events']],
  },
  {
    name: 'Fancy Lace', type: 'LACE', image: '/product%20images%20compressed/Fancy%20Lace_compressed.webp',
    description: 'Soft and delicate decorative lace available in multiple designs.',
    material: 'Polyester / Synthetic fiber', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Delicate',
    specs: [['Product type', 'Fancy lace'], ['Material composition', 'Polyester / synthetic fiber'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Soft / delicate'], ['Applications', 'Garments, lingerie, crafts, home decor']],
  },
  {
    name: 'All Fancy Cords', type: 'CORD', image: '/product%20images%20compressed/Fancy%20Cords_compressed.webp',
    description: 'Decorative and durable cords available in multiple textile materials and designs.',
    material: 'Nylon / Polyester / Polypropylene / Acrylic / Cotton', width: 'Various', colors: 'Multiple colors', finish: 'Decorative',
    specs: [['Product type', 'Fancy cord'], ['Material composition', 'Nylon / Polyester / Polypropylene / Acrylic / Cotton'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Design options', 'Various designs'], ['Finish', 'Decorative'], ['Applications', 'Garments, bags, accessories, crafts']],
  },
  {
    name: 'Jute Cord', type: 'CORD', image: '/product%20images%20compressed/Jute%20Cord_compressed.webp',
    description: 'Natural, strong and biodegradable jute cord.',
    material: 'Jute', width: 'Various', colors: 'Natural, Multiple colors', finish: 'Natural',
    specs: [['Product type', 'Jute cord'], ['Material composition', 'Jute'], ['Available widths', 'Various'], ['Color options', 'Natural and multiple colors'], ['Finish', 'Natural'], ['Applications', 'Crafts, packaging, home decor']],
  },
  {
    name: 'Braid Rope', type: 'CORD', image: '/product%20images%20compressed/Braid%20Rope_compressed.webp',
    description: 'High-strength braided rope available in different thicknesses and colors.',
    material: 'Polyester / Nylon / Polypropylene', width: 'Various', colors: 'Multiple colors', finish: 'Braided',
    specs: [['Product type', 'Braid rope'], ['Material composition', 'Polyester / Nylon / Polypropylene'], ['Available widths', 'Various'], ['Color options', 'Multiple colors'], ['Thickness', 'Various'], ['Finish', 'Braided'], ['Applications', 'Garments, bags, industrial']],
  },
  {
    name: 'Fancy Yarn', type: 'YARN', image: '/product%20images%20compressed/Fancy%20Yarn_compressed.webp',
    description: 'Soft decorative yarn available in multiple colors and textures.',
    material: 'Acrylic / Cotton / Polyester', width: 'Various', colors: 'Multiple colors', finish: 'Soft / Textured',
    specs: [['Product type', 'Fancy yarn'], ['Material composition', 'Acrylic / Cotton / Polyester'], ['Available sizes', 'Various'], ['Color options', 'Multiple colors'], ['Finish', 'Soft / textured'], ['Applications', 'Knitting, crochet, crafts, embellishments']],
  },
  {
    name: 'Pouch', type: 'POUCH', image: '/product%20images%20compressed/pouch_compressed.jpg',
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
          {displayed.map((product) => (
            <button
              key={product.name}
              type="button"
              onClick={() => setSelected(product)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101413] text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#00c853]/50 hover:bg-[#151a19]"
            >
              <div className="h-56 overflow-hidden bg-black/40">
                <Image
                    src={product.image}
                    alt={`${product.name} textile trim`}
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
              <Image
                  src={product.image}
                  alt={`${product.name} textile trim � ${GALLERY_VIEWS[view].label}`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
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
                  <Image src={product.image} alt="" fill sizes="100px" className={`size-full object-cover ${galleryView.className}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00c853]">{product.type} � {product.material}</p>
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
