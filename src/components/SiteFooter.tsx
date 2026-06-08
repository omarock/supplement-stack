"use client";

import Link from "next/link";
import SuppdocLogo from "@/components/SuppdocLogo";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";
import { useT } from "@/components/I18nProvider";
import { TH } from "@/lib/theme";

const COLS: [string, [string, string][]][] = [
  ["Product", [
    ["Take the quiz", "/quiz"],
    ["Build your own", "/build"],
    ["Audit my stack", "/audit"],
    ["Bloodwork analysis", "/bloodwork"],
  ]],
  ["Explore", [
    ["Ingredients", "/ingredients"],
    ["Interactions", "/interactions"],
    ["Supplement timing", "/timing"],
    ["Supplements for symptoms", "/symptoms"],
    ["Biomarkers", "/biomarkers"],
    ["Best for your goal", "/best"],
    ["Pre-made stacks", "/stacks"],
    ["Compare", "/compare"],
    ["Data report", "/research/state-of-supplement-stacking"],
    ["Journal", "/journal"],
  ]],
  ["Company", [
    ["About", "/about"],
    ["Editorial standards", "/editorial"],
    ["Our team", "/team"],
    ["Methodology", "/methodology"],
    ["Help & FAQ", "/help"],
    ["Changelog", "/changelog"],
    ["Contact", "/contact"],
  ]],
  ["Legal", [
    ["Terms", "/terms"],
    ["Privacy", "/privacy"],
    ["Refunds", "/refunds"],
    ["Cookies", "/cookies"],
    ["Medical disclaimer", "/disclaimer"],
  ]],
];

const HEADING_KEY: Record<string, string> = { Product: "footer.product", Explore: "footer.explore", Company: "footer.company", Legal: "footer.legal" };

export default function SiteFooter() {
  const { t } = useT();
  return (
    <footer style={{
      padding: "56px var(--nav-pad-x) 36px",
      borderTop: `1px solid ${TH.edge}`,
      background: TH.bg,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "var(--footer-cols)", gap: 28,
          marginBottom: 40,
        }}>
          <div>
            <SuppdocLogo size={18} />
            <p style={{ fontSize: 14, color: TH.muted, lineHeight: 1.55, marginTop: 18, maxWidth: 320 }}>
              {t("footer.tagline")}
            </p>
            <p style={{ fontSize: 11, color: TH.muted, marginTop: 18, lineHeight: 1.5 }}>
              © {new Date().getFullYear()} suppdoc.io. {t("footer.rights")}
              <br />
              suppdoc.io is an affiliate of iHerb, Amazon and other trusted retailers.
            </p>
          </div>
          {COLS.map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 13, color: TH.ink, fontWeight: 600, marginBottom: 16 }}>
                {t(HEADING_KEY[heading] ?? heading)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(([label, href]) => (
                  <Link key={label} href={href} style={{
                    fontSize: 14, color: TH.muted, textDecoration: "none",
                  }}>
                    {label}
                  </Link>
                ))}
                {heading === "Legal" && <CookiePreferencesButton />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
