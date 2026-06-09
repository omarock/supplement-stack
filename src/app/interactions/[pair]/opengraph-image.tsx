import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Supplement interaction check from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  return ogResponse({
    eyebrow: "Interaction check",
    title: prettifySlug(pair),
    subtitle: "Safe together, or keep them apart? What the evidence says.",
  });
}
