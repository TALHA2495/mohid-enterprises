-- ============================================================================
-- SEED CERTIFICATES — 3 compliance images from the ImageKit CDN (a2q8u8qtw)
-- ------------------------------------------------------------------------------
-- Source of truth: the /certificates folder on the a2q8u8qtw ImageKit account.
-- All 3 files were verified reachable (HTTP 200) before this seed was written:
--   certificates/company profile 20 year.jpeg
--   certificates/wso certificate of compliance.jpeg
--   certificates/wso letter of authorization.jpeg
--
-- File names on the CDN contain literal spaces, so the URLs encode them as %20.
-- (The '&' in factory/Logistics%20&%20Export.png must stay RAW — %26 returns 404.)
--
-- Run in the Supabase SQL editor.
--
-- Idempotent: ON CONFLICT against the lower(title) expression index. Postgres
-- needs the expression parenthesized, hence the double parens.
-- ============================================================================

INSERT INTO certificates (title, subtitle, image_url, sort_order, is_active) VALUES
  ('Company Profile — 20 Years',
   'Two decades of trims manufacturing, capacity, and export experience.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/company%20profile%2020%20year.jpeg',          10, true),
  ('WSO Certificate of Compliance',
   'Bureau verified export compliance for the current production year.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20certificate%20of%20compliance.jpeg',   20, true),
  ('WSO Letter of Authorization',
   'Official authorization for worldwide certificate-backed trade.',
   'https://ik.imagekit.io/a2q8u8qtw/certificates/wso%20letter%20of%20authorization.jpeg',     30, true)
ON CONFLICT ((lower(title))) DO NOTHING;
