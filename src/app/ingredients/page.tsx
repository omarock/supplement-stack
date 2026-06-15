import type { Metadata } from "next";
import Link from "next/link";
import { SUPPLEMENT_DB, Supplement } from "@/lib/supplements";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageDeep: "var(--c-sage-deep)", sageGlow: "var(--c-accent-glow)",
  amber: "var(--c-amber)", burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;
const MM = { fontFamily: '"Inter", system-ui, sans-serif' } as const;

export const metadata: Metadata = {
  title: "Supplement Ingredients A-Z, suppdoc.io",
  description: `Browse ${SUPPLEMENT_DB.length}+ evidence-based supplement ingredients. Benefits, dosage, safety, and where to buy each one. Vitamins, minerals, amino acids, adaptogens, nootropics, and more.`,
  keywords: "supplement ingredients, supplement encyclopedia, supplement library, vitamins, minerals, adaptogens, nootropics, amino acids",
  alternates: { canonical: "/ingredients" },
};

const CATEGORY_ORDER: { key: string; label: string; tagline: string }[] = [
  { key: "vitamins", label: "Vitamins", tagline: "Essential micronutrients the body cannot make in adequate amounts." },
  { key: "minerals", label: "Minerals", tagline: "Inorganic cofactors that power hundreds of enzymatic reactions." },
  { key: "omega-fats", label: "Omega & Essential Fats", tagline: "Structural fats your cells, brain, and joints depend on." },
  { key: "amino-acids", label: "Amino Acids", tagline: "Building blocks of protein with specialised individual roles." },
  { key: "adaptogens", label: "Adaptogens", tagline: "Botanicals that help the body adapt to physical and mental stress." },
  { key: "nootropics", label: "Nootropics", tagline: "Cognitive support, focus, memory, neuroplasticity." },
  { key: "antioxidants", label: "Antioxidants", tagline: "Compounds that neutralise oxidative stress at the cellular level." },
  { key: "sleep", label: "Sleep & Relaxation", tagline: "Targeted support for deeper sleep and a calmer nervous system." },
  { key: "joint", label: "Joint & Connective Tissue", tagline: "Comfort, cartilage support, and connective recovery." },
  { key: "gut", label: "Gut & Digestive", tagline: "Microbiome balance, gut barrier, digestion, and enzymes." },
  { key: "hormonal", label: "Hormonal Support", tagline: "Balance for the endocrine system, libido, and reproductive health." },
  { key: "heart", label: "Heart & Circulation", tagline: "Cardiovascular function, blood pressure, and lipid balance." },
  { key: "performance", label: "Performance & Recovery", tagline: "Power, endurance, recovery, for active bodies." },
  { key: "greens", label: "Whole-Food Greens", tagline: "Nutrient-dense algae and plant concentrates." },
  { key: "specialty", label: "Specialty", tagline: "Targeted compounds with focused, evidence-based use cases." },
];

function groupByCategory(): Map<string, Supplement[]> {
  const m = new Map<string, Supplement[]>();
  for (const s of SUPPLEMENT_DB) {
    const k = s.category ?? "specialty";
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(s);
  }
  // Sort each group: priority desc, then name asc
  for (const [, arr] of m) {
    arr.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name));
  }
  return m;
}

export default function IngredientsIndexPage() {
  const grouped = groupByCategory();
  const totalCount = SUPPLEMENT_DB.length;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <main id="main-content">
      {/* Hero */}
      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 24px", textAlign: "center" }}>
        <h1 style={{
          ...S, fontSize: "var(--section-h2)", margin: 0,
          letterSpacing: "-0.025em", lineHeight: 1.05,
        }}>
          The <em style={{ color: th.burgundy }}>supplements</em> we trust.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 18, lineHeight: 1.6, maxWidth: 640, margin: "20px auto 0" }}>
          A growing reference of {totalCount} evidence-backed ingredients, what they do, who benefits, how to dose, and where to source the cleanest version.
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14, marginTop: 24,
          padding: "10px 20px", borderRadius: 999, background: th.paper,
          border: `1px solid ${th.line}`, fontSize: 13, color: th.inkSoft,
        }}>
          <span>💊 {totalCount} ingredients</span>
          <span style={{ color: th.inkMute }}>·</span>
          <span>🌿 {SUPPLEMENT_DB.filter(s => s.vegan).length} vegan-friendly</span>
          <span style={{ color: th.inkMute }}>·</span>
          <span>📚 {SUPPLEMENT_DB.filter(s => s.evidence === "very strong" || s.evidence === "strong").length} with strong evidence</span>
        </div>
      </section>

      {/* Category jump nav */}
      <section style={{ padding: "16px var(--section-pad-x) 32px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
        }}>
          {CATEGORY_ORDER.filter(c => (grouped.get(c.key)?.length ?? 0) > 0).map(c => (
            <a key={c.key} href={`#${c.key}`} style={{
              padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: th.paper, border: `1px solid ${th.line}`, color: th.ink, textDecoration: "none",
            }}>
              {c.label} <span style={{ color: th.inkMute, marginLeft: 4 }}>({grouped.get(c.key)!.length})</span>
            </a>
          ))}
        </div>
      </section>

      {/* Category sections */}
      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 56 }}>
          {CATEGORY_ORDER.map(c => {
            const items = grouped.get(c.key);
            if (!items || items.length === 0) return null;
            return (
              <div key={c.key} id={c.key}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ ...S, fontSize: 38, margin: 0, letterSpacing: "-0.02em" }}>
                    {c.label}
                  </h2>
                  <p style={{ color: th.inkSoft, fontSize: 15, margin: "6px 0 0", maxWidth: 640 }}>
                    {c.tagline}
                  </p>
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14,
                }}>
                  {items.map(s => (
                    <IngredientCard key={s.id} s={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}

function IngredientCard({ s }: { s: Supplement }) {
  const evidencePill = s.evidence === "very strong" ? "★★★"
    : s.evidence === "strong" ? "★★" : "★";
  return (
    <Link href={`/ingredients/${s.id}`} style={{ textDecoration: "none", color: th.ink }}>
      <div style={{
        background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
        padding: 18, height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        transition: "border-color .15s, transform .15s",
      }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ ...D, fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: th.ink, maxWidth: "75%" }}>
              {s.name}
            </div>
            <span style={{ ...MM, fontSize: 11, color: th.sage, letterSpacing: "0.04em", flexShrink: 0 }}>
              {evidencePill}
            </span>
          </div>
          <div style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.4, marginBottom: 12 }}>
            {s.purpose}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 11, color: th.inkMute, ...MM, letterSpacing: "0.03em",
        }}>
          <span>~${s.monthlyCost}/mo</span>
          <span style={{ color: th.sageDeep }}>Read →</span>
        </div>
      </div>
    </Link>
  );
}
