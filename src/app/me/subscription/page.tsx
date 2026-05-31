import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getFullSubscription, isPremium, subscriptionProvider } from "@/lib/premium";
import {
  getPaddleSubscription,
  listPaddleTransactions,
  paddleManagementConfigured,
  planForPriceId,
} from "@/lib/paddle";
import SubscriptionClient, { type BillingRow, type SubView } from "./SubscriptionClient";

export const metadata: Metadata = {
  title: "Manage subscription, suppdoc.io",
  robots: "noindex,nofollow",
};

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;

async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=auth_not_configured");

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
  });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/signin?error=please_sign_in&redirect=/me/subscription");
  return user;
}

function fmtMoney(minor: string | undefined | null, currency: string | undefined): string {
  if (!minor) return "-";
  const n = Number(minor) / 100;
  if (!Number.isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(n);
  } catch {
    return `${(currency || "USD")} ${n.toFixed(2)}`;
  }
}

export default async function ManageSubscriptionPage() {
  const user = await getUser();
  const email = user.email ?? "";

  const full = await getFullSubscription(email);
  const premium = isPremium(full);
  const provider = subscriptionProvider(full);
  const managementReady = paddleManagementConfigured();

  // Pull live detail + billing history from Paddle when possible (keeps renewal
  // date, price and invoices authoritative rather than relying on cached webhook data).
  let live: SubView | null = null;
  let billing: BillingRow[] = [];

  if (full && provider === "paddle" && full.paddle_subscription_id && managementReady) {
    const [detailRes, txRes] = await Promise.all([
      getPaddleSubscription(full.paddle_subscription_id),
      listPaddleTransactions(full.paddle_subscription_id),
    ]);
    if (detailRes.ok && detailRes.data) {
      const d = detailRes.data;
      const unit = d.items?.[0]?.price?.unit_price;
      live = {
        status: d.status,
        plan: planForPriceId(d.items?.[0]?.price?.id) ?? full.plan ?? null,
        currentPeriodEnd: d.current_billing_period?.ends_at ?? full.current_period_end ?? null,
        nextBilledAt: d.next_billed_at ?? null,
        cancelScheduled: d.scheduled_change?.action === "cancel",
        cancelEffectiveAt: d.scheduled_change?.action === "cancel" ? d.scheduled_change?.effective_at ?? null : null,
        priceLabel: fmtMoney(unit?.amount, unit?.currency_code),
        intervalLabel: d.billing_cycle?.interval ? `per ${d.billing_cycle.interval}` : "",
      };
    }
    if (txRes.ok && txRes.data) {
      billing = txRes.data.slice(0, 12).map(t => ({
        id: t.id,
        date: t.billed_at ?? t.created_at ?? null,
        amount: fmtMoney(t.details?.totals?.grand_total, t.currency_code),
        status: t.status,
        invoice: t.invoice_number ?? null,
      }));
    }
  }

  // Fallback view from our own DB if the live call didn't run (e.g. Stripe, or API key absent).
  if (!live && full) {
    live = {
      status: full.status,
      plan: full.plan,
      currentPeriodEnd: full.current_period_end,
      nextBilledAt: full.cancel_at_period_end ? null : full.current_period_end,
      cancelScheduled: Boolean(full.cancel_at_period_end),
      cancelEffectiveAt: full.cancel_at_period_end ? full.current_period_end : null,
      priceLabel: full.plan === "annual" ? "$79.00" : full.plan === "monthly" ? "$9.00" : "-",
      intervalLabel: full.plan === "annual" ? "per year" : full.plan === "monthly" ? "per month" : "",
    };
  }

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px var(--section-pad-x) 72px" }}>
        <Link href="/me" style={{ fontSize: 13, color: th.sageDeep, textDecoration: "none" }}>← Back to profile</Link>
        <h1 style={{ ...S, fontSize: 44, margin: "10px 0 6px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          Manage subscription
        </h1>
        <p style={{ fontSize: 15.5, color: th.inkSoft, margin: "0 0 28px" }}>
          Signed in as <strong style={{ color: th.ink }}>{email}</strong>
        </p>

        {!premium || !full ? (
          <NoSubscription />
        ) : provider === "stripe" ? (
          <StripeManaged />
        ) : provider === "paddle" && !managementReady ? (
          <ManagementUnavailable />
        ) : (
          <SubscriptionClient initial={live!} billing={billing} email={email} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18, padding: "26px 26px" }}>
      {children}
    </div>
  );
}

function NoSubscription() {
  return (
    <Card>
      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 20, marginBottom: 6 }}>
        You&apos;re on the Free plan
      </div>
      <p style={{ fontSize: 14.5, color: th.inkSoft, lineHeight: 1.55, margin: "0 0 18px" }}>
        Upgrade to Premium for unlimited bloodwork history, re-test comparison, full trend analytics, and the AI coach with memory of your data.
      </p>
      <Link href="/pricing" style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999,
        textDecoration: "none", background: `linear-gradient(180deg, ${th.sage}, ${th.sageDeep})`, color: "#fff",
        fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 14.5,
      }}>See Premium plans →</Link>
    </Card>
  );
}

function StripeManaged() {
  return (
    <Card>
      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 20, marginBottom: 6 }}>
        Premium · managed by Stripe
      </div>
      <p style={{ fontSize: 14.5, color: th.inkSoft, lineHeight: 1.55, margin: "0 0 18px" }}>
        Your subscription is billed through Stripe. Open the Stripe billing portal to update your card, change plan, view invoices, or cancel.
      </p>
      <form action="/api/stripe/portal" method="POST">
        <button type="submit" style={{
          padding: "12px 22px", borderRadius: 999, border: "none", cursor: "pointer",
          background: th.ink, color: "#fff", fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 14.5,
        }}>Open billing portal →</button>
      </form>
    </Card>
  );
}

function ManagementUnavailable() {
  return (
    <Card>
      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 20, marginBottom: 6 }}>
        You&apos;re on Premium
      </div>
      <p style={{ fontSize: 14.5, color: th.inkSoft, lineHeight: 1.55, margin: 0 }}>
        Self-service management is being switched on. To change or cancel your plan in the meantime, email{" "}
        <a href="mailto:hello@suppdoc.io" style={{ color: th.sageDeep }}>hello@suppdoc.io</a> and we&apos;ll handle it right away.
      </p>
    </Card>
  );
}
