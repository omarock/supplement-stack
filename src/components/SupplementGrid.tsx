"use client";

import { useEffect, useState } from "react";
import type { Supplement } from "@/lib/supplements";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { getProducts, getPrimaryProduct, type ProductOption } from "@/lib/products";
import { getProductImage } from "@/lib/productImages";
import { trackClick } from "@/lib/track";

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

// ─── Branded fallback card (shown if image fails to load) ───────────────────
function BrandedFallback({ brand, name, bg, ink, height }: {
  brand: string; name: string; bg: string; ink: string; height: number;
}) {
  const parts = brand.split(" ");
  return (
    <div style={{
      background: bg, borderRadius: 12, height,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "14px 16px", border: `1px solid ${ink}10`,
    }}>
      <div style={{ fontSize: 9, ...MM, color: ink, opacity: 0.7, letterSpacing: "0.15em" }}>
        VERIFIED · iHerb
      </div>
      <div style={{ ...D, fontSize: 26, lineHeight: 0.95, color: ink, letterSpacing: "-0.02em" }}>
        {parts.length === 1 ? brand : (
          <>
            <div>{parts[0]}</div>
            <div style={{ fontSize: 18 }}>{parts.slice(1).join(" ")}</div>
          </>
        )}
      </div>
      <div style={{ fontSize: 10, color: ink, opacity: 0.8, fontWeight: 500, lineHeight: 1.3 }}>
        {name}
      </div>
    </div>
  );
}

// ─── Real product image with brand overlay + onError fallback ───────────────
function ProductImage({ supplementId, option, brandIndex = 0, height = 170, showBrandStrip = true }: {
  supplementId: string; option: ProductOption; brandIndex?: number;
  height?: number; showBrandStrip?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = option.imageUrl ?? getProductImage(supplementId, brandIndex);

  if (failed) {
    return (
      <BrandedFallback
        brand={option.brand} name={option.productName}
        bg={option.brandBg} ink={option.brandInk} height={height}
      />
    );
  }

  return (
    <div style={{
      position: "relative", height, borderRadius: 12, overflow: "hidden",
      background: `linear-gradient(180deg, ${option.brandBg}, ${th.bg})`,
      border: `1px solid ${th.line}`,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${option.brand} ${option.productName}`}
        onError={() => setFailed(true)}
        loading="lazy"
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          display: "block",
        }}
      />
      {showBrandStrip && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 12px",
          background: "linear-gradient(0deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 70%, transparent 100%)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              ...D, fontSize: 13, color: th.ink, letterSpacing: "-0.01em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {option.brand}
            </div>
            <div style={{
              fontSize: 10, color: th.inkMute, fontWeight: 500,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {option.size}
            </div>
          </div>
          <div style={{
            fontSize: 9, ...MM, color: th.sage, letterSpacing: "0.1em",
            padding: "3px 7px", borderRadius: 6,
            background: th.sageGlow, flexShrink: 0,
          }}>
            iHERB
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
  const [active, setActive] = useState<Supplement | null>(null);
  const totalCost = supplements.reduce((s, x) => s + x.monthlyCost, 0);

  return (
    <section>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 18, flexWrap: "wrap", gap: 10,
      }}>
        {title && (
          <h2 style={{ ...D, fontSize: 28, margin: 0, letterSpacing: "-0.02em", color: th.ink }}>
            {title}
          </h2>
        )}
        {showTotalCost && (
          <span style={{ fontSize: 13, color: th.inkMute, ...MM }}>
            ~${totalCost}/mo · {supplements.length} supplements · via iHerb
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {supplements.map((s, i) => {
          const allProducts = getProducts(s.id);
          const productCount = allProducts.length;
          // Always prefer NOW Foods variant for the main card per user direction.
          const nowIdx = allProducts.findIndex(p => p.brand.toLowerCase().includes("now"));
          const display = nowIdx >= 0 ? allProducts[nowIdx] : getPrimaryProduct(s.id);
          const brandIndex = nowIdx >= 0 ? nowIdx : 0;
          return (
            <div key={s.id} style={{
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
              padding: 18, display: "flex", flexDirection: "column", gap: 14,
              boxShadow: `0 2px 6px rgba(10,37,64,0.04)`,
              animation: `sd-rise .5s ${i * 0.05}s ease-out both`,
            }}>
              <div style={{ position: "relative" }}>
                {display ? (
                  <ProductImage supplementId={s.id} option={display} brandIndex={brandIndex} height={180} />
                ) : (
                  <div style={{
                    background: th.bgWarm, borderRadius: 12, height: 180,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: th.inkMute, fontSize: 12, ...MM,
                  }}>{s.brand.toUpperCase()}</div>
                )}
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  padding: "4px 10px", borderRadius: 999,
                  background: `${TIMING_COLOR[s.timing]}e6`, color: "white",
                  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 5,
                  boxShadow: `0 4px 10px ${TIMING_COLOR[s.timing]}55`,
                }}>
                  <span>{TIMING_GLYPH[s.timing]}</span>{TIMING_LABEL[s.timing]}
                </div>
              </div>

              <div>
                <h3 style={{ ...D, fontSize: 20, margin: 0, letterSpacing: "-0.02em", color: th.ink, lineHeight: 1.2 }}>
                  {s.name}
                </h3>
                <div style={{ fontSize: 12, color: th.inkMute, ...MM, marginTop: 4 }}>
                  {s.dose} · {s.purpose}
                </div>
              </div>

              <p style={{ fontSize: 13, color: th.inkSoft, lineHeight: 1.55, margin: 0 }}>{s.why}</p>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: 11, color: th.sage, ...MM, letterSpacing: "0.08em",
                }}>
                  <span>{s.evidence.toUpperCase()} EVIDENCE</span>
                  <span style={{ color: th.inkMute }}>~${s.monthlyCost}/MO</span>
                </div>
                <button
                  onClick={() => setActive(s)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 12,
                    background: th.ink, color: "#ffffff", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 500,
                    fontFamily: '"Inter", system-ui, sans-serif',
                    boxShadow: `0 4px 14px rgba(10,37,64,0.18)`,
                  }}
                >
                  {productCount > 0 ? `Choose product · ${productCount} options` : "Find on iHerb"}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {active && (
        <ProductModal
          supp={active}
          options={getProducts(active.id)}
          source={source}
          onClose={() => setActive(null)}
        />
      )}
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
