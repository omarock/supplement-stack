import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPLEMENT_DB, Supplement } from "@/lib/supplements";
import { PRODUCTS, ProductOption } from "@/lib/products";
import { iherbProductLink, iherbLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f6f5f1", bgWarm: "#f0eee8", paper: "#ffffff",
  ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", sageGlow: "rgba(91,163,115,0.10)",
  amber: "#e8a04a", amazonOrange: "#ff9900", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export async function generateStaticParams() {
  return SUPPLEMENT_DB.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === id);
  if (!supp) return { title: "Not found" };
  const bestseller = PRODUCTS[id]?.[0];
  const productLabel = bestseller ? `${bestseller.brand} ${bestseller.productName}` : `${supp.brand} ${supp.name}`;
  const desc = (bestseller?.fullDescription ?? supp.description ?? supp.why).slice(0, 155);
  return {
    title: `${productLabel} — Review, Price, Where to Buy | suppdoc.io`,
    description: desc,
    keywords: [supp.name, bestseller?.brand ?? supp.brand, "review", "iHerb", "supplements"].join(", "),
    openGraph: {
      title: `${productLabel}`,
      description: desc,
      type: "article",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supp = SUPPLEMENT_DB.find(s => s.id === id);
  if (!supp) notFound();

  // Get curated products for this supplement; fall back to a synthetic single-product entry
  const products = PRODUCTS[id] ?? [];
  const bestseller: ProductOption = products[0] ?? {
    brand: supp.brand,
    productName: supp.name,
    size: supp.dose,
    approxPrice: supp.monthlyCost,
    rating: 4.7,
    reviewCount: 0,
    badge: "Bestseller",
    searchQuery: supp.iherbSearch,
    brandBg: "#fef3c7",
    brandInk: "#92400e",
  };

  const alternatives = products.slice(1);
  const showAmazon = amazonEnabled();
  const buyUrl = bestseller.productPath
    ? iherbProductLink(bestseller.productPath)
    : iherbLink(bestseller.searchQuery ?? supp.iherbSearch);
  const amazonUrl = bestseller.amazonAsin
    ? amazonProductLink(bestseller.amazonAsin)
    : amazonLink(`${bestseller.brand} ${bestseller.productName}`);
  const description = bestseller.fullDescription ?? supp.description ?? supp.why;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      {/* Breadcrumb */}
      <div style={{ padding: "20px var(--section-pad-x) 0", fontSize: 13, color: th.inkMute }}>
        <Link href="/" style={{ color: th.inkMute, textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/ingredients" style={{ color: th.inkMute, textDecoration: "none" }}>Ingredients</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href={`/ingredients/${supp.id}`} style={{ color: th.inkMute, textDecoration: "none" }}>{supp.name}</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: th.ink }}>{bestseller.brand}</span>
      </div>

      {/* Product hero — image + key info */}
      <section style={{ padding: "24px var(--section-pad-x) 48px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 48,
          alignItems: "start",
        }}>
          {/* Product image */}
          <div style={{
            background: bestseller.brandBg, borderRadius: 24, padding: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: 420,
          }}>
            {bestseller.imageUrl ? (
              <img
                src={bestseller.imageUrl}
                alt={`${bestseller.brand} ${bestseller.productName}`}
                style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain" }}
              />
            ) : (
              <div style={{
                width: 160, height: 280, background: "#fff", borderRadius: 16,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: bestseller.brandInk, padding: 24, textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}>
                <div style={{ ...D, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
                  {bestseller.brand}
                </div>
                <div style={{ fontSize: 11, ...MM, lineHeight: 1.4 }}>
                  {bestseller.productName}
                </div>
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 10, ...MM, fontWeight: 600,
                background: bestseller.brandBg, color: bestseller.brandInk, letterSpacing: "0.08em",
              }}>
                {bestseller.badge.toUpperCase()}
              </span>
              <span style={{
                padding: "5px 12px", borderRadius: 999, fontSize: 10, ...MM, fontWeight: 600,
                background: th.sageGlow, color: th.sageDeep, letterSpacing: "0.08em",
              }}>
                {supp.category?.toUpperCase() ?? "SUPPLEMENT"}
              </span>
            </div>

            <div style={{ fontSize: 13, color: th.inkMute, ...MM, letterSpacing: "0.03em", marginBottom: 6 }}>
              {bestseller.brand.toUpperCase()}
            </div>

            <h1 style={{
              ...D, fontSize: "clamp(28px, 4vw, 40px)", margin: "0 0 14px",
              letterSpacing: "-0.02em", lineHeight: 1.15, fontWeight: 600,
            }}>
              {bestseller.productName}
            </h1>

            {/* Tag chips: form + ingredient form + key certifications */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {bestseller.form && (
                <span style={tagChipStyle}>{bestseller.form}</span>
              )}
              {bestseller.ingredientForm && (
                <span style={{ ...tagChipStyle, background: "#dbeafe", color: "#1e40af" }}>
                  {bestseller.ingredientForm}
                </span>
              )}
              {(bestseller.certifications ?? []).slice(0, 4).map(c => (
                <span key={c} style={{ ...tagChipStyle, background: "#f3f4f6", color: "#374151" }}>{c}</span>
              ))}
            </div>

            {/* Rating */}
            {bestseller.reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, fontSize: 14, color: th.inkSoft }}>
                <span style={{ color: th.amber, ...MM, letterSpacing: "0.05em" }}>★ {bestseller.rating}</span>
                <span style={{ color: th.inkMute }}>·</span>
                <span>{bestseller.reviewCount.toLocaleString()} reviews on iHerb</span>
              </div>
            )}

            {/* Serving facts */}
            <div style={{
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
              padding: 18, marginBottom: 22,
            }}>
              <FactGridRow label="Serving Size" value={bestseller.servingSize ?? supp.dose} />
              <FactGridRow label="Per Serving" value={bestseller.mgPerServing ?? supp.dose} />
              {bestseller.servingsPerContainer && (
                <FactGridRow label="Total Servings" value={`${bestseller.servingsPerContainer} per container`} />
              )}
              <FactGridRow label="Approx. price" value={`$${bestseller.approxPrice}`} last />
            </div>

            {/* Buy buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <a
                href={buyUrl}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  flex: "1 1 200px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: th.burgundy, color: "#fff", textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(10,37,64,0.22)",
                }}
              >
                Buy on iHerb →
              </a>
              {showAmazon && (
                <a
                  href={amazonUrl}
                  target="_blank" rel="noopener noreferrer sponsored"
                  style={{
                    flex: "1 1 200px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                    background: th.amazonOrange, color: "#fff", textDecoration: "none",
                    boxShadow: "0 6px 18px rgba(255,153,0,0.25)",
                  }}
                >
                  Buy on Amazon →
                </a>
              )}
            </div>
            <p style={{ fontSize: 12, color: th.inkMute, lineHeight: 1.5, margin: 0 }}>
              Affiliate disclosure: links may earn us a commission at no extra cost to you.
            </p>
          </div>
        </div>
      </section>

      {/* All certifications row (if many) */}
      {(bestseller.certifications?.length ?? 0) > 4 && (
        <section style={{ padding: "0 var(--section-pad-x) 32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h3 style={{ fontSize: 12, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 12 }}>
              ALL CERTIFICATIONS
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {bestseller.certifications!.map(c => (
                <span key={c} style={{
                  padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                  background: th.paper, border: `1px solid ${th.line}`, color: th.ink,
                }}>
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section style={{ padding: "0 var(--section-pad-x) 56px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ ...S, fontSize: 32, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            About this product
          </h2>
          <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
            {description}
          </p>

          {/* Why this ingredient */}
          <div style={{
            marginTop: 36, padding: 24,
            background: th.sageGlow, borderRadius: 16, borderLeft: `3px solid ${th.sage}`,
            maxWidth: 760,
          }}>
            <div style={{ fontSize: 11, ...MM, color: th.sageDeep, letterSpacing: "0.08em", marginBottom: 8 }}>
              WHY {supp.name.split(" (")[0].toUpperCase()} MATTERS
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: th.ink }}>
              {supp.why}
            </p>
            <Link href={`/ingredients/${supp.id}`} style={{
              display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 500,
              color: th.sageDeep, textDecoration: "none",
            }}>
              Read the full ingredient guide →
            </Link>
          </div>

          {/* Safety notes */}
          {supp.warnings && supp.warnings.length > 0 && (
            <div style={{
              marginTop: 24, padding: 20,
              background: "#fef3c7", borderRadius: 16, borderLeft: "3px solid #d97706",
              maxWidth: 760,
            }}>
              <div style={{ fontSize: 11, ...MM, color: "#92400e", letterSpacing: "0.08em", marginBottom: 8 }}>
                ⚠️ AVOID IF
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#78350f" }}>
                {supp.warnings.map(warningLabel).join(" · ")}. Consult a clinician before use.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Alternative products */}
      {alternatives.length > 0 && (
        <section style={{ padding: "0 var(--section-pad-x) 56px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              Other product options
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18,
            }}>
              {alternatives.map((p, i) => (
                <div key={i} style={{
                  background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 20,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <span style={{
                    alignSelf: "flex-start", padding: "4px 10px", borderRadius: 999,
                    fontSize: 10, ...MM, fontWeight: 600, letterSpacing: "0.08em",
                    background: p.brandBg, color: p.brandInk,
                  }}>
                    {p.badge.toUpperCase()}
                  </span>
                  <div style={{ ...D, fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
                    {p.productName}
                  </div>
                  <div style={{ color: th.inkSoft, fontSize: 13 }}>{p.brand}</div>
                  <div style={{ color: th.inkMute, fontSize: 12, ...MM }}>
                    {p.size} · ${p.approxPrice} · ★ {p.rating}
                  </div>
                  <a
                    href={p.productPath ? iherbProductLink(p.productPath) : iherbLink(p.searchQuery ?? supp.iherbSearch)}
                    target="_blank" rel="noopener noreferrer sponsored"
                    style={{
                      marginTop: 6, display: "block", textAlign: "center",
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

      {/* CTA */}
      <section style={{ padding: "32px var(--section-pad-x) 64px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          background: `linear-gradient(135deg, ${th.sage} 0%, ${th.amber} 100%)`,
          borderRadius: 24, padding: "40px 32px", textAlign: "center", color: "#fff",
        }}>
          <h2 style={{ ...S, fontSize: 36, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
            Not sure where to start?
          </h2>
          <p style={{ fontSize: 17, opacity: 0.95, margin: "12px auto 24px", maxWidth: 520, lineHeight: 1.5 }}>
            Take our 3-minute quiz. We'll compose a complete stack that fits your goals, body, and budget.
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
const tagChipStyle: React.CSSProperties = {
  padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 500,
  background: "#fef3c7", color: "#92400e",
  display: "inline-flex", alignItems: "center",
};

function FactGridRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid rgba(10,37,64,0.06)",
    }}>
      <span style={{ fontSize: 12, color: "#6b7280", fontFamily: '"JetBrains Mono", monospace', letterSpacing: "0.03em" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: "#0a2540", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
        {value}
      </span>
    </div>
  );
}

function warningLabel(w: string): string {
  return ({
    pregnant: "pregnant or nursing",
    "blood-thinners": "on blood thinners",
    thyroid: "thyroid condition",
    autoimmune: "autoimmune condition",
    "fish-allergy": "fish allergy",
    "shellfish-allergy": "shellfish allergy",
    "dairy-allergy": "dairy allergy",
    bipolar: "bipolar disorder",
    ssri: "taking SSRIs/MAOIs",
    liver: "active liver condition",
  } as Record<string, string>)[w] ?? w;
}
