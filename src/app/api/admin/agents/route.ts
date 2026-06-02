import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase, isAdminEmail } from "@/lib/supabase-admin";
import { renderNewsletter } from "@/lib/newsletter";
import { sendViaResend } from "@/lib/resend";
import { getItem, updateItem, insertItems, type AgentItem, type NewItem, type AgentKey, type ItemKind } from "@/lib/agents/store";
import { AGENTS, AGENT_ORDER } from "@/lib/agents/registry";

// kind -> default producing agent, for items imported from Claude Code (chat).
const KIND_AGENT: Record<string, AgentKey> = {
  opportunity: "trend", seo_draft: "seo", social_post: "social",
  visual: "visual", newsletter: "newsletter", pr_target: "pr",
};
function slugify(s: string): string {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_RECIPIENTS = 800;

async function adminEmail(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } });
  const { data: { user } } = await supa.auth.getUser();
  return isAdminEmail(user?.email) ? (user!.email ?? null) : null;
}

// ─── GET: the queue + recent run log + agent metadata ───────────────────────
export async function GET() {
  const admin = await adminEmail();
  if (!admin) return Response.json({ ok: false, error: "not authorized" }, { status: 403 });
  const db = getAdminSupabase();
  if (!db) return Response.json({ ok: false, error: "service role not configured" }, { status: 500 });

  const [{ data: pending }, { data: history }, { data: runs }] = await Promise.all([
    db.from("agent_items").select("*").eq("status", "pending").order("priority", { ascending: false }).order("created_at", { ascending: false }).limit(300),
    db.from("agent_items").select("*").in("status", ["approved", "published", "sent"]).order("approved_at", { ascending: false }).limit(200),
    db.from("agent_runs").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const agents = AGENT_ORDER.map(k => ({
    key: k, title: AGENTS[k].title, blurb: AGENTS[k].blurb, schedule: AGENTS[k].schedule, model: AGENTS[k].model,
  }));

  return Response.json({ ok: true, adminEmail: admin, agents, items: pending ?? [], history: history ?? [], runs: runs ?? [] });
}

// ─── helpers for approve ────────────────────────────────────────────────────
async function uniquePublishedSlug(base: string, selfId: string): Promise<string> {
  const db = getAdminSupabase();
  if (!db) return base;
  const { data } = await db
    .from("agent_items")
    .select("id,slug")
    .eq("kind", "seo_draft").eq("status", "published");
  const taken = new Set((data ?? []).filter(r => (r as { id: string }).id !== selfId).map(r => (r as { slug: string }).slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n++) { const c = `${base}-${n}`; if (!taken.has(c)) return c; }
  return `${base}-${Date.now()}`;
}

async function recipients(): Promise<string[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const [{ data: subs }, { data: unsubs }] = await Promise.all([
    db.from("email_signups").select("email").limit(5000),
    db.from("email_unsubscribes").select("email").limit(5000),
  ]);
  const blocked = new Set((unsubs ?? []).map(u => String(u.email).toLowerCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of subs ?? []) {
    const e = String(r.email ?? "").trim().toLowerCase();
    if (e && e.includes("@") && !blocked.has(e) && !seen.has(e)) { seen.add(e); out.push(e); }
  }
  return out;
}

// ─── POST: act on a queue item ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await adminEmail();
  if (!admin) return Response.json({ ok: false, error: "not authorized" }, { status: 403 });

  let body: { action?: string; id?: string; edited?: Record<string, unknown>; note?: string; mode?: string; subject?: string; text?: string; testEmail?: string; items?: unknown };
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const action = String(body.action ?? "");

  // Import a batch generated in Claude Code (no API cost). Runs before the
  // single-item id check, since import has no id.
  if (action === "import") {
    const raw = Array.isArray(body.items) ? body.items : null;
    if (!raw) return Response.json({ ok: false, error: "items must be a JSON array" }, { status: 400 });
    const toInsert: NewItem[] = [];
    const skipped: string[] = [];
    for (const r of raw as Record<string, unknown>[]) {
      const kind = String(r?.kind ?? "") as ItemKind;
      if (!KIND_AGENT[kind]) { skipped.push(`bad kind: ${kind || "(missing)"}`); continue; }
      const payload = (r?.payload && typeof r.payload === "object") ? r.payload as Record<string, unknown> : (r as Record<string, unknown>);
      const title = String(r?.title ?? payload.title ?? payload.outlet ?? "Untitled");
      const item: NewItem = {
        agent: (String(r?.agent ?? "") as AgentKey) || KIND_AGENT[kind],
        kind,
        title,
        priority: Number(r?.priority) || Number(payload.priority_score) || 0,
        payload,
        needs_review: Boolean(r?.needs_review ?? payload.needs_clinical_review),
      };
      if (kind === "seo_draft") item.slug = slugify(String(r?.slug ?? payload.slug ?? title));
      toInsert.push(item);
    }
    if (toInsert.length === 0) return Response.json({ ok: false, error: `nothing to import (${skipped.join("; ") || "empty"})` }, { status: 400 });
    const created = await insertItems(toInsert, null);
    return Response.json({ ok: true, imported: created, skipped });
  }

  const id = String(body.id ?? "");
  if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });
  const item = await getItem(id);
  if (!item) return Response.json({ ok: false, error: "item not found" }, { status: 404 });

  const now = new Date().toISOString();

  switch (action) {
    case "edit": {
      await updateItem(id, { edited: body.edited ?? item.edited ?? null, note: body.note ?? item.note });
      return Response.json({ ok: true });
    }
    case "reject": {
      await updateItem(id, { status: "rejected", note: body.note ?? null, approved_by: admin, approved_at: now });
      return Response.json({ ok: true });
    }
    case "park": {
      await updateItem(id, { status: "parked", note: body.note ?? null });
      return Response.json({ ok: true });
    }
    case "approve": {
      if (item.kind === "seo_draft") {
        const base = item.slug ?? "untitled";
        const slug = await uniquePublishedSlug(base, id);
        await updateItem(id, { status: "published", slug, approved_by: admin, approved_at: now, edited: body.edited ?? item.edited ?? null });
        return Response.json({ ok: true, published: true, slug });
      }
      // opportunity -> released to writers; social/visual/pr -> ready to use.
      await updateItem(id, { status: "approved", approved_by: admin, approved_at: now, edited: body.edited ?? item.edited ?? null });
      return Response.json({ ok: true });
    }
    case "newsletter_send": {
      if (item.kind !== "newsletter") return Response.json({ ok: false, error: "not a newsletter item" }, { status: 400 });
      const subject = String(body.subject ?? "").trim();
      const text = String(body.text ?? "").trim();
      if (!subject || !text) return Response.json({ ok: false, error: "subject and text required" }, { status: 400 });
      let list: string[];
      if (body.mode === "all") list = (await recipients()).slice(0, MAX_RECIPIENTS);
      else { const t = String(body.testEmail ?? admin).trim().toLowerCase(); list = t.includes("@") ? [t] : [admin]; }
      if (list.length === 0) return Response.json({ ok: true, sent: 0, note: "no recipients" });
      let sent = 0, failed = 0;
      for (const email of list) {
        const { html, text: txt } = renderNewsletter(subject, text, encodeURIComponent(email));
        const r = await sendViaResend(email, subject, html, txt);
        if (r.ok) sent++; else failed++;
      }
      if (body.mode === "all") await updateItem(id, { status: "sent", approved_by: admin, approved_at: now });
      return Response.json({ ok: true, mode: body.mode === "all" ? "all" : "test", sent, failed, total: list.length });
    }
    default:
      return Response.json({ ok: false, error: "unknown action" }, { status: 400 });
  }
}

export type { AgentItem };
