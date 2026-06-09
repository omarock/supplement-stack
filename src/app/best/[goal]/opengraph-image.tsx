import { ogResponse, OG_SIZE, OG_CONTENT_TYPE, prettifySlug } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Best supplements for your goal, evidence-graded by suppdoc.io";

export default async function Image({ params }: { params: Promise<{ goal: string }> }) {
  const { goal } = await params;
  return ogResponse({
    eyebrow: "Best supplements for",
    title: prettifySlug(goal),
    subtitle: "Evidence-graded picks, exact doses, and the brands worth buying.",
  });
}
