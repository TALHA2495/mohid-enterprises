-- ============================================================================
-- MOHID ENTERPRISES — ORDER LIFECYCLE SCHEMA (quote → order → invoice → payment)
-- ----------------------------------------------------------------------------
-- Run order: this entire file, top to bottom, in the Supabase SQL Editor.
-- It is NOT re-runnable (CREATE TABLE will error if tables exist); use the
-- DROP section below (uncomment) to reset a dev database first.
--
-- Fixes vs. the original draft:
--   * quote_line_items.product_id is NULLABLE (web RFQs have no catalog match yet)
--   * unit_price / line_total / totals are NULLABLE (quotes are priced by admin
--     later — negotiated pricing, not catalog pricing)
--   * quotes.rfq_details (JSONB) preserves the full RFQ payload verbatim
--   * payment trigger syncs INVOICE balances first, then the parent ORDER
--   * payments ledger is write-once (ledger columns locked, deletes blocked)
--   * RLS: zero direct anon/authenticated table access — the public web form
--     goes through the create_quote() SECURITY DEFINER RPC only, and the admin
--     dashboard uses the service-role key (bypasses RLS)
-- ============================================================================

-- Uncomment to reset a dev database:
-- DROP FUNCTION IF EXISTS public.create_quote(text,text,text,text,text,text,int,numeric,jsonb,int);
-- DROP TABLE IF EXISTS audit_log, payments, invoices, orders, quote_line_items, quotes, products, customers CASCADE;
-- DROP SEQUENCE IF EXISTS quote_number_seq CASCADE;

-- ----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row mutation
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Sequential quote numbering: QT-0001, QT-0002, ...
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- ============================================================================
-- TABLE 1: CUSTOMERS (root entity — deduplicated by email, tracked by phone)
-- ============================================================================
CREATE TABLE customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL,
  phone                 TEXT,
  name                  TEXT NOT NULL,
  company_name          TEXT,
  billing_address       TEXT,
  shipping_address      TEXT,
  city                  TEXT,
  country               TEXT NOT NULL DEFAULT 'Pakistan',
  account_status        TEXT NOT NULL DEFAULT 'active'
                        CHECK (account_status IN ('active', 'suspended', 'blacklisted')),
  credit_limit          NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
  credit_terms_enabled  BOOLEAN NOT NULL DEFAULT false,
  customer_since        TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_orders_count    INT NOT NULL DEFAULT 0 CHECK (total_orders_count >= 0),
  total_orders_value    NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total_orders_value >= 0),
  last_order_date       TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_customers_email CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Case-insensitive dedup: Buyer@X.com and buyer@x.com are the same customer
CREATE UNIQUE INDEX uq_customers_email_lower ON customers (lower(email));
CREATE INDEX idx_customers_phone   ON customers (phone);
CREATE INDEX idx_customers_company ON customers (company_name);
CREATE INDEX idx_customers_status  ON customers (account_status);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 2: PRODUCTS (master catalog — source of truth for specs & pricing)
-- ============================================================================
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL UNIQUE,
  category            TEXT NOT NULL,
  description         TEXT,
  material            TEXT NOT NULL,
  width_mm            INT CHECK (width_mm IS NULL OR width_mm > 0),
  available_colors    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  available_finishes  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  moq_units           INT NOT NULL CHECK (moq_units > 0),
  price_per_unit      NUMERIC(10, 4) CHECK (price_per_unit IS NULL OR price_per_unit >= 0),
  currency            TEXT NOT NULL DEFAULT 'PKR',
  stock_available     INT NOT NULL DEFAULT 0 CHECK (stock_available >= 0),
  is_active           BOOLEAN NOT NULL DEFAULT true,
    supplier_id         UUID,
  last_price_update   TIMESTAMPTZ,
  type                TEXT,
  specs               JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_active   ON products (is_active) WHERE is_active;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 3: QUOTES (lifecycle: draft → sent → viewed → accepted | rejected | expired)
-- ============================================================================
CREATE TABLE quotes (
  id                             TEXT PRIMARY KEY,  -- "Q-20260916-AB12CD"
  customer_id                    UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  quote_number                   TEXT NOT NULL UNIQUE
                                 DEFAULT 'QT-' || lpad(nextval('quote_number_seq')::text, 4, '0'),
  quote_status                   TEXT NOT NULL DEFAULT 'draft'
                                 CHECK (quote_status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  quote_status_updated_at        TIMESTAMPTZ,

  -- Pricing snapshot (NULL until an admin prices the negotiated quote)
  total_amount                   NUMERIC(15, 2) CHECK (total_amount IS NULL OR total_amount >= 0),
  currency                       TEXT NOT NULL DEFAULT 'PKR',
  tax_rate                       NUMERIC(5, 4) CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 1)),
  tax_amount                     NUMERIC(15, 2) CHECK (tax_amount IS NULL OR tax_amount >= 0),

  -- Validity window
  valid_from                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until                    TIMESTAMPTZ,
  CONSTRAINT chk_quotes_validity CHECK (valid_until IS NULL OR valid_until > valid_from),

  -- Communication tracking (WhatsApp handoff)
  whatsapp_message_text          TEXT,
  whatsapp_sent_at               TIMESTAMPTZ,
  whatsapp_delivery_confirmed    BOOLEAN NOT NULL DEFAULT false,
  whatsapp_delivery_confirmed_at TIMESTAMPTZ,

  -- Lifecycle timestamps
  accepted_at                    TIMESTAMPTZ,
  rejected_at                    TIMESTAMPTZ,
  rejection_reason               TEXT,

  -- Full RFQ payload preserved verbatim (inquiry, destination port, deep-link
  -- product context) — the audit-proof copy of "what did the buyer ask?"
  rfq_details                    JSONB,

  -- Notes & audit
  customer_notes                 TEXT,
  internal_notes                 TEXT,
  created_by                     TEXT NOT NULL DEFAULT 'api',
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_customer_id ON quotes (customer_id);
CREATE INDEX idx_quotes_status      ON quotes (quote_status);
CREATE INDEX idx_quotes_created_at  ON quotes (created_at DESC);
CREATE INDEX idx_quotes_valid_until ON quotes (valid_until)
  WHERE quote_status IN ('draft', 'sent', 'viewed');

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 4: QUOTE_LINE_ITEMS (specs snapshot locked at quote time)
-- ============================================================================
CREATE TABLE quote_line_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            TEXT NOT NULL REFERENCES quotes (id) ON DELETE CASCADE,
  product_id          UUID REFERENCES products (id) ON DELETE SET NULL,  -- nullable: RFQs may not match catalog
  product_name        TEXT NOT NULL,
  material            TEXT,
  width_mm            INT CHECK (width_mm IS NULL OR width_mm > 0),
  color               TEXT,
  finish              TEXT,

  quantity_requested  NUMERIC(12, 2) NOT NULL CHECK (quantity_requested > 0),
  quantity_accepted   NUMERIC(12, 2) CHECK (quantity_accepted IS NULL OR quantity_accepted > 0),
  unit_price          NUMERIC(10, 4) CHECK (unit_price IS NULL OR unit_price >= 0),
  line_total          NUMERIC(15, 2) CHECK (line_total IS NULL OR line_total >= 0),

  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qli_quote_id   ON quote_line_items (quote_id);
CREATE INDEX idx_qli_product_id ON quote_line_items (product_id);

CREATE TRIGGER trg_qli_updated_at
  BEFORE UPDATE ON quote_line_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 5: ORDERS (lifecycle: pending → confirmed → in_production → quality_check
--            → ready_to_ship → shipped → delivered | cancelled)
-- ============================================================================
CREATE TABLE orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number             TEXT NOT NULL UNIQUE,          -- "ORD-20260916-001"
  customer_id              UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  quote_id                 TEXT REFERENCES quotes (id) ON DELETE SET NULL,

  order_status             TEXT NOT NULL DEFAULT 'pending'
                           CHECK (order_status IN ('pending', 'confirmed', 'in_production',
                                 'quality_check', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),
  order_status_updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Pricing (from the accepted quote)
  total_amount             NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
  tax_rate                 NUMERIC(5, 4) CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 1)),
  tax_amount               NUMERIC(15, 2) CHECK (tax_amount IS NULL OR tax_amount >= 0),
  discount_applied         NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount_applied >= 0),
  currency                 TEXT NOT NULL DEFAULT 'PKR',

  -- Production tracking
  production_start_date    TIMESTAMPTZ,
  production_end_date      TIMESTAMPTZ,
  quality_check_passed     BOOLEAN,
  quality_check_date       TIMESTAMPTZ,
  quality_notes            TEXT,

  -- Shipment tracking
  tracking_number          TEXT,
  shipped_date             TIMESTAMPTZ,
  estimated_delivery       TIMESTAMPTZ,
  delivered_date           TIMESTAMPTZ,

  -- Payment status (denormalized — kept in sync by the payments trigger)
  payment_status           TEXT NOT NULL DEFAULT 'unpaid'
                           CHECK (payment_status IN ('unpaid', 'partially_paid', 'fully_paid', 'overdue')),
  amount_due               NUMERIC(15, 2),
  amount_paid              NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),

  customer_notes           TEXT,
  internal_notes           TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer_id    ON orders (customer_id);
CREATE INDEX idx_orders_status         ON orders (order_status);
CREATE INDEX idx_orders_created_at     ON orders (created_at DESC);
CREATE INDEX idx_orders_quote_id       ON orders (quote_id);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 6: INVOICES (lifecycle: draft → issued → sent → partially_paid
--                     → fully_paid | overdue | cancelled)
-- ============================================================================
CREATE TABLE invoices (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number            TEXT NOT NULL UNIQUE,        -- "INV-20260916-001"
  order_id                  UUID NOT NULL REFERENCES orders (id) ON DELETE RESTRICT,
  customer_id               UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,

  invoice_status            TEXT NOT NULL DEFAULT 'draft'
                            CHECK (invoice_status IN ('draft', 'issued', 'sent', 'partially_paid',
                                    'fully_paid', 'overdue', 'cancelled')),
  invoice_status_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  invoice_date              TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date                  TIMESTAMPTZ,
  payment_terms             TEXT,                        -- "Net 30", "50% advance + 50% on delivery", "COD"

  subtotal                  NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
  tax_rate                  NUMERIC(5, 4) CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 1)),
  tax_amount                NUMERIC(15, 2) CHECK (tax_amount IS NULL OR tax_amount >= 0),
  shipping_cost             NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount              NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
  currency                  TEXT NOT NULL DEFAULT 'PKR',

  -- Payment tracking (amount_paid/balance kept in sync by the payments trigger)
  amount_due                NUMERIC(15, 2) NOT NULL,
  amount_paid               NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  balance_remaining         NUMERIC(15, 2) NOT NULL,

  sent_to_customer_at       TIMESTAMPTZ,
  sent_via                  TEXT CHECK (sent_via IS NULL OR sent_via IN ('email', 'whatsapp', 'print')),

  notes                     TEXT,
  created_by                TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_customer_id ON invoices (customer_id);
CREATE INDEX idx_invoices_order_id    ON invoices (order_id);
CREATE INDEX idx_invoices_status      ON invoices (invoice_status);
CREATE INDEX idx_invoices_due_date    ON invoices (due_date)
  WHERE invoice_status IN ('issued', 'sent', 'partially_paid');

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE 7: PAYMENTS (immutable ledger — write once, reverse via status only)
-- ============================================================================
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number        TEXT NOT NULL UNIQUE,            -- "PAY-20260916-001"
  invoice_id            UUID NOT NULL REFERENCES invoices (id) ON DELETE RESTRICT,
  customer_id           UUID NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,

  payment_amount        NUMERIC(15, 2) NOT NULL CHECK (payment_amount > 0),
  payment_date          TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method        TEXT NOT NULL
                        CHECK (payment_method IN ('bank_transfer', 'cheque', 'cash', 'stripe', 'easypaisa')),
  payment_status        TEXT NOT NULL DEFAULT 'completed'
                        CHECK (payment_status IN ('completed', 'failed', 'pending', 'reversed')),

  bank_name             TEXT,
  transaction_id        TEXT,                            -- cheque no. or bank reference
  transaction_date      TIMESTAMPTZ,

  reconciled_at         TIMESTAMPTZ,
  reconciled_by         TEXT,
  reconciliation_notes  TEXT,

  notes                 TEXT,
  created_by            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice_id  ON payments (invoice_id);
CREATE INDEX idx_payments_customer_id ON payments (customer_id);
CREATE INDEX idx_payments_date        ON payments (payment_date DESC);
CREATE INDEX idx_payments_status      ON payments (payment_status);

-- ----------------------------------------------------------------------------
-- Immutability enforcement: ledger identity/money columns can never change and
-- rows can never be deleted. Only reconciliation + status columns may be
-- updated (e.g. marking a bounced cheque 'reversed').
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_payment_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'payments is an immutable ledger — record a reversal via payment_status = ''reversed'' instead'
      USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.invoice_id       IS DISTINCT FROM NEW.invoice_id
     OR OLD.customer_id   IS DISTINCT FROM NEW.customer_id
     OR OLD.payment_amount IS DISTINCT FROM NEW.payment_amount
     OR OLD.payment_method IS DISTINCT FROM NEW.payment_method
     OR OLD.payment_date  IS DISTINCT FROM NEW.payment_date THEN
    RAISE EXCEPTION 'payments ledger fields (amount/method/date/invoice) are immutable — void this payment and record a new one'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_payments_immutable
  BEFORE UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_payment_mutation();

-- ============================================================================
-- TABLE 8: AUDIT_LOG (append-only record of every meaningful mutation)
-- ============================================================================
CREATE TABLE audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type    TEXT NOT NULL
                                   CHECK (entity_type IN ('customer', 'product', 'product_category', 'quote', 'order', 'invoice', 'payment', 'hero', 'factory_section', 'certificate')),
  entity_id      TEXT NOT NULL,
  action         TEXT NOT NULL
                 CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
  old_state      JSONB,
  new_state      JSONB,
  changed_by     TEXT,
  change_reason  TEXT,
  timestamp      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity    ON audit_log (entity_type, entity_id, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_log (timestamp DESC);

-- ----------------------------------------------------------------------------
-- Payment sync: whenever a payment row lands (or its status changes), recompute
-- the invoice balance from the ledger, then cascade to the parent order.
-- Fixes the original draft, which updated orders.amount_paid status but never
-- actually incremented it and never touched the invoice.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_invoice_and_order_payments()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice_total NUMERIC(15, 2);
  v_paid          NUMERIC(15, 2);
  v_order_id      UUID;
BEGIN
  SELECT total_amount INTO v_invoice_total FROM invoices WHERE id = NEW.invoice_id;
  IF v_invoice_total IS NULL THEN
    RETURN NULL;  -- invoice vanished (RESTRICT should prevent this; defensive only)
  END IF;

  SELECT COALESCE(SUM(payment_amount), 0) INTO v_paid
  FROM payments
  WHERE invoice_id = NEW.invoice_id AND payment_status = 'completed';

  UPDATE invoices
  SET amount_paid               = v_paid,
      balance_remaining         = v_invoice_total - v_paid,
      amount_due                = v_invoice_total - v_paid,
      invoice_status            = CASE
                                    WHEN v_paid <= 0 THEN 'issued'
                                    WHEN v_paid >= v_invoice_total THEN 'fully_paid'
                                    ELSE 'partially_paid'
                                  END,
      invoice_status_updated_at = now(),
      updated_at                = now()
  WHERE id = NEW.invoice_id
  RETURNING order_id INTO v_order_id;

  IF v_order_id IS NOT NULL THEN
    UPDATE orders
    SET amount_paid    = v_paid,
        amount_due     = total_amount - v_paid,
        payment_status = CASE
                           WHEN v_paid <= 0 THEN 'unpaid'
                           WHEN v_paid >= total_amount THEN 'fully_paid'
                           ELSE 'partially_paid'
                         END,
        updated_at     = now()
    WHERE id = v_order_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_payments_sync
  AFTER INSERT OR UPDATE OF payment_status, payment_amount ON payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_and_order_payments();

-- ============================================================================
-- PUBLIC RFQ INTAKE: create_quote() RPC
-- ----------------------------------------------------------------------------
-- The web form calls this single function. It is SECURITY DEFINER so the anon
-- role never needs direct SELECT/INSERT on any table (RLS stays fully locked).
-- It performs, atomically:
--   1. duplicate submission check (same email within the window)
--   2. customer upsert (dedup by case-insensitive email, phone updated if empty)
--   3. quote header insert (Q-YYYYMMDD-XXXXXX id, QT-#### number, validity window)
--   4. line item insert (specs snapshot)
--   5. audit_log entry
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_quote(
  p_full_name      text,
  p_company_name   text,
  p_email          text,
  p_phone          text,
  p_product_name   text,
  p_material       text,
  p_width_mm       int,
  p_quantity       numeric,
  p_rfq_details    jsonb,
  p_validity_days  int DEFAULT 7
)
RETURNS TABLE (quote_id text, customer_id uuid, duplicate boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_id    uuid;
  v_quote_id       text;
  v_existing_quote text;
  v_window_start   timestamptz;
  v_dedup_hours    int := COALESCE(NULLIF(current_setting('app.duplicate_window_hours', true), '')::int, 1);
BEGIN
  -- Light server-side sanitation of the incoming email
  IF p_email IS NULL OR p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = 'P0001';
  END IF;

  -- 1. Duplicate submission guard (per-email sliding window)
  v_window_start := now() - make_interval(hours => v_dedup_hours);
  SELECT q.id INTO v_existing_quote
  FROM quotes q
  JOIN customers c ON c.id = q.customer_id
  WHERE lower(c.email) = lower(p_email)
    AND q.created_at >= v_window_start
  ORDER BY q.created_at DESC
  LIMIT 1;

  IF v_existing_quote IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_quote, c.id, true FROM customers c WHERE lower(c.email) = lower(p_email) LIMIT 1;
    RETURN;
  END IF;

  -- 2. Customer upsert on case-insensitive email
  INSERT INTO customers (email, phone, name, company_name, country, account_status)
  VALUES (p_email, p_phone, p_full_name, p_company_name, 'Pakistan', 'active')
  ON CONFLICT (lower(email)) DO UPDATE
    SET phone = COALESCE(customers.phone, EXCLUDED.phone),
        name  = COALESCE(NULLIF(customers.name, ''), EXCLUDED.name)
  RETURNING customers.id INTO v_customer_id;

  -- 3. Quote header (id collision retry — random suffix is 6 chars, not 5)
  LOOP
    v_quote_id := 'Q-' || to_char(now() AT TIME ZONE 'utc', 'YYYYMMDD') || '-' ||
                  upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    BEGIN
      INSERT INTO quotes (
        id, customer_id, quote_status, quote_status_updated_at,
        valid_from, valid_until, currency, customer_notes, rfq_details, created_by
      ) VALUES (
        v_quote_id, v_customer_id, 'sent', now(),
        now(), now() + make_interval(days => COALESCE(p_validity_days, 7)),
        'PKR', p_rfq_details->>'notes', p_rfq_details, 'web_form'
      );
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      NULL;  -- id collision: loop and try a new suffix
    END;
  END LOOP;

  -- 4. Line item snapshot
  INSERT INTO quote_line_items (
    quote_id, product_id, product_name, material, width_mm, quantity_requested
  ) VALUES (
    v_quote_id, NULL, COALESCE(NULLIF(p_product_name, ''), 'Unspecified'),
    NULLIF(p_material, ''), NULLIF(p_width_mm, 0), p_quantity
  );

  -- 5. Audit entry
  INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
  VALUES (
    'quote', v_quote_id, 'created',
    jsonb_build_object('quote_id', v_quote_id, 'customer_id', v_customer_id,
                       'email', p_email, 'quantity', p_quantity),
    'web_form', 'Customer submitted quote via website form'
  );

  RETURN QUERY SELECT v_quote_id, v_customer_id, false;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY — zero direct client access
-- ----------------------------------------------------------------------------
-- Every table is fully locked for anon + authenticated roles. The public form
-- reaches create_quote() (SECURITY DEFINER); the admin dashboard uses the
-- service-role key, which bypasses RLS entirely.
-- ============================================================================
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;

-- No policies are created: with RLS enabled and zero policies, all operations
-- from anon/authenticated keys are denied (service-role key bypasses RLS).

-- Grant only the RPC entry point to the public intake path
REVOKE ALL ON FUNCTION public.create_quote(text, text, text, text, text, text, int, numeric, jsonb, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_quote(text, text, text, text, text, text, int, numeric, jsonb, int) TO anon, authenticated;

-- ============================================================================
-- TABLE 9: HERO_SECTIONS (home-page category cards, editable from /admin/hero)
-- ----------------------------------------------------------------------------
-- Mirrors supabase/migrations/0003_hero_sections.sql. Seeds from the static
-- HERO_CATEGORIES in lib/showroom.ts so the home page is unchanged until an
-- editor reorders/adds/removes. Kept idempotent so the canonical schema and
-- the incremental migration can both be applied safely.
-- ============================================================================
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

DROP TRIGGER IF EXISTS trg_hero_sections_updated_at ON hero_sections;
CREATE TRIGGER trg_hero_sections_updated_at
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed from the current static cards (guarded: never duplicates).
INSERT INTO hero_sections (label, description, "filter", image, sort_order, is_active)
VALUES
  ('Industrial Egg Belts',  'Specialized belting for agricultural systems.',      'Egg Belts',      '/product%20images%20webp/pp%20woven%20egg%20conveyor%20belt.avif', 10, true),
  ('Pom Poms & Lace',       'Delicate Guipure and playful accents for apparel.',   'Pom Poms',       '/product%20images%20compressed/Pom%20Pom%20Trim_compressed.webp',  20, true),
  ('Accessories & Crafts',  'Custom packaging and specialty finished goods.',      'Accessories',    '/product%20images%20compressed/Party%20Hat_compressed.webp',       30, true),
  ('Tapes & Ribbons',       'Structural strength and high-polish finishes.',       'Tapes',          '/product%20images%20compressed/Twill%20Tape_compressed.webp',       40, true),
  ('Elastics & Belts',      'Custom waistbands and durable utility webbing.',      'Elastics',       '/product%20images%20compressed/Jacquard%20Elastic%20%26%20Tape_compressed.webp', 50, true),
  ('Cords & Tassels',       'Functional drawstrings and decorative end-finishes.', 'Cords & Tassels', '/product%20images%20compressed/Flat%20Draw%20Cord_compressed.webp', 60, true)
ON CONFLICT (lower(label)) DO NOTHING;

-- Audit hook for hero-section edits (best-effort, never blocks the write).
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

ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- TABLES 10-11: FACTORY_SECTIONS + CERTIFICATES (DB-driven factory & standards pages)
-- ----------------------------------------------------------------------------
-- Mirrors supabase/migrations/0005_factory_sections.sql and 0006_certificates.sql.
-- ===========================================================================
-- TABLE 10: FACTORY_SECTIONS
CREATE TABLE IF NOT EXISTS factory_sections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT NOT NULL CHECK (kind IN ('hero', 'card')),
  title      TEXT NOT NULL,
  subtitle   TEXT,
  image_url  TEXT NOT NULL,         -- ImageKit CDN url (optionally ?tr= transform suffix)
  file_id    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_factory_sections_title_kind ON factory_sections (lower(title), kind);
CREATE INDEX IF NOT EXISTS idx_factory_sections_active_sort ON factory_sections (is_active, sort_order);
DROP TRIGGER IF EXISTS trg_factory_sections_updated_at ON factory_sections;
CREATE TRIGGER trg_factory_sections_updated_at BEFORE UPDATE ON factory_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE factory_sections ENABLE ROW LEVEL SECURITY;

-- TABLE 11: CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  subtitle   TEXT,
  image_url  TEXT NOT NULL,         -- ImageKit CDN url (optionally ?tr= transform suffix)
  file_id    TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_title_lower ON certificates (lower(title));
CREATE INDEX IF NOT EXISTS idx_certificates_active_sort ON certificates (is_active, sort_order);
DROP TRIGGER IF EXISTS trg_certificates_updated_at ON certificates;
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- AUDIT HOOKS for factory_sections + certificates (best-effort, never block writes)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.log_factory_edit()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('factory_section', NEW.id, 'created',
            jsonb_build_object('title', NEW.title, 'kind', NEW.kind, 'image_url', NEW.image_url),
            'admin_dashboard', 'Factory section added from the admin dashboard');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('factory_section', NEW.id, 'updated',
            jsonb_build_object('title', NEW.title, 'is_active', NEW.is_active),
            'admin_dashboard', 'Factory section edited from the admin dashboard');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, old_state, changed_by, change_reason)
    VALUES ('factory_section', OLD.id, 'deleted',
            jsonb_build_object('title', OLD.title, 'is_active', OLD.is_active),
            'admin_dashboard', 'Factory section removed from the admin dashboard');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_certificate_edit()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('certificate', NEW.id, 'created',
            jsonb_build_object('title', NEW.title, 'image_url', NEW.image_url),
            'admin_dashboard', 'Certificate added from the admin dashboard');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, new_state, changed_by, change_reason)
    VALUES ('certificate', NEW.id, 'updated',
            jsonb_build_object('title', NEW.title, 'is_active', NEW.is_active),
            'admin_dashboard', 'Certificate edited from the admin dashboard');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (entity_type, entity_id, action, old_state, changed_by, change_reason)
    VALUES ('certificate', OLD.id, 'deleted',
            jsonb_build_object('title', OLD.title, 'is_active', OLD.is_active),
            'admin_dashboard', 'Certificate removed from the admin dashboard');
  END IF;
  RETURN NEW;
END;
$$;

-- Audit triggers are created HERE, after both hook functions exist — a trigger
-- cannot reference a function that has not been defined yet.
DROP TRIGGER IF EXISTS trg_factory_audit ON factory_sections;
CREATE TRIGGER trg_factory_audit AFTER INSERT OR UPDATE OR DELETE ON factory_sections
  FOR EACH ROW EXECUTE FUNCTION public.log_factory_edit();
DROP TRIGGER IF EXISTS trg_certificate_audit ON certificates;
CREATE TRIGGER trg_certificate_audit AFTER INSERT OR UPDATE OR DELETE ON certificates
  FOR EACH ROW EXECUTE FUNCTION public.log_certificate_edit();
