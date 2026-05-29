"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SuppdocLogo from "@/components/SuppdocLogo";
import { TH, FONTS } from "@/lib/theme";

type NavItem = { label: string; href: string; desc: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Start",
    items: [
      { label: "AI quiz", href: "/quiz", desc: "Personalised recommendation" },
      { label: "Build a stack", href: "/build", desc: "From 151 researched ingredients" },
      { label: "Audit my stack", href: "/audit", desc: "Score what you already take" },
      { label: "Bloodwork", href: "/bloodwork", desc: "Read your labs into a plan" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Ingredients", href: "/ingredients", desc: "151 evidence-graded guides" },
      { label: "Stacks", href: "/stacks", desc: "15 ready-made protocols" },
      { label: "Journal", href: "/journal", desc: "Evidence-led articles" },
    ],
  },
  {
    label: "My plan",
    items: [
      { label: "Daily tracker", href: "/track", desc: "Check in & see your trends" },
      { label: "My profile", href: "/me", desc: "Your stacks & history" },
    ],
  },
];

export default function SiteHeader() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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

        {/* Desktop nav — grouped dropdowns */}
        <div
          style={{ display: "var(--nav-show)", gap: "var(--nav-gap)", alignItems: "center" }}
          onMouseLeave={() => setOpenGroup(null)}
        >
          {NAV.map(group => {
            const open = openGroup === group.label;
            return (
              <div key={group.label} style={{ position: "relative" }} onMouseEnter={() => setOpenGroup(group.label)}>
                <button
                  onFocus={() => setOpenGroup(group.label)}
                  aria-expanded={open}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: FONTS.body, fontSize: 14, fontWeight: 500,
                    color: open ? TH.ink : TH.inkSoft, padding: "6px 2px", transition: "color .2s",
                  }}
                >
                  {group.label}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {open && (
                  <div style={{
                    position: "absolute", top: "100%", left: -8, paddingTop: 10, minWidth: 260,
                  }}>
                    <div style={{
                      background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16,
                      boxShadow: "0 12px 40px -12px rgba(10,37,64,0.25)", padding: 8,
                      animation: "sd-fade-in .18s ease-out",
                    }}>
                      {group.items.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setOpenGroup(null)} style={{
                          display: "block", padding: "10px 12px", borderRadius: 11,
                          textDecoration: "none", color: "inherit", transition: "background .15s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = TH.bg; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: TH.ink, letterSpacing: "-0.01em" }}>{item.label}</div>
                          <div style={{ fontSize: 12, color: TH.muted, marginTop: 1 }}>{item.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "var(--nav-show)", gap: 10, alignItems: "center" }}>
          <Link href="/signin" style={{ fontSize: 14, color: TH.inkSoft, textDecoration: "none", padding: "8px 12px", fontWeight: 500 }}>
            Sign in
          </Link>
          <Link href="/quiz" style={{
            background: TH.ink, color: TH.surface, textDecoration: "none",
            padding: "10px 18px", borderRadius: 999,
            fontFamily: FONTS.body, fontWeight: 500, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: `0 4px 14px ${TH.ink}1a`,
          }}>
            Build my stack
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpenMobile(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: "var(--burger-show)", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: 999,
            border: `1px solid ${TH.edge}`, background: TH.surface, cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TH.ink} strokeWidth="2">
            {openMobile ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu overlay — grouped */}
      {openMobile && (
        <div
          style={{
            position: "fixed", inset: 0, top: 64, zIndex: 59, background: TH.bg,
            padding: "20px 24px 40px", overflowY: "auto",
            animation: "sd-fade-in .2s ease-out", display: "flex", flexDirection: "column", gap: 22,
          }}
        >
          {NAV.map(group => (
            <div key={group.label}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: TH.muted, marginBottom: 8 }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {group.items.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenMobile(false)} style={{
                    display: "flex", flexDirection: "column", gap: 1, padding: "12px 0",
                    borderBottom: `1px solid ${TH.edge}`, textDecoration: "none", color: "inherit",
                  }}>
                    <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 20, color: TH.ink, letterSpacing: "-0.01em" }}>{item.label}</span>
                    <span style={{ fontSize: 12.5, color: TH.muted }}>{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <Link href="/quiz" onClick={() => setOpenMobile(false)} style={{
              padding: "15px 24px", background: TH.ink, color: TH.surface, textDecoration: "none",
              borderRadius: 999, fontSize: 15, fontWeight: 600, textAlign: "center",
              boxShadow: `0 8px 20px ${TH.ink}33`,
            }}>Build my stack →</Link>
            <Link href="/signin" onClick={() => setOpenMobile(false)} style={{
              padding: "13px 24px", background: "transparent", color: TH.inkSoft, textDecoration: "none",
              borderRadius: 999, fontSize: 14, fontWeight: 500, textAlign: "center", border: `1px solid ${TH.edge}`,
            }}>Sign in</Link>
          </div>
        </div>
      )}
    </>
  );
}
