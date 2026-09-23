-- ============================================================================
-- MIGRATION 0002 — PRODUCT CATALOG
-- ----------------------------------------------------------------------------
-- Adds a managed category taxonomy and multi-image support to the products
-- catalog, so the admin area can create/update products and categories.
--
-- Run this AFTER supabase/schema.sql, in the Supabase SQL editor.
-- It is IDEMPOTENT — safe to run more than once.
--
-- Design notes
--   * `category_id` is ADDED alongside the existing `category TEXT` column
--     instead of replacing it: every existing query, index and NOT NULL
--     contract keeps working, and the text column is kept in sync with the
--     category name by the application.
--   * `ON DELETE RESTRICT` means a category cannot be deleted while any
--     product still references it — the database refuses to orphan a product.
--   * `images` is a JSONB array of { url, fileId, name, width, height }.
--     ImageKit-hosted uploads carry a `fileId` (used to delete the remote
--     file); images seeded from the existing showroom carry `fileId: null`
--     and are therefore never deleted remotely by accident.
--   * product_categories is RLS-locked like every other table: the public
--     anon key cannot read or write it, the admin area uses the service role.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCT CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness: "Elastics" and "elastics" are the same category.
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_categories_name_lower
  ON product_categories (lower(name));

CREATE INDEX IF NOT EXISTS idx_product_categories_sort
  ON product_categories (sort_order);
CREATE INDEX IF NOT EXISTS idx_product_categories_active
  ON product_categories (is_active) WHERE is_active;

DROP TRIGGER IF EXISTS trg_product_categories_updated_at ON product_categories;
CREATE TRIGGER trg_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS — category_id
-- ----------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category') THEN
    ALTER TABLE products
      ADD CONSTRAINT fk_products_category
      FOREIGN KEY (category_id) REFERENCES product_categories (id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS — moq_units becomes optional
--    Only 6 of the 44 showroom products publish a "Minimum order quantity"
--    spec. Inventing MOQs for the rest would put fabricated data in front of
--    buyers, so the column becomes nullable — matching width_mm and
--    price_per_unit, which are already nullable for the same reason. The admin
--    list shows the blanks so they get filled in deliberately.
--    The existing CHECK (moq_units > 0) still holds: a CHECK passes on NULL.
-- ----------------------------------------------------------------------------
ALTER TABLE products ALTER COLUMN moq_units DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS — images (JSONB array, max 6)
-- ----------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_images_is_array') THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_images_is_array
      CHECK (jsonb_typeof(images) = 'array' AND jsonb_array_length(images) <= 6);
  END IF;
END $$;

-- Containment index so `images @> '[{"fileId":"..."}]'` lookups stay fast.
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING gin (images jsonb_path_ops);

-- ----------------------------------------------------------------------------
-- 5. AUDIT LOG — allow category events
--    The original CHECK predates the category taxonomy, so auditing a category
--    change would violate it. Widened here rather than writing category events
--    under entity_type 'product' (which would misattribute them).
-- ----------------------------------------------------------------------------
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_entity_type_check
  CHECK (entity_type IN ('customer', 'product', 'product_category', 'quote', 'order', 'invoice', 'payment'));

-- ----------------------------------------------------------------------------
-- 6. SEED CATEGORIES — the real showroom filter groups (lib/showroom.ts)
--    `on conflict do nothing` keeps re-runs harmless and never overwrites a
--    category an admin has since renamed or deactivated.
-- ----------------------------------------------------------------------------
INSERT INTO product_categories (name, sort_order) VALUES
  ('Elastics',        10),
  ('Tapes',           20),
  ('Ribbons',         30),
  ('Cords & Tassels', 40),
  ('Shoelaces',       50),
  ('Belts',           60),
  ('Egg Belts',       70),
  ('Pom Poms',        80),
  ('Lace',            90),
  ('Yarn',           100),
  ('Accessories',    110)
ON CONFLICT DO NOTHING;
