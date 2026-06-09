import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Supplement timing guides from suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "Timing",
    title: "When to take what.",
    subtitle: "Get the timing right so each supplement actually does its job.",
  });
}
