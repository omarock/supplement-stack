/**
 * Database layer for the content agents. Everything goes through the
 * service-role client (server-only) against two tables: agent_runs (the cost /
 * status log) and agent_items (the unified approval queue). See
 * supabase/agents-setup.sql for the schema.
 */
import { getAdminSupabase } from "@/lib/supabase-admin";
import type { TokenUsage } from "@/lib/anthropic";

export type AgentKey = "trend" | "seo" | "social" | "visual" | "newsletter" | "pr";
export type ItemKind = "opportunity" | "seo_draft" | "social_post" | "visual" | "newsletter" | "pr_target";
export type ItemStatus = "pending" | "approved" | "rejected" | "published" | "sent" | "parked";

export const FOUNDING_TOTAL_SPOTS = 50;

export interface AgentItem {
  id: string;
  agent: AgentKey;
  kind: ItemKind;
  status: ItemStatus;
  title: string | null;
  slug: string | null;
  priority: number;
  payload: Record<string, unknown>;
  edited: Record<string, unknown> | null;
  run_id: string | null;
  parent_id: string | null;
  needs_review: boolean;
  note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewItem {
  agent: AgentKey;
  kind: ItemKind;
  title?: string;
  slug?: string | null;
  priority?: number;
  payload: Record<string, unknown>;
  parent_id?: string | null;
  needs_review?: boolean;
}

// ─── Cost estimate (best-effort, USD per 1M tokens) ─────────────────────────
// Approximate published list prices; used only for the spend log in /admin.
const RATES: Record<string, { in: number; out: number }> = {
  opus: { in: 15, out: 75 },
  sonnet: { in: 3, out: 15 },
  haiku: { in: 1, out: 5 },
};
export function estimateCost(model: string | undefined, usage: TokenUsage | undefined): number {
  if (!usage) return 0;
  const m = model ?? "";
  const tier = /opus/.test(m) ? "opus" : /haiku/.test(m) ? "haiku" : "sonnet";
  const r = RATES[tier];
  const cost = (usage.input_tokens / 1e6) * r.in + (usage.output_tokens / 1e6) * r.out;
  return Math.round(cost * 10000) / 10000;
}

// ─── agent_runs ─────────────────────────────────────────────────────────────
export interface RunLog {
  agent: AgentKey;
  model?: string;
  status: "ok" | "error" | "empty";
  items_created: number;
  usage?: TokenUsage;
  latency_ms: number;
  trigger: "cron" | "manual";
  error?: string;
}

export async function logRun(run: RunLog): Promise<string | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin
    .from("agent_runs")
    .insert({
      agent: run.agent,
      model: run.model ?? null,
      status: run.status,
      items_created: run.items_created,
      input_tokens: run.usage?.input_tokens ?? 0,
      output_tokens: run.usage?.output_tokens ?? 0,
      cost_usd: estimateCost(run.model, run.usage),
      latency_ms: run.latency_ms,
      trigger: run.trigger,
      error: run.error ?? null,
    })
    .select("id")
    .single();
  return data?.id ?? null;
}

// ─── agent_items writes ─────────────────────────────────────────────────────
export async function insertItems(items: NewItem[], runId: string | null): Promise<number> {
  const admin = getAdminSupabase();
  if (!admin || items.length === 0) return 0;
  const rows = items.map(i => ({
    agent: i.agent,
    kind: i.kind,
    status: "pending",
    title: i.title ?? null,
    slug: i.slug ?? null,
    priority: i.priority ?? 0,
    payload: i.payload,
    parent_id: i.parent_id ?? null,
    needs_review: i.needs_review ?? false,
    run_id: runId,
  }));
  const { data, error } = await admin.from("agent_items").insert(rows).select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

// ─── agent_items reads (pipeline inputs) ────────────────────────────────────

/** Approved opportunities that no agent of `childAgent` has acted on yet. */
export async function approvedOpportunitiesFor(childAgent: AgentKey, limit: number): Promise<AgentItem[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const { data: opps } = await admin
    .from("agent_items")
    .select("*")
    .eq("kind", "opportunity")
    .eq("status", "approved")
    .order("priority", { ascending: false })
    .limit(50);
  const list = (opps ?? []) as AgentItem[];
  if (list.length === 0) return [];
  // Exclude opportunities that already have a child from this agent.
  const { data: kids } = await admin
    .from("agent_items")
    .select("parent_id")
    .eq("agent", childAgent)
    .in("parent_id", list.map(o => o.id));
  const done = new Set((kids ?? []).map(k => (k as { parent_id: string }).parent_id));
  return list.filter(o => !done.has(o.id)).slice(0, limit);
}

/** Published SEO drafts from the last `days` days, for the newsletter. */
export async function recentPublishedDrafts(days: number): Promise<AgentItem[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data } = await admin
    .from("agent_items")
    .select("*")
    .eq("kind", "seo_draft")
    .eq("status", "published")
    .gte("approved_at", cutoff)
    .order("approved_at", { ascending: false })
    .limit(20);
  return (data ?? []) as AgentItem[];
}

/** Published SEO drafts that do not yet have a visual asset. */
export async function draftsNeedingVisual(limit: number): Promise<AgentItem[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const { data: drafts } = await admin
    .from("agent_items")
    .select("*")
    .eq("kind", "seo_draft")
    .eq("status", "published")
    .order("approved_at", { ascending: false })
    .limit(30);
  const list = (drafts ?? []) as AgentItem[];
  if (list.length === 0) return [];
  const { data: vis } = await admin
    .from("agent_items")
    .select("parent_id")
    .eq("kind", "visual")
    .in("parent_id", list.map(d => d.id));
  const done = new Set((vis ?? []).map(v => (v as { parent_id: string }).parent_id));
  return list.filter(d => !done.has(d.id)).slice(0, limit);
}

/** Outlets already contacted, so Digital PR never double-pitches. */
export async function existingPrOutlets(): Promise<string[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const { data } = await admin
    .from("agent_items")
    .select("title,payload")
    .eq("kind", "pr_target")
    .limit(500);
  return (data ?? [])
    .map(r => String((r as { payload?: { outlet?: string } }).payload?.outlet ?? (r as { title?: string }).title ?? ""))
    .filter(Boolean);
}

// ─── Founding-member + list stats (for the newsletter) ──────────────────────
export interface FoundingStats { spotsLeft: number; total: number; listSize: number }
export async function foundingStats(): Promise<FoundingStats> {
  const admin = getAdminSupabase();
  if (!admin) return { spotsLeft: FOUNDING_TOTAL_SPOTS, total: FOUNDING_TOTAL_SPOTS, listSize: 0 };
  const [{ count: lifetime }, { count: list }] = await Promise.all([
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan", "lifetime").eq("status", "active"),
    admin.from("email_signups").select("*", { count: "exact", head: true }),
  ]);
  return {
    spotsLeft: Math.max(0, FOUNDING_TOTAL_SPOTS - (lifetime ?? 0)),
    total: FOUNDING_TOTAL_SPOTS,
    listSize: list ?? 0,
  };
}

// ─── Queue management (used by /admin/agents) ───────────────────────────────
export async function getItem(id: string): Promise<AgentItem | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin.from("agent_items").select("*").eq("id", id).single();
  return (data as AgentItem) ?? null;
}

export async function updateItem(id: string, patch: Partial<AgentItem>): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) return;
  await admin.from("agent_items").update(patch).eq("id", id);
}

/** A published SEO draft by slug, for the public /library/[slug] page. */
export async function publishedDraftBySlug(slug: string): Promise<AgentItem | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin
    .from("agent_items")
    .select("*")
    .eq("kind", "seo_draft")
    .eq("status", "published")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  return (data as AgentItem) ?? null;
}

export async function allPublishedDrafts(): Promise<AgentItem[]> {
  const admin = getAdminSupabase();
  if (!admin) return [];
  const { data } = await admin
    .from("agent_items")
    .select("*")
    .eq("kind", "seo_draft")
    .eq("status", "published")
    .order("approved_at", { ascending: false })
    .limit(500);
  return (data ?? []) as AgentItem[];
}
