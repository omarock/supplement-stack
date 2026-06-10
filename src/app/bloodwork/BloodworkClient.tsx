"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TH, FONTS } from "@/lib/theme";
import ThinkingMessages from "@/components/ThinkingMessages";
import { type BloodworkAnalysis } from "@/lib/biomarkers";
import EmailCapture from "@/components/EmailCapture";
import { track } from "@/lib/analytics";

// The analysis report is heavy — it pulls in the full SUPPLEMENT_DB catalog and
// the ConfidenceCard tree — and only renders once an upload has been analyzed.
// So it's code-split into its own chunk (BloodworkReport); the upload screen,
// all the user sees on arrival, stays light. We warm the chunk the moment
// analysis starts (see `analyze`/`showSample`) so the report is ready by the
// time results land, with no loading flash in the common path.
const AnalysisReport = dynamic(() => import("./BloodworkReport"), {
  ssr: false,
  loading: () => <ReportSkeleton />,
});

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const PHRASES = [
  "Reading your report…",
  "Extracting biomarkers…",
  "Checking reference ranges…",
  "Cross-referencing 200+ ingredients…",
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

export default function BloodworkClient({ signedIn, isPremium = false }: { signedIn: boolean; isPremium?: boolean }) {
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
    void import("./BloodworkReport"); // warm the report chunk
    setIsSample(true); setSourceKind("text"); setResult(SAMPLE_ANALYSIS); setStage("done");
    setTimeout(() => document.getElementById("bw-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, []);

  const analyze = useCallback(async (payload: Record<string, unknown>) => {
    void import("./BloodworkReport"); // warm the report chunk while the API runs
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
    // PDFs are sent as-is (only images are downscaled), so enforce the real 3.5 MB
    // limit up front with a PDF-specific message that matches the on-screen chip.
    if (file.type === "application/pdf" && file.size > MAX_BYTES) {
      setError("This PDF is over 3.5 MB. Export or print just the results page, or paste the values as text.");
      setStage("error"); return;
    }
    if (file.size > 12 * 1024 * 1024) { setError("That file is very large. Upload a photo of just the results page, or paste the values."); setStage("error"); return; }
    setStage("reading"); setFileName(file.name);
    try {
      const prep = await prepareFile(file);
      const approxBytes = Math.floor((prep.base64.length * 3) / 4);
      if (approxBytes > MAX_BYTES) {
        setError(prep.kind === "pdf"
          ? "This PDF is too large (max ~3.5 MB). Export just the results page, or paste the values as text."
          : "Still too large after compression (max ~3.5 MB). Try a tighter photo, or paste the values as text.");
        setStage("error"); return;
      }
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
                  <div role="alert" style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "color-mix(in srgb, var(--c-destructive) 12%, transparent)", color: "var(--c-destructive)", fontSize: 14 }}>
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
            <AnalysisReport data={result} sourceKind={sourceKind} signedIn={signedIn} isPremium={isPremium} onReset={reset} isSample={isSample} />
            <div style={{ maxWidth: 760, margin: "24px auto 0" }}>
              <EmailCapture source="bloodwork" headline="Get evidence-led updates" sub="Occasional, evidence-led emails on supplements and biomarkers. We never email your lab data. Unsubscribe anytime." />
            </div>
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
          padding: "12px 24px", borderRadius: 999, border: "none", background: value.trim().length < 4 ? TH.muted : TH.inkBg, color: "#fff",
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

// ─── Report loading skeleton ──────────────────────────────────────────────────
// Shown by the dynamic() loader if the report chunk hasn't finished fetching by
// the time results are ready (rare, since we warm it when analysis starts).
function ReportSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 20px", color: TH.muted }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, border: `3px solid ${TH.edge}`, borderTopColor: TH.sage, animation: "sd-spin .9s linear infinite" }} aria-hidden />
      <div style={{ ...MM, fontSize: 12.5, letterSpacing: "0.04em" }}>Preparing your report…</div>
    </div>
  );
}
