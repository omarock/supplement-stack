import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export const metadata: Metadata = {
  title: "Changelog, What's New on suppdoc.io",
  description: "What's new on suppdoc.io: features shipped, ingredients added, content published, and improvements made. Reverse-chronological.",
  keywords: "suppdoc changelog, supplement platform updates, new features",
};

type EntryKind = "Feature" | "Improvement" | "Content" | "Fix" | "Launch";

interface Entry {
  date: string;       // ISO
  kind: EntryKind;
  title: string;
  body: string;
  link?: { label: string; href: string };
}

// Reverse-chronological, latest entries at the top of the array
const ENTRIES: Entry[] = [
  {
    date: "2026-05-29",
    kind: "Improvement",
    title: "Mobile-first homepage hero",
    body: "Rebuilt the homepage so all 3 service entry points (Quiz, Build, Audit) fit above the fold on mobile. The recommended action (Quiz) is now visually weighted to guide first-time decisions in under 3 seconds.",
  },
  {
    date: "2026-05-29",
    kind: "Feature",
    title: "Chat coach",
    body: "Added a floating supplement coach (bottom-right corner) powered by Claude Sonnet 4.6. Context-aware, it knows which page you're on, what's in your saved stack, and your quiz results. Cites real internal pages.",
    link: { label: "Try it", href: "/" },
  },
  {
    date: "2026-05-28",
    kind: "Feature",
    title: "Compare pages",
    body: "Published 8 honest head-to-head comparisons against my-stack.ai, Persona Nutrition, Ritual, HUM, Thorne, Examine.com, Hims & Hers, and Care/of. We credit competitors where they're stronger.",
    link: { label: "Browse", href: "/compare" },
  },
  {
    date: "2026-05-28",
    kind: "Feature",
    title: "Per-ingredient research pages",
    body: "Curated 4-6 published clinical studies per ingredient for the top 30 supplements, with sample size, dose, duration, plain-English finding, and PubMed link.",
    link: { label: "Example", href: "/ingredients/d3k2/research" },
  },
  {
    date: "2026-05-27",
    kind: "Feature",
    title: "Three-service architecture",
    body: "Reframed the product around three distinct intents: Quiz (don't know where to start), Build (know what I want), Audit (already taking supplements). Each is now a first-class entry point.",
  },
  {
    date: "2026-05-27",
    kind: "Feature",
    title: "Audit my stack",
    body: "Paste your current supplements, we score the stack 0-100 and flag interactions, redundancies, missing nutrients, timing issues, and cost waste. Free, instant, no signup.",
    link: { label: "Try it", href: "/audit" },
  },
  {
    date: "2026-05-27",
    kind: "Feature",
    title: "Express vs Complete quiz",
    body: "Split the quiz into Express (2 min, recommended) and Complete (5 min, deep personalization). Most users want Express; Complete is positioned as the advanced option.",
  },
  {
    date: "2026-05-27",
    kind: "Feature",
    title: "Plain-English stack builder",
    body: "On the build page, you can now describe your goals in plain English ('I want better sleep and more energy') and Claude composes a stack instantly from our 200+ ingredient catalog.",
    link: { label: "Try it", href: "/build" },
  },
  {
    date: "2026-05-26",
    kind: "Content",
    title: "20 new SEO articles",
    body: "Published deep-dive articles on supplements for anxiety, brain fog, joint pain, hair growth, gut health, heart health, immunity, women's hormones, testosterone, longevity, and more.",
    link: { label: "Journal", href: "/journal" },
  },
  {
    date: "2026-05-26",
    kind: "Feature",
    title: "Custom stack builder",
    body: "Build your own stack from 200+ ingredients. Live daily-ritual timeline, wellness preview, interaction warnings, share URL, and one-click iHerb checkout.",
    link: { label: "Open builder", href: "/build" },
  },
  {
    date: "2026-05-26",
    kind: "Improvement",
    title: "200+ ingredients (up from 100)",
    body: "Added 51 new ingredients including NMN, NR, urolithin A, fisetin, spermidine, Ca-AKG, pterostilbene, butyrate, S. boulardii, lactoferrin, theacrine, BioSil, tocotrienols, HMB, tart cherry, bergamot, and more.",
    link: { label: "Browse", href: "/ingredients" },
  },
  {
    date: "2026-05-26",
    kind: "Feature",
    title: "Cookie consent banner",
    body: "GDPR-compliant consent banner with Accept All, Reject Optional, and granular Customize controls.",
  },
  {
    date: "2026-05-25",
    kind: "Feature",
    title: "Email drip sequence",
    body: "After taking the quiz, users receive a 4-email sequence at day 0 (welcome), 3, 7, and 14, short, practical, with unsubscribe in every email.",
  },
  {
    date: "2026-05-24",
    kind: "Improvement",
    title: "Honest repositioning",
    body: "Removed all fabricated stats (no more '12,000+ users', '98% useful', '1,243 studies'), removed fake testimonials, and replaced press logos with real differentiators ('We don't sell our own pills', 'Every pick is explained').",
  },
  {
    date: "2026-05-22",
    kind: "Launch",
    title: "suppdoc.io is live",
    body: "Public launch with a 100-ingredient catalog, 11 pre-made stacks, the quiz, and the journal.",
  },
];

export default function ChangelogPage() {
  // Group entries by month for clean dating
  const grouped: { month: string; entries: Entry[] }[] = [];
  for (const e of ENTRIES) {
    const month = new Date(e.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const last = grouped[grouped.length - 1];
    if (last && last.month === month) last.entries.push(e);
    else grouped.push({ month, entries: [e] });
  }

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section style={{
          padding: "var(--section-pad-y) var(--section-pad-x) 40px",
          maxWidth: 880, margin: "0 auto", textAlign: "center",
        }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
            Changelog
          </div>
          <h1 style={{
            ...D, fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            What&apos;s <span style={SI}>new</span> on suppdoc.io.
          </h1>
          <p style={{
            fontSize: 17, color: TH.inkSoft, lineHeight: 1.6, margin: 0,
            maxWidth: 580, marginLeft: "auto", marginRight: "auto",
          }}>
            Every meaningful update we&apos;ve shipped, features, content, improvements, fixes. Newest at the top.
          </p>
        </section>

        {/* Timeline */}
        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 760, margin: "0 auto",
        }}>
          {grouped.map(({ month, entries }) => (
            <div key={month} style={{ marginBottom: 36 }}>
              <div style={{
                ...MM, fontSize: 12, color: TH.muted, letterSpacing: "0.1em",
                marginBottom: 14, textTransform: "uppercase",
                paddingBottom: 8, borderBottom: `1px solid ${TH.edge}`,
              }}>
                {month}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {entries.map((entry, i) => (
                  <EntryCard key={`${month}-${i}`} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Footer CTA */}
        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 760, margin: "0 auto",
        }}>
          <div style={{
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 18, padding: "20px 24px", textAlign: "center",
          }}>
            <p style={{ fontSize: 14, color: TH.inkSoft, margin: "0 0 12px", lineHeight: 1.55 }}>
              Want to know when we ship something? Take the <Link href="/quiz" style={{ color: TH.sageDeep, fontWeight: 600, textDecoration: "underline" }}>quiz</Link>, we&apos;ll only email if it&apos;s worth your attention.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── Entry card ───────────────────────────────────────────────────────────
function EntryCard({ entry }: { entry: Entry }) {
  const meta = KIND_META[entry.kind];
  return (
    <article style={{
      display: "grid", gridTemplateColumns: "var(--changelog-cols)",
      gap: "var(--changelog-gap)",
      padding: "16px 18px",
      background: TH.surface,
      border: `1px solid ${TH.edge}`,
      borderRadius: 16,
    }}>
      <div>
        <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.04em", marginBottom: 6 }}>
          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
        <span style={{
          display: "inline-block",
          padding: "3px 9px", background: meta.bg, color: meta.fg,
          ...MM, fontSize: 10.5, fontWeight: 700,
          letterSpacing: "0.05em", borderRadius: 999, textTransform: "uppercase",
        }}>
          {entry.kind}
        </span>
      </div>
      <div>
        <h3 style={{ ...D, fontSize: 17, color: TH.ink, margin: "0 0 6px", letterSpacing: "-0.015em", lineHeight: 1.3 }}>
          {entry.title}
        </h3>
        <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.55, margin: 0 }}>
          {entry.body}
        </p>
        {entry.link && (
          <Link href={entry.link.href} style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
            fontSize: 13, color: TH.sageDeep, fontWeight: 600, textDecoration: "none",
          }}>
            {entry.link.label}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <style>{`
        :root {
          --changelog-cols: 110px 1fr;
          --changelog-gap: 20px;
        }
        @media (max-width: 640px) {
          :root {
            --changelog-cols: 1fr;
            --changelog-gap: 10px;
          }
        }
      `}</style>
    </article>
  );
}

const KIND_META: Record<EntryKind, { bg: string; fg: string }> = {
  Feature:     { bg: "#dcfce7", fg: "#166534" },
  Improvement: { bg: "#fef3c7", fg: "#92400e" },
  Content:     { bg: "#dbeafe", fg: "#1e40af" },
  Fix:         { bg: "#fee2e2", fg: "#991b1b" },
  Launch:      { bg: "#ede9fe", fg: "#5b21b6" },
};
