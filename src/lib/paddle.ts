/**
 * Paddle (Billing) integration, dependency-light, mirrors the lib/stripe.ts
 * approach: REST + Node crypto, env-gated so everything degrades gracefully when
 * the keys are absent.
 *
 * Env vars:
 *   Public (safe in the browser, used by Paddle.js):
 *     NEXT_PUBLIC_PADDLE_CLIENT_TOKEN   test_… / live_…
 *     NEXT_PUBLIC_PADDLE_ENV            "sandbox" | "production"
 *     NEXT_PUBLIC_PADDLE_PRICE_MONTHLY  pri_…  ($9/mo)
 *     NEXT_PUBLIC_PADDLE_PRICE_ANNUAL   pri_…  ($79/yr)
 *   Server-only (secret):
 *     PADDLE_API_KEY                    for server API calls (portal, lookups)
 *     PADDLE_WEBHOOK_SECRET            to verify incoming webhooks
 */
import crypto from "crypto";

export interface PaddleClientConfig {
  token: string;
  environment: "sandbox" | "production";
  priceMonthly: string;
  priceAnnual: string;
}

/** The browser checkout can run once we have a client token + at least one price. */
export function paddleConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
    process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY
  );
}

export function paddleClientConfig(): PaddleClientConfig {
  return {
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox",
    priceMonthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ?? "",
    priceAnnual: process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL ?? "",
  };
}

function paddleApiBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

/** Self-service management requires the server API key. */
export function paddleManagementConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}

/** Thin authenticated fetch wrapper for the Paddle Billing API (server-only). */
async function paddleApi<T = unknown>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const key = process.env.PADDLE_API_KEY;
  if (!key) return { ok: false, status: 0, error: "PADDLE_API_KEY not set" };
  try {
    const res = await fetch(`${paddleApiBase()}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      ...(init?.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = json?.error?.detail || json?.error?.code || `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: String(detail) };
    }
    return { ok: true, status: res.status, data: json?.data as T };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "network error" };
  }
}

// ─── Subscription detail shapes (only the fields we read) ───────────────────
export interface PaddleSubscriptionDetail {
  id: string;
  status: string;                                   // active | trialing | past_due | canceled | paused
  next_billed_at?: string | null;
  current_billing_period?: { starts_at?: string; ends_at?: string } | null;
  billing_cycle?: { interval?: string; frequency?: number } | null;
  scheduled_change?: { action?: string; effective_at?: string } | null;
  items?: { price?: { id?: string; unit_price?: { amount?: string; currency_code?: string } } }[];
  customer_id?: string;
}

export interface PaddleTransaction {
  id: string;
  status: string;                                   // completed | billed | paid | past_due ...
  created_at?: string;
  billed_at?: string | null;
  currency_code?: string;
  details?: { totals?: { grand_total?: string } } | null;
  invoice_number?: string | null;
}

/** Fetch full live subscription detail from Paddle. */
export async function getPaddleSubscription(subscriptionId: string) {
  return paddleApi<PaddleSubscriptionDetail>(`/subscriptions/${subscriptionId}`);
}

/**
 * Schedule (or immediately apply) a cancellation. Default is end-of-period so the
 * user keeps the access they paid for; Paddle fires subscription.updated then
 * subscription.canceled, which our webhook reconciles.
 */
export async function cancelPaddleSubscription(
  subscriptionId: string,
  when: "next_billing_period" | "immediately" = "next_billing_period"
) {
  return paddleApi<PaddleSubscriptionDetail>(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: { effective_from: when },
  });
}

/** Remove a scheduled cancellation (reactivate before the period ends). */
export async function reactivatePaddleSubscription(subscriptionId: string) {
  return paddleApi<PaddleSubscriptionDetail>(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: { scheduled_change: null },
  });
}

/**
 * Switch the plan (monthly ↔ annual). Prorated and charged immediately so the
 * change takes effect now; Paddle returns the updated subscription.
 */
export async function changePaddleSubscriptionPlan(subscriptionId: string, priceId: string) {
  return paddleApi<PaddleSubscriptionDetail>(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: {
      items: [{ price_id: priceId, quantity: 1 }],
      proration_billing_mode: "prorated_immediately",
    },
  });
}

/** Billing history: recent transactions for one subscription, newest first. */
export async function listPaddleTransactions(subscriptionId: string) {
  return paddleApi<PaddleTransaction[]>(
    `/transactions?subscription_id=${encodeURIComponent(subscriptionId)}&per_page=20&order_by=created_at[DESC]`
  );
}

/**
 * Create a Paddle-hosted customer portal session. Best practice for updating the
 * payment method and downloading official invoices (keeps us out of PCI scope).
 * Returns deep links Paddle generates for this customer.
 */
export async function createPaddlePortalSession(customerId: string, subscriptionIds: string[] = []) {
  return paddleApi<{ urls?: { general?: { overview?: string } } }>(
    `/customers/${customerId}/portal-sessions`,
    { method: "POST", body: { subscription_ids: subscriptionIds } }
  );
}

/**
 * Fetch a Paddle customer's email by id (server-side). Used as a fallback in the
 * webhook to map a subscription to a suppdoc account when checkout customData is
 * missing. Requires PADDLE_API_KEY.
 */
export async function getPaddleCustomerEmail(customerId: string | undefined): Promise<string | null> {
  const key = process.env.PADDLE_API_KEY;
  if (!key || !customerId) return null;
  try {
    const res = await fetch(`${paddleApiBase()}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const email = body?.data?.email;
    return typeof email === "string" ? email.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Map a Paddle price id back to our internal plan name. */
export function planForPriceId(priceId: string | undefined): "monthly" | "annual" | null {
  if (!priceId) return null;
  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_ANNUAL) return "annual";
  return null;
}

/**
 * Verify a Paddle webhook. Paddle sends a `Paddle-Signature` header shaped like
 * `ts=1700000000;h1=<hex hmac>`; the signed payload is `${ts}:${rawBody}` and the
 * HMAC is SHA-256 keyed with the destination's secret.
 */
export function verifyPaddleWebhook(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const parts: Record<string, string> = {};
  for (const seg of signatureHeader.split(";")) {
    const idx = seg.indexOf("=");
    if (idx > 0) parts[seg.slice(0, idx).trim()] = seg.slice(idx + 1).trim();
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(h1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
