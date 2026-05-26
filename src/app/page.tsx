"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const { ref, seen } = useInView();
  const words = text.split(" ");
  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block", overflow: "hidden",
          paddingBottom: "0.12em", marginRight: "0.28em", verticalAlign: "bottom",
        }}>
          <span style={{
            display: "inline-block",
            transform: seen ? "translateY(0%)" : "translateY(110%)",
            transition: `transform .9s cubic-bezier(.2,.7,.2,1) ${delay + i * 0.04}s`,
          }}>{w}</span>
        </span>
      ))}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Decorative components
// ════════════════════════════════════════════════════════════════════════════

function GradientMesh() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "-10%", left: "-5%", width: "50%", height: "70%",
        background: `radial-gradient(circle, ${TH.sage}33, transparent 70%)`,
        filter: "blur(60px)", animation: "sd-drift-a 22s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "-5%", width: "45%", height: "60%",
        background: `radial-gradient(circle, ${TH.amber}33, transparent 70%)`,
        filter: "blur(70px)", animation: "sd-drift-b 28s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "20%", width: "55%", height: "60%",
        background: `radial-gradient(circle, ${TH.coral}22, transparent 70%)`,
        filter: "blur(80px)", animation: "sd-drift-c 25s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "10%", left: "40%", width: "35%", height: "50%",
        background: `radial-gradient(circle, ${TH.lavender}22, transparent 70%)`,
        filter: "blur(70px)", animation: "sd-drift-a 30s ease-in-out infinite reverse",
      }} />
    </div>
  );
}

function PillIcon({ c1, c2, w = 36, h = 56 }: { c1: string; c2: string; w?: number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: w / 2,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      position: "relative", overflow: "hidden",
      boxShadow: `0 8px 20px ${c1}33, inset 0 1px 0 rgba(255,255,255,0.4)`,
    }}>
      <div style={{
        position: "absolute", top: 4, left: 4, right: 4, height: "30%", borderRadius: w / 2,
        background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
      }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Hero
// ════════════════════════════════════════════════════════════════════════════

function HeroStackCard() {
  const items = [
    { name: "Vitamin D3 + K2", dose: "2000 IU", time: "Morning", c1: "#f0b56b", c2: "#e8a04a", taken: true },
    { name: "Omega-3", dose: "1g EPA/DHA", time: "Morning", c1: "#ffa580", c2: "#ff8b6b", taken: true },
    { name: "Magnesium Glycinate", dose: "400 mg", time: "Evening", c1: "#7eb5d4", c2: "#5d97b8", taken: false },
    { name: "Ashwagandha", dose: "600 mg", time: "Evening", c1: "#a78bfa", c2: "#8d6ce8", taken: false },
  ];
  return (
    <div style={{
      background: TH.surface, borderRadius: 24, padding: 24,
      boxShadow: `0 30px 80px ${TH.ink}14, 0 0 0 1px ${TH.edge}`,
      width: "100%", maxWidth: 380, position: "relative", boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: TH.muted, fontWeight: 500, marginBottom: 2 }}>Today · Tuesday</div>
          <div style={{ ...D, fontSize: 22, color: TH.ink, letterSpacing: "-0.02em" }}>Your stack</div>
        </div>
        <div style={{
          padding: "5px 10px", borderRadius: 999, background: `${TH.sage}1a`,
          color: TH.sageDeep, fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: TH.sage, animation: "sd-pulse 1.6s infinite" }} />
          Live
        </div>
      </div>

      {items.map((s, i) => (
        <div key={s.name} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "11px 0", borderTop: i ? `1px solid ${TH.edge}` : "none",
          animation: `sd-rise .6s cubic-bezier(.2,.7,.2,1) ${0.2 + i * 0.1}s both`,
        }}>
          <PillIcon c1={s.c1} c2={s.c2} w={26} h={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, color: TH.ink, fontWeight: 500 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: TH.muted, marginTop: 2 }}>{s.dose} · {s.time}</div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: 999,
            border: `1.5px solid ${s.taken ? TH.sage : TH.edgeStrong}`,
            background: s.taken ? TH.sage : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {s.taken && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 12l5 5 9-11" />
              </svg>
            )}
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 14, padding: "11px 13px", borderRadius: 12,
        background: `linear-gradient(135deg, ${TH.sage}14, ${TH.amber}14)`,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
      }}>
        <div style={{ fontSize: 12, color: TH.ink, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>Sleep tonight: </span>
          <span style={{ color: TH.muted }}>magnesium 30m before bed</span>
        </div>
        <span style={{ color: TH.sage, fontSize: 16, flexShrink: 0 }}>↗</span>
      </div>
    </div>
  );
}

function HeroProofCard() {
  return (
    <div style={{
      background: TH.surface, borderRadius: 18, padding: 16,
      boxShadow: `0 20px 50px ${TH.ink}10, 0 0 0 1px ${TH.edge}`,
      width: 200,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 999,
          background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
        }} />
        <div style={{ fontSize: 12, color: TH.muted, fontWeight: 500 }}>Sleep score</div>
        <span style={{
          marginLeft: "auto", fontSize: 10, color: TH.sageDeep, fontWeight: 600,
          background: `${TH.sage}1a`, padding: "3px 8px", borderRadius: 999,
        }}>+18%</span>
      </div>
      <div style={{ ...D, fontSize: 32, color: TH.ink, letterSpacing: "-0.03em" }}>
        78<span style={{ color: TH.muted, fontSize: 16, fontWeight: 400 }}>/100</span>
      </div>
      <svg width="160" height="36" viewBox="0 0 160 36" style={{ display: "block", marginTop: 4, maxWidth: "100%" }}>
        <path d="M0 26 L20 22 L40 24 L60 18 L80 16 L100 12 L120 14 L140 8 L160 6"
          fill="none" stroke={TH.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: "sd-draw 1.6s ease-out .3s forwards" }} />
        <circle cx="160" cy="6" r="3" fill={TH.sage} />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section id="engine" style={{
      position: "relative",
      padding: "var(--hero-pad-y) var(--hero-pad-x) 56px",
      overflow: "hidden",
    }}>
      <GradientMesh />

      {/* Centred intro */}
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "7px 14px 7px 8px", borderRadius: 999,
            background: TH.surface, border: `1px solid ${TH.edge}`,
            color: TH.inkSoft, fontSize: 13, fontWeight: 500,
            marginBottom: 28, boxShadow: `0 4px 12px ${TH.ink}0a`,
            flexWrap: "wrap",
          }}>
            <span aria-hidden style={{
              background: `linear-gradient(135deg, ${TH.sage}, ${TH.amber})`,
              color: "white", borderRadius: 999, padding: "2px 8px",
              fontSize: 11, fontWeight: 600,
            }}>AI</span>
            <span>The AI clinic for your supplement stack</span>
            <span style={{ color: TH.muted }}>·</span>
            <Link href="/journal" style={{ color: TH.sage, fontWeight: 600, textDecoration: "none" }}>
              How it works →
            </Link>
          </div>
        </Reveal>

        <h1 style={{
          ...D, fontSize: "var(--hero-h1)", lineHeight: "var(--hero-h1-line)",
          letterSpacing: "-0.04em", margin: "0 auto 22px", color: TH.ink,
          maxWidth: 980,
        }}>
          <WordReveal text="Your supplements," />{" "}
          <span style={{ ...SI, color: TH.sageDeep }}>
            <WordReveal text="reviewed by AI" delay={0.1} />
          </span>{" "}
          <WordReveal text="and matched to the science." delay={0.2} />
        </h1>

        <Reveal delay={0.4}>
          <p style={{
            fontSize: 19, lineHeight: 1.55, color: TH.inkSoft,
            maxWidth: 640, margin: "0 auto 36px",
          }}>
            Get a personalised stack, build your own, or audit what you&apos;re already taking — all powered by AI and grounded in the published research.
          </p>
        </Reveal>
      </div>

      {/* 3-service entry grid */}
      <div style={{
        position: "relative", maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 18,
        }}>
          <Reveal delay={0.15}>
            <ServiceCard
              kind="quiz"
              tag="Service 01"
              title="Take the AI quiz"
              tagline="The fastest way in."
              body="Answer a few questions about how you sleep, eat, and feel. Our engine matches you to evidence-backed ingredients."
              cta="Start the quiz"
              href="/quiz"
              meta="Express: 2 min · Complete: 5 min"
              accent={TH.sage}
              accentDeep={TH.sageDeep}
            />
          </Reveal>
          <Reveal delay={0.25}>
            <ServiceCard
              kind="build"
              tag="Service 02"
              title="Build your stack"
              tagline="Describe it in plain English."
              body={'"I want better sleep, more energy, and less stress." — we compose the stack instantly. Or pick from 15 ready-made stacks.'}
              cta="Start building"
              href="/build"
              meta="151 ingredients · 15 ready-made"
              accent={TH.amber}
              accentDeep={TH.amberDeep}
            />
          </Reveal>
          <Reveal delay={0.35}>
            <ServiceCard
              kind="audit"
              tag="Service 03"
              title="Audit my current stack"
              tagline="Already taking supplements?"
              body="Paste what you take. AI finds interactions, redundancies, missing nutrients, and timing issues — then suggests a cleaner version."
              cta="Audit my stack"
              href="/audit"
              meta="Free · instant report"
              accent={TH.coral}
              accentDeep="#c9543a"
              badge="NEW"
            />
          </Reveal>
        </div>

        <Reveal delay={0.5}>
          <div style={{
            display: "flex", justifyContent: "center", gap: 22,
            marginTop: 28, fontSize: 13, color: TH.muted,
            alignItems: "center", flexWrap: "wrap",
          }}>
            {[
              "Free, no signup required",
              "151 evidence-led ingredients",
              "Honest — we don't sell our own pills",
            ].map(item => (
              <div key={item} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5">
                  <path d="M5 12l5 5 9-11" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────
function ServiceCard({
  kind, tag, title, tagline, body, cta, href, meta, accent, accentDeep, badge,
}: {
  kind: "quiz" | "build" | "audit";
  tag: string;
  title: string;
  tagline: string;
  body: string;
  cta: string;
  href: string;
  meta: string;
  accent: string;
  accentDeep: string;
  badge?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      <article
        className="sd-service-card"
        style={{
          position: "relative", height: "100%",
          padding: "28px 26px 22px",
          background: TH.surface,
          border: `1px solid ${TH.edge}`,
          borderRadius: 22,
          boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 10px 28px rgba(10,37,64,0.06)",
          display: "flex", flexDirection: "column",
          transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s, border-color .25s",
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient corner */}
        <div aria-hidden style={{
          position: "absolute", top: -60, right: -60, width: 180, height: 180,
          background: `radial-gradient(circle at 30% 30%, ${accent}1f, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {badge && (
          <span style={{
            position: "absolute", top: 16, right: 16,
            fontSize: 10, ...MM, letterSpacing: "0.08em",
            background: `${accent}22`, color: accentDeep,
            padding: "3px 8px", borderRadius: 999, fontWeight: 600,
          }}>{badge}</span>
        )}

        <ServiceGlyph kind={kind} accent={accent} accentDeep={accentDeep} />

        <div style={{
          ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.12em",
          marginTop: 18, textTransform: "uppercase",
        }}>{tag}</div>

        <h3 style={{
          ...D, fontSize: 26, color: TH.ink, lineHeight: 1.15,
          letterSpacing: "-0.025em", margin: "6px 0 4px",
        }}>{title}</h3>

        <div style={{ ...SI, fontStyle: "italic", fontSize: 17, color: accentDeep, marginBottom: 12 }}>
          {tagline}
        </div>

        <p style={{
          fontSize: 14.5, lineHeight: 1.55, color: TH.inkSoft,
          margin: "0 0 18px", flex: 1,
        }}>{body}</p>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 14, borderTop: `1px solid ${TH.edge}`,
        }}>
          <span style={{ ...MM, fontSize: 11, color: TH.muted }}>{meta}</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: accentDeep, fontWeight: 600, fontSize: 14,
          }}>
            {cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>

      <style>{`
        .sd-service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(10,37,64,0.08), 0 24px 50px rgba(10,37,64,0.12);
          border-color: ${TH.edgeStrong};
        }
      `}</style>
    </Link>
  );
}

// ─── Service-specific glyph ───────────────────────────────────────────────
function ServiceGlyph({ kind, accent, accentDeep }: { kind: "quiz" | "build" | "audit"; accent: string; accentDeep: string }) {
  if (kind === "quiz") {
    return (
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="6" y="10" width="36" height="28" rx="6" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.5" />
        <circle cx="14" cy="20" r="2.2" fill={accentDeep} />
        <rect x="20" y="18.5" width="18" height="3" rx="1.5" fill={accentDeep} fillOpacity="0.7" />
        <circle cx="14" cy="28" r="2.2" fill={accent} />
        <rect x="20" y="26.5" width="14" height="3" rx="1.5" fill={accent} fillOpacity="0.55" />
      </svg>
    );
  }
  if (kind === "build") {
    return (
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden>
        <circle cx="14" cy="24" r="6" fill={accent} fillOpacity="0.25" />
        <circle cx="14" cy="24" r="6" stroke={accentDeep} strokeWidth="1.5" />
        <circle cx="34" cy="14" r="5" fill={accentDeep} fillOpacity="0.18" />
        <circle cx="34" cy="14" r="5" stroke={accentDeep} strokeWidth="1.5" />
        <circle cx="34" cy="34" r="5" fill={accent} fillOpacity="0.18" />
        <circle cx="34" cy="34" r="5" stroke={accent} strokeWidth="1.5" />
        <path d="M20 22 L29 16 M20 26 L29 32" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // audit
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="13" stroke={accentDeep} strokeWidth="1.5" fill={accent} fillOpacity="0.12" />
      <path d="M16 22 L20 26 L29 17" stroke={accentDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 32 L40 40" stroke={accentDeep} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
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
// How it works — 3 cards
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
              cx={60 + 40 * Math.cos(a * Math.PI / 180)}
              cy={60 + 40 * Math.sin(a * Math.PI / 180)}
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
    { tag: "Step 1", title: "Tell us about you.", body: "A two-minute reflection on how you sleep, train, eat, and feel. No medical jargon, no signup — just you.", illust: "intake", color: TH.sage },
    { tag: "Step 2", title: "We match the evidence.", body: "We match your answers against the published research and clinical dosing guidance behind each ingredient.", illust: "engine", color: TH.amber },
    { tag: "Step 3", title: "Live the ritual.", body: "Your morning, midday, and evening plan — with exact doses, timing, and the reasoning behind every pick.", illust: "ritual", color: TH.coral },
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
            ["$0", "to use — we never sell our own pills"],
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
    { title: "Every pick is explained", body: "Each supplement comes with the dose, the timing, and the plain-language reason it's in your stack — with the evidence behind it.", c1: "#5ba373", c2: "#3f7a52" },
    { title: "We'll tell you to stop", body: "When lifestyle alone is enough, or a supplement isn't worth it, we say so. The goal is fewer, better-chosen pills — not more.", c1: "#a78bfa", c2: "#8d6ce8" },
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
    ["Is this medical advice?", "No — suppdoc.io is for education and personal experimentation. We tell you what the research suggests and why. For diagnosis or treatment, please see a clinician."],
    ["How do the recommendations work?", "Your answers are matched against the published research and clinical dosing guidance for each ingredient, then filtered for your goals, diet, and safety flags. Every pick comes with the reasoning behind it."],
    ["Do I need a subscription?", "No subscription, no signup. You can get your stack for free. We earn a small commission only when you choose to buy through one of our retail partners like iHerb or Amazon — at no extra cost to you."],
    ["What if I don't need supplements?", "Sometimes you don't — and we'll tell you. The engine surfaces where lifestyle alone is enough, and where a supplement might actually move the needle."],
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
      <main>
        <Hero />
        <Trust />
        <How />
        <Stats />
        <Ingredients />
        <Sample />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </>
  );
}
