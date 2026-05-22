"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { recommend, Recommendation, Supplement } from "@/lib/supplements";
import { iherbLink, iherbProductLink, IHERB_HOME } from "@/lib/iherb";
import { getProducts, getPrimaryProduct, ProductOption } from "@/lib/products";
import { trackQuizSubmission, trackClick } from "@/lib/track";

// ─── Theme ───────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function productHref(p: ProductOption): string {
  if (p.productPath) return iherbProductLink(p.productPath);
  return iherbLink(p.searchQuery ?? `${p.brand} ${p.productName}`);
}

// ─── UI primitives ───────────────────────────────────────────────────────────
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

/**
 * Branded product visual — the "pill" of the design.
 * Displays the brand prominently like real product packaging.
 */
function ProductVisual({
  brand, name, bg, ink, height = 160,
}: { brand: string; name: string; bg: string; ink: string; height?: number }) {
  // Split brand into 1-2 lines for tall display
  const parts = brand.split(" ");
  return (
    <div style={{
      background: bg, borderRadius: 12, height,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "14px 16px", position: "relative", overflow: "hidden",
      border: `1px solid ${ink}10`,
    }}>
      {/* Top: brand badge */}
      <div style={{
        fontSize: 9, ...MM, color: ink, opacity: 0.7,
        letterSpacing: "0.15em",
      }}>
        VERIFIED · iHerb
      </div>

      {/* Center: brand letters */}
      <div style={{
        ...S, fontSize: 30, lineHeight: 0.9, color: ink, letterSpacing: "-0.02em",
        fontStyle: parts.length > 1 ? "italic" : "normal",
      }}>
        {parts.length === 1
          ? brand.toLowerCase()
          : (
            <>
              <div>{parts[0]}</div>
              <div style={{ fontStyle: "normal", fontSize: 20 }}>{parts.slice(1).join(" ")}</div>
            </>
          )
        }
      </div>

      {/* Bottom: product name */}
      <div style={{
        fontSize: 10, color: ink, opacity: 0.8, fontWeight: 500,
        lineHeight: 1.3, marginTop: "auto",
      }}>
        {name}
      </div>
    </div>
  );
}

/**
 * Rating stars + count
 */
function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: th.inkSoft }}>
      <span style={{ color: "#d97706", fontSize: 13 }}>★</span>
      <span style={{ fontWeight: 600, color: th.ink }}>{rating.toFixed(1)}</span>
      <span style={{ color: th.inkMute }}>· {count.toLocaleString()} reviews</span>
    </div>
  );
}

/**
 * One product option card (used inside the modal).
 */
function ProductCard({ option, supplement }: { option: ProductOption; supplement: Supplement }) {
  const badgeColors: Record<ProductOption["badge"], { bg: string; ink: string }> = {
    "Bestseller":    { bg: "#fef3c7", ink: "#854d0e" },
    "Editor's Pick": { bg: "#d1fae5", ink: "#065f46" },
    "Best Value":    { bg: "#dbeafe", ink: "#1e40af" },
    "Premium":       { bg: "#ede9fe", ink: "#5b21b6" },
    "Vegan":         { bg: "#d1fae5", ink: "#065f46" },
  };
  const bc = badgeColors[option.badge];

  return (
    <div style={{
      background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
      padding: 16, display: "flex", flexDirection: "column", gap: 12,
      transition: "transform .2s ease, box-shadow .2s ease",
    }}>
      {/* Product visual */}
      <ProductVisual brand={option.brand} name={option.productName} bg={option.brandBg} ink={option.brandInk} height={170} />

      {/* Badge */}
      <div style={{
        alignSelf: "flex-start",
        padding: "3px 10px", borderRadius: 999,
        background: bc.bg, color: bc.ink,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      }}>
        {option.badge}
      </div>

      {/* Name & size */}
      <div>
        <div style={{ ...S, fontSize: 20, color: th.ink, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {option.productName}
        </div>
        <div style={{ fontSize: 12, color: th.inkMute, marginTop: 3 }}>
          by {option.brand} · {option.size}
        </div>
      </div>

      {/* Rating */}
      <Stars rating={option.rating} count={option.reviewCount} />

      {/* Price + CTA */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ ...S, fontSize: 28, color: th.ink, letterSpacing: "-0.02em" }}>
          ${option.approxPrice.toFixed(2)}
          <span style={{ fontSize: 12, color: th.inkMute, ...MM, marginLeft: 6 }}>approx</span>
        </div>
        <a
          href={productHref(option)}
          target="_blank" rel="noopener noreferrer sponsored"
          onClick={() => { trackClick(supplement, option, "modal").catch(() => {}); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            background: th.ink, color: th.bg, textDecoration: "none",
            fontSize: 14, fontWeight: 500,
          }}
        >
          Buy on iHerb
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/**
 * Modal that displays the 3 product options for a given supplement.
 */
function ProductModal({ supp, options, onClose }: {
  supp: Supplement; options: ProductOption[]; onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(28,29,24,0.55)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px",
        animation: "phyla-fade-in .25s ease-out",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: th.bg, borderRadius: 24, padding: 32,
          maxWidth: 1080, width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          animation: "phyla-rise .35s cubic-bezier(.4,0,.2,1)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 18, right: 18,
          width: 36, height: 36, borderRadius: 999,
          background: th.paper, border: `1px solid ${th.line}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: th.ink,
        }}>×</button>

        {/* Header */}
        <div style={{ marginBottom: 22, maxWidth: 720 }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 12 }}>
            CHOOSE YOUR PRODUCT
          </div>
          <h2 style={{ ...S, fontSize: 42, color: th.ink, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            {supp.name}
          </h2>
          <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Three top-rated options on iHerb. All include your affiliate code.
            <br />
            <span style={{ color: th.inkMute, fontSize: 13 }}>Target dose: {supp.dose} · {supp.purpose}</span>
          </p>
        </div>

        {/* Product grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {options.map(opt => (
            <ProductCard key={opt.brand + opt.productName} option={opt} supplement={supp} />
          ))}
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 11, color: th.inkMute, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Prices are approximate and may vary on iHerb. We may earn a commission on qualifying purchases — at no extra cost to you.
        </p>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [data, setData] = useState<QuizData | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeSupp, setActiveSupp] = useState<Supplement | null>(null);

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
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
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

        {/* Stack with product cards */}
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
            {rec.supplements.map((s, i) => {
              const primary = getPrimaryProduct(s.id);
              const productCount = getProducts(s.id).length;
              return (
                <div key={s.id} style={{
                  background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
                  padding: 18, display: "flex", flexDirection: "column", gap: 14,
                  animation: `phyla-rise .5s ${i * 0.06}s ease-out both`,
                }}>
                  {/* Top: branded product visual + timing tag */}
                  <div style={{ position: "relative" }}>
                    {primary ? (
                      <ProductVisual
                        brand={primary.brand}
                        name={primary.productName}
                        bg={primary.brandBg}
                        ink={primary.brandInk}
                        height={170}
                      />
                    ) : (
                      <div style={{
                        background: th.bgWarm, borderRadius: 12, height: 170,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: th.inkMute, fontSize: 12, ...MM,
                      }}>
                        {s.brand.toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "4px 10px", borderRadius: 999,
                      background: `${TIMING_COLOR[s.timing]}1f`, color: TIMING_COLOR[s.timing],
                      fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 5,
                      backdropFilter: "blur(8px)",
                    }}>
                      <span>{TIMING_GLYPH[s.timing]}</span>{TIMING_LABEL[s.timing]}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <h3 style={{ ...S, fontSize: 24, margin: 0, letterSpacing: "-0.01em", color: th.ink, lineHeight: 1.15 }}>
                      {s.name}
                    </h3>
                    <div style={{ fontSize: 12, color: th.inkMute, ...MM, marginTop: 4 }}>
                      {s.dose} · {s.purpose}
                    </div>
                  </div>

                  {/* Why */}
                  <p style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.55, margin: 0 }}>{s.why}</p>

                  {/* Footer: evidence + cta */}
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      fontSize: 11, color: th.sage, ...MM, letterSpacing: "0.08em",
                    }}>
                      <span>{s.evidence.toUpperCase()} EVIDENCE</span>
                      <span style={{ color: th.inkMute }}>~${s.monthlyCost}/MO</span>
                    </div>

                    <button
                      onClick={() => setActiveSupp(s)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "12px 16px", borderRadius: 12,
                        background: th.ink, color: th.bg, border: "none", cursor: "pointer",
                        fontSize: 14, fontWeight: 500,
                        fontFamily: '"Inter", system-ui, sans-serif',
                        transition: "transform .15s ease",
                      }}
                    >
                      {productCount > 0 ? `Choose product · ${productCount} options` : "Find on iHerb"}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
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
            Browse iHerb directly?
          </h2>
          <p style={{ color: "rgba(251,246,236,0.85)", fontSize: 15, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            New customers get extra discounts on their first iHerb order. All products ship globally.
          </p>
          <a href={IHERB_HOME} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 28px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "#fbf6ec", color: th.burgundyDeep, textDecoration: "none",
          }}>
            Open iHerb →
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

      {/* Modal */}
      {activeSupp && (
        <ProductModal
          supp={activeSupp}
          options={getProducts(activeSupp.id)}
          onClose={() => setActiveSupp(null)}
        />
      )}
    </div>
  );
}
