-- ════════════════════════════════════════════════════════════════════════════
-- PHYLA — PERMISSIONS FIX
-- ════════════════════════════════════════════════════════════════════════════
-- Supabase requires explicit GRANTs in some configurations.
-- Run this once to grant service_role full access and anon/authenticated INSERT.
-- ════════════════════════════════════════════════════════════════════════════

-- Service role: full read/write on all tracking tables (admin dashboard needs this)
GRANT ALL ON public.quiz_submissions TO service_role;
GRANT ALL ON public.link_clicks TO service_role;
GRANT ALL ON public.email_signups TO service_role;

-- Anon + authenticated: INSERT only (so browsers can track without auth)
GRANT INSERT ON public.quiz_submissions TO anon, authenticated;
GRANT INSERT ON public.link_clicks TO anon, authenticated;
GRANT INSERT ON public.email_signups TO anon, authenticated;

-- Authenticated: SELECT own rows
GRANT SELECT ON public.quiz_submissions TO authenticated;
GRANT SELECT ON public.link_clicks TO authenticated;

-- Future-proof: anything added later inherits the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO anon, authenticated;

-- Confirm
SELECT 'Permissions fixed. service_role + anon + authenticated can now access tracking tables.' as status;
