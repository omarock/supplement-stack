import type { NextRequest } from "next/server";

/**
 * Rate limiter for the unauthenticated AI endpoints (bloodwork/analyze,
 * generate-stack, audit-stack) and lead capture. Its job is to stop runaway
 * anonymous spend / abuse (a public URL with NO limit is a financial DoS).
 *
 * Two backends, chosen at runtime:
 *  - **Upstash Redis** (distributed, survives scale-out) when UPSTASH_REDIS_REST_URL
 *    + UPSTASH_REDIS_REST_TOKEN are set. This is the production-grade path: one
 *    shared counter across every Vercel instance, so the limit is real.
 *  - **In-memory** fixed bucket per warm instance otherwise (the soft V1 fallback,
 *    and the fail-open target if Upstash is briefly unreachable).
 *
 * To activate the distributed limiter: create a free Upstash Redis DB and add the
 * two env vars in Vercel. No code change needed — it switches on automatically.
 */
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Client IP. On Vercel, `x-real-ip` is set by the platform edge and is NOT
 * client-spoofable; the leftmost `x-forwarded-for` entry CAN be forged by the
 * caller to dodge the limiter, so prefer `x-real-ip`.
 */
export function getClientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashEnabled = !!(UPSTASH_URL && UPSTASH_TOKEN);

type Result = { ok: boolean; retryAfterSec?: number };

function inMemory(key: string, capacityPerHour: number): Result {
  const now = Date.now();
  const refillPerMs = capacityPerHour / (60 * 60 * 1000);
  const existing = buckets.get(key);
  const tokens0 = existing
    ? Math.min(capacityPerHour, existing.tokens + (now - existing.updatedAt) * refillPerMs)
    : capacityPerHour;
  if (tokens0 < 1) {
    return { ok: false, retryAfterSec: Math.ceil((1 - tokens0) / refillPerMs / 1000) };
  }
  buckets.set(key, { tokens: tokens0 - 1, updatedAt: now });
  return { ok: true };
}

// Distributed fixed-window counter via the Upstash REST pipeline: INCR the key,
// and set a 1-hour TTL only on first hit (EXPIRE ... NX). Over capacity → blocked.
// On any Upstash error we fail OPEN to the in-memory limiter (availability over a
// hard cap — the goal is cost protection, not access control).
async function viaUpstash(key: string, capacityPerHour: number): Promise<Result> {
  const windowSec = 3600;
  const k = `rl:${key}`;
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify([["INCR", k], ["EXPIRE", k, windowSec, "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return inMemory(key, capacityPerHour);
    const data = (await res.json()) as { result: number }[];
    const count = data[0]?.result ?? 0;
    if (count > capacityPerHour) return { ok: false, retryAfterSec: windowSec };
    return { ok: true };
  } catch {
    return inMemory(key, capacityPerHour);
  }
}

/**
 * Consume one unit for `key`. `capacityPerHour` is the hourly allowance.
 * Returns ok:false (+ retryAfterSec) when exhausted. Async because the
 * distributed backend does a network round-trip.
 */
export async function checkRateLimit(key: string, capacityPerHour = 20): Promise<Result> {
  return upstashEnabled ? viaUpstash(key, capacityPerHour) : inMemory(key, capacityPerHour);
}
