"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSpotlight from "@/components/HeroSpotlight";
import { TH, FONTS, D, SI, MM } from "@/lib/theme";
import { STACKS } from "@/lib/stacks";

// ════════════════════════════════════════════════════════════════════════════
// Motion primitives
// ════════════════════════════════════════════════════════════════════════════

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

function Reveal({ children, delay = 0, y = 24, style }: {
  children: React.ReactNode; delay?: number; y?: number; style?: CSSProperties;
}) {
  const { ref, seen } = useInView();
  return (
    <div ref={ref} style={{
      ...style,
      transform: seen ? "none" : `translateY(${y}px)`,
      opacity: seen ? 1 : 0,
      transition: `opacity .9s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      willChange: "transform, opacity",
    }}>{children}</div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Hero
// ════════════════════════════════════════════════════════════════════════════

const GOAL_CHIPS = ["Sleep", "Energy", "Focus", "Stress", "Muscle Growth", "Longevity"];

// Real, verifiable platform numbers (no fabrication) for the proof strip.
const FACTS: { value: number | null; display?: string; suffix?: string; label: string }[] = [
  { value: 151, suffix: "", label: "researched ingredients" },
  { value: 107, suffix: "+", label: "studies cited" },
  { value: 148, suffix: "+", label: "interactions mapped" },
  { value: null, display: "$0", label: "to get started" },
];

/** Animated count-up that ALWAYS lands on the real value. Triggers on mount and
 *  has a non-rAF fallback so the number is correct even if rAF is throttled
 *  (background tab) or motion is reduced. It must never get stuck showing 0. */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    const reduce = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(to); return; }
    let raf = 0;
    const dur = 1100;
    const start = performance.now();
    setN(0);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const fallback = setTimeout(() => setN(to), dur + 200); // guarantees final value
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [to]);
  return <>{n.toLocaleString()}{suffix}</>;
}

/** Premium proof counters: high-contrast numbers on white cells with hairline dividers. */
function StatStrip() {
  return (
    <div role="list" aria-label="Platform facts" style={{
      display: "grid", gridTemplateColumns: "var(--facts-cols)", gap: 1,
      background: TH.edge, border: `1px solid ${TH.edge}`, borderRadius: 16, overflow: "hidden",
      boxShadow: "0 1px 2px rgba(10,37,64,0.04)",
    }}>
      {FACTS.map(f => (
        <div key={f.label} role="listitem" style={{
          background: TH.surface, padding: "15px 10px", textAlign: "center",
          display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ ...D, fontSize: 27, color: TH.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {f.display ?? <Counter to={f.value!} suffix={f.suffix} />}
          </div>
          <div style={{ ...MM, fontSize: 9.5, color: TH.muted, letterSpacing: "0.03em", lineHeight: 1.3, textTransform: "uppercase" }}>
            {f.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  function toggleChip(chip: string) {
    setPicked(prev => {
      const next = prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip];
      // Mirror chips into the input unless the user typed something custom
      if (goal === "" || goal === prev.join(", ")) setGoal(next.join(", "));
      return next;
    });
  }

  // Primary action = the Build Stack flow, deliberately INDEPENDENT from the
  // quiz. It only ever routes to /build (with the goal pre-filled) and never
  // touches /quiz or any quiz state, so users are never dropped into a quiz.
  function generateStack() {
    const finalGoal = (goal.trim() || picked.join(", ")).trim();
    track("home_goal_build", { hasGoal: finalGoal.length > 0, chips: picked.length });
    router.push(finalGoal ? `/build?goal=${encodeURIComponent(finalGoal)}` : "/build");
  }

  // Intent-specific CTA label: when one goal is chosen, name it.
  const primaryGoal = picked.length === 1 ? picked[0].toLowerCase() : null;
  const ctaLabel = primaryGoal ? `Generate my free ${primaryGoal} stack` : "Generate my free stack";

  const arrow = (c: string, s = 12) => (
    <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8m-3-3l3 3-3 3" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <section id="engine" style={{ position: "relative", padding: "var(--hh-pad-y) var(--hero-pad-x) var(--hh-pad-b)" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        {/* Centered intro: honest badge + headline + subhead */}
        <div style={{ textAlign: "center" }}>
          <Reveal>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 18,
              padding: "6px 15px 6px 7px", background: TH.surface,
              border: `1px solid ${TH.edgeStrong}`, borderRadius: 999, boxShadow: `0 2px 6px ${TH.ink}0f`,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999, background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 2px 5px ${TH.sage}66`,
              }} aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2 2 0 0 1 6 4h13v15H6a2 2 0 0 0-2 2z" />
                  <path d="M8 8h7M8 11.5h7" />
                </svg>
              </span>
              <span style={{ fontSize: 12.5, color: TH.ink, fontWeight: 600, letterSpacing: "-0.005em" }}>
                Evidence-graded <span style={{ color: TH.muted, fontWeight: 400 }}>· every claim cited · no house brand</span>
              </span>
            </div>
          </Reveal>

          <h1 style={{ ...D, fontWeight: 500, fontSize: "var(--hh-h1)", lineHeight: 1.02, letterSpacing: "-0.04em", color: TH.ink, margin: 0 }}>
            The supplement stack{" "}
            <span style={{ ...SI, color: TH.sageDeep, letterSpacing: "-0.01em" }}>built for you</span>.
          </h1>
          <Reveal delay={0.1}>
            <p style={{ fontSize: "var(--hh-sub)", lineHeight: 1.45, color: TH.inkSoft, maxWidth: 460, margin: "14px auto 0" }}>
              Tell us your goal. Our evidence-graded AI builds your stack from 151 researched ingredients, and tells you what to{" "}
              <span style={{ ...SI, color: TH.sageDeep }}>skip</span>.
            </p>
          </Reveal>
        </div>

        {/* Goal box, the primary action */}
        <Reveal delay={0.15}>
          <div style={{
            marginTop: 22, background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: 18,
            boxShadow: "0 2px 4px rgba(10,37,64,0.04), 0 18px 40px -20px rgba(10,37,64,0.2)",
          }}>
            <div style={{ ...MM, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: TH.mutedDim, marginBottom: 9 }}>
              What do you want to improve?
            </div>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={1}
              placeholder="better sleep and steadier energy…"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateStack(); } }}
              style={{
                width: "100%", boxSizing: "border-box", border: "none", outline: "none", resize: "none",
                fontFamily: FONTS.body, fontSize: 16, lineHeight: 1.4, color: TH.ink, background: "transparent", minHeight: 26,
              }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
              {GOAL_CHIPS.map(chip => {
                const on = picked.includes(chip);
                return (
                  <button key={chip} type="button" onClick={() => toggleChip(chip)} style={{
                    height: 30, padding: "0 13px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${on ? TH.sage : TH.edgeStrong}`,
                    background: on ? TH.accentGlow : "transparent",
                    color: on ? TH.sageDeep : TH.inkSoft, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: on ? 600 : 500,
                    transition: "all .15s",
                  }}>{chip}</button>
                );
              })}
            </div>
            <button type="button" onClick={generateStack} style={{
              marginTop: 14, width: "100%", height: 54, border: "none", borderRadius: 999, cursor: "pointer",
              background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
              fontFamily: FONTS.body, fontWeight: 600, fontSize: 15.5, letterSpacing: "-0.01em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              boxShadow: `0 1px 0 rgba(255,255,255,.25) inset, 0 12px 24px -6px ${TH.sage}99`,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.4 4.2 4.1 1.3-4.1 1.3L8 12.5l-1.4-4.2-4.1-1.3 4.1-1.3L8 1.5z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
              {ctaLabel}
            </button>
            <div style={{ textAlign: "center", marginTop: 9, ...MM, fontSize: 9.5, letterSpacing: "0.04em", color: TH.muted }}>
              FREE · NO SIGNUP · NO CARD
            </div>
          </div>
        </Reveal>

        {/* Premium proof counters */}
        <Reveal delay={0.2} style={{ marginTop: 18 }}>
          <StatStrip />
        </Reveal>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 2px 14px" }}>
          <span style={{ flex: 1, height: 1, background: TH.edge }} />
          <span style={{ ...MM, fontSize: 9.5, letterSpacing: "0.07em", textTransform: "uppercase", color: TH.mutedDim }}>or choose a path</span>
          <span style={{ flex: 1, height: 1, background: TH.edge }} />
        </div>

        {/* Numbered premium paths. Quiz = recommended; Audit (the moat) second. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PathCard
            num="01" href="/quiz" recommended badge="Recommended · Free"
            title="Take the AI quiz" meta="3 MIN · THE MOST ACCURATE, PERSONALIZED PATH"
            note="Answer a few questions, get a free stack matched to how you sleep, train, and feel."
            icon={<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.4 4.2 4.1 1.3-4.1 1.3L8 12.5l-1.4-4.2-4.1-1.3 4.1-1.3L8 1.5z" stroke={TH.sageDeep} strokeWidth="1.4" strokeLinejoin="round" /></svg>}
            arrow={arrow}
          />
          <PathCard
            num="02" href="/audit" badge="New"
            title="Audit what I already take" meta="SCORE INTERACTIONS, DOSES & GAPS · FREE · 2 MIN"
            note="Already have a routine? Check if it's optimized, paste your stack or your labs."
            icon={<svg width="17" height="17" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={TH.inkSoft} strokeWidth="1.4" /><path d="M10.5 10.5l3 3" stroke={TH.inkSoft} strokeWidth="1.6" strokeLinecap="round" /></svg>}
            arrow={arrow}
          />
          <PathCard
            num="03" href="/build"
            title="Build it myself" meta="BROWSE 151 INGREDIENTS · NO QUIZ"
            icon={<svg width="17" height="17" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="5" height="5" rx="1" stroke={TH.inkSoft} strokeWidth="1.4" /><rect x="8.5" y="2.5" width="5" height="5" rx="1" stroke={TH.inkSoft} strokeWidth="1.4" /><rect x="2.5" y="8.5" width="5" height="5" rx="1" stroke={TH.inkSoft} strokeWidth="1.4" /><rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke={TH.inkSoft} strokeWidth="1.4" /></svg>}
            arrow={arrow}
          />
        </div>

        <div style={{ marginTop: 18, textAlign: "center", ...MM, fontSize: 10, letterSpacing: "0.03em", color: TH.muted }}>
          Free · no card · <span style={{ color: TH.sageDeep, fontWeight: 500 }}>we don&apos;t sell supplements</span>
        </div>
      </div>

      <style>{`
        :root { --hh-pad-y: 22px; --hh-pad-b: 56px; --hh-h1: 48px; --hh-sub: 16px; --facts-cols: repeat(4, 1fr); }
        @media (max-width: 1024px) { :root { --hh-pad-y: 14px; --hh-pad-b: 44px; --hh-h1: 42px; } }
        @media (max-width: 640px)  { :root { --hh-pad-y: 6px; --hh-pad-b: 36px; --hh-h1: 33px; --hh-sub: 14.5px; --facts-cols: repeat(2, 1fr); } }
      `}</style>
    </section>
  );
}

function PathCard({ num, href, recommended = false, badge, title, meta, note, icon, arrow }: {
  num?: string; href: string; recommended?: boolean; badge?: string; title: string; meta: string;
  note?: string; icon: React.ReactNode; arrow: (c: string, s?: number) => React.ReactNode;
}) {
  return (
    <Link href={href} className="sd-path" style={{
      display: "flex", alignItems: recommended ? "flex-start" : "center", gap: 13, textDecoration: "none", color: "inherit",
      background: recommended ? `linear-gradient(180deg, ${TH.sage}0f, ${TH.surface} 55%)` : TH.surface,
      border: `${recommended ? 1.5 : 1}px solid ${recommended ? TH.sage + "80" : TH.edge}`,
      borderRadius: 15, padding: recommended ? "15px 15px" : "13px 14px",
      boxShadow: recommended ? `0 2px 4px rgba(10,37,64,0.04), 0 14px 30px -18px ${TH.sage}99` : "0 1px 2px rgba(10,37,64,0.04)",
      transition: "transform .14s, box-shadow .14s, border-color .14s",
    }}>
      <span style={{
        width: recommended ? 42 : 38, height: recommended ? 42 : 38, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: recommended ? TH.accentGlow : TH.bg,
        marginTop: recommended ? 1 : 0,
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: recommended ? 4 : 3 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontSize: recommended ? 15.5 : 14.5, fontWeight: 600, color: TH.ink, letterSpacing: "-0.01em" }}>
          {title}
          {badge && <span style={{
            ...MM, fontSize: 8.5, fontWeight: 600,
            color: recommended ? "#fff" : TH.sageDeep,
            background: recommended ? TH.sage : TH.accentGlow,
            padding: "2px 7px", borderRadius: 5, letterSpacing: "0.05em", textTransform: "uppercase",
          }}>{badge}</span>}
        </span>
        <span style={{ ...MM, fontSize: 10, color: TH.muted, letterSpacing: "0.02em" }}>
          {num && <span style={{ color: recommended ? TH.sageDeep : TH.inkSoft, fontWeight: 700 }}>{num} · </span>}{meta}
        </span>
        {note && <span style={{ fontSize: 12.5, color: TH.inkSoft, lineHeight: 1.4, marginTop: 1 }}>{note}</span>}
      </span>
      <span style={{
        width: recommended ? 30 : 27, height: recommended ? 30 : 27, borderRadius: 999, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: recommended ? TH.sage : TH.bg,
        boxShadow: recommended ? `0 2px 6px ${TH.sage}73` : "none",
        marginTop: recommended ? 1 : 0,
      }}>{arrow(recommended ? "#fff" : TH.inkSoft, 12)}</span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Trust strip
// ════════════════════════════════════════════════════════════════════════════

function Trust() {
  return (
    <section style={{ padding: "44px var(--section-pad-x)", borderTop: `1px solid ${TH.edge}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontSize: 14, color: TH.muted, margin: "0 0 24px", fontWeight: 500 }}>
            A different kind of supplement company
          </p>
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            flexWrap: "wrap", gap: "16px 28px",
          }}>
            {[
              "We don't sell our own pills",
              "Every pick is explained",
              "Third-party-tested brands",
              "Free · no signup",
            ].map(n => (
              <div key={n} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 15, color: TH.inkSoft, fontWeight: 500,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5">
                  <path d="M5 12l5 5 9-11" />
                </svg>
                {n}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// How it works, 3 cards
// ════════════════════════════════════════════════════════════════════════════

function HowVisual({ which, color }: { which: "intake" | "engine" | "ritual"; color: string }) {
  if (which === "intake") {
    return (
      <div style={{
        height: 130, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}14, ${color}06)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 22,
          background: TH.surface, borderRadius: 10, padding: 13,
          border: `1px solid ${TH.edge}`,
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: `0 8px 20px ${TH.ink}06`,
        }}>
          <div style={{ fontSize: 11, color: TH.muted, fontWeight: 500 }}>How&apos;s your energy?</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Low", "Mid", "High"].map((l, i) => (
              <div key={l} style={{
                flex: 1, padding: "7px 4px", textAlign: "center", borderRadius: 6,
                background: i === 1 ? color : TH.bg,
                color: i === 1 ? "white" : TH.muted, fontSize: 11, fontWeight: 500,
              }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (which === "engine") {
    return (
      <div style={{
        height: 130, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}14, ${color}06)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="110" height="110" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="40" fill="none" stroke={color} strokeWidth="1" opacity="0.3"
            style={{ animation: "sd-spin 12s linear infinite", transformOrigin: "center" }} />
          <circle cx="60" cy="60" r="28" fill="none" stroke={color} strokeWidth="1" opacity="0.5"
            style={{ animation: "sd-spin 8s linear infinite reverse", transformOrigin: "center" }} />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <circle key={i}
              cx={Number((60 + 40 * Math.cos(a * Math.PI / 180)).toFixed(3))}
              cy={Number((60 + 40 * Math.sin(a * Math.PI / 180)).toFixed(3))}
              r="3" fill={color}
              style={{ animation: `sd-pulse 1.8s ease-in-out infinite ${i * 0.2}s` }} />
          ))}
          <circle cx="60" cy="60" r="16" fill={TH.surface} stroke={color} strokeWidth="1.5" />
          <path d="M53 60l5 5 9-11" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div style={{
      height: 130, borderRadius: 14,
      background: `linear-gradient(135deg, ${color}14, ${color}06)`,
      padding: 14, display: "flex", flexDirection: "column", gap: 6,
    }}>
      {[
        ["07:30", "Morning", "#f0b56b"],
        ["17:00", "Pre-train", "#5ba373"],
        ["22:00", "Evening", "#a78bfa"],
      ].map(([time, label, c]) => (
        <div key={time} style={{
          background: TH.surface, borderRadius: 8, padding: "7px 11px",
          display: "flex", alignItems: "center", gap: 10,
          border: `1px solid ${TH.edge}`,
          boxShadow: `0 4px 10px ${TH.ink}04`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: c }} />
          <div style={{ fontSize: 11, color: TH.muted, ...MM }}>{time}</div>
          <div style={{ fontSize: 12, color: TH.ink, fontWeight: 500, flex: 1 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function How() {
  const steps: { tag: string; title: string; body: string; illust: "intake" | "engine" | "ritual"; color: string }[] = [
    { tag: "Step 1", title: "Tell us about you.", body: "A two-minute reflection on how you sleep, train, eat, and feel. No medical jargon, no signup, just you.", illust: "intake", color: TH.sage },
    { tag: "Step 2", title: "We match the evidence.", body: "We match your answers against the published research and clinical dosing guidance behind each ingredient.", illust: "engine", color: TH.amber },
    { tag: "Step 3", title: "Live the ritual.", body: "Your morning, midday, and evening plan, with exact doses, timing, and the reasoning behind every pick.", illust: "ritual", color: TH.coral },
  ];
  return (
    <section id="how-it-works" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 14 }}>
              How it works
            </div>
            <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.02, color: TH.ink, margin: "0 auto", maxWidth: 820 }}>
              Three simple steps to a stack that{" "}
              <span style={{ ...SI, color: TH.sageDeep }}>actually fits.</span>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: "var(--grid-3-gap)" }}>
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div style={{
                background: TH.surface, borderRadius: 22, padding: 30,
                border: `1px solid ${TH.edge}`,
                boxShadow: `0 4px 12px ${TH.ink}05`,
                minHeight: 360, display: "flex", flexDirection: "column", gap: 18,
              }}>
                <HowVisual which={s.illust} color={s.color} />
                <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.tag}</div>
                <h3 style={{ ...D, fontSize: 26, letterSpacing: "-0.02em", color: TH.ink, margin: 0 }}>
                  {s.title}
                </h3>
                <p style={{ color: TH.inkSoft, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Stats
// ════════════════════════════════════════════════════════════════════════════

function Stats() {
  return (
    <section style={{ padding: "32px var(--section-pad-x) 72px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          background: `linear-gradient(135deg, ${TH.sage}10, ${TH.amber}10, ${TH.coral}08)`,
          borderRadius: 22, padding: "48px 36px",
          border: `1px solid ${TH.edge}`,
          display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 30,
        }}>
          {[
            ["150+", "researched ingredients in the library"],
            [`${STACKS.length}`, "ready-made stacks to start from"],
            ["$0", "to use, we never sell our own pills"],
          ].map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.08}>
              <div>
                <div style={{ ...D, fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em", color: TH.ink }}>
                  {n}
                </div>
                <div style={{ marginTop: 10, fontSize: 15, color: TH.inkSoft }}>{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Ingredients
// ════════════════════════════════════════════════════════════════════════════

function Ingredients() {
  const items = [
    { name: "Magnesium Glycinate", pitch: "For deeper sleep and a calmer evening.", c1: "#7eb5d4", c2: "#5d97b8", tag: "Sleep · stress" },
    { name: "Creatine Monohydrate", pitch: "For strength, recovery, and sharper thinking.", c1: "#5ba373", c2: "#3f7a52", tag: "Strength · cognition" },
    { name: "Omega-3 EPA/DHA", pitch: "For heart, brain, and bouncing back from training.", c1: "#f0b56b", c2: "#e8a04a", tag: "Recovery · longevity" },
  ];
  return (
    <section id="ingredients" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginBottom: 48, flexWrap: "wrap", gap: 18,
          }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 12 }}>
                Inside the engine
              </div>
              <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.02, color: TH.ink, margin: 0 }}>
                Only ingredients with the{" "}
                <span style={{ ...SI, color: TH.sageDeep }}>research to back them.</span>
              </h2>
            </div>
            <Link href="/stacks" style={{
              color: TH.ink, fontWeight: 500, fontSize: 15, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Browse {STACKS.length} ready-made stacks <span>→</span>
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 18 }}>
          {items.map((it, i) => (
            <Reveal key={it.name} delay={i * 0.08}>
              <div style={{
                background: TH.surface, borderRadius: 22, padding: 28,
                border: `1px solid ${TH.edge}`,
                boxShadow: `0 4px 12px ${TH.ink}05`,
                minHeight: 300, display: "flex", flexDirection: "column", gap: 16,
              }}>
                <div style={{
                  width: 54, height: 80, borderRadius: 27,
                  background: `linear-gradient(135deg, ${it.c1}, ${it.c2})`,
                  position: "relative", overflow: "hidden",
                  boxShadow: `0 12px 30px ${it.c1}40`,
                }}>
                  <div style={{
                    position: "absolute", top: 6, left: 8, right: 8, height: "35%",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.5), transparent)",
                    borderRadius: 27,
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ ...D, fontSize: 22, letterSpacing: "-0.02em", color: TH.ink, margin: "0 0 4px" }}>
                    {it.name}
                  </h3>
                  <div style={{ fontSize: 13, color: it.c2, fontWeight: 500, marginBottom: 12 }}>{it.tag}</div>
                  <p style={{ color: TH.inkSoft, fontSize: 15, lineHeight: 1.55, margin: 0 }}>
                    {it.pitch}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TH.muted, fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                  Backed by clinical evidence
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Sample stack
// ════════════════════════════════════════════════════════════════════════════

function Sample() {
  return (
    <section id="example" style={{
      background: `linear-gradient(180deg, ${TH.bg}, ${TH.surface})`,
      padding: "var(--section-pad-y) var(--section-pad-x)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 12 }}>
              See it in action
            </div>
            <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.02, color: TH.ink, margin: 0 }}>
              A sample stack for <span style={{ ...SI, color: TH.sageDeep }}>Sarah, 34</span>.
            </h2>
            <p style={{ color: TH.inkSoft, fontSize: 16, lineHeight: 1.55, marginTop: 16 }}>
              Mid-energy days, trains four times a week, sleeps lightly. Here&apos;s what suppdoc.io recommended.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{
            background: TH.surface, borderRadius: 26,
            border: `1px solid ${TH.edge}`,
            boxShadow: `0 30px 80px ${TH.ink}14`,
            overflow: "hidden",
            display: "grid", gridTemplateColumns: "var(--grid-2-cols)",
          }}>
            <div style={{
              padding: 32, borderRight: `1px solid ${TH.edge}`,
              background: `linear-gradient(180deg, ${TH.sage}08, transparent)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999,
                  background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
                  boxShadow: `0 8px 20px ${TH.sage}33`,
                }} />
                <div>
                  <div style={{ ...D, fontSize: 18, color: TH.ink, letterSpacing: "-0.02em" }}>Sarah</div>
                  <div style={{ fontSize: 13, color: TH.muted }}>F · 34 · gym 4×/wk</div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: TH.muted, fontWeight: 500, marginBottom: 18 }}>Wellness scores</div>
              {[
                ["Energy", 72, TH.amber],
                ["Sleep", 61, "#7eb5d4"],
                ["Recovery", 80, TH.sage],
                ["Focus", 75, TH.coral],
              ].map(([l, v, c]) => (
                <div key={l as string} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: TH.ink }}>
                    <span style={{ fontWeight: 500 }}>{l}</span>
                    <span>
                      <span style={{ color: c as string, fontWeight: 600 }}>{v}</span>
                      <span style={{ color: TH.mutedDim }}>/100</span>
                    </span>
                  </div>
                  <div style={{ height: 5, background: TH.bg, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${v}%`, background: c as string, borderRadius: 5,
                      animation: "sd-bar 1.4s cubic-bezier(.2,.7,.2,1)",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                <div style={{ ...D, fontSize: 20, color: TH.ink, letterSpacing: "-0.02em" }}>Recommended stack</div>
                <span style={{
                  padding: "4px 10px", borderRadius: 999,
                  background: `${TH.sage}1a`, color: TH.sageDeep,
                  fontSize: 11, fontWeight: 600,
                }}>5 items · matched to her goals</span>
              </div>

              {[
                ["Vitamin D3 + K2", "2000 IU", "energy · immunity", "AM", "#f0b56b", "#e8a04a"],
                ["Omega-3 EPA/DHA", "1 g", "heart · brain · recovery", "AM", "#ffa580", "#ff8b6b"],
                ["Creatine Monohydrate", "5 g", "strength · cognition", "AM", "#5ba373", "#3f7a52"],
                ["Magnesium Glycinate", "400 mg", "sleep · relaxation", "PM", "#7eb5d4", "#5d97b8"],
                ["Ashwagandha KSM-66", "600 mg", "stress response", "PM", "#a78bfa", "#8d6ce8"],
              ].map(([name, dose, why, when, c1, c2], i) => (
                <div key={name as string} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 0", borderTop: i ? `1px solid ${TH.edge}` : "none",
                }}>
                  <div style={{
                    width: 26, height: 40, borderRadius: 13,
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    boxShadow: `0 6px 16px ${c1}30`, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: TH.ink, fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: TH.muted, marginTop: 2 }}>{why}</div>
                  </div>
                  <div style={{ fontSize: 12, color: TH.muted, ...MM }}>{dose}</div>
                  <div style={{
                    padding: "3px 9px", borderRadius: 999,
                    background: when === "AM" ? `${TH.amber}1a` : `${TH.lavender}1a`,
                    color: when === "AM" ? TH.amberDeep : "#7c5ad9",
                    fontSize: 10, fontWeight: 600,
                  }}>{when}</div>
                </div>
              ))}

              <Link href="/quiz" style={{
                marginTop: 20, display: "block",
                background: TH.ink, color: TH.surface, textDecoration: "none",
                padding: 14, borderRadius: 999,
                textAlign: "center", fontSize: 15, fontWeight: 500,
                boxShadow: `0 8px 20px ${TH.ink}22`,
              }}>
                Get my stack →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Testimonials
// ════════════════════════════════════════════════════════════════════════════

function Testimonials() {
  const items = [
    { title: "No private label", body: "We don't make or sell our own pills, so we have no reason to over-recommend. You buy proven, third-party-tested brands direct from the retailer.", c1: "#f0b56b", c2: "#e8a04a" },
    { title: "Every pick is explained", body: "Each supplement comes with the dose, the timing, and the plain-language reason it's in your stack, with the evidence behind it.", c1: "#5ba373", c2: "#3f7a52" },
    { title: "We'll tell you to stop", body: "When lifestyle alone is enough, or a supplement isn't worth it, we say so. The goal is fewer, better-chosen pills, not more.", c1: "#a78bfa", c2: "#8d6ce8" },
  ];
  return (
    <section style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 12 }}>
              What makes us different
            </div>
            <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.02, color: TH.ink, margin: 0 }}>
              Built to be <span style={{ ...SI, color: TH.sageDeep }}>trusted</span>.
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 18 }}>
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08}>
              <div style={{
                background: TH.surface, borderRadius: 22, padding: 32,
                border: `1px solid ${TH.edge}`,
                boxShadow: `0 4px 12px ${TH.ink}05`,
                display: "flex", flexDirection: "column", gap: 18, minHeight: 260,
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: `linear-gradient(135deg, ${it.c1}, ${it.c2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 8px 20px ${it.c1}40`,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                </div>
                <h3 style={{ ...D, fontSize: 22, letterSpacing: "-0.02em", color: TH.ink, margin: 0 }}>
                  {it.title}
                </h3>
                <p style={{
                  fontSize: 16, color: TH.inkSoft, lineHeight: 1.5, margin: 0,
                }}>{it.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQ
// ════════════════════════════════════════════════════════════════════════════

function FAQ() {
  const [open, setOpen] = useState(0);
  const faqs: [string, string][] = [
    ["Is this medical advice?", "No, suppdoc.io is for education and personal experimentation. We tell you what the research suggests and why. For diagnosis or treatment, please see a clinician."],
    ["How do the recommendations work?", "Your answers are matched against the published research and clinical dosing guidance for each ingredient, then filtered for your goals, diet, and safety flags. Every pick comes with the reasoning behind it."],
    ["Do I need a subscription?", "No subscription, no signup. You can get your stack for free. We earn a small commission only when you choose to buy through one of our retail partners like iHerb or Amazon, at no extra cost to you."],
    ["What if I don't need supplements?", "Sometimes you don't, and we'll tell you. The engine surfaces where lifestyle alone is enough, and where a supplement might actually move the needle."],
    ["Can a beginner use this?", "Absolutely. Every recommendation comes with plain-language reasoning, exact dose, what form to look for, and the best time of day to take it."],
  ];
  return (
    <section id="faq" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 14, color: TH.sage, fontWeight: 600, marginBottom: 12 }}>Common questions</div>
            <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1, color: TH.ink, margin: 0 }}>
              Got <span style={{ ...SI, color: TH.sageDeep }}>questions</span>?
            </h2>
          </div>
        </Reveal>

        <div>
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.04}>
              <div onClick={() => setOpen(open === i ? -1 : i)} style={{
                background: TH.surface,
                border: `1px solid ${TH.edge}`,
                borderRadius: 16, marginBottom: 10, padding: "20px 24px",
                cursor: "pointer", transition: "box-shadow .25s",
                boxShadow: open === i ? `0 8px 24px ${TH.ink}10` : `0 2px 6px ${TH.ink}04`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{
                    ...D, fontSize: 18, color: TH.ink, letterSpacing: "-0.015em",
                  }}>{q}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0, transition: "transform .3s, background .25s",
                    transform: open === i ? "rotate(45deg)" : "none",
                    background: open === i ? TH.sage : TH.bg,
                    color: open === i ? "white" : TH.ink,
                  }}>+</span>
                </div>
                <div style={{
                  maxHeight: open === i ? 200 : 0, overflow: "hidden",
                  transition: "max-height .4s cubic-bezier(.2,.7,.2,1), margin .3s, opacity .3s",
                  opacity: open === i ? 1 : 0, marginTop: open === i ? 12 : 0,
                  color: TH.inkSoft, fontSize: 15, lineHeight: 1.6,
                }}>{a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CTA
// ════════════════════════════════════════════════════════════════════════════

function CTA() {
  return (
    <section style={{ padding: "32px var(--section-pad-x) 80px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          borderRadius: 28,
          background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber} 60%, ${TH.coral})`,
          padding: "72px 36px", position: "relative", overflow: "hidden",
          boxShadow: `0 30px 80px ${TH.sage}33`,
        }}>
          <div style={{
            position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)",
            animation: "sd-drift-a 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: -150, left: -50, width: 500, height: 500, borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
            animation: "sd-drift-b 22s ease-in-out infinite",
          }} />

          <div style={{ position: "relative", maxWidth: 800 }}>
            <Reveal>
              <h2 style={{
                ...D, fontSize: "var(--section-h2)", lineHeight: 1, letterSpacing: "-0.04em",
                color: "white", margin: "0 0 18px",
              }}>
                Ready to feel <span style={{ ...SI }}>the difference?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 18, lineHeight: 1.45, maxWidth: 540, margin: "0 0 28px" }}>
                Build your stack in minutes. Free, no signup, evidence-led.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <Link href="/quiz" style={{
                background: "white", color: TH.ink, textDecoration: "none",
                padding: "16px 26px", borderRadius: 999,
                fontFamily: FONTS.body, fontSize: 15, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 14px 40px rgba(0,0,0,0.15)",
              }}>
                Build my stack
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Root
// ════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  // Safety net: if Supabase auth routes back to "/?code=..." forward to /auth/callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
    }
  }, []);

  return (
    <>
      <SiteHeader />
      <HeroSpotlight />
      <main id="main-content">
        <Hero />
        <Trust />
        {/* Show the actual output early (reduces uncertainty), then the trust
            reasons, before the deeper how/ingredient detail. */}
        <Sample />
        <Testimonials />
        <How />
        <Ingredients />
        <Stats />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </>
  );
}
