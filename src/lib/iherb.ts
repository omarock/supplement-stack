/**
 * iHerb Affiliate Configuration
 *
 * To change your rewards code:
 *   1. Sign up for free at https://www.iherb.com/info/rewards
 *   2. Get your unique rewards code (typically 5-8 alphanumeric characters, e.g. ABC1234)
 *   3. Replace the value of IHERB_REWARDS_CODE below
 *
 * Every product link in the app will automatically use the new code.
 * iHerb pays you when someone buys after clicking your link.
 */

export const IHERB_REWARDS_CODE = "PHYLA";

/**
 * Build an iHerb affiliate link from a search query.
 * The user lands on a curated results page they can browse through.
 */
export function iherbLink(searchQuery: string): string {
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.iherb.com/search?kw=${encoded}&rcode=${IHERB_REWARDS_CODE}`;
}

/**
 * Build an iHerb affiliate link to a specific product page.
 */
export function iherbProductLink(productPath: string): string {
  const separator = productPath.includes("?") ? "&" : "?";
  return `https://www.iherb.com${productPath}${separator}rcode=${IHERB_REWARDS_CODE}`;
}

/**
 * The homepage / general affiliate link.
 */
export const IHERB_HOME = `https://www.iherb.com/?rcode=${IHERB_REWARDS_CODE}`;
