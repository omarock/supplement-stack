import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Evidence-graded supplements for your symptoms, from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogResponse({
    eyebrow: "Supplements for",
    title: prettifySlug(slug),
    subtitle: "What the research supports, what to skip, and the right doses.",
  });
}
