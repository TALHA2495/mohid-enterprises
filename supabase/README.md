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

Copy the values from Supabase → **Settings → API keys** into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # public, client-safe (RLS-locked)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...            # SECRET — server-side only
```

Both key styles work: new projects issue **publishable / secret** keys, older
ones issue **anon / service_role** JWTs. The server key is the one that can
bypass RLS — treat it like a password. Leave a value empty until you have the
real one; a leftover placeholder counts as "configured" and fails with a 401.

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

## 4b. Verify the ledger + triggers (nothing is committed)

`orders`, `invoices` and `payments` must be exercised inside a transaction that
ends in `rollback;`: `payments` is a write-once ledger and its `DELETE` is blocked
by `trg_payments_immutable`, so a test row could otherwise never be removed.

Paste the block below into the SQL Editor and read the **Messages** tab — expect
three `NOTICE` lines, two `OK:` lines, no `FAIL`, then `ROLLBACK`:

```sql
begin;
do $$
declare
  v_cust uuid; v_quote text; v_order uuid; v_inv uuid;
  v_status text; v_paid numeric; v_bal numeric;
  v_o_status text; v_o_paid numeric; v_o_due numeric;
begin
  select customer_id into v_cust from create_quote(
    'Ledger Test','Test Co','ledger-test@example.com','+923001234567',
    'Elastic Trim','Polyester',20,100,'{}'::jsonb,7);
  select id into v_quote from quotes where customer_id = v_cust order by created_at desc limit 1;

  insert into orders (order_number, customer_id, quote_id, order_status, total_amount,
                      currency, payment_status, amount_due, amount_paid)
  values ('ORD-TEST-0001', v_cust, v_quote, 'confirmed', 100000, 'PKR', 'unpaid', 100000, 0)
  returning id into v_order;

  insert into invoices (invoice_number, order_id, customer_id, invoice_status, subtotal,
                        total_amount, amount_due, balance_remaining)
  values ('INV-TEST-0001', v_order, v_cust, 'issued', 100000, 100000, 100000, 100000)
  returning id into v_inv;

  -- 40% payment -> partially_paid on the invoice AND the order
  insert into payments (payment_number, invoice_id, customer_id, payment_amount, payment_method)
  values ('PAY-TEST-0001', v_inv, v_cust, 40000, 'bank_transfer');

  select invoice_status, amount_paid, balance_remaining into v_status, v_paid, v_bal from invoices where id = v_inv;
  select payment_status, amount_paid, amount_due into v_o_status, v_o_paid, v_o_due from orders where id = v_order;
  raise notice 'partial: invoice=% paid=% balance=% | order=% paid=% due=%', v_status, v_paid, v_bal, v_o_status, v_o_paid, v_o_due;
  if v_status <> 'partially_paid' or v_paid <> 40000 or v_bal <> 60000 then
    raise exception 'FAIL invoice partial sync'; end if;
  if v_o_status <> 'partially_paid' or v_o_paid <> 40000 or v_o_due <> 60000 then
    raise exception 'FAIL order partial cascade'; end if;

  -- remaining 60% -> fully_paid, zero balance
  insert into payments (payment_number, invoice_id, customer_id, payment_amount, payment_method)
  values ('PAY-TEST-0002', v_inv, v_cust, 60000, 'bank_transfer');

  select invoice_status, amount_paid, balance_remaining into v_status, v_paid, v_bal from invoices where id = v_inv;
  select payment_status, amount_paid, amount_due into v_o_status, v_o_paid, v_o_due from orders where id = v_order;
  raise notice 'full: invoice=% paid=% balance=% | order=% paid=% due=%', v_status, v_paid, v_bal, v_o_status, v_o_paid, v_o_due;
  if v_status <> 'fully_paid' or v_bal <> 0 then raise exception 'FAIL invoice full sync'; end if;
  if v_o_status <> 'fully_paid' or v_o_due <> 0 then raise exception 'FAIL order full cascade'; end if;

  -- reversal (bounced cheque) must re-open the balance
  update payments set payment_status = 'reversed' where payment_number = 'PAY-TEST-0002';
  select invoice_status, amount_paid into v_status, v_paid from invoices where id = v_inv;
  raise notice 'after reversal: invoice=% paid=%', v_status, v_paid;
  if v_status <> 'partially_paid' or v_paid <> 40000 then raise exception 'FAIL reversal did not re-open balance'; end if;

  -- immutability: both statements MUST raise
  begin
    update payments set payment_amount = 1 where payment_number = 'PAY-TEST-0001';
    raise exception 'FAIL payment_amount was mutable';
  exception when check_violation then raise notice 'OK: payment_amount update blocked';
  end;
  begin
    delete from payments where payment_number = 'PAY-TEST-0001';
    raise exception 'FAIL payment row was deletable';
  exception when check_violation then raise notice 'OK: payment delete blocked';
  end;
end $$;
rollback;
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

## 6. Troubleshooting (errors already hit once)

| Symptom | Cause | Fix |
|---|---|---|
| `ERROR: 42883: function public.create_quote(text, …) does not exist` while running `schema.sql` | a `GRANT`/`REVOKE` line listed a function signature that didn't match the definition | fixed in the committed `schema.sql` — always paste the **whole** file from the repo, not a saved copy |
| After that error, **no tables exist** | the SQL Editor runs the script in a single transaction, so the failure rolled everything back | re-run the full fixed `schema.sql`; expect `Success. No rows returned.` |
| `404 PGRST205 Could not find the table 'public.customers'` (from the app or a REST probe) | the schema was never applied | run `supabase/schema.sql` (see step 2) |
| `404 PGRST202 … create_quote … no matches were found` | the RPC doesn't exist yet | same as above — the RPC is created by the schema file |
| `401 Invalid API key` | a placeholder (`eyJhbGc...`) is still in `.env.local`, or the URL/key are from different projects | paste the real values, then restart `pnpm dev` |
| `401 Secret API key required` when calling `/rest/v1/` with the publishable/anon key | that root endpoint only accepts a secret key; it is **not** a sign of misconfiguration | probe a table (`/rest/v1/customers?select=*&limit=1`) or just use the app |
| `/admin` shows "not configured" | `SUPABASE_SERVICE_ROLE_KEY` is empty or commented out | paste the secret key; the public form is unaffected |

A quick health check without any tooling — with the app running, submit the
quote form once: `[Supabase]` errors appear in the browser console and the row
lands in Table Editor → `quotes` (plus `customers`, `quote_line_items`, `audit_log`).

## 7. Repeatable checks

**Schema, intake RPC, RLS, persistence and cleanup** — writes four test rows,
asserts them, then deletes them (safe to run against production; prints no keys):

```bash
node --env-file=.env.local scripts/verify-supabase.mjs
# expect: RESULT: 52 passed, 0 failed   (every table reported "back to baseline")
```

**HTTP smoke test** — admin guard, login, cookie flags, dashboard render and
cookie tampering, against a running dev server. The password comes from the
environment and is never printed:

```bash
pnpm dev --port 3100                              # terminal 1
node --env-file=.env.local scripts/smoke-admin.mjs   # terminal 2
# expect: SMOKE RESULT: 18 passed, 0 failed
```

Quick manual equivalent with `curl` (no password needed):

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/quote        # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin        # 307 -> /admin/login
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"password":"wrong"}' http://localhost:3000/api/admin/login           # 401
```

> Never hardcode the admin password in a script, test or commit. Read it from
> `ADMIN_PASSWORD` — an earlier `scripts/smoke-admin.ps1` did hardcode it and had
> to be purged from history.

### Session token semantics (know before you scale)

The session cookie is `HMAC-SHA256(password, 'mohid-admin-session-v1')`: a
deterministic value derived only from the password, verified statelessly by
`proxy.ts`. Consequences:

- **Rotating `ADMIN_PASSWORD` revokes every outstanding session** — that is the
  only revocation mechanism. Treat the password as the session's root of trust.
- The cookie carries a 12-hour browser `maxAge`, but an attacker who copies the
  token value can replay it indefinitely, so never log it (the smoke test
  deliberately prints only the cookie flags, not the value).
- If you later need per-session expiry or multi-user access, replace this with
  Supabase Auth or a signed token that embeds `issued_at` + a server-checked
  revocation list.

Behavioral invariants covered by the two checks above: anon can read nothing and
write nothing; `create_quote` dedups by email, rejects invalid emails server-side
and returns `Q-YYYYMMDD-XXXXXX`; the admin session cookie is httpOnly and a forged
cookie is rejected.

## 8. Vercel environment variables (Production and Preview)

Five variables are required in the host environment, and they do not all behave
the same way:

| Variable | Save as | Resolved | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Config | **build time** (inlined into the bundle) | must exist when the build runs; a rebuild is needed after any change |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config | **build time** (inlined) | public by design - it ships in the browser JavaScript |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Config | **build time** (inlined) | the lead handoff breaks without it |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | runtime | bypasses RLS; server-only, never in a client bundle |
| `ADMIN_PASSWORD` | **Secret** | runtime | rotating it revokes every admin session |

Rules that have already caused a real outage here:

1. **Scope.** A Preview deployment only sees variables ticked for **Preview**;
   Production only sees **Production**. Tick both (plus Development if you use
   `vercel dev`), then redeploy.
2. **Changing a variable never affects an existing deployment.** Vercel snapshots
   the environment when the deployment is created, and `NEXT_PUBLIC_*` is inlined
   into the build output. Use **Redeploy** or push a commit.
   **Instant Rollback and Promote reuse the old build artifacts**, so they
   silently keep the old value.
3. **Secret variables are write-only.** Pick Config or Secret when you save a
   variable; a Secret can never be read or edited afterwards (not even by
   `vercel env pull`), so changing its value or scope means deleting and
   recreating it. Keep the real values in `.env.local` (gitignored) or a
   password manager.
4. **Add the `NEXT_PUBLIC_*` values first.** They are the ones that need a
   rebuild; the two Secrets only need a new deployment.
5. **Rotate the service-role key without downtime:** create a new secret key in
   Supabase, set it in `.env.local` and in Vercel (Secret, Production + Preview),
   redeploy, confirm `/admin` renders counters, then revoke the old key.
6. **Never commit a secret.** `.env*.local` is gitignored; an earlier
   `scripts/smoke-admin.ps1` hardcoded the admin password and had to be purged
   from git history.

Symptom to cause:

| Symptom | Cause |
|---|---|
| `/admin` lists variable names under "Supabase is not configured" | those names are absent from the environment that deployment was built and deployed with (missing, wrong scope, or a name typo) |
| `/admin` says "Supabase answered, but the query failed" | keys are fine but the tables are missing - run `supabase/schema.sql` |
| `POST /api/admin/login` returns 500 "ADMIN_PASSWORD is not set" | `ADMIN_PASSWORD` is missing from that deployment's scope |
| `POST /api/admin/login` returns 401 | the variable is fine; the typed password is wrong |
| the quote form never writes to `quotes` | `NEXT_PUBLIC_SUPABASE_*` was not present when the build ran |

The admin pages print variable **names only**, never values.

## Design deviations from the original draft (and why)

| Original draft | This schema | Why |
|---|---|---|
| `quote_line_items.product_id NOT NULL` | nullable | web RFQs don't always match a catalog product; form has no product picker yet |
| `unit_price`/`line_total`/`total_amount NOT NULL` | nullable | pricing is negotiated by admin after intake, not catalog-priced |
| quotes had no RFQ payload column | `quotes.rfq_details` JSONB | preserves inquiry, destination port, and deep-link context verbatim |
| payment trigger updated `orders` but never incremented `amount_paid`, never touched invoices | `sync_invoice_and_order_payments` recomputes invoice balances from the ledger, then cascades to the order | the draft trigger silently produced wrong balances |
| payments updatable/deletable | write-once trigger (`prevent_payment_mutation`) | immutable ledger; corrections via `payment_status = 'reversed'` |
| RLS `FOR SELECT USING (true)` on quotes | RLS on, zero policies, public intake via SECURITY DEFINER RPC | the draft exposed every customer's PII to the anon key |
