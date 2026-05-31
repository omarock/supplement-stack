"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TH, FONTS } from "@/lib/theme";
import { GREETING_MARKER } from "@/lib/chat-context";
import Launcher from "./Launcher";
import Panel from "./Panel";
import Thread from "./Thread";
import Composer from "./Composer";
import type { ChatMessage } from "./Message";

const STORAGE_KEY = "suppdoc.chat.v1";
const MM = { fontFamily: FONTS.mono } as const;
const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;

// Pages where the launcher should hide entirely
const HIDE_PATHS = [/^\/admin/, /^\/auth/, /^\/signin/, /^\/signup/];

// ─── Context gathering from localStorage + window ─────────────────────────
interface GatheredContext {
  currentPath: string;
  currentIngredientId?: string;
  currentStackSlug?: string;
  savedStackIds?: string[];
  quizGoals?: string[];
  quizDiet?: string;
  quizBudget?: string;
}

function gatherContext(pathname: string): GatheredContext {
  const ctx: GatheredContext = { currentPath: pathname };

  const ingredient = /^\/ingredients\/([a-z0-9-]+)(?:\/research)?\/?$/.exec(pathname);
  if (ingredient) ctx.currentIngredientId = ingredient[1];

  const stack = /^\/stacks\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (stack) ctx.currentStackSlug = stack[1];

  if (typeof window !== "undefined") {
    // Custom stack from /build
    try {
      const raw = localStorage.getItem("suppdoc.customStack.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as { ids?: string[] };
        if (Array.isArray(parsed.ids) && parsed.ids.length > 0) ctx.savedStackIds = parsed.ids;
      }
    } catch { /* ignore */ }
    // Quiz data
    try {
      const raw = localStorage.getItem("phylaQuizData");
      if (raw) {
        const parsed = JSON.parse(raw) as { goals?: string[]; diet?: string; budget?: string };
        if (Array.isArray(parsed.goals) && parsed.goals.length > 0) ctx.quizGoals = parsed.goals;
        if (typeof parsed.diet === "string" && parsed.diet) ctx.quizDiet = parsed.diet;
        if (typeof parsed.budget === "string" && parsed.budget) ctx.quizBudget = parsed.budget;
      }
    } catch { /* ignore */ }
  }
  return ctx;
}

// ─── Suggested-prompt generator ───────────────────────────────────────────
function suggestPrompts(ctx: GatheredContext): { label: string; text: string }[] {
  // Context-aware suggestions
  if (ctx.currentIngredientId) {
    return [
      { label: "Is this right for me?", text: `Is ${prettyName(ctx.currentIngredientId)} right for someone with my goals?` },
      { label: "How should I take it?", text: `What's the best dose and timing for ${prettyName(ctx.currentIngredientId)}?` },
      { label: "Interactions to watch", text: `What interactions or contraindications should I know about for ${prettyName(ctx.currentIngredientId)}?` },
      { label: "Pair with what?", text: `What does ${prettyName(ctx.currentIngredientId)} pair well with?` },
    ];
  }
  if (ctx.currentStackSlug) {
    return [
      { label: "Best timing for this stack", text: `What's the optimal timing for the supplements in this stack?` },
      { label: "Skip-if list", text: `Who should NOT use this stack?` },
      { label: "When will I feel it?", text: `How long until I notice effects from this stack?` },
      { label: "Cheaper version?", text: `Can I get most of the benefit of this stack on a tighter budget?` },
    ];
  }
  if (ctx.savedStackIds && ctx.savedStackIds.length > 0) {
    return [
      { label: "Audit my stack", text: `Look at my current stack and tell me what's redundant, missing, or mistimed.` },
      { label: "Best timing", text: `Help me organise the timing of my current stack across morning / midday / evening.` },
      { label: "What's missing?", text: `What foundational supplements am I missing from my current stack?` },
      { label: "Lower the cost", text: `How can I get similar benefits from my current stack but spend less?` },
    ];
  }
  if (ctx.quizGoals && ctx.quizGoals.length > 0) {
    const main = ctx.quizGoals[0].toLowerCase();
    return [
      { label: "What worked for others?", text: `What supplements have the strongest evidence for ${main}?` },
      { label: "Start with what?", text: `If I'm new to supplements and want ${main}, where should I start?` },
      { label: "Lifestyle first?", text: `What lifestyle changes matter more than supplements for ${main}?` },
      { label: "Build a stack", text: `Help me build a stack for ${main}.` },
    ];
  }
  // Default cold-start
  return [
    { label: "Best for sleep", text: "What are the best supplements for sleep, without sedation?" },
    { label: "Brain fog", text: "I have brain fog in the afternoon, what should I try?" },
    { label: "Vegan essentials", text: "What supplements should every vegan take?" },
    { label: "Audit my stack", text: "How do I check whether my supplements interact?" },
  ];
}

function prettyName(id: string): string {
  return id.split("-").map(w => w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w).join(" ");
}

// ─── Storage helpers ──────────────────────────────────────────────────────
function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    // Drop streaming/errored flags on rehydrate, and scrub any stale internal
    // greeting sentinel that older sessions may have persisted as a user message.
    return parsed
      .filter(m => !(m.role === "user" && typeof m.content === "string" && m.content.includes(GREETING_MARKER)))
      .map(m => ({ id: m.id, role: m.role, content: m.content }));
  } catch { return []; }
}
function saveHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  // Don't persist the in-flight assistant message
  const persistable = messages.filter(m => !m.streaming && !m.errored);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable.slice(-30))); } catch { /* ignore */ }
}

// ─── ChatAssistant component ──────────────────────────────────────────────
export default function ChatAssistant() {
  const pathname = usePathname() ?? "/";
  const hidden = HIDE_PATHS.some(re => re.test(pathname));

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMessages(loadHistory());
    setMounted(true);
  }, []);

  // Persist on every change
  useEffect(() => { if (mounted) saveHistory(messages); }, [messages, mounted]);

  const ctx = useMemo(() => gatherContext(pathname), [pathname]);
  const suggestions = useMemo(() => suggestPrompts(ctx), [ctx]);

  // ── Send ────────────────────────────────────────────────────────────────
  const send = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content: "", streaming: true };
    const nextMessages: ChatMessage[] = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setDraft("");
    setStreaming(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const apiBody = {
        messages: nextMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        context: ctx,
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(apiBody),
        signal: ac.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errText = body?.error === "rate_limited"
          ? `You're sending messages too quickly. Try again in a few minutes.`
          : `Couldn't reach the assistant (${res.status}). Please try again.`;
        setMessages(prev => prev.map(m => m.id === assistantMsg.id
          ? { ...m, streaming: false, errored: true, content: errText }
          : m));
        return;
      }

      // Read SSE
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          let event = "", data = "";
          for (const line of raw.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (!data) continue;
          let parsed: Record<string, unknown>;
          try { parsed = JSON.parse(data); } catch { continue; }
          if (event === "delta" && typeof parsed.text === "string") {
            accumulated += parsed.text;
            setMessages(prev => prev.map(m => m.id === assistantMsg.id
              ? { ...m, content: accumulated }
              : m));
          } else if (event === "error") {
            setMessages(prev => prev.map(m => m.id === assistantMsg.id
              ? { ...m, streaming: false, errored: true, content: accumulated || "Sorry, something went wrong. Please try again." }
              : m));
            return;
          }
        }
      }

      // Finalize
      setMessages(prev => prev.map(m => m.id === assistantMsg.id
        ? { ...m, streaming: false, content: accumulated.trim() || "Sorry, I didn't get a response. Please try again." }
        : m));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User stopped, finalize whatever we got
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, streaming: false } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === assistantMsg.id
          ? { ...m, streaming: false, errored: true, content: "Network error, please check your connection and try again." }
          : m));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming, ctx]);

  const stop = useCallback(() => { abortRef.current?.abort(); }, []);

  const clear = useCallback(() => {
    if (streaming) return;
    setMessages([]);
    setDraft("");
  }, [streaming]);

  // No marker is sent on open anymore. When there's no history we show an
  // instant, premium welcome (EmptyState) instead of round-tripping a hidden
  // sentinel through the API, which previously leaked into the thread as a
  // "<<suppdoc:greeting>>" bubble. The real conversation starts on first send.

  if (hidden) return null;
  if (!mounted) return null;

  return (
    <>
      <Launcher onClick={() => setOpen(true)} open={open} />
      <Panel
        open={open}
        onClose={() => setOpen(false)}
        onClear={clear}
        hasHistory={messages.length > 0}
      >
        {messages.length === 0 ? (
          <EmptyState suggestions={suggestions} onPick={send} />
        ) : (
          <Thread messages={messages} />
        )}
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={() => send(draft)}
          onStop={stop}
          disabled={streaming && draft.trim().length === 0}
          streaming={streaming}
        />
      </Panel>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyState({ suggestions, onPick }: { suggestions: { label: string; text: string }[]; onPick: (text: string) => void }) {
  return (
    <div style={{
      flex: 1, padding: "22px 18px 18px",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      gap: 18,
    }}>
      {/* Premium welcome */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          <span aria-hidden style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#fff", boxShadow: `0 6px 16px -4px ${TH.sage}99`,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...D, fontSize: 16, color: TH.ink, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              Your evidence-led coach
            </div>
            <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.04em", marginTop: 2 }}>
              PERSONALIZED · CITED · NO UPSELL
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.58, margin: 0 }}>
          Ask me anything about supplements, doses, timing, or interactions. I read your goals and saved stack, weigh the published research, and give you a straight, cited answer, including what to skip.
        </p>
      </div>

      <div>
        <div style={{
          ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.12em",
          marginBottom: 8, textTransform: "uppercase",
        }}>Try asking</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {suggestions.map(s => (
            <button
              key={s.label}
              type="button"
              onClick={() => onPick(s.text)}
              style={{
                textAlign: "left", padding: "11px 14px",
                background: TH.bg, border: `1px solid ${TH.edge}`,
                borderRadius: 12, cursor: "pointer",
                fontSize: 13.5, color: TH.ink,
                transition: "border-color .15s, background .15s, transform .15s",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.background = TH.surface; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.background = TH.bg; }}
            >
              <span style={{ fontWeight: 500 }}>{s.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TH.muted} strokeWidth="2.2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
