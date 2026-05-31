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
  title: "Contact, suppdoc.io",
  description: "Get in touch with the suppdoc team. Questions about your stack, partnerships, or press inquiries, we reply within one business day.",
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />

      <section style={{ padding: "var(--section-pad-y) var(--section-pad-x) 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 16 }}>- GET IN TOUCH -</div>
        <h1 style={{ ...S, fontSize: "var(--section-h2)", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          We&apos;d love to <em style={{ color: th.burgundy }}>hear from you</em>.
        </h1>
        <p style={{ color: th.inkSoft, fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "20px auto 0" }}>
          Questions about your stack, feedback on the quiz, partnerships, or press inquiries, we reply within one business day.
        </p>
      </section>

      <section style={{ padding: "0 var(--section-pad-x) var(--section-pad-y)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "var(--grid-3-cols)", gap: 18 }}>
          {[
            { label: "General questions", value: "hello@suppdoc.io", href: "mailto:hello@suppdoc.io", desc: "Quiz feedback, ritual support, anything else." },
            { label: "Partnerships", value: "partners@suppdoc.io", href: "mailto:partners@suppdoc.io", desc: "Affiliate, brand, or distribution partnerships." },
            { label: "Press & media", value: "press@suppdoc.io", href: "mailto:press@suppdoc.io", desc: "Interviews, citations, and content collaborations." },
          ].map(c => (
            <a key={c.label} href={c.href} style={{
              background: th.paper, border: `1px solid ${th.line}`, borderRadius: 18,
              padding: 28, textDecoration: "none", display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em" }}>
                {c.label.toUpperCase()}
              </div>
              <div style={{ ...S, fontSize: 22, color: th.ink, letterSpacing: "-0.01em" }}>{c.value}</div>
              <div style={{ fontSize: 14, color: th.inkSoft, lineHeight: 1.5 }}>{c.desc}</div>
            </a>
          ))}
        </div>

        <div style={{
          maxWidth: 760, margin: "60px auto 0",
          background: th.paper, border: `1px solid ${th.line}`, borderRadius: 20,
          padding: 32, textAlign: "center",
        }}>
          <h2 style={{ ...S, fontSize: 28, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Looking for help with your stack?
          </h2>
          <p style={{ color: th.inkSoft, fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
            Most questions are answered in our help centre. If not, email us above.
          </p>
          <Link href="/help" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 500,
            background: th.ink, color: th.bg, textDecoration: "none",
          }}>
            Visit help centre →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
