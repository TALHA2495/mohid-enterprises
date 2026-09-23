-- ============================================================================
-- SEED FACTORY SECTIONS — 6 images from the ImageKit CDN (account a2q8u8qtw)
-- ------------------------------------------------------------------------------
-- Generated from the current factory-page.tsx content (3 hero images +
-- 3 info cards) and the ImageKit folder /factory.
--
--   Run in the Supabase SQL editor, or:
--   node --env-file=.env.local scripts/run-seed.mjs supabase/seed-factory.sql
--
-- Idempotent: ON CONFLICT against the (lower(title), kind) expression index.
-- Postgres requires the expression parenthesized — hence the double parens.
-- ============================================================================

INSERT INTO factory_sections (kind, title, subtitle, image_url, sort_order, is_active) VALUES
  -- Hero grid (top of /factory) — full-bleed production imagery.
  ('hero', 'Material preparation',     NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/textile%20production.webp',      10, true),
  ('hero', 'Production floor',         NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/Braiding%20Winding.webp',        20, true),
  ('hero', 'Packed inventory',         NULL, 'https://ik.imagekit.io/a2q8u8qtw/factory/packed%20inventory.png',         30, true),
  -- Info cards (bottom of /factory) — capability callouts.
  ('card', 'Quality Inspection Protocol', 'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/quality%20inspection.webp', 10, true),
  ('card', 'Export Packaging',            'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/global_export.webp',        20, true),
  -- NOTE: the '&' here must stay RAW. '%26' returns HTTP 404 from ImageKit.
  ('card', 'Incoterms & Logistics',       'Consistent processes, clear specifications, and dependable communication for every order.', 'https://ik.imagekit.io/a2q8u8qtw/factory/Logistics%20&%20Export.png', 30, true)
ON CONFLICT ((lower(title)), kind) DO NOTHING;
