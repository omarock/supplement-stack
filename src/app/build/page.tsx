import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BuildClient from "./BuildClient";
import { TH } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Custom Stack Builder — Design your own supplement ritual | suppdoc.io",
  description: "Build your own supplement stack from 150+ evidence-led ingredients. Live wellness preview, daily ritual timeline, interaction warnings, and one-click iHerb checkout.",
  keywords: "custom supplement stack, build supplement stack, supplement stack builder, personalized supplement protocol, supplement routine designer",
  openGraph: {
    title: "Custom Stack Builder — suppdoc.io",
    description: "Design your own supplement ritual from 150+ ingredients. Live wellness preview, daily routine, interaction warnings.",
  },
};

export default function BuildPage() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <BuildClient />
      <SiteFooter />
    </div>
  );
}
