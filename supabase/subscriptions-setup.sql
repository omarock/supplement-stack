-- ════════════════════════════════════════════════════════════════════════════
-- suppdoc.io — SUBSCRIPTIONS SETUP (premium / Stripe)
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this ENTIRE file into the SQL editor
--   3. Click "Run"
-- ════════════════════════════════════════════════════════════════════════════

-- One row per user. The Stripe webhook is the source of truth; the app only reads.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_email             TEXT PRIMARY KEY,
  user_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  paddle_customer_id     TEXT,
  paddle_subscription_id TEXT,
  status                 TEXT,            -- active | trialing | past_due | canceled | incomplete
  plan                   TEXT,            -- monthly | annual
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT false,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent, in case the table already exists from an earlier setup.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id     TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS subscriptions_customer_idx ON public.subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx  ON public.subscriptions (user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own subscription" ON public.subscriptions;
CREATE POLICY "Users read own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Service role (webhook + server reads) bypasses RLS, but grant explicitly:
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscriptions TO authenticated;

-- updated_at trigger (reuses public.touch_updated_at from stack-tracker-setup.sql;
-- recreate here so this file is runnable standalone).
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_touch ON public.subscriptions;
CREATE TRIGGER subscriptions_touch
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

SELECT 'Subscriptions table created.' AS status;
