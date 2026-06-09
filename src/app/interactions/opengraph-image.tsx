import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Supplement interaction checker from suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "Interactions",
    title: "Check before you stack.",
    subtitle: "Spot the supplement and medication interactions worth knowing about.",
  });
}
