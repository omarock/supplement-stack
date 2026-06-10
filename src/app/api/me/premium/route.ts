import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { emailIsPremium } from "@/lib/premium";

// Per-user pricing state for the statically-rendered /pricing page. Reads the
// session from the request cookies (so this route is dynamic), and returns only
// non-sensitive flags the pricing UI needs. PricingClient calls this on mount to
// fill in the signed-in / Premium state on top of the static anonymous shell.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  const email = user?.email ?? null;
  const premium = email ? await emailIsPremium(email) : false;
  return NextResponse.json({ signedIn: Boolean(user), email, isPremium: premium });
}
