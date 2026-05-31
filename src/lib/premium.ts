import { getAdminSupabase } from "@/lib/supabase-admin";

export interface Subscription {
  status: string | null;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

/** Full row including processor IDs, used only by the management layer (server-side). */
export interface FullSubscription extends Subscription {
  user_email: string;
  paddle_subscription_id: string | null;
  paddle_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

/** Which processor owns this subscription, if any. */
export function subscriptionProvider(sub: FullSubscription | null): "paddle" | "stripe" | null {
  if (sub?.paddle_subscription_id) return "paddle";
  if (sub?.stripe_subscription_id) return "stripe";
  return null;
}

/**
 * Fetch the full subscription row (incl. Paddle/Stripe IDs) for the management UI.
 * Never expose this to the client; the IDs must only be used server-side.
 */
export async function getFullSubscription(email: string | null | undefined): Promise<FullSubscription | null> {
  if (!email) return null;
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("user_email, status, plan, current_period_end, cancel_at_period_end, paddle_subscription_id, paddle_customer_id, stripe_subscription_id, stripe_customer_id")
    .eq("user_email", email.toLowerCase())
    .maybeSingle();
  return (data as FullSubscription) ?? null;
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/** Is this subscription currently entitling the user to premium? */
export function isPremium(sub: Subscription | null | undefined): boolean {
  if (!sub || !sub.status) return false;
  if (!ACTIVE_STATUSES.has(sub.status)) return false;
  if (sub.current_period_end) {
    // Allow a small grace; treat as premium until the period actually ends.
    if (new Date(sub.current_period_end).getTime() < Date.now()) return false;
  }
  return true;
}

/** Fetch a user's subscription row (server-side, via admin client). */
export async function getSubscription(email: string | null | undefined): Promise<Subscription | null> {
  if (!email) return null;
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("status, plan, current_period_end, cancel_at_period_end")
    .eq("user_email", email.toLowerCase())
    .maybeSingle();
  return (data as Subscription) ?? null;
}

/** Convenience: resolve premium status for an email in one call. */
export async function emailIsPremium(email: string | null | undefined): Promise<boolean> {
  return isPremium(await getSubscription(email));
}
