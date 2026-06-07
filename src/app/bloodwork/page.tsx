import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BloodworkClient from "./BloodworkClient";

export const metadata: Metadata = {
  title: "Bloodwork Supplement Analysis (free), upload your labs | suppdoc.io",
  description: "Free bloodwork supplement analysis: upload a blood test PDF or photo and we read your biomarkers, flag what's low or high, and suggests evidence-led, targeted supplements. Private, educational, not a diagnosis.",
  keywords: "bloodwork supplement analysis, blood test supplement recommendations, analyze blood test results, biomarker supplements, lab results supplements, what supplements for low ferritin vitamin d",
  alternates: { canonical: "https://www.suppdoc.io/bloodwork" },
  openGraph: {
    title: "Bloodwork Supplement Analysis, suppdoc.io",
    description: "Upload your labs. We read your biomarkers and match evidence-led supplements. Private and educational, never a diagnosis.",
  },
};

export const dynamic = "force-dynamic";

const BLOODWORK_FAQ = [
  { q: "Can suppdoc analyze my blood test results?", a: "Yes. Upload a blood test PDF or photo and suppdoc extracts your biomarkers, compares them to healthy ranges, flags what's low or high, and suggests evidence-led, targeted supplements, with clear prompts on what to discuss with your doctor." },
  { q: "Which biomarkers does it read?", a: "Vitamin D, ferritin, B12, magnesium, TSH and thyroid markers, fasting glucose, HbA1c, a full lipid panel, hs-CRP, homocysteine, testosterone, and more." },
  { q: "Is my data private?", a: "Yes. Your file is read once and never stored. Only signed-in users who choose to save get a de-identified, structured copy of the results, never the original file." },
  { q: "Is this a diagnosis?", a: "No. It's educational and evidence-led, not medical advice or diagnosis. Reference ranges vary by lab, age, sex, and medication, always review results with a qualified clinician." },
];

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BLOODWORK_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div style={{ minHeight: "100vh", background: "#f6f5f1", color: "#0a2540", fontFamily: '"Inter", system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <BloodworkClient signedIn={signedIn} />
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--section-pad-x) 72px" }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600, fontSize: 24, color: "#0a2540", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          Bloodwork analysis, FAQ
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {BLOODWORK_FAQ.map((f, i) => (
            <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(10,37,64,0.08)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0a2540", marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 14, color: "#3c4858", lineHeight: 1.55 }}>{f.a}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            ["What your biomarkers mean", "/biomarkers"],
            ["All 200+ ingredients", "/ingredients"],
            ["Best time to take each supplement", "/timing"],
            ["Interaction checker", "/interactions"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{
              padding: "9px 16px", background: "#ffffff", border: "1px solid rgba(10,37,64,0.08)",
              borderRadius: 999, textDecoration: "none", color: "#3c4858", fontSize: 13.5, fontWeight: 500,
            }}>{label}</Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
