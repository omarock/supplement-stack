"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizData } from "@/types/quiz";

// ─── Theme ───────────────────────────────────────────────────────────────────
const th = {
  bg: "#f4ede1", bgWarm: "#ebe3d3", paper: "#fbf6ec",
  ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", sageGlow: "rgba(74,106,78,0.12)",
  burgundy: "#7d2e3a", burgundyDeep: "#5a1f2a",
  line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

// ─── Initial data ────────────────────────────────────────────────────────────
const INITIAL: QuizData = {
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
};

type Updater = (u: Partial<QuizData>) => void;
const TOTAL_STEPS = 10;

// ─── Validation ──────────────────────────────────────────────────────────────
function canProceed(step: number, d: QuizData): boolean {
  const age = parseInt(d.age);
  switch (step) {
    case 1: return d.age !== "" && age >= 13 && age <= 100 && d.gender !== "";
    case 2: return d.goals.length > 0;
    case 3: return d.sleep > 0 && d.sleepHours !== "";
    case 4: return d.stress > 0 && d.mood > 0;
    case 5: return d.energy > 0 && d.afternoonCrash !== "";
    case 6: return d.workoutFreq !== "";
    case 7: return d.diet !== "" && d.caffeine !== "" && d.alcohol !== "";
    case 8: return true; // body concerns optional
    case 9: return d.allergies.length > 0 && d.conditions.length > 0 && (d.gender !== "Female" || d.pregnant !== "");
    case 10: return d.budget !== "";
    default: return true;
  }
}

// ─── UI Primitives ───────────────────────────────────────────────────────────
function Heading({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 14 }}>
        STEP {step} OF {TOTAL_STEPS}
      </div>
      <h1 style={{ ...S, fontSize: 52, color: th.ink, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {title}
      </h1>
      <p style={{ color: th.inkSoft, fontSize: 16, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function QLabel({ text, optional = false }: { text: string; optional?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: th.ink, margin: 0 }}>{text}</p>
      {optional && <span style={{ fontSize: 11, color: th.inkMute, ...MM }}>OPTIONAL</span>}
    </div>
  );
}

function Card({ label, sub, selected, onClick, compact = false }: {
  label: string; sub?: string; selected: boolean; onClick: () => void; compact?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 3, textAlign: "left",
      padding: compact ? "12px 16px" : "16px 20px", borderRadius: 14, cursor: "pointer", width: "100%",
      border: selected ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
      background: selected ? th.sageGlow : th.paper,
      transition: "all .18s ease", outline: "none",
    }}>
      <span style={{ fontSize: compact ? 14 : 15, fontWeight: 500, color: selected ? th.sage : th.ink }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: th.inkSoft, lineHeight: 1.4 }}>{sub}</span>}
    </button>
  );
}

function GoalCard({ label, glyph, selected, onClick }: {
  label: string; glyph: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: "16px 14px", borderRadius: 14, cursor: "pointer", textAlign: "left",
      border: selected ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
      background: selected ? th.sageGlow : th.paper,
      transition: "all .18s ease", outline: "none",
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{glyph}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: selected ? th.sage : th.ink, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

function ScaleRow({ title, value, labels, onChange }: {
  title: string; value: number; labels: string[]; onChange: (v: number) => void;
}) {
  return (
    <div>
      <QLabel text={title} />
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 6, padding: "12px 4px", borderRadius: 12, cursor: "pointer",
            border: value === v ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
            background: value === v ? th.sageGlow : th.paper,
            transition: "all .18s ease", outline: "none",
          }}>
            <span style={{ ...S, fontSize: 26, color: value === v ? th.sage : th.ink }}>{v}</span>
            <span style={{ fontSize: 10, color: value === v ? th.sage : th.inkMute, textAlign: "center", lineHeight: 1.2 }}>
              {labels[v - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NumInput({ value, onChange, placeholder, suffix }: {
  value: string; onChange: (v: string) => void; placeholder: string; suffix?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "14px 18px", paddingRight: suffix ? 56 : 18,
          borderRadius: 12, fontSize: 16,
          border: value ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
          background: th.paper, color: th.ink, outline: "none",
          fontFamily: '"Inter", system-ui, sans-serif', boxSizing: "border-box",
        }}
      />
      {suffix && (
        <span style={{
          position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
          fontSize: 13, color: th.inkMute, ...MM,
        }}>{suffix}</span>
      )}
    </div>
  );
}

function MultiSelect({ label, options, selected, onToggle, optional = false }: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void; optional?: boolean;
}) {
  return (
    <div>
      <QLabel text={label} optional={optional} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(opt => (
          <Card key={opt} label={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)} compact />
        ))}
      </div>
    </div>
  );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────

function Step1({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <>
      <Heading step={1} title="About you." subtitle="A quick profile so we can tailor doses and choices to your biology." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <QLabel text="Age" />
            <NumInput value={d.age} onChange={v => u({ age: v })} placeholder="28" suffix="years" />
          </div>
          <div>
            <QLabel text="Height" optional />
            <NumInput value={d.height} onChange={v => u({ height: v })} placeholder="175" suffix="cm" />
          </div>
        </div>
        <div>
          <QLabel text="Weight" optional />
          <NumInput value={d.weight} onChange={v => u({ weight: v })} placeholder="70" suffix="kg" />
        </div>
        <div>
          <QLabel text="Biological sex" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Male", "Testosterone-dominant"],
              ["Female", "Oestrogen-dominant"],
              ["Non-binary / Other", "We tailor based on your goals"],
              ["Prefer not to say", ""],
            ].map(([label, sub]) => (
              <Card key={label} label={label} sub={sub || undefined}
                selected={d.gender === label} onClick={() => u({ gender: label })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step2({ d, u }: { d: QuizData; u: Updater }) {
  const goals: [string, string][] = [
    ["More energy", "☀"], ["Better sleep", "☾"],
    ["Sharper focus", "✦"], ["Stress relief", "♡"],
    ["Muscle & recovery", "↺"], ["Immune support", "⊕"],
    ["Better mood", "✿"], ["Healthy aging", "○"],
    ["Skin, hair & nails", "✧"], ["General wellness", "◎"],
  ];
  const toggle = (g: string) =>
    u({ goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] });
  return (
    <>
      <Heading step={2} title="What you want." subtitle="Pick all that apply — we'll prioritise accordingly." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {goals.map(([label, glyph]) => (
          <GoalCard key={label} label={label} glyph={glyph}
            selected={d.goals.includes(label)} onClick={() => toggle(label)} />
        ))}
      </div>
      {d.goals.length > 0 && (
        <p style={{ fontSize: 12, color: th.sage, ...MM, marginTop: 14 }}>
          ✓ {d.goals.length} selected
        </p>
      )}
    </>
  );
}

function Step3({ d, u }: { d: QuizData; u: Updater }) {
  const toggleIssue = (i: string) =>
    u({ sleepIssues: d.sleepIssues.includes(i) ? d.sleepIssues.filter(x => x !== i) : [...d.sleepIssues, i] });
  return (
    <>
      <Heading step={3} title="Your sleep." subtitle="Sleep underpins almost every wellness outcome. Let's go deeper." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title="How do you rate your sleep quality?" value={d.sleep} onChange={v => u({ sleep: v })}
          labels={["Terrible", "Poor", "Okay", "Good", "Excellent"]} />

        <div>
          <QLabel text="Hours per night, on average?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {["Less than 5", "5-6", "6-7", "7-8", "8+", "Varies"].map(h => (
              <Card key={h} label={h} selected={d.sleepHours === h} onClick={() => u({ sleepHours: h })} compact />
            ))}
          </div>
        </div>

        <MultiSelect
          label="Anything specific going on?" optional
          options={[
            "Trouble falling asleep",
            "Wake up at night",
            "Wake up too early",
            "Don't feel rested after waking",
            "None of these",
          ]}
          selected={d.sleepIssues}
          onToggle={toggleIssue}
        />
      </div>
    </>
  );
}

function Step4({ d, u }: { d: QuizData; u: Updater }) {
  const toggleConcern = (c: string) =>
    u({ mindConcerns: d.mindConcerns.includes(c) ? d.mindConcerns.filter(x => x !== c) : [...d.mindConcerns, c] });
  return (
    <>
      <Heading step={4} title="Mind & emotions." subtitle="How's your head feeling these days?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title="Stress level lately?" value={d.stress} onChange={v => u({ stress: v })}
          labels={["None", "Mild", "Moderate", "High", "Overwhelming"]} />
        <ScaleRow title="Baseline mood?" value={d.mood} onChange={v => u({ mood: v })}
          labels={["Very low", "Low", "Okay", "Good", "Great"]} />
        <MultiSelect
          label="Any of these resonate?" optional
          options={[
            "Brain fog",
            "Anxiety",
            "Poor focus",
            "Memory issues",
            "Low motivation",
            "None of these",
          ]}
          selected={d.mindConcerns}
          onToggle={toggleConcern}
        />
      </div>
    </>
  );
}

function Step5({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <>
      <Heading step={5} title="Energy & vitality." subtitle="When you're awake — how alive do you feel?" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title="Daytime energy level?" value={d.energy} onChange={v => u({ energy: v })}
          labels={["Exhausted", "Low", "Moderate", "Good", "Vibrant"]} />
        <div>
          <QLabel text="Do you crash in the afternoon?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {["Yes", "Sometimes", "No"].map(v => (
              <Card key={v} label={v} selected={d.afternoonCrash === v} onClick={() => u({ afternoonCrash: v })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step6({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <>
      <Heading step={6} title="Movement." subtitle="Any movement counts — gym, yoga, walks, sports, all of it." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text="How often do you train?" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Never or rarely", "Less than once a week"],
              ["1-2× per week", "Light to moderate movement"],
              ["3-4× per week", "Regular structured training"],
              ["5+ per week", "High intensity or daily athlete"],
            ].map(([label, sub]) => (
              <Card key={label} label={label} sub={sub}
                selected={d.workoutFreq === label} onClick={() => u({ workoutFreq: label })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text="Main type of training?" optional />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["Strength training", "Cardio / endurance", "Mixed / functional", "Yoga / mobility"].map(t => (
              <Card key={t} label={t} selected={d.workoutType === t} onClick={() => u({ workoutType: t })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step7({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <>
      <Heading step={7} title="Diet & habits." subtitle="What you eat (and drink) shapes which nutrients matter most." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text="How do you eat?" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Omnivore", "Meat, fish, dairy, eggs — the full range"],
              ["Vegetarian", "No meat or fish; dairy and eggs are fine"],
              ["Vegan", "Fully plant-based"],
              ["Pescatarian", "Fish and seafood, no other meat"],
              ["Keto / Low-carb", "High fat, very low carbohydrate"],
              ["Other / Flexible", "Mixed, changes week to week"],
            ].map(([label, sub]) => (
              <Card key={label} label={label} sub={sub}
                selected={d.diet === label} onClick={() => u({ diet: label })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text="Caffeine per day?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["None", "1 cup", "2-3 cups", "4+ cups"].map(c => (
              <Card key={c} label={c} selected={d.caffeine === c} onClick={() => u({ caffeine: c })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text="Alcohol?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["None", "Rarely", "1-3 / week", "4+ / week"].map(a => (
              <Card key={a} label={a} selected={d.alcohol === a} onClick={() => u({ alcohol: a })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step8({ d, u }: { d: QuizData; u: Updater }) {
  const toggle = (c: string) =>
    u({ bodyConcerns: d.bodyConcerns.includes(c) ? d.bodyConcerns.filter(x => x !== c) : [...d.bodyConcerns, c] });
  return (
    <>
      <Heading step={8} title="Body signals." subtitle="Anything your body's been flagging lately?" />
      <MultiSelect
        label="Pick all that apply" optional
        options={[
          "Joint pain or stiffness",
          "Digestive issues",
          "Bloating",
          "Skin concerns",
          "Hair thinning or loss",
          "Frequent illness",
          "Inflammation",
          "Heart / blood pressure concerns",
          "None of these",
        ]}
        selected={d.bodyConcerns}
        onToggle={toggle}
      />
    </>
  );
}

function Step9({ d, u }: { d: QuizData; u: Updater }) {
  const toggleAllergy = (a: string) =>
    u({ allergies: d.allergies.includes(a) ? d.allergies.filter(x => x !== a) : [...d.allergies, a] });
  const toggleCondition = (c: string) =>
    u({ conditions: d.conditions.includes(c) ? d.conditions.filter(x => x !== c) : [...d.conditions, c] });
  return (
    <>
      <Heading step={9} title="Health & safety." subtitle="So we can flag any supplements that aren't right for you. Honest answers = a safer stack." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {d.gender === "Female" && (
          <div>
            <QLabel text="Are you pregnant or nursing?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {["Yes", "No", "Not applicable"].map(v => (
                <Card key={v} label={v} selected={d.pregnant === v} onClick={() => u({ pregnant: v })} compact />
              ))}
            </div>
          </div>
        )}

        <MultiSelect
          label="Any allergies?"
          options={[
            "Fish", "Shellfish", "Soy", "Dairy", "Gluten", "Nuts", "None of these",
          ]}
          selected={d.allergies}
          onToggle={toggleAllergy}
        />

        <MultiSelect
          label="Health conditions to be aware of?"
          options={[
            "On blood thinners",
            "Autoimmune condition",
            "Thyroid condition",
            "Diabetes",
            "High blood pressure",
            "Bipolar",
            "None of these",
          ]}
          selected={d.conditions}
          onToggle={toggleCondition}
        />
      </div>
    </>
  );
}

function Step10({ d, u }: { d: QuizData; u: Updater }) {
  return (
    <>
      <Heading step={10} title="Budget & preferences." subtitle="Last step — let's right-size the stack for your wallet and values." />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text="Monthly supplement budget" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Under $20 / month", "2-3 highest-impact essentials"],
              ["$20 – $50 / month", "A solid foundational stack"],
              ["$50 – $100 / month", "Comprehensive and targeted"],
              ["$100+ / month", "Full optimisation — no compromises"],
            ].map(([label, sub]) => (
              <Card key={label} label={label} sub={sub}
                selected={d.budget === label} onClick={() => u({ budget: label })} compact />
            ))}
          </div>
        </div>

        {d.diet !== "Vegan" && (
          <div>
            <QLabel text="Prefer 100% plant-based supplements?" optional />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card label="Yes, plant-based only" selected={d.veganOnly}
                onClick={() => u({ veganOnly: true })} compact />
              <Card label="No preference" selected={!d.veganOnly}
                onClick={() => u({ veganOnly: false })} compact />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StepGenerating({ data }: { data: QuizData }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    localStorage.setItem("phylaQuizData", JSON.stringify(data));
    const ticks = [700, 1500, 2300, 3100].map((d, i) => setTimeout(() => setTick(i + 1), d));
    const redirect = setTimeout(() => router.push("/results"), 4000);
    return () => { ticks.forEach(clearTimeout); clearTimeout(redirect); };
  }, [data, router]);

  const steps = [
    "Analysing your wellness profile",
    "Cross-referencing ingredients and studies",
    "Filtering for safety and preferences",
    "Building your personalised stack",
  ];

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ marginBottom: 32 }}>
        <svg width="72" height="72" viewBox="0 0 24 24" style={{ animation: "phyla-sway 3s ease-in-out infinite" }}>
          <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
          <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
          <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
          <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
        </svg>
      </div>
      <h1 style={{ ...S, fontSize: 48, color: th.ink, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Composing your ritual&hellip;
      </h1>
      <p style={{ color: th.inkSoft, fontSize: 16, marginBottom: 36, lineHeight: 1.5 }}>
        Matching 25+ evidence-led ingredients<br />to your unique profile.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" }}>
        {steps.map((item, i) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", borderRadius: 12,
            background: tick > i ? th.sageGlow : th.paper,
            border: tick > i ? `1.5px solid ${th.sage}33` : `1.5px solid ${th.line}`,
            transition: "all .35s ease",
            animation: `phyla-rise .5s ${i * 0.15}s ease-out both`,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 999, flexShrink: 0,
              background: tick > i ? th.sage : th.line,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .3s ease",
            }}>
              {tick > i && <span style={{ color: "#fbf6ec", fontSize: 11, fontWeight: 600 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: tick > i ? th.ink : th.inkSoft }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const pct = Math.min(100, Math.round((step / TOTAL_STEPS) * 100));
  return (
    <div style={{ height: 2, background: th.line, borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${th.sage}, #6a9a6e)`,
        transition: "width .5s cubic-bezier(.4,0,.2,1)", borderRadius: 2,
      }} />
    </div>
  );
}

// ─── Main quiz page ──────────────────────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuizData>(INITIAL);

  useEffect(() => {
    const saved = localStorage.getItem("phylaQuizDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL so missing fields (from old quiz versions) default safely
        setData({ ...INITIAL, ...parsed });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("phylaQuizDraft", JSON.stringify(data));
  }, [data]);

  const update: Updater = (u) => setData(prev => ({ ...prev, ...u }));
  const isGenerating = step === TOTAL_STEPS + 1;
  const ok = canProceed(step, data);

  const goNext = () => { if (ok) setStep(s => s + 1); };
  const goBack = () => { if (step > 1) setStep(s => s - 1); };

  const props = { d: data, u: update };

  return (
    <div style={{
      minHeight: "100vh", background: th.bg, color: th.ink,
      fontFamily: '"Inter", system-ui, sans-serif',
      display: "flex", flexDirection: "column",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", borderBottom: `1px solid ${th.line}`,
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
          }}>
            Save &amp; exit
          </Link>
        )}
      </div>

      {/* Progress */}
      {!isGenerating && (
        <div style={{ padding: "0 32px" }}>
          <ProgressBar step={step} />
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 20px 130px",
      }}>
        <div style={{ width: "100%", maxWidth: 600 }}>
          <div key={`step-${step}`} style={{ animation: "phyla-fade-in .3s ease-out" }}>
            {step === 1 && <Step1 {...props} />}
            {step === 2 && <Step2 {...props} />}
            {step === 3 && <Step3 {...props} />}
            {step === 4 && <Step4 {...props} />}
            {step === 5 && <Step5 {...props} />}
            {step === 6 && <Step6 {...props} />}
            {step === 7 && <Step7 {...props} />}
            {step === 8 && <Step8 {...props} />}
            {step === 9 && <Step9 {...props} />}
            {step === 10 && <Step10 {...props} />}
            {isGenerating && <StepGenerating data={data} />}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      {!isGenerating && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: `${th.bg}f0`, backdropFilter: "blur(12px)",
          borderTop: `1px solid ${th.line}`, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <button onClick={goBack} disabled={step === 1} style={{
            padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
            border: `1.5px solid ${th.line}`, background: "transparent",
            color: step === 1 ? th.inkMute : th.ink,
            cursor: step === 1 ? "default" : "pointer",
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            ← Back
          </button>

          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                width: i + 1 === step ? 18 : 5, height: 5, borderRadius: 999,
                background: i + 1 <= step ? th.sage : th.line,
                opacity: i + 1 <= step ? 1 : 0.4,
                transition: "all .3s ease",
              }} />
            ))}
          </div>

          <button onClick={goNext} disabled={!ok} style={{
            padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
            background: ok ? th.burgundy : th.line,
            color: ok ? "#fbf6ec" : th.inkMute,
            border: "none", cursor: ok ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            {step === TOTAL_STEPS ? "Build my ritual" : "Continue"}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
