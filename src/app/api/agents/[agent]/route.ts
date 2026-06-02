import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/supabase-admin";
import { runAgent, AGENTS } from "@/lib/agents/registry";
import type { AgentKey } from "@/lib/agents/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Opus + web search + up to 5 drafts can run long. Vercel clamps to the plan max.
export const maxDuration = 300;

function isAgent(key: string): key is AgentKey {
  return Object.prototype.hasOwnProperty.call(AGENTS, key);
}

/** Vercel cron / manual-secret auth (same pattern as /api/cron/email-drip). */
function hasCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (req.nextUrl.searchParams.get("secret") === secret) return true;
  return false;
}

/** Signed-in admin (for the manual "Run now" button in /admin/agents). */
async function isAdminSession(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } });
  const { data: { user } } = await supa.auth.getUser();
  return isAdminEmail(user?.email);
}

// Cron triggers this (GET, with the secret header Vercel injects).
export async function GET(req: NextRequest, ctx: { params: Promise<{ agent: string }> }) {
  const { agent } = await ctx.params;
  if (!isAgent(agent)) return Response.json({ ok: false, error: "unknown agent" }, { status: 404 });
  if (!hasCronSecret(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const result = await runAgent(agent, "cron");
  return Response.json(result);
}

// Admin "Run now" triggers this (POST, with the admin session cookie).
export async function POST(req: NextRequest, ctx: { params: Promise<{ agent: string }> }) {
  const { agent } = await ctx.params;
  if (!isAgent(agent)) return Response.json({ ok: false, error: "unknown agent" }, { status: 404 });
  if (!hasCronSecret(req) && !(await isAdminSession())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await runAgent(agent, "manual");
  return Response.json(result);
}
