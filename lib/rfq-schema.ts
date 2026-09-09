import { z } from 'zod'

export type ProductContext = {
  product: string
  material: string
  width: string
  moq: string
}

/**
 * Builds the strict RFQ validation schema.
 *
 * The MOQ floor is data-driven: when the buyer arrives from a showroom
 * product page, the product's published "Minimum order quantity" spec
 * (e.g. "500 meters" -> 500) is extracted and enforced on the quantity
 * field. Without product context, any positive quantity is accepted.
 *
 * Parse a spec like "500 meters" / "250 pieces" into its numeric part.
 */
export function parseMoq(moq: string): number | null {
  const match = moq.match(/[\d.]+/)
  if (!match) return null
  const value = Number.parseFloat(match[0])
  return Number.isFinite(value) && value > 0 ? value : null
}

export function createRfqSchema(productContext: Partial<ProductContext>) {
  const moqFloor = parseMoq(productContext.moq ?? '')

  return z
    .object({
      inquiry: z
        .string()
        .trim()
        .min(10, 'Please describe your specifications (at least 10 characters).'),
      companyName: z
        .string()
        .trim()
        .min(2, 'Company name is required.'),
      workEmail: z
        .string()
        .trim()
        .email('Enter a valid work email.'),
      quantity: z.coerce
        .number()
        .refine((value) => Number.isFinite(value) && value > 0, 'Enter a numeric order quantity greater than zero.'),
      destinationPort: z
        .string()
        .trim()
        .min(2, 'Destination port is required (e.g. Istanbul, Yokohama).'),
      notes: z.string().trim().max(500, 'Keep notes under 500 characters.').optional().or(z.literal('')),
    })
    .superRefine((values, ctx) => {
      if (moqFloor !== null && values.quantity < moqFloor) {
        ctx.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: `Below the product's minimum order quantity of ${productContext.moq}.`,
        })
      }
    })
}

export type RfqInput = z.infer<ReturnType<typeof createRfqSchema>>

/** Pre-parse form shape (z.coerce makes `quantity` unknown before validation). */
export type RfqFormInput = z.input<ReturnType<typeof createRfqSchema>>
