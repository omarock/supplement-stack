import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPLEMENT_DB, Supplement } from "@/lib/supplements";
import { STACKS } from "@/lib/stacks";
import { iherbLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import { getProducts, productImage, type ProductOption } from "@/lib/products";
import { iherbProductLink } from "@/lib/iherb";
import { GOALS } from "@/lib/goals";
import { INTERACTIONS, interactionSlug } from "@/lib/interactions";
import { TIMING } from "@/lib/timing";
import { BIOMARKERS } from "@/lib/biomarkers";
import { RESEARCH, buildStudyLink } from "@/lib/research";
import { researchVolume } from "@/lib/research-volume";
import { authorSchema, reviewedBySchema } from "@/lib/reviewers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BottleMockup from "@/components/BottleMockup";
import ReviewedBy from "@/components/ReviewedBy";

const BASE = "https://www.suppdoc.io";
// Pinned review date (stable across builds); bump when the catalog is re-reviewed.
const LAST_REVIEWED = "2026-05-30";

const th = {
  bg: "#f6f5f1", bgWarm: "#f0eee8", paper: "#ffffff",
  ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", sageGlow: "rgba(91,163,115,0.10)",
  amber: "#e8a04a", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;

function chip(): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 999,
    background: "#ffffff", border: "1px solid rgba(10,37,64,0.08)", color: "#3c4858",
    fontSize: 13, fontWeight: 500, textDecoration: "none",
  };
}
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

const CATEGORY_LABEL: Record<string, string> = {
  vitamins: "Vitamins",
  minerals: "Minerals",
  "amino-acids": "Amino Acids",
  "omega-fats": "Omega & Essential Fats",
  adaptogens: "Adaptogens",
  nootropics: "Nootropics",
  antioxidants: "Antioxidants",
  joint: "Joint & Connective Tissue",
  gut: "Gut & Digestive",
  sleep: "Sleep & Relaxation",
  hormonal: "Hormonal Support",
  heart: "Heart & Circulation",
  performance: "Performance & Recovery",
  greens: "Whole-Food Greens",
  specialty: "Specialty",
};

const EVIDENCE_BADGE: Record<Supplement["evidence"], { label: string; bg: string; ink: string }> = {
  "very strong": { label: "Very strong evidence", bg: "#dcfce7", ink: "#15803d" },
  strong: { label: "Strong evidence", bg: "#fef3c7", ink: "#a16207" },
  moderate: { label: "Moderate evidence", bg: "#e0e7ff", ink: "#4338ca" },
};

export async function generateStaticParams() {
  return SUPPLEMENT_DB.map(s => ({ slug: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === slug);
  if (!supp) return { title: "Not found" };
  const desc = (supp.description ?? supp.why).slice(0, 155);
  return {
    title: `${supp.name}, Benefits, Dosage, Best Brands | suppdoc.io`,
    description: desc,
    keywords: [supp.name, ...supp.tags.slice(0, 6), "benefits", "dosage", "iHerb"].join(", "),
    alternates: { canonical: `${BASE}/ingredients/${slug}` },
    openGraph: {
      title: `${supp.name}, Benefits, Dosage, Best Brands`,
      description: desc,
      type: "article",
      url: `${BASE}/ingredients/${slug}`,
    },
  };
}

export default async function IngredientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === slug);
  if (!supp) notFound();

  // Find stacks that contain this supplement
  const relatedStacks = STACKS.filter(st => st.supplementIds.includes(supp.id));

  // Find related ingredients (same category)
  const relatedIngredients = SUPPLEMENT_DB
    .filter(s => s.id !== supp.id && s.category === supp.category)
    .slice(0, 4);

  // Product options for this supplement
  const products = getProducts(supp.id);

  // ── Internal-linking web: connect this ingredient to the hub pages ──────────
  const nameOf = (id: string) => SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
  const relatedGoals = GOALS.filter(g => (g.tags ?? []).some(t => supp.tags.includes(t)) || (g.ids ?? []).includes(supp.id)).slice(0, 6);
  const relatedInteractions = INTERACTIONS.filter(i => i.a === supp.id || i.b === supp.id).slice(0, 6);
  const relatedBiomarkers = BIOMARKERS.filter(b => (b.supplementsForLow ?? []).includes(supp.id) || (b.supplementsForHigh ?? []).includes(supp.id)).slice(0, 6);
  const hasResearch = Boolean(RESEARCH[supp.id]);
  const rv = researchVolume(supp.id); // real PubMed clinical-study count + verifiable link

  const categoryLabel = supp.category ? CATEGORY_LABEL[supp.category] : "Supplement";
  const evidenceBadge = EVIDENCE_BADGE[supp.evidence];
  const showAmazon = amazonEnabled();
  const desc = (supp.description ?? supp.why).slice(0, 300);

  // Answer-first summary + FAQ, built only from real on-page fields (no fabrication).
  const shortName = supp.name.split(" (")[0];
  const quickAnswer = `${shortName}: ${supp.purpose}. ${supp.why} Standard dose ${supp.dose}, taken in the ${timingLabel(supp.timing).toLowerCase()}, about $${supp.monthlyCost}/month. Evidence rating: ${EVIDENCE_BADGE[supp.evidence].label.toLowerCase()}.`;
  const faq: { q: string; a: string }[] = [
    { q: `What is ${shortName}?`, a: supp.description ?? supp.why },
    { q: `What is ${shortName} used for?`, a: `${supp.purpose}. ${supp.why}` },
    { q: `What is the standard dose of ${shortName}?`, a: `${supp.dose}, typically taken in the ${timingLabel(supp.timing).toLowerCase()}. Approximate cost is $${supp.monthlyCost} per month.` },
    ...(supp.warnings && supp.warnings.length
      ? [{ q: `Who should avoid ${shortName}?`, a: `Use extra caution, and speak to a clinician first, if you are ${supp.warnings.map(w => warningLabel(w)).join(", ")}.` }]
      : []),
    { q: `How strong is the evidence for ${shortName}?`, a: `${EVIDENCE_BADGE[supp.evidence].label} for its primary uses. See the full study list on the research page.` },
  ];

  // ── Structured data (YMYL): only real, on-page facts; nothing fabricated ──
  const studies = RESEARCH[supp.id]?.studies ?? [];
  const citations = studies.map(st => ({
    "@type": "MedicalScholarlyArticle",
    name: st.title,
    author: st.authors,
    datePublished: String(st.year),
    publisher: { "@type": "Organization", name: st.journal },
    url: buildStudyLink(st),
  }));
  const reviewedBy = reviewedBySchema();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        name: `${supp.name}: Benefits, Dosage & Evidence`,
        description: desc,
        url: `${BASE}/ingredients/${supp.id}`,
        lastReviewed: LAST_REVIEWED,
        author: authorSchema(),
        ...(reviewedBy ? { reviewedBy } : {}),
        mainEntity: { "@type": "DietarySupplement", name: supp.name },
      },
      {
        "@type": "DietarySupplement",
        name: supp.name,
        description: desc,
        activeIngredient: supp.name,
        recommendedIntake: supp.dose,
        mechanismOfAction: supp.why,
        ...(supp.warnings && supp.warnings.length
          ? { safetyConsideration: supp.warnings.map(w => warningLabel(w)).join("; ") }
          : {}),
        ...(citations.length ? { citation: citations } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Ingredients", item: `${BASE}/ingredients` },
          { "@type": "ListItem", position: 3, name: supp.name, item: `${BASE}/ingredients/${supp.id}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(f => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <main id="main-content">
      {/* Breadcrumb */}
      <div style={{ padding: "20px var(--section-pad-x) 0", fontSize: 13, color: th.inkMute }}>
        <Link href="/" style={{ color: th.inkMute, textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/ingredients" style={{ color: th.inkMute, textDecoration: "none" }}>Ingredients</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: th.ink }}>{supp.name}</span>
      </div>

      {/* Hero */}
      <section style={{ padding: "32px var(--section-pad-x) 48px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: th.sageDeep, ...MM, letterSpacing: "0.1em", marginBottom: 12 }}>
          {categoryLabel.toUpperCase()}
          </div>
          <h1 style={{
            ...D, fontSize: "clamp(40px, 6vw, 64px)", margin: 0,
            letterSpacing: "-0.025em", lineHeight: 1.05, fontWeight: 600,
          }}>
            {supp.name}
          </h1>
          <p style={{
            ...S, fontSize: 24, color: th.inkSoft, margin: "16px 0 0",
            letterSpacing: "-0.01em", lineHeight: 1.4,
          }}>
            <em>{supp.purpose}</em>
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <span style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: evidenceBadge.bg, color: evidenceBadge.ink, ...MM, letterSpacing: "0.04em",
            }}>
              {evidenceBadge.label.toUpperCase()}
            </span>
            {supp.vegan && (
              <span style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: "#dcfce7", color: "#15803d", ...MM, letterSpacing: "0.04em",
              }}>
                VEGAN
              </span>
            )}
            {(supp.priority ?? 0) >= 8 && (
              <span style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: "#fef3c7", color: "#a16207", ...MM, letterSpacing: "0.04em",
              }}>
                CORE INGREDIENT
              </span>
            )}
            <Link href={`/ingredients/${slug}/research`} style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: "#0a2540", color: "#fff", textDecoration: "none",
              ...MM, letterSpacing: "0.04em",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              READ THE RESEARCH
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
            {rv && rv.count > 0 && (
              <a href={rv.url} target="_blank" rel="noopener noreferrer" title={`${rv.count.toLocaleString()} randomized trials, meta-analyses and systematic reviews indexed on PubMed for ${shortName}. Click to verify.`} style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: "#eef2ff", color: "#3730a3", ...MM, letterSpacing: "0.04em",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {rv.count.toLocaleString()} CLINICAL STUDIES
              </a>
            )}
          </div>

          {/* E-E-A-T: reviewer byline + last-reviewed date */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
            <ReviewedBy />
            <span style={{ ...MM, fontSize: 11, color: th.inkMute }}>
              Last reviewed: {new Date(LAST_REVIEWED).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
      </section>

      {/* Answer-first summary, quotable by AI search engines */}
      <section style={{ padding: "0 var(--section-pad-x) 8px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderLeft: `3px solid ${th.sage}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ ...MM, fontSize: 10.5, color: th.sageDeep, letterSpacing: "0.1em", marginBottom: 8 }}>QUICK ANSWER</div>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: th.ink }}>{quickAnswer}</p>
          </div>
        </div>
      </section>

      {/* Buy buttons, placed right after the quick answer so the purchase path is first */}
      <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            Where to buy
          </h2>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20, padding: 28,
            display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start",
          }}>
            {/* Recommended product image */}
            {(() => {
              const heroOpt: ProductOption = products[0] ?? {
                brand: supp.brand, productName: supp.name.split(" (")[0], size: supp.dose,
                approxPrice: supp.monthlyCost, rating: 4.7, reviewCount: 0, badge: "Bestseller",
                searchQuery: supp.iherbSearch, brandBg: "#fef3c7", brandInk: "#92400e",
              };
              const heroImg = productImage(heroOpt);
              return (
                <div style={{
                  width: 150, height: 150, flexShrink: 0, borderRadius: 16, overflow: "hidden",
                  background: "#fff", border: `1px solid ${th.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {heroImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroImg} alt={`${heroOpt.brand} ${heroOpt.productName}`} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14 }} />
                  ) : (
                    <BottleMockup option={heroOpt} height={150} showBackgroundScene={false} />
                  )}
                </div>
              );
            })()}

            <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: th.inkMute, ...MM, letterSpacing: "0.05em", marginBottom: 6 }}>
                RECOMMENDED
              </div>
              <div style={{ ...D, fontSize: 22, fontWeight: 600, color: th.ink, marginBottom: 4 }}>
                {supp.brand}, {supp.name.split(" (")[0]}
              </div>
              <div style={{ color: th.inkSoft, fontSize: 15 }}>
                {supp.dose} · {timingLabel(supp.timing)} · ~${supp.monthlyCost}/month
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={products[0]?.productPath
                  ? iherbProductLink(products[0].productPath)
                  : iherbLink(products[0]?.searchQuery ?? supp.iherbSearch)}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: th.burgundy, color: "#fff", textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(10,37,64,0.18)",
                }}
              >
                Buy on iHerb →
              </a>
              {showAmazon && (
                <a
                  href={products[0]?.amazonAsin
                    ? amazonProductLink(products[0].amazonAsin)
                    : amazonLink(supp.iherbSearch)}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                    background: "#ffd814", color: "#0f1111", textDecoration: "none",
                    border: "1px solid #fcd200", boxShadow: "0 4px 14px rgba(255,216,20,0.3)",
                  }}
                >
                  Buy on Amazon →
                </a>
              )}
            </div>
            <p style={{ marginTop: 18, fontSize: 12, color: th.inkMute, lineHeight: 1.5 }}>
              suppdoc.io is an affiliate. Links may earn us a commission at no extra cost to you.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* More product options (if we have curated PRODUCTS entries) */}
      {products.length > 1 && (
        <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              All product options
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20,
            }}>
              {products.map((p, i) => {
                const img = productImage(p);
                return (
                <div key={i} style={{
                  background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 20,
                }}>
                  {/* Product image (clean white canvas) with a tidy fallback */}
                  <div style={{
                    position: "relative", height: 150, borderRadius: 12, overflow: "hidden", marginBottom: 14,
                    background: "#ffffff", border: `1px solid ${th.line}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`${p.brand} ${p.productName}`} loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14 }} />
                    ) : (
                      <BottleMockup option={p} height={150} showBackgroundScene={false} />
                    )}
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      fontSize: 10, ...MM, color: p.brandInk, letterSpacing: "0.08em",
                      background: p.brandBg, padding: "4px 10px", borderRadius: 999,
                    }}>
                      {p.badge.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ ...D, fontSize: 17, fontWeight: 600, margin: "6px 0 4px", lineHeight: 1.3 }}>
                    {p.productName}
                  </div>
                  <div style={{ color: th.inkSoft, fontSize: 13, marginBottom: 4 }}>{p.brand}</div>
                  <div style={{ color: th.inkMute, fontSize: 12, marginBottom: 14, ...MM }}>
                    {p.size} · ${p.approxPrice} · ★ {p.rating}
                  </div>
                  <a
                    href={p.productPath ? iherbProductLink(p.productPath) : iherbLink(p.searchQuery ?? supp.iherbSearch)}
                    target="_blank" rel="noopener noreferrer sponsored"
                    style={{
                      display: "block", textAlign: "center",
                      padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: th.burgundy, color: "#fff", textDecoration: "none",
                    }}
                  >
                    Buy on iHerb →
                  </a>
                  {amazonEnabled() && (
                    <a
                      href={p.amazonAsin ? amazonProductLink(p.amazonAsin) : amazonLink(`${p.brand} ${p.productName}`)}
                      target="_blank" rel="noopener noreferrer sponsored"
                      style={{
                        display: "block", textAlign: "center", marginTop: 8,
                        padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: "#ffd814", color: "#0f1111", textDecoration: "none",
                        border: "1px solid #fcd200",
                      }}
                    >
                      Buy on Amazon →
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Description + Quick facts (the deeper 'what is it', after the buy path) */}
      <section style={{ padding: "0 var(--section-pad-x) 48px" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "grid", gridTemplateColumns: "var(--ingredient-hero-cols, minmax(0, 1fr) 320px)", gap: "var(--grid-2-gap, 40px)",
        }}>
          {/* Description */}
          <div>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              What is {supp.name.split(" (")[0]}?
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.7, margin: 0 }}>
              {supp.description ?? supp.why}
            </p>

            {/* Why this matters (the short why) */}
            <div style={{
              marginTop: 32, padding: 22,
              background: th.sageGlow, borderRadius: 16, borderLeft: `3px solid ${th.sage}`,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sageDeep, letterSpacing: "0.08em", marginBottom: 8 }}>
                WHY IT MATTERS
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: th.ink }}>
                {supp.why}
              </p>
            </div>
          </div>

          {/* Quick facts card */}
          <aside style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
            padding: 24, height: "fit-content",
          }}>
            <h3 style={{ ...D, fontSize: 14, ...MM, fontWeight: 600, color: th.sage, letterSpacing: "0.1em", margin: "0 0 18px" }}>
              QUICK FACTS
            </h3>
            <FactRow label="Standard dose" value={supp.dose} />
            <FactRow label="When to take" value={timingLabel(supp.timing)} />
            <FactRow label="Approx. monthly cost" value={`$${supp.monthlyCost}`} />
            <FactRow label="Common form" value={`${supp.brand}, ${supp.name}`} />
            {TIMING[supp.id] && (
              <Link href={`/timing/${supp.id}`} style={{
                display: "block", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${th.line}`,
                fontSize: 13.5, color: th.sage, fontWeight: 600, textDecoration: "none",
              }}>
                Best time to take {shortName} →
              </Link>
            )}
            {supp.warnings && supp.warnings.length > 0 && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${th.line}` }}>
                <div style={{ fontSize: 11, ...MM, color: "#b91c1c", letterSpacing: "0.08em", marginBottom: 6 }}>
                  AVOID IF
                </div>
                <p style={{ margin: 0, fontSize: 13, color: th.inkSoft, lineHeight: 1.5 }}>
                  {supp.warnings.map(w => warningLabel(w)).join(" · ")}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Natural food sources, only rendered when curated (no fabrication) */}
      {supp.foodSources && supp.foodSources.length > 0 && (
        <section style={{ padding: "0 var(--section-pad-x) 56px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
              Natural food sources
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 640 }}>
              Where possible, get {supp.name.split(" (")[0]} from whole foods first. Common dietary sources include:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {supp.foodSources.map(food => (
                <span key={food} style={{
                  padding: "8px 16px", borderRadius: 999, fontSize: 14, fontWeight: 500,
                  background: th.paper, border: `1px solid ${th.line}`, color: th.ink,
                }}>{food}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related stacks */}
      {relatedStacks.length > 0 && (
        <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              Stacks that include {supp.name.split(" (")[0]}
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16,
            }}>
              {relatedStacks.map(st => (
                <Link key={st.id} href={`/stacks/${st.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: st.coverBg, color: st.coverInk, borderRadius: 16, padding: 22,
                    display: "flex", flexDirection: "column", gap: 6, minHeight: 130,
                  }}>
                    <div style={{ fontSize: 28 }}>{st.coverGlyph}</div>
                    <div style={{ ...D, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{st.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>{st.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Explore further, internal-linking web to goal / interaction / biomarker hubs */}
      {(relatedGoals.length > 0 || relatedInteractions.length > 0 || relatedBiomarkers.length > 0 || hasResearch) && (
        <section style={{ padding: "0 var(--section-pad-x) 56px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
            {relatedGoals.length > 0 && (
              <div>
                <h3 style={{ ...D, fontWeight: 600, fontSize: 15, color: th.ink, margin: "0 0 10px" }}>Best for your goal</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {relatedGoals.map(g => (
                    <Link key={g.slug} href={`/best/${g.slug}`} style={chip()}>{g.label}</Link>
                  ))}
                </div>
              </div>
            )}
            {relatedInteractions.length > 0 && (
              <div>
                <h3 style={{ ...D, fontWeight: 600, fontSize: 15, color: th.ink, margin: "0 0 10px" }}>Interactions</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {relatedInteractions.map(i => {
                    const other = i.a === supp.id ? i.b : i.a;
                    return <Link key={interactionSlug(i.a, i.b)} href={`/interactions/${interactionSlug(i.a, i.b)}`} style={chip()}>with {nameOf(other)}</Link>;
                  })}
                </div>
              </div>
            )}
            {relatedBiomarkers.length > 0 && (
              <div>
                <h3 style={{ ...D, fontWeight: 600, fontSize: 15, color: th.ink, margin: "0 0 10px" }}>Related biomarkers</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {relatedBiomarkers.map(b => (
                    <Link key={b.key} href={`/biomarkers/${b.key.replace(/_/g, "-")}`} style={chip()}>{b.label}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related ingredients */}
      {relatedIngredients.length > 0 && (
        <section style={{ padding: "0 var(--section-pad-x) 64px", borderTop: `1px solid ${th.line}`, marginTop: 8 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 48 }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              Other {(categoryLabel || "").toLowerCase()}
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14,
            }}>
              {relatedIngredients.map(r => (
                <Link key={r.id} href={`/ingredients/${r.id}`} style={{ textDecoration: "none", color: th.ink }}>
                  <div style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 12,
                    padding: 16, transition: "transform .15s",
                  }}>
                    <div style={{ ...D, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: th.inkSoft }}>{r.purpose}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ (visible + matches FAQPage JSON-LD) */}
      <section style={{ padding: "0 var(--section-pad-x) 56px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em" }}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faq.map((f, i) => (
              <div key={i} style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: th.ink, marginBottom: 6 }}>{f.q}</div>
                <div style={{ fontSize: 14.5, color: th.inkSoft, lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "48px var(--section-pad-x) 64px" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          background: `linear-gradient(135deg, ${th.sage} 0%, ${th.amber} 100%)`,
          borderRadius: 24, padding: "40px 32px", textAlign: "center", color: "#fff",
        }}>
          <h2 style={{ ...S, fontSize: 36, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
            Not sure if {supp.name.split(" (")[0]} is right for you?
          </h2>
          <p style={{ fontSize: 17, opacity: 0.95, margin: "12px auto 24px", maxWidth: 520, lineHeight: 1.5 }}>
            Take our quiz. We&apos;ll compose a personalised stack that fits your goals, body, and budget, in minutes.
          </p>
          <Link href="/quiz" style={{
            display: "inline-flex", padding: "16px 36px", borderRadius: 999, fontSize: 15, fontWeight: 600,
            background: "#fff", color: th.ink, textDecoration: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}>
            Take the quiz →
          </Link>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid rgba(10,37,64,0.06)" }}>
      <span style={{ fontSize: 12, color: "#6b7280", ...MM, letterSpacing: "0.03em" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0a2540", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function timingLabel(t: Supplement["timing"]): string {
  return { morning: "Morning", midday: "Midday", evening: "Evening", "pre-train": "Pre-workout" }[t];
}

function warningLabel(w: string): string {
  return {
    pregnant: "pregnant or nursing",
    "blood-thinners": "on blood thinners",
    thyroid: "thyroid condition",
    autoimmune: "autoimmune condition",
    "fish-allergy": "fish allergy",
    "shellfish-allergy": "shellfish allergy",
    bipolar: "bipolar disorder",
    ssri: "taking SSRIs/MAOIs",
    "hormone-sensitive": "managing a hormone-sensitive condition",
    medications: "taking prescription medication",
    "bee-allergy": "allergic to bees or bee products",
    "stomach-ulcers": "prone to stomach ulcers",
  }[w] ?? w;
}
