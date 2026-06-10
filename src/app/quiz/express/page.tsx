"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { trackEmailSignup } from "@/lib/track";
import { useT } from "@/components/I18nProvider";
import SuppdocLogo, { SDMark } from "@/components/SuppdocLogo";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

// Smart defaults for the fields Express doesn't ask (cosmetic or engine-unused:
// height/weight, sleepHours, workoutType, caffeine, alcohol). Everything the
// recommend() engine actually reads is asked below.
const EXPRESS_DEFAULTS: QuizData = {
  age: "", gender: "",
  height: "", weight: "",
  goals: [],
  sleep: 0, sleepHours: "7-8", sleepIssues: [],
  stress: 0, mood: 0, mindConcerns: [],
  energy: 0, afternoonCrash: "",
  workoutFreq: "", workoutType: "Mixed / functional",
  diet: "", caffeine: "2-3 cups", alcohol: "Rarely",
  bodyConcerns: [],
  pregnant: "Not applicable", allergies: [], conditions: [],
  budget: "", veganOnly: false,
};

const TOTAL = 10;

// IMPORTANT: option `v` (value) is the EXACT English string the recommend()
// engine matches on (mirrored from /quiz/complete, which is engine-correct).
// Only `l` (label) and `s` (sub) are localized. Never localize a value.
type Opt = { v: string; l: string; s?: string };

function canProceed(step: number, d: QuizData): boolean {
  const age = parseInt(d.age);
  switch (step) {
    case 1: return d.goals.length > 0;
    case 2: return d.age !== "" && age >= 13 && age <= 100 && d.gender !== "";
    case 3: return d.sleep > 0;
    case 4: return d.energy > 0 && d.afternoonCrash !== "";
    case 5: return d.stress > 0 && d.mood > 0;
    case 6: return d.workoutFreq !== "";
    case 7: return d.diet !== "";
    case 8: return true; // body concerns optional
    case 9: return d.allergies.length > 0 && d.conditions.length > 0 && (d.gender !== "Female" || d.pregnant !== "");
    case 10: return d.budget !== "";
    default: return true;
  }
}

export default function ExpressQuiz() {
  const router = useRouter();
  const { t, lh } = useT();
  // Stateless across visits: always starts fresh at step 1 (no draft restore).
  const [data, setData] = useState<QuizData>(EXPRESS_DEFAULTS);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const update = useCallback((u: Partial<QuizData>) => setData(d => ({ ...d, ...u })), []);
  const ok = canProceed(step, data);

  const next = () => {
    if (!ok) return;
    if (step < TOTAL) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else setGenerating(true);
  };
  const back = () => { if (step > 1) { setStep(step - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  if (generating) return <Generating data={data} onDone={() => { try { localStorage.setItem("phylaQuizData", JSON.stringify(data)); } catch {} router.push("/results"); }} />;

  const props = { data, update };
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: FONTS.body, display: "flex", flexDirection: "column" }}>
      {/* Top bar with premium progress */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30, padding: "14px var(--section-pad-x)",
        background: `color-mix(in srgb, ${TH.bg} 92%, transparent)`, backdropFilter: "blur(14px) saturate(140%)",
        borderBottom: `1px solid ${TH.edge}`,
      }}>
        <div style={{ maxWidth: 660, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <SuppdocLogo size={17} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: TH.muted, ...MM, marginBottom: 5, letterSpacing: "0.08em" }}>
              <span>{t("qe.expressStep", { step, total: TOTAL })}</span>
              <span>{Math.round((step / TOTAL) * 100)}%</span>
            </div>
            <div style={{ height: 5, background: TH.edge, borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${(step / TOTAL) * 100}%`, height: "100%",
                background: `linear-gradient(90deg, ${TH.sage}, ${TH.sageDeep})`,
                boxShadow: `0 0 10px color-mix(in srgb, ${TH.sage} 50%, transparent)`,
                transition: "width .55s cubic-bezier(.2,.7,.2,1)",
              }} />
            </div>
          </div>
          <Link href={lh("/quiz")} style={{ fontSize: 12, color: TH.muted, textDecoration: "none", whiteSpace: "nowrap" }}>
            {t("qe.switchQuiz")}
          </Link>
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 660, width: "100%", margin: "0 auto", padding: "36px var(--section-pad-x) 150px" }}>
        <div key={`s${step}`} style={{ animation: "sd-fade-in .34s ease-out" }}>
          {step === 1 && <StepGoals {...props} />}
          {step === 2 && <StepYou {...props} />}
          {step === 3 && <StepSleep {...props} />}
          {step === 4 && <StepEnergy {...props} />}
          {step === 5 && <StepMind {...props} />}
          {step === 6 && <StepMove {...props} />}
          {step === 7 && <StepDiet {...props} />}
          {step === 8 && <StepBody {...props} />}
          {step === 9 && <StepSafety {...props} />}
          {step === 10 && <StepBudget {...props} />}
        </div>
      </main>

      {/* Sticky bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        background: `color-mix(in srgb, ${TH.bg} 90%, transparent)`, backdropFilter: "blur(14px)",
        borderTop: `1px solid ${TH.edge}`, padding: "13px var(--section-pad-x)",
      }}>
        <div style={{ maxWidth: 660, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button onClick={back} disabled={step === 1} style={{
            padding: "12px 18px", borderRadius: 999, border: "none", background: "transparent",
            color: step === 1 ? TH.muted : TH.ink, fontSize: 14, fontWeight: 500,
            cursor: step === 1 ? "default" : "pointer", opacity: step === 1 ? 0.45 : 1,
            fontFamily: FONTS.body,
          }}>← {t("qe.back")}</button>

          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} style={{
                width: i + 1 === step ? 16 : 5, height: 5, borderRadius: 999,
                background: i + 1 <= step ? TH.sage : TH.edge, opacity: i + 1 <= step ? 1 : 0.5,
                transition: "all .3s ease",
              }} />
            ))}
          </div>

          <button onClick={next} disabled={!ok} style={{
            padding: "13px 26px", borderRadius: 999, border: "none",
            background: ok ? TH.inkBg : TH.muted, color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: ok ? "pointer" : "not-allowed", opacity: ok ? 1 : 0.55, transition: "all .2s",
            display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONTS.body,
            boxShadow: ok ? `0 8px 22px color-mix(in srgb, ${TH.ink} 16%, transparent)` : "none",
          }}>
            {step === TOTAL ? t("qe.generate") : t("qe.continue")} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared premium primitives ──────────────────────────────────────────────
function QHead({ step, title, sub }: { step: number; title: string; sub?: string }) {
  const { t } = useT();
  return (
    <header style={{ marginBottom: 24 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14, padding: "5px 11px 5px 9px", borderRadius: 999, background: `color-mix(in srgb, ${TH.sage} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${TH.sage} 22%, transparent)` }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TH.sageDeep} strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>
        <span style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.08em" }}>{t("qc.stepOf", { step, total: TOTAL })}</span>
      </div>
      <h1 style={{ ...D, fontSize: "clamp(27px, 5.2vw, 40px)", lineHeight: 1.06, letterSpacing: "-0.025em", margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 15, color: TH.inkSoft, marginTop: 11, lineHeight: 1.55 }}>{sub}</p>}
    </header>
  );
}

function QLabel({ text, optional }: { text: string; optional?: boolean }) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 11 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: TH.ink }}>{text}</span>
      {optional && <span style={{ ...MM, fontSize: 10.5, color: TH.muted }}>{t("qc.optional")}</span>}
    </div>
  );
}

function OptionCard({ label, sub, selected, onClick, glyph }: { label: string; sub?: string; selected: boolean; onClick: () => void; glyph?: string }) {
  return (
    <button onClick={onClick} aria-pressed={selected} style={{
      position: "relative", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
      padding: glyph ? "14px 16px" : "14px 18px", borderRadius: 14, cursor: "pointer", width: "100%",
      border: `1.5px solid ${selected ? TH.sage : TH.edge}`,
      background: selected ? `color-mix(in srgb, ${TH.sage} 9%, transparent)` : TH.surface,
      transition: "border-color .16s, background .16s, transform .12s", outline: "none",
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = TH.inkSoft; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = TH.edge; }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(.985)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {glyph && <span aria-hidden style={{ fontSize: 19, lineHeight: 1, flexShrink: 0, width: 22, textAlign: "center" }}>{glyph}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 500, color: selected ? TH.sageDeep : TH.ink, lineHeight: 1.3 }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: TH.muted, lineHeight: 1.4, marginTop: 2 }}>{sub}</span>}
      </span>
      <span aria-hidden style={{
        width: 21, height: 21, borderRadius: 999, flexShrink: 0,
        border: selected ? "none" : `1.6px solid ${TH.edgeStrong}`,
        background: selected ? TH.sage : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all .16s",
      }}>
        {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
      </span>
    </button>
  );
}

function MultiSelect({ label, options, selected, onToggle, optional }: { label: string; options: Opt[]; selected: string[]; onToggle: (v: string) => void; optional?: boolean }) {
  return (
    <div>
      <QLabel text={label} optional={optional} />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map(o => <OptionCard key={o.v} label={o.l} sub={o.s} selected={selected.includes(o.v)} onClick={() => onToggle(o.v)} />)}
      </div>
    </div>
  );
}

function Scale({ title, value, labels, onChange, reversed }: { title: string; value: number; labels: string[]; onChange: (v: number) => void; reversed?: boolean }) {
  return (
    <div>
      <QLabel text={title} />
      <div style={{ display: "flex", gap: 7 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const active = value === n;
          const goodness = reversed ? (6 - n) / 5 : n / 5;
          const col = goodness > 0.7 ? TH.sageDeep : goodness > 0.4 ? TH.amberDeep : "#b91c1c";
          return (
            <button key={n} onClick={() => onChange(n)} aria-label={labels[n - 1]} style={{
              flex: 1, padding: "15px 4px", borderRadius: 13, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              border: `1.5px solid ${active ? col : TH.edge}`,
              background: active ? `color-mix(in srgb, ${col} 11%, transparent)` : TH.surface,
              transition: "all .15s", outline: "none",
            }}>
              <span style={{ ...D, fontSize: 22, color: active ? col : TH.ink }}>{n}</span>
              <span style={{ ...MM, fontSize: 9, color: active ? col : TH.muted, letterSpacing: "0.03em", textAlign: "center", lineHeight: 1.2 }}>{labels[n - 1].toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step components (values mirror /quiz/complete = engine-correct) ──────────
function StepGoals({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const GOALS: { v: string; l: string; glyph: string }[] = [
    { v: "More energy", l: t("qc.goalEnergy"), glyph: "☀" },
    { v: "Better sleep", l: t("qc.goalSleep"), glyph: "☾" },
    { v: "Sharper focus", l: t("qc.goalFocus"), glyph: "✦" },
    { v: "Stress relief", l: t("qc.goalStress"), glyph: "♡" },
    { v: "Muscle & recovery", l: t("qc.goalMuscle"), glyph: "↺" },
    { v: "Immune support", l: t("qc.goalImmune"), glyph: "⊕" },
    { v: "Better mood", l: t("qc.goalMood"), glyph: "✿" },
    { v: "Healthy aging", l: t("qc.goalAging"), glyph: "○" },
    { v: "Skin, hair & nails", l: t("qc.goalSkin"), glyph: "✧" },
    { v: "General wellness", l: t("qc.goalWellness"), glyph: "◎" },
  ];
  const toggle = (g: string) => update({ goals: data.goals.includes(g) ? data.goals.filter(x => x !== g) : [...data.goals, g] });
  return (
    <div>
      <QHead step={1} title={t("qc.s2title")} sub={t("qc.s2sub")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {GOALS.map(g => {
          const active = data.goals.includes(g.v);
          return (
            <button key={g.v} onClick={() => toggle(g.v)} aria-pressed={active} style={{
              display: "flex", flexDirection: "column", gap: 8, padding: "15px 14px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: `1.5px solid ${active ? TH.sage : TH.edge}`,
              background: active ? `color-mix(in srgb, ${TH.sage} 9%, transparent)` : TH.surface,
              transition: "all .16s", outline: "none",
            }}>
              <span aria-hidden style={{ fontSize: 21, lineHeight: 1 }}>{g.glyph}</span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: active ? TH.sageDeep : TH.ink, lineHeight: 1.3 }}>{g.l}</span>
            </button>
          );
        })}
      </div>
      {data.goals.length > 0 && <p style={{ ...MM, fontSize: 11.5, color: TH.sageDeep, marginTop: 13 }}>✓ {t("qc.selectedN", { n: data.goals.length })}</p>}
    </div>
  );
}

function StepYou({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const GENDERS: Opt[] = [
    { v: "Female", l: t("qc.genderFemale") },
    { v: "Male", l: t("qc.genderMale") },
    { v: "Non-binary / Other", l: t("qc.genderNonbinary") },
    { v: "Prefer not to say", l: t("qc.genderPrefer") },
  ];
  return (
    <div>
      <QHead step={2} title={t("qc.s1title")} sub={t("qc.s1sub")} />
      <div style={{ marginBottom: 22 }}>
        <QLabel text={t("qc.age")} />
        <input type="number" min={13} max={100} value={data.age} onChange={e => update({ age: e.target.value })} placeholder="32" style={{
          width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 13, fontSize: 16,
          border: `1.5px solid ${data.age ? TH.sage : TH.edge}`, background: TH.surface, color: TH.ink, outline: "none", fontFamily: FONTS.body,
        }} />
      </div>
      <QLabel text={t("qc.bioSex")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {GENDERS.map(g => <OptionCard key={g.v} label={g.l} selected={data.gender === g.v} onClick={() => update({ gender: g.v })} />)}
      </div>
    </div>
  );
}

function StepSleep({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const ISSUES: Opt[] = [
    { v: "Trouble falling asleep", l: t("qc.issueFalling") },
    { v: "Wake up at night", l: t("qc.issueNight") },
    { v: "Wake up too early", l: t("qc.issueEarly") },
    { v: "Don't feel rested after waking", l: t("qc.issueRested") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggle = (i: string) => update({ sleepIssues: data.sleepIssues.includes(i) ? data.sleepIssues.filter(x => x !== i) : [...data.sleepIssues, i] });
  return (
    <div>
      <QHead step={3} title={t("qc.s3title")} sub={t("qc.s3sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Scale title={t("qc.sleepQ")} value={data.sleep} onChange={v => update({ sleep: v })}
          labels={[t("qc.sleep1"), t("qc.sleep2"), t("qc.sleep3"), t("qc.sleep4"), t("qc.sleep5")]} />
        <MultiSelect label={t("qc.sleepIssuesQ")} optional options={ISSUES} selected={data.sleepIssues} onToggle={toggle} />
      </div>
    </div>
  );
}

function StepEnergy({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const CRASH: Opt[] = [
    { v: "Yes", l: t("qc.crashYes") },
    { v: "Sometimes", l: t("qc.crashSometimes") },
    { v: "No", l: t("qc.crashNo") },
  ];
  return (
    <div>
      <QHead step={4} title={t("qc.s5title")} sub={t("qc.s5sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Scale title={t("qc.energyQ")} value={data.energy} onChange={v => update({ energy: v })}
          labels={[t("qc.energy1"), t("qc.energy2"), t("qc.energy3"), t("qc.energy4"), t("qc.energy5")]} />
        <div>
          <QLabel text={t("qc.crashQ")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
            {CRASH.map(c => <OptionCard key={c.v} label={c.l} selected={data.afternoonCrash === c.v} onClick={() => update({ afternoonCrash: c.v })} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMind({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const CONCERNS: Opt[] = [
    { v: "Brain fog", l: t("qc.mindFog") },
    { v: "Anxiety", l: t("qc.mindAnxiety") },
    { v: "Poor focus", l: t("qc.mindFocus") },
    { v: "Memory issues", l: t("qc.mindMemory") },
    { v: "Low motivation", l: t("qc.mindMotivation") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggle = (c: string) => update({ mindConcerns: data.mindConcerns.includes(c) ? data.mindConcerns.filter(x => x !== c) : [...data.mindConcerns, c] });
  return (
    <div>
      <QHead step={5} title={t("qc.s4title")} sub={t("qc.s4sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Scale title={t("qc.stressQ")} value={data.stress} onChange={v => update({ stress: v })} reversed
          labels={[t("qc.stress1"), t("qc.stress2"), t("qc.stress3"), t("qc.stress4"), t("qc.stress5")]} />
        <Scale title={t("qc.moodQ")} value={data.mood} onChange={v => update({ mood: v })}
          labels={[t("qc.mood1"), t("qc.mood2"), t("qc.mood3"), t("qc.mood4"), t("qc.mood5")]} />
        <MultiSelect label={t("qc.mindQ")} optional options={CONCERNS} selected={data.mindConcerns} onToggle={toggle} />
      </div>
    </div>
  );
}

function StepMove({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const FREQ: Opt[] = [
    { v: "Never or rarely", l: t("qc.freqNever"), s: t("qc.freqNeverSub") },
    { v: "1-2× per week", l: t("qc.freq12"), s: t("qc.freq12Sub") },
    { v: "3-4× per week", l: t("qc.freq34"), s: t("qc.freq34Sub") },
    { v: "5+ per week", l: t("qc.freq5"), s: t("qc.freq5Sub") },
  ];
  const TYPES: Opt[] = [
    { v: "Strength training", l: t("qc.typeStrength") },
    { v: "Cardio / endurance", l: t("qc.typeCardio") },
    { v: "Mixed / functional", l: t("qc.typeMixed") },
    { v: "Yoga / mobility", l: t("qc.typeYoga") },
  ];
  return (
    <div>
      <QHead step={6} title={t("qc.s6title")} sub={t("qc.s6sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <QLabel text={t("qc.trainQ")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {FREQ.map(f => <OptionCard key={f.v} label={f.l} sub={f.s} selected={data.workoutFreq === f.v} onClick={() => update({ workoutFreq: f.v })} />)}
          </div>
        </div>
        <div>
          <QLabel text={t("qc.trainTypeQ")} optional />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {TYPES.map(ty => <OptionCard key={ty.v} label={ty.l} selected={data.workoutType === ty.v} onClick={() => update({ workoutType: ty.v })} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDiet({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const DIETS: Opt[] = [
    { v: "Omnivore", l: t("qc.dietOmnivore"), s: t("qc.dietOmnivoreSub") },
    { v: "Vegetarian", l: t("qc.dietVegetarian"), s: t("qc.dietVegetarianSub") },
    { v: "Vegan", l: t("qc.dietVegan"), s: t("qc.dietVeganSub") },
    { v: "Pescatarian", l: t("qc.dietPescatarian"), s: t("qc.dietPescatarianSub") },
    { v: "Keto / Low-carb", l: t("qc.dietKeto"), s: t("qc.dietKetoSub") },
    { v: "Other / Flexible", l: t("qc.dietOther"), s: t("qc.dietOtherSub") },
  ];
  return (
    <div>
      <QHead step={7} title={t("qc.s7title")} sub={t("qc.s7sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {DIETS.map(di => <OptionCard key={di.v} label={di.l} sub={di.s} selected={data.diet === di.v} onClick={() => update({ diet: di.v, veganOnly: di.v === "Vegan" ? true : data.veganOnly })} />)}
      </div>
    </div>
  );
}

function StepBody({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const CONCERNS: Opt[] = [
    { v: "Joint pain or stiffness", l: t("qc.bodyJoint") },
    { v: "Digestive issues", l: t("qc.bodyDigestive") },
    { v: "Bloating", l: t("qc.bodyBloating") },
    { v: "Skin concerns", l: t("qc.bodySkin") },
    { v: "Hair thinning or loss", l: t("qc.bodyHair") },
    { v: "Frequent illness", l: t("qc.bodyIllness") },
    { v: "Inflammation", l: t("qc.bodyInflammation") },
    { v: "Heart / blood pressure concerns", l: t("qc.bodyHeart") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggle = (c: string) => update({ bodyConcerns: data.bodyConcerns.includes(c) ? data.bodyConcerns.filter(x => x !== c) : [...data.bodyConcerns, c] });
  return (
    <div>
      <QHead step={8} title={t("qc.s8title")} sub={t("qc.s8sub")} />
      <MultiSelect label={t("qc.bodyQ")} optional options={CONCERNS} selected={data.bodyConcerns} onToggle={toggle} />
    </div>
  );
}

function StepSafety({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const PREGNANT: Opt[] = [
    { v: "Yes", l: t("qc.pregYes") },
    { v: "No", l: t("qc.pregNo") },
    { v: "Not applicable", l: t("qc.pregNA") },
  ];
  const ALLERGIES: Opt[] = [
    { v: "Fish", l: t("qc.allFish") },
    { v: "Shellfish", l: t("qc.allShellfish") },
    { v: "Soy", l: t("qc.allSoy") },
    { v: "Dairy", l: t("qc.allDairy") },
    { v: "Gluten", l: t("qc.allGluten") },
    { v: "Nuts", l: t("qc.allNuts") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const CONDITIONS: Opt[] = [
    { v: "On blood thinners", l: t("qc.condThinners") },
    { v: "Autoimmune condition", l: t("qc.condAutoimmune") },
    { v: "Thyroid condition", l: t("qc.condThyroid") },
    { v: "Diabetes", l: t("qc.condDiabetes") },
    { v: "High blood pressure", l: t("qc.condBP") },
    { v: "Bipolar", l: t("qc.condBipolar") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggleA = (a: string) => update({ allergies: data.allergies.includes(a) ? data.allergies.filter(x => x !== a) : [...data.allergies, a] });
  const toggleC = (c: string) => update({ conditions: data.conditions.includes(c) ? data.conditions.filter(x => x !== c) : [...data.conditions, c] });
  return (
    <div>
      <QHead step={9} title={t("qc.s9title")} sub={t("qc.s9sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {data.gender === "Female" && (
          <div>
            <QLabel text={t("qc.pregnantQ")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {PREGNANT.map(p => <OptionCard key={p.v} label={p.l} selected={data.pregnant === p.v} onClick={() => update({ pregnant: p.v })} />)}
            </div>
          </div>
        )}
        <MultiSelect label={t("qc.allergiesQ")} options={ALLERGIES} selected={data.allergies} onToggle={toggleA} />
        <MultiSelect label={t("qc.conditionsQ")} options={CONDITIONS} selected={data.conditions} onToggle={toggleC} />
      </div>
    </div>
  );
}

function StepBudget({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const BUDGETS: Opt[] = [
    { v: "Under $20 / month", l: t("qc.budgetUnder20"), s: t("qc.budgetUnder20Sub") },
    { v: "$20 - $50 / month", l: t("qc.budget2050"), s: t("qc.budget2050Sub") },
    { v: "$50 - $100 / month", l: t("qc.budget50100"), s: t("qc.budget50100Sub") },
    { v: "$100+ / month", l: t("qc.budget100"), s: t("qc.budget100Sub") },
  ];
  return (
    <div>
      <QHead step={10} title={t("qc.s10title")} sub={t("qc.s10sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {BUDGETS.map(b => <OptionCard key={b.v} label={b.l} sub={b.s} selected={data.budget === b.v} onClick={() => update({ budget: b.v })} />)}
      </div>
      {data.diet !== "Vegan" && (
        <div style={{ marginTop: 22 }}>
          <QLabel text={t("qc.veganQ")} optional />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            <OptionCard label={t("qc.veganYes")} selected={data.veganOnly} onClick={() => update({ veganOnly: true })} />
            <OptionCard label={t("qc.veganNo")} selected={!data.veganOnly} onClick={() => update({ veganOnly: false })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Generating (email capture + premium loading) ────────────────────────────
function Generating({ data, onDone }: { data: QuizData; onDone: () => void }) {
  const { t } = useT();
  const [phase, setPhase] = useState<"email" | "loading">("email");
  const [email, setEmail] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => { try { localStorage.setItem("phylaQuizData", JSON.stringify(data)); } catch {} }, [data]);
  useEffect(() => {
    if (phase !== "loading") return;
    const ticks = [600, 1300, 2000, 2700].map((d, i) => setTimeout(() => setTick(i + 1), d));
    const go = setTimeout(onDone, 3400);
    return () => { ticks.forEach(clearTimeout); clearTimeout(go); };
  }, [phase, onDone]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      try { localStorage.setItem("phylaQuizEmail", email); } catch {}
      trackEmailSignup(email, "express_quiz").catch(() => {});
    }
    setPhase("loading");
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: FONTS.body, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px var(--section-pad-x)" }}>
      <div style={{ width: "100%", maxWidth: 460, textAlign: "center", animation: "sd-fade-in .4s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <SDMark size={52} />
        </div>
        {phase === "email" ? (
          <>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.1em", marginBottom: 12 }}>{t("qc.almostReady")}</div>
            <h1 style={{ ...D, fontSize: "clamp(26px,5vw,36px)", margin: "0 0 12px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>{t("qc.emailTitle")}</h1>
            <p style={{ color: TH.inkSoft, fontSize: 15, lineHeight: 1.55, marginBottom: 26 }}>{t("qc.emailSub")}</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{
                width: "100%", boxSizing: "border-box", padding: "15px 18px", borderRadius: 13, fontSize: 16,
                border: `1.5px solid ${email ? TH.sage : TH.edge}`, background: TH.surface, color: TH.ink, outline: "none", fontFamily: FONTS.body,
              }} />
              <button type="submit" style={{ padding: "15px 18px", borderRadius: 13, background: TH.inkBg, color: "#fff", border: "none", ...D, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{t("qc.emailBtn")} →</button>
              <button type="button" onClick={() => setPhase("loading")} style={{ padding: 8, background: "transparent", border: "none", color: TH.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: FONTS.body }}>{t("qc.skipEmail")}</button>
            </form>
            <p style={{ fontSize: 11, color: TH.muted, marginTop: 22, lineHeight: 1.5 }}>{t("qc.privacyNote")} <Link href="/privacy" style={{ color: TH.sageDeep }}>{t("qc.privacyLink")}</Link>.</p>
          </>
        ) : (
          <>
            <h1 style={{ ...D, fontSize: "clamp(28px,5vw,40px)", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.04 }}>{t("qc.composing")}</h1>
            <p style={{ color: TH.inkSoft, fontSize: 15, marginBottom: 30, lineHeight: 1.5 }}>{t("qc.matching")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
              {[t("qc.gen1"), t("qc.gen2"), t("qc.gen3"), t("qc.gen4")].map((item, i) => (
                <div key={item} style={{
                  display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderRadius: 12,
                  background: tick > i ? `color-mix(in srgb, ${TH.sage} 9%, transparent)` : TH.surface,
                  border: `1.5px solid ${tick > i ? TH.sage : TH.edge}`, transition: "all .35s ease",
                }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, background: tick > i ? TH.sage : TH.edge, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .3s" }}>
                    {tick > i && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                  </span>
                  <span style={{ fontSize: 13.5, color: tick > i ? TH.ink : TH.inkSoft }}>{item}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
