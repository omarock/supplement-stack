-- ════════════════════════════════════════════════════════════════════════════
-- EMAIL DRIP — DATABASE SETUP
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this file
--   3. Click "Run"
-- ════════════════════════════════════════════════════════════════════════════

-- One row per email sent. Used to deduplicate the drip so we never send the
-- same stage twice to the same recipient (even if the cron retries).
CREATE TABLE IF NOT EXISTS public.email_drip_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  stage        TEXT NOT NULL CHECK (stage IN ('welcome', 'day3', 'day7', 'day14')),
  quiz_id      UUID REFERENCES public.quiz_submissions(id) ON DELETE SET NULL,
  resend_id    TEXT,      -- the message ID returned by Resend
  status       TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'failed'
  error        TEXT,
  sent_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email, stage)   -- hard guard against duplicates
);

CREATE INDEX IF NOT EXISTS email_drip_log_sent_at_idx ON public.email_drip_log (sent_at DESC);

-- RLS + grants — only service_role reads/writes; no public access
ALTER TABLE public.email_drip_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON public.email_drip_log;
CREATE POLICY "service role full access"
  ON public.email_drip_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.email_drip_log TO service_role;

-- Optional: opt-out table (one row per unsubscribed email)
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  email       TEXT PRIMARY KEY,
  source      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can unsubscribe" ON public.email_unsubscribes;
CREATE POLICY "anyone can unsubscribe"
  ON public.email_unsubscribes
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);
DROP POLICY IF EXISTS "service role reads" ON public.email_unsubscribes;
CREATE POLICY "service role reads"
  ON public.email_unsubscribes
  FOR SELECT
  TO service_role
  USING (true);

GRANT INSERT ON public.email_unsubscribes TO anon, authenticated;
GRANT ALL ON public.email_unsubscribes TO service_role;
