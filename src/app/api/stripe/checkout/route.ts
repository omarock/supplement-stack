import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { stripeEnabled, createCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripeEnabled()) return Response.json({ ok: false, error: "billing_unavailable" }, { status: 503 });

  const user = await getSessionUser();
  if (!user) return Response.json({ ok: false, error: "not_signed_in" }, { status: 401 });

  let body: { plan?: "monthly" | "annual" } = {};
  try { body = await req.json(); } catch {}
  const plan = body.plan === "annual" ? "annual" : "monthly";

  const origin = req.nextUrl.origin;
  const result = await createCheckoutSession({
    plan,
    email: user.email,
    successUrl: `${origin}/me?upgraded=1`,
    cancelUrl: `${origin}/pricing`,
  });

  if (!result.ok || !result.url) return Response.json({ ok: false, error: result.error ?? "checkout_failed" }, { status: 500 });
  return Response.json({ ok: true, url: result.url });
}
