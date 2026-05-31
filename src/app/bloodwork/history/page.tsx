import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Paywall from "@/components/Paywall";
import { getSessionUser } from "@/lib/auth-server";
import { getSubscription, isPremium } from "@/lib/premium";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { STATUS_META, type ExtractedBiomarker, type BiomarkerStatus } from "@/lib/biomarkers";
import { TH, FONTS } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Bloodwork history & re-test comparison, suppdoc.io",
  robots: "noindex,nofollow",
};

export const dynamic = "force-dynamic";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

interface Report { id: string; created_at: string; biomarkers: ExtractedBiomarker[]; }

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function BloodworkHistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?error=please_sign_in&redirect=/bloodwork/history");

  const premium = isPremium(await getSubscription(user.email));

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <header style={{ marginBottom: 26 }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Bloodwork history</div>
            <h1 style={{ ...D, fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              See what <span style={SI}>changed</span>.
            </h1>
          </header>

          {!premium ? (
            <Paywall
              title="Track your biomarkers over time"
              desc="Save every lab you upload and watch the numbers move, see exactly how your stack is working, retest after retest."
              bullets={["Saved history of every analysis", "Side-by-side re-test comparison", "Per-marker change: ferritin 18 → 47"]}
            />
          ) : (
            <HistoryBody email={user.email} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

async function HistoryBody({ email }: { email: string }) {
  const admin = getAdminSupabase();
  if (!admin) return <p style={{ color: TH.muted }}>History is temporarily unavailable.</p>;

  const { data } = await admin
    .from("bloodwork_reports")
    .select("id, created_at, biomarkers")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(24);

  const reports = (data ?? []) as Report[];

  if (reports.length === 0) {
    return (
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "28px 26px", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: TH.inkSoft, margin: "0 0 16px" }}>No saved reports yet. Analyze a lab and tap <strong>Save to my profile</strong> to start your history.</p>
        <Link href="/bloodwork" style={cta()}>Analyze a lab →</Link>
      </div>
    );
  }

  const latest = reports[0];
  const prev = reports[1];
  const comparison = prev ? buildComparison(latest, prev) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {prev ? (
        <section style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: 0, letterSpacing: "-0.02em" }}>Re-test comparison</h2>
            <span style={{ ...MM, fontSize: 11, color: TH.muted }}>{fmtDate(prev.created_at)} → {fmtDate(latest.created_at)}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {comparison.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: TH.bg, borderRadius: 12 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TH.ink }}>{c.name}</span>
                <span style={{ ...MM, fontSize: 13, color: TH.muted }}>{c.from ?? "-"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TH.mutedDim} strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                <span style={{ ...D, fontSize: 16, color: TH.ink }}>{c.to ?? "-"}</span>
                {c.delta !== null && (
                  <span style={{
                    ...MM, fontSize: 12, fontWeight: 600, minWidth: 54, textAlign: "right",
                    color: c.improved ? TH.sageDeep : c.improved === false ? "#b91c1c" : TH.muted,
                  }}>
                    {c.delta > 0 ? "▲" : c.delta < 0 ? "▼" : ""} {Math.abs(c.delta)}{c.unit ? "" : ""}
                  </span>
                )}
              </div>
            ))}
            {comparison.length === 0 && (
              <p style={{ fontSize: 14, color: TH.muted, margin: 0 }}>No overlapping markers between your two most recent reports to compare.</p>
            )}
          </div>
        </section>
      ) : (
        <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px" }}>
          <p style={{ fontSize: 14.5, color: TH.inkSoft, margin: 0 }}>
            You&apos;ve saved one report. Upload another after your next blood test and we&apos;ll show you exactly what moved.
          </p>
        </div>
      )}

      {/* All reports */}
      <section>
        <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.015em" }}>Your saved reports</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reports.map(r => {
            const flagged = r.biomarkers.filter(b => ["low", "high"].includes(b.status)).length;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: TH.ink }}>{fmtDate(r.created_at)}</span>
                <span style={{ fontSize: 13, color: TH.muted }}>
                  {r.biomarkers.length} marker{r.biomarkers.length === 1 ? "" : "s"}{flagged > 0 ? ` · ${flagged} flagged` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div>
        <Link href="/bloodwork" style={cta()}>Analyze a new lab →</Link>
      </div>
    </div>
  );
}

interface Cmp { name: string; from: number | null; to: number | null; delta: number | null; improved: boolean | null; unit: string | null; }

function buildComparison(latest: Report, prev: Report): Cmp[] {
  const prevByKey = new Map<string, ExtractedBiomarker>();
  for (const b of prev.biomarkers) prevByKey.set((b.key ?? b.name).toLowerCase(), b);

  const out: Cmp[] = [];
  for (const b of latest.biomarkers) {
    const p = prevByKey.get((b.key ?? b.name).toLowerCase());
    if (!p) continue;
    const from = typeof p.value === "number" ? p.value : null;
    const to = typeof b.value === "number" ? b.value : null;
    const delta = from !== null && to !== null ? Math.round((to - from) * 100) / 100 : null;
    // "improved" = moved toward optimal/normal status
    const rank = (s: BiomarkerStatus) => (["optimal", "normal"].includes(s) ? 2 : ["borderline-low", "borderline-high"].includes(s) ? 1 : 0);
    const improved = delta === null ? null : rank(b.status) > rank(p.status) ? true : rank(b.status) < rank(p.status) ? false : null;
    out.push({ name: b.name, from, to, delta, improved, unit: b.unit });
  }
  return out;
}

function cta(): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999,
    background: TH.ink, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14,
  };
}
