"use client";

import { useState } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export interface CheckerOption { id: string; name: string }
export interface CheckerResult { kind: "synergy" | "timing" | "caution" | "redundant"; summary: string; advice: string; slug: string }

const KIND_UI: Record<CheckerResult["kind"], { label: string; verdict: string; hue: string; bg: string }> = {
  synergy:   { label: "Works better together", verdict: "Take together",       hue: "#3f7a52", bg: "#f0f9f3" },
  timing:    { label: "Separate the timing",   verdict: "Space them apart",     hue: "#b5751e", bg: "#fffbeb" },
  caution:   { label: "Use with caution",      verdict: "Check with a clinician", hue: "#b91c1c", bg: "#fef2f2" },
  redundant: { label: "Redundant together",    verdict: "Pick one",             hue: "#6b4fc7", bg: "#f4f1ff" },
};

function pairSlug(a: string, b: string): string {
  return [a, b].sort().join("-and-");
}

/**
 * Interactive two-supplement interaction checker. `data` is keyed by the
 * order-independent pair slug. Embeddable (see /embed/interaction-checker).
 */
export default function InteractionChecker({
  options, data, compact = false,
}: {
  options: CheckerOption[];
  data: Record<string, CheckerResult>;
  compact?: boolean;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const nameOf = (id: string) => options.find(o => o.id === id)?.name ?? id;
  const slug = a && b && a !== b ? pairSlug(a, b) : "";
  const result = slug ? data[slug] : undefined;
  const bothChosen = Boolean(a && b && a !== b);
  const sameChosen = Boolean(a && b && a === b);

  const selectStyle: React.CSSProperties = {
    width: "100%", appearance: "none", WebkitAppearance: "none",
    padding: "13px 14px", borderRadius: 12, border: `1px solid ${TH.edgeStrong}`,
    background: TH.surface, color: TH.ink, fontSize: 16, fontFamily: '"Inter", system-ui, sans-serif',
    cursor: "pointer", lineHeight: 1.2,
  };

  return (
    <div style={{
      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18,
      padding: compact ? "20px 18px" : "24px 24px", boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.06)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
        <Field label="First supplement">
          <select aria-label="First supplement" value={a} onChange={e => setA(e.target.value)} style={selectStyle}>
            <option value="">Choose…</option>
            {options.map(o => <option key={o.id} value={o.id} disabled={o.id === b}>{o.name}</option>)}
          </select>
        </Field>
        <span style={{ ...D, fontSize: 22, color: TH.mutedDim, paddingTop: 18 }}>+</span>
        <Field label="Second supplement">
          <select aria-label="Second supplement" value={b} onChange={e => setB(e.target.value)} style={selectStyle}>
            <option value="">Choose…</option>
            {options.map(o => <option key={o.id} value={o.id} disabled={o.id === a}>{o.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Result */}
      <div style={{ marginTop: 18 }}>
        {!bothChosen && !sameChosen && (
          <p style={{ fontSize: 14, color: TH.muted, margin: 0, textAlign: "center" }}>
            Pick two supplements to see how they interact.
          </p>
        )}
        {sameChosen && (
          <p style={{ fontSize: 14, color: TH.muted, margin: 0, textAlign: "center" }}>
            Choose two different supplements.
          </p>
        )}
        {bothChosen && result && (
          <div style={{ background: KIND_UI[result.kind].bg, border: `1px solid ${KIND_UI[result.kind].hue}33`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: KIND_UI[result.kind].hue }} />
              <span style={{ ...D, fontSize: 14, color: KIND_UI[result.kind].hue }}>{KIND_UI[result.kind].verdict}</span>
              <span style={{ ...MM, fontSize: 10, color: TH.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>· {KIND_UI[result.kind].label}</span>
            </div>
            <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.5, margin: "0 0 6px", fontWeight: 500 }}>{result.summary}</p>
            <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>{result.advice}</p>
            <Link href={`/interactions/${result.slug}`} style={{ fontSize: 13, color: KIND_UI[result.kind].hue, fontWeight: 600, textDecoration: "none" }}>
              Read the full {nameOf(a)} &amp; {nameOf(b)} guide →
            </Link>
          </div>
        )}
        {bothChosen && !result && (
          <div style={{ background: TH.bg, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.5, margin: "0 0 6px", fontWeight: 500 }}>
              No specific interaction logged for {nameOf(a)} and {nameOf(b)}.
            </p>
            <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>
              That usually means no notable interaction at typical doses, but timing and your other supplements still matter. Run a full check on your whole stack.
            </p>
            <Link href="/audit" style={{ fontSize: 13, color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>
              Check your whole stack →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ ...MM, fontSize: 9.5, color: TH.mutedDim, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}
