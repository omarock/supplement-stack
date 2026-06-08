import type { Metadata } from "next";
import PricingView from "./PricingView";

export const metadata: Metadata = {
  title: "Pricing, suppdoc.io",
  description: "Free to start. Premium ($9/mo or $79/yr) unlocks bloodwork history, re-test comparison, full tracking trends, and a coach that remembers your data.",
  alternates: {
    canonical: "/pricing",
    languages: { en: "/pricing", fr: "/fr/pricing", de: "/de/pricing", es: "/es/pricing", "x-default": "/pricing" },
  },
};

export const dynamic = "force-dynamic";

export default function PricingPage() {
  return <PricingView />;
}
