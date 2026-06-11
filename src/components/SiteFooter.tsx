"use client";

import Link from "next/link";
import SuppdocLogo from "@/components/SuppdocLogo";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";
import { useT } from "@/components/I18nProvider";
import { TH } from "@/lib/theme";

// Each link is [translation key, href]. Labels resolve through the dictionary;
// hrefs go through lh() so localized targets (/quiz, /pricing, /about, …) get a
// /fr|/de|/es prefix while un-localized ones stay on the English route.
const COLS: [string, [string, string][]][] = [
  ["Product", [
    ["footerLink.quiz", "/quiz"],
    ["footerLink.build", "/build"],
    ["footerLink.audit", "/audit"],
    ["footerLink.bloodwork", "/bloodwork"],
  ]],
  ["Explore", [
    ["footerLink.ingredients", "/ingredients"],
    ["footerLink.interactions", "/interactions"],
    ["footerLink.timing", "/timing"],
    ["footerLink.symptoms", "/symptoms"],
    ["footerLink.biomarkers", "/biomarkers"],
    ["footerLink.best", "/best"],
    ["footerLink.stacks", "/stacks"],
    ["footerLink.compare", "/compare"],
    ["footerLink.dataReport", "/research/state-of-supplement-stacking"],
    ["footerLink.journal", "/journal"],
  ]],
  ["Company", [
    ["footerLink.about", "/about"],
    ["footerLink.editorial", "/editorial"],
    ["footerLink.team", "/team"],
    ["footerLink.methodology", "/methodology"],
    ["footerLink.help", "/help"],
    ["footerLink.changelog", "/changelog"],
    ["footerLink.contact", "/contact"],
  ]],
  ["Legal", [
    ["footerLink.terms", "/terms"],
    ["footerLink.privacy", "/privacy"],
    ["footerLink.refunds", "/refunds"],
    ["footerLink.cookies", "/cookies"],
    ["footerLink.disclaimer", "/disclaimer"],
  ]],
];

const HEADING_KEY: Record<string, string> = { Product: "footer.product", Explore: "footer.explore", Company: "footer.company", Legal: "footer.legal" };

export default function SiteFooter() {
  const { t, lh } = useT();
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
              {t("footer.affiliate")}
            </p>
          </div>
          {COLS.map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 13, color: TH.ink, fontWeight: 600, marginBottom: 16 }}>
                {t(HEADING_KEY[heading] ?? heading)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {links.map(([labelKey, href]) => (
                  <Link key={labelKey} href={lh(href)} style={{
                    fontSize: 14, color: TH.muted, textDecoration: "none",
                    padding: "6px 0", display: "inline-block",
                  }}>
                    {t(labelKey)}
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
