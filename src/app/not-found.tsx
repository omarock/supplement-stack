import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS, D } from "@/lib/theme";

export const metadata = {
  title: "Page not found | suppdoc.io",
  description: "The page you were looking for could not be found. Build or audit your supplement stack instead.",
  robots: { index: false, follow: true },
};

const POPULAR: { href: string; label: string; hint: string }[] = [
  { href: "/quiz", label: "Take the quiz", hint: "Your stack in 2 minutes" },
  { href: "/build", label: "Build a stack", hint: "Pick a goal, get a stack" },
  { href: "/audit", label: "Audit my stack", hint: "Interactions, doses & gaps" },
  { href: "/ingredients", label: "Ingredient guides", hint: "200+ evidence-graded" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          minHeight: "62vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "72px 20px",
          background: TH.bg,
        }}
      >
        <div style={{ width: "100%", maxWidth: 620, textAlign: "center" }}>
          <div
            style={{
              ...D,
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: TH.sageDeep,
              marginBottom: 14,
            }}
          >
            Error 404
          </div>

          <h1
            style={{
              ...D,
              fontSize: "clamp(34px, 8vw, 54px)",
              lineHeight: 1.05,
              color: TH.ink,
              margin: "0 0 16px",
            }}
          >
            This page wandered off.
          </h1>

          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 17,
              lineHeight: 1.6,
              color: TH.inkSoft,
              margin: "0 auto 32px",
              maxWidth: 460,
            }}
          >
            The link may be old or the page may have moved. No worries, here&apos;s the
            fastest way back to your stack.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 44,
            }}
          >
            <Link
              href="/"
              style={{
                background: TH.inkBg,
                color: "#fff",
                textDecoration: "none",
                padding: "13px 24px",
                borderRadius: 999,
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 4px 14px color-mix(in srgb, ${TH.ink} 12%, transparent)`,
              }}
            >
              Back to home
            </Link>
            <Link
              href="/quiz"
              style={{
                background: "#fff",
                color: TH.inkBg,
                border: `1px solid ${TH.edge}`,
                textDecoration: "none",
                padding: "13px 24px",
                borderRadius: 999,
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Build my stack →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              textAlign: "left",
            }}
          >
            {POPULAR.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                style={{
                  display: "block",
                  background: TH.surface,
                  border: `1px solid ${TH.edge}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 600,
                    fontSize: 15,
                    color: TH.ink,
                    marginBottom: 3,
                  }}
                >
                  {p.label}
                </div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, color: TH.muted }}>
                  {p.hint}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
