"use client";

import { TH, FONTS } from "@/lib/theme";

interface Props {
  onClick: () => void;
  open: boolean;
}

const MM = { fontFamily: FONTS.mono } as const;

export default function Launcher({ onClick, open }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Ask suppdoc, the supplement coach"
      aria-expanded={open}
      style={{
        position: "fixed", zIndex: 90,
        right: "var(--chat-launcher-right)", bottom: "var(--chat-launcher-bottom)",
        height: 56,
        padding: "0 22px 0 16px",
        display: open ? "none" : "inline-flex",
        alignItems: "center", gap: 12,
        background: TH.ink, color: TH.surface,
        border: "none", borderRadius: 999,
        cursor: "pointer",
        fontFamily: FONTS.body, fontSize: 14, fontWeight: 500,
        boxShadow: "0 10px 30px rgba(10,37,64,0.28), 0 4px 10px rgba(10,37,64,0.18)",
        animation: "sd-launcher-in .35s cubic-bezier(.2,.7,.2,1) both",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 14px 38px rgba(10,37,64,0.32), 0 4px 10px rgba(10,37,64,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(10,37,64,0.28), 0 4px 10px rgba(10,37,64,0.18)"; }}
    >
      <span aria-hidden style={{
        width: 32, height: 32, borderRadius: 999, flexShrink: 0,
        background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.amber} 100%)`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, ...MM, fontWeight: 700, color: TH.ink,
        letterSpacing: "0.04em",
        position: "relative",
      }}>
        sd
        <span style={{
          position: "absolute", top: -2, right: -2,
          width: 10, height: 10, borderRadius: 999,
          background: "#22c55e",
          border: `2px solid ${TH.ink}`,
          animation: "sd-pulse 2.4s ease-in-out infinite",
        }} />
      </span>
      <span style={{ display: "var(--chat-launcher-label)" }}>Ask suppdoc</span>

      <style>{`
        :root {
          --chat-launcher-right: 22px;
          --chat-launcher-bottom: 22px;
          --chat-launcher-label: inline;
        }
        @media (max-width: 640px) {
          :root {
            --chat-launcher-right: 16px;
            --chat-launcher-bottom: 16px;
          }
        }
        @keyframes sd-launcher-in {
          from { opacity: 0; transform: translateY(20px) scale(.85); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </button>
  );
}
