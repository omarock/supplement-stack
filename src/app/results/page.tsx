"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import type { Recommendation, Supplement } from "@/lib/supplements";
import { trackQuizSubmission } from "@/lib/track";
// Lazy-loaded so its products.ts (~360KB) dependency is code-split out of the
// initial /results bundle and fetched after the shell paints (mobile LCP/TTI win).
const SupplementGrid = dynamic(() => import("@/components/SupplementGrid"), { ssr: false });
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

import SuppdocLogo, { SDMark } from "@/components/SuppdocLogo";

function ScoreCard({ label, score, color }: { label: string; score: number; color: string }) {
  // "Reach X with your stack": close ~45% of the gap to 100. Aspirational, and it
  // nudges the user to actually take (and track) the stack to get there.
  const projected = Math.min(100, score + Math.round((100 - score) * 0.45));
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
        <span style={{ fontSize: 11, color: th.inkSoft, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        <span style={{ ...S, fontSize: 30, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {score}<span style={{ fontSize: 12, color: th.inkMute, ...MM }}>/100</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 7, background: th.bgWarm, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${projected}%`, background: `${color}2e`, borderRadius: 999 }} />
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: `${score}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 999,
          boxShadow: `0 1px 4px ${color}55`, animation: "phyla-bar 1.4s cubic-bezier(.2,.7,.2,1)",
        }} />
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: th.sageDeep, fontWeight: 600 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        <span>Reach <span style={{ color }}>{projected}</span> with your stack</span>
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
    if (!saved) { setLoaded(true); return; }
    let cancelled = false;
    (async () => {
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
        // Dynamic import keeps supplements.ts (~270KB) out of the initial bundle;
        // the effect runs after hydration anyway, so the engine loads on demand.
        const { recommend } = await import("@/lib/supplements");
        if (cancelled) return;
        setData(safeData);
        const r = recommend(safeData);
        setRec(r);
        // Fire-and-forget: log this quiz submission to Supabase (once per session)
        const submissionKey = `phylaSubmitted:${JSON.stringify(safeData).slice(0, 60)}`;
        if (!sessionStorage.getItem(submissionKey)) {
          sessionStorage.setItem(submissionKey, "1");
          trackQuizSubmission(safeData, r).catch(() => { /* silent */ });
          track("quiz_complete", { supplements: r.supplements.length, cost: r.totalMonthlyCost });
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
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

      {/* No duplicate brand bar here, SiteHeader above already provides the logo
          + nav. "Retake quiz" lives in the hero below. */}

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
          <div style={{ marginTop: 22 }}>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 999,
              border: `1px solid ${th.line}`, background: th.paper, color: th.inkSoft,
              fontSize: 13.5, fontWeight: 500, textDecoration: "none",
            }}>↻ Retake quiz</Link>
          </div>
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
          <EmailCapture source="quiz-results" headline="Get evidence-led updates" sub="Join the list and we'll send occasional, no-hype updates so you can pick up where you left off. No spam, unsubscribe anytime." tone="dark" />
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
                <SDMark size={18} />
              </div>
              <h2 style={{ ...S, fontSize: 24, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
                Why this blend, for you
              </h2>
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {rec.reasoning.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: th.sage, marginTop: 2, fontWeight: 700 }}>✓</span>
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
            <p style={{ fontSize: 11, color: "var(--c-amber-deep)", ...MM, letterSpacing: "0.1em", margin: "0 0 10px" }}>
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

        {/* Quality + value close: reinforce WHY the stack is trustworthy (shows the
            quality of the platform) and drive the high-value next step, tracking,
            which leads to Premium, instead of a generic iHerb-homepage link. The
            per-item buy buttons above remain the affiliate path. */}
        <section style={{
          background: `linear-gradient(135deg, ${th.burgundyDeep}, ${th.burgundy})`,
          borderRadius: 24, padding: 40, textAlign: "center", color: "#ffffff",
          marginBottom: 28,
        }}>
          <h2 style={{ ...S, fontSize: 40, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            A stack you can <span style={{ fontStyle: "italic" }}>actually trust</span>.
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 22px", maxWidth: 640, margin: "0 auto 22px" }}>
            {["Evidence-graded", "No house brand", "Linked to its source", "Third-party-tested brands"].map(q => (
              <span key={q} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "rgba(251,246,236,0.92)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.sage} strokeWidth="2.6"><path d="M5 12l5 5 9-11" /></svg>{q}
              </span>
            ))}
          </div>
          <p style={{ color: "rgba(251,246,236,0.78)", fontSize: 14.5, marginBottom: 24, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            A stack only works if you take it. Track every dose, watch your wellness scores climb, and keep what works.
          </p>
          <Link href="/track" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 30px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "var(--c-surface)", color: th.burgundyDeep, textDecoration: "none",
          }}>
            Track my stack, free →
          </Link>
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
