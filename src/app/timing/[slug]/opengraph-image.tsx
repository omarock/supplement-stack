import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "When to take your supplements, from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogResponse({
    eyebrow: "When to take",
    title: prettifySlug(slug),
    subtitle: "Morning, pre-train or evening, and the reason behind the timing.",
  });
}
