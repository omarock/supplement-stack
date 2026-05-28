"use client";

import { useRef, useEffect, type KeyboardEvent } from "react";
import { TH, FONTS } from "@/lib/theme";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  disabled?: boolean;
  streaming?: boolean;
}

const MAX_CHARS = 3000;

export default function Composer({ value, onChange, onSend, onStop, disabled, streaming }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim().length > 0) onSend();
    }
  };

  const canSend = !disabled && value.trim().length > 0 && value.length <= MAX_CHARS;

  return (
    <div style={{
      padding: "10px 12px",
      borderTop: `1px solid ${TH.edge}`,
      background: TH.surface,
    }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 8,
        padding: "8px 10px 8px 14px",
        background: TH.bg,
        border: `1.5px solid ${TH.edge}`,
        borderRadius: 18,
        transition: "border-color .15s, box-shadow .15s",
      }}
        onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 3px ${TH.accentGlow}`; }}
        onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
      >
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={onKey}
          placeholder="Ask about a supplement, interaction, or your stack…"
          rows={1}
          disabled={disabled}
          spellCheck
          style={{
            flex: 1, resize: "none", border: "none", outline: "none",
            background: "transparent", padding: "6px 0",
            fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.5,
            color: TH.ink, minHeight: 24, maxHeight: 180,
          }}
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: TH.ink, color: TH.surface, border: "none",
              cursor: "pointer", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              transition: "transform .15s",
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(.94)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            aria-label="Send message"
            disabled={!canSend}
            style={{
              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
              background: canSend ? TH.ink : TH.mutedDim, color: TH.surface, border: "none",
              cursor: canSend ? "pointer" : "not-allowed",
              opacity: canSend ? 1 : 0.55,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              transition: "transform .15s, opacity .15s, background .15s",
            }}
            onMouseDown={e => { if (canSend) e.currentTarget.style.transform = "scale(.94)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: 6, fontSize: 11, color: TH.muted,
        padding: "0 4px",
      }}>
        <span style={{ fontFamily: FONTS.mono, letterSpacing: "0.04em" }}>
          Educational use only — not medical advice.
        </span>
        {value.length > 2000 && (
          <span style={{ fontFamily: FONTS.mono, color: value.length > 2800 ? "#b91c1c" : TH.muted }}>
            {value.length}/{MAX_CHARS}
          </span>
        )}
      </div>
    </div>
  );
}
