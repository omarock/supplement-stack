import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", burgundy: "#0a2540", line: "rgba(10,37,64,0.08)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

export const metadata: Metadata = {
  title: "Help & FAQ — suppdoc.io",
  description: "Frequently asked questions about Phyla's quiz, supplement recommendations, iHerb affiliate links, and safety guidelines.",
};

const FAQ: { section: string; items: [string, string][] }[] = [
  {
    section: "About the quiz",
    items: [
      ["How long does the quiz take?", "About 3 minutes. We ask 10 short questions about your goals, lifestyle, body, and budget. You can save progress and come back later — answers are stored in your browser."],
      ["Do I need an account?", "No. Your answers stay on your device. We don't collect emails unless you opt in to save your results."],
      ["What if I'm not sure how to answer a question?", "Pick the closest match. The recommendation engine works on a profile across all answers — no single question dominates the output."],
    ],
  },
  {
    section: "About the recommendations",
    items: [
      ["How does Phyla pick my supplements?", "Each supplement in our database is tagged with the goals and conditions it addresses. We build a profile from your quiz, score every supplement by how well it matches, apply safety filters (pregnancy, blood thinners, allergies), then pick the highest-scoring options within your budget."],
      ["Are the recommendations medical advice?", "No. Phyla offers educational guidance based on your inputs and the published evidence. For diagnosis or treatment, please consult a qualified clinician."],
      ["Can I trust the brands you suggest?", "Yes — we curate well-established brands available on iHerb (NOW Foods, Doctor's Best, Sports Research, Thorne, Jarrow, Garden of Life, etc.). All are widely trusted, third-party tested, and have decades of track record."],
    ],
  },
  {
    section: "Buying on iHerb",
    items: [
      ["Why iHerb?", "It's one of the largest, most trusted global retailers for supplements. They ship to most countries, offer competitive prices, and rigorously test for quality."],
      ["Do I have to use iHerb?", "Not at all. You're free to buy your stack anywhere. The product information (brand, dose, form) is the same regardless of where you shop."],
      ["What does 'affiliate' mean?", "If you click through to iHerb from our site and buy something, iHerb pays us a small commission — at no extra cost to you. It's how we fund building Phyla without selling our own products."],
    ],
  },
  {
    section: "Safety",
    items: [
      ["I'm pregnant or nursing — is this safe?", "Our engine automatically removes supplements that aren't recommended during pregnancy (e.g. ashwagandha). However, you should ALWAYS consult your obstetrician before starting any new supplement during pregnancy or lactation."],
      ["I take prescription medications. What should I do?", "Talk to your doctor or pharmacist before starting any new supplement. Several common supplements interact with medications — particularly blood thinners, thyroid medication, and antidepressants."],
      ["What if I have allergies?", "We ask about common allergies in the quiz and filter the stack accordingly. Always double-check product labels for trace ingredients before purchasing."],
    ],
  },
];

export default function HelpPage() {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>— HELP & FAQ —</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          Gentle <em style={{ color: th.burgundy }}>answers</em>.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "20px auto 0" }}>
          Common questions about the quiz, your stack, and how Phyla works.
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>
          {FAQ.map(group => (
            <div key={group.section}>
              <h2 style={{ ...S, fontSize: 32, margin: "0 0 18px", letterSpacing: "-0.02em", color: th.ink }}>
                {group.section}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {group.items.map(([q, a]) => (
                  <details key={q} style={{
                    background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14,
                    padding: "16px 20px",
                  }}>
                    <summary style={{
                      ...S, fontSize: 20, color: th.ink, letterSpacing: "-0.01em", cursor: "pointer",
                      listStyle: "none",
                    }}>
                      {q}
                    </summary>
                    <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.65, margin: "12px 0 0" }}>
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div style={{
            background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
            padding: 28, textAlign: "center", marginTop: 24,
          }}>
            <h3 style={{ ...S, fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Didn&apos;t find your answer?
            </h3>
            <p style={{ color: th.inkSoft, fontSize: 15, margin: "0 0 18px" }}>
              Reach us by email — we reply within one business day.
            </p>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
              background: th.ink, color: th.bg, textDecoration: "none",
            }}>
              Contact us →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
