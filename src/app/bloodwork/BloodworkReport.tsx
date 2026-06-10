"use client";

// The bloodwork analysis report. Split into its own module (loaded via
// next/dynamic from BloodworkClient) because it pulls in SUPPLEMENT_DB — the
// full ~200-ingredient catalog — plus the ConfidenceCard tree. The report only
// renders AFTER an upload completes, so keeping it out of the initial
// /bloodwork bundle keeps the upload screen (all the user sees on arrival)
// light. Logic is unchanged from the previous inline version.

import { useState } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import UpgradeCTA from "@/components/UpgradeCTA";
import { STATUS_META, rangeBarModel, type BloodworkAnalysis, type ExtractedBiomarker, type BiomarkerStatus } from "@/lib/biomarkers";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import ConfidenceCard from "@/components/ConfidenceCard";
import type { EvidenceTier } from "@/components/EvidenceBadge";
import { track } from "@/lib/analytics";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

// ─── Analysis report ──────────────────────────────────────────────────────────
export default function AnalysisReport({ data, sourceKind, signedIn, isPremium = false, onReset, isSample = false }: { data: BloodworkAnalysis; sourceKind: "pdf" | "image" | "text"; signedIn: boolean; isPremium?: boolean; onReset: () => void; isSample?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const flagged = data.biomarkers.filter(b => ["low", "high"].includes(b.status));
  const watch = data.biomarkers.filter(b => ["borderline-low", "borderline-high"].includes(b.status));
  const ok = data.biomarkers.filter(b => ["optimal", "normal"].includes(b.status));
  const ordered = [...flagged, ...watch, ...ok, ...data.biomarkers.filter(b => b.status === "unknown")];

  const save = async () => {
    setSaving(true); setSaveErr(null);
    try {
      const res = await fetch("/api/bloodwork/save", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ biomarkers: data.biomarkers, analysis: { summary: data.summary, findings: data.findings, recommendations: data.recommendations, lifestyle: data.lifestyle, seeClinicianFor: data.seeClinicianFor }, confidence: data.confidence, sourceKind }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.ok) {
        setSaved(true); track("bloodwork_save", { markers: data.biomarkers.length });
      } else if (res.status === 401) {
        setSaveErr("Your session expired. Please sign in again to save this report.");
      } else {
        setSaveErr("Could not save right now. Please try again in a moment.");
      }
    } catch {
      setSaveErr("Network error while saving. Check your connection and try again.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
      {isSample && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14,
          background: TH.accentGlow, border: `1px solid color-mix(in srgb, ${TH.sage} 25%, transparent)`,
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
            <h2 style={{ ...D, fontSize: 18, color: "var(--c-amber-deep)", margin: 0, letterSpacing: "-0.015em" }}>Talk to your doctor about</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--c-amber-deep)", fontSize: 14, lineHeight: 1.7 }}>
            {data.seeClinicianFor.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {isSample ? (
          <button onClick={onReset} style={{ padding: "13px 24px", borderRadius: 999, border: "none", background: TH.sage, color: "#fff", ...D, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: `0 8px 22px -6px color-mix(in srgb, ${TH.sage} 50%, transparent)` }}>
            Analyze my own labs →
          </button>
        ) : signedIn ? (
          <button onClick={save} disabled={saving || saved} style={{
            padding: "13px 22px", borderRadius: 999, border: "none", background: saved ? TH.sage : TH.inkBg, color: "#fff",
            ...D, fontWeight: 600, fontSize: 14, cursor: saved ? "default" : saving ? "wait" : "pointer",
          }}>
            {saved ? "✓ Saved to your profile" : saving ? "Saving…" : "Save to my profile"}
          </button>
        ) : (
          <Link href="/signin?redirect=/bloodwork" style={{ padding: "13px 22px", borderRadius: 999, background: TH.inkBg, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14 }}>
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

      {!isSample && !isPremium && (
        <UpgradeCTA
          variant="card"
          title="Keep this lab, and see what changes next time"
          body="Your analysis is read once and not stored unless you're Premium. Premium saves every lab to your private history and shows exactly what moved between tests."
          perks={[
            "Unlimited bloodwork analyses, all saved",
            "Side-by-side re-test comparison (ferritin 18 → 47)",
            "A coach that remembers your results",
          ]}
          cta="Save my bloodwork history"
        />
      )}

      {saveErr && (
        <p role="alert" style={{ fontSize: 13, color: "var(--c-destructive)", textAlign: "center", margin: "2px 0 0" }}>{saveErr}</p>
      )}

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
