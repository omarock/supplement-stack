import type { Metadata } from "next";
import PricingView from "./PricingView";

export const metadata: Metadata = {
  title: "Pricing: Free Tools, $79 Lifetime Premium | suppdoc.io",
  description: "Free to start, no signup. Premium unlocks bloodwork history, re-test comparison, full tracking trends, and a coach that remembers your stack and your data.",
  alternates: {
    canonical: "/pricing",
    languages: { en: "/pricing", fr: "/fr/pricing", de: "/de/pricing", es: "/es/pricing", "x-default": "/pricing" },
  },
};

// Statically rendered with ISR: per-user signed-in/Premium state is resolved
// client-side in PricingClient (via /api/me/premium), so the shell is CDN-served.
export const revalidate = 300;

export default function PricingPage() {
  return <PricingView />;
}
