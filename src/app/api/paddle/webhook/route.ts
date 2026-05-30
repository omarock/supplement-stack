import { NextRequest } from "next/server";
import { verifyPaddleWebhook, planForPriceId } from "@/lib/paddle";
import { getAdminSupabase } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal shape of the Paddle Billing subscription webhook payload we read.
interface PaddleSubscriptionData {
  id?: string;
  status?: string;
  customer_id?: string;
  custom_data?: Record<string, unknown> | null;
  current_billing_period?: { ends_at?: string } | null;
  scheduled_change?: { action?: string } | null;
  items?: { price?: { id?: string } }[];
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("paddle-signature");
  if (!verifyPaddleWebhook(raw, sig)) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: { event_type?: string; data?: PaddleSubscriptionData };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const type = event.event_type ?? "";
  // We only act on subscription lifecycle events; ack everything else.
  if (!type.startsWith("subscription.")) {
    return Response.json({ ok: true, ignored: type });
  }

  const data = event.data ?? {};
  // The user's email is passed through checkout customData so we can match the
  // Paddle subscription to a suppdoc account.
  const email = String(
    (data.custom_data?.user_email as string) ||
    (data.custom_data?.userEmail as string) ||
    ""
  ).trim().toLowerCase();
  if (!email) {
    return Response.json({ ok: true, note: "no user_email in custom_data" });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return Response.json({ ok: false, error: "admin client unavailable" }, { status: 500 });
  }

  const priceId = data.items?.[0]?.price?.id;
  const row = {
    user_email: email,
    paddle_customer_id: data.customer_id ?? null,
    paddle_subscription_id: data.id ?? null,
    status: data.status ?? null,                                  // active | trialing | past_due | canceled | paused
    plan: planForPriceId(priceId),                                // monthly | annual
    current_period_end: data.current_billing_period?.ends_at ?? null,
    cancel_at_period_end: data.scheduled_change?.action === "cancel",
  };

  const { error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "user_email" });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
