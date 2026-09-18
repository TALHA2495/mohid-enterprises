import { z } from 'zod'

// ============================================================================
// HERO SECTIONS FORM SCHEMA
// ----------------------------------------------------------------------------
// Mirrors supabase/migrations/0003_hero_sections.sql. A hero card is the
// editable category tile on the home page. `image` is a path on the ImageKit
// URL endpoint (the public site turns it into a transformed CDN url); the
// upload flow itself lives in /admin/hero, so it never runs without the
// ImageKit env vars configured.
// ============================================================================

export const heroFormSchema = z.object({
  label: z.string().min(2, 'Give the card a title.').max(64),
  desc: z.string().max(280, 'Keep the description under 280 characters.').optional(),
  filter: z.enum(
    ['All trims', 'Egg Belts', 'Pom Poms', 'Accessories', 'Tapes', 'Elastics', 'Cords & Tassels', 'Shoelaces', 'Ribbons', 'Belts', 'Lace', 'Yarn'],
    { error: (issue) => `Pick a showroom filter${issue?.received !== 'string' ? ` — you chose "${issue?.received}"` : ''}.` },
  ),
  image: z
    .string()
    .min(1, 'Add an image (upload or paste a path).')
    .max(512),
  sortOrder: z
    .string()
    .optional()
        .refine((value) => value === undefined || value === '' || (value.trim() !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: 'Sort must be a whole number.',
    }),
  isActive: z.boolean().default(true),
})

export type HeroFormInput = z.infer<typeof heroFormSchema>
