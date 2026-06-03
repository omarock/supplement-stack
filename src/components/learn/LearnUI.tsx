/**
 * Learn-section shared UI kit.
 *
 * One visual language for every Learn page (ingredient, research, best,
 * biomarker, library). All presentational + server-rendered (no client JS, so
 * zero hydration cost and fully SEO-visible). Everything is built on the TH
 * design tokens so a change here updates every Learn page at once.
 *
 * Components only ever render data the caller passes in. They never fabricate
 * facts, which keeps the YMYL safety rule intact.
 */
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const S = { fontFamily: FONTS.serifItalic, fontWeight: 400 } as const;
const MM = { fontFamily: FONTS.mono } as const;

// ─── Section wrapper: consistent width + heading rhythm across Learn ─────────
export function LearnSection({ title, sub, children, maxWidth = 960 }: {
  title?: string; sub?: string; children: React.ReactNode; maxWidth?: number;
}) {
  return (
    <section style={{ padding: "0 var(--section-pad-x) 48px" }}>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {title && <h2 style={{ ...S, fontSize: 32, margin: "0 0 6px", letterSpacing: "-0.02em", color: TH.ink }}>{title}</h2>}
        {sub && <p style={{ color: TH.inkSoft, fontSize: 15.5, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 640 }}>{sub}</p>}
        {!sub && title && <div style={{ height: 14 }} />}
        {children}
      </div>
    </section>
  );
}

// ─── EvidenceMeter: visual evidence grade (segments) ────────────────────────
const EVIDENCE_FILL: Record<string, { filled: number; label: string; color: string }> = {
  "very strong": { filled: 4, label: "Very strong", color: TH.sageDeep },
  strong: { filled: 3, label: "Strong", color: TH.sage },
  moderate: { filled: 2, label: "Moderate", color: TH.amberDeep },
  emerging: { filled: 1, label: "Emerging", color: TH.amber },
};
export function EvidenceMeter({ tier, compact = false }: { tier: string; compact?: boolean }) {
  const e = EVIDENCE_FILL[tier] ?? EVIDENCE_FILL.moderate;
  const total = 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 4 }} aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: compact ? 20 : 30, height: compact ? 7 : 9, borderRadius: 4,
            background: i < e.filled ? e.color : "rgba(10,37,64,0.10)",
          }} />
        ))}
      </div>
      <span style={{ ...MM, fontSize: compact ? 11 : 12.5, color: e.color, letterSpacing: "0.03em", fontWeight: 600 }}>
        {e.label} evidence
      </span>
    </div>
  );
}

// ─── Callout: insight / evidence / warning / tip ────────────────────────────
const CALLOUT_STYLE: Record<string, { bg: string; bar: string; ink: string; label: string }> = {
  insight: { bg: "rgba(91,163,115,0.10)", bar: TH.sage, ink: TH.sageDeep, label: "INSIGHT" },
  evidence: { bg: "#eef4ff", bar: "#4338ca", ink: "#4338ca", label: "EVIDENCE" },
  warning: { bg: "#fef2f2", bar: "#b91c1c", ink: "#b91c1c", label: "SAFETY" },
  tip: { bg: "#fffbeb", bar: TH.amberDeep, ink: TH.amberDeep, label: "TIP" },
};
export function Callout({ kind = "insight", label, children }: { kind?: keyof typeof CALLOUT_STYLE | string; label?: string; children: React.ReactNode }) {
  const c = CALLOUT_STYLE[kind] ?? CALLOUT_STYLE.insight;
  return (
    <div style={{ background: c.bg, borderLeft: `3px solid ${c.bar}`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ ...MM, fontSize: 10.5, color: c.ink, letterSpacing: "0.1em", marginBottom: 7 }}>{label ?? c.label}</div>
      <div style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: TH.ink }}>{children}</div>
    </div>
  );
}

// ─── BenefitCards: "what it supports", visual grid ──────────────────────────
export function BenefitCards({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
      {items.map((b, i) => (
        <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: TH.sage, flexShrink: 0 }} />
          <span style={{ ...D, fontSize: 15, color: TH.ink, lineHeight: 1.25 }}>{b}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ProfileCards: "who should consider it" ─────────────────────────────────
export function ProfileCards({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
      {items.map((p, i) => (
        <div key={i} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, background: "rgba(91,163,115,0.14)", color: TH.sageDeep, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
          </span>
          <span style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.35 }}>{p}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SynergyCard: "pairs well with X" (from real interaction data) ──────────
export function SynergyCard({ name, summary, verdict, evidence, href }: {
  name: string; summary: string; verdict: string; evidence: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 18px", height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ ...D, fontSize: 16, color: TH.ink }}>with {name}</span>
          <span style={{ ...MM, fontSize: 10, color: TH.sageDeep, background: "rgba(91,163,115,0.12)", padding: "3px 9px", borderRadius: 999, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{verdict}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.5 }}>{summary}</p>
        <div style={{ ...MM, fontSize: 11, color: TH.muted, marginTop: "auto", paddingTop: 4 }}>{evidence} evidence · see details →</div>
      </div>
    </Link>
  );
}

// ─── ContextualCTA: action matched to the page content ──────────────────────
export function ContextualCTA({ eyebrow, title, sub, href, cta, tone = "sage" }: {
  eyebrow: string; title: string; sub: string; href: string; cta: string; tone?: "sage" | "ink" | "amber";
}) {
  const bg = tone === "ink"
    ? `linear-gradient(135deg, ${TH.ink} 0%, #0e3a63 100%)`
    : tone === "amber"
      ? `linear-gradient(135deg, ${TH.sage} 0%, ${TH.amber} 100%)`
      : `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`;
  const btnInk = tone === "amber" ? TH.ink : tone === "ink" ? TH.ink : TH.sageDeep;
  return (
    <div style={{ background: bg, borderRadius: 20, padding: "26px 28px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
      <div style={{ minWidth: 240, flex: 1 }}>
        <div style={{ ...MM, fontSize: 10.5, opacity: 0.82, letterSpacing: "0.1em", marginBottom: 8 }}>{eyebrow.toUpperCase()}</div>
        <div style={{ ...D, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: "#fff", color: btnInk, textDecoration: "none", ...D, fontSize: 14, whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(0,0,0,0.16)" }}>{cta}</Link>
    </div>
  );
}
