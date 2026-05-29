import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BloodworkClient from "./BloodworkClient";

export const metadata: Metadata = {
  title: "Bloodwork analysis — upload your labs | suppdoc.io",
  description: "Upload a blood test PDF or photo. Our AI reads your biomarkers, flags what's low or high, and suggests evidence-led, targeted supplements. Educational, private, not a diagnosis.",
};

export const dynamic = "force-dynamic";

async function isSignedIn(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } });
  const { data: { user } } = await supa.auth.getUser();
  return Boolean(user);
}

export default async function BloodworkPage() {
  const signedIn = await isSignedIn();
  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#0a2540", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <BloodworkClient signedIn={signedIn} />
      <SiteFooter />
    </div>
  );
}
