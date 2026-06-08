import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPETITORS, getCompetitor, type ComparisonRow } from "@/lib/competitors";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export async function generateStaticParams() {
  return COMPETITORS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCompetitor(slug);
  if (!comp) return { title: "Comparison not found" };
  return {
    title: `suppdoc.io vs ${comp.name}, Honest Comparison | suppdoc.io`,
    description: comp.metaDescription,
    keywords: comp.keywords,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: `suppdoc.io vs ${comp.name}`,
      description: comp.oneLineVerdict,
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comp = getCompetitor(slug);
  if (!comp) notFound();

  // Win counts
  const wins = comp.rows.reduce(
    (acc, r) => {
      acc[r.winner] += 1;
      return acc;
    },
    { suppdoc: 0, competitor: 0, tie: 0 } as Record<"suppdoc" | "competitor" | "tie", number>,
  );

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div style={{ padding: "24px var(--section-pad-x) 0", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: TH.muted, ...MM, letterSpacing: "0.04em" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            {" · "}
            <Link href="/compare" style={{ color: "inherit", textDecoration: "none" }}>Compare</Link>
            {" · "}
            <span style={{ color: TH.ink, fontWeight: 600 }}>suppdoc vs {comp.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section style={{
          padding: "40px var(--section-pad-x) 32px",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
            Honest comparison
          </div>
          <h1 style={{
            ...D, fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            suppdoc.io <span style={SI}>vs</span> {comp.name}
          </h1>
          <p style={{
            fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, maxWidth: 760,
            margin: "0 0 22px",
          }}>
            {comp.oneLineVerdict}
          </p>

          {/* Score strip */}
          <div style={{
            display: "inline-flex", gap: 14, padding: "10px 16px",
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 999, fontSize: 13.5, fontWeight: 500,
          }}>
            <span style={{ color: TH.sageDeep }}>
              <strong style={{ ...D, fontSize: 16, color: TH.sageDeep, marginRight: 6 }}>{wins.suppdoc}</strong>
              suppdoc wins
            </span>
            <span style={{ color: TH.muted }}>·</span>
            <span style={{ color: TH.inkSoft }}>
              <strong style={{ ...D, fontSize: 16, color: TH.inkSoft, marginRight: 6 }}>{wins.tie}</strong>
              ties
            </span>
            <span style={{ color: TH.muted }}>·</span>
            <span style={{ color: TH.muted }}>
              <strong style={{ ...D, fontSize: 16, color: TH.muted, marginRight: 6 }}>{wins.competitor}</strong>
              {comp.name} wins
            </span>
          </div>
        </section>

        {/* Bottom line block */}
        <section style={{ padding: "0 var(--section-pad-x) 36px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: `linear-gradient(135deg, ${TH.bg} 0%, ${TH.surface} 100%)`,
            border: `1px solid ${TH.edge}`,
            borderRadius: 18, padding: "22px 26px",
          }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
              The bottom line
            </div>
            <p style={{ fontSize: 16, color: TH.ink, lineHeight: 1.65, margin: 0 }}>
              {comp.bottomLine}
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ padding: "16px var(--section-pad-x) 36px", maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ ...D, fontSize: 24, color: TH.ink, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Feature-by-feature
          </h2>
          <div style={{
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 18, overflow: "hidden",
          }}>
            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "var(--compare-cols)",
              background: TH.bg, borderBottom: `1px solid ${TH.edge}`,
              padding: "14px 18px", fontSize: 12, ...MM, letterSpacing: "0.08em",
              color: TH.muted, textTransform: "uppercase",
            }}>
              <span>Feature</span>
              <span style={{ color: TH.sageDeep, fontWeight: 600 }}>suppdoc.io</span>
              <span>{comp.name}</span>
            </div>
            {/* Rows */}
            {comp.rows.map((row, i) => (
              <Row key={i} row={row} competitorName={comp.name} alt={i % 2 === 1} />
            ))}
          </div>
        </section>

        {/* Pros / Cons for the competitor */}
        <section style={{ padding: "0 var(--section-pad-x) 36px", maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ ...D, fontSize: 24, color: TH.ink, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Where {comp.name} shines, and where it falls short
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "var(--proscons-cols)", gap: 14 }}>
            <div style={{
              background: TH.surface, border: `1px solid ${TH.edge}`,
              borderRadius: 16, padding: "20px 22px",
            }}>
              <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
                Strengths
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {comp.pros.map(p => (
                  <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5" style={{ marginTop: 4, flexShrink: 0 }}>
                      <path d="M5 12l5 5 9-11" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{
              background: TH.surface, border: `1px solid ${TH.edge}`,
              borderRadius: 16, padding: "20px 22px",
            }}>
              <div style={{ ...MM, fontSize: 11, color: "var(--c-destructive)", letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
                Weaknesses
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {comp.cons.map(c => (
                  <li key={c} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: TH.inkSoft, lineHeight: 1.55 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" style={{ marginTop: 4, flexShrink: 0 }}>
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who each is for */}
        <section style={{ padding: "0 var(--section-pad-x) 36px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "var(--proscons-cols)", gap: 14 }}>
            <div style={{
              background: TH.surface, border: `1px solid ${TH.edge}`,
              borderRadius: 16, padding: "20px 22px",
            }}>
              <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
                {comp.name} is best for
              </div>
              <p style={{ fontSize: 15, color: TH.inkSoft, lineHeight: 1.6, margin: 0 }}>{comp.bestFor}</p>
            </div>
            <div style={{
              background: TH.inkBg, color: "#fff",
              borderRadius: 16, padding: "20px 22px",
            }}>
              <div style={{ ...MM, fontSize: 11, opacity: 0.7, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
                Choose suppdoc.io if
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: "rgba(255,255,255,0.9)" }}>{comp.switchToUs}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`,
            borderRadius: 22, padding: "32px 36px", color: "#fff", textAlign: "center",
          }}>
            <h2 style={{ ...D, fontSize: 30, letterSpacing: "-0.025em", margin: "0 0 8px", lineHeight: 1.1 }}>
              Try suppdoc.io free in 2 minutes
            </h2>
            <p style={{ fontSize: 15, opacity: 0.92, margin: "0 0 22px", maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
              No signup, no subscription. Get a personalised stack and decide for yourself.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link href="/quiz" style={ctaBtn("#ffffff", TH.sageDeep)}>Take the Express quiz →</Link>
              <Link href="/audit" style={ctaBtn("transparent", "#ffffff", true)}>Or audit your current stack →</Link>
            </div>
          </div>
        </section>

        {/* Other comparisons */}
        <section style={{ padding: "0 var(--section-pad-x) 80px", maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ ...D, fontSize: 20, color: TH.ink, letterSpacing: "-0.015em", margin: "0 0 14px" }}>
            More comparisons
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 10,
          }}>
            {COMPETITORS.filter(c => c.slug !== slug).map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}`} style={{
                padding: "14px 16px", background: TH.surface,
                border: `1px solid ${TH.edge}`, borderRadius: 14,
                textDecoration: "none", color: "inherit",
                transition: "border-color .15s",
              }}>
                <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 2 }}>suppdoc vs {c.name}</div>
                <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.45 }}>{c.tagline}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <style>{`
        :root {
          --compare-cols: 1.4fr 1fr 1fr;
          --proscons-cols: 1fr 1fr;
        }
        @media (max-width: 700px) {
          :root {
            --compare-cols: 1.2fr 1fr 1fr;
            --proscons-cols: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ row, competitorName, alt }: { row: ComparisonRow; competitorName: string; alt: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "var(--compare-cols)",
      padding: "14px 18px",
      background: alt ? TH.bg : "transparent",
      borderBottom: `1px solid ${TH.edge}`,
      alignItems: "center",
    }}>
      <span style={{ fontSize: 14, color: TH.ink, fontWeight: 500 }}>{row.label}</span>
      <CellValue value={row.suppdoc} winner={row.winner === "suppdoc"} brand="suppdoc" />
      <CellValue value={row.competitor} winner={row.winner === "competitor"} brand="competitor" competitorName={competitorName} />
    </div>
  );
}

function CellValue({ value, winner, brand, competitorName }: { value: string; winner: boolean; brand: "suppdoc" | "competitor"; competitorName?: string }) {
  return (
    <span style={{
      fontSize: 13.5,
      color: winner ? (brand === "suppdoc" ? TH.sageDeep : TH.ink) : TH.inkSoft,
      fontWeight: winner ? 600 : 500,
      display: "inline-flex", alignItems: "center", gap: 8,
    }}>
      {winner && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={brand === "suppdoc" ? TH.sage : TH.ink} strokeWidth="2.6" style={{ flexShrink: 0 }}>
          <path d="M5 12l5 5 9-11" />
        </svg>
      )}
      <span>{value}</span>
      {competitorName === "" /* unused but kept for prop sig */ && null}
    </span>
  );
}

function ctaBtn(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    padding: "13px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
    background: bg, color, textDecoration: "none",
    border: outline ? `1px solid ${color}55` : "none",
    display: "inline-flex", alignItems: "center", gap: 8,
  };
}
