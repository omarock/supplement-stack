import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UpgradeCTA from "@/components/UpgradeCTA";
import PrintButton from "@/components/PrintButton";
import { getSessionUser } from "@/lib/auth-server";
import { getSubscription, isPremium } from "@/lib/premium";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { SUPPLEMENT_DB } from "@/lib/supplements";
import { getPrimaryProduct, productImage, type ProductOption } from "@/lib/products";
import { iherbLink, iherbProductLink } from "@/lib/iherb";
import { amazonEnabled, amazonLink, amazonProductLink } from "@/lib/amazon";
import { INTERACTIONS, interactionSlug, KIND_META } from "@/lib/interactions";
import { TH, FONTS } from "@/lib/theme";

export const metadata: Metadata = { title: "Your personalized plan, suppdoc.io", robots: "noindex,nofollow" };
export const dynamic = "force-dynamic";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const WINDOWS: { key: string; label: string; hint: string }[] = [
  { key: "morning", label: "Morning", hint: "with breakfast" },
  { key: "midday", label: "Midday", hint: "with lunch" },
  { key: "evening", label: "Evening", hint: "with dinner / before bed" },
  { key: "pre-train", label: "Pre-workout", hint: "30–45 min before training" },
];

interface RawItem { id: string; name: string; brand?: string; dose?: string; timing?: string }
interface PlanItem { id: string; name: string; dose: string; timing: string; why: string; product: ProductOption | null; monthly: number }

export default async function PlanPage() {
  const user = await getSessionUser();
  if (!user?.email) redirect("/signin?error=please_sign_in&redirect=/plan");

  const premium = isPremium(await getSubscription(user.email));
  const admin = getAdminSupabase();
  const { data } = admin
    ? await admin.from("quiz_submissions")
        .select("recommendation, total_monthly_cost, goals, created_at")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
    : { data: null };

  const quiz = (data?.[0] ?? null) as { recommendation?: { supplements?: RawItem[] }; total_monthly_cost?: number; goals?: string[]; created_at?: string } | null;
  const raw: RawItem[] = quiz?.recommendation?.supplements ?? [];

  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 90px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Link href="/me" className="no-print" style={{ ...MM, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: TH.sageDeep, textDecoration: "none", marginBottom: 16 }}>← My Stack</Link>
          {raw.length === 0 ? <EmptyState /> : <Plan raw={raw} quiz={quiz!} premium={premium} email={user.email} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>My Plan</div>
      <h1 style={{ ...D, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
        Your plan is <span style={SI}>one quiz away</span>.
      </h1>
      <p style={{ fontSize: 16, color: TH.inkSoft, maxWidth: 460, margin: "0 auto 22px", lineHeight: 1.55 }}>
        Take the 2-minute quiz and we&apos;ll build a personalized protocol: what to take, the dose, the timing, what to avoid, and where to buy it.
      </p>
      <Link href="/quiz" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 999, background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff", textDecoration: "none", ...D, fontWeight: 600, fontSize: 15 }}>
        Take the quiz →
      </Link>
    </div>
  );
}

function Plan({ raw, quiz, premium, email }: { raw: RawItem[]; quiz: { total_monthly_cost?: number; goals?: string[]; created_at?: string }; premium: boolean; email: string }) {
  const generatedOn = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  // Enrich from the live catalog (dose/why/product), falling back to stored values.
  const items: PlanItem[] = raw.map(r => {
    const db = SUPPLEMENT_DB.find(s => s.id === r.id);
    return {
      id: r.id,
      name: (db?.name ?? r.name ?? r.id).split(" (")[0],
      dose: r.dose || db?.dose || "",
      timing: (r.timing || db?.timing || "morning"),
      why: db?.why || db?.purpose || "",
      product: getPrimaryProduct(r.id) ?? null,
      monthly: db?.monthlyCost ?? 0,
    };
  });

  const goals = (quiz.goals ?? []).slice(0, 4);
  const monthly = quiz.total_monthly_cost ?? items.reduce((n, i) => n + i.monthly, 0);
  const ids = new Set(items.map(i => i.id));
  const warnings = INTERACTIONS.filter(i => ids.has(i.a) && ids.has(i.b) && (i.kind === "caution" || i.kind === "timing" || i.kind === "redundant"));

  return (
    <>
      <style>{`
        .print-only { display: none; }
        .plan-buy { transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
        .plan-buy-iherb:hover { transform: translateY(-1px); filter: brightness(1.12); box-shadow: 0 7px 16px -6px color-mix(in srgb, var(--c-ink) 45%, transparent); }
        .plan-buy-amazon:hover { transform: translateY(-1px); border-color: var(--c-sage); box-shadow: 0 6px 14px -8px rgba(10,37,64,0.22); }
        .plan-buy .buy-arrow { opacity: .65; transition: transform .15s ease; }
        .plan-buy:hover .buy-arrow { transform: translate(1px,-1px); opacity: 1; }
        @media print {
          @page { margin: 14mm; }
          header, footer, .no-print { display: none !important; }
          .print-only { display: block !important; }
          ${premium ? ".plan-blur { filter: none !important; pointer-events: auto !important; user-select: auto !important; }" : ""}
          section { break-inside: avoid; }
          .plan-item { break-inside: avoid; }
          a { text-decoration: none !important; color: inherit !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Branded header, print / PDF only */}
      <div className="print-only" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${TH.edge}`, paddingBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 40 40" aria-hidden>
              <path d="M 20 36 Q 20 24 20 12" stroke={TH.sageDeep} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 20 23 Q 12 22 8 15 Q 14 14.5 20 23 Z" fill={TH.sageDeep} />
              <path d="M 20 19 Q 28 18 32 11 Q 26 10.5 20 19 Z" fill={TH.sageDeep} />
              <circle cx="20" cy="10" r="3.5" fill={TH.sageDeep} />
            </svg>
            <span style={{ ...D, fontSize: 18, color: TH.ink, letterSpacing: "-0.02em" }}>suppdoc<span style={{ color: TH.sageDeep }}>.io</span></span>
          </span>
          <span style={{ ...MM, fontSize: 11, color: TH.muted }}>Generated {generatedOn}</span>
        </div>
        <div style={{ ...MM, fontSize: 11, color: TH.muted, marginTop: 6 }}>Prepared for {email}</div>
      </div>

      {/* Print-only summary (the gradient hero below is screen-only) */}
      <div className="print-only" style={{ marginBottom: 18 }}>
        <h1 style={{ ...D, fontSize: 24, color: TH.ink, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Your personalized protocol</h1>
        <div style={{ ...MM, fontSize: 12.5, color: TH.inkSoft }}>
          {items.length} supplements · ${Math.round(monthly)}/month · {warnings.length} combo{warnings.length === 1 ? "" : "s"} to watch
        </div>
        {goals.length > 0 && (
          <div style={{ ...MM, fontSize: 11.5, color: TH.muted, marginTop: 6 }}>Goals: {goals.join(" · ")}</div>
        )}
      </div>

      {/* Premium hero band (screen only; matches the /me + tracker language) */}
      <header className="no-print" style={{
        position: "relative", overflow: "hidden", borderRadius: 24, padding: "26px 26px 24px", marginBottom: 22,
        background: "linear-gradient(135deg, #0b3a31 0%, #14614d 52%, #2f9070 100%)", color: "#fff",
        boxShadow: "0 22px 50px -26px rgba(11,58,49,0.6)",
      }}>
        <div style={{ position: "absolute", right: -50, top: -50, width: 230, height: 230, borderRadius: 999, background: "radial-gradient(circle, rgba(240,180,158,0.32), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, position: "relative", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...MM, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>My Plan</div>
            <h1 style={{ ...D, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Your personalized <span style={{ ...SI, color: "#ffe2cf" }}>protocol</span>.
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{
              ...MM, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 999, whiteSpace: "nowrap",
              background: premium ? "linear-gradient(180deg,#f5d08a,#e0a040)" : "rgba(255,255,255,0.16)", color: premium ? "#3a2a06" : "#fff",
            }}>{premium ? "★ PREMIUM" : "FREE PLAN"}</span>
            {premium && <PrintButton label="Download / print" />}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22, position: "relative" }}>
          <HeroStat n={String(items.length)} l="supplements" />
          <HeroStat n={`$${Math.round(monthly)}`} l="per month" />
          <HeroStat n={String(warnings.length)} l={`combo${warnings.length === 1 ? "" : "s"} to watch`} />
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, position: "relative" }}>
            {goals.map(g => <span key={g} style={{ ...MM, fontSize: 11, color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)", padding: "4px 11px", borderRadius: 999 }}>{g}</span>)}
          </div>
        )}
      </header>

      {/* Detailed plan — blurred + overlaid for free users */}
      <div style={{ position: "relative" }}>
        <div className="plan-blur" style={{ filter: premium ? undefined : "blur(7px)", pointerEvents: premium ? undefined : "none", userSelect: premium ? undefined : "none" }} aria-hidden={!premium}>
          {/* Daily schedule */}
          {WINDOWS.map(w => {
            const inWindow = items.filter(i => i.timing === w.key);
            if (inWindow.length === 0) return null;
            return (
              <section key={w.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
                  <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: 0, letterSpacing: "-0.015em" }}>{w.label}</h2>
                  <span style={{ ...MM, fontSize: 11, color: TH.muted }}>{w.hint}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {inWindow.map(it => <ItemCard key={it.id} it={it} />)}
                </div>
              </section>
            );
          })}

          {/* Watch-outs */}
          {warnings.length > 0 && (
            <section style={{ marginTop: 6, marginBottom: 18 }}>
              <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: "0 0 10px", letterSpacing: "-0.015em" }}>Combinations to watch</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {warnings.map((w, i) => {
                  const meta = KIND_META[w.kind];
                  return (
                    <Link key={i} href={`/interactions/${interactionSlug(w.a, w.b)}`} style={{ display: "block", textDecoration: "none", color: "inherit", background: meta.bg, border: `1px solid ${meta.hue}33`, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ ...MM, fontSize: 10, color: meta.hue, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>{meta.verdict}</div>
                      <div style={{ fontSize: 13.5, color: TH.ink, lineHeight: 1.45 }}>{w.summary}</div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <p style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.6, marginTop: 8 }}>
            Educational only, not medical advice. Re-check your plan after your next bloodwork or a change in goals.
          </p>
        </div>

        {/* Free preview overlay */}
        {!premium && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ maxWidth: 460, width: "100%" }}>
              <UpgradeCTA
                variant="card"
                title="Your full plan is ready 🔒"
                body={`We've built your ${items.length}-supplement protocol with the exact schedule, doses, what to avoid, and where to buy. Unlock it to view, save, and download it.`}
                perks={[
                  "Full AM/PM schedule with doses",
                  "Combinations to avoid in your stack",
                  "One-click buy links + downloadable PDF",
                ]}
                cta="Unlock my plan"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ItemCard({ it }: { it: PlanItem }) {
  const p = it.product;
  const iherb = p ? (p.productPath ? iherbProductLink(p.productPath) : iherbLink(p.searchQuery ?? it.name)) : iherbLink(it.name);
  const amazon = p?.amazonAsin ? amazonProductLink(p.amazonAsin) : amazonLink(p ? `${p.brand} ${p.productName}` : it.name);
  const img = p ? productImage(p) : null;
  return (
    <div className="plan-item" style={{ display: "flex", gap: 14, alignItems: "center", background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 14, padding: 14 }}>
      <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 10, background: "#fff", border: `1px solid ${TH.edge}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {img
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={img} alt={it.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5 }} />
          : <div aria-hidden style={{ width: 22, height: 34, borderRadius: 11, background: `linear-gradient(135deg, ${TH.sage}, ${TH.sageDeep})` }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/ingredients/${it.id}`} style={{ ...D, fontSize: 15.5, color: TH.ink, textDecoration: "none" }}>{it.name}</Link>
        {it.dose && <span style={{ ...MM, fontSize: 12, color: TH.sageDeep, marginLeft: 8 }}>{it.dose}</span>}
        {it.why && <div style={{ fontSize: 13, color: TH.inkSoft, lineHeight: 1.45, marginTop: 3 }}>{it.why}</div>}
        {p && <div className="print-only" style={{ ...MM, fontSize: 11, color: TH.sageDeep, marginTop: 5 }}>Suggested: {p.brand} {p.productName}</div>}
      </div>
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0, minWidth: 96 }}>
        <a href={iherb} target="_blank" rel="noopener noreferrer sponsored" className="plan-buy plan-buy-iherb" style={{ ...MM, fontSize: 12, fontWeight: 700, color: "#fff", background: TH.inkBg, padding: "9px 14px", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          iHerb <BuyArrow />
        </a>
        {amazonEnabled() && <a href={amazon} target="_blank" rel="noopener noreferrer sponsored" className="plan-buy plan-buy-amazon" style={{ ...MM, fontSize: 12, fontWeight: 700, color: TH.ink, background: TH.surface, border: `1px solid ${TH.edgeStrong}`, padding: "9px 14px", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          Amazon <BuyArrow />
        </a>}
      </div>
    </div>
  );
}

function BuyArrow() {
  return (
    <svg className="buy-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function HeroStat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ flex: "1 1 120px", minWidth: 120, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 16, padding: "14px 16px" }}>
      <div style={{ ...D, fontSize: 28, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 5 }}>{l}</div>
    </div>
  );
}
