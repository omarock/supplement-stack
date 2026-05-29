-- ════════════════════════════════════════════════════════════════════════════
-- suppdoc.io — STACK TRACKER SETUP
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this ENTIRE file into the SQL editor
--   3. Click "Run"
--   4. Verify in "Table Editor" — you should see 2 new tables:
--        stack_checkins, tracker_enrollments
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Daily check-ins ────────────────────────────────────────────────────────
-- One row per user per day. UNIQUE(user_email, date) makes the daily check-in
-- an upsert — re-submitting the same day overwrites, never duplicates.
CREATE TABLE IF NOT EXISTS public.stack_checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email   TEXT NOT NULL,
  date         DATE NOT NULL,
  took_stack   BOOLEAN NOT NULL DEFAULT true,
  energy       INT CHECK (energy BETWEEN 0 AND 10),
  focus        INT CHECK (focus  BETWEEN 0 AND 10),
  sleep        INT CHECK (sleep  BETWEEN 0 AND 10),
  mood         INT CHECK (mood   BETWEEN 0 AND 10),
  stress       INT CHECK (stress BETWEEN 0 AND 10),
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_email, date)
);

CREATE INDEX IF NOT EXISTS stack_checkins_email_date_idx ON public.stack_checkins (user_email, date DESC);
CREATE INDEX IF NOT EXISTS stack_checkins_user_id_idx    ON public.stack_checkins (user_id);

-- ─── Tracker enrollments ──────────────────────────────────────────────────────
-- One row per user. Stores the stack they're tracking + reminder preference +
-- when we last sent them a weekly digest (so the cron doesn't double-send).
CREATE TABLE IF NOT EXISTS public.tracker_enrollments (
  user_email          TEXT PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_name          TEXT,
  stack_ids           TEXT[],            -- supplement ids the user is tracking
  reminder_opt_in     BOOLEAN DEFAULT true,
  weekly_digest_opt_in BOOLEAN DEFAULT true,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  last_digest_sent_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tracker_enrollments_user_id_idx ON public.tracker_enrollments (user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────
-- The tracker is personal data, so unlike the anonymous tracking tables, reads
-- and writes are scoped to the signed-in user. All app writes go through
-- server API routes that verify the session and use the service_role key, which
-- bypasses RLS — but we still enable RLS + scoped policies for defence in depth.

ALTER TABLE public.stack_checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own checkins"      ON public.stack_checkins;
DROP POLICY IF EXISTS "Users read own checkins"        ON public.stack_checkins;
DROP POLICY IF EXISTS "Users manage own enrollment"    ON public.tracker_enrollments;

-- Signed-in users can read/write only their own rows
CREATE POLICY "Users read own checkins" ON public.stack_checkins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users manage own checkins" ON public.stack_checkins
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own enrollment" ON public.tracker_enrollments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- GRANTS (Supabase needs these explicitly — see fix-permissions.sql)
-- ────────────────────────────────────────────────────────────────────────────

-- Service role: full access (server API routes + weekly digest cron use this)
GRANT ALL ON public.stack_checkins      TO service_role;
GRANT ALL ON public.tracker_enrollments TO service_role;

-- Authenticated: read/write own rows (RLS still scopes to auth.uid())
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stack_checkins      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracker_enrollments TO authenticated;

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stack_checkins_touch      ON public.stack_checkins;
DROP TRIGGER IF EXISTS tracker_enrollments_touch ON public.tracker_enrollments;

CREATE TRIGGER stack_checkins_touch
  BEFORE UPDATE ON public.stack_checkins
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER tracker_enrollments_touch
  BEFORE UPDATE ON public.tracker_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
SELECT 'Stack Tracker tables created: stack_checkins + tracker_enrollments.' AS status;
-- ════════════════════════════════════════════════════════════════════════════
