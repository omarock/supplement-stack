import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { weeklyDigestEmail } from "@/lib/email-templates";
import { generateSummary } from "@/lib/tracker-summary";
import { computeStats, localDateKey, lastNDateKeys, type Checkin, type TrackerEnrollment } from "@/lib/tracker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth === `Bearer ${secret}`) return true;
  if (secret && req.nextUrl.searchParams.get("secret") === secret) return true;
  return false;
}

async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ from: "suppdoc.io <hello@suppdoc.io>", to: [to], subject, html, text }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `${res.status} ${body?.message ?? "unknown"}` };
    return { ok: true, id: body?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ ok: false, error: "supabase env not configured" }, { status: 500 });
  const supa = createClient(url, key, { auth: { persistSession: false } });

  // Candidates: opted-in enrollments not digested in the last 6 days
  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString();
  const { data: enrollments, error: enrErr } = await supa
    .from("tracker_enrollments")
    .select("user_email, stack_name, stack_ids, reminder_opt_in, weekly_digest_opt_in, started_at, last_digest_sent_at")
    .eq("weekly_digest_opt_in", true)
    .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`)
    .limit(2000);

  if (enrErr) return Response.json({ ok: false, error: enrErr.message }, { status: 500 });

  // Skip anyone who unsubscribed from email entirely
  const { data: unsubs } = await supa.from("email_unsubscribes").select("email");
  const unsubscribed = new Set((unsubs ?? []).map(u => u.email.toLowerCase()));

  const today = localDateKey();
  const last7 = new Set(lastNDateKeys(7, today));
  const results: { email: string; status: string }[] = [];

  for (const enr of enrollments ?? []) {
    const email = String(enr.user_email).toLowerCase();
    if (unsubscribed.has(email)) { results.push({ email, status: "skip:unsubscribed" }); continue; }

    const { data: ci } = await supa
      .from("stack_checkins")
      .select("date, took_stack, energy, focus, sleep, mood, stress, note")
      .eq("user_email", email)
      .order("date", { ascending: true })
      .limit(60);

    const checkins = (ci ?? []) as Checkin[];
    const daysTracked = checkins.filter(c => last7.has(c.date)).length;
    // Only digest people who actually engaged this week (>=3 of last 7 days)
    if (daysTracked < 3) { results.push({ email, status: "skip:low_activity" }); continue; }

    const stats = computeStats(checkins, enr as unknown as TrackerEnrollment, today);
    const summary = await generateSummary(checkins, enr as unknown as TrackerEnrollment, today);

    const payload = weeklyDigestEmail({
      headline: summary.headline,
      insights: summary.insights,
      suggestions: summary.suggestions,
      streak: stats.currentStreak,
      adherence: stats.adherence,
      daysTracked,
    });

    const emailToken = encodeURIComponent(email);
    const html = payload.html.split("{{EMAIL_TOKEN}}").join(emailToken);
    const send = await sendViaResend(email, payload.subject, html, payload.text);

    if (send.ok) {
      await supa.from("tracker_enrollments").update({ last_digest_sent_at: new Date().toISOString() }).eq("user_email", email);
    }
    results.push({ email, status: send.ok ? "sent" : `failed:${send.error}` });
  }

  const summaryCount = results.reduce<Record<string, number>>((m, r) => { m[r.status] = (m[r.status] ?? 0) + 1; return m; }, {});
  return Response.json({ ok: true, processed: results.length, summary: summaryCount, results });
}
