import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase, isAdminEmail } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: grant (or revoke) a lifetime founding-member Premium to an email.
 * Used during the manual Payoneer validation phase: once a founding member pays
 * their one-time invoice, the admin flips them to Premium here. Writes the same
 * `subscriptions` row a real checkout would, so isPremium() unlocks everything.
 */
async function isAdminRequest(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
  });
  const { data: { user } } = await supa.auth.getUser();
  return isAdminEmail(user?.email);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return Response.json({ ok: false, error: "not authorized" }, { status: 403 });
  }

  let body: { email?: string; revoke?: boolean };
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return Response.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "admin client unavailable" }, { status: 500 });

  const row = {
    user_email: email,
    status: body.revoke ? "canceled" : "active",
    plan: "lifetime",
    // Far-future end date = never expires (isPremium treats it as active).
    current_period_end: body.revoke ? new Date().toISOString() : "2100-01-01T00:00:00.000Z",
    cancel_at_period_end: false,
    paddle_subscription_id: null,
    paddle_customer_id: null,
  };

  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "user_email" });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({ ok: true, email, status: row.status });
}
