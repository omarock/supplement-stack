"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuizData } from "@/types/quiz";

const th = {
  bg: "#f4ede1", paper: "#fbf6ec",
  ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", sageGlow: "rgba(74,106,78,0.10)",
  burgundy: "#7d2e3a", line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: "var(--font-serif)", fontWeight: 400 } as const;
const MM = { fontFamily: "var(--font-mono)" } as const;

export default function ResultsPage() {
  const [data, setData] = useState<QuizData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizData");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg,
      fontFamily: "var(--font-sans)", color: th.ink,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <svg width="60" height="60" viewBox="0 0 24 24" style={{ animation: "phyla-sway 4s ease-in-out infinite" }}>
            <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
            <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
            <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
            <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
          </svg>
        </div>

        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          YOUR RITUAL IS READY
        </div>

        <h1 style={{ ...S, fontSize: 60, color: th.ink, margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Almost there.
        </h1>

        <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, marginBottom: 48 }}>
          Your personalized supplement ritual is being built. The full AI-powered results page is coming in the next phase of development.
        </p>

        {/* Quiz summary */}
        {data && (
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`,
            borderRadius: 24, padding: 32, marginBottom: 32, textAlign: "left",
          }}>
            <p style={{ fontSize: 12, color: th.inkMute, ...MM, letterSpacing: "0.1em", margin: "0 0 16px" }}>
              QUIZ SAVED — PROFILE SUMMARY
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Age", data.age],
                ["Biological sex", data.gender],
                ["Goals", data.goals.join(", ") || "—"],
                ["Sleep", `${data.sleep}/5`],
                ["Stress", `${data.stress}/5`],
                ["Energy", `${data.energy}/5`],
                ["Exercise", data.workoutFreq],
                ["Diet", data.diet],
                ["Budget", data.budget],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 14 }}>
                  <span style={{ color: th.inkMute }}>{label}</span>
                  <span style={{ color: th.ink, fontWeight: 500, textAlign: "right" }}>{value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/quiz" style={{
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 500,
            border: `1.5px solid ${th.line}`, background: "transparent", color: th.ink,
            textDecoration: "none", cursor: "pointer",
          }}>
            ← Redo quiz
          </Link>
          <Link href="/" style={{
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 500,
            background: th.burgundy, color: "#fbf6ec",
            textDecoration: "none", cursor: "pointer",
          }}>
            Back to home
          </Link>
        </div>

        <p style={{ fontSize: 12, color: th.inkMute, marginTop: 32, lineHeight: 1.6 }}>
          For informational purposes only. Not medical advice. Consult a healthcare professional before starting any supplement regimen.
        </p>
      </div>
    </div>
  );
}
