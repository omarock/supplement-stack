/**
 * Product image library.
 *
 * Each supplement category maps to a curated set of supplement-bottle photos.
 * We rotate through them per product so different brands look visually distinct.
 *
 * Strategy:
 *  - Default: Unsplash photos of supplement bottles (reliable CDN, no key needed).
 *  - Override: If a product has `imageUrl` set in products.ts, that wins.
 *  - Fallback: If the image fails to load (404, blocked), the component shows
 *    a branded text card.
 *
 * To swap to real iHerb product images later:
 *   1. Find the iHerb product page → right-click main image → "Copy image address"
 *   2. URL will look like: https://s3.images-iherb.com/now/now01006/y/13.jpg
 *   3. Set imageUrl on that product in products.ts
 */

const W = 400; // image width
const Q = 80;  // image quality

// Curated stable Unsplash photos of supplement / vitamin bottles.
// Each entry is `unsplash-photo-id` — we add the size + format params at use time.
const PHOTOS = {
  // White/light bottles — clean clinical look
  whitePillBottle:      "1584308666744-24d5c474f2ae",
  whiteCapsulesBottle:  "1550572017-edd951b55104",
  bottleWithCapsules:   "1607619056574-7b8d3ee536b2",
  // Amber / brown bottles — vitamins, oils
  amberBottle:          "1559757148-5c350d0d3c56",
  amberSupplements:     "1631549916768-4119b2e5f926",
  // Capsules / pills close-ups
  capsulesCloseup:      "1471864190281-a93a3070b6de",
  pillsAndBottle:       "1576073719676-aa95576db207",
  // Powders / scoops (for creatine, collagen)
  powderJar:            "1607619662634-3ac02bc6fdfe",
  // Gels / softgels (for omega-3)
  omegaSoftgels:        "1601612628452-9e99ced43524",
  // Multi-pack / wellness
  wellnessPack:         "1556909114-f6e7ad7d3136",
} as const;

function url(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=${W}&q=${Q}&auto=format&fit=crop`;
}

/**
 * Map each supplement ID to its category-appropriate stock photo.
 */
const BY_SUPPLEMENT: Record<string, string> = {
  // Vitamins
  "d3k2":         url(PHOTOS.amberBottle),
  "vit-c":        url(PHOTOS.amberSupplements),
  "multivit":     url(PHOTOS.wellnessPack),
  // Omega-3 & fats
  "omega3":       url(PHOTOS.omegaSoftgels),
  "omega3-algae": url(PHOTOS.amberSupplements),
  // Minerals
  "mag-glycinate": url(PHOTOS.whiteCapsulesBottle),
  "iron":          url(PHOTOS.amberSupplements),
  "zinc":          url(PHOTOS.whitePillBottle),
  // Adaptogens & herbs
  "ashwagandha":  url(PHOTOS.amberBottle),
  "rhodiola":     url(PHOTOS.amberBottle),
  "lions-mane":   url(PHOTOS.capsulesCloseup),
  "l-theanine":   url(PHOTOS.whitePillBottle),
  "glycine":      url(PHOTOS.powderJar),
  "curcumin":     url(PHOTOS.amberSupplements),
  // B vitamins
  "b12":          url(PHOTOS.whitePillBottle),
  "b-complex":    url(PHOTOS.bottleWithCapsules),
  // Performance & recovery
  "creatine":     url(PHOTOS.powderJar),
  "collagen":     url(PHOTOS.powderJar),
  "glucosamine":  url(PHOTOS.whiteCapsulesBottle),
  // Immune & gut
  "elderberry":   url(PHOTOS.amberSupplements),
  "probiotic":    url(PHOTOS.pillsAndBottle),
  "digestive-enzymes": url(PHOTOS.bottleWithCapsules),
  // Beauty & longevity
  "biotin":       url(PHOTOS.whitePillBottle),
  "coq10":        url(PHOTOS.omegaSoftgels),
};

/**
 * Return a product image URL for the given supplement ID.
 * Falls back to a generic supplement bottle image if no specific mapping exists.
 */
export function getSupplementImage(supplementId: string): string {
  return BY_SUPPLEMENT[supplementId] ?? url(PHOTOS.wellnessPack);
}

/**
 * Get image URL for a specific product, optionally varied by brand to look distinct.
 * Currently we use the supplement-level photo (same image across brands of the same supplement).
 * Future: replace with brand-specific iHerb URLs when known.
 */
export function getProductImage(supplementId: string, _brand?: string): string {
  return getSupplementImage(supplementId);
}
