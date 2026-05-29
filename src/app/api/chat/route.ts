import { NextRequest } from "next/server";
import { streamClaude, anthropicEnabled } from "@/lib/anthropic";
import {
  buildSystemPrompt,
  prepareMessages,
  isGreetingTurn,
  GREETING_MARKER,
  type ChatContext,
  type IncomingMessage,
} from "@/lib/chat-context";
import { detectSupplementsInText, lookupSupplement } from "@/lib/knowledge-base";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Constants ─────────────────────────────────────────────────────────────
const MAX_MESSAGE_CHARS = 3000;
const MAX_HISTORY = 8;
const MAX_RESPONSE_TOKENS = 800;

// ─── In-memory token-bucket rate limit ─────────────────────────────────────
// 20 requests / hour / IP. Allowed burst of 5. Survives only within a single
// warm Vercel function instance, acceptable as a soft V1 protection.
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();
const BUCKET_CAPACITY = 20;
const BUCKET_REFILL_PER_MS = BUCKET_CAPACITY / (60 * 60 * 1000);

function rateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const existing = buckets.get(ip);
  let tokens = existing ? Math.min(BUCKET_CAPACITY, existing.tokens + (now - existing.updatedAt) * BUCKET_REFILL_PER_MS) : BUCKET_CAPACITY;
  if (tokens < 1) {
    const retryAfterSec = Math.ceil((1 - tokens) / BUCKET_REFILL_PER_MS / 1000);
    return { ok: false, retryAfterSec };
  }
  tokens -= 1;
  buckets.set(ip, { tokens, updatedAt: now });
  return { ok: true };
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// ─── Validation ────────────────────────────────────────────────────────────
function validateBody(body: unknown): { ok: true; messages: IncomingMessage[]; context: ChatContext } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid body" };
  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.messages)) return { ok: false, error: "messages must be an array" };
  if (b.messages.length === 0) return { ok: false, error: "messages cannot be empty" };
  if (b.messages.length > 50) return { ok: false, error: "too many messages" };

  const messages: IncomingMessage[] = [];
  for (const raw of b.messages) {
    if (!raw || typeof raw !== "object") return { ok: false, error: "bad message shape" };
    const m = raw as Record<string, unknown>;
    if (m.role !== "user" && m.role !== "assistant") return { ok: false, error: "bad message role" };
    if (typeof m.content !== "string") return { ok: false, error: "bad message content" };
    if (m.content.length > MAX_MESSAGE_CHARS) return { ok: false, error: `message too long (max ${MAX_MESSAGE_CHARS} chars)` };
    messages.push({ role: m.role, content: m.content });
  }

  const ctxRaw = (b.context ?? {}) as Record<string, unknown>;
  const context: ChatContext = {
    currentPath: typeof ctxRaw.currentPath === "string" ? ctxRaw.currentPath.slice(0, 200) : undefined,
    currentIngredientId: typeof ctxRaw.currentIngredientId === "string" ? ctxRaw.currentIngredientId.slice(0, 60) : undefined,
    currentStackSlug: typeof ctxRaw.currentStackSlug === "string" ? ctxRaw.currentStackSlug.slice(0, 60) : undefined,
    savedStackIds: Array.isArray(ctxRaw.savedStackIds) ? ctxRaw.savedStackIds.filter((x): x is string => typeof x === "string").slice(0, 20) : undefined,
    quizGoals: Array.isArray(ctxRaw.quizGoals) ? ctxRaw.quizGoals.filter((x): x is string => typeof x === "string").slice(0, 8) : undefined,
    quizDiet: typeof ctxRaw.quizDiet === "string" ? ctxRaw.quizDiet.slice(0, 30) : undefined,
    quizBudget: typeof ctxRaw.quizBudget === "string" ? ctxRaw.quizBudget.slice(0, 30) : undefined,
  };

  return { ok: true, messages, context };
}

// ─── SSE encoders ──────────────────────────────────────────────────────────
const enc = new TextEncoder();
function sseEvent(event: string, data: Record<string, unknown>): Uint8Array {
  return enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── Rules-based fallback when no API key ──────────────────────────────────
function fallbackReply(messages: IncomingMessage[]): string {
  const lastUser = [...messages].reverse().find(m => m.role === "user");
  if (!lastUser) return "I'm here to help with your supplement stack. Ask me anything.";

  const lowered = lastUser.content.toLowerCase();
  if (lowered.includes(GREETING_MARKER) || lowered.length < 5) {
    return `Hi 👋 I'm suppdoc.io's AI coach. I can answer questions about supplements, interactions, dosing, and timing.\n\nWhile our full AI is being set up, you can:\n\n- Browse the [151 ingredients](/ingredients) in our library\n- See the [15 ready-made stacks](/stacks)\n- Use the free [stack audit tool](/audit) to check what you take today`;
  }

  const detected = detectSupplementsInText(lastUser.content);
  if (detected.length > 0) {
    const supps = detected.slice(0, 3).map(id => {
      const s = lookupSupplement(id);
      return s ? `- **${s.name}**, ${s.purpose}. [Read more](${s.url}) · [Research](${s.researchUrl})` : null;
    }).filter(Boolean).join("\n");
    return `Our AI assistant is being set up, meanwhile, here's what we have on the supplements you mentioned:\n\n${supps}\n\nFor an interaction check, try the [Audit My Stack tool](/audit), paste your stack and we'll flag redundancies, missing nutrients, and timing issues.`;
  }

  return `Our AI assistant is being set up. While that's connecting, you can:\n\n- [Take the quiz](/quiz) to get a personalised stack in 2 minutes\n- [Audit your current stack](/audit) for interactions and gaps\n- [Build a stack from scratch](/build) using our 151-ingredient library`;
}

// ─── Handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return new Response(JSON.stringify({ ok: false, error: "rate_limited", retryAfter: rl.retryAfterSec }), {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": String(rl.retryAfterSec ?? 60) },
    });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ ok: false, error: "invalid json" }), { status: 400 }); }
  const v = validateBody(body);
  if (!v.ok) return new Response(JSON.stringify({ ok: false, error: v.error }), { status: 400 });

  const prepared = prepareMessages(v.messages, v.context, MAX_HISTORY);
  if (prepared.length === 0) return new Response(JSON.stringify({ ok: false, error: "no user message" }), { status: 400 });
  const greeting = isGreetingTurn(v.messages);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendDelta = (text: string) => {
        try { controller.enqueue(sseEvent("delta", { text })); } catch { /* aborted */ }
      };
      const sendDone = (info: { model?: string; stopReason?: string }) => {
        try {
          controller.enqueue(sseEvent("done", { ...info, poweredBy: anthropicEnabled() ? "claude" : "rules" }));
          controller.close();
        } catch { /* aborted */ }
      };
      const sendError = (err: string) => {
        try {
          controller.enqueue(sseEvent("error", { message: err }));
          controller.close();
        } catch { /* aborted */ }
      };

      if (!anthropicEnabled()) {
        // Stream the fallback in small chunks so the UI still feels live
        const text = fallbackReply(v.messages);
        const tokens = text.match(/[\s\S]{1,8}/g) ?? [text];
        for (const t of tokens) {
          sendDelta(t);
          await new Promise(r => setTimeout(r, 18));
        }
        sendDone({ stopReason: "end_turn" });
        return;
      }

      // Claude path
      const greetingTransform = greeting
        // strip the marker so the model sees an actual question; keep context block intact
        ? prepared.map((m, i) => i === prepared.length - 1 && m.role === "user"
            ? { ...m, content: m.content.replace(GREETING_MARKER, "Please greet me briefly (1-3 sentences). Use the Context block to personalize. Offer one or two specific things you can help with right now.").trim() }
            : m)
        : prepared;

      await streamClaude({
        system: buildSystemPrompt(),
        messages: greetingTransform,
        maxTokens: MAX_RESPONSE_TOKENS,
        onDelta: sendDelta,
        onDone: sendDone,
        onError: sendError,
      });
    },
    cancel() { /* client disconnected, nothing to clean up */ },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
