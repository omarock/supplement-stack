import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PricingClient from "./PricingClient";
import { getSessionUser } from "@/lib/auth-server";
import { getSubscription, isPremium } from "@/lib/premium";
import { stripeEnabled } from "@/lib/stripe";
import { paddleConfigured, paddleClientConfig } from "@/lib/paddle";

export const metadata: Metadata = {
  title: "Pricing, suppdoc.io",
  description: "Free to start. Premium ($9/mo or $79/yr) unlocks bloodwork history, re-test comparison, full tracking trends, and a coach that remembers your data.",
  alternates: { canonical: "/pricing" },
};

export const dynamic = "force-dynamic";

// Founding-member validation phase: automated recurring billing (Paddle) was
// declined for the health/supplements category, so we sell a one-time lifetime
// "founding member" membership, invoiced manually via Payoneer and granted by
// hand in /admin. This also stops any leftover sandbox checkout from showing to
// real visitors. Flip to false once a real recurring processor (Stripe via a US
// entity) is live, and the normal monthly/annual checkout returns automatically.
const FOUNDING_MODE = true;

export default async function PricingPage() {
  const user = await getSessionUser();
  const sub = user ? await getSubscription(user.email) : null;
  const paddleOn = paddleConfigured();

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#0a2540", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <PricingClient
        signedIn={Boolean(user)}
        email={user?.email ?? null}
        isPremium={isPremium(sub)}
        foundingMode={FOUNDING_MODE}
        billingEnabled={!FOUNDING_MODE && (paddleOn || stripeEnabled())}
        paddle={FOUNDING_MODE ? null : paddleOn ? paddleClientConfig() : null}
      />
      <SiteFooter />
    </div>
  );
}
