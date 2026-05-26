import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailForStage, type DripStage } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vercel cron protects this with a bearer token. We also accept a manual
// trigger via CRON_SECRET as a query param for one-off testing.
function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth === `Bearer ${secret}`) return true;
  // Vercel auto-injects this header for cron jobs:
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#cron-job-security
  if (secret && req.nextUrl.searchParams.get("secret") === secret) return true;
  return false;
}

interface QuizSubmission {
  id: string;
  email: string | null;
  created_at: string;
  data: { firstName?: string; name?: string } | null;
}

function stageForDays(days: number): DripStage | null {
  if (days === 0) return "welcome";
  if (days === 3) return "day3";
  if (days === 7) return "day7";
  if (days === 14) return "day14";
  return null;
}

function daysBetween(iso: string, now: Date): number {
  const then = new Date(iso);
  // Floor to UTC date so we compare days, not hours
  const a = Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate());
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((b - a) / 86_400_000);
}

async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "suppdoc.io <hello@suppdoc.io>",
        to: [to],
        subject,
        html,
        text,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: `${res.status} ${body?.message ?? "unknown"}` };
    }
    return { ok: true, id: body?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: "supabase env not configured" }, { status: 500 });
  }
  const supa = createClient(url, key, { auth: { persistSession: false } });

  // Fetch quiz submissions from the last 20 days with an email
  const cutoff = new Date(Date.now() - 20 * 86_400_000).toISOString();
  const { data: subs, error: subErr } = await supa
    .from("quiz_submissions")
    .select("id,email,created_at,data")
    .gte("created_at", cutoff)
    .not("email", "is", null)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (subErr) {
    return Response.json({ ok: false, error: subErr.message }, { status: 500 });
  }

  const now = new Date();
  const results: { email: string; stage: string; status: string; reason?: string }[] = [];

  // Get unsubscribed emails so we skip them
  const { data: unsubs } = await supa
    .from("email_unsubscribes")
    .select("email");
  const unsubscribed = new Set((unsubs ?? []).map(u => u.email.toLowerCase()));

  // For each candidate, decide stage; check log; send; record.
  for (const sub of (subs ?? []) as QuizSubmission[]) {
    const email = sub.email?.trim().toLowerCase();
    if (!email) continue;
    if (unsubscribed.has(email)) {
      results.push({ email, stage: "-", status: "skip:unsubscribed" });
      continue;
    }
    const days = daysBetween(sub.created_at, now);
    const stage = stageForDays(days);
    if (!stage) continue;

    // Already sent?
    const { data: priorRows } = await supa
      .from("email_drip_log")
      .select("id")
      .eq("email", email)
      .eq("stage", stage)
      .limit(1);
    if ((priorRows ?? []).length > 0) {
      results.push({ email, stage, status: "skip:already_sent" });
      continue;
    }

    const firstName = sub.data?.firstName || sub.data?.name?.split(" ")[0];
    const payload = emailForStage(stage, firstName);
    const emailToken = encodeURIComponent(email);
    const html = payload.html.split("{{EMAIL_TOKEN}}").join(emailToken);
    const text = payload.text;
    const send = await sendViaResend(email, payload.subject, html, text);

    // Record outcome (UNIQUE constraint also protects from double-send)
    await supa.from("email_drip_log").insert({
      email,
      stage,
      quiz_id: sub.id,
      resend_id: send.id ?? null,
      status: send.ok ? "sent" : "failed",
      error: send.ok ? null : (send.error ?? null),
    });

    results.push({
      email,
      stage,
      status: send.ok ? "sent" : "failed",
      reason: send.ok ? undefined : send.error,
    });
  }

  const summary = results.reduce<Record<string, number>>((m, r) => {
    m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, {});

  return Response.json({ ok: true, processed: results.length, summary, results });
}
