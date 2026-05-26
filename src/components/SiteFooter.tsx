import Link from "next/link";
import SuppdocLogo from "@/components/SuppdocLogo";
import { TH } from "@/lib/theme";

const COLS: [string, [string, string][]][] = [
  ["Product", [
    ["Pre-made stacks", "/stacks"],
    ["Take the quiz", "/quiz"],
    ["How it works", "/#how-it-works"],
    ["Ingredients", "/ingredients"],
  ]],
  ["Company", [
    ["About", "/about"],
    ["Journal", "/journal"],
    ["Contact", "/contact"],
    ["Your profile", "/me"],
  ]],
  ["Resources", [
    ["Help & FAQ", "/help"],
    ["Medical disclaimer", "/disclaimer"],
  ]],
  ["Legal", [
    ["Terms", "/terms"],
    ["Privacy", "/privacy"],
    ["Cookies", "/cookies"],
  ]],
];

export default function SiteFooter() {
  return (
    <footer style={{
      padding: "56px var(--nav-pad-x) 36px",
      borderTop: `1px solid ${TH.edge}`,
      background: TH.bg,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "var(--footer-cols)", gap: 40,
          marginBottom: 40,
        }}>
          <div>
            <SuppdocLogo size={18} />
            <p style={{ fontSize: 14, color: TH.muted, lineHeight: 1.55, marginTop: 18, maxWidth: 320 }}>
              AI-powered supplement stacks, made for just you. Based on the published evidence, sourced via iHerb.
            </p>
            <p style={{ fontSize: 11, color: TH.mutedDim, marginTop: 18, lineHeight: 1.5 }}>
              © {new Date().getFullYear()} suppdoc.io. For informational use only — not medical advice.
              <br />
              suppdoc.io is an iHerb affiliate.
            </p>
          </div>
          {COLS.map(([heading, links]) => (
            <div key={heading}>
              <div style={{ fontSize: 13, color: TH.ink, fontWeight: 600, marginBottom: 16 }}>
                {heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(([label, href]) => (
                  <Link key={label} href={href} style={{
                    fontSize: 14, color: TH.muted, textDecoration: "none",
                  }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
