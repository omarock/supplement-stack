import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Evidence-led supplement reading from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogResponse({
    eyebrow: "From the journal",
    title: prettifySlug(slug),
    subtitle: "Evidence-led, no hype. From the team at suppdoc.io.",
  });
}
