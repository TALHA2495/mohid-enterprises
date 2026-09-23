-- ==============================================================================
-- 0005 — FACTORY SECTIONS: DB-driven factory-page images (hero grid + cards)
-- ------------------------------------------------------------------------------
-- `kind` unifies the two image groups on /factory:
--   * 'hero' — the 3 full-bleed images (Material preparation / Production
--              floor / Packed inventory)
--   * 'card' — the 3 white cards (Quality Inspection Protocol / Export
--              Packaging / Incoterms & Logistics)
-- Reads go through the service-role key (server components) like every other
-- public catalog read — RLS stays on with zero anon policies.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS factory_sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT NOT NULL CHECK (kind IN ('hero', 'card')),
  title      TEXT NOT NULL,
  subtitle   TEXT,
  image_url  TEXT NOT NULL,
  file_id    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One hero/card entry per title: makes seeding re-runnable and blocks dupes.
CREATE UNIQUE INDEX IF NOT EXISTS uq_factory_sections_title_kind
  ON factory_sections (lower(title), kind);
CREATE INDEX IF NOT EXISTS idx_factory_sections_active_sort
  ON factory_sections (is_active, sort_order);

DROP TRIGGER IF EXISTS trg_factory_sections_updated_at ON factory_sections;
CREATE TRIGGER trg_factory_sections_updated_at
  BEFORE UPDATE ON factory_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE factory_sections ENABLE ROW LEVEL SECURITY;

-- Audit CHECK now covers factory_section (also restores product_category,
-- which 0003 accidentally dropped).
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log
  ADD CONSTRAINT audit_log_entity_type_check
  CHECK (entity_type IN ('customer', 'product', 'product_category', 'quote',
                         'order', 'invoice', 'payment', 'hero', 'factory_section'));
