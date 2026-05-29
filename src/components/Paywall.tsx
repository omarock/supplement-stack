import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

/**
 * Lock card shown in place of a premium-only feature. Calm and honest —
 * states the value, not a hard sell. Routes to /pricing.
 */
export default function Paywall({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets?: string[];
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
      border: `1px solid ${TH.edge}`, borderRadius: 20, padding: "28px 26px", textAlign: "center",
      boxShadow: "0 1px 3px rgba(10,37,64,0.04)",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, borderRadius: 999, background: TH.accentGlow, marginBottom: 14,
      }} aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TH.sageDeep} strokeWidth="2">
          <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <div style={{ ...MM, fontSize: 10.5, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
        Premium
      </div>
      <h3 style={{ ...D, fontSize: 22, color: TH.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{title}</h3>
      <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.5, margin: "0 auto 16px", maxWidth: 440 }}>{desc}</p>
      {bullets && bullets.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 18px", display: "inline-flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: TH.inkSoft }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="3"><path d="M5 12l5 5 9-11" /></svg>
              {b}
            </li>
          ))}
        </ul>
      )}
      <div>
        <Link href="/pricing" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999,
          background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none",
          ...D, fontWeight: 600, fontSize: 14.5, boxShadow: `0 8px 20px -6px ${TH.sage}80`,
        }}>
          Upgrade — $9/mo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
