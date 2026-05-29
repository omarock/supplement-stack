"use client";

import { useEffect, useState } from "react";
import { FONTS } from "@/lib/theme";

const MM = { fontFamily: FONTS.mono } as const;

interface Props {
  /** Phrases to cycle through. Cycles forward, stays on the last one. */
  phrases: string[];
  /** Milliseconds between phrase changes. */
  interval?: number;
  /** Optional className for the wrapper. */
  className?: string;
  /** Size variant. */
  size?: "sm" | "md";
  /** Hide the spinner dot — text-only. */
  noDot?: boolean;
}

/**
 * Premium loading-state component that cycles through status phrases
 * during async operations. Better than "Loading…" — gives the user a sense
 * that real work is happening.
 */
export default function ThinkingMessages({ phrases, interval = 800, size = "md", noDot = false }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => Math.min(i + 1, phrases.length - 1));
    }, interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  const fontSize = size === "sm" ? 12.5 : 13.5;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      ...MM, fontSize, fontWeight: 500,
    }}>
      {!noDot && (
        <span style={{
          width: 12, height: 12, borderRadius: 999,
          border: "2px solid currentColor", borderTopColor: "transparent",
          animation: "sd-spin 0.7s linear infinite",
          flexShrink: 0,
        }} />
      )}
      <span
        key={index}
        style={{
          animation: "sd-thinking-in .35s ease-out",
          letterSpacing: "0.01em",
        }}
      >
        {phrases[index]}
      </span>
      <style>{`
        @keyframes sd-thinking-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </span>
  );
}

// Pre-built phrase sets for the most common operations
export const PHRASES = {
  audit: [
    "Reading your stack…",
    "Cross-referencing 151 ingredients…",
    "Checking for interactions…",
    "Detecting redundancies…",
    "Composing recommendations…",
  ],
  generateStack: [
    "Understanding your goals…",
    "Matching to evidence-led ingredients…",
    "Balancing your budget…",
    "Composing your stack…",
  ],
  chat: [
    "Thinking…",
    "Reading the research…",
  ],
};
