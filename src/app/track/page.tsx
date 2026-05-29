import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase } from "@/lib/supabase-admin";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackerClient from "./TrackerClient";
import type { Checkin, TrackerEnrollment } from "@/lib/tracker";

export const metadata: Metadata = {
  title: "Your daily tracker — suppdoc.io",
  description: "Track your stack, your wellness, and your streak. A 60-second daily check-in that turns your supplements into measurable progress.",
  robots: "noindex,nofollow",
};

export const dynamic = "force-dynamic";

async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=auth_not_configured");

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
  });
  const { data: { user } } = await supa.auth.getUser();
  if (!user || !user.email) redirect("/signin?error=please_sign_in&redirect=/track");
  return { id: user.id, email: user.email.toLowerCase() };
}

export default async function TrackPage() {
  const user = await getUser();
  const admin = getAdminSupabase();

  let checkins: Checkin[] = [];
  let enrollment: TrackerEnrollment | null = null;

  if (admin) {
    const [{ data: ci }, { data: enr }] = await Promise.all([
      admin
        .from("stack_checkins")
        .select("date, took_stack, energy, focus, sleep, mood, stress, note")
        .eq("user_email", user.email)
        .order("date", { ascending: true })
        .limit(120),
      admin
        .from("tracker_enrollments")
        .select("stack_name, stack_ids, reminder_opt_in, weekly_digest_opt_in, started_at")
        .eq("user_email", user.email)
        .maybeSingle(),
    ]);
    checkins = (ci ?? []) as Checkin[];
    enrollment = (enr ?? null) as TrackerEnrollment | null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#0a2540", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <TrackerClient
        initialCheckins={checkins}
        initialEnrollment={enrollment}
        email={user.email}
      />
      <SiteFooter />
    </div>
  );
}
