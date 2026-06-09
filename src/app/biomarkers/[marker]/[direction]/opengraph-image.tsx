import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Move your biomarker in the right direction, from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ marker: string; direction: string }> }) {
  const { marker, direction } = await params;
  return ogResponse({
    eyebrow: `${prettifySlug(direction)} your`,
    title: prettifySlug(marker),
    subtitle: "Evidence-graded supplements matched to your lab result.",
  });
}
