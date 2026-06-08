import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

/**
 * Reusable premium upgrade experience. Used at every free-tier limit so a wall
 * becomes an invitation: it explains the value, previews exactly what unlocks,
 * and routes to /pricing (where the live founding offer lives). Server component.
 *
 * variant:
 *  - "card"   full upgrade card (default), for inline placement at a limit.
 *  - "lock"   a frosted "locked feature" panel that sits over gated content.
 *  - "banner" slim one-line nudge.
 */
export default function UpgradeCTA({
  title,
  body,
  perks,
  variant = "card",
  cta = "Unlock Premium",
  context,
}: {
  title: string;
  body?: string;
  perks?: string[];
  variant?: "card" | "lock" | "banner";
  cta?: string;
  context?: string; // tiny personalized line, e.g. "You've logged 14 of 14 free days"
}) {
  if (variant === "banner") {
    return (
      <Link href="/pricing" style={{
        display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit",
        background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 18px",
      }}>
        <span aria-hidden style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
        }}><LockIcon /></span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", ...D, fontSize: 14.5, color: TH.ink }}>{title}</span>
          {body && <span style={{ display: "block", fontSize: 12.5, color: TH.muted, marginTop: 1 }}>{body}</span>}
        </span>
        <span style={{ color: TH.sageDeep, fontSize: 13, whiteSpace: "nowrap", ...D }}>{cta} →</span>
      </Link>
    );
  }

  const dark = variant === "card";
  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 18,
      background: dark ? `linear-gradient(165deg, #0d2c4d 0%, #071a30 100%)` : TH.surface,
      color: dark ? "#fff" : TH.ink,
      border: dark ? "none" : `1px dashed ${TH.edgeStrong}`,
      padding: "clamp(20px, 3vw, 28px)",
      boxShadow: dark ? "0 24px 56px -28px rgba(10,37,64,0.6)" : "none",
      textAlign: variant === "lock" ? "center" : "left",
    }}>
      {dark && <div aria-hidden style={{ position: "absolute", top: -90, right: -70, width: 280, height: 280, borderRadius: 999, background: `radial-gradient(circle, color-mix(in srgb, ${TH.sage} 20%, transparent) 0%, color-mix(in srgb, ${TH.sage} 0%, transparent) 70%)`, pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1, maxWidth: variant === "lock" ? 460 : "none", margin: variant === "lock" ? "0 auto" : undefined }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, ...MM, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: dark ? TH.amber : TH.sageDeep, marginBottom: 12 }}>
          <LockIcon /> Premium
        </div>
        <h3 style={{ ...D, fontSize: "clamp(18px, 2.6vw, 22px)", lineHeight: 1.2, letterSpacing: "-0.01em", margin: "0 0 8px" }}>{title}</h3>
        {body && <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px", opacity: dark ? 0.86 : 1, color: dark ? "#fff" : TH.inkSoft }}>{body}</p>}
        {perks && perks.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 8, textAlign: "left", maxWidth: 420, marginLeft: variant === "lock" ? "auto" : 0, marginRight: variant === "lock" ? "auto" : 0 }}>
            {perks.map((p, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, lineHeight: 1.4, opacity: dark ? 0.92 : 1, color: dark ? "#fff" : TH.inkSoft }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="3.2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M5 12l5 5 9-11" /></svg>
                {p}
              </li>
            ))}
          </ul>
        )}
        <Link href="/pricing" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999, textDecoration: "none",
          background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", ...D, fontWeight: 600, fontSize: 14.5,
          boxShadow: `0 10px 24px -8px ${TH.sage}`,
        }}>{cta} →</Link>
        <div style={{ ...MM, fontSize: 10, marginTop: 12, opacity: dark ? 0.6 : 0.8, color: dark ? "#fff" : TH.muted, letterSpacing: "0.03em" }}>
          {context ? `${context} · ` : ""}Founding offer: lifetime access, one-time $79 · 14-day money-back
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
