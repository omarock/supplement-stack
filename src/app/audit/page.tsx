import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AuditClient from "./AuditClient";
import { TH } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Audit My Stack — AI supplement audit | suppdoc.io",
  description: "Paste your current supplements. Our AI finds interactions, redundancies, missing nutrients, and timing issues — then suggests a cleaner stack. Free, instant, evidence-led.",
  keywords: "supplement audit, supplement interaction checker, AI supplement review, supplement optimization, redundant supplements, supplement stack analyzer",
  openGraph: {
    title: "Audit My Stack — suppdoc.io",
    description: "Paste your current supplements. AI finds redundancies, missing nutrients, interactions, and timing issues — free, instant.",
  },
};

export default function AuditPage() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <AuditClient />
      <SiteFooter />
    </div>
  );
}
