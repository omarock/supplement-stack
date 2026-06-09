import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Third-party-tested supplement picks from suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "Recommended product",
    title: "Third-party-tested picks.",
    subtitle: "We don't sell our own pills. Compare brands, doses and prices, then buy direct.",
  });
}
