import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Match supplements to your bloodwork, from suppdoc.io";

export default async function Image() {
  return ogResponse({
    eyebrow: "By biomarker",
    title: "Match supplements to your labs.",
    subtitle: "Turn a blood test into an evidence-graded, personalised plan.",
  });
}
