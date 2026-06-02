-- ════════════════════════════════════════════════════════════════════════════
-- suppdoc.io — CONTENT AGENTS SETUP (the autopilot)
-- ════════════════════════════════════════════════════════════════════════════
-- HOW TO RUN THIS:
--   1. Open https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/sql/new
--   2. Paste this ENTIRE file into the SQL editor
--   3. Click "Run"
--   4. Verify in "Table Editor": you should see agent_runs + agent_items.
--
-- Two tables power the whole six-agent content engine:
--   agent_runs   one row per agent execution (cost / tokens / status log)
--   agent_items  the unified approval queue: every draft, post, page idea,
--                newsletter, and PR pitch any agent produces lands here as a
--                row, awaiting a human Approve / Edit / Reject in /admin/agents.
-- Keeping ONE queue table (with a jsonb payload per agent) instead of eight
-- typed tables is deliberate: one query feeds the admin queue, one endpoint
-- approves anything, and the status machine is identical for every agent.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── agent_runs: observability ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent         TEXT NOT NULL,              -- trend | seo | social | visual | newsletter | pr
  model         TEXT,                       -- the Claude model actually used
  status        TEXT NOT NULL DEFAULT 'ok', -- ok | error | empty
  items_created INT DEFAULT 0,              -- how many agent_items this run produced
  input_tokens  INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cost_usd      NUMERIC(10,4) DEFAULT 0,    -- best-effort estimated cost
  latency_ms    INT DEFAULT 0,
  trigger       TEXT DEFAULT 'cron',        -- cron | manual
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_runs_created_at_idx ON public.agent_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS agent_runs_agent_idx      ON public.agent_runs (agent);

-- ─── agent_items: the approval queue ────────────────────────────────────────
-- kind tells the UI how to render the payload; status drives the pipeline.
--   kind:   opportunity | seo_draft | social_post | visual | newsletter | pr_target
--   status: pending | approved | rejected | published | sent | parked
CREATE TABLE IF NOT EXISTS public.agent_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent         TEXT NOT NULL,              -- which agent produced it
  kind          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  title         TEXT,                       -- short human-readable label for the queue
  slug          TEXT,                       -- for seo_draft: the published URL slug
  priority      INT DEFAULT 0,              -- agent's own ranking (0-100), queue sorts by this
  payload       JSONB NOT NULL,             -- the agent's full structured output
  edited        JSONB,                      -- admin edits (overrides payload on publish)
  run_id        UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  parent_id     UUID REFERENCES public.agent_items(id) ON DELETE SET NULL, -- draft -> its opportunity
  needs_review  BOOLEAN DEFAULT false,      -- agent flagged it for clinical/extra review
  note          TEXT,                       -- admin note on approve/reject
  approved_by   TEXT,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_items_status_idx  ON public.agent_items (status);
CREATE INDEX IF NOT EXISTS agent_items_kind_idx    ON public.agent_items (kind);
CREATE INDEX IF NOT EXISTS agent_items_created_idx ON public.agent_items (created_at DESC);
-- a published SEO page is looked up by slug, must be unique among published rows
CREATE UNIQUE INDEX IF NOT EXISTS agent_items_published_slug_idx
  ON public.agent_items (slug) WHERE kind = 'seo_draft' AND status = 'published';

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────────────────
-- Everything is written and read by the SERVICE_ROLE key (server-side only):
-- the cron agents write, the admin queue reads/updates. No anon/authenticated
-- access at all, except published SEO drafts, which the public /journal/[slug]
-- page reads via the service role on the server (never the browser).
ALTER TABLE public.agent_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_items ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: RLS on with zero policies = deny all to
-- them, which is exactly what we want. Service role bypasses RLS but we grant
-- explicitly (fresh Supabase projects 42501 without this, see fix-permissions).
GRANT ALL ON public.agent_runs  TO service_role;
GRANT ALL ON public.agent_items TO service_role;

-- updated_at trigger (reuses public.touch_updated_at; recreate so standalone).
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agent_items_touch ON public.agent_items;
CREATE TRIGGER agent_items_touch
  BEFORE UPDATE ON public.agent_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

SELECT 'Content agents tables created: agent_runs + agent_items.' AS status;
