-- ============================================================================
-- MIGRATION 0003 — HERO SECTIONS (public home-page category cards)
-- ----------------------------------------------------------------------------
-- Adds a small, editable catalog of the 6 category cards shown on the home
-- hero. Admin can reorder / add / remove / deactivate them; they seed from
-- the existing static HERO_CATEGORIES in lib/showroom.ts so the site looks
-- identical until an editor changes it.
--
-- Apply after 0002_products_catalog.sql (products already exist).
-- ============================================================================
-- ----------------------------------------------------------------------------
-- Table + audit
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hero_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label         TEXT NOT NULL,
  description   TEXT,
  -- showroom filter the card points to (matches SHOWROOM_FILTERS)
  "filter"      TEXT NOT NULL,
  -- ImageKit CDN url (optionally ?tr= transform suffix)
  image         TEXT NOT NULL,
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS hero_sections_label_key ON hero_sections (lower(label));
CREATE INDEX IF NOT EXISTS idx_hero_sections_active_sort
  ON hero_sections (is_active DESC, sort_order, label);

-- Keep updated_at fresh (reuses the table-1 trigger from schema.sql).
DROP TRIGGER IF EXISTS trg_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER trg_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Seed from the current static cards so the home page is unchanged until an
-- editor reorders/adds/removes. Guarded so re-running the migration (or the
-- canonical seed script) never inserts duplicates.
-- ----------------------------------------------------------------------------
INSERT INTO hero_sections (label, description, "filter", image, sort_order, is_active)
VALUES
  ('Industrial Egg Belts',  'Specialized belting for agricultural systems.',      'Egg Belts',      '/product%20images%20webp/pp%20woven%20egg%20conveyor%20belt.avif', 10, true),
  ('Pom Poms & Lace',       'Delicate Guipure and playful accents for apparel.',   'Pom Poms',       '/product%20images%20compressed/Pom%20Pom%20Trim_compressed.webp',  20, true),
  ('Accessories & Crafts',  'Custom packaging and specialty finished goods.',      'Accessories',    '/product%20images%20compressed/Party%20Hat_compressed.webp',       30, true),
  ('Tapes & Ribbons',       'Structural strength and high-polish finishes.',       'Tapes',          '/product%20images%20compressed/Twill%20Tape_compressed.webp',       40, true),
  ('Elastics & Belts',      'Custom waistbands and durable utility webbing.',      'Elastics',       '/product%20images%20compressed/Jacquard%20Elastic%20%26%20Tape_compressed.webp', 50, true),
  ('Cords & Tassels',       'Functional drawstrings and decorative end-finishes.', 'Cords & Tassels', '/product%20images%20compressed/Flat%20Draw%20Cord_compressed.webp', 60, true)
ON CONFLICT (lower(label)) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Audit hook for hero-section edits (best-effort, never blocks the write).
-- hero_sections is a 7th auditable entity; extend the CHECK accordingly.
-- ----------------------------------------------------------------------------
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log
  ADD CONSTRAINT audit_log_entity_type_check
  CHECK (entity_type IN ('customer', 'product', 'quote', 'order', 'invoice', 'payment', 'hero'));
CREATE OR REPLACE FUNCTION public.log_hero_edit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('hero', NEW.id, 'created',
            jsonb_build_object('label', NEW.label, 'filter', NEW."filter", 'is_active', NEW.is_active),
            'admin_dashboard', 'Hero card added from the admin dashboard');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('hero', NEW.id, 'updated',
            jsonb_build_object('label', NEW.label, 'sort_order', NEW.sort_order, 'is_active', NEW.is_active),
            'admin_dashboard', 'Hero card edited from the admin dashboard');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, old_state, changed_by, change_reason)
    VALUES ('hero', OLD.id, 'deleted',
            jsonb_build_object('label', OLD.label, 'is_active', OLD.is_active),
            'admin_dashboard', 'Hero card removed from the admin dashboard');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hero_audit ON hero_sections;
CREATE TRIGGER trg_hero_audit
  AFTER INSERT OR UPDATE OR DELETE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION public.log_hero_edit();

-- ----------------------------------------------------------------------------
-- Row-level security: zero direct anon/authenticated access. The admin
-- dashboard uses the service-role key (bypasses RLS); the public site only
-- READS hero_sections via loadHeroCategories() on the server (service role).
-- No anon/authenticated policies are granted here.
-- ----------------------------------------------------------------------------
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
