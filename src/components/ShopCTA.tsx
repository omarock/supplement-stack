/**
 * Reusable purchase CTA for any content page that is about an ingredient.
 * Shows the recommended product (real photo where curated) with a direct
 * "Buy on iHerb" affiliate link plus a link to the full ingredient guide, so
 * every content page (timing, biomarkers, symptoms, interactions) becomes a
 * path to the purchase. Server component, no client JS.
 */
import Link from "next/link";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { getPrimaryProduct, productImage, type ProductOption } from "@/lib/products";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import BottleMockup from "@/components/BottleMockup";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export default function ShopCTA({ supplementId, heading }: { supplementId: string; heading?: string }) {
  const supp = SUPPLEMENT_DB.find(s => s.id === supplementId);
  if (!supp) return null;
  const name = supp.name.split(" (")[0];
  const p: ProductOption = getPrimaryProduct(supp.id) ?? {
    brand: supp.brand, productName: name, size: supp.dose, approxPrice: supp.monthlyCost,
    rating: 4.7, reviewCount: 0, badge: "Bestseller", searchQuery: supp.iherbSearch,
    brandBg: "#fef3c7", brandInk: "#92400e",
  };
  const img = productImage(p);
  const href = p.productPath ? iherbProductLink(p.productPath) : iherbLink(p.searchQuery ?? supp.iherbSearch);
  const amazonHref = p.amazonAsin ? amazonProductLink(p.amazonAsin) : amazonLink(p.searchQuery ?? `${p.brand} ${p.productName}`);

  return (
    <div>
      {heading && (
        <div style={{ fontSize: 12.5, color: TH.sageDeep, fontWeight: 600, marginBottom: 10 }}>{heading}</div>
      )}
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", boxShadow: `0 10px 28px -20px color-mix(in srgb, ${TH.ink} 21%, transparent)` }}>
        <div style={{ width: 88, height: 88, flexShrink: 0, borderRadius: 12, background: "#fff", border: `1px solid ${TH.edge}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={`${p.brand} ${p.productName}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
          ) : (
            <BottleMockup option={p} height={84} showBackgroundScene={false} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 190 }}>
          <div style={{ ...D, fontSize: 11.5, color: TH.sageDeep, fontWeight: 600, marginBottom: 4 }}>Recommended</div>
          <div style={{ ...D, fontSize: 16, color: TH.ink, lineHeight: 1.25 }}>{p.brand}, {p.productName}</div>
          <div style={{ fontSize: 13, color: TH.inkSoft, marginTop: 3 }}>{p.size} · ~${p.approxPrice} · ★ {p.rating.toFixed(1)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 156 }}>
          <a href={href} target="_blank" rel="noopener noreferrer sponsored" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 20px", borderRadius: 12, background: TH.inkBg, color: "#fff", textDecoration: "none",
            ...D, fontSize: 14, boxShadow: `0 8px 20px -6px color-mix(in srgb, ${TH.ink} 33%, transparent)`,
          }}>Buy on iHerb &rarr;</a>
          {amazonEnabled() && (
            <a href={amazonHref} target="_blank" rel="noopener noreferrer sponsored" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 20px", borderRadius: 12, background: "#fff", color: TH.inkBg,
              border: `1px solid ${TH.edge}`, textDecoration: "none", ...D, fontSize: 14,
            }}>Buy on Amazon &rarr;</a>
          )}
          <Link href={`/ingredients/${supp.id}`} style={{ textAlign: "center", fontSize: 13, color: TH.sageDeep, fontWeight: 600, textDecoration: "none" }}>
            See the full {name} guide &rarr;
          </Link>
        </div>
      </div>
      <p style={{ fontSize: 11, color: TH.muted, margin: "8px 2px 0", lineHeight: 1.5 }}>
        suppdoc.io is an affiliate. Links may earn us a commission at no extra cost to you. We don&apos;t sell our own supplements.
      </p>
    </div>
  );
}
