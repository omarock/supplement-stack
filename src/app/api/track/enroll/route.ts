import { NextRequest } from "next/server";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSessionUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── POST: create or update this user's tracker enrollment ──────────────────
// Body: { stackName?, stackIds?: string[], reminderOptIn?, weeklyDigestOptIn? }
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* allow empty body = enroll with defaults */ }

  const stackIds = Array.isArray(body.stackIds)
    ? (body.stackIds as unknown[]).filter(x => typeof x === "string").slice(0, 60) as string[]
    : null;

  const row: Record<string, unknown> = {
    user_email: user.email,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };
  if (typeof body.stackName === "string") row.stack_name = body.stackName.slice(0, 120);
  if (stackIds) row.stack_ids = stackIds;
  if (typeof body.reminderOptIn === "boolean") row.reminder_opt_in = body.reminderOptIn;
  if (typeof body.weeklyDigestOptIn === "boolean") row.weekly_digest_opt_in = body.weeklyDigestOptIn;

  const { error } = await admin
    .from("tracker_enrollments")
    .upsert(row, { onConflict: "user_email" });

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
