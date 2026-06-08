import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PricingClient from "./PricingClient";
import { getSessionUser } from "@/lib/auth-server";
import { getSubscription, isPremium } from "@/lib/premium";
import { stripeEnabled } from "@/lib/stripe";
import { paddleConfigured, paddleClientConfig } from "@/lib/paddle";
import { foundingStats } from "@/lib/agents/store";

// Founding-member validation phase: automated recurring billing (Paddle) was
// declined for the health/supplements category, so we sell a one-time lifetime
// "founding member" membership, invoiced manually via Payoneer and granted by
// hand in /admin. Flip to false once a real recurring processor (Stripe via a US
// entity) is live, and the normal monthly/annual checkout returns automatically.
// Shared by the English route (/pricing) and the localized routes (/fr|/de|/es/pricing).
const FOUNDING_MODE = true;

export default async function PricingView() {
  const user = await getSessionUser();
  const sub = user ? await getSubscription(user.email) : null;
  const paddleOn = paddleConfigured();
  // Live founding-member scarcity (claimed lifetime memberships vs total spots).
  const stats = FOUNDING_MODE ? await foundingStats().catch(() => null) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <PricingClient
        signedIn={Boolean(user)}
        email={user?.email ?? null}
        isPremium={isPremium(sub)}
        foundingMode={FOUNDING_MODE}
        billingEnabled={!FOUNDING_MODE && (paddleOn || stripeEnabled())}
        paddle={FOUNDING_MODE ? null : paddleOn ? paddleClientConfig() : null}
        spotsLeft={stats?.spotsLeft ?? 50}
        foundingTotal={stats?.total ?? 50}
      />
      <SiteFooter />
    </div>
  );
}
