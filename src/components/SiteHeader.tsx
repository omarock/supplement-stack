"use client";

import { useState } from "react";
import Link from "next/link";

const th = {
  bg: "#f4ede1", ink: "#1c1d18", inkSoft: "#5b5d52", inkMute: "#8c8d80",
  sage: "#4a6a4e", burgundy: "#7d2e3a",
  line: "rgba(28,29,24,0.12)",
};
const S = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400 } as const;

const LINKS = [
  ["Stacks", "/stacks"],
  ["How it works", "/#how-it-works"],
  ["Journal", "/journal"],
  ["About", "/about"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px var(--nav-pad-x)",
        background: `${th.bg}cc`, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${th.line}`,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <ellipse cx="12" cy="6" rx="3" ry="5.5" fill={th.sage} />
            <ellipse cx="6.5" cy="14" rx="3" ry="5" transform="rotate(-50 6.5 14)" fill={th.sage} />
            <ellipse cx="17.5" cy="14" rx="3" ry="5" transform="rotate(50 17.5 14)" fill={th.sage} />
            <circle cx="12" cy="12" r="1.6" fill={th.burgundy} />
          </svg>
          <span style={{ ...S, fontSize: 22, color: th.ink, letterSpacing: "-0.01em" }}>phyla</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "var(--nav-show)", gap: "var(--nav-gap)", fontSize: 14, color: th.inkSoft, alignItems: "center" }}>
          {LINKS.map(([label, href]) => (
            <Link key={label} href={href} style={{ color: "inherit", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>

        <div style={{ display: "var(--nav-show)", gap: 14, alignItems: "center" }}>
          <Link href="/signin" style={{
            fontSize: 14, color: th.inkSoft, textDecoration: "none",
          }}>Sign in</Link>
          <Link href="/quiz" style={{
            background: th.ink, color: th.bg, textDecoration: "none",
            padding: "12px 22px", borderRadius: 999, fontWeight: 500, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            Begin analysis
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: "var(--burger-show)", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: 12,
            border: `1px solid ${th.line}`, background: "transparent", cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={th.ink} strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, top: 67, zIndex: 29,
            background: th.bg,
            padding: "32px 24px",
            animation: "phyla-fade-in .2s ease-out",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                ...S, fontSize: 32, color: th.ink, textDecoration: "none",
                padding: "14px 0", borderBottom: `1px solid ${th.line}`,
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/signin"
            onClick={() => setOpen(false)}
            style={{
              ...S, fontSize: 32, color: th.ink, textDecoration: "none",
              padding: "14px 0", borderBottom: `1px solid ${th.line}`,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/quiz"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 24, padding: "18px 24px",
              background: th.ink, color: th.bg, textDecoration: "none",
              borderRadius: 999, fontSize: 16, fontWeight: 500,
              textAlign: "center",
            }}
          >
            Begin analysis →
          </Link>
        </div>
      )}
    </>
  );
}
