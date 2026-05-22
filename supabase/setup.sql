-- ════════════════════════════════════════════════════════════════════════════
-- PHYLA — DATABASE SETUP
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this ENTIRE file into the SQL editor
--   3. Click "Run"
--   4. Verify by going to "Table Editor" — you should see 3 new tables.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Quiz submissions ──────────────────────────────────────────────────────
-- One row per completed quiz. Linked to a user if signed in, otherwise anonymous.
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email               TEXT,
  age                 TEXT,
  gender              TEXT,
  goals               TEXT[],
  diet                TEXT,
  budget              TEXT,
  data                JSONB NOT NULL,
  recommendation      JSONB,
  supplement_count    INT,
  total_monthly_cost  INT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_submissions_created_at_idx ON public.quiz_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_submissions_user_id_idx    ON public.quiz_submissions (user_id);

-- ─── iHerb link clicks ─────────────────────────────────────────────────────
-- One row per "Shop on iHerb" / "Buy on iHerb" click.
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT,
  supplement_id   TEXT,
  supplement_name TEXT,
  product_brand   TEXT,
  product_name    TEXT,
  iherb_url       TEXT,
  source_page     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS link_clicks_created_at_idx ON public.link_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS link_clicks_supplement_idx ON public.link_clicks (supplement_id);

-- ─── Email signups (newsletter / quiz email capture) ───────────────────────
CREATE TABLE IF NOT EXISTS public.email_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  source      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running this script
DROP POLICY IF EXISTS "Anyone can insert quiz submissions" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "Anyone can insert email signups" ON public.email_signups;
DROP POLICY IF EXISTS "Users can read own submissions" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Users can read own clicks" ON public.link_clicks;

-- Anyone (anonymous or signed-in) can write — that's how we track everyone.
CREATE POLICY "Anyone can insert quiz submissions" ON public.quiz_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can insert clicks" ON public.link_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can insert email signups" ON public.email_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Signed-in users can read their own quiz / click history
CREATE POLICY "Users can read own submissions" ON public.quiz_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read own clicks" ON public.link_clicks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- NOTE: the admin dashboard reads ALL rows using the SERVICE_ROLE key,
-- which bypasses RLS. The service role key never leaves the server.

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Three tables created with proper indexes and policies.
-- ════════════════════════════════════════════════════════════════════════════
