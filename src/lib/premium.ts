import { getAdminSupabase } from "@/lib/supabase-admin";

export interface Subscription {
  status: string | null;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
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
