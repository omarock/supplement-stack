import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Compare supplements head to head, from suppdoc.io";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogResponse({
    eyebrow: "Compare",
    title: prettifySlug(slug),
    subtitle: "Side by side on evidence, dose, form and price, so you pick right.",
  });
}
