import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f4ede1", paper: "#fbf6ec", ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", burgundy: "#7d2e3a", line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export const metadata: Metadata = {
  title: "About — Phyla",
  description: "Phyla composes AI-guided supplement rituals from clean, evidence-led ingredients. Built to help you understand your stack — not just sell it.",
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>— ABOUT PHYLA —</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          A quieter way to <em style={{ color: th.burgundy }}>supplement</em>.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 18, lineHeight: 1.6, maxWidth: 640, margin: "24px auto 0" }}>
          Phyla composes personalised supplement rituals from clean, evidence-led ingredients. We exist because most supplement advice is either too generic or too aggressive — and the average person deserves better.
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              Our philosophy
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              Most supplement brands push a generic stack at everyone. We do the opposite: we ask you 25 thoughtful questions about your body, lifestyle, and goals — then build a small, specific stack from clean ingredients that fits your budget. Less marketing, more matching.
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              Why we don&apos;t sell supplements directly
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              We&apos;d rather you buy proven, third-party-tested brands from a trusted global retailer than from us. So instead of launching our own private label, we curate the top three products on iHerb for each recommendation — established brands like NOW Foods, Doctor&apos;s Best, Thorne, Sports Research, and Garden of Life. You buy direct. We earn a small affiliate commission. Your stack stays honest.
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              How we vet ingredients
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              Every ingredient in our database meets four criteria:
            </p>
            <ul style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.8, paddingLeft: 0, listStyle: "none", marginTop: 12 }}>
              <li>· Peer-reviewed evidence (mostly RCTs or strong observational data)</li>
              <li>· A clear mechanism of action</li>
              <li>· A reasonable safety profile at common doses</li>
              <li>· Available in clean forms from multiple brands on iHerb</li>
            </ul>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
              If a supplement doesn&apos;t pass all four — even if it&apos;s trendy — we don&apos;t recommend it.
            </p>
          </div>

          <div>
            <h2 style={{ ...S, fontSize: 36, margin: "0 0 14px", letterSpacing: "-0.02em", color: th.ink }}>
              What Phyla is not
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 16, lineHeight: 1.7 }}>
              We&apos;re not medical professionals. We don&apos;t diagnose, treat, or cure conditions. We don&apos;t replace your doctor, dietitian, or pharmacist. For any health concerns — and especially before starting supplements — talk to a qualified clinician. Our recommendations are educational.
            </p>
          </div>

          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
            padding: 36, textAlign: "center",
          }}>
            <h2 style={{ ...S, fontSize: 32, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Ready to start?
            </h2>
            <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>
              The 60-second quiz takes you from question to ritual.
            </p>
            <Link href="/quiz" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 26px", borderRadius: 999, fontSize: 15, fontWeight: 500,
              background: th.burgundy, color: "#fbf6ec", textDecoration: "none",
            }}>
              Begin your analysis →
            </Link>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
