import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPLEMENT_DB, Supplement } from "@/lib/supplements";
import { STACKS } from "@/lib/stacks";
import { iherbLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import { PRODUCTS } from "@/lib/products";
import { iherbProductLink } from "@/lib/iherb";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f6f5f1", bgWarm: "#f0eee8", paper: "#ffffff",
  ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", sageGlow: "rgba(91,163,115,0.10)",
  amber: "#e8a04a", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;
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
    title: `${supp.name} — Benefits, Dosage, Best Brands | suppdoc.io`,
    description: desc,
    keywords: [supp.name, ...supp.tags.slice(0, 6), "benefits", "dosage", "iHerb"].join(", "),
    openGraph: {
      title: `${supp.name} — Benefits, Dosage, Best Brands`,
      description: desc,
      type: "article",
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
  const products = PRODUCTS[supp.id] ?? [];

  const categoryLabel = supp.category ? CATEGORY_LABEL[supp.category] : "Supplement";
  const evidenceBadge = EVIDENCE_BADGE[supp.evidence];
  const showAmazon = amazonEnabled();

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

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
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 12 }}>
            — {categoryLabel.toUpperCase()} —
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
          </div>
        </div>
      </section>

      {/* Description + Quick facts */}
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
            <FactRow label="Common form" value={`${supp.brand} — ${supp.name}`} />
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

      {/* Buy buttons */}
      <section style={{ padding: "0 var(--section-pad-x) 64px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
            Where to buy
          </h2>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20, padding: 28,
          }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: th.inkMute, ...MM, letterSpacing: "0.05em", marginBottom: 6 }}>
                RECOMMENDED
              </div>
              <div style={{ ...D, fontSize: 22, fontWeight: 600, color: th.ink, marginBottom: 4 }}>
                {supp.brand} — {supp.name.split(" (")[0]}
              </div>
              <div style={{ color: th.inkSoft, fontSize: 15 }}>
                {supp.dose} · {timingLabel(supp.timing)} · ~${supp.monthlyCost}/month
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={iherbLink(supp.iherbSearch)}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500,
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
                    padding: "14px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500,
                    background: "#ff9900", color: "#fff", textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(255,153,0,0.25)",
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
              {products.map((p, i) => (
                <div key={i} style={{
                  background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 20,
                }}>
                  <div style={{
                    fontSize: 10, ...MM, color: p.brandInk, letterSpacing: "0.08em", marginBottom: 8,
                    background: p.brandBg, padding: "4px 10px", borderRadius: 999, display: "inline-block",
                  }}>
                    {p.badge.toUpperCase()}
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
                      padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                      background: th.burgundy, color: "#fff", textDecoration: "none",
                    }}
                  >
                    View on iHerb →
                  </a>
                </div>
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
            Take our 3-minute quiz. We'll compose a personalised stack that fits your goals, body, and budget.
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
  }[w] ?? w;
}
