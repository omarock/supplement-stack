"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { recommend, Recommendation, Supplement } from "@/lib/supplements";

const th = {
  bg: "#f4ede1", bgWarm: "#ebe3d3", paper: "#fbf6ec",
  ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", sageDeep: "#324d36", sageGlow: "rgba(74,106,78,0.10)",
  burgundy: "#7d2e3a", burgundyDeep: "#5a1f2a",
  line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

const TIMING_LABEL: Record<Supplement["timing"], string> = {
  morning: "Morning",
  midday: "Midday",
  "pre-train": "Pre-train",
  evening: "Evening",
};
const TIMING_GLYPH: Record<Supplement["timing"], string> = {
  morning: "☀",
  midday: "✦",
  "pre-train": "↺",
  evening: "☾",
};
const TIMING_COLOR: Record<Supplement["timing"], string> = {
  morning: th.burgundy,
  midday: "#a87a52",
  "pre-train": th.sage,
  evening: th.sageDeep,
};

function PhylaLogo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <svg width={22} height={22} viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
        <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
        <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
        <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
      </svg>
      <span style={{ ...S, fontSize: 22, color: th.ink, letterSpacing: "-0.01em" }}>phyla</span>
    </Link>
  );
}

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: th.inkSoft, letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ ...S, fontSize: 32, color, letterSpacing: "-0.02em" }}>{score}<span style={{ fontSize: 13, color: th.inkMute, ...MM }}>/100</span></span>
      </div>
      <div style={{ height: 5, background: th.bgWarm, borderRadius: 5, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, background: color,
          borderRadius: 5, animation: "phyla-bar 1.6s ease-out",
        }} />
      </div>
    </div>
  );
}

function BottleSvg({ hue, label, size = 80 }: { hue: string; label: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 64 98">
      <rect x="25" y="4" width="14" height="8" rx="1.5" fill={th.sage} />
      <rect x="22" y="11" width="20" height="4" fill={th.sage} opacity="0.85" />
      <path d="M14 18 Q14 16 16 16 L48 16 Q50 16 50 18 L50 90 Q50 94 46 94 L18 94 Q14 94 14 90 Z" fill={hue} />
      <rect x="18" y="42" width="28" height="38" rx="3" fill={th.paper} opacity="0.94" />
      <text x="32" y="60" textAnchor="middle" fill={th.ink} fontFamily="Instrument Serif" fontSize="10" fontStyle="italic">
        {label}
      </text>
      <line x1="22" y1="68" x2="42" y2="68" stroke={th.sage} strokeWidth="0.4" />
      <text x="32" y="74" textAnchor="middle" fill={th.sage} fontFamily="Inter" fontSize="3.5" letterSpacing="1.5">PHYLA</text>
    </svg>
  );
}

export default function ResultsPage() {
  const [data, setData] = useState<QuizData | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizData;
        setData(parsed);
        setRec(recommend(parsed));
      } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  // No quiz data — prompt to take quiz
  if (loaded && !data) {
    return (
      <div style={{
        minHeight: "100vh", background: th.bg, color: th.ink,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <PhylaLogo />
          <h1 style={{ ...S, fontSize: 52, margin: "40px 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            No ritual yet.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Take the 60-second quiz and we&apos;ll compose a personalised supplement stack for you.
          </p>
          <Link href="/quiz" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 500,
            background: th.burgundy, color: "#fbf6ec", textDecoration: "none",
          }}>
            Begin your analysis →
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded || !rec || !data) {
    return (
      <div style={{ minHeight: "100vh", background: th.bg }} />
    );
  }

  // Group supplements by timing
  const byTiming: Record<string, Supplement[]> = { morning: [], midday: [], "pre-train": [], evening: [] };
  for (const s of rec.supplements) byTiming[s.timing].push(s);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>

      {/* Top bar */}
      <header style={{
        padding: "20px 32px", borderBottom: `1px solid ${th.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `${th.bg}cc`, backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <PhylaLogo />
        <Link href="/quiz" style={{
          fontSize: 13, color: th.inkMute, textDecoration: "none",
          padding: "8px 14px", borderRadius: 999, border: `1px solid ${th.line}`,
        }}>
          Retake quiz
        </Link>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Hero */}
        <section style={{ marginBottom: 72, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.12em", marginBottom: 16 }}>
            YOUR RITUAL IS READY
          </div>
          <h1 style={{ ...S, fontSize: 72, color: th.ink, margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Your <em style={{ color: th.burgundy }}>personalised</em> stack.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 18, lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
            Composed from {rec.supplements.length} clean, evidence-led ingredients based on your goals, lifestyle, and biology.
          </p>
        </section>

        {/* Wellness scores */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ ...S, fontSize: 36, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
              Your wellness reading
            </h2>
            <span style={{ fontSize: 12, color: th.inkMute, ...MM }}>baseline · updated today</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <ScoreCard label="Energy" score={rec.scores.energy} color={th.burgundy} />
            <ScoreCard label="Sleep" score={rec.scores.sleep} color={th.sage} />
            <ScoreCard label="Recovery" score={rec.scores.recovery} color="#a87a52" />
            <ScoreCard label="Focus" score={rec.scores.focus} color="#688a6b" />
            <ScoreCard label="Stress balance" score={rec.scores.stress} color="#7a6d92" />
          </div>
        </section>

        {/* Reasoning */}
        {rec.reasoning.length > 0 && (
          <section style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 24,
            padding: 32, marginBottom: 64,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999, background: th.sageGlow,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
                  <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
                  <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
                  <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
                </svg>
              </div>
              <h2 style={{ ...S, fontSize: 28, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
                Why this blend, for you
              </h2>
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {rec.reasoning.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: th.sage, marginTop: 2 }}>✿</span>
                  <span style={{ fontSize: 15, color: th.inkSoft, lineHeight: 1.6 }}>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Supplement stack */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ ...S, fontSize: 36, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
              Your stack
            </h2>
            <span style={{ fontSize: 13, color: th.inkMute, ...MM }}>
              ~${rec.totalMonthlyCost}/mo · {rec.supplements.length} supplements
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {rec.supplements.map((s, i) => (
              <div key={s.id} style={{
                background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
                padding: 24, display: "flex", flexDirection: "column", gap: 14,
                animation: `phyla-rise .6s ${i * 0.07}s ease-out both`,
              }}>
                {/* Top: bottle + tag */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <BottleSvg hue={s.hue} label={s.name.split(" ")[0].toLowerCase()} size={56} />
                  <div style={{
                    padding: "4px 12px", borderRadius: 999,
                    background: `${TIMING_COLOR[s.timing]}1f`, color: TIMING_COLOR[s.timing],
                    fontSize: 11, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span>{TIMING_GLYPH[s.timing]}</span>
                    {TIMING_LABEL[s.timing]}
                  </div>
                </div>

                {/* Name + dose */}
                <div>
                  <h3 style={{ ...S, fontSize: 26, margin: 0, letterSpacing: "-0.01em", color: th.ink, lineHeight: 1.1 }}>
                    {s.name}
                  </h3>
                  <div style={{ fontSize: 13, color: th.inkMute, ...MM, marginTop: 4 }}>
                    {s.dose} · {s.purpose}
                  </div>
                </div>

                {/* Why */}
                <p style={{ fontSize: 14, color: th.inkSoft, lineHeight: 1.55, margin: 0 }}>{s.why}</p>

                {/* Footer */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: 14, borderTop: `1px solid ${th.line}`,
                }}>
                  <span style={{ fontSize: 11, color: th.sage, ...MM, letterSpacing: "0.1em" }}>
                    {s.evidence.toUpperCase()} EVIDENCE
                  </span>
                  <span style={{ fontSize: 13, color: th.inkMute, ...MM }}>~${s.monthlyCost}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily routine */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ ...S, fontSize: 36, margin: "0 0 24px", letterSpacing: "-0.02em", color: th.ink }}>
            Your daily routine
          </h2>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 24, padding: 32,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32,
          }}>
            {(["morning", "midday", "pre-train", "evening"] as const).map(slot => {
              const items = byTiming[slot];
              if (items.length === 0) return null;
              const slotTimes: Record<string, string> = {
                morning: "07:30", midday: "13:00", "pre-train": "17:00", evening: "22:00",
              };
              return (
                <div key={slot} style={{ borderLeft: `2px solid ${TIMING_COLOR[slot]}`, paddingLeft: 18 }}>
                  <div style={{ fontSize: 12, ...MM, color: TIMING_COLOR[slot], letterSpacing: "0.05em", marginBottom: 8 }}>
                    {slotTimes[slot]} · {TIMING_LABEL[slot].toUpperCase()}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map(s => (
                      <li key={s.id} style={{ fontSize: 14, color: th.ink, lineHeight: 1.4 }}>
                        <span style={{ color: th.inkSoft }}>·</span> {s.name}
                        <span style={{ color: th.inkMute, ...MM, fontSize: 12, marginLeft: 6 }}>{s.dose}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA section */}
        <section style={{
          background: `linear-gradient(135deg, ${th.burgundyDeep}, ${th.burgundy})`,
          borderRadius: 24, padding: 48, textAlign: "center", color: "#fbf6ec",
          marginBottom: 32,
        }}>
          <h2 style={{ ...S, fontSize: 44, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Ready to begin?
          </h2>
          <p style={{ color: "rgba(251,246,236,0.85)", fontSize: 16, marginBottom: 24, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            Source your stack from any quality retailer. We&apos;ll soon offer curated bundles delivered to your door.
          </p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "#fbf6ec", color: th.burgundyDeep, textDecoration: "none",
          }}>
            Explore the journal →
          </Link>
        </section>

        {/* Disclaimer */}
        <p style={{
          fontSize: 12, color: th.inkMute, lineHeight: 1.6, textAlign: "center",
          maxWidth: 620, margin: "0 auto",
        }}>
          <strong>For informational purposes only. Not medical advice.</strong>{" "}
          The recommendations above are educational guidance based on your inputs.
          Always consult a healthcare professional before starting any supplement regimen,
          especially if you have medical conditions, take medications, or are pregnant or nursing.
        </p>
      </div>
    </div>
  );
}
