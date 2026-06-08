"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { recommend, Recommendation, Supplement } from "@/lib/supplements";
import { IHERB_HOME } from "@/lib/iherb";
import { trackQuizSubmission } from "@/lib/track";
import SupplementGrid from "@/components/SupplementGrid";
import TrackStackCTA from "@/components/TrackStackCTA";
import EmailCapture from "@/components/EmailCapture";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { track } from "@/lib/analytics";

// ─── Theme ───────────────────────────────────────────────────────────────────
const th = {
  bg: "var(--c-bg)", bgWarm: "var(--c-bg)", paper: "var(--c-surface)",
  ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageDeep: "var(--c-sage-deep)", sageGlow: "var(--c-accent-glow)",
  burgundy: "var(--c-ink-bg)", burgundyDeep: "var(--c-ink-bg)",
  line: "var(--c-edge)",
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

import SuppdocLogo from "@/components/SuppdocLogo";

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

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [data, setData] = useState<QuizData | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const safeData: QuizData = {
          age: "", gender: "", height: "", weight: "",
          goals: [],
          sleep: 0, sleepHours: "", sleepIssues: [],
          stress: 0, mood: 0, mindConcerns: [],
          energy: 0, afternoonCrash: "",
          workoutFreq: "", workoutType: "",
          diet: "", caffeine: "", alcohol: "",
          bodyConcerns: [],
          pregnant: "", allergies: [], conditions: [],
          budget: "", veganOnly: false,
          ...parsed,
        };
        setData(safeData);
        const r = recommend(safeData);
        setRec(r);
        // Fire-and-forget: log this quiz submission to Supabase
        // Only log once per quiz session
        const submissionKey = `phylaSubmitted:${JSON.stringify(safeData).slice(0, 60)}`;
        if (!sessionStorage.getItem(submissionKey)) {
          sessionStorage.setItem(submissionKey, "1");
          trackQuizSubmission(safeData, r).catch(() => { /* silent */ });
          track("quiz_complete", { supplements: r.supplements.length, cost: r.totalMonthlyCost });
        }
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
          <SuppdocLogo size={20} />
          <h1 style={{ ...S, fontSize: 52, margin: "40px 0 16px", letterSpacing: "-0.03em", lineHeight: 1 }}>
            No ritual yet.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Take the quiz and we&apos;ll compose a personalised supplement stack for you.
          </p>
          <Link href="/quiz" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 500,
            background: th.burgundy, color: "#ffffff", textDecoration: "none",
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
      <SiteHeader />

      {/* Top bar */}
      <header style={{
        padding: "18px 32px", borderBottom: `1px solid ${th.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `${th.bg}cc`, backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <SuppdocLogo size={20} />
        <Link href="/quiz" style={{
          fontSize: 13, color: th.inkMute, textDecoration: "none",
          padding: "8px 14px", borderRadius: 999, border: `1px solid ${th.line}`,
        }}>
          Retake quiz
        </Link>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Hero */}
        <section style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: th.sage, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 14 }}>
            YOUR RITUAL IS READY
          </div>
          <h1 style={{
            fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
            fontWeight: 600, fontSize: 68, color: th.ink,
            margin: "0 0 14px", letterSpacing: "-0.035em", lineHeight: 1,
          }}>
            Your personalised <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: "italic", fontWeight: 400, color: th.sageDeep }}>stack</span>.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 18, lineHeight: 1.55, maxWidth: 580, margin: "0 auto" }}>
            {rec.supplements.length} bestseller-grade ingredients matched to your goals, lifestyle, and biology, from top-rated, third-party-tested brands.
          </p>
        </section>

        {/* ─── Wellness reading (before the stack) ─── */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{
              fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600,
              fontSize: 32, margin: 0, letterSpacing: "-0.025em", color: th.ink,
            }}>
              Your wellness reading
            </h2>
            <span style={{ fontSize: 11, color: th.inkMute, ...MM, letterSpacing: "0.05em" }}>BASELINE · TODAY</span>
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

        {/* ─── Stack ─── */}
        <section style={{ marginBottom: 28 }}>
          <SupplementGrid
            supplements={rec.supplements}
            source="results"
            title="Your stack"
            showTotalCost
          />
        </section>

        {/* WOW → HOOK: turn this stack into the daily tracking loop */}
        <section style={{ marginBottom: 64 }}>
          <TrackStackCTA
            stackName="My quiz stack"
            stackIds={rec.supplements.map(s => s.id)}
            source="results"
          />
        </section>

        {/* Email capture, after the user has their stack */}
        <section style={{ marginBottom: 56 }}>
          <EmailCapture source="quiz-results" headline="Want your stack emailed to you?" sub="Get your personalised stack plus a short weekly evidence brief. No spam, unsubscribe anytime." tone="dark" />
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
          borderRadius: 24, padding: 40, textAlign: "center", color: "#ffffff",
          marginBottom: 28,
        }}>
          <h2 style={{ ...S, fontSize: 40, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Ready to shop your stack?
          </h2>
          <p style={{ color: "rgba(251,246,236,0.85)", fontSize: 15, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            Use the buy buttons on each item above to pick your preferred retailer, most are available on iHerb and Amazon, and ship globally. New iHerb customers get a first-order discount.
          </p>
          <a href={IHERB_HOME} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "var(--c-surface)", color: th.burgundyDeep, textDecoration: "none",
          }}>
            Browse iHerb →
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
          <em>suppdoc.io is an affiliate of iHerb, Amazon and other trusted retailers. We may earn a commission on qualifying purchases made through our links, at no extra cost to you.</em>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
