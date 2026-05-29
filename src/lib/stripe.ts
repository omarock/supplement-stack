/**
 * Minimal Stripe client, no SDK, just the REST API + Node crypto for webhook
 * signature verification. Matches the dependency-light approach in anthropic.ts.
 *
 * Env vars (all server-only):
 *   STRIPE_SECRET_KEY        sk_live_… / sk_test_…
 *   STRIPE_WEBHOOK_SECRET    whsec_…
 *   STRIPE_PRICE_MONTHLY     price_…  ($9/mo)
 *   STRIPE_PRICE_ANNUAL      price_…  ($79/yr)
 * Everything degrades gracefully when these are absent (stripeEnabled() = false).
 */
import crypto from "crypto";

const API = "https://api.stripe.com/v1";

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY);
}

export function priceFor(plan: "monthly" | "annual"): string | undefined {
  return plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
}

function form(params: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) u.append(k, v);
  return u.toString();
}

async function stripeFetch(path: string, body: string): Promise<{ ok: boolean; data: Record<string, unknown>; error?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, data: {}, error: "stripe_not_configured" };
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, data, error: (data as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}` };
  return { ok: true, data };
}

/** Create a subscription Checkout Session. Returns the hosted checkout URL. */
export async function createCheckoutSession(opts: {
  plan: "monthly" | "annual";
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ ok: boolean; url?: string; error?: string }> {
  const price = priceFor(opts.plan);
  if (!price) return { ok: false, error: "price_not_configured" };
  const r = await stripeFetch("/checkout/sessions", form({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    customer_email: opts.email,
    client_reference_id: opts.email,
    allow_promotion_codes: "true",
    "subscription_data[metadata][user_email]": opts.email,
  }));
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, url: r.data.url as string };
}

/** Create a Billing Portal session so a customer can manage/cancel. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  const r = await stripeFetch("/billing_portal/sessions", form({ customer: customerId, return_url: returnUrl }));
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, url: r.data.url as string };
}

/**
 * Verify a Stripe webhook signature (t=…,v1=… scheme) and return the parsed
 * event, or null if verification fails. Avoids the Stripe SDK.
 */
export function verifyWebhook(rawBody: string, sigHeader: string | null): Record<string, unknown> | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sigHeader) return null;
  const parts = Object.fromEntries(sigHeader.split(",").map(kv => kv.split("=") as [string, string]));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return null;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  // Constant-time compare
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  // Reject events older than 5 minutes (replay protection)
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return null;
  try { return JSON.parse(rawBody); } catch { return null; }
}
