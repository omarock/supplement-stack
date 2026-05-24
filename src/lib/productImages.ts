/**
 * Product image library.
 *
 * Each supplement category has 3 candidate photos. The component picks one
 * based on the brand's position so the 3 modal options visually differ.
 *
 * Override priority:
 *   1. product.imageUrl (specific iHerb CDN URL you can add manually)
 *   2. Brand-specific lookup (this file)
 *   3. Generic supplement bottle photo
 *
 * To swap in real iHerb images later, set imageUrl on a product in products.ts:
 *   imageUrl: "https://s3.images-iherb.com/now/now01006/y/13.jpg"
 */

const W = 500;
const Q = 80;

function u(id: string): string {
  return `https://images.unsplash.com/photo-${id}?w=${W}&q=${Q}&auto=format&fit=crop`;
}

// Curated stable Unsplash supplement-bottle photos
const PHOTOS = {
  // Amber / brown bottles (vitamins, oils)
  amber1:        "1559757148-5c350d0d3c56",
  amber2:        "1631549916768-4119b2e5f926",
  amber3:        "1607619056574-7b8d3ee536b2",
  // White / clinical bottles
  white1:        "1584308666744-24d5c474f2ae",
  white2:        "1550572017-edd951b55104",
  white3:        "1576073719676-aa95576db207",
  // Capsules / softgels close-up
  softgels1:     "1601612628452-9e99ced43524",
  softgels2:     "1471864190281-a93a3070b6de",
  // Powders / scoops
  powder1:       "1607619662634-3ac02bc6fdfe",
  powder2:       "1556909114-f6e7ad7d3136",
  // Generic wellness
  wellness1:     "1559757175-5700dde675bc",
  wellness2:     "1559757148-5c350d0d3c56",
} as const;

/**
 * For each supplement, 3 candidate photos so modal options look distinct.
 * Index 0 is the "primary" (used for the results card).
 */
const POOL: Record<string, [string, string, string]> = {
  // Vitamins
  "d3k2":         [u(PHOTOS.amber1),    u(PHOTOS.amber3),    u(PHOTOS.amber2)],
  "vit-c":        [u(PHOTOS.amber2),    u(PHOTOS.white1),    u(PHOTOS.amber3)],
  "multivit":     [u(PHOTOS.wellness1), u(PHOTOS.amber1),    u(PHOTOS.white3)],
  // Omega-3 & fats
  "omega3":       [u(PHOTOS.softgels1), u(PHOTOS.amber3),    u(PHOTOS.softgels2)],
  "omega3-algae": [u(PHOTOS.softgels1), u(PHOTOS.softgels2), u(PHOTOS.amber1)],
  // Minerals
  "mag-glycinate": [u(PHOTOS.white2), u(PHOTOS.white1), u(PHOTOS.white3)],
  "iron":          [u(PHOTOS.amber2), u(PHOTOS.amber1), u(PHOTOS.white1)],
  "zinc":          [u(PHOTOS.white1), u(PHOTOS.white2), u(PHOTOS.amber3)],
  // Adaptogens & herbs
  "ashwagandha":  [u(PHOTOS.amber1),    u(PHOTOS.amber2),    u(PHOTOS.amber3)],
  "rhodiola":     [u(PHOTOS.amber3),    u(PHOTOS.amber1),    u(PHOTOS.amber2)],
  "lions-mane":   [u(PHOTOS.softgels2), u(PHOTOS.amber2),    u(PHOTOS.white2)],
  "l-theanine":   [u(PHOTOS.white1),    u(PHOTOS.white2),    u(PHOTOS.white3)],
  "glycine":      [u(PHOTOS.powder1),   u(PHOTOS.powder2),   u(PHOTOS.white1)],
  "curcumin":     [u(PHOTOS.amber2),    u(PHOTOS.amber3),    u(PHOTOS.amber1)],
  // B vitamins
  "b12":          [u(PHOTOS.white1),    u(PHOTOS.amber1),    u(PHOTOS.white2)],
  "b-complex":    [u(PHOTOS.amber3),    u(PHOTOS.white1),    u(PHOTOS.amber1)],
  // Performance & recovery
  "creatine":     [u(PHOTOS.powder1),   u(PHOTOS.powder2),   u(PHOTOS.white3)],
  "collagen":     [u(PHOTOS.powder2),   u(PHOTOS.powder1),   u(PHOTOS.wellness1)],
  "glucosamine":  [u(PHOTOS.white2),    u(PHOTOS.white1),    u(PHOTOS.amber3)],
  // Immune & gut
  "elderberry":   [u(PHOTOS.amber2),    u(PHOTOS.amber3),    u(PHOTOS.amber1)],
  "probiotic":    [u(PHOTOS.white1),    u(PHOTOS.white3),    u(PHOTOS.white2)],
  "digestive-enzymes": [u(PHOTOS.amber3), u(PHOTOS.white2), u(PHOTOS.white1)],
  // Beauty & longevity
  "biotin":       [u(PHOTOS.white1),    u(PHOTOS.amber1),    u(PHOTOS.white3)],
  "coq10":        [u(PHOTOS.softgels1), u(PHOTOS.amber2),    u(PHOTOS.amber3)],
};

const FALLBACK = u(PHOTOS.wellness1);

/**
 * Get image URL for a specific product within a supplement category.
 * brandIndex: 0=primary, 1=second, 2=third option.
 */
export function getProductImage(supplementId: string, brandIndex: number = 0): string {
  const photos = POOL[supplementId];
  if (!photos) return FALLBACK;
  return photos[Math.min(brandIndex, 2)] ?? photos[0];
}

/**
 * Get the supplement category image (for cards without specific brand context).
 */
export function getSupplementImage(supplementId: string): string {
  return getProductImage(supplementId, 0);
}
