// Server component (static, zero hydration), matching the homepage model.
// Two states:
//   • TESTIMONIALS has real entries  -> premium testimonial wall + AggregateRating schema
//   • TESTIMONIALS empty (today)      -> honest, premium "founding phase" panel with
//                                        verifiable trust signals (no fabricated reviews)
import { TH, D, MM, SI } from "@/lib/theme";
import { TESTIMONIALS, SAMPLE_TESTIMONIALS, aggregateRating, type Testimonial } from "@/lib/social-proof";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS } from "@/lib/interactions";
import { RESEARCH_STUDY_TOTAL } from "@/lib/research-volume";

const fmt = (n: number) => n.toLocaleString("en-US");

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <span aria-label={`${rating} out of 5`} style={{ display: "inline-flex", gap: 2, color: TH.amber, fontSize: 15, lineHeight: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ opacity: i < Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure style={{
      margin: 0, background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 20,
      padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 14, height: "100%",
      boxShadow: `0 18px 40px -24px color-mix(in srgb, ${TH.ink} 28%, transparent)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stars rating={t.rating ?? 5} />
        {t.verified ? (
          <span style={{ ...MM, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: TH.sageDeep, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span aria-hidden>✓</span> Verified member
          </span>
        ) : null}
      </div>
      <blockquote style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: TH.ink }}>“{t.quote}”</blockquote>
      <figcaption style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} width={40} height={40} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span aria-hidden style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 15,
          }}>{initials(t.name)}</span>
        )}
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ ...D, fontSize: 14.5, color: TH.ink }}>{t.name}</span>
          {t.context ? <span style={{ fontSize: 12.5, color: TH.inkSoft }}>{t.context}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

const PILLARS: { stat: string; label: string }[] = [
  { stat: `${fmt(RESEARCH_STUDY_TOTAL)}+`, label: "peer-reviewed studies behind our ratings, each linked to PubMed" },
  { stat: `${SUPPLEMENT_DB.length}+`, label: "ingredients, every one evidence-graded with dose and timing" },
  { stat: `${INTERACTIONS.length}+`, label: "interactions mapped so your stack stays safe" },
  { stat: "$0", label: "we earn from supplement makers, no house brand, no kickbacks" },
];

export default function SocialProof() {
  // Real reviews show everywhere. Sample cards render ONLY on non-production
  // (preview/dev) builds so you can see the wall before you have real quotes;
  // they never reach the live site and never emit review schema.
  const isProd = process.env.VERCEL_ENV === "production";
  const real = TESTIMONIALS;
  const isSample = real.length === 0 && !isProd && SAMPLE_TESTIMONIALS.length > 0;
  const items = real.length ? real : isSample ? SAMPLE_TESTIMONIALS : [];
  const agg = real.length ? aggregateRating(real) : null;
  const hasReviews = items.length > 0;

  return (
    <section id="social-proof" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sd-reveal" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...MM, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: isSample ? TH.amberDeep : TH.sageDeep, marginBottom: 12 }}>
            {isSample ? "Preview · example layout" : real.length ? "From our members" : "Trust, earned not claimed"}
          </div>
          <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.05, color: TH.ink, margin: 0 }}>
            {isSample ? (
              <>This is how <span style={{ ...SI, color: TH.sageDeep }}>reviews will look</span>.</>
            ) : real.length ? (
              <>What members <span style={{ ...SI, color: TH.sageDeep }}>actually say</span>.</>
            ) : (
              <>Real reviews, <span style={{ ...SI, color: TH.sageDeep }}>when they're real</span>.</>
            )}
          </h2>
          {real.length && agg ? (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 10, color: TH.inkSoft, fontSize: 15 }}>
              <Stars rating={agg.ratingValue} />
              <span><strong style={{ color: TH.ink }}>{agg.ratingValue}</strong> from {agg.reviewCount} verified {agg.reviewCount === 1 ? "member" : "members"}</span>
            </div>
          ) : isSample ? (
            <p style={{ maxWidth: 650, margin: "16px auto 0", fontSize: 15.5, lineHeight: 1.6, color: TH.inkSoft }}>
              These are <strong style={{ color: TH.amberDeep }}>example cards</strong> so you can see the layout. They appear only on preview builds, never on the live site, and carry no rating schema. Real member reviews replace them automatically once you add even one.
            </p>
          ) : (
            <p style={{ maxWidth: 620, margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6, color: TH.inkSoft }}>
              We launched recently, and we'd rather show you nothing than fake it. As our founding members share results, their words land here, unedited. Until then, here's what you can verify yourself.
            </p>
          )}
        </div>

        {hasReviews ? (
          <div className="sd-reveal" style={{ display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 18 }}>
            {items.map((t, i) => <Card key={`${t.name}-${i}`} t={t} />)}
          </div>
        ) : (
          <div className="sd-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {PILLARS.map((p) => (
              <div key={p.label} style={{
                background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18,
                padding: "20px 22px", display: "flex", alignItems: "baseline", gap: 16,
              }}>
                <span style={{ ...D, fontSize: 30, lineHeight: 1, color: TH.sageDeep, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{p.stat}</span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: TH.inkSoft }}>{p.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review schema ONLY when real reviews exist (never fabricate review markup). */}
      {hasReviews && agg ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "SuppDoc Premium",
              provider: { "@id": "https://www.suppdoc.io/#org" },
              aggregateRating: { "@type": "AggregateRating", ratingValue: agg.ratingValue, reviewCount: agg.reviewCount, bestRating: 5 },
              review: real.filter((t) => typeof t.rating === "number").map((t) => ({
                "@type": "Review",
                reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
                author: { "@type": "Person", name: t.name },
                reviewBody: t.quote,
              })),
            }),
          }}
        />
      ) : null}
    </section>
  );
}
