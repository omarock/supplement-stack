import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { getFullSubscription, subscriptionProvider } from "@/lib/premium";
import { getAdminSupabase } from "@/lib/supabase-admin";
import {
  cancelPaddleSubscription,
  reactivatePaddleSubscription,
  changePaddleSubscriptionPlan,
  createPaddlePortalSession,
  getPaddleSubscription,
  planForPriceId,
  type PaddleSubscriptionDetail,
} from "@/lib/paddle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "cancel" | "reactivate" | "change-plan" | "portal";

/** Persist the latest Paddle state back to our table so the UI is immediately accurate. */
async function reconcile(email: string, sub: PaddleSubscriptionDetail) {
  const admin = getAdminSupabase();
  if (!admin) return;
  const priceId = sub.items?.[0]?.price?.id;
  await admin.from("subscriptions").upsert(
    {
      user_email: email,
      paddle_customer_id: sub.customer_id ?? null,
      paddle_subscription_id: sub.id ?? null,
      status: sub.status ?? null,
      plan: planForPriceId(priceId),
      current_period_end: sub.current_billing_period?.ends_at ?? null,
      cancel_at_period_end: sub.scheduled_change?.action === "cancel",
    },
    { onConflict: "user_email" }
  );
}

export async function POST(req: NextRequest) {
  // 1. Identity comes from the verified session, never the request body.
  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in." }, { status: 401 });

  let body: { action?: Action; plan?: "monthly" | "annual" };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const action = body.action;
  if (!action) return Response.json({ ok: false, error: "Missing action." }, { status: 400 });

  // 2. Load *this user's* subscription. The Paddle ID comes from our DB, so a user
  //    can only ever act on their own subscription (no IDOR via the request body).
  const sub = await getFullSubscription(user.email);
  if (!sub) return Response.json({ ok: false, error: "No subscription found." }, { status: 404 });
  if (subscriptionProvider(sub) !== "paddle" || !sub.paddle_subscription_id) {
    return Response.json({ ok: false, error: "This subscription isn't managed by Paddle." }, { status: 409 });
  }
  const subId = sub.paddle_subscription_id;

  // 3. Hosted portal (payment method + official invoices) — return a deep link.
  if (action === "portal") {
    if (!sub.paddle_customer_id) {
      return Response.json({ ok: false, error: "No billing profile yet." }, { status: 409 });
    }
    const res = await createPaddlePortalSession(sub.paddle_customer_id, [subId]);
    const url = res.data?.urls?.general?.overview;
    if (!res.ok || !url) {
      return Response.json({ ok: false, error: res.error ?? "Couldn't open the billing portal." }, { status: 502 });
    }
    return Response.json({ ok: true, url });
  }

  // 4. Lifecycle actions.
  let result;
  if (action === "cancel") {
    result = await cancelPaddleSubscription(subId, "next_billing_period");
  } else if (action === "reactivate") {
    result = await reactivatePaddleSubscription(subId);
  } else if (action === "change-plan") {
    const target = body.plan;
    if (target !== "monthly" && target !== "annual") {
      return Response.json({ ok: false, error: "Invalid plan." }, { status: 400 });
    }
    if (sub.plan === target) {
      return Response.json({ ok: false, error: `You're already on the ${target} plan.` }, { status: 409 });
    }
    const priceId =
      target === "annual"
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;
    if (!priceId) {
      return Response.json({ ok: false, error: "Plan pricing isn't configured." }, { status: 500 });
    }
    result = await changePaddleSubscriptionPlan(subId, priceId);
  } else {
    return Response.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }

  if (!result.ok || !result.data) {
    return Response.json({ ok: false, error: result.error ?? "Paddle request failed." }, { status: 502 });
  }

  // 5. Re-read the canonical state from Paddle and reconcile our DB, then return it.
  const fresh = await getPaddleSubscription(subId);
  const detail = fresh.ok && fresh.data ? fresh.data : result.data;
  await reconcile(user.email, detail);

  return Response.json({
    ok: true,
    subscription: {
      status: detail.status,
      plan: planForPriceId(detail.items?.[0]?.price?.id),
      current_period_end: detail.current_billing_period?.ends_at ?? null,
      cancel_at_period_end: detail.scheduled_change?.action === "cancel",
    },
  });
}
