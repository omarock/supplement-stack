"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Supplement } from "@/lib/supplements";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { getProducts, getPrimaryProduct, type ProductOption } from "@/lib/products";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import { trackClick } from "@/lib/track";
import BottleMockup from "@/components/BottleMockup";

// ─── Theme (synced with global suppdoc.io palette) ──────────────────────────
const th = {
  bg: "#f6f5f1", bgWarm: "#f0eee8", paper: "#ffffff",
  ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", sageGlow: "rgba(91,163,115,0.10)",
  amber: "#e8a04a", coral: "#ff8b6b", lavender: "#a78bfa",
  line: "rgba(10,37,64,0.08)",
};
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

const TIMING_LABEL: Record<Supplement["timing"], string> = {
  morning: "Morning", midday: "Midday", "pre-train": "Pre-train", evening: "Evening",
};
const TIMING_GLYPH: Record<Supplement["timing"], string> = {
  morning: "☀", midday: "✦", "pre-train": "↺", evening: "☾",
};
const TIMING_COLOR: Record<Supplement["timing"], string> = {
  morning: th.amber, midday: "#a87a52", "pre-train": th.sage, evening: th.lavender,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function productHref(p: ProductOption): string {
  if (p.productPath) return iherbProductLink(p.productPath);
  return iherbLink(p.searchQuery ?? `${p.brand} ${p.productName}`);
}

// Insert Cloudinary white-pad transformation into iHerb CDN URLs so all
// bottle images sit on a clean white background regardless of the original
// photo's lifestyle props.
function cleanIherbImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  if (!url.includes("cloudinary.images-iherb.com")) return url;
  // Insert `c_pad,b_white,w_500,h_500` (pad to 500x500 with white bg) right after the existing transforms
  return url.replace(
    /\/image\/upload\/([^/]+)\/images\//,
    "/image/upload/$1,c_pad,b_white,w_500,h_500/images/"
  );
}

// ─── Product visual: clean Amazon-style image area ──────────────────────────
function ProductImage({ option, height = 280, showBrandStrip = false }: {
  option: ProductOption; supplementId?: string; brandIndex?: number;
  height?: number; showBrandStrip?: boolean;
}) {
  const useImage = !!option.imageUrl;
  const imgSrc = cleanIherbImageUrl(option.imageUrl);

  return (
    <div style={{
      position: "relative", height, borderRadius: 14, overflow: "hidden",
      background: "#ffffff",
      border: `1px solid #e5e7eb`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {useImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={`${option.brand} ${option.productName} — ${option.size}`}
          loading="lazy"
          itemProp="image"
          style={{
            width: "100%", height: "100%",
            objectFit: "contain", objectPosition: "center",
            display: "block",
            padding: 16,
          }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <BottleMockup option={option} height={height - 32} showBackgroundScene={false} />
        </div>
      )}

      {/* Optional brand strip — off by default for cleaner Amazon-style cards */}
      {showBrandStrip && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "8px 12px",
          background: "linear-gradient(0deg, rgba(255,255,255,0.95) 0%, transparent 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <div style={{
            ...D, fontSize: 12, color: th.ink, letterSpacing: "-0.01em",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {option.brand}
          </div>
        </div>
      )}
    </div>
  );
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: th.inkSoft }}>
      <span style={{ color: th.amber, fontSize: 13 }}>★</span>
      <span style={{ fontWeight: 600, color: th.ink }}>{rating.toFixed(1)}</span>
      <span style={{ color: th.inkMute }}>· {count.toLocaleString()} reviews</span>
    </div>
  );
}

// ─── Product card (inside modal) ─────────────────────────────────────────────
function ProductCard({ option, supplement, source, brandIndex }: {
  option: ProductOption; supplement: Supplement; source: string; brandIndex: number;
}) {
  const badgeColors: Record<ProductOption["badge"], { bg: string; ink: string }> = {
    "Bestseller":    { bg: "#fef3c7", ink: "#854d0e" },
    "Editor's Pick": { bg: "#d1fae5", ink: "#065f46" },
    "Best Value":    { bg: "#dbeafe", ink: "#1e40af" },
    "Premium":       { bg: "#ede9fe", ink: "#5b21b6" },
    "Vegan":         { bg: "#d1fae5", ink: "#065f46" },
  };
  const bc = badgeColors[option.badge];

  return (
    <div style={{
      background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
      padding: 16, display: "flex", flexDirection: "column", gap: 12,
      boxShadow: `0 2px 6px rgba(10,37,64,0.04)`,
    }}>
      <ProductImage supplementId={supplement.id} option={option} brandIndex={brandIndex} height={180} />

      <div style={{
        alignSelf: "flex-start", padding: "3px 10px", borderRadius: 999,
        background: bc.bg, color: bc.ink,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      }}>
        {option.badge}
      </div>
      <div>
        <div style={{ ...D, fontSize: 18, color: th.ink, lineHeight: 1.2, letterSpacing: "-0.015em" }}>
          {option.productName}
        </div>
        <div style={{ fontSize: 12, color: th.inkMute, marginTop: 3 }}>
          by {option.brand} · {option.size}
        </div>
      </div>
      <Stars rating={option.rating} count={option.reviewCount} />
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ ...D, fontSize: 26, color: th.ink, letterSpacing: "-0.02em" }}>
          ${option.approxPrice.toFixed(2)}
          <span style={{ fontSize: 12, color: th.inkMute, ...MM, marginLeft: 6, fontWeight: 400 }}>approx</span>
        </div>
        <a
          href={productHref(option)}
          target="_blank" rel="noopener noreferrer sponsored"
          onClick={() => { trackClick(supplement, option, source).catch(() => {}); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            background: th.ink, color: "#ffffff", textDecoration: "none",
            fontSize: 14, fontWeight: 500,
            boxShadow: `0 4px 14px rgba(10,37,64,0.18)`,
          }}
        >
          Buy on iHerb
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Product modal ───────────────────────────────────────────────────────────
function ProductModal({ supp, options, source, onClose }: {
  supp: Supplement; options: ProductOption[]; source: string; onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(10,37,64,0.55)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px",
        animation: "sd-fade-in .25s ease-out",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: th.bg, borderRadius: 24, padding: 32,
          maxWidth: 1080, width: "100%",
          boxShadow: "0 30px 80px rgba(10,37,64,0.3)",
          animation: "sd-rise .35s cubic-bezier(.4,0,.2,1)",
          position: "relative",
        }}
      >
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 18, right: 18,
          width: 36, height: 36, borderRadius: 999,
          background: th.paper, border: `1px solid ${th.line}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: th.ink,
        }}>×</button>
        <div style={{ marginBottom: 22, maxWidth: 720 }}>
          <div style={{ fontSize: 12, color: th.sage, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 10 }}>
            CHOOSE YOUR PRODUCT
          </div>
          <h2 style={{ ...D, fontSize: 36, color: th.ink, margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            {supp.name}
          </h2>
          <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Three top-rated options on iHerb. All include your affiliate code.
            <br />
            <span style={{ color: th.inkMute, fontSize: 13 }}>Target dose: {supp.dose} · {supp.purpose}</span>
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {options.map((opt, i) => (
            <ProductCard
              key={opt.brand + opt.productName}
              option={opt}
              supplement={supp}
              source={source}
              brandIndex={i}
            />
          ))}
        </div>
        <p style={{ fontSize: 11, color: th.inkMute, textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
          Prices are approximate and may vary on iHerb. We may earn a commission on qualifying purchases — at no extra cost to you.
        </p>
      </div>
    </div>
  );
}

// ─── Public component: the supplement grid ──────────────────────────────────
export interface SupplementGridProps {
  supplements: Supplement[];
  source: string;
  showTotalCost?: boolean;
  title?: string;
}

export default function SupplementGrid({ supplements, source, showTotalCost, title }: SupplementGridProps) {
  const totalCost = supplements.reduce((s, x) => s + x.monthlyCost, 0);

  return (
    <section>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 22, flexWrap: "wrap", gap: 10,
      }}>
        {title && (
          <h2 style={{ ...D, fontSize: 32, margin: 0, letterSpacing: "-0.025em", color: th.ink }}>
            {title}
          </h2>
        )}
        {showTotalCost && (
          <span style={{ fontSize: 13, color: th.inkMute, ...MM, fontWeight: 500 }}>
            ~${totalCost}/MO · {supplements.length} ITEMS · VIA IHERB
          </span>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        gap: 16,
      }}>
        {supplements.map((s, i) => {
          const bestseller = getPrimaryProduct(s.id);
          if (!bestseller) return null;
          const iherbHref = bestseller.productPath
            ? iherbProductLink(bestseller.productPath)
            : iherbLink(bestseller.searchQuery ?? `${bestseller.brand} ${bestseller.productName}`);
          const amazonHref = bestseller.amazonAsin
            ? amazonProductLink(bestseller.amazonAsin)
            : amazonLink(`${bestseller.brand} ${bestseller.productName}`);
          const showAmazon = amazonEnabled();

          // Tag chips: form + count tag
          const tagChips: { label: string }[] = [];
          if (bestseller.form) tagChips.push({ label: bestseller.form });
          if (bestseller.servingsPerContainer) {
            tagChips.push({ label: `${bestseller.servingsPerContainer} Count` });
          } else if (bestseller.size) {
            tagChips.push({ label: bestseller.size.replace(/(\d+)\s*(capsules?|softgels?|tablets?|servings?|veg.*?capsules?)/i, "$1 Count") });
          }
          // 1 certification chip if available (the most credible)
          const credibleCert = (bestseller.certifications ?? []).find(c =>
            /USP|NSF|Informed|Organic|GMP/i.test(c)
          ) ?? bestseller.certifications?.[0];
          if (credibleCert) tagChips.push({ label: credibleCert });

          const formattedReviews = bestseller.reviewCount >= 1000
            ? `${(bestseller.reviewCount / 1000).toFixed(bestseller.reviewCount >= 10000 ? 0 : 1)}K`
            : bestseller.reviewCount.toString();

          // Schema.org Product description for SEO
          const seoDescription = `${s.purpose}. ${s.why}`.slice(0, 200);

          return (
            <article
              key={s.id}
              itemScope
              itemType="https://schema.org/Product"
              style={{
                background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16,
                padding: 14, display: "flex", flexDirection: "column", gap: 10,
                boxShadow: `0 1px 3px rgba(10,37,64,0.04), 0 6px 16px rgba(10,37,64,0.04)`,
                animation: `sd-rise .5s ${i * 0.05}s ease-out both`,
                transition: "transform .25s ease, box-shadow .25s ease",
              }}
            >
              {/* SEO meta */}
              <meta itemProp="name" content={`${bestseller.brand} ${bestseller.productName}`} />
              <meta itemProp="description" content={seoDescription} />
              <meta itemProp="category" content={s.category ?? "Supplement"} />
              {bestseller.brand && (
                <span itemProp="brand" itemScope itemType="https://schema.org/Brand" style={{ display: "none" }}>
                  <meta itemProp="name" content={bestseller.brand} />
                </span>
              )}

              {/* Image area — pure white, Amazon-style, clickable → /products/[id] */}
              <Link
                href={`/products/${s.id}`}
                aria-label={`View ${bestseller.brand} ${bestseller.productName} details`}
                style={{ position: "relative", display: "block", textDecoration: "none" }}
              >
                <ProductImage option={bestseller} height={260} />
                {/* Timing badge floating top-right */}
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  padding: "5px 11px", borderRadius: 999,
                  background: `${TIMING_COLOR[s.timing]}f5`, color: "white",
                  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 5,
                  boxShadow: `0 4px 12px ${TIMING_COLOR[s.timing]}55`,
                  pointerEvents: "none",
                }}>
                  <span>{TIMING_GLYPH[s.timing]}</span>{TIMING_LABEL[s.timing]}
                </div>
              </Link>

              {/* Brand */}
              <div style={{
                fontSize: 14, color: th.ink, fontWeight: 700,
                marginTop: 2,
              }}>
                {bestseller.brand}
              </div>

              {/* Product description (multi-line, Amazon-style) */}
              <h3 style={{
                fontSize: 15, color: th.inkSoft, lineHeight: 1.45,
                margin: 0, fontWeight: 400,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: "calc(15px * 1.45 * 3)",
              }}>
                {bestseller.productName} — {s.purpose}
              </h3>

              {/* Tag chips */}
              {tagChips.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tagChips.slice(0, 3).map((t, idx) => (
                    <span key={idx} style={{
                      padding: "4px 10px", borderRadius: 6,
                      fontSize: 12, fontWeight: 400,
                      background: "#f3f4f6", color: "#374151",
                      whiteSpace: "nowrap",
                      border: "1px solid #e5e7eb",
                    }}>{t.label}</span>
                  ))}
                </div>
              )}

              {/* Rating + reviews + bought count (Amazon style) */}
              {bestseller.reviewCount > 0 && (
                <div
                  itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                  <meta itemProp="ratingValue" content={bestseller.rating.toString()} />
                  <meta itemProp="reviewCount" content={bestseller.reviewCount.toString()} />
                  <span style={{ color: "#ff9900", fontSize: 14, letterSpacing: "1px" }}>
                    {"★".repeat(Math.round(bestseller.rating))}
                    <span style={{ color: "#e5e7eb" }}>{"★".repeat(5 - Math.round(bestseller.rating))}</span>
                  </span>
                  <a
                    href={iherbHref} target="_blank" rel="noopener noreferrer sponsored"
                    style={{ color: "#0066c0", textDecoration: "none", fontSize: 13 }}
                  >({formattedReviews})</a>
                </div>
              )}
              {bestseller.reviewCount >= 1000 && (
                <div style={{ fontSize: 12, color: "#565959" }}>
                  <strong>{bestseller.reviewCount >= 10000 ? "10K+" : "1K+"}</strong> bought in past month
                </div>
              )}

              {/* Price — big like Amazon */}
              <div
                itemProp="offers" itemScope itemType="https://schema.org/Offer"
                style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}
              >
                <meta itemProp="price" content={bestseller.approxPrice.toString()} />
                <meta itemProp="priceCurrency" content="USD" />
                <meta itemProp="availability" content="https://schema.org/InStock" />
                <meta itemProp="url" content={iherbHref} />
                <span style={{ fontSize: 13, color: th.ink, fontWeight: 500 }}>$</span>
                <span style={{ fontSize: 26, color: th.ink, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {bestseller.approxPrice.toFixed(0)}
                </span>
                <span style={{ fontSize: 11, color: "#565959", marginLeft: 6 }}>~/month</span>
              </div>

              {/* Buy buttons — bigger touch targets for mobile (min 44px height) */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
                <a
                  href={iherbHref}
                  target="_blank" rel="noopener noreferrer sponsored"
                  onClick={() => { trackClick(s, bestseller, source).catch(() => {}); }}
                  aria-label={`Buy ${bestseller.brand} ${bestseller.productName} on iHerb`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 16px", borderRadius: 999,
                    background: th.ink, color: "#ffffff", textDecoration: "none",
                    fontSize: 14, fontWeight: 600,
                    fontFamily: '"Inter", system-ui, sans-serif',
                    boxShadow: `0 4px 14px rgba(10,37,64,0.18)`,
                    minHeight: 44,
                  }}
                >
                  Buy on iHerb
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
                {showAmazon && (
                  <a
                    href={amazonHref}
                    target="_blank" rel="noopener noreferrer sponsored"
                    aria-label={`Buy ${bestseller.brand} ${bestseller.productName} on Amazon`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "13px 16px", borderRadius: 999,
                      background: "#ffd814", color: "#0f1111", textDecoration: "none",
                      fontSize: 14, fontWeight: 600,
                      fontFamily: '"Inter", system-ui, sans-serif',
                      boxShadow: `0 4px 12px rgba(255,216,20,0.35)`,
                      border: "1px solid #fcd200",
                      minHeight: 44,
                    }}
                  >
                    Buy on Amazon
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </a>
                )}
                <Link
                  href={`/products/${s.id}`}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "10px 16px", borderRadius: 8,
                    background: "transparent", color: "#0066c0", textDecoration: "none",
                    fontSize: 13, fontWeight: 500,
                  }}
                >
                  View product details →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── Daily routine renderer (reusable) ───────────────────────────────────────
export function DailyRoutine({ supplements }: { supplements: Supplement[] }) {
  const byTiming: Record<string, Supplement[]> = { morning: [], midday: [], "pre-train": [], evening: [] };
  for (const s of supplements) byTiming[s.timing].push(s);
  const times: Record<string, string> = {
    morning: "07:30", midday: "13:00", "pre-train": "17:00", evening: "22:00",
  };
  return (
    <div style={{
      background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20, padding: 28,
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24,
    }}>
      {(["morning", "midday", "pre-train", "evening"] as const).map(slot => {
        const items = byTiming[slot];
        if (items.length === 0) return null;
        return (
          <div key={slot} style={{ borderLeft: `2px solid ${TIMING_COLOR[slot]}`, paddingLeft: 16 }}>
            <div style={{ fontSize: 11, ...MM, color: TIMING_COLOR[slot], letterSpacing: "0.06em", marginBottom: 8 }}>
              {times[slot]} · {TIMING_LABEL[slot].toUpperCase()}
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map(s => (
                <li key={s.id} style={{ fontSize: 13, color: th.ink, lineHeight: 1.4 }}>
                  <span style={{ color: th.inkSoft }}>·</span> {s.name}
                  <span style={{ color: th.inkMute, ...MM, fontSize: 11, marginLeft: 6 }}>{s.dose}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
