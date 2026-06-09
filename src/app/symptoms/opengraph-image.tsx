import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Match supplements to your symptoms, evidence-graded by suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "By symptom",
    title: "Supplements for how you feel.",
    subtitle: "From poor sleep to low energy. Evidence-graded, with what to skip.",
  });
}
