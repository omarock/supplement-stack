import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSubscription, isPremium } from "@/lib/premium";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MyStackHub from "@/components/me/MyStackHub";

export const metadata: Metadata = {
  title: "Your Stack, suppdoc.io",
  robots: "noindex,nofollow",
};

const th = {
  bg: "var(--c-bg)", paper: "var(--c-surface)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)",
  sage: "var(--c-sage)", sageGlow: "var(--c-accent-glow)", sageDeep: "var(--c-sage-deep)",
  burgundy: "var(--c-ink-bg)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=auth_not_configured");
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll() { /* noop */ } },
  });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/signin?error=please_sign_in&redirect=/me");
  return user;
}

function fmtShortDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProfilePage() {
  const user = await getUser();
  const email = user.email ?? "";
  const userId = user.id;
  const memberSince = fmtShortDate(user.created_at);

  const admin = getAdminSupabase();
  let activation = { quiz: false, bloodwork: false, tracking: false };
  if (admin) {
    const [quizRes, bwRes, trkRes] = await Promise.all([
      admin.from("quiz_submissions").select("id", { count: "exact", head: true }).or(`user_id.eq.${userId},email.eq.${email}`),
      admin.from("bloodwork_reports").select("id", { count: "exact", head: true }).eq("user_email", email),
      admin.from("tracker_enrollments").select("user_email", { count: "exact", head: true }).eq("user_email", email),
    ]);
    activation = {
      quiz: (quizRes.count ?? 0) > 0,
      bloodwork: (bwRes.count ?? 0) > 0,
      tracking: (trkRes.count ?? 0) > 0,
    };
  }
  const activationDone = Object.values(activation).filter(Boolean).length;

  const sub = await getSubscription(email);
  const premium = isPremium(sub);
  const planLabel = sub?.plan === "annual" ? "Premium · Annual" : sub?.plan === "monthly" ? "Premium · Monthly" : "Premium";

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "32px var(--section-pad-x) 64px" }}>

        {/* Welcome */}
        <section style={{ marginBottom: 24 }}>
          <h1 style={{ ...S, fontSize: "clamp(38px, 9vw, 52px)", margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.03 }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 15.5, color: th.inkSoft, margin: 0 }}>
            {email} · member since {memberSince}
          </p>
        </section>

        {/* ★ The premium My Stack hub */}
        <section style={{ marginBottom: 32 }}>
          <MyStackHub premium={premium} />
        </section>

        {/* Activation checklist (free, not yet fully activated) */}
        {!premium && activationDone < 3 && (
          <ActivationChecklist activation={activation} done={activationDone} />
        )}

        {/* Account & plan */}
        <section style={{ marginBottom: 8 }}>
          <h2 style={{ ...S, fontSize: 24, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Account</h2>
          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <KvRow label="Email" value={email} />
            <KvRow label="Member since" value={memberSince} last={!premium} />
            {premium && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", paddingTop: 4 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ ...MM, fontSize: 10.5, fontWeight: 700, color: "#fff", background: th.sage, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.08em" }}>★ {planLabel.toUpperCase()}</span>
                    <span style={{ ...MM, fontSize: 11, color: th.sageDeep, letterSpacing: "0.04em" }}>ACTIVE</span>
                  </div>
                  <div style={{ fontSize: 13, color: th.inkSoft }}>
                    {sub?.cancel_at_period_end
                      ? `Access ends ${fmtShortDate(sub?.current_period_end)} (cancellation scheduled)`
                      : `Renews ${fmtShortDate(sub?.current_period_end)} · cancel anytime`}
                  </div>
                </div>
                <Link href="/me/subscription" style={secondaryBtn}>Manage plan →</Link>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <form action="/auth/signout" method="POST" style={{ display: "inline" }}>
              <button type="submit" style={{
                padding: "11px 22px", borderRadius: 999, border: `1px solid ${th.line}`,
                background: th.paper, color: th.inkSoft, cursor: "pointer", fontSize: 14, fontWeight: 500,
              }}>Sign out</button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const secondaryBtn: React.CSSProperties = {
  padding: "11px 20px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap",
  background: "transparent", color: "var(--c-ink)", textDecoration: "none", border: "1px solid rgba(10,37,64,0.12)",
  fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
};

function ActivationChecklist({ activation, done }: { activation: { quiz: boolean; bloodwork: boolean; tracking: boolean }; done: number }) {
  const steps = [
    { ok: activation.quiz, label: "Take the personalized quiz", desc: "Get a stack matched to your goals", href: "/quiz", icon: "🎯" },
    { ok: activation.bloodwork, label: "Analyze your bloodwork", desc: "Turn a lab report into targeted picks", href: "/bloodwork", icon: "🩸" },
    { ok: activation.tracking, label: "Start daily tracking", desc: "Log a 60-second check-in", href: "/track", icon: "🔥" },
  ];
  const next = steps.find(s => !s.ok);
  const pct = Math.round((done / steps.length) * 100);
  return (
    <section style={{ marginBottom: 32, background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18, padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div>
          <div style={{ ...MM, fontSize: 10.5, color: th.sageDeep, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Get the most from suppdoc</div>
          <div style={{ ...D, fontWeight: 600, fontSize: 19, color: th.ink }}>{done} of {steps.length} done{next ? ` · next: ${next.label.toLowerCase()}` : ""}</div>
        </div>
        <span style={{ ...MM, fontSize: 12, color: th.inkMute }}>{pct}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: th.line, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ width: `${Math.max(4, pct)}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${th.sage}, ${th.sageDeep})` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: s.ok ? th.sageGlow : th.bg, borderRadius: 12 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: s.ok ? th.sage : "#fff", border: s.ok ? "none" : `1px solid ${th.line}`, fontSize: 13 }} aria-hidden>
              {s.ok ? <span style={{ color: "#fff" }}>✓</span> : s.icon}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", ...D, fontWeight: 600, fontSize: 14.5, color: th.ink, textDecoration: s.ok ? "line-through" : "none", opacity: s.ok ? 0.6 : 1 }}>{s.label}</span>
              {!s.ok && <span style={{ display: "block", fontSize: 12.5, color: th.inkMute, marginTop: 1 }}>{s.desc}</span>}
            </span>
            {!s.ok && <Link href={s.href} style={{ ...MM, fontSize: 12.5, color: th.sageDeep, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Do it →</Link>}
          </div>
        ))}
      </div>
    </section>
  );
}

function KvRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: last ? "none" : `1px solid ${th.line}` }}>
      <span style={{ fontSize: 13, color: th.inkMute }}>{label}</span>
      <span style={{ fontSize: 13, color: th.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
