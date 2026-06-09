import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Best supplements by goal, evidence-graded by suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "Find your stack",
    title: "Best supplements, by goal.",
    subtitle: "Sleep, energy, focus, stress and more. Evidence-graded picks with real doses.",
  });
}
