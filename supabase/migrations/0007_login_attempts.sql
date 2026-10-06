-- ==============================================================================
-- 0007 — LOGIN ATTEMPTS: brute-force protection for POST /api/admin/login
-- ------------------------------------------------------------------------------
-- Tracks failed admin login attempts per IP so the login route can return 429
-- after 5 failures per 15-minute window (see app/api/admin/login/route.ts).
--
-- RLS: enabled with ZERO policies (project-wide deny-all stance) — only the
-- service-role key (lib/supabase-admin.server.ts) can read or write rows.
-- Cleanup: the login endpoint purges rows older than 24 hours on each attempt,
-- so no scheduled job is required.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip         TEXT NOT NULL,
  failed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_failed_at
  ON login_attempts (ip, failed_at);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Deliberately NO CREATE POLICY statements: deny-all for anon/authenticated.
