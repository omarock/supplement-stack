import { ogResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The suppdoc.io library of evidence-led supplement guides";

export default async function Image() {
  return ogResponse({
    eyebrow: "Library",
    title: "Evidence-led guides.",
    subtitle: "Deep, cited guides to the supplements worth your money.",
  });
}
