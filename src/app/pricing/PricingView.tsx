import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PricingClient from "./PricingClient";
import { stripeEnabled } from "@/lib/stripe";
import { paddleConfigured, paddleClientConfig } from "@/lib/paddle";
import { foundingStats } from "@/lib/agents/store";
import { FOUNDING_MODE } from "@/lib/billing-mode";

// Founding-member validation phase: automated recurring billing (Paddle) was
// declined for the health/supplements category, so we sell a one-time lifetime
// "founding member" membership, invoiced manually via Payoneer and granted by
// hand in /admin. Flip to false once a real recurring processor (Stripe via a US
// entity) is live, and the normal monthly/annual checkout returns automatically.
// Shared by the English route (/pricing) and the localized routes (/fr|/de|/es/pricing).
// FOUNDING_MODE now lives in @/lib/billing-mode so the /refunds page reads the same flag.
//
// Statically rendered (ISR — see `revalidate` in the route files): this ships the
// anonymous/founding view plus the live scarcity counter (refreshed on revalidate),
// with NO per-request cookie read, so it can be served from the CDN. The signed-in
// / Premium state is resolved on the client (PricingClient -> /api/me/premium).
// Cold paid traffic is signed out, so the static view is exactly what they see.

export default async function PricingView() {
  const paddleOn = paddleConfigured();
  // Live founding-member scarcity (claimed lifetime memberships vs total spots).
  const stats = FOUNDING_MODE ? await foundingStats().catch(() => null) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <PricingClient
        signedIn={false}
        email={null}
        isPremium={false}
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
