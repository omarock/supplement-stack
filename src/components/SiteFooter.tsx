import Link from "next/link";

const th = {
  bg: "#f4ede1", ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", burgundy: "#7d2e3a",
  line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

const COLS: [string, [string, string][]][] = [
  ["Product", [
    ["How it works", "/#how-it-works"],
    ["Ingredients", "/#ingredients"],
    ["Example", "/#example"],
    ["Take the quiz", "/quiz"],
  ]],
  ["Studio", [
    ["About Phyla", "/about"],
    ["Journal", "/journal"],
    ["Contact", "/contact"],
  ]],
  ["Care", [
    ["Help & FAQ", "/help"],
    ["Contact us", "/contact"],
  ]],
  ["Legal", [
    ["Terms", "/terms"],
    ["Privacy", "/privacy"],
    ["Medical Disclaimer", "/disclaimer"],
    ["Cookies", "/cookies"],
  ]],
];

export default function SiteFooter() {
  return (
    <footer style={{
      padding: "40px var(--nav-pad-x) 48px",
      borderTop: `1px solid ${th.line}`,
      background: th.bg,
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "var(--footer-cols)", gap: 40,
        maxWidth: 1200, margin: "0 auto",
      }}>
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
              <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
              <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
              <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
            </svg>
            <span style={{ ...S, fontSize: 22, color: th.ink, letterSpacing: "-0.01em" }}>phyla</span>
          </Link>
          <p style={{ fontSize: 14, color: th.inkSoft, lineHeight: 1.55, marginTop: 14, maxWidth: 320 }}>
            AI-guided supplement rituals composed from clean, evidence-led ingredients available on iHerb.
          </p>
          <div style={{ fontSize: 11, color: th.inkMute, marginTop: 22, lineHeight: 1.5 }}>
            © {new Date().getFullYear()} Phyla. For informational purposes only — not medical advice.
            <br />
            Phyla is an iHerb affiliate.
          </div>
        </div>
        {COLS.map(([heading, links]) => (
          <div key={heading}>
            <div style={{ fontSize: 11, color: th.inkMute, letterSpacing: "0.1em", marginBottom: 16, ...MM }}>
              {heading.toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: 14, color: th.ink, textDecoration: "none" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
