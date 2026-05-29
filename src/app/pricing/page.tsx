import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PricingClient from "./PricingClient";
import { getSessionUser } from "@/lib/auth-server";
import { getSubscription, isPremium } from "@/lib/premium";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing, suppdoc.io",
  description: "Free to start. Premium ($9/mo or $79/yr) unlocks bloodwork history, re-test comparison, full tracking trends, and an AI coach that remembers your data.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getSessionUser();
  const sub = user ? await getSubscription(user.email) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#0a2540", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <PricingClient signedIn={Boolean(user)} isPremium={isPremium(sub)} billingEnabled={stripeEnabled()} />
      <SiteFooter />
    </div>
  );
}
