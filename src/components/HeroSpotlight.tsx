"use client";

import { useEffect, useState } from "react";
import { TH, FONTS } from "@/lib/theme";

const STORAGE_KEY = "suppdoc.spotlightSeen.v1";
const MM = { fontFamily: FONTS.mono } as const;

/**
 * First-visit "Start here" cue. Renders a subtle floating caption pointing
 * to the recommended Quiz card, plus injects a one-shot pulse animation
 * on the .sd-service-featured element. Dismisses on any click and never
 * shows again (localStorage flag).
 */
export default function HeroSpotlight() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch { /* ignore */ }

    // Delay so the page has time to settle
    const t = setTimeout(() => setVisible(true), 1400);

    const dismiss = () => {
      setVisible(false);
      try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
      window.removeEventListener("click", dismiss);
      window.removeEventListener("scroll", dismiss, { capture: true });
    };

    // Auto-dismiss after 5 seconds or on first interaction
    const autoDismiss = setTimeout(dismiss, 5500);
    window.addEventListener("click", dismiss);
    window.addEventListener("scroll", dismiss, { capture: true, passive: true });

    return () => {
      clearTimeout(t);
      clearTimeout(autoDismiss);
      window.removeEventListener("click", dismiss);
      window.removeEventListener("scroll", dismiss, { capture: true });
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Pulse glow on the featured card, uses the class we already attach */}
      <style>{`
        .sd-service-featured {
          animation: sd-spotlight-pulse 1.6s ease-in-out 2 !important;
        }
        @keyframes sd-spotlight-pulse {
          0%, 100% { box-shadow: 0 1px 3px rgba(10,37,64,0.05), 0 14px 38px rgba(91,163,115,0.18); }
          50% { box-shadow: 0 1px 3px rgba(10,37,64,0.05), 0 0 0 6px rgba(91,163,115,0.18), 0 14px 50px rgba(91,163,115,0.35); }
        }
        @keyframes sd-spotlight-in {
          from { opacity: 0; transform: translateY(8px) scale(.92); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Subtle floating caption (fades after 5s) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed", zIndex: 70,
          left: "50%", top: "var(--spotlight-top)",
          transform: "translateX(-50%)",
          padding: "9px 16px 9px 12px",
          background: TH.ink, color: TH.surface,
          borderRadius: 999,
          fontSize: 13, fontWeight: 500,
          boxShadow: "0 14px 36px rgba(10,37,64,0.28)",
          display: "inline-flex", alignItems: "center", gap: 8,
          animation: "sd-spotlight-in .35s cubic-bezier(.2,.7,.2,1) both",
          pointerEvents: "none",
        }}
      >
        <span aria-hidden style={{
          background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
          color: TH.surface, borderRadius: 999, padding: "1px 7px",
          fontSize: 10, fontWeight: 700, ...MM, letterSpacing: "0.05em",
        }}>👋</span>
        <span>New here? Start with the quiz.</span>

        <style>{`
          :root {
            --spotlight-top: 92px;
          }
          @media (max-width: 640px) {
            :root {
              --spotlight-top: 78px;
            }
          }
        `}</style>
      </div>
    </>
  );
}
