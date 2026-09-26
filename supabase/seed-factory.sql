-- ============================================================================
-- SEED / REPAIR — factory_sections (the three /factory photo tiles)
-- ------------------------------------------------------------------------------
-- The hero tiles below are the only rows /factory renders. The capability
-- cards that used to follow them were retired in the 2026 restructure and must
-- stay is_active = false; their URLs are listed at the bottom for reference.
--
--   Run in the Supabase SQL editor, or relabel live rows with:
--   node --env-file=.env.local scripts/update-factory-sections.mjs
--
-- Idempotent by image_url, NOT by title. The (lower(title), kind) unique index
-- means a title-keyed INSERT would, after a rename, add a SECOND tile pointing
-- at the same photo — matching the URL makes re-runs a no-op instead.
-- ============================================================================

INSERT INTO factory_sections (kind, title, subtitle, image_url, sort_order, is_active)
SELECT v.kind, v.title, v.subtitle, v.image_url, v.sort_order, v.is_active
FROM (VALUES
  ('hero', 'Textile Trims',     NULL::text, 'https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp', 10, true),
  ('hero', 'Braids & Cords',    NULL::text, 'https://ik.imagekit.io/a2q8u8qtw/factory/Braiding%20Winding.webp',   20, true),
  ('hero', 'Packed for Export', NULL::text, 'https://ik.imagekit.io/a2q8u8qtw/factory/packed%20inventory.png',    30, true)
) AS v(kind, title, subtitle, image_url, sort_order, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM factory_sections f WHERE f.image_url = v.image_url
);

-- The retired capability cards stay in the table so the copy is one UPDATE away
-- from returning. No-op once scripts/update-factory-sections.mjs has run.
UPDATE factory_sections SET is_active = false WHERE kind = 'card';

-- Retired card imagery (kept for the record; note the RAW '&' — '%26' 404s):
--   https://ik.imagekit.io/a2q8u8qtw/factory/quality%20inspection.webp
--   https://ik.imagekit.io/a2q8u8qtw/factory/global_export.webp
--   https://ik.imagekit.io/a2q8u8qtw/factory/Logistics%20&%20Export.png

