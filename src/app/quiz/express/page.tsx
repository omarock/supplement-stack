"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizData } from "@/types/quiz";
import { trackEmailSignup } from "@/lib/track";
import SuppdocLogo from "@/components/SuppdocLogo";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
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
        background: `${TH.bg}f0`, backdropFilter: "blur(14px) saturate(140%)",
        borderBottom: `1px solid ${TH.edge}`,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <SuppdocLogo size={18} />
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TH.muted, ...MM, marginBottom: 6, letterSpacing: "0.08em" }}>
              <span>EXPRESS · STEP {step}/{TOTAL}</span>
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
          <Link href="/quiz" style={{ fontSize: 12.5, color: TH.muted, textDecoration: "none" }}>
            Switch quiz
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
          }}>← Back</button>
          <button onClick={next} disabled={!ok} style={{
            padding: "13px 24px", borderRadius: 999, border: "none",
            background: ok ? TH.ink : TH.muted, color: TH.surface,
            fontSize: 14, fontWeight: 500, cursor: ok ? "pointer" : "not-allowed",
            opacity: ok ? 1 : 0.6, transition: "all .2s",
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: ok ? `0 8px 20px ${TH.ink}22` : "none",
          }}>
            {step === TOTAL ? "Generate my stack" : "Continue"} →
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
  return (
    <div>
      <StepHeader tag="Step 1 of 6" title="About you" sub="Two quick details so we can match doses correctly." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <Field label="Age">
          <input type="number" min={13} max={100} value={data.age} onChange={e => update({ age: e.target.value })}
            placeholder="32" style={inputStyle()} />
        </Field>
        <Field label="Sex (for dose adjustment)">
          <ChipGroup options={["Female", "Male", "Other"]} value={data.gender} onChange={v => update({ gender: v })} />
        </Field>
      </div>
    </div>
  );
}

function Step2({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const GOALS = [
    "Better sleep", "More energy", "Sharper focus", "Lower stress",
    "Muscle & Recovery", "Stronger immunity", "Healthy aging & longevity",
    "Better mood", "Skin / hair / Beauty", "Gut health",
  ];
  const toggle = (g: string) => {
    if (data.goals.includes(g)) update({ goals: data.goals.filter(x => x !== g) });
    else if (data.goals.length < 3) update({ goals: [...data.goals, g] });
  };
  return (
    <div>
      <StepHeader tag="Step 2 of 6" title="What matters most?" sub="Pick up to 3. The ones at the top will get the strongest match." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
        {GOALS.map(g => {
          const active = data.goals.includes(g);
          const idx = data.goals.indexOf(g);
          return (
            <button key={g} onClick={() => toggle(g)} style={{
              position: "relative",
              padding: "13px 14px", borderRadius: 14, cursor: "pointer",
              background: active ? `${TH.sage}1a` : TH.surface,
              border: `1.5px solid ${active ? TH.sage : TH.edge}`,
              fontSize: 14, color: active ? TH.sageDeep : TH.ink, fontWeight: active ? 600 : 500,
              textAlign: "left", transition: "all .15s",
            }}>
              {g}
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
        Selected: {data.goals.length}/3
      </div>
    </div>
  );
}

function Step3({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  return (
    <div>
      <StepHeader tag="Step 3 of 6" title="How is your sleep?" sub="Rate the overall quality of your sleep over the last month." />
      <ScaleField value={data.sleep} onChange={v => update({ sleep: v })}
        labels={["Awful", "Poor", "OK", "Good", "Excellent"]} />
    </div>
  );
}

function Step4({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  return (
    <div>
      <StepHeader tag="Step 4 of 6" title="Energy & stress" sub="Two quick scales, same as your sleep one." />
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: TH.ink, marginBottom: 10 }}>Daytime energy</div>
        <ScaleField value={data.energy} onChange={v => update({ energy: v })}
          labels={["Drained", "Low", "OK", "Good", "Buzzing"]} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: TH.ink, marginBottom: 10 }}>Stress level</div>
        <ScaleField value={data.stress} onChange={v => update({ stress: v })}
          labels={["None", "Low", "Average", "High", "Burning out"]} reversed />
      </div>
    </div>
  );
}

function Step5({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  const DIETS = ["Omnivore", "Pescatarian", "Vegetarian", "Vegan", "Keto / low-carb"];
  const BUDGETS = ["Under $20", "$20 - $50", "$50 - $100", "$100+"];
  return (
    <div>
      <StepHeader tag="Step 5 of 6" title="Diet & budget" sub="So we can pick the right forms and stay within what you want to spend." />
      <Field label="Your diet">
        <ChipGroup options={DIETS} value={data.diet} onChange={v => update({ diet: v, veganOnly: v === "Vegan" })} />
      </Field>
      <div style={{ marginTop: 22 }}>
        <Field label="Monthly supplement budget">
          <ChipGroup options={BUDGETS} value={data.budget} onChange={v => update({ budget: v })} />
        </Field>
      </div>
    </div>
  );
}

function StepEmail({ data, update }: { data: QuizData; update: (u: Partial<QuizData>) => void }) {
  // Email is optional in Express. Pressing "Generate" without one still works.
  return (
    <div>
      <StepHeader tag="Step 6 of 6 · Optional" title="Where should we send your stack?" sub="Your stack appears on the next screen either way, but if you give us an email, we'll send a copy you can revisit. No spam. Unsubscribe anytime." />
      <Field label="Email (optional)">
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
        marginTop: 22, padding: "14px 16px", background: `${TH.sage}10`,
        borderRadius: 12, fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.6,
      }}>
        <strong style={{ color: TH.sageDeep }}>Heads up:</strong>{" "}
        Express uses thoughtful defaults for sleep duration, allergies, medications, and bodywide concerns. For maximum accuracy, or if you have health conditions or take prescription medications, <Link href="/quiz/complete" style={{ color: TH.sageDeep, fontWeight: 600 }}>take the Complete quiz</Link>.
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

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const active = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)} style={{
            padding: "10px 14px", borderRadius: 999, cursor: "pointer",
            background: active ? TH.ink : TH.surface,
            border: `1.5px solid ${active ? TH.ink : TH.edge}`,
            color: active ? TH.surface : TH.ink,
            fontSize: 13.5, fontWeight: active ? 600 : 500,
            transition: "all .15s",
          }}>{o}</button>
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
