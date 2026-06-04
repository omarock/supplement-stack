// Server component. The homepage is rendered on the server with zero
// page-level hydration; the only client islands are SiteHeader, HeroSpotlight,
// StackBox (the build box), and AuthCodeCatcher. Scroll reveals are pure CSS
// (.sd-reveal in globals.css). See PERFORMANCE_AUDIT.md.
import { type CSSProperties } from "react";
import { HOME_FAQ } from "@/lib/home-faq";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSpotlight from "@/components/home/HeroSpotlightLazy";
import StackBox from "@/components/home/StackBox";
import AuthCodeCatcher from "@/components/home/AuthCodeCatcher";
import { TH, FONTS, D, SI, MM } from "@/lib/theme";
import { STACKS } from "@/lib/stacks";

// ════════════════════════════════════════════════════════════════════════════
// Motion primitives
// ════════════════════════════════════════════════════════════════════════════

// Pure-CSS scroll reveal (see .sd-reveal in globals.css). No JavaScript, no
// IntersectionObserver, no hydration. `delay`/`y` are accepted for call-site
// compatibility but are no-ops now (the CSS handles the motion).
function Reveal({ children, style }: {
  children: React.ReactNode; delay?: number; y?: number; style?: CSSProperties;
}) {
  return <div className="sd-reveal" style={style}>{children}</div>;
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

/** Premium proof counters: high-contrast numbers on white cells with hairline dividers. */
function StatStrip() {
  return (
    <div role="list" aria-label="Platform facts" style={{
      display: "grid", gridTemplateColumns: "var(--facts-cols)",
      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 13, overflow: "hidden",
      maxWidth: 720, margin: "0 auto", boxShadow: "0 1px 2px rgba(10,37,64,0.04)",
    }}>
      {FACTS.map((f, i) => (
        <div key={f.label} role="listitem" style={{
          padding: "9px 12px", textAlign: "center",
          borderLeft: i % 4 === 0 ? "none" : `1px solid ${TH.edge}`,
          display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, flexWrap: "wrap",
        }}>
          <span style={{ ...D, fontSize: 17, color: TH.ink, letterSpacing: "-0.01em" }}>
            {f.display ?? `${f.value!.toLocaleString()}${f.suffix ?? ""}`}
          </span>
          <span style={{ ...MM, fontSize: 8.5, color: TH.muted, letterSpacing: "0.02em", textTransform: "uppercase" }}>
            {f.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  // ── Shared triptych styles (3 equal service cards) ──────────────────────
  const triCard = (variant: "rec" | "center" | "plain"): CSSProperties => ({
    display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit",
    borderRadius: 20, padding: 22,
    background: variant === "rec" ? `linear-gradient(165deg, ${TH.sage}1f, ${TH.surface} 62%)` : TH.surface,
    border: variant === "rec" ? `2px solid ${TH.sage}` : `1px solid ${TH.edge}`,
    boxShadow: variant === "rec"
      ? `0 18px 44px -18px ${TH.sage}88`
      : variant === "center"
        ? "0 16px 40px -20px rgba(10,37,64,0.26)"
        : "0 10px 28px -18px rgba(10,37,64,0.2)",
  });
  const triBtn: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 50, borderRadius: 999, border: "none", cursor: "pointer",
    background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
    fontFamily: FONTS.body, fontWeight: 600, fontSize: 14.5, textDecoration: "none",
    boxShadow: `0 10px 22px -6px ${TH.sage}80`,
  };
  const buylineStyle: CSSProperties = {
    ...MM, fontSize: 9, letterSpacing: "0.04em", color: TH.sageDeep, textTransform: "uppercase", margin: "14px 0 11px",
  };
  const chipStyle = (bg: string, fg: string): CSSProperties => ({
    ...MM, display: "inline-flex", alignItems: "center", fontSize: 9.5, fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 6, background: bg, color: fg,
  });
  const iconWrap = (bg: string, fg: string): CSSProperties => ({
    width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
    background: bg, color: fg, flexShrink: 0,
  });
  const cardSpacer = <div style={{ flex: 1, minHeight: 8 }} />;

  return (
    <section id="engine" style={{ position: "relative", padding: "var(--hh-pad-y) var(--hero-pad-x) var(--hh-pad-b)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Centered intro */}
        <div className="sd-hero-intro" style={{ maxWidth: 660, margin: "0 auto" }}>
          <Reveal>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16,
              padding: "6px 15px 6px 7px", background: TH.surface,
              border: `1px solid ${TH.edgeStrong}`, borderRadius: 999, boxShadow: `0 2px 6px ${TH.ink}0f`,
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999, background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, flexShrink: 0,
                display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 5px ${TH.sage}66`,
              }} aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2 2 0 0 1 6 4h13v15H6a2 2 0 0 0-2 2z" /><path d="M8 8h7M8 11.5h7" />
                </svg>
              </span>
              <span style={{ fontSize: 12.5, color: TH.ink, fontWeight: 600, letterSpacing: "-0.005em" }}>
                Evidence-graded <span style={{ color: TH.muted, fontWeight: 400 }}>· every claim cited · no house brand</span>
              </span>
            </div>
          </Reveal>
          <h1 style={{ ...D, fontWeight: 500, fontSize: "var(--hh-h1)", lineHeight: 1.03, letterSpacing: "-0.04em", color: TH.ink, margin: 0 }}>
            The supplement stack{" "}
            <span style={{ ...SI, color: TH.sageDeep, letterSpacing: "-0.01em" }}>built for you</span>.
          </h1>
          <Reveal delay={0.1}>
            <p style={{ fontSize: "var(--hh-sub)", lineHeight: 1.45, color: TH.inkSoft, maxWidth: 560, margin: "12px auto 0" }}>
              Three ways in. Each ends with a clear stack you can buy from iHerb or Amazon in one click.
            </p>
          </Reveal>
        </div>

        {/* Triptych, three equal services */}
        <Reveal delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "var(--tri-cols)", gap: 18, alignItems: "stretch", marginTop: 24 }}>

            {/* Quiz, recommended focus */}
            <Link href="/quiz" style={triCard("rec")}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={iconWrap(`${TH.sage}1f`, TH.sageDeep)}>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.4 4.2 4.1 1.3-4.1 1.3L8 12.5l-1.4-4.2-4.1-1.3 4.1-1.3L8 1.5z" stroke={TH.sageDeep} strokeWidth="1.4" strokeLinejoin="round" /></svg>
                </span>
                <span style={chipStyle(TH.sageDeep, "#fff")}>★ 01 · Recommended</span>
              </div>
              <div style={{ ...D, fontSize: 21, color: TH.ink, marginTop: 12, letterSpacing: "-0.01em" }}>Take the quiz</div>
              <div style={{ ...SI, color: TH.sageDeep, fontSize: 14.5, marginTop: 2 }}>The fastest way in.</div>
              <p style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.55, margin: "9px 0 0" }}>Answer a few questions about how you sleep, eat, and feel. We match you to evidence-backed ingredients.</p>
              {cardSpacer}
              <div style={buylineStyle}>→ generate a stack → buy on iHerb / Amazon</div>
              <span style={triBtn}>Start the quiz →</span>
            </Link>

            {/* Build box, center (the one interactive island) */}
            <StackBox />

            {/* Audit */}
            <Link href="/audit" style={triCard("plain")}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={iconWrap(`${TH.coral}24`, TH.coral)}>
                  <svg width="19" height="19" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={TH.coral} strokeWidth="1.4" /><path d="M10.5 10.5l3 3" stroke={TH.coral} strokeWidth="1.6" strokeLinecap="round" /></svg>
                </span>
                <span style={chipStyle(`${TH.coral}26`, "#c2410c")}>03 · New</span>
              </div>
              <div style={{ ...D, fontSize: 21, color: TH.ink, marginTop: 12, letterSpacing: "-0.01em" }}>Audit my stack</div>
              <div style={{ ...SI, color: "#c2410c", fontSize: 14.5, marginTop: 2 }}>Already taking supplements?</div>
              <p style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.55, margin: "9px 0 0" }}>Paste what you take today (and your bloodwork) and we score interactions, doses, and gaps, then suggest fixes.</p>
              {cardSpacer}
              <div style={buylineStyle}>→ a cleaner stack → buy the upgrades</div>
              <span style={triBtn}>Audit my stack →</span>
            </Link>

          </div>
        </Reveal>

        {/* Full-width proof bar (balances the two columns, premium counters) */}
        <Reveal delay={0.2} style={{ marginTop: 26 }}>
          <StatStrip />
        </Reveal>
      </div>

      <style>{`
        :root { --hh-pad-y: 18px; --hh-pad-b: 46px; --hh-h1: 46px; --hh-sub: 16px; --facts-cols: repeat(4, 1fr); --tri-cols: 1fr 1.18fr 1fr; }
        .sd-hero-intro { text-align: center; }
        @media (max-width: 1024px) { :root { --hh-pad-y: 12px; --hh-pad-b: 40px; --hh-h1: 40px; --tri-cols: 1fr 1.1fr 1fr; } }
        @media (max-width: 860px)  { :root { --tri-cols: 1fr; } }
        @media (max-width: 640px)  { :root { --hh-pad-y: 6px; --hh-pad-b: 34px; --hh-h1: 32px; --hh-sub: 14.5px; --facts-cols: repeat(2, 1fr); } }
      `}</style>
    </section>
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
            <div style={{ fontSize: 14, color: TH.sageDeep, fontWeight: 600, marginBottom: 14 }}>
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
                <div style={{ fontSize: 13, color: TH.inkSoft, fontWeight: 600 }}>{s.tag}</div>
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
              <div style={{ fontSize: 14, color: TH.sageDeep, fontWeight: 600, marginBottom: 12 }}>
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
          <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, fontWeight: 500, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
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

              <div style={{ ...MM, fontSize: 10.5, color: TH.muted, fontWeight: 500, marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Wellness scores</div>
              {[
                ["Energy", 72, TH.amber],
                ["Sleep", 61, "#5d97b8"],
                ["Recovery", 80, TH.sage],
                ["Focus", 75, TH.coral],
              ].map(([l, v, c]) => (
                <div key={l as string} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, color: TH.ink }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{l}</span>
                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
                      <span style={{ ...D, color: c as string, fontSize: 16, letterSpacing: "-0.02em" }}>{v}</span>
                      <span style={{ ...MM, color: TH.muted, fontSize: 10 }}>/100</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: `${c}1f`, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${v}%`, borderRadius: 999,
                      background: `linear-gradient(90deg, ${c}cc, ${c})`,
                      boxShadow: `0 1px 4px ${c}55`,
                      animation: "sd-bar 1.4s cubic-bezier(.2,.7,.2,1)",
                    }} />
                  </div>
                </div>
              ))}

              {/* Insight, ties the scores to the picks and fills the column */}
              <div style={{
                marginTop: 22, padding: "14px 16px", borderRadius: 14,
                background: TH.surface, border: `1px solid ${TH.edge}`,
              }}>
                <div style={{ ...MM, fontSize: 9.5, color: TH.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>
                  Why these picks
                </div>
                <p style={{ fontSize: 12.5, color: TH.inkSoft, lineHeight: 1.55, margin: 0 }}>
                  Light sleep and evening stress point to magnesium and ashwagandha at night; training 4x a week adds creatine and omega-3 for recovery, with D3+K2 covering the basics.
                </p>
              </div>
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
            <div style={{ fontSize: 14, color: TH.sageDeep, fontWeight: 600, marginBottom: 12 }}>
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
  // Native <details>: open/close with zero JavaScript. The plus rotates and the
  // panel reveals via CSS (see .sd-faq in globals.css).
  return (
    <section id="faq" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 14, color: TH.sageDeep, fontWeight: 600, marginBottom: 12 }}>Common questions</div>
            <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1, color: TH.ink, margin: 0 }}>
              Got <span style={{ ...SI, color: TH.sageDeep }}>questions</span>?
            </h2>
          </div>
        </Reveal>

        <div>
          {HOME_FAQ.map(([q, a]) => (
            <Reveal key={q}>
              <details className="sd-faq" style={{
                background: TH.surface, border: `1px solid ${TH.edge}`,
                borderRadius: 16, marginBottom: 10, padding: "20px 24px",
                boxShadow: `0 2px 6px ${TH.ink}04`,
              }}>
                <summary className="sd-faq-summary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, cursor: "pointer", listStyle: "none" }}>
                  <span style={{ ...D, fontSize: 18, color: TH.ink, letterSpacing: "-0.015em" }}>{q}</span>
                  <span className="sd-faq-plus" style={{
                    width: 28, height: 28, borderRadius: 999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0, background: TH.bg, color: TH.ink,
                    transition: "transform .3s, background .25s, color .25s",
                  }}>+</span>
                </summary>
                <div style={{ marginTop: 12, color: TH.inkSoft, fontSize: 15, lineHeight: 1.6 }}>{a}</div>
              </details>
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
  return (
    <>
      <AuthCodeCatcher />
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
