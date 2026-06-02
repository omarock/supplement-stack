/**
 * Minimal Anthropic Messages API client.
 *
 * Why no SDK: avoids a new dep, the Messages API is HTTP-stable, and we don't
 * need streaming yet, we get back a single JSON object and parse it.
 *
 * If ANTHROPIC_API_KEY is not set, callers should gracefully fall back to a
 * deterministic rules-based response (see /api/audit-stack and /api/generate-stack).
 */

// Content blocks, used for multimodal input (bloodwork PDFs + lab photos).
// The Messages API accepts either a plain string or an array of these blocks.
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface ClaudeOptions {
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
  // If the model is asked to return JSON, set this to a tight prefix that we
  // strip from the response (handles the "Here is the JSON" preamble issue).
  expectJson?: boolean;
  // Server-side tools (e.g. web_search), passed straight through to the API.
  // Used by the content agents (Trend Discovery, Digital PR) to read the open
  // web. The model runs these tools itself; we only read the final text.
  tools?: unknown[];
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface ClaudeResult {
  ok: boolean;
  text: string;
  error?: string;
  model?: string;
  stopReason?: string;
  usage?: TokenUsage;
}

/** A web_search server tool spec, for agents that need live web data. */
export function webSearchTool(maxUses = 5): Record<string, unknown> {
  return { type: "web_search_20250305", name: "web_search", max_uses: maxUses };
}

// Verified against /v1/models on 2026-05-28. Sonnet 4.6 is the best quality
// /cost balance for chat + audit + stack generation. Fallbacks degrade
// gracefully to older snapshots if Anthropic deprecates 4.6.
const DEFAULT_MODEL = "claude-sonnet-4-6";
const FALLBACK_MODELS = [
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
];

export function anthropicEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function callClaude(opts: ClaudeOptions): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, text: "", error: "ANTHROPIC_API_KEY not set" };
  }

  const tryModel = async (model: string): Promise<ClaudeResult | null> => {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens ?? 1500,
          system: opts.system,
          messages: opts.messages,
          ...(opts.tools && opts.tools.length ? { tools: opts.tools } : {}),
        }),
      });

      if (res.status === 404 || res.status === 400) {
        // Likely model not found, let caller try a fallback
        const detail = await res.text();
        if (/model/i.test(detail)) return null;
        return { ok: false, text: "", error: `${res.status}: ${detail.slice(0, 200)}` };
      }

      const body = await res.json();
      if (!res.ok) {
        return { ok: false, text: "", error: body?.error?.message ?? `HTTP ${res.status}` };
      }

      // Messages API response shape: { content: [{ type: "text", text: "..." }], ... }
      const text = (body?.content ?? [])
        .filter((c: { type?: string }) => c?.type === "text")
        .map((c: { text?: string }) => c?.text ?? "")
        .join("");

      const cleaned = opts.expectJson ? stripJsonPreamble(text) : text;
      return {
        ok: true,
        text: stripDashes(cleaned),   // never let an em/en dash reach the UI
        model: body?.model,
        stopReason: body?.stop_reason,
        usage: {
          input_tokens: body?.usage?.input_tokens ?? 0,
          output_tokens: body?.usage?.output_tokens ?? 0,
        },
      };
    } catch (err) {
      return { ok: false, text: "", error: err instanceof Error ? err.message : String(err) };
    }
  };

  const primary = await tryModel(opts.model ?? DEFAULT_MODEL);
  if (primary !== null) return primary;

  for (const m of FALLBACK_MODELS) {
    const r = await tryModel(m);
    if (r !== null) return r;
  }
  return { ok: false, text: "", error: "no compatible Claude model available" };
}

function stripJsonPreamble(text: string): string {
  // Strip code fences and any text before the first { or [
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[\[{]/);
  if (start < 0) return candidate.trim();
  return candidate.slice(start).trim();
}

/**
 * Remove em dashes (—) and en dashes (–) from model output. Founder hard rule:
 * neither dash may ever appear in the UI, and LLMs love producing them. We can't
 * rely on prompting alone, so we sanitize centrally here, every AI response
 * (stack text, audit, bloodwork, chat, summaries) passes through this. Safe to
 * run on raw JSON too: dashes only ever occur inside string values, never in
 * JSON syntax. Spaced em dashes become a comma (clause break); the rest become
 * a hyphen (covers ranges like "20–50" -> "20-50").
 */
export function stripDashes(text: string): string {
  return text
    .replace(/ — /g, ", ")
    .replace(/—/g, "-")
    .replace(/–/g, "-");
}

// ─── Streaming ─────────────────────────────────────────────────────────────

export interface ClaudeStreamOptions extends Omit<ClaudeOptions, "expectJson"> {
  /** Called for each incremental text delta from the model. */
  onDelta: (text: string) => void | Promise<void>;
  /** Called when the stream finishes normally. */
  onDone?: (info: { model?: string; stopReason?: string }) => void | Promise<void>;
  /** Called on stream error. */
  onError?: (err: string) => void | Promise<void>;
  /** Optional AbortSignal to cancel the stream. */
  signal?: AbortSignal;
}

/**
 * Stream a Claude response as content_block_delta SSE events.
 * Returns when the stream completes (or aborts).
 *
 * Falls back to fallback models on 404. Bubbles up errors via onError.
 */
export async function streamClaude(opts: ClaudeStreamOptions): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await opts.onError?.("ANTHROPIC_API_KEY not set");
    return;
  }

  const tryModel = async (model: string): Promise<"ok" | "retry" | "error"> => {
    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens ?? 800,
          system: opts.system,
          messages: opts.messages,
          stream: true,
        }),
        signal: opts.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "ok";
      await opts.onError?.(err instanceof Error ? err.message : String(err));
      return "error";
    }

    if (res.status === 404 || (res.status === 400 && /model/i.test(await peekError(res)))) {
      return "retry";
    }
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      await opts.onError?.(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      return "error";
    }

    // Parse SSE
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let info: { model?: string; stopReason?: string } = {};

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by \n\n
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          // Each event is a set of "field: value" lines
          let event = "";
          let data = "";
          for (const line of raw.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (!data) continue;
          let parsed: Record<string, unknown>;
          try { parsed = JSON.parse(data); } catch { continue; }
          if (event === "content_block_delta") {
            const delta = parsed.delta as { type?: string; text?: string } | undefined;
            if (delta?.type === "text_delta" && typeof delta.text === "string") {
              await opts.onDelta(stripDashes(delta.text));   // strip em/en dashes live
            }
          } else if (event === "message_start") {
            const message = parsed.message as { model?: string } | undefined;
            info.model = message?.model;
          } else if (event === "message_delta") {
            const md = parsed.delta as { stop_reason?: string } | undefined;
            if (md?.stop_reason) info.stopReason = md.stop_reason;
          } else if (event === "error") {
            const errInfo = parsed.error as { message?: string } | undefined;
            await opts.onError?.(errInfo?.message ?? "stream error");
            return "error";
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "ok";
      await opts.onError?.(err instanceof Error ? err.message : String(err));
      return "error";
    }

    await opts.onDone?.(info);
    return "ok";
  };

  const primary = await tryModel(opts.model ?? DEFAULT_MODEL);
  if (primary !== "retry") return;
  for (const m of FALLBACK_MODELS) {
    const r = await tryModel(m);
    if (r !== "retry") return;
  }
  await opts.onError?.("no compatible Claude model available");
}

async function peekError(res: Response): Promise<string> {
  // Clone-and-peek: we already consumed nothing, but res.text() drains the body
  try { return await res.clone().text(); } catch { return ""; }
}

/**
 * Safe JSON parse for Claude's output. Returns null on failure.
 */
export function safeParseJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Tolerant JSON parse for model output. Models (especially with web search) wrap
 * JSON in prose, fence it, return {"items": [...]} instead of a bare array, or
 * get truncated at max_tokens mid-array. This recovers all of those:
 *   1. direct parse
 *   2. fenced ```json block
 *   3. balanced-bracket extraction (first complete [...] or {...} after prose)
 *   4. truncation repair (trim a cut-off array to its last complete object)
 */
export function parseJsonLoose<T = unknown>(text: string): T | null {
  if (!text) return null;
  const tryParse = (s: string): T | null => { try { return JSON.parse(s) as T; } catch { return null; } };

  let r = tryParse(text.trim());
  if (r !== null) return r;

  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fence) { r = tryParse(fence[1].trim()); if (r !== null) return r; }

  for (const open of ["[", "{"] as const) {
    const close = open === "[" ? "]" : "}";
    const start = text.indexOf(open);
    if (start < 0) continue;
    // Balanced scan (string-aware) to find the matching close.
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') { inStr = true; continue; }
      if (c === open) depth++;
      else if (c === close && --depth === 0) { end = i; break; }
    }
    if (end > start) { r = tryParse(text.slice(start, end + 1)); if (r !== null) return r; }
    // Truncation repair: array cut off mid-stream -> keep complete objects.
    if (open === "[") {
      const sub = text.slice(start);
      const lastObj = sub.lastIndexOf("}");
      if (lastObj > 0) { r = tryParse(sub.slice(0, lastObj + 1).replace(/,\s*$/, "") + "]"); if (r !== null) return r; }
    }
  }
  return null;
}

/**
 * Coerce a parsed value to an array. Accepts a bare array, or an object whose
 * first array-valued property is the list (e.g. {"opportunities": [...]}).
 */
export function asArray<T = unknown>(parsed: unknown): T[] | null {
  if (Array.isArray(parsed)) return parsed as T[];
  if (parsed && typeof parsed === "object") {
    for (const v of Object.values(parsed as Record<string, unknown>)) {
      if (Array.isArray(v)) return v as T[];
    }
  }
  return null;
}
