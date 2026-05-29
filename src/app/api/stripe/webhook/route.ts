import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhook } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function planFromPrice(priceId: string | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return "annual";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  return null;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const event = verifyWebhook(raw, req.headers.get("stripe-signature"));
  if (!event) return Response.json({ ok: false, error: "invalid_signature" }, { status: 400 });

  const supa = admin();
  if (!supa) return Response.json({ ok: false, error: "db_unavailable" }, { status: 500 });

  const type = event.type as string;
  const obj = (event.data as { object?: Record<string, unknown> })?.object ?? {};

  try {
    if (type === "checkout.session.completed") {
      const email = ((obj.client_reference_id as string) || (obj.customer_email as string) || "").toLowerCase();
      if (email) {
        await supa.from("subscriptions").upsert({
          user_email: email,
          stripe_customer_id: (obj.customer as string) ?? null,
          stripe_subscription_id: (obj.subscription as string) ?? null,
          status: "active",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_email" });
      }
    } else if (type === "customer.subscription.updated" || type === "customer.subscription.created" || type === "customer.subscription.deleted") {
      const customerId = obj.customer as string;
      const status = type === "customer.subscription.deleted" ? "canceled" : (obj.status as string);
      const periodEnd = obj.current_period_end ? new Date((obj.current_period_end as number) * 1000).toISOString() : null;
      const cancelAtEnd = Boolean(obj.cancel_at_period_end);
      const items = obj.items as { data?: { price?: { id?: string } }[] } | undefined;
      const priceId = items?.data?.[0]?.price?.id;
      const plan = planFromPrice(priceId);
      if (customerId) {
        await supa.from("subscriptions").update({
          status,
          plan: plan ?? undefined,
          current_period_end: periodEnd,
          cancel_at_period_end: cancelAtEnd,
          stripe_subscription_id: (obj.id as string) ?? undefined,
          updated_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);
      }
    }
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "handler_error" }, { status: 500 });
  }

  return Response.json({ ok: true, received: type });
}
