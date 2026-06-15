import type { Metadata } from "next";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { getProducts, productImage } from "@/lib/products";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CatalogueClient, { CatalogueItem } from "./CatalogueClient";

const SITE = "https://www.suppdoc.io";

export const metadata: Metadata = {
  title: "The Supplement Catalogue, suppdoc.io",
  description: `Browse every supplement suppdoc recommends in one place — ${SUPPLEMENT_DB.length}+ ingredients, each graded by evidence, with real product photos, prices, and where to buy. Filter by your goal.`,
  keywords:
    "supplement catalogue, buy supplements, best supplement brands, supplement shop, vitamins, minerals, omega-3, magnesium, creatine, ashwagandha, evidence-based supplements",
  alternates: { canonical: "/catalogue" },
  openGraph: {
    title: "The Supplement Catalogue, suppdoc.io",
    description:
      "Every supplement we recommend, in one place — graded by evidence, with prices and where to buy. Filter by your goal.",
    url: `${SITE}/catalogue`,
    type: "website",
  },
};

function buildItems(): CatalogueItem[] {
  const items: CatalogueItem[] = [];
  for (const s of SUPPLEMENT_DB) {
    const products = getProducts(s.id);
    // Prefer the first option that has a REAL photo, so the catalogue shows real
    // product images instead of mockups wherever the data allows. Falls back to
    // the primary (bestseller) when no option has a photo.
    const product = products.find((p) => productImage(p)) ?? products[0] ?? null;
    const image = product ? productImage(product) : undefined;
    const buyUrl = product
      ? product.productPath
        ? iherbProductLink(product.productPath)
        : iherbLink(product.searchQuery ?? s.iherbSearch)
      : iherbLink(s.iherbSearch);
    const amazonUrl = product?.amazonAsin
      ? amazonProductLink(product.amazonAsin)
      : amazonLink([product?.brand, s.name].filter(Boolean).join(" "));
    items.push({
      id: s.id,
      name: s.name,
      purpose: s.purpose,
      evidence: s.evidence,
      category: s.category ?? "specialty",
      price: product?.approxPrice ?? s.monthlyCost,
      brand: product?.brand ?? s.brand,
      size: product?.size,
      productName: product?.productName ?? s.name,
      rating: product?.rating ?? 0,
      image,
      hue: s.hue,
      badge: product?.badge,
      vegan: s.vegan,
      tags: s.tags,
      buyUrl,
      amazonUrl,
      href: `/products/${s.id}`,
      altHref: `/ingredients/${s.id}`,
    });
  }
  return items;
}

export default function CataloguePage() {
  const items = buildItems();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "suppdoc supplement catalogue",
    description: "Every supplement suppdoc recommends, graded by evidence.",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 100).map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE}${it.href}`,
    })),
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main-content">
        <CatalogueClient items={items} amazonOn={amazonEnabled()} />
      </main>
      <SiteFooter />
    </div>
  );
}
