import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase, isAdminEmail } from "@/lib/supabase-admin";
import SuppdocLogo from "@/components/SuppdocLogo";

export const metadata: Metadata = {
  title: "Admin, suppdoc.io",
  robots: "noindex,nofollow",
};

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageGlow: "rgba(91,163,115,0.10)",
  burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
// `S` retained as a name for backward compat, now points to Bricolage display (admin has no decorative serif glyphs)
const S = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

const exportBtnStyle: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
  background: th.ink, color: "#fff", textDecoration: "none",
  fontFamily: '"Inter", system-ui, sans-serif',
  boxShadow: "0 2px 6px rgba(10,37,64,0.18)",
};

// ─── Auth check (server-side) ────────────────────────────────────────────────
async function checkAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=admin_not_configured");

  const cookieStore = await cookies();
  const supa = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* noop in server component */ },
    },
  });

  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/signin?error=please_sign_in");
  if (!isAdminEmail(user.email)) redirect("/?error=not_admin");
  return user;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, color: th.inkMute, ...MM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ ...S, fontSize: 40, color: th.ink, letterSpacing: "-0.025em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: th.inkMute, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const user = await checkAdmin();
  const admin = getAdminSupabase();

  // No service role configured, show setup banner
  if (!admin) {
    return (
      <NoServiceRoleNotice email={user.email ?? ""} />
    );
  }

  // ─── Fetch data in parallel ────────────────────────────────────────────────
  const [
    { count: totalSignups },
    { count: totalQuizzes },
    { count: totalClicks },
    { count: totalEmails },
    { data: recentQuizzes },
    { data: recentClicks },
    { data: allQuizzesForAgg },
    { data: allClicksForAgg },
  ] = await Promise.all([
    // total signups (auth.users count via service role)
    admin.auth.admin.listUsers({ perPage: 1 }).then(r => {
      // listUsers returns total via header; some SDK versions expose it differently
      const d = r.data as unknown as { total?: number; users?: unknown[] };
      return { count: d?.total ?? d?.users?.length ?? 0 };
    }),
    admin.from("quiz_submissions").select("*", { count: "exact", head: true }),
    admin.from("link_clicks").select("*", { count: "exact", head: true }),
    admin.from("email_signups").select("*", { count: "exact", head: true }),
    admin.from("quiz_submissions").select("*").order("created_at", { ascending: false }).limit(10),
    admin.from("link_clicks").select("*").order("created_at", { ascending: false }).limit(10),
    admin.from("quiz_submissions").select("goals,budget,diet,total_monthly_cost"),
    admin.from("link_clicks").select("supplement_id,supplement_name,product_brand"),
  ]);

  // ─── Aggregations ─────────────────────────────────────────────────────────
  // Top goals
  const goalCounts: Record<string, number> = {};
  for (const q of allQuizzesForAgg ?? []) {
    for (const g of (q.goals ?? []) as string[]) goalCounts[g] = (goalCounts[g] ?? 0) + 1;
  }
  const topGoals = Object.entries(goalCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Top supplements clicked
  const suppCounts: Record<string, { name: string; brand: string; count: number }> = {};
  for (const c of allClicksForAgg ?? []) {
    const key = c.supplement_id ?? "unknown";
    if (!suppCounts[key]) suppCounts[key] = { name: c.supplement_name ?? key, brand: c.product_brand ?? "", count: 0 };
    suppCounts[key].count += 1;
  }
  const topSupps = Object.values(suppCounts).sort((a, b) => b.count - a.count).slice(0, 8);

  // Average monthly cost
  const costs = (allQuizzesForAgg ?? []).map(q => q.total_monthly_cost ?? 0).filter(c => c > 0);
  const avgCost = costs.length ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : 0;

  // Top budget tier
  const budgetCounts: Record<string, number> = {};
  for (const q of allQuizzesForAgg ?? []) {
    if (q.budget) budgetCounts[q.budget] = (budgetCounts[q.budget] ?? 0) + 1;
  }
  const topBudget = Object.entries(budgetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Quiz → click conversion (rough)
  const conversion = totalQuizzes && totalQuizzes > 0
    ? Math.round(((totalClicks ?? 0) / totalQuizzes) * 100)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        padding: "18px 32px", borderBottom: `1px solid ${th.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SuppdocLogo size={22} />
          <span style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginLeft: 4 }}>ADMIN</span>
        </div>
        <div style={{ fontSize: 13, color: th.inkSoft }}>
          Signed in as <strong style={{ color: th.ink }}>{user.email}</strong>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 10 }}>
          DASHBOARD
          </div>
          <h1 style={{ ...S, fontSize: 52, color: th.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1 }}>
            Pilot your site.
          </h1>
          <p style={{ color: th.inkSoft, fontSize: 15, marginTop: 10 }}>
            Real-time KPIs across signups, quizzes, and iHerb clicks. Data refreshes on each page load.
          </p>
        </div>

        {/* KPI cards */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <StatCard label="User signups" value={totalSignups ?? 0} sub="all-time, via Supabase auth" />
            <StatCard label="Quizzes completed" value={totalQuizzes ?? 0} sub="across users + anon" />
            <StatCard label="iHerb clicks" value={totalClicks ?? 0} sub="from results & modal" />
            <StatCard label="Email signups" value={totalEmails ?? 0} sub="captured in quiz" />
            <StatCard label="Avg. stack cost" value={`$${avgCost}`} sub="per month" />
            <StatCard label="Quiz → click rate" value={`${conversion}%`} sub="rough conversion" />
          </div>
        </section>

        {/* Data export bar */}
        <section style={{
          marginBottom: 32, padding: "14px 18px",
          background: th.paper, border: `1px solid ${th.line}`, borderRadius: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: th.inkSoft }}>
            <span style={{ fontSize: 16 }}>📥</span>
            <span><strong style={{ color: th.ink }}>Export raw data</strong> as CSV (max 10,000 rows)</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/admin/export/quizzes" download style={exportBtnStyle}>Quizzes CSV</a>
            <a href="/admin/export/clicks" download style={exportBtnStyle}>Clicks CSV</a>
            <a href="/admin/export/signups" download style={exportBtnStyle}>Email signups CSV</a>
          </div>
        </section>

        {/* Top goals + Top supplements (2 column) */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 32 }}>

          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ ...S, fontSize: 22, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Top goals</h2>
            {topGoals.length === 0 ? (
              <p style={{ color: th.inkMute, fontSize: 13 }}>No quiz data yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topGoals.map(([goal, count]) => {
                  const max = topGoals[0][1];
                  return (
                    <div key={goal}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{goal}</span>
                        <span style={{ color: th.inkMute, ...MM }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: th.line, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: th.sage, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p style={{ fontSize: 11, color: th.inkMute, marginTop: 14 }}>
              Most popular budget: <strong>{topBudget}</strong>
            </p>
          </div>

          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ ...S, fontSize: 22, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Top clicked supplements</h2>
            {topSupps.length === 0 ? (
              <p style={{ color: th.inkMute, fontSize: 13 }}>No clicks yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topSupps.map(s => {
                  const max = topSupps[0].count;
                  return (
                    <div key={s.name + s.brand}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{s.name} <span style={{ color: th.inkMute }}>· {s.brand}</span></span>
                        <span style={{ color: th.inkMute, ...MM }}>{s.count}</span>
                      </div>
                      <div style={{ height: 4, background: th.line, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: th.burgundy, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Recent activity tables */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 32 }}>

          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ ...S, fontSize: 22, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Latest quizzes</h2>
            {(!recentQuizzes || recentQuizzes.length === 0) ? (
              <p style={{ color: th.inkMute, fontSize: 13 }}>No quizzes yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${th.line}` }}>
                    <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>WHEN</th>
                    <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>EMAIL</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>STACK</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuizzes.map(q => (
                    <tr key={q.id} style={{ borderBottom: `1px solid ${th.line}` }}>
                      <td style={{ padding: "10px 4px", color: th.inkSoft, fontSize: 12, ...MM }}>{fmtDate(q.created_at)}</td>
                      <td style={{ padding: "10px 4px", color: th.ink, fontSize: 12 }}>{q.email ?? <span style={{ color: th.inkMute }}>anonymous</span>}</td>
                      <td style={{ padding: "10px 4px", textAlign: "right", color: th.ink, fontSize: 12 }}>
                        ${q.total_monthly_cost ?? 0}/mo · {q.supplement_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ ...S, fontSize: 22, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Latest iHerb clicks</h2>
            {(!recentClicks || recentClicks.length === 0) ? (
              <p style={{ color: th.inkMute, fontSize: 13 }}>No clicks yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${th.line}` }}>
                    <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>WHEN</th>
                    <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>PRODUCT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClicks.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${th.line}` }}>
                      <td style={{ padding: "10px 4px", color: th.inkSoft, fontSize: 12, ...MM, whiteSpace: "nowrap" }}>{fmtDate(c.created_at)}</td>
                      <td style={{ padding: "10px 4px", color: th.ink, fontSize: 12 }}>
                        {c.supplement_name ?? c.supplement_id}
                        <span style={{ color: th.inkMute, fontSize: 11, display: "block" }}>{c.product_brand}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* External KPI sources */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ ...S, fontSize: 24, margin: "0 0 16px", letterSpacing: "-0.015em" }}>External dashboards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <a href="https://vercel.com/ia-supplements/supplement-stack/analytics" target="_blank" rel="noopener noreferrer" style={{
              display: "block", background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
              padding: 18, textDecoration: "none", color: th.ink,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 6 }}>TRAFFIC</div>
              <div style={{ ...S, fontSize: 20, letterSpacing: "-0.01em" }}>Vercel Analytics →</div>
              <p style={{ fontSize: 12, color: th.inkSoft, marginTop: 6, marginBottom: 0 }}>
                Page views, top pages, referrers, geography, device breakdown.
              </p>
            </a>
            <a href="https://www.iherb.com/info/rewards" target="_blank" rel="noopener noreferrer" style={{
              display: "block", background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
              padding: 18, textDecoration: "none", color: th.ink,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 6 }}>COMMISSIONS</div>
              <div style={{ ...S, fontSize: 20, letterSpacing: "-0.01em" }}>iHerb Rewards →</div>
              <p style={{ fontSize: 12, color: th.inkSoft, marginTop: 6, marginBottom: 0 }}>
                Actual purchases via code <strong>DII6469</strong>, payouts, conversion rate.
              </p>
            </a>
            <a href="https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm" target="_blank" rel="noopener noreferrer" style={{
              display: "block", background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
              padding: 18, textDecoration: "none", color: th.ink,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginBottom: 6 }}>RAW DATA</div>
              <div style={{ ...S, fontSize: 20, letterSpacing: "-0.01em" }}>Supabase →</div>
              <p style={{ fontSize: 12, color: th.inkSoft, marginTop: 6, marginBottom: 0 }}>
                User table, quiz submissions, click log. Export to CSV anytime.
              </p>
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}

// ─── Setup notice ────────────────────────────────────────────────────────────
function NoServiceRoleNotice({ email }: { email: string }) {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, padding: 24, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: "60px auto" }}>
        <h1 style={{ ...S, fontSize: 44, color: th.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          One more step.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.6 }}>
          You&apos;re signed in as <strong>{email}</strong>, but the admin dashboard needs the Supabase <strong>service-role key</strong> to read all data.
        </p>
        <ol style={{ color: th.inkSoft, fontSize: 14, lineHeight: 1.8, marginTop: 18 }}>
          <li>Open <a href="https://supabase.com/dashboard/project/ihbourjkfjufdenzrypm/settings/api-keys" style={{ color: th.sage }}>your Supabase API keys page</a></li>
          <li>Switch to the <strong>Legacy anon, service_role API keys</strong> tab</li>
          <li>Copy the <strong>service_role</strong> key (DO NOT share this, server-only)</li>
          <li>In Vercel: Settings → Environment Variables → Add <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4 }}>SUPABASE_SERVICE_ROLE_KEY</code> with that value</li>
          <li>Also add <code style={{ background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 4 }}>ADMIN_EMAILS</code> with your email: <strong>{email}</strong></li>
          <li>Redeploy</li>
        </ol>
      </div>
    </div>
  );
}
