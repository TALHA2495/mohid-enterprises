import { z } from 'zod'

// ============================================================================
// PRODUCT CATALOG VALIDATION — shared by the admin forms (react-hook-form) and
// the server actions (defence in depth: the action re-parses what it receives).
// ----------------------------------------------------------------------------
// Follows the lib/rfq-schema.ts convention: a `…FormInput` type describes the
// raw HTML string values, the parsed type is what the database receives.
// ============================================================================

/** Images must live on the ImageKit CDN — it is the only host next.config.mjs allows. */
const IMAGEKIT_HOST = 'ik.imagekit.io'

export const productImageSchema = z.object({
  url: z
    .string()
    .trim()
    .refine((value) => {
      try {
        return new URL(value).hostname === IMAGEKIT_HOST
      } catch {
        return false
      }
    }, `Images must be hosted on ${IMAGEKIT_HOST}.`),
  /** null for showroom-seeded images that this app did not upload. */
  fileId: z.string().trim().min(1).nullable(),
  name: z.string().trim().min(1, 'Image name is required.'),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
})

const MAX_IMAGES = 6

// The schema ONLY validates — it never transforms. Input and output are the same
// strings the browser typed, so react-hook-form, the form component and the
// server action all share one type and no value is converted twice.
// The server action performs the string -> number/array conversion once, just
// before writing to Postgres.

/** Whole number typed as text (HTML number inputs always hand us a string). */
const countField = (message: string, minimum = 0) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= minimum, message)

/** Whole number that may be left blank — blank means NULL, never 0. */
const optionalCountField = (message: string, minimum = 1) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (Number.isInteger(Number(value)) && Number(value) >= minimum),
      message,
    )

/** Decimal (money) that may be left blank — blank means NULL, never 0. */
const optionalMoneyField = (message: string, minimum = 0) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= minimum), message)

/** "Red, Blue ,Blue" is a valid list; a trailing comma is not. */
const csvList = z
  .string()
  .trim()
  .refine((value) => value === '' || csvToArray(value).length <= 24, 'Keep the list under 24 entries.')

/** Comma-separated input -> trimmed, de-duplicated, order preserved. */
export function csvToArray(value: string): string[] {
  return [...new Set(value.split(',').map((entry) => entry.trim()).filter(Boolean))]
}

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(120, 'Keep the name under 120 characters.'),
  categoryId: z.string().trim().min(1, 'Choose a category.'),
  description: z.string().trim().max(600, 'Keep the description under 600 characters.'),
  material: z.string().trim().min(2, 'Material is required.').max(120, 'Keep the material under 120 characters.'),
  widthMm: optionalCountField('Enter a nominal width in whole mm (e.g. 25).'),
  moqUnits: optionalCountField('Minimum order quantity must be a whole number of at least 1.'),
  pricePerUnit: optionalMoneyField('Unit price cannot be negative.'),
  stockAvailable: countField('Stock must be a whole number of 0 or more.', 0),
  colors: csvList,
  finishes: csvList,
  isActive: z.boolean(),
  images: z.array(productImageSchema).max(MAX_IMAGES, `A product can have at most ${MAX_IMAGES} images.`),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
/** Identical to the parsed type — the schema validates without transforming. */
export type ProductFormInput = ProductFormValues

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(40, 'Keep the name under 40 characters.'),
  sortOrder: countField('Sort order must be a whole number of 0 or more.', 0),
  isActive: z.boolean(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
export type CategoryFormInput = CategoryFormValues

/** Comma-separated list -> text shown in a form input. */
export function listToCsv(values: string[] | null | undefined): string {
  return (values ?? []).join(', ')
}

export { MAX_IMAGES }