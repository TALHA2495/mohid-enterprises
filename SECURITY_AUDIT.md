# SECURITY AUDIT — backend hardening checklist
> Date: 2026-05-10 · Branch: `feature/backend-security-hardening` · Scope: additive backend security only.

## 1. Protected endpoints

| Endpoint / surface | Session validation | Rate limited | Status |
|---|---|---|---|
| `POST /api/admin/login` | n/a (is the login) | ✅ 5 fails / 15 min / IP → 429 + 100 ms delay on failure | ✅ PASS |
| `POST /api/admin/logout` (NEW) | ✅ `isValidSession()` → 401 if invalid | n/a (session-gated) | ✅ PASS |
| `POST /api/admin/imagekit-auth` | ✅ `isValidSession()` → 401 | ⚠️ not limited (session-gated; acceptable) | ✅ PASS |
| `app/admin/(dashboard)/layout.tsx` | ✅ `isValidSession()` → redirect | — | ✅ PASS |
| `proxy.ts` (Next.js 16 middleware) | ✅ guards `/admin/*`, redirects authed users off `/admin/login` → `/admin` | — | ✅ PASS |
| Server actions `app/admin/actions.ts` | ✅ all 10 exported actions guarded (`updateQuoteStatus` calls `isValidSession()` directly; the other 9 call `sessionError()`) | — | ✅ PASS |
| Public quote intake | `create_quote()` SECURITY DEFINER RPC (server-validated, no session) | — | ✅ PASS |

## 2. Session & cookie audit

- ✅ Cookie `mohid_admin` is `httpOnly`, `sameSite: 'lax'`, `secure` in production, `maxAge: 12h` — unchanged by this work.
- ✅ Token = HMAC-SHA256 stateless value; generation logic untouched.
- ✅ Logout clears the cookie with identical attributes + `maxAge: 0`.
- ⚠️ Known limitation (accepted): token is deterministic — revocation requires rotating `ADMIN_PASSWORD`. Idle-timeout would require a token redesign (explicitly deferred).

## 3. Secret exposure audit

- ✅ `SUPABASE_SERVICE_ROLE_KEY` — NOT `NEXT_PUBLIC_`-prefixed; only imported via `lib/supabase-admin.server.ts` (server-only).
- ✅ `IMAGEKIT_PRIVATE_KEY` — NOT public; used only in `lib/imagekit.server.ts`.
- ✅ `ADMIN_PASSWORD` — server runtime only; login 500 message names the variable but never prints its value.
- ✅ Client bundle carries only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ImageKit public key/URL endpoint — all public by design.
- ✅ No secrets logged to console/error messages in admin routes or actions.

## 4. RLS audit (see `supabase/migrations/0008_rls_audit.sql`)

- ✅ RLS enabled on all 13 tables (incl. new `login_attempts`).
- ✅ Zero policies → deny-all for `anon`/`authenticated`.
- ✅ Only public grant: `create_quote` RPC to `anon`, `authenticated`.
- ✅ Public reads: service-role in server components (`lib/public-data.server.ts`) — no `SELECT` policies needed.
- ✅ Admin writes: service-role in server actions — no user write policies needed.
- ✅ Standing rule: do NOT add `SELECT` policies without a PII review (customers/quotes/invoices hold PII).

## 5. Environment variables (`.env.example` reviewed)

| Variable | Visibility | Verified |
|---|---|---|
| `ADMIN_PASSWORD` | server-only | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | ✅ |
| `IMAGEKIT_PRIVATE_KEY` | server-only | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | public | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | ✅ |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | public | ✅ |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | public | ✅ |

No new env vars introduced by this hardening pass — `.env.example` unchanged.

## 6. Rate limiting — design notes

- Storage: Supabase table `login_attempts` (persistent across Vercel serverless instances; in-memory caches are per-lambda and bypassable).
- Cleanup: endpoint deletes rows older than 24 h on each login attempt (no pg_cron dependency).
- Failure mode: if Supabase is unreachable, rate limiting degrades open (login still works, 100 ms delay still applies) so a DB outage can never lock the operator out.
- Lockout UX: generic 429 message "Too many attempts. Try again later." — auto-unlocks after the 15-minute window; no CAPTCHA, no manual unlock.

## 7. Verification checklist

- [ ] 5 failed logins in 15 min → 429 "Too many attempts. Try again later."
- [ ] Successful login deletes `login_attempts` rows for that IP
- [ ] Logout button visible in admin sidebar, no style regression
- [ ] `POST /api/admin/logout` clears cookie; unauthenticated call → 401
- [ ] Logged-in user visiting `/admin/login` → redirected to `/admin`
- [ ] DevTools: no `ADMIN_PASSWORD` / `SUPABASE_SERVICE_ROLE_KEY` in client bundles
- [ ] `npx tsc --noEmit` + `npm run build` pass

## 8. Pending manual steps

1. Apply migration: `supabase db push` (runs `0007_login_attempts.sql`; `0008` is comments-only).
2. Run the verification checklist above against staging.
3. Optional follow-ups (out of scope, deferred): rate-limit `imagekit-auth`, timestamp+nonce token redesign for true revocation/idle timeout.
