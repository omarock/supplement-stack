"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { trackEmailSignup } from "@/lib/track";
import { useT } from "@/components/I18nProvider";
import SuppdocLogo from "@/components/SuppdocLogo";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

// Express-fills: smart defaults for everything we DON'T ask the user
// so the recommend() engine still gets a fully-shaped QuizData.
const EXPRESS_DEFAULTS: QuizData = {
  age: "", gender: "",
  height: "", weight: "",
  goals: [],
  sleep: 0,
  sleepHours: "7-8 hours",
  sleepIssues: ["None of these"],
  stress: 0,
  mood: 3,
  mindConcerns: [],
  energy: 0,
  afternoonCrash: "Sometimes",
  workoutFreq: "1-2 times",
  workoutType: "Mixed",
  diet: "",
  caffeine: "1-2 cups",
  alcohol: "Rarely",
  bodyConcerns: [],
  pregnant: "No",
  allergies: ["None of these"],
  conditions: ["None of these"],
  budget: "$20 - $50",
  veganOnly: false,
};

const TOTAL = 6;

// IMPORTANT: option `value`s are the ENGLISH strings the recommend() engine
// matches on; only the `label` (shown to the user) is localized. Never localize
// a value here or the engine will stop matching it.
type Opt = { value: string; label: string };

function canProceed(step: number, d: QuizData): boolean {
  switch (step) {
    case 1: { const age = parseInt(d.age); return d.age !== "" && age >= 13 && age <= 100 && d.gender !== ""; }
    case 2: return d.goals.length > 0;
    case 3: return d.sleep > 0;
    case 4: return d.energy > 0 && d.stress > 0;
    case 5: return d.diet !== "" && d.budget !== "";
    case 6: return true;
    default: return false;
  }
}

export default function ExpressQuiz() {
  const router = useRouter();
  const { t, lh } = useT();
  // The quiz is intentionally STATELESS across visits: it always starts at
  // step 1 with fresh defaults. We never auto-restore a saved draft or step, so
  // a user is never dropped onto a previously completed step (e.g. the last
  // page) or made to resume unintentionally. The only persisted value is the
  // final result (phylaQuizData, written in finish()), read by /results, which
  // is a separate concern from this in-progress flow.
  const [data, setData] = useState<QuizData>(EXPRESS_DEFAULTS);
  const [step, setStep] = useState(1);

  const update = (u: Partial<QuizData>) => setData(d => ({ ...d, ...u }));
  const ok = canProceed(step, data);

  const next = () => {
    if (!ok) return;
    if (step < TOTAL) setStep(step + 1);
    else finish();
  };
  const back = () => step > 1 && setStep(step - 1);

  const finish = () => {
    // Mirror the existing /quiz/complete pattern: persist as phylaQuizData so /results can read it
    try { localStorage.setItem("phylaQuizData", JSON.stringify(data)); } catch { /* ignore */ }
    router.push("/results");
  };

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: FONTS.body }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        padding: "16px var(--section-pad-x)",
        background: `color-mix(in srgb, ${TH.bg} 94%, transparent)`, backdropFilter: "blur(14px) saturate(140%)",
        borderBottom: `1px solid ${TH.edge}`,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <SuppdocLogo size={18} />
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TH.muted, ...MM, marginBottom: 6, letterSpacing: "0.08em" }}>
              <span>{t("qe.expressStep", { step, total: TOTAL })}</span>
              <span>{Math.round((step / TOTAL) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: TH.edge, borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${(step / TOTAL) * 100}%`, height: "100%",
                background: `linear-gradient(90deg, ${TH.sage}, ${TH.sageDeep})`,
                transition: "width .5s cubic-bezier(.2,.7,.2,1)",
              }} />
            </div>
          </div>
          <Link href={lh("/quiz")} style={{ fontSize: 12.5, color: TH.muted, textDecoration: "none" }}>
            {t("qe.switchQuiz")}
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "44px var(--section-pad-x) 60px" }}>
        {step === 1 && <Step1 data={data} update={update} />}
        {step === 2 && <Step2 data={data} update={update} />}
        {step === 3 && <Step3 data={data} update={update} />}
        {step === 4 && <Step4 data={data} update={update} />}
        {step === 5 && <Step5 data={data} update={update} />}
        {step === 6 && <StepEmail data={data} update={update} />}

        <div style={{
          marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <button onClick={back} disabled={step === 1} style={{
            padding: "12px 18px", borderRadius: 999, border: "none",
            background: "transparent", color: step === 1 ? TH.muted : TH.ink,
            fontSize: 14, fontWeight: 500, cursor: step === 1 ? "not-allowed" : "pointer",
          }}>← {t("qe.back")}</button>
          <button onClick={next} disabled={!ok} style={{
            padding: "13px 24px", borderRadius: 999, border: "none",
            background: ok ? TH.inkBg : TH.muted, color: "#fff",
            fontSize: 14, fontWeight: 500, cursor: ok ? "pointer" : "not-allowed",
            opacity: ok ? 1 : 0.6, transition: "all .2s",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: ok ? `0 8px 20px color-mix(in srgb, ${TH.ink} 13%, transparent)` : "none",
          }}>
            {step === TOTAL ? t("qe.generate") : t("qe.continue")} →
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────
function StepHeader({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <header style={{ marginBottom: 26 }}>
      <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>{tag}</div>
      <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.08, letterSpacing: "-0.025em", margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 15, color: TH.inkSoft, marginTop: 10, lineHeight: 1.55 }}>{sub}</p>}
    </header>
  );
}

function Step1({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const GENDERS: Opt[] = [
    { value: "Female", label: t("qe.genderFemale") },
    { value: "Male", label: t("qe.genderMale") },
    { value: "Other", label: t("qe.genderOther") },
  ];
  return (
    <div>
      <StepHeader tag={t("qe.s1tag")} title={t("qe.s1title")} sub={t("qe.s1sub")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <Field label={t("qe.age")}>
          <input type="number" min={13} max={100} value={data.age} onChange={e => update({ age: e.target.value })}
            placeholder="32" style={inputStyle()} />
        </Field>
        <Field label={t("qe.sex")}>
          <ChipGroup options={GENDERS} value={data.gender} onChange={v => update({ gender: v })} />
        </Field>
      </div>
    </div>
  );
}

function Step2({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const GOALS: Opt[] = [
    { value: "Better sleep", label: t("qe.goalSleep") },
    { value: "More energy", label: t("qe.goalEnergy") },
    { value: "Sharper focus", label: t("qe.goalFocus") },
    { value: "Lower stress", label: t("qe.goalStress") },
    { value: "Muscle & Recovery", label: t("qe.goalMuscle") },
    { value: "Stronger immunity", label: t("qe.goalImmunity") },
    { value: "Healthy aging & longevity", label: t("qe.goalLongevity") },
    { value: "Better mood", label: t("qe.goalMood") },
    { value: "Skin / hair / Beauty", label: t("qe.goalBeauty") },
    { value: "Gut health", label: t("qe.goalGut") },
  ];
  const toggle = (g: string) => {
    if (data.goals.includes(g)) update({ goals: data.goals.filter(x => x !== g) });
    else if (data.goals.length < 3) update({ goals: [...data.goals, g] });
  };
  return (
    <div>
      <StepHeader tag={t("qe.s2tag")} title={t("qe.s2title")} sub={t("qe.s2sub")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
        {GOALS.map(g => {
          const active = data.goals.includes(g.value);
          const idx = data.goals.indexOf(g.value);
          return (
            <button key={g.value} onClick={() => toggle(g.value)} style={{
              position: "relative",
              padding: "13px 14px", borderRadius: 14, cursor: "pointer",
              background: active ? `color-mix(in srgb, ${TH.sage} 10%, transparent)` : TH.surface,
              border: `1.5px solid ${active ? TH.sage : TH.edge}`,
              fontSize: 14, color: active ? TH.sageDeep : TH.ink, fontWeight: active ? 600 : 500,
              textAlign: "left", transition: "all .15s",
            }}>
              {g.label}
              {active && (
                <span style={{
                  position: "absolute", top: 8, right: 10,
                  fontSize: 10, ...MM, color: TH.sageDeep,
                }}>#{idx + 1}</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: TH.muted, marginTop: 10 }}>
        {t("qe.selected", { n: data.goals.length })}
      </div>
    </div>
  );
}

function Step3({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  return (
    <div>
      <StepHeader tag={t("qe.s3tag")} title={t("qe.s3title")} sub={t("qe.s3sub")} />
      <ScaleField value={data.sleep} onChange={v => update({ sleep: v })}
        labels={[t("qe.sleep1"), t("qe.sleep2"), t("qe.sleep3"), t("qe.sleep4"), t("qe.sleep5")]} />
    </div>
  );
}

function Step4({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  return (
    <div>
      <StepHeader tag={t("qe.s4tag")} title={t("qe.s4title")} sub={t("qe.s4sub")} />
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: TH.ink, marginBottom: 10 }}>{t("qe.energyLabel")}</div>
        <ScaleField value={data.energy} onChange={v => update({ energy: v })}
          labels={[t("qe.energy1"), t("qe.energy2"), t("qe.energy3"), t("qe.energy4"), t("qe.energy5")]} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: TH.ink, marginBottom: 10 }}>{t("qe.stressLabel")}</div>
        <ScaleField value={data.stress} onChange={v => update({ stress: v })}
          labels={[t("qe.stress1"), t("qe.stress2"), t("qe.stress3"), t("qe.stress4"), t("qe.stress5")]} reversed />
      </div>
    </div>
  );
}

function Step5({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t } = useT();
  const DIETS: Opt[] = [
    { value: "Omnivore", label: t("qe.dietOmnivore") },
    { value: "Pescatarian", label: t("qe.dietPescatarian") },
    { value: "Vegetarian", label: t("qe.dietVegetarian") },
    { value: "Vegan", label: t("qe.dietVegan") },
    { value: "Keto / low-carb", label: t("qe.dietKeto") },
  ];
  const BUDGETS: Opt[] = [
    { value: "Under $20", label: t("qe.budgetUnder20") },
    { value: "$20 - $50", label: t("qe.budget2050") },
    { value: "$50 - $100", label: t("qe.budget50100") },
    { value: "$100+", label: t("qe.budget100") },
  ];
  return (
    <div>
      <StepHeader tag={t("qe.s5tag")} title={t("qe.s5title")} sub={t("qe.s5sub")} />
      <Field label={t("qe.dietLabel")}>
        <ChipGroup options={DIETS} value={data.diet} onChange={v => update({ diet: v, veganOnly: v === "Vegan" })} />
      </Field>
      <div style={{ marginTop: 22 }}>
        <Field label={t("qe.budgetLabel")}>
          <ChipGroup options={BUDGETS} value={data.budget} onChange={v => update({ budget: v })} />
        </Field>
      </div>
    </div>
  );
}

function StepEmail({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const { t, lh } = useT();
  // Email is optional in Express. Pressing "Generate" without one still works.
  return (
    <div>
      <StepHeader tag={t("qe.s6tag")} title={t("qe.s6title")} sub={t("qe.s6sub")} />
      <Field label={t("qe.emailOptional")}>
        <input
          type="email"
          value={(data as QuizData & { email?: string }).email ?? ""}
          onChange={e => {
            const email = e.target.value;
            update({ email } as Partial<QuizData>);
            // Stash email in localStorage for the email-drip cron to pick up
            try {
              localStorage.setItem("phylaQuizEmail", email);
            } catch { /* ignore */ }
          }}
          onBlur={e => { if (e.target.value.includes("@")) { void trackEmailSignup(e.target.value, "express_quiz"); } }}
          placeholder="you@example.com"
          style={inputStyle()}
        />
      </Field>
      <div style={{
        marginTop: 22, padding: "14px 16px", background: `color-mix(in srgb, ${TH.sage} 6%, transparent)`,
        borderRadius: 12, fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.6,
      }}>
        <strong style={{ color: TH.sageDeep }}>{t("qe.headsUp")}</strong>{" "}
        {t("qe.headsUpBody")} <Link href={lh("/quiz/complete")} style={{ color: TH.sageDeep, fontWeight: 600 }}>{t("qe.headsUpLink")}</Link>{t("qe.headsUpEnd")}
      </div>
    </div>
  );
}

// ─── Reusable primitives ──────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: TH.inkSoft, marginBottom: 8 }}>{label}</div>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    padding: "13px 16px", border: `1.5px solid ${TH.edge}`,
    borderRadius: 12, fontSize: 15, color: TH.ink, fontFamily: FONTS.body,
    background: TH.surface, outline: "none", transition: "border-color .15s",
  };
}

function ChipGroup({ options, value, onChange }: { options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            padding: "10px 14px", borderRadius: 999, cursor: "pointer",
            background: active ? TH.inkBg : TH.surface,
            border: `1.5px solid ${active ? TH.ink : TH.edge}`,
            color: active ? TH.surface : TH.ink,
            fontSize: 13.5, fontWeight: active ? 600 : 500,
            transition: "all .15s",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function ScaleField({ value, onChange, labels, reversed }: { value: number; onChange: (n: number) => void; labels: string[]; reversed?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const active = value === n;
          // For reversed scales (stress), the "best" answer is 1 (green); for normal, 5 is green
          const goodness = reversed ? (6 - n) / 5 : n / 5;
          const col = goodness > 0.7 ? TH.sageDeep : goodness > 0.4 ? TH.amberDeep : "#b91c1c";
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              flex: 1, padding: "16px 6px", borderRadius: 14,
              background: active ? `${col}15` : TH.surface,
              border: `1.5px solid ${active ? col : TH.edge}`,
              cursor: "pointer", textAlign: "center",
              display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
              transition: "all .15s",
            }}>
              <span style={{ ...D, fontSize: 22, color: active ? col : TH.ink }}>{n}</span>
              <span style={{ fontSize: 10.5, ...MM, color: active ? col : TH.muted, letterSpacing: "0.04em" }}>{labels[n - 1].toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
