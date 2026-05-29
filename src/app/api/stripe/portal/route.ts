import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { stripeEnabled, createPortalSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Opens the Stripe Billing Portal so a subscriber can update or cancel.
export async function POST(req: NextRequest) {
  if (!stripeEnabled()) return Response.json({ ok: false, error: "billing_unavailable" }, { status: 503 });

  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });

  const { data } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_email", user.email)
    .maybeSingle();

  const customerId = (data as { stripe_customer_id?: string } | null)?.stripe_customer_id;
  if (!customerId) return Response.json({ ok: false, error: "no_customer" }, { status: 404 });

  const result = await createPortalSession(customerId, `${req.nextUrl.origin}/me`);
  if (!result.ok || !result.url) return Response.json({ ok: false, error: result.error ?? "portal_failed" }, { status: 500 });
  return Response.json({ ok: true, url: result.url });
}
