"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { trackEmailSignup } from "@/lib/track";
import { useT } from "@/components/I18nProvider";
import SuppdocLogo, { SDMark } from "@/components/SuppdocLogo";

// ─── Theme ───────────────────────────────────────────────────────────────────
const th = {
  bg: "var(--c-bg)", bgWarm: "var(--c-bg)", paper: "var(--c-surface)",
  ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageGlow: "var(--c-accent-glow)",
  burgundy: "var(--c-ink-bg)", burgundyDeep: "var(--c-ink-bg)",
  line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

// IMPORTANT: option `v` (value) is the ENGLISH string the recommend() engine
// matches on; only `l` (label) and `s` (sub) are localized. Never localize a
// value or the engine stops matching it.
type Opt = { v: string; l: string; s?: string };

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
  currentSupplements: [], healthPriorities: [],
};

type Updater = (u: Partial<QuizData>) => void;
const TOTAL_STEPS = 11;

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
  const { t } = useT();
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: "inline-block", fontSize: 12, fontWeight: 600, color: "var(--c-sage-deep)",
        background: "color-mix(in srgb, var(--c-sage) 16%, var(--c-surface))",
        padding: "5px 13px", borderRadius: 999, marginBottom: 16,
      }}>
        {t("qc.stepOf", { step, total: TOTAL_STEPS })}
      </div>
      <h1 style={{ ...S, fontSize: 52, color: th.ink, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {title}
      </h1>
      <p style={{ color: th.inkSoft, fontSize: 16, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function QLabel({ text, optional = false }: { text: string; optional?: boolean }) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: th.ink, margin: 0 }}>{text}</p>
      {optional && <span style={{ fontSize: 11, color: th.inkMute, ...MM }}>{t("qc.optional")}</span>}
    </div>
  );
}

function Card({ label, sub, selected, onClick, compact = false }: {
  label: string; sub?: string; selected: boolean; onClick: () => void; compact?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 3, textAlign: "left",
      padding: compact ? "13px 16px" : "16px 20px", borderRadius: 15, cursor: "pointer", width: "100%",
      border: selected ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
      background: selected ? `color-mix(in srgb, ${th.sage} 12%, ${th.paper})` : th.paper,
      boxShadow: selected ? `0 8px 20px -12px color-mix(in srgb, ${th.sage} 55%, transparent)` : "none",
      transition: "all .18s ease", outline: "none",
    }}>
      <span style={{ fontSize: compact ? 14 : 15, fontWeight: 600, color: selected ? "var(--c-sage-deep)" : th.ink }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: th.inkSoft, lineHeight: 1.4 }}>{sub}</span>}
    </button>
  );
}

function GoalCard({ label, glyph, hue, selected, onClick }: {
  label: string; glyph: string; hue: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "16px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left",
      border: selected ? `2px solid ${hue}` : `1.5px solid ${th.line}`,
      background: selected ? `color-mix(in srgb, ${hue} 14%, ${th.paper})` : th.paper,
      transition: "all .18s ease", outline: "none",
      boxShadow: selected ? `0 10px 24px -12px color-mix(in srgb, ${hue} 65%, transparent)` : "none",
      transform: selected ? "translateY(-1px)" : "none",
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: `color-mix(in srgb, ${hue} 16%, ${th.paper})`, color: hue, fontSize: 19, lineHeight: 1,
      }}>{glyph}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: selected ? hue : th.ink, lineHeight: 1.3 }}>{label}</span>
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
        {[1, 2, 3, 4, 5].map(v => {
          const sel = value === v;
          return (
            <button key={v} onClick={() => onChange(v)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 6, padding: "13px 4px", borderRadius: 13, cursor: "pointer",
              border: sel ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
              background: sel ? th.sage : th.paper,
              boxShadow: sel ? `0 9px 22px -10px color-mix(in srgb, ${th.sage} 70%, transparent)` : "none",
              transform: sel ? "translateY(-1px)" : "none",
              transition: "all .18s ease", outline: "none",
            }}>
              <span style={{ ...S, fontSize: 27, color: sel ? "#fff" : th.ink }}>{v}</span>
              <span style={{ fontSize: 10, color: sel ? "#fff" : th.inkMute, textAlign: "center", lineHeight: 1.2 }}>
                {labels[v - 1]}
              </span>
            </button>
          );
        })}
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
  label: string; options: Opt[]; selected: string[]; onToggle: (v: string) => void; optional?: boolean;
}) {
  return (
    <div>
      <QLabel text={label} optional={optional} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(opt => (
          <Card key={opt.v} label={opt.l} selected={selected.includes(opt.v)} onClick={() => onToggle(opt.v)} compact />
        ))}
      </div>
    </div>
  );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────

function Step1({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const GENDERS: Opt[] = [
    { v: "Male", l: t("qc.genderMale"), s: t("qc.genderMaleSub") },
    { v: "Female", l: t("qc.genderFemale"), s: t("qc.genderFemaleSub") },
    { v: "Non-binary / Other", l: t("qc.genderNonbinary"), s: t("qc.genderNonbinarySub") },
    { v: "Prefer not to say", l: t("qc.genderPrefer"), s: "" },
  ];
  return (
    <>
      <Heading step={1} title={t("qc.s1title")} subtitle={t("qc.s1sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <QLabel text={t("qc.age")} />
            <NumInput value={d.age} onChange={v => u({ age: v })} placeholder="28" suffix={t("qc.ageSuffix")} />
          </div>
          <div>
            <QLabel text={t("qc.height")} optional />
            <NumInput value={d.height} onChange={v => u({ height: v })} placeholder="175" suffix="cm" />
          </div>
        </div>
        <div>
          <QLabel text={t("qc.weight")} optional />
          <NumInput value={d.weight} onChange={v => u({ weight: v })} placeholder="70" suffix="kg" />
        </div>
        <div>
          <QLabel text={t("qc.bioSex")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {GENDERS.map(g => (
              <Card key={g.v} label={g.l} sub={g.s || undefined}
                selected={d.gender === g.v} onClick={() => u({ gender: g.v })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step2({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const goals: { v: string; l: string; glyph: string; hue: string }[] = [
    { v: "More energy", l: t("qc.goalEnergy"), glyph: "☀", hue: "var(--c-amber-deep)" },
    { v: "Better sleep", l: t("qc.goalSleep"), glyph: "☾", hue: "#7c5cff" },
    { v: "Sharper focus", l: t("qc.goalFocus"), glyph: "✦", hue: "#2f7ed8" },
    { v: "Stress relief", l: t("qc.goalStress"), glyph: "♡", hue: "#e0723a" },
    { v: "Muscle & recovery", l: t("qc.goalMuscle"), glyph: "↺", hue: "var(--c-sage-deep)" },
    { v: "Immune support", l: t("qc.goalImmune"), glyph: "⊕", hue: "#16a34a" },
    { v: "Better mood", l: t("qc.goalMood"), glyph: "✿", hue: "#db2777" },
    { v: "Healthy aging", l: t("qc.goalAging"), glyph: "○", hue: "#0d9488" },
    { v: "Skin, hair & nails", l: t("qc.goalSkin"), glyph: "✧", hue: "#c2410c" },
    { v: "General wellness", l: t("qc.goalWellness"), glyph: "◎", hue: "var(--c-sage)" },
  ];
  const toggle = (g: string) =>
    u({ goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] });
  return (
    <>
      <Heading step={2} title={t("qc.s2title")} subtitle={t("qc.s2sub")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {goals.map(g => (
          <GoalCard key={g.v} label={g.l} glyph={g.glyph} hue={g.hue}
            selected={d.goals.includes(g.v)} onClick={() => toggle(g.v)} />
        ))}
      </div>
      {d.goals.length > 0 && (
        <p style={{ fontSize: 12, color: th.sage, ...MM, marginTop: 14 }}>
          ✓ {t("qc.selectedN", { n: d.goals.length })}
        </p>
      )}
    </>
  );
}

function Step3({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const HOURS: Opt[] = [
    { v: "Less than 5", l: t("qc.hoursLt5") },
    { v: "5-6", l: "5-6" },
    { v: "6-7", l: "6-7" },
    { v: "7-8", l: "7-8" },
    { v: "8+", l: "8+" },
    { v: "Varies", l: t("qc.hoursVaries") },
  ];
  const ISSUES: Opt[] = [
    { v: "Trouble falling asleep", l: t("qc.issueFalling") },
    { v: "Wake up at night", l: t("qc.issueNight") },
    { v: "Wake up too early", l: t("qc.issueEarly") },
    { v: "Don't feel rested after waking", l: t("qc.issueRested") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggleIssue = (i: string) =>
    u({ sleepIssues: d.sleepIssues.includes(i) ? d.sleepIssues.filter(x => x !== i) : [...d.sleepIssues, i] });
  return (
    <>
      <Heading step={3} title={t("qc.s3title")} subtitle={t("qc.s3sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title={t("qc.sleepQ")} value={d.sleep} onChange={v => u({ sleep: v })}
          labels={[t("qc.sleep1"), t("qc.sleep2"), t("qc.sleep3"), t("qc.sleep4"), t("qc.sleep5")]} />

        <div>
          <QLabel text={t("qc.hoursQ")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {HOURS.map(h => (
              <Card key={h.v} label={h.l} selected={d.sleepHours === h.v} onClick={() => u({ sleepHours: h.v })} compact />
            ))}
          </div>
        </div>

        <MultiSelect
          label={t("qc.sleepIssuesQ")} optional
          options={ISSUES}
          selected={d.sleepIssues}
          onToggle={toggleIssue}
        />
      </div>
    </>
  );
}

function Step4({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const CONCERNS: Opt[] = [
    { v: "Brain fog", l: t("qc.mindFog") },
    { v: "Anxiety", l: t("qc.mindAnxiety") },
    { v: "Poor focus", l: t("qc.mindFocus") },
    { v: "Memory issues", l: t("qc.mindMemory") },
    { v: "Low motivation", l: t("qc.mindMotivation") },
    { v: "None of these", l: t("qc.noneOfThese") },
  ];
  const toggleConcern = (c: string) =>
    u({ mindConcerns: d.mindConcerns.includes(c) ? d.mindConcerns.filter(x => x !== c) : [...d.mindConcerns, c] });
  return (
    <>
      <Heading step={4} title={t("qc.s4title")} subtitle={t("qc.s4sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title={t("qc.stressQ")} value={d.stress} onChange={v => u({ stress: v })}
          labels={[t("qc.stress1"), t("qc.stress2"), t("qc.stress3"), t("qc.stress4"), t("qc.stress5")]} />
        <ScaleRow title={t("qc.moodQ")} value={d.mood} onChange={v => u({ mood: v })}
          labels={[t("qc.mood1"), t("qc.mood2"), t("qc.mood3"), t("qc.mood4"), t("qc.mood5")]} />
        <MultiSelect
          label={t("qc.mindQ")} optional
          options={CONCERNS}
          selected={d.mindConcerns}
          onToggle={toggleConcern}
        />
      </div>
    </>
  );
}

function Step5({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const CRASH: Opt[] = [
    { v: "Yes", l: t("qc.crashYes") },
    { v: "Sometimes", l: t("qc.crashSometimes") },
    { v: "No", l: t("qc.crashNo") },
  ];
  return (
    <>
      <Heading step={5} title={t("qc.s5title")} subtitle={t("qc.s5sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScaleRow title={t("qc.energyQ")} value={d.energy} onChange={v => u({ energy: v })}
          labels={[t("qc.energy1"), t("qc.energy2"), t("qc.energy3"), t("qc.energy4"), t("qc.energy5")]} />
        <div>
          <QLabel text={t("qc.crashQ")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {CRASH.map(c => (
              <Card key={c.v} label={c.l} selected={d.afternoonCrash === c.v} onClick={() => u({ afternoonCrash: c.v })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step6({ d, u }: { d: QuizData; u: Updater }) {
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
    <>
      <Heading step={6} title={t("qc.s6title")} subtitle={t("qc.s6sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text={t("qc.trainQ")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FREQ.map(f => (
              <Card key={f.v} label={f.l} sub={f.s}
                selected={d.workoutFreq === f.v} onClick={() => u({ workoutFreq: f.v })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text={t("qc.trainTypeQ")} optional />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {TYPES.map(ty => (
              <Card key={ty.v} label={ty.l} selected={d.workoutType === ty.v} onClick={() => u({ workoutType: ty.v })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step7({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const DIETS: Opt[] = [
    { v: "Omnivore", l: t("qc.dietOmnivore"), s: t("qc.dietOmnivoreSub") },
    { v: "Vegetarian", l: t("qc.dietVegetarian"), s: t("qc.dietVegetarianSub") },
    { v: "Vegan", l: t("qc.dietVegan"), s: t("qc.dietVeganSub") },
    { v: "Pescatarian", l: t("qc.dietPescatarian"), s: t("qc.dietPescatarianSub") },
    { v: "Keto / Low-carb", l: t("qc.dietKeto"), s: t("qc.dietKetoSub") },
    { v: "Other / Flexible", l: t("qc.dietOther"), s: t("qc.dietOtherSub") },
  ];
  const CAFFEINE: Opt[] = [
    { v: "None", l: t("qc.caffNone") },
    { v: "1 cup", l: t("qc.caff1") },
    { v: "2-3 cups", l: t("qc.caff23") },
    { v: "4+ cups", l: t("qc.caff4") },
  ];
  const ALCOHOL: Opt[] = [
    { v: "None", l: t("qc.alcNone") },
    { v: "Rarely", l: t("qc.alcRarely") },
    { v: "1-3 / week", l: t("qc.alc13") },
    { v: "4+ / week", l: t("qc.alc4") },
  ];
  return (
    <>
      <Heading step={7} title={t("qc.s7title")} subtitle={t("qc.s7sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text={t("qc.dietQ")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DIETS.map(di => (
              <Card key={di.v} label={di.l} sub={di.s}
                selected={d.diet === di.v} onClick={() => u({ diet: di.v })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text={t("qc.caffeineQ")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CAFFEINE.map(c => (
              <Card key={c.v} label={c.l} selected={d.caffeine === c.v} onClick={() => u({ caffeine: c.v })} compact />
            ))}
          </div>
        </div>
        <div>
          <QLabel text={t("qc.alcoholQ")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ALCOHOL.map(a => (
              <Card key={a.v} label={a.l} selected={d.alcohol === a.v} onClick={() => u({ alcohol: a.v })} compact />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Step8({ d, u }: { d: QuizData; u: Updater }) {
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
  const toggle = (c: string) =>
    u({ bodyConcerns: d.bodyConcerns.includes(c) ? d.bodyConcerns.filter(x => x !== c) : [...d.bodyConcerns, c] });
  return (
    <>
      <Heading step={8} title={t("qc.s8title")} subtitle={t("qc.s8sub")} />
      <MultiSelect
        label={t("qc.bodyQ")} optional
        options={CONCERNS}
        selected={d.bodyConcerns}
        onToggle={toggle}
      />
    </>
  );
}

function Step9({ d, u }: { d: QuizData; u: Updater }) {
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
  const toggleAllergy = (a: string) =>
    u({ allergies: d.allergies.includes(a) ? d.allergies.filter(x => x !== a) : [...d.allergies, a] });
  const toggleCondition = (c: string) =>
    u({ conditions: d.conditions.includes(c) ? d.conditions.filter(x => x !== c) : [...d.conditions, c] });
  return (
    <>
      <Heading step={9} title={t("qc.s9title")} subtitle={t("qc.s9sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {d.gender === "Female" && (
          <div>
            <QLabel text={t("qc.pregnantQ")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {PREGNANT.map(p => (
                <Card key={p.v} label={p.l} selected={d.pregnant === p.v} onClick={() => u({ pregnant: p.v })} compact />
              ))}
            </div>
          </div>
        )}

        <MultiSelect
          label={t("qc.allergiesQ")}
          options={ALLERGIES}
          selected={d.allergies}
          onToggle={toggleAllergy}
        />

        <MultiSelect
          label={t("qc.conditionsQ")}
          options={CONDITIONS}
          selected={d.conditions}
          onToggle={toggleCondition}
        />
      </div>
    </>
  );
}

function Step10({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const BUDGETS: Opt[] = [
    { v: "Under $20 / month", l: t("qc.budgetUnder20"), s: t("qc.budgetUnder20Sub") },
    { v: "$20 - $50 / month", l: t("qc.budget2050"), s: t("qc.budget2050Sub") },
    { v: "$50 - $100 / month", l: t("qc.budget50100"), s: t("qc.budget50100Sub") },
    { v: "$100+ / month", l: t("qc.budget100"), s: t("qc.budget100Sub") },
  ];
  return (
    <>
      <Heading step={10} title={t("qc.s10title")} subtitle={t("qc.s10sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <QLabel text={t("qc.budgetQ")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BUDGETS.map(b => (
              <Card key={b.v} label={b.l} sub={b.s}
                selected={d.budget === b.v} onClick={() => u({ budget: b.v })} compact />
            ))}
          </div>
        </div>

        {d.diet !== "Vegan" && (
          <div>
            <QLabel text={t("qc.veganQ")} optional />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card label={t("qc.veganYes")} selected={d.veganOnly}
                onClick={() => u({ veganOnly: true })} compact />
              <Card label={t("qc.veganNo")} selected={!d.veganOnly}
                onClick={() => u({ veganOnly: false })} compact />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Phase 7 refinements: both lists are OPTIONAL. Option `v` values are the exact
// English strings the recommend() engine matches on (current-supp ids + priority
// tags); only `l` labels are localized. Never translate a `v`.
function Step11({ d, u }: { d: QuizData; u: Updater }) {
  const { t } = useT();
  const CURRENT: Opt[] = [
    { v: "Multivitamin", l: t("qc.csMulti") },
    { v: "Vitamin D", l: t("qc.csVitD") },
    { v: "Omega-3 fish oil", l: t("qc.csOmega") },
    { v: "Magnesium", l: t("qc.csMag") },
    { v: "Probiotic", l: t("qc.csProbiotic") },
    { v: "Creatine", l: t("qc.csCreatine") },
    { v: "B12 or B-complex", l: t("qc.csB") },
    { v: "Collagen", l: t("qc.csCollagen") },
    { v: "Vitamin C", l: t("qc.csVitC") },
    { v: "Zinc", l: t("qc.csZinc") },
  ];
  const PRIORITIES: Opt[] = [
    { v: "Heart & circulation", l: t("qc.hpHeart") },
    { v: "Brain & memory", l: t("qc.hpBrain") },
    { v: "Gut & digestion", l: t("qc.hpGut") },
    { v: "Immune resilience", l: t("qc.hpImmune") },
    { v: "Energy & metabolism", l: t("qc.hpEnergy") },
    { v: "Joints & mobility", l: t("qc.hpJoints") },
    { v: "Skin, hair & nails", l: t("qc.hpSkin") },
    { v: "Longevity & healthy aging", l: t("qc.hpLongevity") },
    { v: "Mood & stress", l: t("qc.hpMood") },
    { v: "Sleep quality", l: t("qc.hpSleep") },
  ];
  const cur = d.currentSupplements ?? [];
  const pri = d.healthPriorities ?? [];
  const toggleCurrent = (v: string) =>
    u({ currentSupplements: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] });
  const togglePriority = (v: string) =>
    u({ healthPriorities: pri.includes(v) ? pri.filter(x => x !== v) : [...pri, v] });
  return (
    <>
      <Heading step={11} title={t("qc.s11title")} subtitle={t("qc.s11sub")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <MultiSelect label={t("qc.currentQ")} options={CURRENT} selected={cur} onToggle={toggleCurrent} optional />
        <MultiSelect label={t("qc.priorityQ")} options={PRIORITIES} selected={pri} onToggle={togglePriority} optional />
      </div>
    </>
  );
}

function StepGenerating({ data }: { data: QuizData }) {
  const router = useRouter();
  const { t } = useT();
  const [phase, setPhase] = useState<"email" | "loading">("email");
  const [email, setEmail] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Save quiz data immediately
    localStorage.setItem("phylaQuizData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (phase !== "loading") return;
    const ticks = [600, 1300, 2000, 2700].map((d, i) => setTimeout(() => setTick(i + 1), d));
    const redirect = setTimeout(() => router.push("/results"), 3400);
    return () => { ticks.forEach(clearTimeout); clearTimeout(redirect); };
  }, [phase, router]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (email && email.includes("@")) {
      localStorage.setItem("phylaUserEmail", email);
      trackEmailSignup(email, "quiz_results").catch(() => {});
    }
    setPhase("loading");
  }

  function skipEmail() {
    setPhase("loading");
  }

  const steps = [t("qc.gen1"), t("qc.gen2"), t("qc.gen3"), t("qc.gen4")];

  if (phase === "email") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", animation: "phyla-sway 4s ease-in-out infinite" }}>
          <SDMark size={56} />
        </div>
        <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 12 }}>
          {t("qc.almostReady")}
        </div>
        <h1 style={{ ...S, fontSize: 44, color: th.ink, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {t("qc.emailTitle")}
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.5, maxWidth: 420, margin: "0 auto 28px" }}>
          {t("qc.emailSub")}
        </p>

        <form onSubmit={submitEmail} style={{ maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "16px 18px", borderRadius: 12, fontSize: 16,
              border: email ? `2px solid ${th.sage}` : `1.5px solid ${th.line}`,
              background: th.paper, color: th.ink, outline: "none",
              fontFamily: '"Inter", system-ui, sans-serif', boxSizing: "border-box",
            }}
          />
          <button type="submit" style={{
            padding: "15px 18px", borderRadius: 12,
            background: th.burgundy, color: "#ffffff", border: "none",
            fontSize: 15, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            {t("qc.emailBtn")} →
          </button>
          <button type="button" onClick={skipEmail} style={{
            padding: "10px", background: "transparent", border: "none",
            color: th.inkMute, fontSize: 13, cursor: "pointer",
            fontFamily: '"Inter", system-ui, sans-serif', textDecoration: "underline",
            textUnderlineOffset: 3,
          }}>
            {t("qc.skipEmail")}
          </button>
        </form>

        <p style={{ fontSize: 11, color: th.inkMute, marginTop: 24, maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
          {t("qc.privacyNote")} <a href="/privacy" style={{ color: th.sage }}>{t("qc.privacyLink")}</a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "center", animation: "phyla-sway 3s ease-in-out infinite" }}>
        <SDMark size={64} />
      </div>
      <h1 style={{ ...S, fontSize: 48, color: th.ink, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {t("qc.composing")}
      </h1>
      <p style={{ color: th.inkSoft, fontSize: 16, marginBottom: 36, lineHeight: 1.5 }}>
        {t("qc.matching")}
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
              {tick > i && <span style={{ color: "#ffffff", fontSize: 11, fontWeight: 600 }}>✓</span>}
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
    <div style={{ height: 4, background: th.line, borderRadius: 999, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: "linear-gradient(90deg, #0d9488, var(--c-sage), var(--c-amber))",
        transition: "width .5s cubic-bezier(.4,0,.2,1)", borderRadius: 999,
      }} />
    </div>
  );
}

// ─── Main quiz page ──────────────────────────────────────────────────────────
export default function QuizPage() {
  const { t, lh } = useT();
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
        <SuppdocLogo size={18} />
        {!isGenerating && (
          <Link href={lh("/")} style={{
            fontSize: 13, color: th.inkMute, textDecoration: "none",
            padding: "8px 14px", borderRadius: 999, border: `1px solid ${th.line}`,
          }}>
            {t("qc.saveExit")}
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
            {step === 11 && <Step11 {...props} />}
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
            ← {t("qc.back")}
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
            color: ok ? "#ffffff" : th.inkMute,
            border: "none", cursor: ok ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}>
            {step === TOTAL_STEPS ? t("qc.buildRitual") : t("qc.continue")}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
