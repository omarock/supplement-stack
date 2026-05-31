import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { getSubscription, isPremium } from "@/lib/premium";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Your Profile, suppdoc.io",
  robots: "noindex,nofollow",
};

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageGlow: "rgba(91,163,115,0.10)", sageDeep: "#3f7a52",
  burgundy: "#0a2540", line: "rgba(10,37,64,0.08)", amber: "#e8a04a",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif' } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

// ─── Auth check (server-side, no admin requirement) ─────────────────────────
async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=auth_not_configured");

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* noop in server component */ },
    },
  });

  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/signin?error=please_sign_in&redirect=/me");
  return user;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function fmtShortDate(d: string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default async function ProfilePage() {
  const user = await getUser();

  // Fetch user-scoped data via admin client (bypasses RLS)
  const admin = getAdminSupabase();
  if (!admin) {
    return (
      <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
        <SiteHeader />
        <main style={{ maxWidth: 720, margin: "60px auto", padding: "0 24px" }}>
          <h1 style={{ ...S, fontSize: 36 }}>Profile temporarily unavailable</h1>
          <p style={{ color: th.inkSoft }}>The data layer isn&apos;t connected. Try again in a moment.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Get this user's quiz submissions + clicks (filter by user_id OR email)
  const email = user.email ?? "";
  const userId = user.id;

  const [quizRes, clicksRes] = await Promise.all([
    admin
      .from("quiz_submissions")
      .select("id, created_at, goals, supplement_count, total_monthly_cost, budget")
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("link_clicks")
      .select("id, created_at, supplement_id, supplement_name, product_brand, product_name, source_page")
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const quizzes = quizRes.data ?? [];
  const clicks = clicksRes.data ?? [];

  const lastQuiz = quizzes[0];
  const lastClick = clicks[0];
  const memberSince = fmtShortDate(user.created_at);

  // Subscription / plan status
  const sub = await getSubscription(email);
  const premium = isPremium(sub);
  const planLabel = sub?.plan === "annual" ? "Premium · Annual" : sub?.plan === "monthly" ? "Premium · Monthly" : "Premium";

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px var(--section-pad-x) 64px" }}>

        {/* Welcome hero */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 8 }}>
           YOUR PROFILE
          </div>
          <h1 style={{ ...S, fontSize: 48, margin: "0 0 8px", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 17, color: th.inkSoft, margin: 0 }}>
            Signed in as <strong style={{ color: th.ink }}>{email}</strong> · Member since {memberSince}
          </p>
        </section>

        {/* Plan status */}
        <section style={{ marginBottom: 36 }}>
          {premium ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
              background: `linear-gradient(135deg, ${th.sage}14, #ffffff 70%)`,
              border: `1.5px solid ${th.sage}66`, borderRadius: 18, padding: "20px 24px",
              boxShadow: `0 10px 30px -16px ${th.sage}66`,
            }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    ...MM, fontSize: 10.5, fontWeight: 700, color: "#fff", background: th.sage,
                    padding: "3px 10px", borderRadius: 999, letterSpacing: "0.08em",
                  }}>★ {planLabel.toUpperCase()}</span>
                  <span style={{ ...MM, fontSize: 11, color: th.sageDeep, letterSpacing: "0.04em" }}>ACTIVE</span>
                </div>
                <div style={{ ...D, fontWeight: 600, fontSize: 20, color: th.ink, marginBottom: 4 }}>
                  You&apos;re on Premium 🎉
                </div>
                <div style={{ fontSize: 13.5, color: th.inkSoft }}>
                  {sub?.cancel_at_period_end
                    ? `Access ends ${fmtShortDate(sub?.current_period_end)} (cancellation scheduled)`
                    : `Renews ${fmtShortDate(sub?.current_period_end)} · cancel anytime`}
                </div>
              </div>
              <Link href="/me/subscription" style={{
                ...secondaryBtn, whiteSpace: "nowrap",
              }}>Manage plan →</Link>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18, padding: "20px 24px",
            }}>
              <div>
                <div style={{ ...MM, fontSize: 10.5, color: th.inkMute, letterSpacing: "0.08em", marginBottom: 8 }}>YOUR PLAN</div>
                <div style={{ ...D, fontWeight: 600, fontSize: 20, color: th.ink, marginBottom: 4 }}>Free plan</div>
                <div style={{ fontSize: 13.5, color: th.inkMute }}>
                  Unlock bloodwork history, re-test comparison, full trends & AI memory.
                </div>
              </div>
              <Link href="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                padding: "12px 20px", borderRadius: 999, textDecoration: "none",
                background: `linear-gradient(180deg, ${th.sage}, ${th.sageDeep})`, color: "#fff",
                ...D, fontWeight: 600, fontSize: 14.5, boxShadow: `0 8px 20px -6px ${th.sage}80`,
              }}>Upgrade to Premium →</Link>
            </div>
          )}
        </section>

        {/* Stats grid */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, marginBottom: 36,
        }}>
          <StatCard label="QUIZZES TAKEN" value={quizzes.length} sub={lastQuiz ? `Last: ${fmtShortDate(lastQuiz.created_at)}` : "Take your first one"} />
          <StatCard label="PRODUCTS EXPLORED" value={clicks.length} sub={lastClick ? `Last: ${fmtShortDate(lastClick.created_at)}` : "Browse supplements"} />
          <StatCard label="CURRENT STACK SIZE" value={lastQuiz?.supplement_count ?? "-"} sub={lastQuiz ? `~$${lastQuiz.total_monthly_cost}/mo` : "Take the quiz"} />
        </section>

        {/* Feature cards: tracker + bloodwork */}
        <section style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, marginBottom: 36,
        }}>
          <Link href="/track" style={{
            display: "block", textDecoration: "none", color: "inherit",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
            border: "1px solid #f5d3a8", borderRadius: 16, padding: "20px 22px",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden>🔥</div>
            <div style={{ ...D, fontWeight: 600, fontSize: 18, color: th.ink, marginBottom: 4 }}>Daily tracker</div>
            <div style={{ fontSize: 13.5, color: th.inkMute, lineHeight: 1.5 }}>
              Log a 60-second check-in, build a streak, and watch your wellness trends. <span style={{ color: th.sage, fontWeight: 600 }}>Open →</span>
            </div>
          </Link>
          <Link href="/bloodwork" style={{
            display: "block", textDecoration: "none", color: "inherit",
            background: "linear-gradient(135deg, #f0f9f3 0%, #ffffff 100%)",
            border: `1px solid ${th.sage}44`, borderRadius: 16, padding: "20px 22px",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden>🩸</div>
            <div style={{ ...D, fontWeight: 600, fontSize: 18, color: th.ink, marginBottom: 4 }}>Bloodwork analysis</div>
            <div style={{ fontSize: 13.5, color: th.inkMute, lineHeight: 1.5 }}>
              Upload a lab report, AI flags deficiencies and matches targeted supplements. <span style={{ color: th.sage, fontWeight: 600 }}>Analyze →</span>
            </div>
          </Link>
        </section>

        {/* Quick actions */}
        <section style={{ marginBottom: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/quiz" style={primaryBtn}>Take a new quiz →</Link>
          <Link href={lastQuiz ? "/results" : "/stacks"} style={secondaryBtn}>
            {lastQuiz ? "View latest stack" : "Browse stacks"}
          </Link>
          <Link href="/ingredients" style={secondaryBtn}>Browse all ingredients</Link>
        </section>

        {/* Recent quizzes table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...S, fontSize: 28, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Your quiz history
          </h2>
          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, overflow: "hidden" }}>
            {quizzes.length === 0 ? (
              <div style={{ padding: 28, color: th.inkSoft, textAlign: "center" }}>
                You haven&apos;t taken the quiz yet.{" "}
                <Link href="/quiz" style={{ color: th.sage, fontWeight: 600 }}>Take it now →</Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#fafaf8" }}>
                    <Th>Date</Th>
                    <Th>Goals</Th>
                    <Th>Stack Size</Th>
                    <Th>Budget</Th>
                    <Th>~Monthly Cost</Th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.slice(0, 10).map(q => (
                    <tr key={q.id} style={{ borderTop: `1px solid ${th.line}` }}>
                      <Td>{fmtDate(q.created_at)}</Td>
                      <Td>{(q.goals ?? []).slice(0, 3).join(", ") || "-"}</Td>
                      <Td>{q.supplement_count ?? "-"}</Td>
                      <Td>{q.budget ?? "-"}</Td>
                      <Td>{q.total_monthly_cost ? `$${q.total_monthly_cost}` : "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Recent clicks table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...S, fontSize: 28, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Products you&apos;ve viewed
          </h2>
          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, overflow: "hidden" }}>
            {clicks.length === 0 ? (
              <div style={{ padding: 28, color: th.inkSoft, textAlign: "center" }}>
                Click any &quot;Buy on iHerb&quot; or &quot;Buy on Amazon&quot; button on the site and your activity will appear here.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#fafaf8" }}>
                    <Th>Date</Th>
                    <Th>Supplement</Th>
                    <Th>Brand</Th>
                    <Th>Product</Th>
                    <Th>From</Th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.slice(0, 15).map(c => (
                    <tr key={c.id} style={{ borderTop: `1px solid ${th.line}` }}>
                      <Td>{fmtDate(c.created_at)}</Td>
                      <Td>
                        {c.supplement_id ? (
                          <Link href={`/ingredients/${c.supplement_id}`} style={{ color: th.sage, textDecoration: "none" }}>
                            {c.supplement_name ?? c.supplement_id}
                          </Link>
                        ) : c.supplement_name ?? "-"}
                      </Td>
                      <Td>{c.product_brand ?? "-"}</Td>
                      <Td>{c.product_name ?? "-"}</Td>
                      <Td><span style={{ ...MM, fontSize: 11, color: th.inkMute }}>{c.source_page ?? "-"}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Account actions */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ ...S, fontSize: 28, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Account
          </h2>
          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
            padding: 22, display: "flex", flexDirection: "column", gap: 14,
          }}>
            <KvRow label="Email" value={email} />
            <KvRow label="User ID" value={userId} mono />
            <KvRow label="Account created" value={memberSince} last />
          </div>
          <div style={{ marginTop: 18 }}>
            <form action="/auth/signout" method="POST" style={{ display: "inline" }}>
              <button type="submit" style={{
                padding: "12px 22px", borderRadius: 999, border: `1px solid ${th.line}`,
                background: th.paper, color: th.inkSoft, cursor: "pointer", fontSize: 14, fontWeight: 500,
              }}>
                Sign out
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  padding: "14px 24px", borderRadius: 999, fontSize: 14, fontWeight: 600,
  background: "#0a2540", color: "#fff", textDecoration: "none",
  boxShadow: "0 4px 14px rgba(10,37,64,0.18)",
};
const secondaryBtn: React.CSSProperties = {
  padding: "14px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
  background: "transparent", color: "#0a2540", textDecoration: "none",
  border: "1px solid rgba(10,37,64,0.12)",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, color: th.inkMute, ...MM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ ...S, fontSize: 42, color: th.ink, letterSpacing: "-0.025em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: th.inkMute, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "12px 16px",
      fontSize: 11, color: th.inkMute, ...MM, letterSpacing: "0.08em",
      textTransform: "uppercase", fontWeight: 600,
    }}>{children}</th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "12px 16px", color: th.ink, fontSize: 13 }}>{children}</td>
  );
}

function KvRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "8px 0", borderBottom: last ? "none" : `1px solid ${th.line}`,
    }}>
      <span style={{ fontSize: 13, color: th.inkMute }}>{label}</span>
      <span style={{ fontSize: 13, color: th.ink, fontWeight: 500, ...(mono ? MM : {}) }}>{value}</span>
    </div>
  );
}
