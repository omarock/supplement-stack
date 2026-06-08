import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSessionUser } from "@/lib/auth-server";
import { generateSummary, rulesSummary } from "@/lib/tracker-summary";
import { emailIsPremium } from "@/lib/premium";
import type { Checkin } from "@/lib/tracker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST: generate an AI weekly summary from the signed-in user's check-ins.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  const { data, error } = await admin
    .from("stack_checkins")
    .select("date, took_stack, energy, focus, sleep, mood, stress, note")
    .eq("user_email", user.email)
    .order("date", { ascending: true })
    .limit(60);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const { data: enr } = await admin
    .from("tracker_enrollments")
    .select("stack_name, stack_ids, reminder_opt_in, weekly_digest_opt_in, started_at")
    .eq("user_email", user.email)
    .maybeSingle();

  // Claude-powered summary is a Premium feature; free users get the deterministic
  // rules summary (same data, zero API cost). Bounds API spend to paying users.
  const premium = await emailIsPremium(user.email).catch(() => false);
  const summary = premium
    ? await generateSummary((data ?? []) as Checkin[], enr ?? null)
    : rulesSummary((data ?? []) as Checkin[], enr ?? null);
  return Response.json({ ok: true, summary });
}
