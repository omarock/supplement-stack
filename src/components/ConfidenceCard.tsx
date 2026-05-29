import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import EvidenceBadge, { type EvidenceTier } from "@/components/EvidenceBadge";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export interface ConfidenceCardProps {
  name: string;
  supplementId?: string;          // links to /ingredients/[id]
  evidence?: EvidenceTier;        // honest tier from the catalog
  reason: string;                 // the "why" — plain English
  basis?: string[];               // what it's matched to (your goal, a biomarker, a symptom)
  /** Discrete, honest interaction signal — never a fabricated number. */
  interaction?: { level: "low" | "caution"; note?: string };
  tag?: string;                   // e.g. the biomarker that triggered it
}

/**
 * A trust-forward recommendation card: evidence grade + why-it-matches-you +
 * interaction signal, all from real inputs. The visual embodiment of the
 * Confidence Layer. No fake match/confidence percentages — discrete labels only.
 */
export default function ConfidenceCard({
  name, supplementId, evidence, reason, basis, interaction, tag,
}: ConfidenceCardProps) {
  const inner = (
    <>
      {/* Header: name + evidence */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <span style={{ ...D, fontSize: 15.5, color: TH.ink, letterSpacing: "-0.01em" }}>{name}</span>
        {evidence && <EvidenceBadge tier={evidence} size="sm" />}
      </div>

      {/* Reason */}
      <p style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.5, margin: "8px 0 0" }}>{reason}</p>

      {/* Basis chips — what this matches in YOUR data */}
      {basis && basis.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <span style={{ ...MM, fontSize: 9.5, color: TH.mutedDim, letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "center" }}>
            Why you
          </span>
          {basis.map((b, i) => (
            <span key={i} style={{
              ...MM, fontSize: 10.5, color: TH.sageDeep, background: TH.accentGlow,
              padding: "3px 9px", borderRadius: 999,
            }}>{b}</span>
          ))}
        </div>
      )}

      {/* Footer: interaction + tag + link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12,
        borderTop: `1px solid ${TH.edge}`, flexWrap: "wrap",
      }}>
        {interaction && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            ...MM, fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
            color: interaction.level === "caution" ? "#92400e" : TH.sageDeep,
            background: interaction.level === "caution" ? "#fffbeb" : TH.accentGlow,
            border: `1px solid ${interaction.level === "caution" ? "#f5d3a8" : TH.sage + "33"}`,
            padding: "3px 9px", borderRadius: 999,
          }}>
            <span aria-hidden>{interaction.level === "caution" ? "⚕" : "✓"}</span>
            {interaction.level === "caution" ? (interaction.note ?? "Check with your clinician") : "Low interaction risk"}
          </span>
        )}
        {tag && (
          <span style={{ ...MM, fontSize: 10, color: TH.muted, background: TH.bg, padding: "3px 9px", borderRadius: 999 }}>{tag}</span>
        )}
        {supplementId && (
          <span style={{ marginLeft: "auto", color: TH.sageDeep, fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            See the evidence
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m-3-3l3 3-3 3" stroke={TH.sageDeep} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        )}
      </div>
    </>
  );

  const cardStyle: React.CSSProperties = {
    display: "block", background: TH.surface, border: `1px solid ${TH.edge}`,
    borderRadius: 16, padding: "16px 18px", textDecoration: "none", color: "inherit",
    boxShadow: "0 1px 2px rgba(10,37,64,0.04)",
    transition: "border-color .15s, transform .15s, box-shadow .15s",
  };

  return supplementId ? (
    <Link
      href={`/ingredients/${supplementId}`}
      style={cardStyle}
      onMouseEnter={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px -8px rgba(10,37,64,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(10,37,64,0.04)"; }}
    >
      {inner}
    </Link>
  ) : (
    <div style={cardStyle}>{inner}</div>
  );
}
