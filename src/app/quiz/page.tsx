"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Theme (matches Phyla landing page) ───────────────────────────────────────
const th = {
  bg: "#f4ede1", bgWarm: "#ebe3d3", paper: "#fbf6ec",
  ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", sageGlow: "rgba(74,106,78,0.12)",
  burgundy: "#7d2e3a", burgundyDeep: "#5a1f2a",
  line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: "var(--font-serif)", fontWeight: 400 } as const;
const MM = { fontFamily: "var(--font-mono)" } as const;

// ─── Types ────────────────────────────────────────────────────────────────────
import { QuizData } from "@/types/quiz";

const INITIAL: QuizData = {
  age: "", gender: "", goals: [],
  sleep: 0, stress: 0, energy: 0,
  workoutFreq: "", diet: "", budget: "",
};

type Updater = (updates: Partial<QuizData>) => void;
const TOTAL_STEPS = 6;

// ─── Validation ───────────────────────────────────────────────────────────────
function canProceed(step: number, d: QuizData): boolean {
  const age = parseInt(d.age);
  switch (step) {
    case 1: return d.age !== "" && age >= 13 && age <= 100 && d.gender !== "";
    case 2: return d.goals.length > 0;
    case 3: return d.sleep > 0 && d.stress > 0 && d.energy > 0;
    case 4: return d.workoutFreq !== "";
    case 5: return d.diet !== "";
    case 6: return d.budget !== "";
    default: return true;
  }
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function CardOption({ label, subtitle, selected, onClick }: {
  label: string; subtitle?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 4, textAlign: "left",
      padding: "18px 22px", borderRadius: 16, cursor: "pointer", width: "100%",
      border: selected ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
      background: selected ? th.sageGlow : th.paper,
      transition: "all .2s ease",
      outline: "none",
    }}>
      <span style={{ fontSize: 16, fontWeight: 500, color: selected ? th.sage : th.ink }}>{label}</span>
      {subtitle && <span style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.4 }}>{subtitle}</span>}
    </button>
  );
}

function GoalCard({ label, glyph, selected, onClick }: {
  label: string; glyph: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "20px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left",
      border: selected ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
      background: selected ? th.sageGlow : th.paper,
      transition: "all .2s ease", outline: "none",
    }}>
      <span style={{ fontSize: 26, lineHeight: 1 }}>{glyph}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: selected ? th.sage : th.ink, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

function ScaleRow({ title, value, labels, onChange }: {
  title: string; value: number; labels: string[]; onChange: (v: number) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 16, fontWeight: 600, color: th.ink, margin: "0 0 12px" }}>{title}</p>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 8, padding: "16px 8px", borderRadius: 14, cursor: "pointer",
            border: value === v ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
            background: value === v ? th.sageGlow : th.paper,
            transition: "all .2s ease", outline: "none",
          }}>
            <span style={{ ...S, fontSize: 32, color: value === v ? th.sage : th.ink }}>{v}</span>
            <span style={{ fontSize: 11, color: value === v ? th.sage : th.inkMute, textAlign: "center", lineHeight: 1.3 }}>
              {labels[v - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 1 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          About you.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          A quick profile so we can tailor your ritual.
        </p>
      </div>

      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: th.ink, margin: "0 0 12px" }}>
          How old are you?
        </p>
        <input
          type="number" min="13" max="100"
          placeholder="e.g. 28"
          value={d.age}
          onChange={e => u({ age: e.target.value })}
          style={{
            width: "100%", padding: "18px 22px", borderRadius: 16, fontSize: 18,
            border: d.age ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
            background: th.paper, color: th.ink, outline: "none",
            fontFamily: "var(--font-sans)", boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: th.ink, margin: "0 0 6px" }}>
          What&apos;s your biological sex?
        </p>
        <p style={{ fontSize: 13, color: th.inkSoft, margin: "0 0 14px" }}>
          Helps us personalise nutrient needs accurately.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["Male", "Testosterone-dominant physiology"],
            ["Female", "Oestrogen-dominant physiology"],
            ["Non-binary / Other", "We tailor based on your goals"],
            ["Prefer not to say", ""],
          ].map(([label, sub]) => (
            <CardOption key={label} label={label} subtitle={sub || undefined}
              selected={d.gender === label} onClick={() => u({ gender: label })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ d, u }: { d: QuizData; u: Updater }) {
  const goals = [
    ["More energy", "☀"], ["Better sleep", "☾"],
    ["Sharper focus", "✦"], ["Stress relief", "♡"],
    ["Muscle & recovery", "↺"], ["Immune support", "⊕"],
    ["Weight management", "◎"], ["General wellness", "✿"],
  ];
  const toggle = (g: string) =>
    u({ goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 2 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Your goals.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          Select all that apply — we&apos;ll prioritise accordingly.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {goals.map(([label, glyph]) => (
          <GoalCard key={label} label={label} glyph={glyph}
            selected={d.goals.includes(label)} onClick={() => toggle(label)} />
        ))}
      </div>
      {d.goals.length > 0 && (
        <p style={{ fontSize: 13, color: th.sage, ...MM, margin: 0 }}>
          ✓ {d.goals.length} goal{d.goals.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

function Step3({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 3 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          How you&apos;re feeling.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          Rate each area from 1 (very low) to 5 (excellent).
        </p>
      </div>

      <ScaleRow title="Sleep quality" value={d.sleep} onChange={v => u({ sleep: v })}
        labels={["Terrible", "Poor", "Okay", "Good", "Excellent"]} />
      <ScaleRow title="Stress level" value={d.stress} onChange={v => u({ stress: v })}
        labels={["None", "Mild", "Moderate", "High", "Overwhelming"]} />
      <ScaleRow title="Daily energy" value={d.energy} onChange={v => u({ energy: v })}
        labels={["Exhausted", "Low", "Moderate", "Good", "Vibrant"]} />
    </div>
  );
}

function Step4({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 4 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Your activity.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          Any movement counts — gym, yoga, walks, everything.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Never or rarely", "Less than once a week"],
          ["1–2× per week", "Light to moderate movement"],
          ["3–4× per week", "Regular structured training"],
          ["5+ per week", "High intensity or daily athlete"],
        ].map(([label, sub]) => (
          <CardOption key={label} label={label} subtitle={sub}
            selected={d.workoutFreq === label} onClick={() => u({ workoutFreq: label })} />
        ))}
      </div>
    </div>
  );
}

function Step5({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 5 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          How you eat.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          Your diet shapes which supplements matter most.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Omnivore", "Meat, fish, dairy, eggs — the full range"],
          ["Vegetarian", "No meat or fish, dairy and eggs are fine"],
          ["Vegan", "Fully plant-based"],
          ["Pescatarian", "Fish and seafood, no other meat"],
          ["Keto / Low-carb", "High fat, very low carbohydrate"],
          ["Other / Flexible", "Doesn't fit neatly — or changes week to week"],
        ].map(([label, sub]) => (
          <CardOption key={label} label={label} subtitle={sub}
            selected={d.diet === label} onClick={() => u({ diet: label })} />
        ))}
      </div>
    </div>
  );
}

function Step6({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>
          STEP 6 OF {TOTAL_STEPS}
        </div>
        <h1 style={{ ...S, fontSize: 56, color: th.ink, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Your budget.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 16, margin: 0 }}>
          We&apos;ll pick the highest-impact options for what you&apos;re comfortable spending.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Under $20 / month", "Essentials only — the highest-impact basics"],
          ["$20 – $50 / month", "A solid, well-rounded foundational stack"],
          ["$50 – $100 / month", "Comprehensive and targeted to your goals"],
          ["$100+ / month", "Full optimisation — no compromises"],
        ].map(([label, sub]) => (
          <CardOption key={label} label={label} subtitle={sub}
            selected={d.budget === label} onClick={() => u({ budget: label })} />
        ))}
      </div>
    </div>
  );
}

function StepGenerating({ data }: { data: QuizData }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Save quiz data to localStorage for the results page
    localStorage.setItem("phylaQuizData", JSON.stringify(data));

    // Tick through the checklist items
    const intervals = [800, 1600, 2400].map((delay, i) =>
      setTimeout(() => setTick(i + 1), delay)
    );

    // Redirect to results after 3.5s
    const redirect = setTimeout(() => router.push("/results"), 3500);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(redirect);
    };
  }, [data, router]);

  const steps = [
    "Analysing your wellness profile",
    "Matching ingredients to your goals",
    "Building your daily routine",
  ];

  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      {/* Phyla logo animated */}
      <div style={{ marginBottom: 36 }}>
        <svg width="72" height="72" viewBox="0 0 24 24" style={{ animation: "phyla-sway 3s ease-in-out infinite" }}>
          <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
          <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
          <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
          <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
        </svg>
      </div>

      <h1 style={{ ...S, fontSize: 52, color: th.ink, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Composing your ritual&hellip;
      </h1>
      <p style={{ color: th.inkSoft, fontSize: 17, marginBottom: 44, lineHeight: 1.5 }}>
        Cross-referencing 1,200+ peer-reviewed studies<br />with your personal profile.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto" }}>
        {steps.map((item, i) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 20px", borderRadius: 14,
            background: tick > i ? th.sageGlow : th.paper,
            border: tick > i ? `1.5px solid ${th.sage}33` : `1.5px solid ${th.line}`,
            transition: "all .4s ease",
            animation: `phyla-rise .5s ${i * 0.2}s ease-out both`,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 999, flexShrink: 0,
              background: tick > i ? th.sage : th.line,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .3s ease",
            }}>
              {tick > i && <span style={{ color: "#fbf6ec", fontSize: 12, fontWeight: 600 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, color: tick > i ? th.ink : th.inkSoft }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const pct = Math.min(100, Math.round((step / TOTAL_STEPS) * 100));
  return (
    <div style={{ height: 2, background: th.line, borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${th.sage}, #6a9a6e)`,
        transition: "width .5s cubic-bezier(.4,0,.2,1)",
        borderRadius: 2,
      }} />
    </div>
  );
}

// ─── MAIN QUIZ PAGE ───────────────────────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuizData>(INITIAL);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizDraft");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem("phylaQuizDraft", JSON.stringify(data));
  }, [data]);

  const update: Updater = (updates) => setData(prev => ({ ...prev, ...updates }));
  const isGenerating = step === TOTAL_STEPS + 1;
  const ok = canProceed(step, data);

  const goNext = () => {
    if (!ok) return;
    setDirection("forward");
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step <= 1) return;
    setDirection("back");
    setStep(s => s - 1);
  };

  const stepProps = { d: data, u: update };

  return (
    <div style={{
      minHeight: "100vh", background: th.bg,
      fontFamily: "var(--font-sans)", color: th.ink,
      display: "flex", flexDirection: "column",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: `1px solid ${th.line}`,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
            <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
            <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
            <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
          </svg>
          <span style={{ ...S, fontSize: 18, color: th.ink }}>phyla</span>
        </Link>

        {!isGenerating && (
          <Link href="/" style={{
            fontSize: 13, color: th.inkMute, textDecoration: "none",
            padding: "8px 14px", borderRadius: 999, border: `1px solid ${th.line}`,
            transition: "color .2s",
          }}>
            Save &amp; exit
          </Link>
        )}
      </div>

      {/* Progress bar */}
      {!isGenerating && (
        <div style={{ padding: "0 32px" }}>
          <ProgressBar step={step} />
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "48px 24px 120px",
      }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {/* Step content — key forces re-mount and re-animation on step change */}
          <div key={`step-${step}-${direction}`} style={{ animation: "phyla-fade-in .35s ease-out" }}>
            {step === 1 && <Step1 {...stepProps} />}
            {step === 2 && <Step2 {...stepProps} />}
            {step === 3 && <Step3 {...stepProps} />}
            {step === 4 && <Step4 {...stepProps} />}
            {step === 5 && <Step5 {...stepProps} />}
            {step === 6 && <Step6 {...stepProps} />}
            {isGenerating && <StepGenerating data={data} />}
          </div>
        </div>
      </div>

      {/* Bottom navigation — fixed */}
      {!isGenerating && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: `${th.bg}f0`, backdropFilter: "blur(12px)",
          borderTop: `1px solid ${th.line}`,
          padding: "16px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          {/* Back */}
          <button
            onClick={goBack}
            disabled={step === 1}
            style={{
              padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 500,
              border: `1.5px solid ${th.line}`, background: "transparent", color: step === 1 ? th.inkMute : th.ink,
              cursor: step === 1 ? "default" : "pointer", transition: "all .2s",
              fontFamily: "var(--font-sans)",
            }}
          >
            ← Back
          </button>

          {/* Step dots */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                width: i + 1 === step ? 20 : 6,
                height: 6, borderRadius: 999,
                background: i + 1 < step ? th.sage : i + 1 === step ? th.sage : th.line,
                opacity: i + 1 <= step ? 1 : 0.4,
                transition: "all .3s ease",
              }} />
            ))}
          </div>

          {/* Next / Finish */}
          <button
            onClick={goNext}
            disabled={!ok}
            style={{
              padding: "14px 28px", borderRadius: 999, fontSize: 15, fontWeight: 500,
              background: ok ? th.burgundy : th.line,
              color: ok ? "#fbf6ec" : th.inkMute,
              border: "none", cursor: ok ? "pointer" : "default",
              transition: "all .2s", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-sans)",
            }}
          >
            {step === TOTAL_STEPS ? "Build my ritual" : "Continue"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
