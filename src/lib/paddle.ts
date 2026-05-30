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
