// Server component (static, zero hydration), matching the homepage model.
// Two states:
//   • TESTIMONIALS has real entries  -> premium testimonial wall + AggregateRating schema
//   • TESTIMONIALS empty (today)      -> honest, premium "founding phase" panel with
//                                        verifiable trust signals (no fabricated reviews)
import { TH, D, MM, SI } from "@/lib/theme";
import { TESTIMONIALS, aggregateRating, type Testimonial } from "@/lib/social-proof";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS } from "@/lib/interactions";
import { RESEARCH_STUDY_TOTAL } from "@/lib/research-volume";

const fmt = (n: number) => n.toLocaleString("en-US");

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
      margin: 0, position: "relative", overflow: "hidden",
      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 22,
      padding: "26px 24px 22px", display: "flex", flexDirection: "column", gap: 16, height: "100%",
      boxShadow: `0 20px 44px -26px color-mix(in srgb, ${TH.ink} 30%, transparent)`,
    }}>
      {/* Decorative quote mark */}
      <span aria-hidden style={{
        position: "absolute", top: -8, right: 16, ...SI, fontSize: 92, lineHeight: 1,
        color: `color-mix(in srgb, ${TH.sage} 16%, transparent)`, pointerEvents: "none", userSelect: "none",
      }}>”</span>

      {typeof t.rating === "number" ? <Stars rating={t.rating} /> : null}

      <blockquote style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: TH.ink, position: "relative", zIndex: 1 }}>
        {t.quote}
      </blockquote>

      <figcaption style={{
        display: "flex", alignItems: "center", gap: 12, marginTop: "auto",
        paddingTop: 16, borderTop: `1px solid ${TH.edge}`,
      }}>
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} width={42} height={42} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span aria-hidden style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${TH.sage}, ${TH.sageDeep})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 0 3px color-mix(in srgb, ${TH.sage} 18%, transparent)`,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c0-3.9 3.4-6.2 7.5-6.2s7.5 2.3 7.5 6.2z" />
            </svg>
          </span>
        )}
        <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ ...D, fontSize: 14.5, color: TH.ink, lineHeight: 1.1 }}>{t.name}</span>
          {t.context ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: TH.inkSoft }}>
              <svg width="11" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 22s7-5.6 7-11.5A7 7 0 0 0 5 10.5C5 16.4 12 22 12 22z" stroke={TH.sageDeep} strokeWidth="2" />
                <circle cx="12" cy="10.5" r="2.4" fill={TH.sageDeep} />
              </svg>
              {t.context}
            </span>
          ) : null}
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
  const items = TESTIMONIALS;
  const agg = aggregateRating(items);
  const hasReviews = items.length > 0;

  return (
    <section id="social-proof" style={{ padding: "var(--section-pad-y) var(--section-pad-x)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sd-reveal" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...MM, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: TH.sageDeep, marginBottom: 12 }}>
            {hasReviews ? "From early users" : "Trust, earned not claimed"}
          </div>
          <h2 style={{ ...D, fontSize: "var(--section-h2)", letterSpacing: "-0.03em", lineHeight: 1.05, color: TH.ink, margin: 0 }}>
            {hasReviews ? (
              <>What <span style={{ ...SI, color: TH.sageDeep }}>early users</span> say.</>
            ) : (
              <>Real reviews, <span style={{ ...SI, color: TH.sageDeep }}>when they're real</span>.</>
            )}
          </h2>
          {hasReviews && agg ? (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 10, color: TH.inkSoft, fontSize: 15 }}>
              <Stars rating={agg.ratingValue} />
              <span><strong style={{ color: TH.ink }}>{agg.ratingValue}</strong> from {agg.reviewCount} {agg.reviewCount === 1 ? "person" : "people"}</span>
            </div>
          ) : hasReviews ? (
            <p style={{ maxWidth: 620, margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6, color: TH.inkSoft }}>
              Early feedback from people using SuppDoc, in their words.
            </p>
          ) : (
            <p style={{ maxWidth: 620, margin: "16px auto 0", fontSize: 16.5, lineHeight: 1.6, color: TH.inkSoft }}>
              We launched recently, and we'd rather show you nothing than fake it. As our founding members share results, their words land here, unedited. Until then, here's what you can verify yourself.
            </p>
          )}
          {hasReviews ? (
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {["Evidence-graded", "No house brand", "Every claim links to its source"].map((c) => (
                <span key={c} style={{
                  ...MM, fontSize: 11, letterSpacing: "0.03em", color: TH.sageDeep,
                  background: `color-mix(in srgb, ${TH.sage} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${TH.sage} 22%, transparent)`,
                  padding: "6px 13px", borderRadius: 999,
                }}>{c}</span>
              ))}
            </div>
          ) : null}
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
              review: items.filter((t) => typeof t.rating === "number").map((t) => ({
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
