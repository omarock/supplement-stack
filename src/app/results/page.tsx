"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { recommend, Recommendation, Supplement } from "@/lib/supplements";
import { iherbLink, IHERB_HOME } from "@/lib/iherb";

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
  morning: "Morning", midday: "Midday", "pre-train": "Pre-train", evening: "Evening",
};
const TIMING_GLYPH: Record<Supplement["timing"], string> = {
  morning: "☀", midday: "✦", "pre-train": "↺", evening: "☾",
};
const TIMING_COLOR: Record<Supplement["timing"], string> = {
  morning: th.burgundy, midday: "#a87a52", "pre-train": th.sage, evening: th.sageDeep,
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
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: th.inkSoft, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ ...S, fontSize: 28, color, letterSpacing: "-0.02em" }}>
          {score}<span style={{ fontSize: 12, color: th.inkMute, ...MM }}>/100</span>
        </span>
      </div>
      <div style={{ height: 5, background: th.bgWarm, borderRadius: 5, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, background: color,
          borderRadius: 5, animation: "phyla-bar 1.4s ease-out",
        }} />
      </div>
    </div>
  );
}

function BottleSvg({ hue, label }: { hue: string; label: string }) {
  return (
    <svg width="50" height="76" viewBox="0 0 64 98">
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

  if (loaded && !data) {
    return (
      <div style={{
        minHeight: "100vh", background: th.bg, color: th.ink,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <PhylaLogo />
          <h1 style={{ ...S, fontSize: 52, margin: "40px 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            No ritual yet.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Take the quiz and we&apos;ll compose a personalised supplement stack for you.
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
    return <div style={{ minHeight: "100vh", background: th.bg }} />;
  }

  const byTiming: Record<string, Supplement[]> = { morning: [], midday: [], "pre-train": [], evening: [] };
  for (const s of rec.supplements) byTiming[s.timing].push(s);

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>

      {/* Top bar */}
      <header style={{
        padding: "18px 32px", borderBottom: `1px solid ${th.line}`,
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Hero */}
        <section style={{ marginBottom: 56, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.12em", marginBottom: 12 }}>
            YOUR RITUAL IS READY
          </div>
          <h1 style={{ ...S, fontSize: 64, color: th.ink, margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Your <em style={{ color: th.burgundy }}>personalised</em> stack.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>
            {rec.supplements.length} clean, evidence-led ingredients matched to your goals, lifestyle, and biology — sourced via iHerb.
          </p>
        </section>

        {/* Wellness scores */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <h2 style={{ ...S, fontSize: 32, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
              Your wellness reading
            </h2>
            <span style={{ fontSize: 11, color: th.inkMute, ...MM }}>BASELINE · TODAY</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <ScoreCard label="Energy" score={rec.scores.energy} color={th.burgundy} />
            <ScoreCard label="Sleep" score={rec.scores.sleep} color={th.sage} />
            <ScoreCard label="Recovery" score={rec.scores.recovery} color="#a87a52" />
            <ScoreCard label="Focus" score={rec.scores.focus} color="#688a6b" />
            <ScoreCard label="Stress" score={rec.scores.stress} color="#7a6d92" />
            <ScoreCard label="Mood" score={rec.scores.mood} color={th.burgundy} />
          </div>
        </section>

        {/* Reasoning */}
        {rec.reasoning.length > 0 && (
          <section style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
            padding: 28, marginBottom: 48,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999, background: th.sageGlow,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
                  <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
                  <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
                  <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
                </svg>
              </div>
              <h2 style={{ ...S, fontSize: 24, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
                Why this blend, for you
              </h2>
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.reasoning.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: th.sage, marginTop: 2 }}>✿</span>
                  <span style={{ fontSize: 14, color: th.inkSoft, lineHeight: 1.55 }}>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Safety notes */}
        {rec.notes.length > 0 && (
          <section style={{
            background: "#fff8eb", border: "1px solid rgba(196,148,74,0.30)",
            borderRadius: 16, padding: 22, marginBottom: 48,
          }}>
            <p style={{ fontSize: 11, color: "#a87a52", ...MM, letterSpacing: "0.1em", margin: "0 0 10px" }}>
              ⚠ HEALTH & SAFETY NOTES
            </p>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {rec.notes.map((n, i) => (
                <li key={i} style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.55 }}>· {n}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Stack */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ ...S, fontSize: 32, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
              Your stack
            </h2>
            <span style={{ fontSize: 13, color: th.inkMute, ...MM }}>
              ~${rec.totalMonthlyCost}/mo · {rec.supplements.length} supplements · via iHerb
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {rec.supplements.map((s, i) => (
              <div key={s.id} style={{
                background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
                padding: 22, display: "flex", flexDirection: "column", gap: 12,
                animation: `phyla-rise .5s ${i * 0.06}s ease-out both`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <BottleSvg hue={s.hue} label={s.name.split(" ")[0].toLowerCase()} />
                  <div style={{
                    padding: "4px 10px", borderRadius: 999,
                    background: `${TIMING_COLOR[s.timing]}1f`, color: TIMING_COLOR[s.timing],
                    fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span>{TIMING_GLYPH[s.timing]}</span>{TIMING_LABEL[s.timing]}
                  </div>
                </div>

                <div>
                  <h3 style={{ ...S, fontSize: 24, margin: 0, letterSpacing: "-0.01em", color: th.ink, lineHeight: 1.15 }}>
                    {s.name}
                  </h3>
                  <div style={{ fontSize: 12, color: th.inkMute, ...MM, marginTop: 4 }}>
                    {s.brand.toUpperCase()} · {s.dose}
                  </div>
                </div>

                <p style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.55, margin: 0 }}>{s.why}</p>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: 10, marginTop: "auto",
                  fontSize: 11, color: th.sage, ...MM, letterSpacing: "0.08em",
                }}>
                  <span>{s.evidence.toUpperCase()} EVIDENCE</span>
                  <span style={{ color: th.inkMute }}>~${s.monthlyCost}/MO</span>
                </div>

                <a
                  href={iherbLink(s.iherbSearch)}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 12, marginTop: 4,
                    background: th.ink, color: th.bg, textDecoration: "none",
                    fontSize: 14, fontWeight: 500,
                    transition: "background .2s",
                  }}
                >
                  Shop on iHerb
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Daily routine */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", color: th.ink }}>
            Your daily routine
          </h2>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20, padding: 28,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24,
          }}>
            {(["morning", "midday", "pre-train", "evening"] as const).map(slot => {
              const items = byTiming[slot];
              if (items.length === 0) return null;
              const times: Record<string, string> = {
                morning: "07:30", midday: "13:00", "pre-train": "17:00", evening: "22:00",
              };
              return (
                <div key={slot} style={{ borderLeft: `2px solid ${TIMING_COLOR[slot]}`, paddingLeft: 16 }}>
                  <div style={{ fontSize: 11, ...MM, color: TIMING_COLOR[slot], letterSpacing: "0.06em", marginBottom: 8 }}>
                    {times[slot]} · {TIMING_LABEL[slot].toUpperCase()}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map(s => (
                      <li key={s.id} style={{ fontSize: 13, color: th.ink, lineHeight: 1.4 }}>
                        <span style={{ color: th.inkSoft }}>·</span> {s.name}
                        <span style={{ color: th.inkMute, ...MM, fontSize: 11, marginLeft: 6 }}>{s.dose}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* iHerb CTA */}
        <section style={{
          background: `linear-gradient(135deg, ${th.burgundyDeep}, ${th.burgundy})`,
          borderRadius: 24, padding: 40, textAlign: "center", color: "#fbf6ec",
          marginBottom: 28,
        }}>
          <h2 style={{ ...S, fontSize: 40, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Ready to begin?
          </h2>
          <p style={{ color: "rgba(251,246,236,0.85)", fontSize: 15, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            We&apos;ve curated the exact products on iHerb — quality brands, third-party tested, ships globally.
            New iHerb customers get extra discounts on their first order.
          </p>
          <a href={IHERB_HOME} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "#fbf6ec", color: th.burgundyDeep, textDecoration: "none",
          }}>
            Open my iHerb stack →
          </a>
        </section>

        {/* Disclaimer */}
        <p style={{
          fontSize: 11, color: th.inkMute, lineHeight: 1.6, textAlign: "center",
          maxWidth: 720, margin: "0 auto",
        }}>
          <strong>For informational purposes only. Not medical advice.</strong>{" "}
          Recommendations are educational guidance based on your inputs. Always consult a qualified healthcare professional before starting any supplement regimen, particularly if you have medical conditions, take medications, are pregnant, or are nursing.
          <br /><br />
          <em>Phyla is an iHerb affiliate. We may earn a commission on qualifying purchases made through our links — at no extra cost to you.</em>
        </p>
      </div>
    </div>
  );
}
