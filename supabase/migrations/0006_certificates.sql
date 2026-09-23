-- ==============================================================================
-- 0006 — CERTIFICATES: DB-driven standards-page certificate gallery
-- ------------------------------------------------------------------------------
-- The 3 compliance certificates on /standards become editable rows instead of
-- a hardcoded array. Same conventions as factory_sections: service-role reads,
-- RLS on with zero anon policies, audit via server actions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  subtitle   TEXT,
  image_url  TEXT NOT NULL,
  file_id    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_title_lower ON certificates (lower(title));
CREATE INDEX IF NOT EXISTS idx_certificates_active_sort ON certificates (is_active, sort_order);

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON certificates;
CREATE TRIGGER trg_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Final audit CHECK: product_category restored, + factory_section + certificate.
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_entity_type_check;
ALTER TABLE audit_log
  ADD CONSTRAINT audit_log_entity_type_check
  CHECK (entity_type IN ('customer', 'product', 'product_category', 'quote',
                         'order', 'invoice', 'payment', 'hero',
                         'factory_section', 'certificate'));
