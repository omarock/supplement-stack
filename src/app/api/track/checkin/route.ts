import { NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSessionUser } from "@/lib/auth-server";
import { WELLNESS_METRICS, type Checkin } from "@/lib/tracker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clampScore(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(10, n));
}

// ─── GET: this user's check-in history (last 60 days) ───────────────────────
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  const { data, error } = await admin
    .from("stack_checkins")
    .select("date, took_stack, energy, focus, sleep, mood, stress, note")
    .eq("user_email", user.email)
    .order("date", { ascending: true })
    .limit(120);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const { data: enr } = await admin
    .from("tracker_enrollments")
    .select("stack_name, stack_ids, reminder_opt_in, weekly_digest_opt_in, started_at")
    .eq("user_email", user.email)
    .maybeSingle();

  return Response.json({ ok: true, checkins: (data ?? []) as Checkin[], enrollment: enr ?? null });
}

// ─── POST: upsert today's (or a given day's) check-in ───────────────────────
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const date = typeof body.date === "string" && DATE_RE.test(body.date) ? body.date : null;
  if (!date) return Response.json({ ok: false, error: "invalid_date" }, { status: 400 });

  const note = typeof body.note === "string" ? body.note.slice(0, 1000) : null;
  const row: Record<string, unknown> = {
    user_id: user.id,
    user_email: user.email,
    date,
    took_stack: body.took_stack !== false,
    note,
    updated_at: new Date().toISOString(),
  };
  for (const m of WELLNESS_METRICS) row[m] = clampScore(body[m]);

  const { error } = await admin
    .from("stack_checkins")
    .upsert(row, { onConflict: "user_email,date" });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
