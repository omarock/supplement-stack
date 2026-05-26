/**
 * Minimal Anthropic Messages API client.
 *
 * Why no SDK: avoids a new dep, the Messages API is HTTP-stable, and we don't
 * need streaming yet — we get back a single JSON object and parse it.
 *
 * If ANTHROPIC_API_KEY is not set, callers should gracefully fall back to a
 * deterministic rules-based response (see /api/audit-stack and /api/generate-stack).
 */

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeOptions {
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
  // If the model is asked to return JSON, set this to a tight prefix that we
  // strip from the response (handles the "Here is the JSON" preamble issue).
  expectJson?: boolean;
}

export interface ClaudeResult {
  ok: boolean;
  text: string;
  error?: string;
  model?: string;
  stopReason?: string;
}

const DEFAULT_MODEL = "claude-sonnet-4-7-20250115";
// Falls back to whatever is current if the default 404s.
const FALLBACK_MODELS = ["claude-sonnet-4-5-20241022", "claude-3-7-sonnet-20250219"];

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
        }),
      });

      if (res.status === 404 || res.status === 400) {
        // Likely model not found — let caller try a fallback
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

      return {
        ok: true,
        text: opts.expectJson ? stripJsonPreamble(text) : text,
        model: body?.model,
        stopReason: body?.stop_reason,
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
 * Safe JSON parse for Claude's output. Returns null on failure.
 */
export function safeParseJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
