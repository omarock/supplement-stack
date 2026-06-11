"use client";

/**
 * The premium "My Stack" hub on /me. A client island: reads the saved quiz from
 * localStorage, recomputes the stack with recommend() (same engine as /results),
 * and renders a premium dashboard — Stack Score hero, tabbed Stack / Today /
 * Insights / Plan, real product photos (reuses SupplementGrid), evidence-graded
 * insights (the differentiator vs opaque competitor scores), and free/premium
 * gating. Theme-aware via TH tokens; vibrant brand accents on the hero.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SupplementGrid from "@/components/SupplementGrid";
import { TH, FONTS, D, SI, MM } from "@/lib/theme";
import type { QuizData } from "@/types/quiz";
import type { Recommendation, Supplement } from "@/lib/supplements";

const EMPTY_QUIZ: QuizData = {
  age: "", gender: "", height: "", weight: "", goals: [],
  sleep: 0, sleepHours: "", sleepIssues: [], stress: 0, mood: 0, mindConcerns: [],
  energy: 0, afternoonCrash: "", workoutFreq: "", workoutType: "",
  diet: "", caffeine: "", alcohol: "", bodyConcerns: [],
  pregnant: "", allergies: [], conditions: [], budget: "", veganOnly: false,
};

type Ev = Supplement["evidence"];
const EV: Record<Ev, { grade: string; label: string; score: number; bg: string; fg: string; dot: string }> = {
  "very strong": { grade: "A", label: "Strong evidence", score: 100, bg: "color-mix(in srgb, var(--c-sage) 16%, transparent)", fg: "var(--c-sage-deep)", dot: "#2faa6e" },
  "strong": { grade: "B", label: "Solid evidence", score: 84, bg: "color-mix(in srgb, var(--c-sage) 10%, transparent)", fg: "var(--c-sage-deep)", dot: "#5ba373" },
  "moderate": { grade: "C", label: "Emerging evidence", score: 66, bg: "color-mix(in srgb, var(--c-amber) 20%, transparent)", fg: "var(--c-amber-deep)", dot: "#e8a04a" },
};

const TIMING_ORDER = ["morning", "midday", "pre-train", "evening"] as const;
const TIMING_LABEL: Record<string, string> = { morning: "Morning", midday: "Midday", "pre-train": "Pre-workout", evening: "Evening" };
const TIMING_GLYPH: Record<string, string> = { morning: "☀", midday: "◐", "pre-train": "⚡", evening: "☾" };

const CAT_LABEL: Record<string, string> = {
  vitamins: "Vitamins", minerals: "Minerals", "amino-acids": "Amino acids", "omega-fats": "Omega-3",
  adaptogens: "Adaptogens", nootropics: "Focus", antioxidants: "Antioxidants", joint: "Joints",
  gut: "Gut", sleep: "Sleep", hormonal: "Hormones", heart: "Heart", performance: "Performance",
  greens: "Greens", specialty: "Specialty",
};

const SCORE_KEYS: { key: keyof Recommendation["scores"]; label: string; color: string }[] = [
  { key: "energy", label: "Energy", color: "#0a2540" },
  { key: "sleep", label: "Sleep", color: "#5ba373" },
  { key: "recovery", label: "Recovery", color: "#a87a52" },
  { key: "focus", label: "Focus", color: "#688a6b" },
  { key: "stress", label: "Stress", color: "#7a6d92" },
  { key: "mood", label: "Mood", color: "#c2683f" },
];

type Tab = "stack" | "today" | "insights" | "plan";

export default function MyStackHub({ premium }: { premium: boolean }) {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("stack");
  const [filter, setFilter] = useState<string | null>(null);
  const [logged, setLogged] = useState<Record<string, boolean>>({});
  const [todayKey, setTodayKey] = useState<string>("");

  // Persist today's dose check-ins so the ritual survives a reload, and reset
  // automatically at the day boundary (old day-keys are swept on load).
  useEffect(() => {
    const key = `sd-me-today-${new Date().toISOString().slice(0, 10)}`;
    setTodayKey(key);
    try {
      const raw = localStorage.getItem(key);
      if (raw) setLogged(JSON.parse(raw));
      const stale: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sd-me-today-") && k !== key) stale.push(k);
      }
      stale.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!todayKey) return;
    try { localStorage.setItem(todayKey, JSON.stringify(logged)); } catch { /* ignore */ }
  }, [logged, todayKey]);

  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizData");
    if (!saved) { setLoaded(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const parsed = JSON.parse(saved);
        const { recommend } = await import("@/lib/supplements");
        if (cancelled) return;
        setRec(recommend({ ...EMPTY_QUIZ, ...parsed }));
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const supplements = rec?.supplements ?? [];

  const stackScore = useMemo(() => {
    if (!supplements.length) return 0;
    const avg = supplements.reduce((a, s) => a + EV[s.evidence].score, 0) / supplements.length;
    const coverage = Math.min(supplements.length / 6, 1);
    return Math.round(avg * 0.8 + coverage * 20);
  }, [supplements]);
  const scoreColor = stackScore >= 85 ? "#2faa6e" : stackScore >= 70 ? "#5ba373" : "#e8a04a";

  const cats = useMemo(() => {
    const set = new Map<string, number>();
    for (const s of supplements) { const c = s.category ?? "specialty"; set.set(c, (set.get(c) ?? 0) + 1); }
    return [...set.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [supplements]);

  const filtered = filter ? supplements.filter(s => (s.category ?? "specialty") === filter) : supplements;
  const totalCost = supplements.reduce((a, s) => a + s.monthlyCost, 0);

  // ── States ─────────────────────────────────────────────────────────────────
  if (!loaded) return <Skeleton />;

  if (!supplements.length) {
    return (
      <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
        <div style={{ ...MM, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: TH.sageDeep, marginBottom: 12 }}>Your stack</div>
        <h2 style={{ ...D, fontWeight: 500, fontSize: "clamp(26px,6vw,36px)", color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>
          Build your <span style={{ ...SI, color: TH.sageDeep }}>stack</span>.
        </h2>
        <p style={{ fontSize: 15, color: TH.inkSoft, lineHeight: 1.55, maxWidth: 440, margin: "10px auto 22px" }}>
          Take the 2-minute quiz and we&apos;ll compose an evidence-graded stack matched to your goals, then it lives here.
        </p>
        <Link href="/quiz" style={primaryBtn}>Take the quiz →</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Stack Score hero (vibrant premium band) ── */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 22, padding: "26px 26px 24px",
        background: "linear-gradient(135deg, #0b3a31 0%, #14614d 52%, #2f9070 100%)", color: "#fff",
        boxShadow: "0 22px 50px -26px rgba(11,58,49,0.6)",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: 999, background: "radial-gradient(circle, rgba(240,180,158,0.35), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ScoreRing value={stackScore} color={scoreColor} />
            <div>
              <div style={{ ...MM, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Stack score</div>
              <div style={{ ...D, fontWeight: 500, fontSize: 22, letterSpacing: "-0.01em", marginBottom: 3 }}>
                {stackScore >= 85 ? "Excellent foundation" : stackScore >= 70 ? "Strong stack" : "Good start"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.45, maxWidth: 330 }}>
                Graded on real human evidence and goal coverage, not an opaque score. Open Insights to see every grade.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            <span style={{
              ...MM, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 999,
              background: premium ? "linear-gradient(180deg,#f5d08a,#e0a040)" : "rgba(255,255,255,0.16)",
              color: premium ? "#3a2a06" : "#fff", whiteSpace: "nowrap",
            }}>{premium ? "★ PREMIUM" : "FREE PLAN"}</span>
            <div style={{ display: "flex", gap: 16, ...MM, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              <span><strong style={{ color: "#fff", fontSize: 15 }}>{supplements.length}</strong> products</span>
              <span><strong style={{ color: "#fff", fontSize: 15 }}>~${totalCost}</strong>/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {([["stack", "Stack"], ["today", "Today"], ["insights", "Insights"], ["plan", "Plan"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)} style={{
            ...D, fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 999, cursor: "pointer",
            border: tab === k ? "none" : `1px solid ${TH.edge}`,
            background: tab === k ? `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})` : TH.surface,
            color: tab === k ? "#fff" : TH.inkSoft,
            boxShadow: tab === k ? "0 8px 18px -8px color-mix(in srgb, var(--c-sage) 55%, transparent)" : "none",
            transition: "all .15s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === "stack" && (
        <div style={{ ...card }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <Pill active={filter === null} onClick={() => setFilter(null)} label="All" count={supplements.length} />
            {cats.map(c => <Pill key={c} active={filter === c} onClick={() => setFilter(c)} label={CAT_LABEL[c] ?? c} count={supplements.filter(s => (s.category ?? "specialty") === c).length} />)}
            <Link href="/quiz" style={{ ...MM, fontSize: 12.5, fontWeight: 600, color: TH.sageDeep, textDecoration: "none", marginLeft: "auto", alignSelf: "center" }}>↻ Edit / retake</Link>
          </div>
          <SupplementGrid supplements={filtered} source="me-stack" />
        </div>
      )}

      {tab === "today" && (
        <TodayPanel supplements={supplements} logged={logged} setLogged={setLogged} />
      )}

      {tab === "insights" && (
        <InsightsPanel rec={rec!} supplements={supplements} premium={premium} />
      )}

      {tab === "plan" && (
        <PlanPanel premium={premium} />
      )}

      {/* ── Premium upsell (free only) ── */}
      {!premium && (
        <div style={{ borderRadius: 20, padding: 22, background: "color-mix(in srgb, var(--c-sage) 9%, var(--c-surface))", border: `1px solid color-mix(in srgb, var(--c-sage) 30%, transparent)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✦</span>
            <span style={{ ...D, fontWeight: 600, fontSize: 17, color: TH.ink }}>Premium unlocks the rest</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10, marginBottom: 16 }}>
            {[["A coach that knows your stack", "Ask anything, with full memory"], ["30-day wellness trends", "See what's actually working"], ["Bloodwork history & re-test", "Track deficiencies over time"], ["Printable plan & schedule", "Your protocol, ready to print"]].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 9 }}>
                <span style={{ color: TH.sageDeep, marginTop: 2 }}>✓</span>
                <span><span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TH.ink }}>{t}</span><span style={{ display: "block", fontSize: 12.5, color: TH.muted }}>{d}</span></span>
              </div>
            ))}
          </div>
          <Link href="/pricing" style={primaryBtn}>Upgrade to Premium →</Link>
        </div>
      )}
    </div>
  );
}

// ─── Sub-panels ───────────────────────────────────────────────────────────────
function TodayPanel({ supplements, logged, setLogged }: { supplements: Supplement[]; logged: Record<string, boolean>; setLogged: (f: (p: Record<string, boolean>) => Record<string, boolean>) => void }) {
  const groups = TIMING_ORDER.map(t => ({ t, items: supplements.filter(s => s.timing === t) })).filter(g => g.items.length);
  const doneCount = supplements.filter(s => logged[s.id]).length;
  const pct = Math.round((doneCount / supplements.length) * 100);
  const allDone = doneCount === supplements.length && supplements.length > 0;
  return (
    <div style={{ ...card }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ ...D, fontWeight: 600, fontSize: 19, color: TH.ink }}>Today&apos;s doses</div>
          <div style={{ fontSize: 13, color: TH.muted }}>{doneCount} of {supplements.length} checked · a 60-second ritual</div>
        </div>
        <Link href="/track" style={{
          ...D, display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 999,
          textDecoration: "none", background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
          fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 18px -8px color-mix(in srgb, var(--c-sage) 60%, transparent)",
        }}>Open tracker →</Link>
      </div>
      {allDone ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 12, marginBottom: 18, background: "color-mix(in srgb, var(--c-sage) 14%, transparent)", border: `1px solid color-mix(in srgb, var(--c-sage) 32%, transparent)` }}>
          <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden>✓</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", ...D, fontWeight: 600, fontSize: 14.5, color: TH.ink }}>Stack complete for today.</span>
            <span style={{ display: "block", fontSize: 12.5, color: TH.muted }}>Log it in the tracker to build your streak.</span>
          </span>
          <Link href="/track" style={{ ...MM, fontSize: 12.5, fontWeight: 600, color: TH.sageDeep, textDecoration: "none", whiteSpace: "nowrap" }}>Log →</Link>
        </div>
      ) : (
        <div style={{ height: 7, borderRadius: 999, background: TH.edge, overflow: "hidden", marginBottom: 18 }}>
          <div style={{ width: `${Math.max(3, pct)}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${TH.sage}, ${TH.sageDeep})`, transition: "width .3s" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map(g => (
          <div key={g.t}>
            <div style={{ ...MM, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: TH.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 13 }}>{TIMING_GLYPH[g.t]}</span>{TIMING_LABEL[g.t]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map(s => {
                const on = !!logged[s.id];
                return (
                  <button key={s.id} type="button" onClick={() => setLogged(p => ({ ...p, [s.id]: !p[s.id] }))} style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer",
                    padding: "11px 14px", borderRadius: 12, border: `1px solid ${TH.edge}`,
                    background: on ? "color-mix(in srgb, var(--c-sage) 12%, transparent)" : TH.surface, transition: "all .15s",
                  }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: on ? TH.sage : "transparent", border: on ? "none" : `1.5px solid ${TH.edgeStrong}`, color: "#fff", fontSize: 13 }}>{on ? "✓" : ""}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", ...D, fontWeight: 600, fontSize: 14.5, color: TH.ink, textDecoration: on ? "line-through" : "none", opacity: on ? 0.6 : 1 }}>{s.name}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: TH.muted }}>{s.dose} · {s.purpose}</span>
                    </span>
                    <span style={{ ...evPill(s.evidence) }}>{EV[s.evidence].grade}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPanel({ rec, supplements, premium }: { rec: Recommendation; supplements: Supplement[]; premium: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...card }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ ...D, fontWeight: 600, fontSize: 19, color: TH.ink }}>Your wellness reading</div>
          <span style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.05em" }}>BASELINE · FROM YOUR QUIZ</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
          {SCORE_KEYS.map(({ key, label, color }) => {
            const v = rec.scores[key];
            return (
              <div key={key} style={{ background: TH.bg, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: TH.inkSoft }}>{label}</span>
                  <span style={{ fontFamily: FONTS.serifItalic, fontStyle: "normal", fontSize: 24, color, lineHeight: 1 }}>{v}<span style={{ fontSize: 12, color: TH.muted }}>/100</span></span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: TH.edge, overflow: "hidden" }}>
                  <div style={{ width: `${v}%`, height: "100%", borderRadius: 999, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/track" style={{ ...MM, display: "inline-block", marginTop: 16, fontSize: 12.5, fontWeight: 600, color: TH.sageDeep, textDecoration: "none" }}>
          {premium ? "See your full trends →" : "Start tracking to watch these climb →"}
        </Link>
      </div>

      {/* Evidence breakdown — the differentiator */}
      <div style={{ ...card }}>
        <div style={{ ...D, fontWeight: 600, fontSize: 19, color: TH.ink, marginBottom: 4 }}>Evidence behind your stack</div>
        <div style={{ fontSize: 13, color: TH.muted, marginBottom: 16 }}>Every pick is graded on the strength of human research. No house brand, no opaque score.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {supplements.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: `1px solid ${TH.edge}` }}>
              <span style={{ ...evDot(s.evidence) }} />
              <Link href={`/ingredients/${s.id}`} style={{ flex: 1, minWidth: 0, ...D, fontWeight: 600, fontSize: 14, color: TH.ink, textDecoration: "none" }}>{s.name}</Link>
              <span style={{ ...evPill(s.evidence) }}>{EV[s.evidence].grade} · {EV[s.evidence].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanPanel({ premium }: { premium: boolean }) {
  const items = [
    { href: "/plan", glyph: "🗂️", title: "My Plan", desc: "Schedule, doses, what to avoid, where to buy.", cta: premium ? "Open →" : "Preview →" },
    { href: "/bloodwork", glyph: "🩸", title: "Bloodwork analysis", desc: "Turn a lab report into targeted picks.", cta: "Analyze →" },
    { href: "/track", glyph: "🔥", title: "Daily tracker", desc: "Log a 60-second check-in, build a streak.", cta: "Open →" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 14 }}>
      {items.map(it => (
        <Link key={it.href} href={it.href} style={{ ...card, display: "block", textDecoration: "none", color: "inherit", padding: "20px 22px" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden>{it.glyph}</div>
          <div style={{ ...D, fontWeight: 600, fontSize: 17, color: TH.ink, marginBottom: 4 }}>{it.title}</div>
          <div style={{ fontSize: 13.5, color: TH.muted, lineHeight: 1.5 }}>{it.desc} <span style={{ color: TH.sageDeep, fontWeight: 600 }}>{it.cta}</span></div>
        </Link>
      ))}
    </div>
  );
}

// ─── Bits ─────────────────────────────────────────────────────────────────────
function ScoreRing({ value, color }: { value: number; color: string }) {
  const r = 30, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontWeight: 600, fontSize: 26, color: "#fff" }}>{value}</div>
    </div>
  );
}

function Pill({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button type="button" onClick={onClick} style={{
      ...MM, fontSize: 12, fontWeight: 600, padding: "6px 13px", borderRadius: 999, cursor: "pointer",
      border: active ? "none" : `1px solid ${TH.edge}`,
      background: active ? TH.sageDeep : TH.surface, color: active ? "#fff" : TH.inkSoft, transition: "all .15s",
    }}>{label} <span style={{ opacity: 0.7 }}>{count}</span></button>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ height: 124, borderRadius: 22, background: "color-mix(in srgb, var(--c-ink) 6%, transparent)" }} />
      <div style={{ height: 320, borderRadius: 18, background: "color-mix(in srgb, var(--c-ink) 4%, transparent)" }} />
    </div>
  );
}

const card: React.CSSProperties = { background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "20px 22px" };
const primaryBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999, textDecoration: "none", background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", fontFamily: FONTS.display, fontWeight: 600, fontSize: 14.5, boxShadow: "0 10px 24px -8px color-mix(in srgb, var(--c-sage) 60%, transparent)" };

function evPill(ev: Ev): React.CSSProperties {
  return { ...MM, fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: EV[ev].bg, color: EV[ev].fg, whiteSpace: "nowrap" };
}
function evDot(ev: Ev): React.CSSProperties {
  return { width: 10, height: 10, borderRadius: 999, flexShrink: 0, background: EV[ev].dot };
}
