import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import { REVIEWERS, hasReviewers } from "@/lib/reviewers";

const MM = { fontFamily: FONTS.mono } as const;

function fmt(date?: string) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Trust byline shown under the H1 of content pages. Honest until real reviewers
 * are added to reviewers.ts, then upgrades to named medical review automatically.
 */
export default function ReviewedBy({ updated }: { updated?: string }) {
  const names = hasReviewers
    ? REVIEWERS.slice(0, 2).map(r => `${r.name}, ${r.credential}`).join(" · ")
    : null;

  return (
    <div className="sd-reviewed" style={{
      display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      padding: "8px 14px", borderRadius: 999, background: TH.surface,
      border: `1px solid ${TH.edge}`, marginBottom: 20,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 999, background: TH.accentGlow, flexShrink: 0 }} aria-hidden>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5 11.5 4" stroke={TH.sageDeep} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span style={{ fontSize: 12.5, color: TH.inkSoft }}>
        {names
          ? <>Medically reviewed by <strong style={{ color: TH.ink }}>{names}</strong></>
          : <>Written to our <Link href="/editorial" style={{ color: TH.sageDeep, textDecoration: "none", fontWeight: 600 }}>editorial standards</Link> · reviewed against published research</>}
      </span>
      <span style={{ ...MM, fontSize: 10.5, color: TH.muted }}>· Updated {fmt(updated)}</span>
    </div>
  );
}
