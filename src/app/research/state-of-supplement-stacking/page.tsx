import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { INTERACTIONS, type InteractionKind, interactionSlug } from "@/lib/interactions";
import { TIMING, TIMING_IDS } from "@/lib/timing";
import { SYMPTOMS, SYMPTOM_SLUGS } from "@/lib/symptoms";
import { BIOMARKERS } from "@/lib/biomarkers";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;
const BASE = "https://www.suppdoc.io";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The State of Supplement Stacking 2026: data on interactions, redundancy & timing | suppdoc.io",
  description: "We analysed 151 supplements, 143 interaction pairs, and 87 timing guides. The data on what people stack, which combinations are redundant, what to never mix, and the nutrients linked to the most symptoms.",
  keywords: "supplement stacking statistics, supplement interaction data, supplement redundancy, most common supplement deficiencies, supplement research report",
  alternates: { canonical: `${BASE}/research/state-of-supplement-stacking` },
  openGraph: { title: "The State of Supplement Stacking 2026, suppdoc.io", description: "Data on supplement interactions, redundancy, timing, and the nutrients linked to the most symptoms." },
};

function ingName(id: string): string {
  return SUPPLEMENT_DB.find(s => s.id === id)?.name.split(" (")[0] ?? id;
}
function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

// ── Live user data (grows over time; rendered only when meaningful) ──────────
async function liveData(): Promise<{ quizzes: number; topGoals: [string, number][]; avgCost: number | null; topClicks: [string, number][] } | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  try {
    const { data: subs } = await admin.from("quiz_submissions").select("goals,total_monthly_cost").limit(5000);
    const { data: clicks } = await admin.from("link_clicks").select("supplement_name").limit(8000);
    const quizzes = subs?.length ?? 0;
    if (quizzes < 25) return null; // not enough to be credible yet
    const goalCount: Record<string, number> = {};
    let costSum = 0, costN = 0;
    for (const s of subs ?? []) {
      for (const g of (s.goals ?? []) as string[]) goalCount[g] = (goalCount[g] ?? 0) + 1;
      if (typeof s.total_monthly_cost === "number") { costSum += s.total_monthly_cost; costN++; }
    }
    const clickCount: Record<string, number> = {};
    for (const c of clicks ?? []) { const n = String(c.supplement_name ?? "").trim(); if (n) clickCount[n] = (clickCount[n] ?? 0) + 1; }
    const top = (m: Record<string, number>, k: number): [string, number][] => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, k);
    return { quizzes, topGoals: top(goalCount, 6), avgCost: costN ? Math.round(costSum / costN) : null, topClicks: top(clickCount, 8) };
  } catch { return null; }
}

export default async function DataStudy() {
  // ── Static dataset analysis (substantial today, no user data needed) ──
  const ingredients = SUPPLEMENT_DB.length;
  const pairs = INTERACTIONS.length;
  const byKind = INTERACTIONS.reduce<Record<InteractionKind, number>>((m, i) => { m[i.kind] = (m[i.kind] ?? 0) + 1; return m; }, {} as Record<InteractionKind, number>);
  const caution = INTERACTIONS.filter(i => i.kind === "caution");
  const redundant = INTERACTIONS.filter(i => i.kind === "redundant");

  // Evidence distribution across ingredients
  const evid = SUPPLEMENT_DB.reduce<Record<string, number>>((m, s) => { m[s.evidence] = (m[s.evidence] ?? 0) + 1; return m; }, {});
  const strongish = (evid["very strong"] ?? 0) + (evid["strong"] ?? 0);

  // Timing windows
  const windows = TIMING_IDS.reduce<Record<string, number>>((m, id) => { const w = TIMING[id].window; m[w] = (m[w] ?? 0) + 1; return m; }, {});
  const withFood = TIMING_IDS.filter(id => /food|meal/i.test(TIMING[id].food)).length;

  // Nutrient frequency across symptoms (which nutrient is linked to the most symptoms)
  const nutFreq: Record<string, number> = {};
  for (const k of SYMPTOM_SLUGS) for (const n of SYMPTOMS[k].nutrients) nutFreq[n] = (nutFreq[n] ?? 0) + 1;
  const topNutrients = Object.entries(nutFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const live = await liveData();

  const stat = [
    [`${ingredients}`, "supplements graded"],
    [`${pairs}`, "interaction pairs mapped"],
    [`${TIMING_IDS.length}`, "timing guides"],
    [`${SYMPTOM_SLUGS.length}`, "symptoms analysed"],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: "The State of Supplement Stacking 2026",
        description: `An analysis of ${ingredients} dietary supplements, ${pairs} supplement interaction pairs, and ${TIMING_IDS.length} timing guides.`,
        url: `${BASE}/research/state-of-supplement-stacking`,
        creator: { "@type": "Organization", name: "suppdoc", url: BASE },
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
      },
      {
        "@type": "Article",
        headline: "The State of Supplement Stacking 2026",
        author: { "@type": "Organization", name: "suppdoc" },
        publisher: { "@type": "Organization", name: "suppdoc" },
        datePublished: "2026-06-02",
        mainEntityOfPage: `${BASE}/research/state-of-supplement-stacking`,
      },
    ],
  };

  const bar = (label: string, n: number, total: number, hue: string) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: TH.inkSoft, marginBottom: 5 }}>
        <span style={{ fontWeight: 600, color: TH.ink }}>{label}</span><span>{n} · {pct(n, total)}%</span>
      </div>
      <div style={{ height: 9, background: TH.bg, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct(n, total)}%`, height: "100%", background: hue, borderRadius: 999 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main-content" style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>suppdoc data report · 2026</div>
          <h1 style={{ ...D, fontSize: "clamp(32px, 6vw, 54px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            The State of <span style={SI}>Supplement Stacking</span>
          </h1>
          <p style={{ fontSize: 18, color: TH.inkSoft, lineHeight: 1.55, margin: "0 0 26px", maxWidth: 660 }}>
            We mapped {ingredients} supplements, {pairs} interaction pairs, and {TIMING_IDS.length} timing guides into one evidence-graded dataset. Here is what it shows about what is redundant, what to never combine, when to take things, and the nutrients linked to the most symptoms. Free to cite with a link.
          </p>

          {/* Headline stat strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 36 }}>
            {stat.map(([n, l]) => (
              <div key={l} style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 18px", textAlign: "center" }}>
                <div style={{ ...D, fontSize: 34, color: TH.ink, letterSpacing: "-0.03em" }}>{n}</div>
                <div style={{ fontSize: 12.5, color: TH.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Finding 1: interactions */}
          <Finding n="01" title="Most supplement pairs people worry about do interact, but rarely dangerously.">
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
              Of the {pairs} common supplement pairs we mapped, only <strong style={{ color: TH.ink }}>{byKind.caution ?? 0} ({pct(byKind.caution ?? 0, pairs)}%)</strong> warrant real caution. Far more often the issue is money or timing, not safety: <strong style={{ color: TH.ink }}>{byKind.redundant ?? 0}</strong> pairs are redundant (you are paying twice for the same effect) and <strong style={{ color: TH.ink }}>{byKind.timing ?? 0}</strong> simply need to be spaced apart.
            </p>
            <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px" }}>
              {bar("Work better together (synergy)", byKind.synergy ?? 0, pairs, "#3f7a52")}
              {bar("Space them apart (timing)", byKind.timing ?? 0, pairs, "#b5751e")}
              {bar("Redundant, pick one", byKind.redundant ?? 0, pairs, "#6b4fc7")}
              {bar("Use with caution", byKind.caution ?? 0, pairs, "#b91c1c")}
            </div>
          </Finding>

          {/* Finding 2: the redundant ones */}
          <Finding n="02" title={`${byKind.redundant ?? 0} pairs are redundant. People routinely pay twice for the same effect.`}>
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>
              The most common waste in a stack is buying two things that do the same job. A sample of the redundant pairs in the dataset:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: 8 }}>
              {redundant.slice(0, 8).map(it => (
                <Link key={interactionSlug(it.a, it.b)} href={`/interactions/${interactionSlug(it.a, it.b)}`} style={{ display: "block", background: "#f4f1ff", border: "1px solid #6b4fc733", borderRadius: 12, padding: "11px 14px", textDecoration: "none", color: "inherit" }}>
                  <span style={{ ...D, fontSize: 14, color: TH.ink }}>{ingName(it.a)} + {ingName(it.b)}</span>
                </Link>
              ))}
            </div>
          </Finding>

          {/* Finding 3: caution */}
          <Finding n="03" title="The combinations that actually need caution cluster around bleeding and serotonin.">
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>
              The {caution.length} caution pairs are dominated by two themes: stacking blood-thinning supplements (omega-3, ginkgo, nattokinase, garlic), and stacking serotonin-raising ones (5-HTP, saffron, tryptophan), which matters most for anyone on medication. The flagged pairs:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: 8 }}>
              {caution.slice(0, 9).map(it => (
                <Link key={interactionSlug(it.a, it.b)} href={`/interactions/${interactionSlug(it.a, it.b)}`} style={{ display: "block", background: "color-mix(in srgb, var(--c-destructive) 12%, transparent)", border: "1px solid #b91c1c33", borderRadius: 12, padding: "11px 14px", textDecoration: "none", color: "inherit" }}>
                  <span style={{ ...D, fontSize: 14, color: TH.ink }}>{ingName(it.a)} + {ingName(it.b)}</span>
                </Link>
              ))}
            </div>
          </Finding>

          {/* Finding 4: timing */}
          <Finding n="04" title="Timing matters more than most people think, and the rules are not obvious.">
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
              Across {TIMING_IDS.length} supplements with a meaningful timing rule, <strong style={{ color: TH.ink }}>{withFood} ({pct(withFood, TIMING_IDS.length)}%)</strong> absorb best with food, and the split between morning and evening is real, not random. Calming nutrients cluster at night; stimulating and fat-soluble ones cluster in the day.
            </p>
            <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 20px" }}>
              {bar("Best with meals", windows["with-meals"] ?? 0, TIMING_IDS.length, "#3f7a52")}
              {bar("Best in the morning", windows["morning"] ?? 0, TIMING_IDS.length, "#b5751e")}
              {bar("Best in the evening / bedtime", (windows["evening"] ?? 0) + (windows["bedtime"] ?? 0), TIMING_IDS.length, "#3f4f7a")}
              {bar("Anytime, consistency matters most", windows["anytime"] ?? 0, TIMING_IDS.length, "#6b7280")}
            </div>
          </Finding>

          {/* Finding 5: nutrients linked to most symptoms */}
          <Finding n="05" title="A handful of nutrients are linked to the widest range of symptoms.">
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
              Across {SYMPTOM_SLUGS.length} common symptoms we analysed, the same few nutrients keep appearing. These are the ones worth ruling out first when something feels off, and the ones a simple blood panel covers.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
              {topNutrients.map(([id, n]) => (
                <Link key={id} href={`/ingredients/${id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "14px 16px", textDecoration: "none", color: "inherit" }}>
                  <span style={{ ...D, fontSize: 15, color: TH.ink }}>{ingName(id)}</span>
                  <span style={{ ...MM, fontSize: 12, color: TH.sageDeep }}>{n} symptoms</span>
                </Link>
              ))}
            </div>
          </Finding>

          {/* Finding 6: evidence honesty */}
          <Finding n="06" title="Only a minority of popular supplements have strong evidence, and we say so.">
            <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: 0 }}>
              Of the {ingredients} supplements in the database, <strong style={{ color: TH.ink }}>{strongish} ({pct(strongish, ingredients)}%)</strong> are graded strong or very strong, with the rest moderate or emerging. The honest read: a small core (creatine, omega-3, vitamin D, magnesium, protein) is well-proven, and most of the rest is reasonable but not settled. Grading this openly, rather than hyping everything, is the point of suppdoc.
            </p>
          </Finding>

          {/* Live user data (only when there is enough) */}
          {live && (
            <Finding n="07" title={`What ${live.quizzes.toLocaleString()} suppdoc users are actually stacking for.`}>
              <p style={{ fontSize: 15.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
                Aggregated and anonymised from {live.quizzes.toLocaleString()} quiz results{live.avgCost ? `, with an average stack costing about $${live.avgCost} per month` : ""}. Top goals and most-clicked supplements:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ ...MM, fontSize: 10, color: TH.mutedDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Top goals</div>
                  {live.topGoals.map(([g, n]) => <div key={g} style={{ fontSize: 14, color: TH.ink, marginBottom: 6, display: "flex", justifyContent: "space-between" }}><span>{g}</span><span style={{ color: TH.muted }}>{n}</span></div>)}
                </div>
                <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ ...MM, fontSize: 10, color: TH.mutedDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Most-clicked supplements</div>
                  {live.topClicks.map(([s, n]) => <div key={s} style={{ fontSize: 14, color: TH.ink, marginBottom: 6, display: "flex", justifyContent: "space-between" }}><span>{s}</span><span style={{ color: TH.muted }}>{n}</span></div>)}
                </div>
              </div>
            </Finding>
          )}

          {/* Methodology + cite */}
          <section style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "24px 26px", marginTop: 12, marginBottom: 24 }}>
            <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Methodology and citation</h2>
            <p style={{ fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>
              Figures are derived from suppdoc.io&apos;s own structured datasets: {ingredients} evidence-graded ingredient profiles, {pairs} hand-curated interaction pairs, {TIMING_IDS.length} timing guides, {SYMPTOM_SLUGS.length} symptom-to-nutrient maps, and {BIOMARKERS.length} biomarker references. Interaction categories follow a fixed taxonomy (synergy, timing, redundant, caution). User figures, where shown, are aggregated and anonymised. This report updates as the datasets grow.
            </p>
            <div style={{ ...MM, fontSize: 12, color: TH.ink, background: TH.bg, border: `1px solid ${TH.edge}`, borderRadius: 10, padding: "12px 14px", lineHeight: 1.6 }}>
              suppdoc.io (2026). The State of Supplement Stacking. https://www.suppdoc.io/research/state-of-supplement-stacking
            </div>
            <p style={{ fontSize: 12.5, color: TH.muted, marginTop: 12 }}>Free to cite and reference with a link to suppdoc.io. For data requests or press, contact hello@suppdoc.io.</p>
          </section>

          {/* CTA */}
          <div style={{ background: TH.inkBg, color: "#fff", borderRadius: 18, padding: "24px 26px", textAlign: "center" }}>
            <h2 style={{ ...D, fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Check your own stack against the data</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 16px" }}>Paste what you take and the free checker flags every interaction, redundancy, and timing issue in seconds.</p>
            <Link href="/audit" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 999, background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 14.5 }}>Run the free audit →</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Finding({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ ...MM, fontSize: 12, color: TH.sageDeep, letterSpacing: "0.1em", marginBottom: 8 }}>Finding {n}</div>
      <h2 style={{ ...D, fontSize: "clamp(20px, 3.2vw, 26px)", color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{title}</h2>
      {children}
    </section>
  );
}
