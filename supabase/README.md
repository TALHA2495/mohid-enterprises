# Supabase Setup — Mohid Enterprises

Order-lifecycle database for the quote → order → invoice → payment pipeline.
Schema: `supabase/schema.sql` (8 tables + triggers + the public `create_quote` RPC + locked-down RLS).

## 1. Create the project (one-time, manual)

1. Sign up at https://supabase.com (free tier is fine).
2. Create a new project — name: `mohid-enterprises`, region: `ap-southeast-1` (closest to Pakistan).
3. Wait for the database to initialize (~2 minutes).

## 2. Run the schema

In the Supabase dashboard → **SQL Editor** → paste the full contents of
`supabase/schema.sql` → **Run**. It creates, in order:

| # | Object | Notes |
|---|--------|-------|
| 1 | `customers` | deduped by case-insensitive email (`uq_customers_email_lower`) |
| 2 | `products` | master catalog; nullable pricing until catalog prices exist |
| 3 | `quotes` | `Q-YYYYMMDD-XXXXXX` ids, sequential `QT-####` numbers, `rfq_details` JSONB payload |
| 4 | `quote_line_items` | specs snapshot; `product_id` nullable (web RFQs may not match the catalog) |
| 5 | `orders` | status state machine, denormalized payment status (kept in sync by trigger) |
| 6 | `invoices` | balances kept in sync by the payments trigger |
| 7 | `payments` | **immutable ledger** — money columns locked, deletes blocked; reversals via `payment_status = 'reversed'` |
| 8 | `audit_log` | append-only mutation history |

Plus: `create_quote(text…)` SECURITY DEFINER RPC (the only public write path),
the `sync_invoice_and_order_payments` trigger, and RLS enabled with **zero
policies** (anon + authenticated keys can read/write nothing directly).

## 3. Configure the app

Copy the values from Supabase → **Settings → API** into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...      # client-safe (RLS-locked)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...          # SECRET — server-side only
```

Until these are set the app degrades gracefully: the quote form still hands
off to WhatsApp (no persistence) and `/admin` shows a "not configured" panel.
For Vercel, set the same three variables plus `ADMIN_PASSWORD` in
Project → Settings → Environment Variables.

## 4. Verify the intake RPC

In the SQL Editor:

```sql
select * from create_quote(
  'Test Buyer', 'Test Textiles', 'buyer@test.com', '+923001234567',
  'Elastic Trim', 'Polyester', 20, 500, '{}', 7
);
-- expect: quote_id like Q-20260916-XXXXXX | customer_id | duplicate = false
select * from create_quote(
  'Test Buyer', 'Test Textiles', 'buyer@test.com', '+923001234567',
  'Elastic Trim', 'Polyester', 20, 500, '{}', 7
);
-- expect: duplicate = true (same email inside the 1-hour window)

select * from audit_log order by timestamp desc limit 5;
select quote_number, quote_status, customer_notes, rfq_details from quotes order by created_at desc limit 3;
```

## 5. Admin reference queries

Revenue by month:

```sql
SELECT date_trunc('month', o.created_at) AS month,
       count(*) AS order_count,
       sum(o.total_amount) AS revenue,
       avg(o.total_amount) AS avg_order
FROM orders o
WHERE o.order_status IN ('confirmed','in_production','shipped','delivered')
GROUP BY 1 ORDER BY 1 DESC;
```

Top customers:

```sql
SELECT c.name, c.email, count(o.id) AS orders, sum(o.total_amount) AS spent
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.email
ORDER BY spent DESC NULLS LAST LIMIT 10;
```

Overdue invoices:

```sql
SELECT i.invoice_number, i.due_date, i.balance_remaining, c.name, c.phone
FROM invoices i JOIN customers c ON c.id = i.customer_id
WHERE i.invoice_status IN ('issued','sent','partially_paid')
  AND i.balance_remaining > 0 AND i.due_date < now()
ORDER BY i.due_date;
```

Quote → order conversion:

```sql
SELECT count(DISTINCT q.id) AS quotes,
       count(DISTINCT o.id) AS orders,
       round(100.0 * count(DISTINCT o.id) / nullif(count(DISTINCT q.id), 0), 1) AS conversion_pct
FROM quotes q LEFT JOIN orders o ON o.quote_id = q.id
WHERE q.quote_status <> 'expired';
```

Audit trail for one quote:

```sql
SELECT timestamp, action, old_state, new_state, changed_by, change_reason
FROM audit_log
WHERE entity_type = 'quote' AND entity_id = 'Q-20260916-XXXXXX'
ORDER BY timestamp DESC;
```

## Design deviations from the original draft (and why)

| Original draft | This schema | Why |
|---|---|---|
| `quote_line_items.product_id NOT NULL` | nullable | web RFQs don't always match a catalog product; form has no product picker yet |
| `unit_price`/`line_total`/`total_amount NOT NULL` | nullable | pricing is negotiated by admin after intake, not catalog-priced |
| quotes had no RFQ payload column | `quotes.rfq_details` JSONB | preserves inquiry, destination port, and deep-link context verbatim |
| payment trigger updated `orders` but never incremented `amount_paid`, never touched invoices | `sync_invoice_and_order_payments` recomputes invoice balances from the ledger, then cascades to the order | the draft trigger silently produced wrong balances |
| payments updatable/deletable | write-once trigger (`prevent_payment_mutation`) | immutable ledger; corrections via `payment_status = 'reversed'` |
| RLS `FOR SELECT USING (true)` on quotes | RLS on, zero policies, public intake via SECURITY DEFINER RPC | the draft exposed every customer's PII to the anon key |
