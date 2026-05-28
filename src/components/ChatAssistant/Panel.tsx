"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TH, FONTS } from "@/lib/theme";

interface Props {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  children: ReactNode;
  hasHistory: boolean;
}

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export default function Panel({ open, onClose, onClear, children, hasHistory }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock on mobile only (where panel is full-height modal)
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (window.innerWidth > 640) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 99,
            background: "rgba(10,37,64,0.32)",
            backdropFilter: "blur(2px)",
            animation: "sd-fade-in .2s ease-out",
            display: "var(--chat-backdrop-display)",
          }}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-label="suppdoc AI assistant"
        aria-modal="false"
        style={{
          position: "fixed",
          zIndex: 100,
          right: "var(--chat-panel-right)",
          bottom: "var(--chat-panel-bottom)",
          left: "var(--chat-panel-left)",
          top: "var(--chat-panel-top)",
          width: "var(--chat-panel-width)",
          height: "var(--chat-panel-height)",
          maxHeight: "var(--chat-panel-maxh)",
          maxWidth: "var(--chat-panel-maxw)",
          display: open ? "flex" : "none",
          flexDirection: "column",
          background: TH.surface,
          border: `1px solid ${TH.edge}`,
          borderRadius: "var(--chat-panel-radius)",
          boxShadow: "0 20px 60px rgba(10,37,64,0.28), 0 6px 14px rgba(10,37,64,0.08)",
          overflow: "hidden",
          animation: "sd-panel-in .25s cubic-bezier(.2,.7,.2,1) both",
          fontFamily: FONTS.body,
        }}
      >
        {/* Header */}
        <header style={{
          padding: "14px 16px",
          background: `linear-gradient(180deg, ${TH.bg} 0%, ${TH.surface} 100%)`,
          borderBottom: `1px solid ${TH.edge}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span aria-hidden style={{
              width: 30, height: 30, borderRadius: 999, flexShrink: 0,
              background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: TH.surface, fontSize: 12, fontWeight: 700, ...MM,
            }}>sd</span>
            <div>
              <div style={{ ...D, fontSize: 15, color: TH.ink, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                suppdoc AI
              </div>
              <div style={{ fontSize: 11, color: TH.muted, ...MM, letterSpacing: "0.04em", marginTop: 1 }}>
                <span style={{
                  display: "inline-block", width: 6, height: 6, borderRadius: 999,
                  background: "#22c55e", marginRight: 5, verticalAlign: "middle",
                }} />
                Online · evidence-led
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {hasHistory && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear conversation"
                title="Clear conversation"
                style={iconBtnStyle()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              style={iconBtnStyle()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>
        </header>

        {children}
      </div>

      <style>{`
        :root {
          --chat-panel-right: 22px;
          --chat-panel-bottom: 22px;
          --chat-panel-left: auto;
          --chat-panel-top: auto;
          --chat-panel-width: 420px;
          --chat-panel-height: auto;
          --chat-panel-maxh: 78vh;
          --chat-panel-maxw: calc(100vw - 36px);
          --chat-panel-radius: 22px;
          --chat-backdrop-display: none;
        }
        @media (max-width: 640px) {
          :root {
            --chat-panel-right: 0;
            --chat-panel-bottom: 0;
            --chat-panel-left: 0;
            --chat-panel-top: auto;
            --chat-panel-width: auto;
            --chat-panel-height: 92vh;
            --chat-panel-maxh: 92vh;
            --chat-panel-maxw: none;
            --chat-panel-radius: 22px 22px 0 0;
            --chat-backdrop-display: block;
          }
        }
        @keyframes sd-panel-in {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}

function iconBtnStyle(): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 999,
    background: "transparent", border: "none",
    color: TH.inkSoft, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "background .15s, color .15s",
  };
}
