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
              await opts.onDelta(delta.text);
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
