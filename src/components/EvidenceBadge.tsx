import { TH, FONTS } from "@/lib/theme";

export type EvidenceTier = "very strong" | "strong" | "moderate";

const MM = { fontFamily: FONTS.mono } as const;

const TIER: Record<EvidenceTier, { filled: number; label: string; hue: string }> = {
  "very strong": { filled: 3, label: "Very strong", hue: TH.sageDeep },
  "strong":      { filled: 2, label: "Strong", hue: TH.sageDeep },
  "moderate":    { filled: 1, label: "Moderate", hue: TH.amberDeep },
};

/**
 * Consistent evidence-grade badge used wherever an ingredient appears.
 * Three pips (filled by tier) + an optional label. Honest, discrete signal
 * not a fabricated score.
 */
export default function EvidenceBadge({
  tier,
  showLabel = true,
  size = "md",
}: {
  tier: EvidenceTier;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const meta = TIER[tier] ?? TIER.moderate;
  const pipW = size === "sm" ? 5 : 6;
  const pipH = size === "sm" ? 9 : 11;
  const gap = 2;

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}
      title={`${meta.label} evidence`}
      aria-label={`${meta.label} evidence`}
    >
      <span style={{ display: "inline-flex", alignItems: "flex-end", gap }} aria-hidden>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: pipW, height: pipH - (2 - i) * 0, borderRadius: 2,
            background: i < meta.filled ? meta.hue : TH.edgeStrong,
          }} />
        ))}
      </span>
      {showLabel && (
        <span style={{
          ...MM, fontSize: size === "sm" ? 9.5 : 10.5, fontWeight: 500,
          letterSpacing: "0.06em", textTransform: "uppercase", color: meta.hue,
        }}>{meta.label}</span>
      )}
    </span>
  );
}
