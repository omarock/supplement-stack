import type { Metadata } from "next";
import AuditView from "./AuditView";

export const metadata: Metadata = {
  title: "Supplement Audit & Interaction Checker (free), suppdoc.io",
  description: "Paste your supplements and our free audit flags interactions, redundancies, missing nutrients, and timing issues in seconds, then suggests a cleaner, evidence-led stack. No signup.",
  keywords: "supplement audit, supplement interaction checker, supplement stack analyzer, supplement stack review, supplement optimization, redundant supplements, check supplement interactions",
  alternates: {
    canonical: "/audit",
    languages: { en: "/audit", fr: "/fr/audit", de: "/de/audit", es: "/es/audit", "x-default": "/audit" },
  },
  openGraph: {
    title: "Free Supplement Audit & Interaction Checker, suppdoc.io",
    description: "Paste your supplements. We flag redundancies, missing nutrients, interactions, and timing issues, free, instant, evidence-led.",
  },
};

export default function AuditPage() {
  return <AuditView locale="en" />;
}
