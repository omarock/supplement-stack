"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import ThinkingMessages from "@/components/ThinkingMessages";
import { STATUS_META, rangeBarModel, type BloodworkAnalysis, type ExtractedBiomarker, type BiomarkerStatus } from "@/lib/biomarkers";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import ConfidenceCard from "@/components/ConfidenceCard";
import type { EvidenceTier } from "@/components/EvidenceBadge";
import { track } from "@/lib/analytics";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const PHRASES = [
  "Reading your report…",
  "Extracting biomarkers…",
  "Checking reference ranges…",
  "Cross-referencing 151 ingredients…",
  "Writing your analysis…",
];

const MAX_BYTES = 3.5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];

type Stage = "idle" | "reading" | "analyzing" | "done" | "error";

interface Prepared { mediaType: string; base64: string; kind: "pdf" | "image"; previewName: string; }

// Downscale big images client-side so we stay under the upload limit.
async function prepareFile(file: File): Promise<Prepared> {
  const isPdf = file.type === "application/pdf";
  if (isPdf) {
    const base64 = await fileToBase64(file);
    return { mediaType: "application/pdf", base64, kind: "pdf", previewName: file.name };
  }
  // image: draw to canvas, cap longest side at 2200px, export JPEG
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const max = 2200;
  let { width, height } = img;
  if (Math.max(width, height) > max) {
    const scale = max / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) { const base64 = await fileToBase64(file); return { mediaType: file.type, base64, kind: "image", previewName: file.name }; }
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const out = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", base64: out.split(",")[1], kind: "image", previewName: file.name };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Realistic demo analysis shown by "See an example", uses real biomarker keys
// (so range bars render) and real catalog supplement ids.
const SAMPLE_ANALYSIS: BloodworkAnalysis = {
  ok: true,
  poweredBy: "claude",
  confidence: "high",
  summary: "Most markers look healthy. Two are worth attention, your ferritin (iron stores) is low and your vitamin D is on the low side, and a few metabolic markers are drifting up. None are alarming, but a few targeted changes could help your energy and long-term health.",
  biomarkers: [
    { key: "ferritin", name: "Ferritin", value: 28, unit: "ng/mL", refRange: "30-400", status: "low", category: "blood", note: "Iron storage. Low ferritin is a leading cause of fatigue, especially in menstruating women." },
    { key: "vitamin_d", name: "Vitamin D (25-OH)", value: 24, unit: "ng/mL", refRange: "30-100", status: "borderline-low", category: "vitamins", note: "Drives immune function, mood, bone health, and calcium handling." },
    { key: "hba1c", name: "HbA1c", value: 5.8, unit: "%", refRange: "<5.7", status: "borderline-high", category: "metabolic", note: "Average blood sugar over ~3 months. 5.7-6.4% is the prediabetic range." },
    { key: "ldl", name: "LDL Cholesterol", value: 142, unit: "mg/dL", refRange: "<100", status: "borderline-high", category: "lipids", note: "The cholesterol carrier most associated with cardiovascular risk." },
    { key: "b12", name: "Vitamin B12", value: 560, unit: "pg/mL", refRange: "300-900", status: "optimal", category: "vitamins", note: "Essential for nerve function, energy, and red blood cells." },
    { key: "magnesium", name: "Magnesium (serum)", value: 2.1, unit: "mg/dL", refRange: "1.8-2.4", status: "optimal", category: "minerals", note: "Cofactor in 300+ reactions." },
  ],
  findings: [
    { title: "Low iron stores", detail: "Ferritin of 28 is below range. Combined with fatigue, this is worth discussing with your doctor, and a simple recheck in 8-12 weeks.", severity: "flag", biomarkers: ["Ferritin"] },
    { title: "Metabolic markers drifting up", detail: "HbA1c (5.8%) and LDL (142) are both just over the ideal line. Diet, movement, and a couple of supplements can often nudge these back.", severity: "watch", biomarkers: ["HbA1c", "LDL Cholesterol"] },
    { title: "This is not a diagnosis", detail: "This analysis is educational and based only on the values shown. Lab ranges vary by lab, age, sex, and medications. Review results with a qualified clinician.", severity: "info" },
  ],
  recommendations: [
    { supplementId: "iron", name: "Iron Bisglycinate (Gentle)", reason: "Targets your low ferritin. The bisglycinate form is gentle on digestion. Pair with vitamin C and recheck in ~3 months.", biomarker: "Ferritin" },
    { supplementId: "vit-c", name: "Vitamin C (Buffered)", reason: "Boosts iron absorption when taken alongside it.", biomarker: "Ferritin" },
    { supplementId: "d3k2", name: "Vitamin D3 + K2", reason: "Brings your vitamin D into the optimal range; K2 routes calcium to bone, not arteries.", biomarker: "Vitamin D (25-OH)" },
    { supplementId: "berberine", name: "Berberine HCl", reason: "Well-evidenced for nudging fasting glucose and HbA1c down, alongside diet.", biomarker: "HbA1c" },
    { supplementId: "omega3", name: "Omega-3 Fish Oil", reason: "Supports a healthier lipid profile and lowers triglycerides.", biomarker: "LDL Cholesterol" },
  ],
  lifestyle: [
    "Add an iron-rich food (red meat, lentils, spinach) with a squeeze of lemon for absorption.",
    "A 10-15 minute walk after meals blunts post-meal blood-sugar spikes.",
    "Swap refined carbs and sugary drinks for whole grains and water to bring HbA1c down.",
  ],
  seeClinicianFor: [
    "A ferritin of 28 ng/mL with fatigue, ask whether an iron panel and a cause check are warranted.",
    "HbA1c of 5.8% (prediabetic range), worth a conversation about prevention.",
  ],
};

export default function BloodworkClient({ signedIn }: { signedIn: boolean }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BloodworkAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceKind, setSourceKind] = useState<"pdf" | "image" | "text">("text");
  const [dragOver, setDragOver] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasted, setPasted] = useState("");
  const [isSample, setIsSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle"); setError(null); setResult(null); setFileName(null); setPasted(""); setPasteMode(false); setIsSample(false);
    // Bring the uploader back into view, otherwise the user is left scrolled
    // down where the result used to be, with the dropzone off-screen.
    setTimeout(() => {
      document.getElementById("bw-upload")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const showSample = useCallback(() => {
    setIsSample(true); setSourceKind("text"); setResult(SAMPLE_ANALYSIS); setStage("done");
    setTimeout(() => document.getElementById("bw-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, []);

  const analyze = useCallback(async (payload: Record<string, unknown>) => {
    setStage("analyzing"); setError(null);
    try {
      const res = await fetch("/api/bloodwork/analyze", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
      });
      const body: BloodworkAnalysis = await res.json();
      if (!body.ok) { setError(body.error || "We couldn't read that. Try a clearer photo or paste your values."); setStage("error"); return; }
      setResult(body); setStage("done");
      track("bloodwork_analyze", { markers: body.biomarkers?.length ?? 0, poweredBy: body.poweredBy ?? "rules" });
      setTimeout(() => document.getElementById("bw-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch { setError("Network error. Please try again."); setStage("error"); }
  }, []);

  const onFile = useCallback(async (file: File) => {
    setError(null);
    if (!ALLOWED.includes(file.type)) { setError("Please upload a PDF or a photo (JPG/PNG)."); setStage("error"); return; }
    if (file.size > 12 * 1024 * 1024) { setError("That file is very large. Upload a photo of just the results page, or paste the values."); setStage("error"); return; }
    setStage("reading"); setFileName(file.name);
    try {
      const prep = await prepareFile(file);
      const approxBytes = Math.floor((prep.base64.length * 3) / 4);
      if (approxBytes > MAX_BYTES) { setError("Still too large after compression (max ~3.5 MB). Try a tighter photo or paste the values as text."); setStage("error"); return; }
      setSourceKind(prep.kind);
      await analyze({ mediaType: prep.mediaType, dataBase64: prep.base64 });
    } catch { setError("Couldn't read that file. Try another, or paste your values."); setStage("error"); }
  }, [analyze]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>

        <header style={{ textAlign: "center", marginBottom: 22, animation: "sd-fade-in .5s ease-out" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
            Advanced · Bloodwork Analysis
          </div>
          <h1 style={{ ...D, fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Turn your labs into a <span style={SI}>plan</span>.
          </h1>
          <p style={{ fontSize: 16, color: TH.inkSoft, maxWidth: 560, margin: "0 auto", lineHeight: 1.5 }}>
            Upload a blood test, PDF or photo. We read your biomarkers, flag what&apos;s low or high, and suggest evidence-led, targeted supplements. Private and educational, never a diagnosis.
          </p>
        </header>

        {stage !== "done" && (
          <section id="bw-upload" style={{
            scrollMarginTop: 80,
            background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "26px 26px",
            boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.08)",
          }}>
            {(stage === "reading" || stage === "analyzing") ? (
              <ProcessingState stage={stage} fileName={fileName} />
            ) : pasteMode ? (
              <PastePanel
                value={pasted} onChange={setPasted}
                onCancel={() => setPasteMode(false)}
                onSubmit={() => { setSourceKind("text"); analyze({ text: pasted }); }}
              />
            ) : (
              <>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                  style={{
                    border: `2px dashed ${dragOver ? TH.sage : TH.edgeStrong}`,
                    background: dragOver ? TH.accentGlow : TH.bg,
                    borderRadius: 18, padding: "44px 24px", textAlign: "center", cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  <input ref={inputRef} type="file" accept=".pdf,image/*" hidden
                    onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, background: TH.surface, border: `1px solid ${TH.edge}`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={TH.sageDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" />
                    </svg>
                  </div>
                  <div style={{ ...D, fontSize: 19, color: TH.ink, marginBottom: 6 }}>
                    Drop your lab report here
                  </div>
                  <div style={{ fontSize: 14, color: TH.muted, lineHeight: 1.5 }}>
                    or <span style={{ color: TH.sageDeep, fontWeight: 600 }}>browse files</span> to upload
                  </div>
                  <div style={{ display: "inline-flex", gap: 6, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    {["PDF", "JPG", "PNG", "≤ 3.5 MB"].map(f => (
                      <span key={f} style={{
                        ...MM, fontSize: 10.5, color: TH.inkSoft, background: TH.surface,
                        border: `1px solid ${TH.edge}`, borderRadius: 999, padding: "3px 10px",
                      }}>{f}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.5, maxWidth: 360 }}>
                    <strong style={{ color: TH.inkSoft }}>Private:</strong> we don&apos;t store your file, it&apos;s read once and discarded.
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={showSample} style={{
                      background: "transparent", border: `1px solid ${TH.edge}`, borderRadius: 999, padding: "8px 16px",
                      color: TH.sageDeep, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      See an example
                    </button>
                    <button onClick={() => setPasteMode(true)} style={{
                      background: "transparent", border: `1px solid ${TH.edge}`, borderRadius: 999, padding: "8px 16px",
                      color: TH.inkSoft, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    }}>
                      Paste values
                    </button>
                  </div>
                </div>

                {error && stage === "error" && (
                  <div role="alert" style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "#fef2f2", color: "#991b1b", fontSize: 14 }}>
                    {error}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* How it works, only before result */}
        {stage === "idle" && !pasteMode && <HowItWorks />}

        {/* Result */}
        {stage === "done" && result && (
          <section id="bw-result" style={{ animation: "sd-fade-in .4s ease-out" }}>
            <AnalysisReport data={result} sourceKind={sourceKind} signedIn={signedIn} onReset={reset} isSample={isSample} />
          </section>
        )}
      </div>
    </main>
  );
}

// ─── Processing state ─────────────────────────────────────────────────────────
function ProcessingState({ stage, fileName }: { stage: Stage; fileName: string | null }) {
  return (
    <div style={{ padding: "26px 8px", textAlign: "center" }}>
      <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 20px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: `3px solid ${TH.edge}` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: `3px solid ${TH.sage}`, borderTopColor: "transparent", animation: "sd-spin .9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }} aria-hidden>🩸</div>
      </div>
      <div style={{ ...D, fontSize: 18, color: TH.ink, marginBottom: 6 }}>
        <ThinkingMessages phrases={stage === "reading" ? ["Reading your file…"] : PHRASES} interval={1100} noDot />
      </div>
      <div style={{ fontSize: 13, color: TH.muted }}>{fileName ? `Analyzing ${fileName}` : "This usually takes 10-20 seconds"}</div>
    </div>
  );
}

// ─── Paste panel ──────────────────────────────────────────────────────────────
function PastePanel({ value, onChange, onCancel, onSubmit }: { value: string; onChange: (v: string) => void; onCancel: () => void; onSubmit: () => void }) {
  return (
    <div>
      <label style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
        Paste your lab values
      </label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)} rows={8} autoFocus
        placeholder={"e.g.\nVitamin D 22 ng/mL\nFerritin 18 ng/mL\nTSH 3.8 mIU/L\nHbA1c 5.9 %\nLDL 145 mg/dL"}
        style={{
          width: "100%", boxSizing: "border-box", padding: "14px 16px", border: `1.5px solid ${TH.edge}`,
          borderRadius: 14, fontSize: 15, lineHeight: 1.6, fontFamily: FONTS.body, color: TH.ink, background: TH.bg, outline: "none", resize: "vertical",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 4px ${TH.accentGlow}`; }}
        onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
        <button onClick={onCancel} style={{ padding: "12px 18px", borderRadius: 999, fontSize: 14, fontWeight: 500, background: "transparent", border: `1px solid ${TH.edge}`, color: TH.inkSoft, cursor: "pointer" }}>
          Back to upload
        </button>
        <button onClick={onSubmit} disabled={value.trim().length < 4} style={{
          padding: "12px 24px", borderRadius: 999, border: "none", background: value.trim().length < 4 ? TH.muted : TH.ink, color: "#fff",
          ...D, fontWeight: 600, fontSize: 14.5, cursor: value.trim().length < 4 ? "not-allowed" : "pointer", opacity: value.trim().length < 4 ? 0.5 : 1,
        }}>
          Analyze →
        </button>
      </div>
    </div>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { ic: "📄", t: "Upload", d: "PDF or photo of your blood panel. We read it once and never store it." },
    { ic: "🔬", t: "We extract", d: "Each biomarker is pulled out and compared to healthy ranges." },
    { ic: "🌿", t: "You get a plan", d: "Clear flags, targeted supplements, and what to discuss with your doctor." },
  ];
  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 16, textAlign: "center", textTransform: "uppercase" }}>How it works</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {steps.map(s => (
          <div key={s.t} style={{ padding: "20px 20px", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }} aria-hidden>{s.ic}</div>
            <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontSize: 13.5, color: TH.muted, lineHeight: 1.55 }}>{s.d}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.6, marginTop: 22, textAlign: "center", maxWidth: 600, marginInline: "auto" }}>
        Supported markers include vitamin D, ferritin, B12, magnesium, TSH, fasting glucose, HbA1c, a full lipid panel, hs-CRP, homocysteine, testosterone, and more.
      </p>

      {/* Transparency note */}
      <div style={{
        maxWidth: 600, marginInline: "auto", marginTop: 16, background: TH.surface,
        border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 18px",
      }}>
        <div style={{ ...MM, fontSize: 10, color: TH.sageDeep, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>How we read your labs</div>
        <p style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.6, margin: 0 }}>
          We extract only the values printed on your report and compare them to your lab&apos;s own reference ranges where shown. Every supplement we suggest links to the evidence behind it. We don&apos;t diagnose, and we&apos;ll always tell you when something is worth a conversation with your doctor.
        </p>
      </div>
    </section>
  );
}

// ─── Analysis report ──────────────────────────────────────────────────────────
function AnalysisReport({ data, sourceKind, signedIn, onReset, isSample = false }: { data: BloodworkAnalysis; sourceKind: "pdf" | "image" | "text"; signedIn: boolean; onReset: () => void; isSample?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const flagged = data.biomarkers.filter(b => ["low", "high"].includes(b.status));
  const watch = data.biomarkers.filter(b => ["borderline-low", "borderline-high"].includes(b.status));
  const ok = data.biomarkers.filter(b => ["optimal", "normal"].includes(b.status));
  const ordered = [...flagged, ...watch, ...ok, ...data.biomarkers.filter(b => b.status === "unknown")];

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/bloodwork/save", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ biomarkers: data.biomarkers, analysis: { summary: data.summary, findings: data.findings, recommendations: data.recommendations, lifestyle: data.lifestyle, seeClinicianFor: data.seeClinicianFor }, confidence: data.confidence, sourceKind }),
      });
      const body = await res.json();
      if (body.ok) { setSaved(true); track("bloodwork_save", { markers: data.biomarkers.length }); }
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
      {isSample && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14,
          background: TH.accentGlow, border: `1px solid ${TH.sage}40`,
        }}>
          <span style={{ ...MM, fontSize: 10, fontWeight: 600, color: "#fff", background: TH.sageDeep, padding: "3px 9px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}>Example</span>
          <span style={{ fontSize: 13, color: TH.inkSoft, lineHeight: 1.45 }}>
            This is a sample analysis to show how it works. <strong style={{ color: TH.ink }}>Upload your own labs</strong> for a real reading.
          </span>
        </div>
      )}
      {/* Summary header */}
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22, padding: "26px 28px", boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase" }}>Your analysis</div>
          <span style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {data.poweredBy === "claude" ? "Read by Claude" : "Rule-based"} · {data.confidence} confidence
          </span>
        </div>
        <p style={{ fontSize: 17, color: TH.ink, lineHeight: 1.55, margin: "12px 0 18px" }}>{data.summary}</p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Tally n={flagged.length} label="Need attention" hue="#b91c1c" />
          <Tally n={watch.length} label="Worth watching" hue="#b5751e" />
          <Tally n={ok.length} label="In range" hue={TH.sageDeep} />
        </div>
      </div>

      {/* Biomarker grid */}
      {ordered.length > 0 && (
        <div>
          <h2 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Your biomarkers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {ordered.map((b, i) => <BiomarkerCard key={i} b={b} />)}
          </div>
        </div>
      )}

      {/* Findings */}
      {data.findings.length > 0 && (
        <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px" }}>
          <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.015em" }}>What it means</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {data.findings.map((f, i) => {
              const hue = f.severity === "flag" ? "#b91c1c" : f.severity === "watch" ? "#b5751e" : TH.muted;
              return (
                <li key={i} style={{ padding: "12px 14px", background: TH.bg, borderRadius: 12, borderLeft: `3px solid ${hue}` }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: TH.ink, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.55 }}>{f.detail}</div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${TH.bg} 0%, ${TH.surface} 100%)`, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>Targeted suggestions</div>
          <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Supplements matched to your results</h2>
          <p style={{ fontSize: 13, color: TH.muted, margin: "0 0 16px" }}>Educational suggestions, not prescriptions. Confirm with your clinician before starting anything new.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.recommendations.map((r, i) => {
              const supp = r.supplementId ? SUPPLEMENT_DB.find(s => s.id === r.supplementId) : undefined;
              const caution = (supp?.warnings?.length ?? 0) > 0;
              return (
                <ConfidenceCard
                  key={i}
                  name={r.name}
                  supplementId={r.supplementId}
                  evidence={supp?.evidence as EvidenceTier | undefined}
                  reason={r.reason}
                  basis={r.biomarker ? [r.biomarker] : undefined}
                  interaction={{ level: caution ? "caution" : "low", note: caution ? "Check with your clinician" : undefined }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Lifestyle */}
      {data.lifestyle.length > 0 && (
        <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "20px 22px" }}>
          <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.015em" }}>Beyond supplements</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: TH.inkSoft, fontSize: 14, lineHeight: 1.7 }}>
            {data.lifestyle.map((l, i) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
          </ul>
        </div>
      )}

      {/* See clinician */}
      {data.seeClinicianFor.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #f5d3a8", borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }} aria-hidden>⚕️</span>
            <h2 style={{ ...D, fontSize: 18, color: "#92400e", margin: 0, letterSpacing: "-0.015em" }}>Talk to your doctor about</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#7c4a12", fontSize: 14, lineHeight: 1.7 }}>
            {data.seeClinicianFor.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {isSample ? (
          <button onClick={onReset} style={{ padding: "13px 24px", borderRadius: 999, border: "none", background: TH.sage, color: "#fff", ...D, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 8px 22px -6px ${TH.sage}80` }}>
            Analyze my own labs →
          </button>
        ) : signedIn ? (
          <button onClick={save} disabled={saving || saved} style={{
            padding: "13px 22px", borderRadius: 999, border: "none", background: saved ? TH.sage : TH.ink, color: "#fff",
            ...D, fontWeight: 600, fontSize: 14, cursor: saved ? "default" : saving ? "wait" : "pointer",
          }}>
            {saved ? "✓ Saved to your profile" : saving ? "Saving…" : "Save to my profile"}
          </button>
        ) : (
          <Link href="/signin?redirect=/bloodwork" style={{ padding: "13px 22px", borderRadius: 999, background: TH.ink, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14 }}>
            Sign in to save this
          </Link>
        )}
        {!isSample && (
          <button onClick={onReset} style={{ padding: "13px 22px", borderRadius: 999, background: TH.bg, border: `1px solid ${TH.edge}`, color: TH.ink, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Analyze another report
          </button>
        )}
        <Link href="/track" style={{ padding: "13px 22px", borderRadius: 999, background: "transparent", border: `1px solid ${TH.edge}`, color: TH.inkSoft, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
          Track progress over time →
        </Link>
      </div>

      <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center", marginTop: 4 }}>
        This analysis is for education only and is not medical advice, diagnosis, or treatment. Reference ranges differ by laboratory, age, sex, and medication. Always consult a qualified clinician before acting on these results or changing your supplements, especially if you are pregnant, nursing, have a medical condition, or take prescription medication.
      </p>
    </div>
  );
}

function Tally({ n, label, hue }: { n: number; label: string; hue: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ ...D, fontSize: 28, color: hue, lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: 13, color: TH.muted, maxWidth: 90, lineHeight: 1.25 }}>{label}</span>
    </div>
  );
}

function BiomarkerCard({ b }: { b: ExtractedBiomarker }) {
  const meta = STATUS_META[b.status as BiomarkerStatus] ?? STATUS_META.unknown;
  const bar = rangeBarModel(b.key, b.value);
  return (
    <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px", borderTop: `3px solid ${meta.hue}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: TH.ink, lineHeight: 1.3 }}>{b.name}</span>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: meta.hue, background: meta.bg, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{meta.label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span style={{ ...D, fontSize: 24, color: TH.ink, letterSpacing: "-0.01em" }}>{b.value ?? "-"}</span>
        {b.unit && <span style={{ fontSize: 12, color: TH.muted }}>{b.unit}</span>}
      </div>
      {b.refRange && <div style={{ ...MM, fontSize: 10.5, color: TH.mutedDim, marginTop: 2 }}>ref: {b.refRange}</div>}

      {/* Healthy-range bar, Function/Levels style */}
      {bar && (
        <div style={{ marginTop: 12 }}>
          <div style={{ position: "relative", height: 7, borderRadius: 999, overflow: "hidden", background: TH.edge }}>
            {bar.zones.map((z, i) => (
              <span key={i} style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${z.from}%`, width: `${z.to - z.from}%`, background: z.color,
              }} />
            ))}
          </div>
          {/* marker */}
          <div style={{ position: "relative", height: 0 }}>
            <span style={{
              position: "absolute", top: -11, left: `${bar.markerPct}%`, transform: "translateX(-50%)",
              width: 12, height: 12, borderRadius: 999, background: "#fff",
              border: `2.5px solid ${meta.hue}`, boxShadow: "0 1px 3px rgba(10,37,64,0.25)",
            }} aria-hidden />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, ...MM, fontSize: 9, color: TH.mutedDim, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            <span>Low</span><span>Optimal</span><span>High</span>
          </div>
        </div>
      )}

      {b.note && <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.5, marginTop: 10 }}>{b.note}</div>}
    </div>
  );
}
