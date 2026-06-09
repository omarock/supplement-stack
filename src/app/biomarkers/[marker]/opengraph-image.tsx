import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Match supplements to your biomarker, from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ marker: string }> }) {
  const { marker } = await params;
  return ogResponse({
    eyebrow: "Biomarker",
    title: prettifySlug(marker),
    subtitle: "Which supplements move this marker, and the evidence behind each.",
  });
}
