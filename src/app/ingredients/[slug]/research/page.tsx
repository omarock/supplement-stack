import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPLEMENT_DB, type Supplement } from "@/lib/supplements";
import {
  getResearch,
  buildStudyLink,
  buildPubmedSearchUrl,
  fallbackResearchUrl,
  type Study,
  type ResearchEntry,
} from "@/lib/research";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export async function generateStaticParams() {
  return SUPPLEMENT_DB.map(s => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === slug);
  if (!supp) return { title: "Not found" };
  const research = getResearch(slug);
  const studyCount = research?.studies.length ?? 0;
  return {
    title: `${supp.name} Research, Clinical Studies & Evidence | suppdoc.io`,
    description: studyCount > 0
      ? `${studyCount} clinical studies on ${supp.name}. Real published research, plain-English summaries, PubMed links. Evidence level: ${research?.evidenceLevel ?? supp.evidence}.`
      : `Search the published research on ${supp.name}. Direct PubMed access, curated by suppdoc.io.`,
    keywords: `${supp.name} research, ${supp.name} clinical studies, ${supp.name} evidence, ${supp.name} PubMed`,
    alternates: { canonical: `/ingredients/${slug}/research` },
    // Thin-content guard: research pages with no curated studies only render outbound
    // PubMed search links, so keep them crawlable (follow) but out of the index until
    // a real RESEARCH[] entry is added. Reversible per-slug as studies are curated.
    robots: studyCount === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === slug);
  if (!supp) notFound();

  const research = getResearch(slug);
  const fallbackUrl = fallbackResearchUrl(supp.name.split(" (")[0], supp.tags);

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div style={{ padding: "24px var(--section-pad-x) 0", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, color: TH.muted, ...MM, letterSpacing: "0.04em" }}>
            <Link href="/ingredients" style={{ color: "inherit", textDecoration: "none" }}>Ingredients</Link>
            {" · "}
            <Link href={`/ingredients/${slug}`} style={{ color: "inherit", textDecoration: "none" }}>{supp.name.split(" (")[0]}</Link>
            {" · "}
            <span style={{ color: TH.ink, fontWeight: 600 }}>Research</span>
          </div>
        </div>

        {/* Hero */}
        <section style={{
          padding: "40px var(--section-pad-x) 32px",
          maxWidth: 1100, margin: "0 auto",
        }}>
          <h1 style={{
            ...D, fontSize: "clamp(32px, 5.5vw, 56px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            What does the research <span style={SI}>say about</span> {supp.name.split(" (")[0]}?
          </h1>

          {research ? (
            <ResearchHeader research={research} />
          ) : (
            <FallbackHeader supp={supp} fallbackUrl={fallbackUrl} />
          )}
        </section>

        {/* Studies */}
        {research && research.studies.length > 0 && (
          <section style={{ padding: "20px var(--section-pad-x) 60px", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ ...D, fontSize: 24, color: TH.ink, letterSpacing: "-0.02em", margin: 0 }}>
                {research.studies.length} key {research.studies.length === 1 ? "study" : "studies"}
              </h2>
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  ...MM, fontSize: 12, color: TH.sageDeep,
                  textDecoration: "none", letterSpacing: "0.04em",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                Search PubMed for more
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {research.studies.map((study, i) => (
                <li key={i}>
                  <StudyCard study={study} index={i + 1} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Methodology + bias note */}
        <section style={{ padding: "0 var(--section-pad-x) 60px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: TH.surface, border: `1px solid ${TH.edge}`,
            borderRadius: 18, padding: "22px 26px",
            display: "grid", gridTemplateColumns: "var(--research-cols)", gap: 18,
          }}>
            <div>
              <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
                How we read the research
              </div>
              <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.6, margin: 0 }}>
                We prioritize randomised controlled trials and meta-analyses over single observational studies. Animal and in-vitro data are listed as &quot;mechanistic&quot;, they suggest direction, not human effect size.
              </p>
            </div>
            <div>
              <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
                What we don&apos;t do
              </div>
              <p style={{ fontSize: 14, color: TH.inkSoft, lineHeight: 1.6, margin: 0 }}>
                We don&apos;t cherry-pick favourable studies, omit conflicting evidence, or cite industry-funded trials without flagging the conflict of interest where known.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            background: `linear-gradient(135deg, ${TH.inkBg} 0%, #0e3a63 100%)`,
            borderRadius: 22, padding: "32px 36px", color: "#ffffff",
            display: "grid", gridTemplateColumns: "var(--research-cta-cols)", gap: 18, alignItems: "center",
          }}>
            <div>
              <div style={{ ...MM, fontSize: 11, opacity: 0.7, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
                Make it actionable
              </div>
              <h3 style={{ ...D, fontSize: 26, letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 8px" }}>
                See {supp.name.split(" (")[0]} in a personalised stack
              </h3>
              <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
                The research is one thing, what to take, at what dose, paired with what, is another. We compose stacks that turn the evidence into a daily routine.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/quiz" style={ctaBtn("#ffffff", TH.ink)}>Take the quiz →</Link>
              <Link href={`/ingredients/${slug}`} style={ctaBtn("transparent", "#ffffff", true)}>
                Back to {supp.name.split(" (")[0]}
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 var(--section-pad-x) 60px",
          fontSize: 12, color: TH.muted, lineHeight: 1.6, textAlign: "center",
        }}>
          Studies referenced are real published research. Summaries are paraphrased for accessibility, for exact methods and full text, click through to PubMed. Educational use only, not medical advice. Consult a qualified clinician before starting any new supplement.
        </p>
      </main>
      <SiteFooter />

      <style>{`
        :root {
          --research-cols: 1fr 1fr;
          --research-cta-cols: 1.6fr 1fr;
        }
        @media (max-width: 800px) {
          :root {
            --research-cols: 1fr;
            --research-cta-cols: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Header for curated entries ───────────────────────────────────────────
function ResearchHeader({ research }: { research: ResearchEntry }) {
  const tier = research.evidenceLevel;
  const tierColor = tier === "very strong" ? "#15803d" : tier === "strong" ? "#a16207" : tier === "moderate" ? "#4338ca" : "#5b21b6";
  const tierBg = tier === "very strong" ? "#dcfce7" : tier === "strong" ? "#fef3c7" : tier === "moderate" ? "#e0e7ff" : "#ede9fe";

  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "6px 12px 6px 8px", borderRadius: 999,
        background: tierBg, marginBottom: 18,
      }}>
        <span aria-hidden style={{
          width: 22, height: 22, borderRadius: 999, background: tierColor,
          color: "#fff", fontSize: 12, fontWeight: 700,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>★</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: tierColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {tier} evidence
        </span>
      </div>

      <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, maxWidth: 760, margin: "0 0 22px" }}>
        {research.summary}
      </p>

      <div style={{
        background: TH.surface, border: `1px solid ${TH.edge}`,
        borderRadius: 16, padding: "20px 22px", maxWidth: 760,
      }}>
        <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 12, textTransform: "uppercase" }}>
          Best-evidenced use cases
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          {research.bestUseCases.map(uc => (
            <li key={uc} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: TH.inkSoft }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5" style={{ marginTop: 4, flexShrink: 0 }}>
                <path d="M5 12l5 5 9-11" />
              </svg>
              {uc}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ─── Header for ingredients without a curated entry ─────────────────────
function FallbackHeader({ supp, fallbackUrl }: { supp: Supplement; fallbackUrl: string }) {
  return (
    <>
      <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.6, maxWidth: 760, margin: "0 0 22px" }}>
        We&apos;re still curating peer-reviewed summaries for {supp.name}. In the meantime, here are the most useful direct links to the published research.
      </p>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24,
      }}>
        <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 18px", background: TH.inkBg, color: "#fff",
            borderRadius: 999, textDecoration: "none", fontSize: 13.5, fontWeight: 500,
          }}>
          Search PubMed for {supp.name.split(" (")[0]}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10" /></svg>
        </a>
        <a href={buildPubmedSearchUrl(`${supp.name.split(" (")[0]}+meta-analysis`)} target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 18px", background: TH.surface, color: TH.ink,
            border: `1px solid ${TH.edge}`,
            borderRadius: 999, textDecoration: "none", fontSize: 13.5, fontWeight: 500,
          }}>
          Just meta-analyses
        </a>
      </div>
      <div style={{
        background: TH.surface, border: `1px solid ${TH.edge}`,
        borderRadius: 16, padding: "20px 22px", maxWidth: 760,
        fontSize: 14, color: TH.inkSoft, lineHeight: 1.6,
      }}>
        <strong style={{ color: TH.ink }}>{supp.name}</strong> is rated by our team as <em>{supp.evidence}</em> evidence based on its use case profile and the available literature. Common uses: {supp.tags.slice(0, 4).join(" · ")}.
      </div>
    </>
  );
}

// ─── Study card ───────────────────────────────────────────────────────────
function StudyCard({ study, index }: { study: Study; index: number }) {
  const link = buildStudyLink(study);
  const typeMeta = STUDY_TYPE_META[study.type];

  return (
    <article style={{
      background: TH.surface, border: `1px solid ${TH.edge}`,
      borderRadius: 18, padding: "22px 24px",
      transition: "transform .15s, box-shadow .15s, border-color .15s",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <span style={{
          ...D, fontSize: 13, color: TH.muted,
          background: TH.bg, padding: "4px 10px", borderRadius: 999,
          minWidth: 28, textAlign: "center", flexShrink: 0,
        }}>{String(index).padStart(2, "0")}</span>
        <span style={{
          ...MM, fontSize: 10.5, padding: "4px 10px", borderRadius: 999,
          background: typeMeta.bg, color: typeMeta.fg, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {typeMeta.label}
        </span>
        <span style={{ ...MM, fontSize: 12, color: TH.muted }}>{study.year}</span>
        <span style={{ ...MM, fontSize: 12, color: TH.muted, fontStyle: "italic" }}>{study.journal}</span>
      </div>

      {/* Title */}
      <h3 style={{
        ...D, fontSize: 19, color: TH.ink, lineHeight: 1.3,
        letterSpacing: "-0.015em", margin: 0,
      }}>
        {study.title}
      </h3>

      <div style={{ fontSize: 13, color: TH.muted }}>
        {study.authors}
      </div>

      {/* Meta strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12, padding: "12px 0",
        borderTop: `1px solid ${TH.edge}`, borderBottom: `1px solid ${TH.edge}`,
      }}>
        <Meta label="Sample" value={study.sample} />
        <Meta label="Dose" value={study.dose} />
        <Meta label="Duration" value={study.duration} />
      </div>

      {/* Finding */}
      <div>
        <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
          Key finding
        </div>
        <p style={{ fontSize: 15, color: TH.ink, lineHeight: 1.6, margin: 0 }}>
          {study.finding}
        </p>
      </div>

      {/* Link */}
      <a href={link} target="_blank" rel="noopener noreferrer"
        style={{
          ...MM, fontSize: 12, color: TH.sageDeep,
          textDecoration: "none", letterSpacing: "0.05em",
          display: "inline-flex", alignItems: "center", gap: 6,
          alignSelf: "flex-start",
        }}>
          Read on PubMed
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M7 17L17 7M7 7h10v10" /></svg>
      </a>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13.5, color: TH.ink, fontWeight: 500, lineHeight: 1.35 }}>{value}</div>
    </div>
  );
}

const STUDY_TYPE_META: Record<Study["type"], { label: string; bg: string; fg: string }> = {
  "Meta-analysis":     { label: "Meta-analysis",     bg: "#dcfce7", fg: "#166534" },
  "Systematic Review": { label: "Systematic Review", bg: "#dbeafe", fg: "#1e40af" },
  "RCT":               { label: "RCT",               bg: "#fef3c7", fg: "#92400e" },
  "Pilot RCT":         { label: "Pilot RCT",         bg: "#fde68a", fg: "#92400e" },
  "Cohort":            { label: "Cohort",            bg: "#e0e7ff", fg: "#4338ca" },
  "Mechanistic":       { label: "Mechanistic",       bg: "#ede9fe", fg: "#5b21b6" },
};

function ctaBtn(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
    background: bg, color, textDecoration: "none",
    border: outline ? `1px solid ${color}55` : "none",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
}
