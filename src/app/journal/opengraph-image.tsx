import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The suppdoc.io journal, evidence-led supplement reading";

export default async function Image() {
  return ogResponse({
    eyebrow: "Journal",
    title: "Evidence-led reading.",
    subtitle: "Clear, cited writing on what works in supplements, and what to skip.",
  });
}
