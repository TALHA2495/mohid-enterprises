-- ==============================================================================
-- 0004 — PRODUCTS: showroom fields (type tag + specs JSONB)
-- ------------------------------------------------------------------------------
-- The public showroom renders fields the base table lacked:
--   * type     — the ELASTIC / TAPE / RIBBON ... tag used by filter chips
--   * specs    — the [["Label","Value"], ...] array shown in the detail table
--                (also carries the "Available widths" range string, "Color
--                options", "Finish", "Lead time")
-- Both are NULLable so existing rows stay valid; backfill happens via script.
-- ==============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT;
CREATE INDEX IF NOT EXISTS idx_products_type ON products (type);

ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB;
