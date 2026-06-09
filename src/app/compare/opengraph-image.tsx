import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Compare supplements head to head, from suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "Compare",
    title: "Which form should you buy?",
    subtitle: "Head-to-head on evidence, dose and price, with a clear recommendation.",
  });
}
