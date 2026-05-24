"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";

// ─── Theme ────────────────────────────────────────────────────────────────────
const phylaTheme = {
  light: {
    bg: "#f4ede1", bgWarm: "#ebe3d3", paper: "#fbf6ec",
    ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
    sage: "#4a6a4e", sageDeep: "#324d36", sageGlow: "rgba(74,106,78,0.10)",
    burgundy: "#7d2e3a", burgundyDeep: "#5a1f2a", burgundyTint: "rgba(125,46,58,0.10)",
    line: "rgba(28,29,24,0.12)", panel: "#fbf6ec", bottleCream: "#fbf6ec",
  },
  dark: {
    bg: "#15120e", bgWarm: "#1b1813", paper: "#1f1c17",
    ink: "#f4ede1", inkSoft: "#b8b09e", inkMute: "#807a6c",
    sage: "#a8d4ac", sageDeep: "#c5e3c8", sageGlow: "rgba(168,212,172,0.12)",
    burgundy: "#e09aa3", burgundyDeep: "#c46673", burgundyTint: "rgba(224,154,163,0.12)",
    line: "rgba(244,237,225,0.10)", panel: "#1f1c17", bottleCream: "#2a2620",
  },
};

type T = typeof phylaTheme.light;
const Ctx = createContext<T>(phylaTheme.light);
const useT = () => useContext(Ctx);
const S = { fontFamily: "var(--font-serif)", fontWeight: 400 } as const;
const MM = { fontFamily: "var(--font-mono)" } as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────
function PhylaLogo() {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={22} height={22} viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={t.sage} />
        <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={t.sage} />
        <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={t.sage} />
        <circle cx="12" cy="12" r="1.6" fill={t.burgundy} />
      </svg>
      <span style={{ ...S, fontSize: 22, letterSpacing: "-0.01em", color: t.ink }}>phyla</span>
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const t = useT();
  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
      style={{
        background: "transparent", border: `1px solid ${t.line}`, borderRadius: 999,
        cursor: "pointer", position: "relative", width: 56, height: 28, padding: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: dark ? 28 : 2,
        width: 22, height: 22, borderRadius: 999, background: t.sage,
        transition: "left .35s cubic-bezier(.7,.1,.3,1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: t.bg,
      }}>
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function PhylaNav({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [
    ["Stacks", "/stacks"],
    ["How it works", "#how-it-works"],
    ["Ingredients", "#ingredients"],
    ["Journal", "/journal"],
    ["About", "/about"],
  ];
  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px var(--nav-pad-x)",
        background: `${t.bg}cc`, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${t.line}`,
      }}>
        <PhylaLogo />

        {/* Desktop nav */}
        <div style={{ display: "var(--nav-show)", gap: "var(--nav-gap)", fontSize: 14, color: t.inkSoft, alignItems: "center" }}>
          {links.map(([n, h]) => (
            <Link key={n} href={h} style={{ color: "inherit", textDecoration: "none" }}>{n}</Link>
          ))}
        </div>

        <div style={{ display: "var(--nav-show)", gap: 14, alignItems: "center" }}>
          <ThemeToggle dark={dark} setDark={setDark} />
          <Link href="/signin" style={{ fontSize: 14, color: t.inkSoft, textDecoration: "none" }}>
            Sign in
          </Link>
          <Link href="/quiz" style={{
            background: t.ink, color: t.bg, textDecoration: "none",
            padding: "12px 22px", borderRadius: 999, fontWeight: 500, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            Begin analysis
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile right: theme + hamburger */}
        <div style={{ display: "var(--burger-show)", alignItems: "center", gap: 10 }}>
          <ThemeToggle dark={dark} setDark={setDark} />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: `1px solid ${t.line}`, background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, top: 64, zIndex: 29,
            background: t.bg,
            padding: "32px 24px",
            animation: "phyla-fade-in .2s ease-out",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {links.map(([n, h]) => (
            <Link
              key={n} href={h} onClick={() => setOpen(false)}
              style={{
                ...S, fontSize: 30, color: t.ink, textDecoration: "none",
                padding: "14px 0", borderBottom: `1px solid ${t.line}`,
              }}
            >
              {n}
            </Link>
          ))}
          <Link
            href="/signin" onClick={() => setOpen(false)}
            style={{
              ...S, fontSize: 30, color: t.ink, textDecoration: "none",
              padding: "14px 0", borderBottom: `1px solid ${t.line}`,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/quiz" onClick={() => setOpen(false)}
            style={{
              marginTop: 24, padding: "18px 24px",
              background: t.ink, color: t.bg, textDecoration: "none",
              borderRadius: 999, fontSize: 16, fontWeight: 500,
              textAlign: "center",
            }}
          >
            Begin analysis →
          </Link>
        </div>
      )}
    </>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function PhylaChart({ color, points, label, value, delta }: {
  color: string; points: number[]; label: string; value: string; delta: string;
}) {
  const t = useT();
  const w = 220, h = 70;
  const max = Math.max(...points), min = Math.min(...points);
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / (max - min || 1)) * h,
  }));
  const pathD = coords.map(({ x, y }, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`;
  const last = coords[coords.length - 1];
  const gid = `grad-${label.replace(/\s/g, "")}`;
  return (
    <div style={{ background: t.panel, border: `1px solid ${t.line}`, borderRadius: 18, padding: "16px 18px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: t.inkSoft, letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 11, color, ...MM }}>{delta}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
        <span style={{ ...S, fontSize: 42, color: t.ink, letterSpacing: "-0.03em", lineHeight: 0.9 }}>{value}</span>
        <span style={{ fontSize: 12, color: t.inkMute, ...MM }}>/100</span>
      </div>
      <svg width={w} height={h} style={{ display: "block", width: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.30" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gid})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: "phyla-draw 1.8s ease-out forwards" }} />
        <circle cx={last.x} cy={last.y} r="4" fill={color}
          style={{ animation: "phyla-pulse 2s ease-in-out infinite" }} />
      </svg>
    </div>
  );
}

// ─── Bottle Card ──────────────────────────────────────────────────────────────
function PhylaBottleCard({ label, tag, tagColor, hue, delay = 0 }: {
  label: string; tag: string; tagColor: string; hue: string; delay?: number;
}) {
  const t = useT();
  return (
    <div style={{
      background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16, padding: 14,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1,
      animation: `phyla-rise .9s ${delay}s ease-out both`,
    }}>
      <svg width="64" height="98" viewBox="0 0 64 98">
        <rect x="25" y="4" width="14" height="8" rx="1.5" fill={t.sage} />
        <rect x="22" y="11" width="20" height="4" fill={t.sage} opacity="0.85" />
        <path d="M14 18 Q14 16 16 16 L48 16 Q50 16 50 18 L50 90 Q50 94 46 94 L18 94 Q14 94 14 90 Z" fill={hue} />
        <rect x="18" y="42" width="28" height="38" rx="3" fill={t.bottleCream} opacity="0.94" />
        <text x="32" y="60" textAnchor="middle" fill={t.ink} fontFamily="Instrument Serif" fontSize="11" fontStyle="italic">{label}</text>
        <line x1="22" y1="68" x2="42" y2="68" stroke={t.sage} strokeWidth="0.4" />
        <text x="32" y="74" textAnchor="middle" fill={t.sage} fontFamily="Inter" fontSize="4" letterSpacing="1.5">PHYLA</text>
      </svg>
      <div style={{
        padding: "4px 10px", borderRadius: 999,
        background: `${tagColor}1f`, color: tagColor,
        fontSize: 11, fontWeight: 500,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: tagColor }} />
        {tag}
      </div>
    </div>
  );
}

// ─── Leaf ─────────────────────────────────────────────────────────────────────
function PhylaLeaf({ size = 80, rotate = 0, color, opacity = 1 }: {
  size?: number; rotate?: number; color?: string; opacity?: number;
}) {
  const t = useT();
  const c = color || t.sage;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ transform: `rotate(${rotate}deg)`, opacity }}>
      <path d="M40 8 C 18 8, 8 30, 8 50 C 8 65, 22 72, 36 72 C 38 72, 40 71, 40 70 L 40 8 Z" fill={c} opacity="0.78" />
      <path d="M40 8 C 62 8, 72 30, 72 50 C 72 65, 58 72, 44 72 C 42 72, 40 71, 40 70 L 40 8 Z" fill={c} />
    </svg>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ target }: { target: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const DURATION = 1800;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <span>{v.toLocaleString()}</span>;
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function PhylaHero() {
  const t = useT();
  return (
    <section style={{ padding: "var(--hero-pad-y) var(--hero-pad-x) calc(var(--hero-pad-y) * 1.25)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 60, right: 24, animation: "phyla-sway 7s ease-in-out infinite", opacity: 0.6 }}>
        <PhylaLeaf size={130} rotate={25} opacity={0.45} />
      </div>
      <div style={{ position: "absolute", bottom: 100, left: -40, animation: "phyla-sway 9s ease-in-out infinite reverse", opacity: 0.6 }}>
        <PhylaLeaf size={170} rotate={-160} opacity={0.35} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "var(--hero-cols)", gap: 56, alignItems: "center", position: "relative" }}>
        {/* Left — copy */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32,
            color: t.sage, fontSize: 13, padding: "6px 14px", borderRadius: 999,
            background: t.sageGlow, border: `1px solid ${t.sage}33`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: t.sage, animation: "phyla-pulse 1.6s infinite" }} />
            AI engine v4.2 · live
          </div>

          <h1 style={{ ...S, fontSize: "var(--hero-h1)", lineHeight: "var(--hero-h1-line)", margin: "0 0 28px", letterSpacing: "-0.03em", color: t.ink }}>
            A supplement<br />
            ritual,<br />
            <span style={{ color: t.burgundy, fontStyle: "italic" }}>tuned</span> to <em style={{ color: t.sage }}>you</em>.
          </h1>

          <p style={{ fontSize: 19, lineHeight: 1.55, color: t.inkSoft, maxWidth: 480, marginBottom: 36 }}>
            Answer a few questions about how you sleep, move, and feel. Our AI composes a daily stack from clean, evidence-led ingredients — and tells you exactly why.
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 30, flexWrap: "wrap" }}>
            <Link href="/quiz" style={{
              background: t.burgundy, color: "#fbf6ec", textDecoration: "none",
              padding: "18px 28px", borderRadius: 999, fontWeight: 500, fontSize: 15,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              boxShadow: `0 12px 40px ${t.burgundyTint}`,
            }}>
              Begin your analysis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#example" style={{
              background: "transparent", color: t.ink, textDecoration: "none",
              border: `1px solid ${t.ink}`, padding: "18px 26px", borderRadius: 999,
              fontWeight: 500, fontSize: 15, cursor: "pointer",
            }}>
              See an example →
            </a>
          </div>

          <div style={{ display: "flex", gap: 28, fontSize: 13, color: t.inkMute, alignItems: "center", flexWrap: "wrap" }}>
            <div>♡ no signup</div>
            <div>⏱ 60 seconds</div>
            <div>✦ instant blend</div>
          </div>

          <div style={{
            marginTop: 18, fontSize: 13, color: t.inkSoft,
            display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
          }}>
            <span>or skip the quiz —</span>
            <Link href="/stacks" style={{ color: t.burgundy, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3 }}>
              browse 11 ready-made stacks →
            </Link>
          </div>
        </div>

        {/* Right — live dashboard */}
        <div style={{
          background: t.panel, border: `1px solid ${t.line}`, borderRadius: 28, padding: 24,
          boxShadow: `0 30px 80px ${t.line}`, position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: t.inkSoft, ...MM, letterSpacing: "0.12em" }}>LIVE READING</div>
              <div style={{ ...S, fontSize: 26, marginTop: 4, color: t.ink, letterSpacing: "-0.01em" }}>Your wellness today</div>
            </div>
            <div style={{ fontSize: 11, color: t.inkMute, ...MM }}>updated 0.2s ago</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <PhylaChart label="Energy" value="78" delta="+34%" color={t.sage} points={[45, 52, 48, 60, 64, 70, 75, 78]} />
            <PhylaChart label="Sleep" value="64" delta="+12%" color={t.burgundy} points={[70, 62, 58, 64, 60, 66, 68, 64]} />
            <PhylaChart label="Recovery" value="81" delta="+28%" color="#a87a52" points={[60, 58, 65, 70, 72, 76, 78, 81]} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ ...S, fontSize: 22, color: t.ink }}>Your blend</div>
            <div style={{ fontSize: 12, color: t.burgundy, cursor: "pointer" }}>see full plan →</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <PhylaBottleCard label="bright" tag="morning" tagColor="#c4944a" hue="#d4a96a" delay={0} />
            <PhylaBottleCard label="restore" tag="morning" tagColor="#c4944a" hue="#a3604a" delay={0.1} />
            <PhylaBottleCard label="balance" tag="pre-train" tagColor={t.sage} hue="#688a6b" delay={0.2} />
            <PhylaBottleCard label="settle" tag="evening" tagColor={t.burgundy} hue="#7a6d92" delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
function PhylaTrust() {
  const t = useT();
  return (
    <section style={{
      padding: "40px 56px", background: t.bgWarm,
      borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 24,
    }}>
      {[
        ["12,000+", "rituals composed"],
        ["98.4%", "find it useful"],
        ["1,243", "studies cross-referenced"],
        ["60s", "average analysis"],
      ].map(([n, l]) => (
        <div key={l}>
          <div style={{ ...S, fontSize: 48, letterSpacing: "-0.03em", color: t.ink, lineHeight: 1 }}>{n}</div>
          <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 6 }}>{l}</div>
        </div>
      ))}
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function PhylaMarquee() {
  const t = useT();
  const items = [
    "featured in Wellbeing Weekly", "vetted by registered dietitians",
    "third-party tested", "made for sensitive routines",
    "5★ in 4,200 reports", "science-led, gently composed",
  ];
  const tripled = [...items, ...items, ...items];
  return (
    <section style={{ padding: "24px 0", background: t.bg, overflow: "hidden" }}>
      <div style={{
        display: "flex", gap: 48, alignItems: "center", whiteSpace: "nowrap",
        animation: "phyla-marquee 35s linear infinite",
      }}>
        {tripled.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 48, color: t.inkSoft, fontSize: 16 }}>
            <span>{it}</span>
            <span style={{ ...S, fontSize: 24, color: t.burgundy, fontStyle: "italic" }}>✿</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function PhylaHow() {
  const t = useT();
  const steps = [
    ["01", "Share your story", "Goals, sleep, energy, training, stress. A gentle two-minute reflection — plain language only.", "~2m"],
    ["02", "AI composes the blend", "We cross-reference your inputs against 1,200+ peer-reviewed studies and clinical guidelines.", "<1s"],
    ["03", "Live with the ritual", "A morning, midday, and evening routine with exact dose, timing, and the reasoning behind each pick.", "daily"],
  ];
  const stepBgs = ["#e8d9c5", "#cfdcc8", "#e8c8b6"];
  return (
    <section id="how-it-works" style={{ padding: "var(--section-pad-y) var(--section-pad-x)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
        <div>
          <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— THE RITUAL —</div>
          <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", color: t.ink, maxWidth: 800 }}>
            From <em style={{ color: t.burgundy }}>question</em> to <em style={{ color: t.sage }}>routine</em>, in three quiet steps.
          </h2>
        </div>
        <div style={{ ...MM, fontSize: 12, color: t.inkMute }}>~60s end to end</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 24, position: "relative" }}>
        <div style={{
          position: "absolute", top: 70, left: "16%", right: "16%", height: 1,
          background: `repeating-linear-gradient(90deg, ${t.line} 0 8px, transparent 8px 16px)`,
          zIndex: 0,
        }} />
        {steps.map(([n, title, body, time], i) => (
          <div key={n} style={{
            background: t.panel, border: `1px solid ${t.line}`, borderRadius: 24, padding: 32,
            position: "relative", zIndex: 1, minHeight: 320, display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 999,
                background: stepBgs[i],
                display: "flex", alignItems: "center", justifyContent: "center",
                ...S, fontSize: 28, fontStyle: "italic", color: t.sageDeep,
              }}>{n}</div>
              <span style={{ ...MM, fontSize: 11, color: t.inkMute }}>~ {time}</span>
            </div>
            <h3 style={{ ...S, fontSize: 32, margin: "0 0 14px", letterSpacing: "-0.02em", color: t.ink }}>{title}</h3>
            <p style={{ color: t.inkSoft, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Benefits ─────────────────────────────────────────────────────────────────
function PhylaBenefits() {
  const t = useT();
  const items = [
    ["More energy", "feel less exhausted across the day", "☀"],
    ["Deeper sleep", "wake feeling fully refreshed", "☾"],
    ["Sharper focus", "mental clarity, naturally", "✦"],
    ["Better recovery", "muscle, mind, and mood", "↺"],
    ["Stress support", "calmer baseline cortisol", "♡"],
    ["Personal guidance", "never one-size-fits-all", "✿"],
  ];
  return (
    <section style={{ padding: "var(--section-pad-y) var(--section-pad-x)", background: t.bgWarm, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 40, right: 40 }}>
        <PhylaLeaf size={200} rotate={45} opacity={0.25} />
      </div>
      <div style={{ marginBottom: 64, position: "relative" }}>
        <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— REAL BENEFITS —</div>
        <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", maxWidth: 900, color: t.ink }}>
          Six things you&apos;ll <em style={{ color: t.burgundy }}>actually</em> notice.
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 24, position: "relative" }}>
        {items.map(([title, body, glyph]) => (
          <div key={title} style={{
            background: t.panel, borderRadius: 24, padding: 32,
            border: `1px solid ${t.line}`,
            display: "flex", flexDirection: "column", gap: 14,
            cursor: "pointer", transition: "transform .25s ease, box-shadow .25s ease",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${t.line}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}>
            <div style={{ fontSize: 40, color: t.burgundy, lineHeight: 1 }}>{glyph}</div>
            <h3 style={{ ...S, fontSize: 30, margin: 0, letterSpacing: "-0.02em", color: t.ink }}>{title}</h3>
            <div style={{ color: t.inkSoft, fontSize: 15, lineHeight: 1.55 }}>{body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Example Output ───────────────────────────────────────────────────────────
function PhylaExample() {
  const t = useT();
  return (
    <section id="example" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— A SAMPLE READING —</div>
        <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", color: t.ink }}>
          What your <em style={{ color: t.burgundy }}>letter</em> looks like.
        </h2>
      </div>
      <div style={{
        background: t.panel, borderRadius: 32, padding: "32px 24px",
        border: `1px solid ${t.line}`,
        display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 40,
      }}>
        {/* Readings */}
        <div>
          <div style={{ fontSize: 12, color: t.inkMute, letterSpacing: "0.15em", marginBottom: 12, ...MM }}>FOR</div>
          <div style={{ ...S, fontSize: 28, marginBottom: 4, color: t.ink }}>Sample subject</div>
          <div style={{ color: t.inkSoft, fontSize: 14, marginBottom: 32 }}>F · 34 · gym 4×/wk · mid energy</div>
          <div style={{ fontSize: 12, color: t.inkMute, letterSpacing: "0.15em", marginBottom: 16, ...MM }}>READING</div>
          {[["Energy", 72, t.burgundy], ["Sleep", 61, t.sage], ["Recovery", 80, "#a87a52"]].map(([label, val, color]) => (
            <div key={label as string} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: t.ink }}>
                <span>{label}</span>
                <span style={{ color: color as string, fontWeight: 500 }}>{val}<span style={{ color: t.inkMute }}>/100</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: t.bg, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${val}%`, background: color as string, borderRadius: 6, animation: "phyla-bar 1.4s ease-out" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Stack */}
        <div style={{ borderLeft: `1px solid ${t.line}`, borderRight: `1px solid ${t.line}`, padding: "0 40px" }}>
          <div style={{ fontSize: 12, color: t.inkMute, letterSpacing: "0.15em", marginBottom: 16, ...MM }}>YOUR STACK</div>
          {[
            ["Vitamin D3", "energy & immunity", "2000 IU", "☀", t.burgundy],
            ["Omega-3 EPA/DHA", "heart, brain, recovery", "1 g", "☀", t.burgundy],
            ["Creatine Mono", "strength & cognition", "5 g", "☀", t.burgundy],
            ["Magnesium Glycinate", "sleep & relaxation", "400 mg", "☾", t.sage],
            ["Ashwagandha", "stress response", "600 mg", "☾", t.sage],
          ].map(([name, why, dose, when, color]) => (
            <div key={name as string} style={{ padding: "16px 0", borderBottom: `1px solid ${t.line}`, display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 22, color: color as string, width: 28 }}>{when}</span>
              <div style={{ flex: 1 }}>
                <div style={{ ...S, fontSize: 22, color: t.ink }}>{name}</div>
                <div style={{ color: t.inkSoft, fontSize: 13 }}>{why}</div>
              </div>
              <div style={{ color: t.inkMute, fontSize: 13, ...MM }}>{dose}</div>
            </div>
          ))}
        </div>

        {/* Day */}
        <div>
          <div style={{ fontSize: 12, color: t.inkMute, letterSpacing: "0.15em", marginBottom: 16, ...MM }}>YOUR DAY</div>
          {[
            ["07:30", "Morning", "D3, Omega-3, Creatine with breakfast", t.burgundy],
            ["17:00", "Pre-train", "Creatine top-up on training days", t.sage],
            ["22:00", "Evening", "Magnesium + Ashwagandha 30m before bed", t.sageDeep],
          ].map(([time, label, body, color]) => (
            <div key={time as string} style={{ marginBottom: 24, paddingLeft: 16, borderLeft: `2px solid ${color}` }}>
              <div style={{ fontSize: 12, color: color as string, letterSpacing: "0.05em", ...MM }}>{time} · {label}</div>
              <div style={{ fontSize: 14, color: t.ink, marginTop: 4, lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
          <Link href="/quiz" style={{
            marginTop: 12, display: "block", width: "100%",
            background: t.ink, color: t.bg, border: "none", textDecoration: "none",
            padding: "16px", borderRadius: 999, fontWeight: 500, fontSize: 14,
            textAlign: "center", cursor: "pointer",
          }}>
            Begin your analysis →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Ingredient Spotlight ─────────────────────────────────────────────────────
function PhylaIngredients() {
  const t = useT();
  const [active, setActive] = useState(0);
  const items = [
    { name: "Magnesium Glycinate", form: "chelated · 400mg", evidence: "strong", for: "Sleep · stress · muscle relaxation", body: "A bioavailable form of magnesium that supports deep sleep cycles, calms the nervous system, and helps muscles release after training.", hue: "#7a6d92" },
    { name: "Ashwagandha (KSM-66)", form: "standardised root · 600mg", evidence: "strong", for: "Stress · resilience · sleep onset", body: "A clinically-studied adaptogen that lowers cortisol response under chronic stress while preserving daytime alertness.", hue: "#a3604a" },
    { name: "Omega-3 (EPA/DHA)", form: "triglyceride · 1g", evidence: "strong", for: "Heart · brain · recovery", body: "Polyunsaturated fats that support cardiovascular health, mood, and the inflammation curve after hard sessions.", hue: "#d4a96a" },
    { name: "Creatine Monohydrate", form: "micronized · 5g", evidence: "very strong", for: "Strength · cognition · recovery", body: "One of the most-studied supplements in existence. Improves output, recovery, and short-term memory under load.", hue: "#688a6b" },
    { name: "Vitamin D3 (K2)", form: "cholecalciferol · 2000IU", evidence: "strong", for: "Energy · bone · immune", body: "Supports calcium use, mood, immune signalling. Particularly relevant if you spend most days indoors or live above 40°.", hue: "#c4944a" },
  ];
  const cur = items[active];
  return (
    <section id="ingredients" style={{ padding: "var(--section-pad-y) var(--section-pad-x)", borderTop: `1px solid ${t.line}` }}>
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— THE APOTHECARY —</div>
        <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", color: t.ink, maxWidth: 900 }}>
          Every ingredient, <em style={{ color: t.burgundy }}>explained.</em>
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-2-cols)", gap: 48, alignItems: "stretch" }}>
        <div>
          {items.map((item, i) => (
            <div key={item.name} onClick={() => setActive(i)} style={{
              padding: "20px 0", borderBottom: `1px solid ${t.line}`,
              display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
              opacity: active === i ? 1 : 0.55, transition: "opacity .25s",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999, background: item.hue, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fbf6ec", ...S, fontSize: 14, fontStyle: "italic",
              }}>0{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...S, fontSize: 26, color: t.ink, letterSpacing: "-0.01em" }}>{item.name}</div>
                <div style={{ fontSize: 13, color: t.inkSoft }}>{item.for}</div>
              </div>
              <div style={{ fontSize: 11, color: t.sage, letterSpacing: "0.1em", ...MM }}>{item.evidence.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: t.panel, borderRadius: 28, padding: 40, border: `1px solid ${t.line}`,
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <div style={{
            width: 120, height: 180,
            background: `radial-gradient(ellipse at center, ${cur.hue}33, transparent 70%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto",
          }}>
            <svg width="100" height="160" viewBox="0 0 64 98">
              <rect x="25" y="4" width="14" height="8" rx="1.5" fill={t.sage} />
              <rect x="22" y="11" width="20" height="4" fill={t.sage} opacity="0.85" />
              <path d="M14 18 Q14 16 16 16 L48 16 Q50 16 50 18 L50 90 Q50 94 46 94 L18 94 Q14 94 14 90 Z" fill={cur.hue} />
              <rect x="18" y="42" width="28" height="38" rx="3" fill={t.bottleCream} opacity="0.94" />
              <text x="32" y="62" textAnchor="middle" fill={t.ink} fontFamily="Instrument Serif" fontSize="9" fontStyle="italic">
                {cur.name.split(" ")[0].toLowerCase()}
              </text>
            </svg>
          </div>
          <div style={{ ...S, fontSize: 36, color: t.ink, letterSpacing: "-0.02em" }}>{cur.name}</div>
          <div style={{ fontSize: 13, color: t.inkSoft, ...MM }}>{cur.form}</div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: t.inkSoft, margin: 0 }}>{cur.body}</p>
          <div style={{ display: "flex", gap: 24, marginTop: 8, paddingTop: 20, borderTop: `1px solid ${t.line}` }}>
            <div>
              <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: "0.1em", ...MM }}>EVIDENCE</div>
              <div style={{ ...S, fontSize: 22, color: t.sage, marginTop: 4 }}>{cur.evidence}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: "0.1em", ...MM }}>BEST FOR</div>
              <div style={{ ...S, fontSize: 22, color: t.burgundy, marginTop: 4 }}>{cur.for.split(" · ")[0]}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function PhylaTestimonials() {
  const t = useT();
  const testimonials = [
    ["The recommendations actually matched my lifestyle — finally something that adapts to me.", "James T.", "Endurance runner"],
    ["I finally understood what supplements were useful for me. The why is what changed everything.", "Sarah M.", "Busy professional"],
    ["Simple, fast, and personal. The future of wellness, really. I look forward to my evening blend.", "Daniel K.", "Longevity nerd"],
  ];
  const avatarBgs = ["#e8d9c5", "#cfdcc8", "#e8c8b6"];
  return (
    <section style={{ padding: "var(--section-pad-y) var(--section-pad-x)", background: t.bgWarm }}>
      <div style={{ marginBottom: 56, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— FROM OUR COMMUNITY —</div>
        <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", color: t.ink }}>
          12,000 quieter mornings.
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 24 }}>
        {testimonials.map(([quote, name, role], i) => (
          <div key={name} style={{
            background: t.panel, borderRadius: 24, padding: 36, border: `1px solid ${t.line}`,
            display: "flex", flexDirection: "column", gap: 18,
            transform: i === 1 ? "translateY(-20px)" : "none",
          }}>
            <span style={{ ...S, fontSize: 80, color: t.burgundy, lineHeight: 0.5, height: 40 }}>&ldquo;</span>
            <div style={{ ...S, fontSize: 22, lineHeight: 1.35, color: t.ink, letterSpacing: "-0.01em" }}>{quote}</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${t.line}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: avatarBgs[i], flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: t.ink }}>{name}</div>
                <div style={{ color: t.inkSoft, fontSize: 13 }}>{role}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 1, color: t.burgundy }}>
                {Array.from({ length: 5 }).map((_, j) => <span key={j} style={{ fontSize: 12 }}>★</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function PhylaFAQ() {
  const t = useT();
  const [open, setOpen] = useState<number>(0);
  const faqs = [
    ["Is this medical advice?", "No. Phyla offers educational guidance based on your inputs and the published evidence. For diagnosis or treatment, please consult a clinician."],
    ["How accurate are the recommendations?", "Each suggestion is scored against peer-reviewed studies and surfaced with its strength of evidence. The blend evolves as you re-rate how you feel."],
    ["How long does the analysis take?", "Most people finish in about a minute. You can save your progress and return whenever."],
    ["Do I need to take supplements at all?", "Maybe not — and Phyla will tell you. We show you where lifestyle alone is enough, and where a supplement may actually help."],
    ["Can a beginner use this?", "Yes. Every recommendation comes with plain-language reasoning, exact dose, and the time of day to take it."],
  ];
  return (
    <section style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-2-cols)", gap: 64 }}>
        <div>
          <div style={{ fontSize: 13, color: t.sage, marginBottom: 16, letterSpacing: "0.1em", ...MM }}>— GENTLE ANSWERS —</div>
          <h2 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.02em", color: t.ink, lineHeight: 1 }}>
            Common <em style={{ color: t.burgundy }}>questions</em>.
          </h2>
          <p style={{ color: t.inkSoft, marginTop: 24, fontSize: 16, lineHeight: 1.6 }}>
            Still wondering something? Our concierge replies in under a day.
          </p>
        </div>
        <div>
          {faqs.map(([q, a], i) => (
            <div key={q} style={{ borderTop: `1px solid ${t.line}`, padding: "24px 0", cursor: "pointer" }} onClick={() => setOpen(open === i ? -1 : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                <span style={{ ...S, fontSize: 26, letterSpacing: "-0.02em", color: t.ink }}>{q}</span>
                <span style={{
                  width: 32, height: 32, borderRadius: 999, border: `1px solid ${t.ink}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: t.ink, flexShrink: 0,
                  transition: "transform .3s", transform: open === i ? "rotate(45deg)" : "none",
                }}>+</span>
              </div>
              <div style={{
                maxHeight: open === i ? 200 : 0, overflow: "hidden",
                transition: "max-height .4s, margin .3s, opacity .3s",
                opacity: open === i ? 1 : 0, marginTop: open === i ? 14 : 0,
                color: t.inkSoft, fontSize: 16, lineHeight: 1.55,
              }}>{a}</div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${t.line}` }} />
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function PhylaCTA() {
  const t = useT();
  return (
    <section style={{ padding: "var(--hero-pad-y) var(--section-pad-x)" }}>
      <div style={{
        background: `linear-gradient(135deg, ${t.burgundyDeep}, ${t.burgundy})`,
        borderRadius: 32, padding: "var(--section-pad-y) calc(var(--section-pad-x) + 8px)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, opacity: 0.25 }}>
          <PhylaLeaf size={300} rotate={30} color="#f8e1d6" />
        </div>
        <div style={{ position: "absolute", bottom: -60, left: -60, opacity: 0.18 }}>
          <PhylaLeaf size={260} rotate={-120} color="#f8e1d6" />
        </div>
        <div style={{ position: "relative", maxWidth: 800 }}>
          <h2 style={{ ...S, fontSize: "var(--section-h2)", color: "#fbf6ec", margin: "0 0 24px", letterSpacing: "-0.025em", lineHeight: 1 }}>
            Begin your <em style={{ color: "#f8e1d6" }}>ritual</em>.
          </h2>
          <p style={{ color: "rgba(251,246,236,0.82)", fontSize: 19, maxWidth: 540, marginBottom: 36, lineHeight: 1.5 }}>
            Free, instant, no signup required. Sixty seconds from your first question to a stack you&apos;ll actually keep.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <Link href="/quiz" style={{
              background: "#fbf6ec", color: t.burgundyDeep, border: "none", textDecoration: "none",
              padding: "20px 32px", borderRadius: 999, fontWeight: 600, fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            }}>
              Start free analysis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#example" style={{
              background: "transparent", color: "#fbf6ec", textDecoration: "none",
              border: "1px solid #fbf6ec", padding: "20px 28px", borderRadius: 999,
              fontWeight: 500, fontSize: 16, cursor: "pointer",
            }}>
              See example
            </a>
          </div>
          <div style={{ display: "flex", gap: 32, color: "rgba(251,246,236,0.6)", marginTop: 32, fontSize: 13 }}>
            <span>· Free</span>
            <span>· Instant</span>
            <span>· No signup</span>
            <span>· <Counter target={12094} /> rituals composed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function PhylaFooter() {
  const t = useT();
  const cols: [string, [string, string][]][] = [
    ["Product", [
      ["Pre-made stacks", "/stacks"],
      ["Take the quiz", "/quiz"],
      ["How it works", "#how-it-works"],
      ["Ingredients", "#ingredients"],
    ]],
    ["Studio", [
      ["About Phyla", "/about"],
      ["Journal", "/journal"],
      ["Contact", "/contact"],
    ]],
    ["Care", [
      ["Help & FAQ", "/help"],
      ["Contact us", "/contact"],
    ]],
    ["Legal", [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Medical Disclaimer", "/disclaimer"],
      ["Cookies", "/cookies"],
    ]],
  ];
  return (
    <footer style={{
      padding: "40px var(--nav-pad-x) 48px", borderTop: `1px solid ${t.line}`,
      display: "grid", gridTemplateColumns: "var(--footer-cols)", gap: 40,
    }}>
      <div>
        <PhylaLogo />
        <p style={{ fontSize: 14, color: t.inkSoft, lineHeight: 1.55, marginTop: 16, maxWidth: 320 }}>
          AI-guided supplement rituals composed from clean, evidence-led ingredients available on iHerb.
        </p>
        <div style={{ fontSize: 11, color: t.inkMute, marginTop: 22, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} Phyla. For informational purposes only — not medical advice.
          <br />Phyla is an iHerb affiliate.
        </div>
      </div>
      {cols.map(([heading, links]) => (
        <div key={heading}>
          <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: "0.1em", marginBottom: 14, ...MM }}>
            {heading.toUpperCase()}
          </div>
          {links.map(([label, href]) => (
            <Link key={label} href={href} style={{ display: "block", fontSize: 14, color: t.ink, marginBottom: 10, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      ))}
    </footer>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [dark, setDark] = useState(false);
  const t = dark ? phylaTheme.dark : phylaTheme.light;

  // Safety net: if Supabase routes back to "/?code=..." (when Site URL is set to root),
  // forward to /auth/callback so the session can be exchanged.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
    }
  }, []);

  return (
    <Ctx.Provider value={t}>
      <div style={{
        fontFamily: "var(--font-sans)", color: t.ink, background: t.bg,
        minHeight: "100vh", letterSpacing: "-0.005em",
        transition: "background .4s ease, color .4s ease",
      }}>
        <PhylaNav dark={dark} setDark={setDark} />
        <PhylaHero />
        <PhylaTrust />
        <PhylaMarquee />
        <PhylaHow />
        <PhylaBenefits />
        <PhylaExample />
        <PhylaIngredients />
        <PhylaTestimonials />
        <PhylaFAQ />
        <PhylaCTA />
        <PhylaFooter />
      </div>
    </Ctx.Provider>
  );
}
