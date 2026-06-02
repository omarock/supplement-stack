/**
 * The six content agents, config-driven. Each agent owns: which Claude model it
 * uses, whether it gets web search, how it gathers its inputs from the pipeline,
 * and how it maps Claude's JSON output into queue items. runAgent() wraps any
 * agent with timing, token accounting, the run log, and the queue insert.
 *
 * Pipeline (human gate between every step, enforced in /admin/agents):
 *   trend   -> opportunities (pending)        [you approve the good ones]
 *   seo     -> drafts from approved opps      [you approve -> /library/{slug} goes live]
 *   social  -> posts from approved opps       [you approve -> copy/paste to post]
 *   visual  -> assets for published drafts     [you approve the on-brand ones]
 *   newsletter -> one weekly issue            [you pick subject -> send]
 *   pr      -> outreach pitches               [you approve -> you send]
 */
import { callClaude, safeParseJson, webSearchTool, type TokenUsage } from "@/lib/anthropic";
import {
  TREND_PROMPT, SEO_PROMPT, SOCIAL_PROMPT, VISUAL_PROMPT, NEWSLETTER_PROMPT, PR_PROMPT,
} from "@/lib/agents/prompts";
import { siteBrief, ingredientsWithoutInteraction, url } from "@/lib/agents/site-data";
import {
  logRun, insertItems, approvedOpportunitiesFor, recentPublishedDrafts,
  draftsNeedingVisual, existingPrOutlets, foundingStats,
  type AgentKey, type NewItem,
} from "@/lib/agents/store";

const OPUS = "claude-opus-4-8";
const SONNET = "claude-sonnet-4-6";
const HAIKU = "claude-haiku-4-5-20251001";

export function webSearchEnabled(): boolean {
  return process.env.AGENTS_WEB_SEARCH !== "off";
}

// Accumulates token usage across the (possibly several) Claude calls one agent
// makes in a single run.
class Usage {
  input = 0;
  output = 0;
  add(u?: TokenUsage) { if (u) { this.input += u.input_tokens; this.output += u.output_tokens; } }
  get total(): TokenUsage { return { input_tokens: this.input, output_tokens: this.output }; }
}

interface RunOutput {
  items: NewItem[];
  usage: TokenUsage;
  model: string;
  status: "ok" | "empty" | "error";
  error?: string;
}

/** One Claude call returning parsed JSON (array or object), or null. */
async function complete<T>(opts: {
  model: string; system: string; user: string; usage: Usage; maxTokens?: number; web?: boolean;
}): Promise<{ parsed: T | null; ok: boolean; error?: string }> {
  const res = await callClaude({
    model: opts.model,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    maxTokens: opts.maxTokens ?? 4000,
    expectJson: true,
    tools: opts.web && webSearchEnabled() ? [webSearchTool(5)] : undefined,
  });
  opts.usage.add(res.usage);
  if (!res.ok) return { parsed: null, ok: false, error: res.error };
  return { parsed: safeParseJson<T>(res.text), ok: true };
}

function slugify(s: string): string {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}

const today = () => new Date().toISOString().slice(0, 10);

// ─── Agent definitions ──────────────────────────────────────────────────────
export interface AgentDef {
  key: AgentKey;
  title: string;
  blurb: string;
  schedule: string;          // human-readable, mirrors vercel.json
  model: "Opus" | "Sonnet" | "Haiku";
  run: (trigger: "cron" | "manual") => Promise<RunOutput>;
}

// Agent 1: Trend Discovery
const trend: AgentDef = {
  key: "trend",
  title: "Trend Discovery",
  blurb: "Finds and ranks what US supplement users are searching this week, scored against your 885 pages.",
  schedule: "Mon + Thu, 06:00 ET",
  model: "Opus",
  async run() {
    const usage = new Usage();
    const gaps = ingredientsWithoutInteraction().slice(0, 40).join(", ");
    const user = [
      `Today is ${today()}.`,
      siteBrief(),
      ``,
      `Coverage hint: these ingredient ids have NO interaction page yet, so "X and Y" interaction topics around them are likely gaps: ${gaps}.`,
      ``,
      `Produce 15 to 25 ranked opportunities as a JSON array, per your instructions.`,
    ].join("\n");
    const { parsed, ok, error } = await complete<Record<string, unknown>[]>({
      model: OPUS, system: TREND_PROMPT, user, usage, web: true, maxTokens: 8000,
    });
    if (!ok) return { items: [], usage: usage.total, model: OPUS, status: "error", error };
    if (!Array.isArray(parsed)) return { items: [], usage: usage.total, model: OPUS, status: "empty" };
    const items: NewItem[] = parsed
      .filter(o => o && (o.coverage_gap === "new" || o.coverage_gap === "refresh"))
      .slice(0, 25)
      .map(o => ({
        agent: "trend" as const,
        kind: "opportunity" as const,
        title: String(o.title ?? o.query ?? "Untitled opportunity"),
        priority: Number(o.priority_score) || 0,
        payload: o,
        needs_review: Boolean(o.needs_clinical_review),
      }));
    return { items, usage: usage.total, model: OPUS, status: items.length ? "ok" : "empty" };
  },
};

// Agent 2: SEO Content
const seo: AgentDef = {
  key: "seo",
  title: "SEO Content",
  blurb: "Turns each approved opportunity into a publish-ready, evidence-backed page (goes live at /library).",
  schedule: "Daily, 07:00 ET (up to 5)",
  model: "Opus",
  async run() {
    const usage = new Usage();
    const opps = await approvedOpportunitiesFor("seo", 5);
    if (opps.length === 0) return { items: [], usage: usage.total, model: OPUS, status: "empty" };
    const items: NewItem[] = [];
    for (const opp of opps) {
      const user = [
        siteBrief(),
        ``,
        `OPPORTUNITY to turn into one publish-ready page (JSON object per your instructions):`,
        JSON.stringify(opp.payload),
      ].join("\n");
      const { parsed } = await complete<Record<string, unknown>>({
        model: OPUS, system: SEO_PROMPT, user, usage, maxTokens: 8000,
      });
      if (!parsed || Array.isArray(parsed)) continue;
      const slug = slugify(String(parsed.slug ?? parsed.title ?? opp.title ?? ""));
      items.push({
        agent: "seo", kind: "seo_draft",
        title: String(parsed.title ?? opp.title ?? "Untitled"),
        slug,
        payload: parsed,
        parent_id: opp.id,
        needs_review: Boolean(parsed.needs_clinical_review),
      });
    }
    return { items, usage: usage.total, model: OPUS, status: items.length ? "ok" : "empty" };
  },
};

// Agent 3: Social Content
const social: AgentDef = {
  key: "social",
  title: "Social Content",
  blurb: "Turns approved topics into platform-native posts for X, LinkedIn, Reddit, and Instagram.",
  schedule: "Daily, 09:00 ET",
  model: "Sonnet",
  async run() {
    const usage = new Usage();
    const opps = await approvedOpportunitiesFor("social", 8);
    if (opps.length === 0) return { items: [], usage: usage.total, model: SONNET, status: "empty" };
    const items: NewItem[] = [];
    for (const opp of opps) {
      const p = opp.payload as Record<string, unknown>;
      const user = [
        siteBrief(),
        ``,
        `TOPIC to turn into platform-native posts (JSON array of variants per your instructions):`,
        `angle: ${String(p.angle ?? opp.title)}`,
        `suggested internal link targets: ${JSON.stringify(p.internal_link_targets ?? [])}`,
        `full opportunity: ${JSON.stringify(p)}`,
      ].join("\n");
      const { parsed } = await complete<Record<string, unknown>[]>({
        model: SONNET, system: SOCIAL_PROMPT, user, usage, maxTokens: 4000,
      });
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      items.push({
        agent: "social", kind: "social_post",
        title: String(opp.title),
        payload: { variants: parsed },
        parent_id: opp.id,
      });
    }
    return { items, usage: usage.total, model: SONNET, status: items.length ? "ok" : "empty" };
  },
};

// Agent 4: Visual Content
const visual: AgentDef = {
  key: "visual",
  title: "Visual Content",
  blurb: "Generates on-brand OG and social card SVGs for newly published pages.",
  schedule: "Daily, 08:00 ET",
  model: "Sonnet",
  async run() {
    const usage = new Usage();
    const drafts = await draftsNeedingVisual(4);
    if (drafts.length === 0) return { items: [], usage: usage.total, model: SONNET, status: "empty" };
    const items: NewItem[] = [];
    for (const d of drafts) {
      const p = (d.edited ?? d.payload) as Record<string, unknown>;
      const user = [
        `Produce on-brand visual assets (JSON array per your instructions) for this published suppdoc page.`,
        `title: ${String(p.title ?? d.title)}`,
        `h1: ${String(p.h1 ?? "")}`,
        `url: ${url.library(String(d.slug ?? ""))}`,
        `Requested asset types: og (1200x630) and x_card (1600x900).`,
      ].join("\n");
      const { parsed } = await complete<Record<string, unknown>[]>({
        model: SONNET, system: VISUAL_PROMPT, user, usage, maxTokens: 6000,
      });
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      items.push({
        agent: "visual", kind: "visual",
        title: String(p.title ?? d.title),
        payload: { assets: parsed },
        parent_id: d.id,
      });
    }
    return { items, usage: usage.total, model: SONNET, status: items.length ? "ok" : "empty" };
  },
};

// Agent 5: Newsletter
const newsletter: AgentDef = {
  key: "newsletter",
  title: "Newsletter",
  blurb: "Assembles one weekly evidence-digest email; nurtures founding-member conversions.",
  schedule: "Wed, 11:00 ET",
  model: "Sonnet",
  async run() {
    const usage = new Usage();
    const [drafts, fm] = await Promise.all([recentPublishedDrafts(7), foundingStats()]);
    // Evergreen fallbacks so an issue always has something to feature.
    const evergreen = [
      `${url.tool.interactionChecker} (the free interaction checker)`,
      `${url.tool.bloodwork} (free bloodwork analysis)`,
      `${url.tool.audit} (audit my stack)`,
    ];
    const featured = drafts.length
      ? drafts.map(d => `${url.library(String(d.slug ?? ""))} , ${d.title}`)
      : evergreen;
    const user = [
      siteBrief(),
      ``,
      `This week's published pages to consider featuring:`,
      featured.join("\n"),
      ``,
      `Founding Member status: ${fm.spotsLeft} of ${fm.total} spots left. Email list size: ${fm.listSize}.`,
      `Write one weekly issue as a JSON object per your instructions.`,
    ].join("\n");
    const { parsed, ok, error } = await complete<Record<string, unknown>>({
      model: SONNET, system: NEWSLETTER_PROMPT, user, usage, maxTokens: 4000,
    });
    if (!ok) return { items: [], usage: usage.total, model: SONNET, status: "error", error };
    if (!parsed || Array.isArray(parsed)) return { items: [], usage: usage.total, model: SONNET, status: "empty" };
    const subjects = parsed.subject_line_options as string[] | undefined;
    const items: NewItem[] = [{
      agent: "newsletter", kind: "newsletter",
      title: subjects?.[0] ? String(subjects[0]) : `Weekly issue ${today()}`,
      payload: parsed,
    }];
    return { items, usage: usage.total, model: SONNET, status: "ok" };
  },
};

// Agent 6: Digital PR
const pr: AgentDef = {
  key: "pr",
  title: "Digital PR",
  blurb: "Finds backlink and citation targets and drafts personalised outreach you can send.",
  schedule: "Fri, 08:00 ET",
  model: "Opus",
  async run() {
    const usage = new Usage();
    const contacted = await existingPrOutlets();
    const user = [
      `Find 8 to 12 fresh US backlink/citation targets and draft outreach (JSON array per your instructions).`,
      `suppdoc's hero linkable asset: the embeddable interaction checker at ${url.tool.embed}.`,
      `Already contacted outlets (do not pitch again): ${contacted.length ? contacted.join("; ") : "none yet"}.`,
    ].join("\n");
    const { parsed, ok, error } = await complete<Record<string, unknown>[]>({
      model: OPUS, system: PR_PROMPT, user, usage, web: true, maxTokens: 8000,
    });
    if (!ok) return { items: [], usage: usage.total, model: OPUS, status: "error", error };
    if (!Array.isArray(parsed)) return { items: [], usage: usage.total, model: OPUS, status: "empty" };
    const items: NewItem[] = parsed.slice(0, 12).map(t => ({
      agent: "pr" as const, kind: "pr_target" as const,
      title: String(t.outlet ?? t.pitch_subject ?? "PR target"),
      priority: Number(t.relevance_score) || 0,
      payload: t,
    }));
    return { items, usage: usage.total, model: OPUS, status: items.length ? "ok" : "empty" };
  },
};

export const AGENTS: Record<AgentKey, AgentDef> = { trend, seo, social, visual, newsletter, pr };
export const AGENT_ORDER: AgentKey[] = ["trend", "seo", "social", "visual", "newsletter", "pr"];

/** Run one agent end to end: gather, call Claude, log the run, queue results. */
export async function runAgent(key: AgentKey, trigger: "cron" | "manual"): Promise<{
  ok: boolean; agent: AgentKey; itemsCreated: number; status: string; error?: string;
}> {
  const def = AGENTS[key];
  const started = Date.now();
  let out: RunOutput;
  try {
    out = await def.run(trigger);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await logRun({ agent: key, status: "error", items_created: 0, latency_ms: Date.now() - started, trigger, error });
    return { ok: false, agent: key, itemsCreated: 0, status: "error", error };
  }
  const runId = await logRun({
    agent: key, model: out.model, status: out.status, items_created: out.items.length,
    usage: out.usage, latency_ms: Date.now() - started, trigger, error: out.error,
  });
  let created = 0;
  if (out.items.length) {
    try { created = await insertItems(out.items, runId); }
    catch (err) { return { ok: false, agent: key, itemsCreated: 0, status: "insert_error", error: err instanceof Error ? err.message : String(err) }; }
  }
  return { ok: out.status !== "error", agent: key, itemsCreated: created, status: out.status, error: out.error };
}
