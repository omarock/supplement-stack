import type { NextRequest } from "next/server";

/**
 * Lightweight token-bucket rate limiter shared by the unauthenticated AI
 * endpoints (bloodwork/analyze, generate-stack, audit-stack) and chat.
 *
 * In-memory per warm Vercel instance, same soft-V1 model as the original chat
 * limiter. Its job is to stop runaway anonymous Claude spend (a public URL with
 * NO limit is a financial DoS). For hard guarantees across instances, move the
 * store to Vercel KV / Upstash later (tracked as QA M9).
 */
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Consume one token for `key`. `capacityPerHour` is both the hourly rate and
 * the burst size. Returns ok:false (+ retryAfterSec) when the bucket is empty.
 */
export function checkRateLimit(key: string, capacityPerHour = 20): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const refillPerMs = capacityPerHour / (60 * 60 * 1000);
  const existing = buckets.get(key);
  let tokens = existing
    ? Math.min(capacityPerHour, existing.tokens + (now - existing.updatedAt) * refillPerMs)
    : capacityPerHour;
  if (tokens < 1) {
    return { ok: false, retryAfterSec: Math.ceil((1 - tokens) / refillPerMs / 1000) };
  }
  tokens -= 1;
  buckets.set(key, { tokens, updatedAt: now });
  return { ok: true };
}
