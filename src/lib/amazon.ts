/**
 * Amazon Associates Affiliate Configuration
 *
 * Setup steps:
 *   1. Apply at https://affiliate-program.amazon.com (approval takes a few days)
 *   2. Once approved, you'll be given a tracking ID like "suppdoc-20"
 *   3. Set NEXT_PUBLIC_AMAZON_AFFILIATE_TAG in Vercel:
 *        NEXT_PUBLIC_AMAZON_AFFILIATE_TAG = suppdoc-20
 *   4. Redeploy. Amazon buy-buttons will appear automatically wherever amazonEnabled() is true.
 *
 * Until the env var is set, Amazon buttons stay hidden, keeping iHerb as the only visible affiliate.
 */

export const AMAZON_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "";

/**
 * Returns true once an Amazon Associates tag is configured.
 * Components can use this to decide whether to render Amazon buy-buttons.
 */
export function amazonEnabled(): boolean {
  return AMAZON_AFFILIATE_TAG.length > 0;
}

/**
 * Build an Amazon search URL with the affiliate tag appended.
 * Falls back to a tag-less URL if no tag is configured (no commission but still works).
 */
export function amazonLink(searchQuery: string): string {
  const encoded = encodeURIComponent(searchQuery);
  const tag = AMAZON_AFFILIATE_TAG ? `&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}` : "";
  return `https://www.amazon.com/s?k=${encoded}${tag}`;
}

/**
 * Build an Amazon product link from an ASIN (10-char product ID).
 */
export function amazonProductLink(asin: string): string {
  const tag = AMAZON_AFFILIATE_TAG ? `?tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}` : "";
  return `https://www.amazon.com/dp/${asin}${tag}`;
}
