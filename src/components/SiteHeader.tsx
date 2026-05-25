"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SuppdocLogo from "@/components/SuppdocLogo";
import { TH, FONTS } from "@/lib/theme";

const LINKS: [string, string][] = [
  ["Stacks", "/stacks"],
  ["Ingredients", "/ingredients"],
  ["How it works", "/#how-it-works"],
  ["Journal", "/journal"],
  ["About", "/about"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "14px var(--nav-pad-x)" : "20px var(--nav-pad-x)",
        background: scrolled ? `${TH.bg}e6` : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
        borderBottom: scrolled ? `1px solid ${TH.edge}` : "1px solid transparent",
        transition: "all .35s cubic-bezier(.2,.7,.2,1)",
      }}>
        <SuppdocLogo size={20} />

        {/* Desktop nav */}
        <div style={{
          display: "var(--nav-show)",
          gap: "var(--nav-gap)", fontSize: 14, color: TH.inkSoft,
          fontWeight: 500, alignItems: "center",
        }}>
          {LINKS.map(([label, href]) => (
            <Link key={label} href={href}
              style={{ color: "inherit", textDecoration: "none", transition: "color .2s" }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: "var(--nav-show)", gap: 10, alignItems: "center" }}>
          <Link href="/signin" style={{
            fontSize: 14, color: TH.inkSoft, textDecoration: "none",
            padding: "8px 12px", fontWeight: 500,
          }}>Sign in</Link>
          <Link href="/quiz" style={{
            background: TH.ink, color: TH.surface, textDecoration: "none",
            padding: "10px 18px", borderRadius: 999,
            fontFamily: FONTS.body, fontWeight: 500, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: `0 4px 14px ${TH.ink}1a`,
            transition: "transform .2s, box-shadow .2s",
          }}>
            Build my stack
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
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
            width: 40, height: 40, borderRadius: 999,
            border: `1px solid ${TH.edge}`, background: TH.surface, cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TH.ink} strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, top: 64, zIndex: 59,
            background: TH.bg,
            padding: "28px 24px",
            animation: "sd-fade-in .2s ease-out",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          {LINKS.map(([label, href]) => (
            <Link
              key={label} href={href} onClick={() => setOpen(false)}
              style={{
                fontFamily: FONTS.display, fontWeight: 600, fontSize: 28,
                color: TH.ink, textDecoration: "none",
                padding: "14px 0", borderBottom: `1px solid ${TH.edge}`,
                letterSpacing: "-0.02em",
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/signin" onClick={() => setOpen(false)}
            style={{
              fontFamily: FONTS.display, fontWeight: 600, fontSize: 28,
              color: TH.ink, textDecoration: "none",
              padding: "14px 0", borderBottom: `1px solid ${TH.edge}`,
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/quiz" onClick={() => setOpen(false)}
            style={{
              marginTop: 24, padding: "16px 24px",
              background: TH.ink, color: TH.surface, textDecoration: "none",
              borderRadius: 999, fontSize: 15, fontWeight: 500,
              textAlign: "center",
              boxShadow: `0 8px 20px ${TH.ink}33`,
            }}
          >
            Build my stack →
          </Link>
        </div>
      )}
    </>
  );
}
