-- ════════════════════════════════════════════════════════════════════════════
-- suppdoc.io — BLOODWORK REPORTS SETUP (optional, signed-in users only)
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this ENTIRE file into the SQL editor
--   3. Click "Run"
--
-- PRIVACY NOTE: we NEVER store the uploaded PDF/image. Only the structured,
-- de-identified biomarker results + analysis JSON are saved, and only when a
-- signed-in user explicitly chooses to save the report.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bloodwork_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email   TEXT NOT NULL,
  biomarkers   JSONB NOT NULL,     -- ExtractedBiomarker[]
  analysis     JSONB NOT NULL,     -- summary, findings, recommendations, lifestyle...
  confidence   TEXT,
  source_kind  TEXT,               -- 'pdf' | 'image'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bloodwork_reports_email_idx ON public.bloodwork_reports (user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS bloodwork_reports_user_id_idx ON public.bloodwork_reports (user_id);

ALTER TABLE public.bloodwork_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bloodwork" ON public.bloodwork_reports;
CREATE POLICY "Users manage own bloodwork" ON public.bloodwork_reports
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.bloodwork_reports TO service_role;
GRANT SELECT, INSERT, DELETE ON public.bloodwork_reports TO authenticated;

SELECT 'Bloodwork reports table created.' AS status;
