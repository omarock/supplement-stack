"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SuppdocLogo from "@/components/SuppdocLogo";
import { getSupabase } from "@/lib/supabase";
import { TH, FONTS } from "@/lib/theme";

// Account dropdown items shown when the user is signed in.
const ACCOUNT_LINKS: { label: string; href: string }[] = [
  { label: "My profile", href: "/me" },
  { label: "Daily tracker", href: "/track" },
  { label: "Bloodwork history", href: "/bloodwork/history" },
  { label: "Manage subscription", href: "/me/subscription" },
];

function initials(email: string): string {
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type NavItem = { label: string; href: string; desc: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Start",
    items: [
      { label: "Personalised quiz", href: "/quiz", desc: "Personalised recommendation" },
      { label: "Build a stack", href: "/build", desc: "From 151 researched ingredients" },
      { label: "Audit my stack", href: "/audit", desc: "Score what you already take" },
      { label: "Bloodwork", href: "/bloodwork", desc: "Read your labs into a plan" },
    ],
  },
  {
    label: "Learn",
    items: [
      { label: "Best for your goal", href: "/best", desc: "Best supplements for sleep, energy…" },
      { label: "Supplements for symptoms", href: "/symptoms", desc: "Tired, foggy, cramping? What to check" },
      { label: "Ingredients", href: "/ingredients", desc: "151 evidence-graded guides" },
      { label: "Interactions", href: "/interactions", desc: "What works together & what to separate" },
      { label: "Supplement timing", href: "/timing", desc: "Best time to take each supplement" },
      { label: "Biomarkers", href: "/biomarkers", desc: "What your blood test means" },
      { label: "Stacks", href: "/stacks", desc: "15 ready-made protocols" },
      { label: "Journal", href: "/journal", desc: "Evidence-led articles" },
    ],
  },
  {
    label: "My plan",
    items: [
      { label: "Daily tracker", href: "/track", desc: "Check in & see your trends" },
      { label: "Bloodwork history", href: "/bloodwork/history", desc: "Saved labs & re-test comparison" },
      { label: "My profile", href: "/me", desc: "Your stacks & history" },
      { label: "Pricing", href: "/pricing", desc: "Free vs Premium" },
    ],
  },
];

export default function SiteHeader() {
  const router = useRouter();
  const [openMobile, setOpenMobile] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Auth: read the current session, then live-subscribe to sign-in/out events so
  // the header reflects auth state instantly on every page, with no refresh.
  useEffect(() => {
    const supa = getSupabase();
    if (!supa) return;
    let active = true;
    supa.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user?.email ? { email: data.session.user.email } : null);
    });
    const { data: sub } = supa.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.email ? { email: session.user.email } : null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  async function logout() {
    setAccountOpen(false);
    setOpenMobile(false);
    const supa = getSupabase();
    if (supa) await supa.auth.signOut();
    setUser(null);
    router.push("/");
  }

  function skipToContent(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const main = document.querySelector("main");
    if (main) {
      main.setAttribute("tabindex", "-1");
      (main as HTMLElement).focus();
      main.scrollIntoView();
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to main content
      </a>
      <nav aria-label="Primary" style={{
        position: "sticky", top: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "14px var(--nav-pad-x)" : "20px var(--nav-pad-x)",
        background: scrolled ? `${TH.bg}e6` : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
        borderBottom: scrolled ? `1px solid ${TH.edge}` : "1px solid transparent",
        transition: "all .35s cubic-bezier(.2,.7,.2,1)",
      }}>
        <SuppdocLogo size={20} />

        {/* Desktop nav, grouped dropdowns */}
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
          {!user && (
            <Link href="/signin" style={{ fontSize: 14, color: TH.inkSoft, textDecoration: "none", padding: "8px 12px", fontWeight: 500 }}>
              Sign in
            </Link>
          )}
          <Link href="/quiz" style={{
            background: TH.ink, color: TH.surface, textDecoration: "none",
            padding: "10px 18px", borderRadius: 999,
            fontFamily: FONTS.body, fontWeight: 500, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 8,
            boxShadow: `0 4px 14px ${TH.ink}1a`,
          }}>
            {user ? "My stack" : "Build my stack"}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Account avatar + dropdown (signed in) */}
          {user && (
            <div ref={accountRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAccountOpen(o => !o)}
                aria-expanded={accountOpen} aria-haspopup="menu" aria-label="Account menu"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
                  background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 999,
                  padding: "5px 10px 5px 5px",
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                  background: `linear-gradient(135deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em",
                }}>{initials(user.email)}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TH.inkSoft} strokeWidth="2.4"
                  style={{ transform: accountOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {accountOpen && (
                <div role="menu" style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: 230,
                  background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16,
                  boxShadow: "0 12px 40px -12px rgba(10,37,64,0.25)", padding: 8,
                  animation: "sd-fade-in .16s ease-out",
                }}>
                  <div style={{ padding: "8px 12px 10px", borderBottom: `1px solid ${TH.edge}`, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: TH.muted, fontFamily: FONTS.mono, letterSpacing: "0.06em" }}>SIGNED IN AS</div>
                    <div style={{ fontSize: 13.5, color: TH.ink, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                  </div>
                  {ACCOUNT_LINKS.map(item => (
                    <Link key={item.href} href={item.href} role="menuitem" onClick={() => setAccountOpen(false)} style={{
                      display: "block", padding: "9px 12px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                      color: TH.ink, textDecoration: "none",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = TH.bg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >{item.label}</Link>
                  ))}
                  <button onClick={logout} role="menuitem" style={{
                    display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginTop: 4,
                    borderTop: `1px solid ${TH.edge}`, paddingTop: 11,
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: FONTS.body, fontSize: 14, fontWeight: 500, color: "#b91c1c",
                  }}>Sign out</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpenMobile(o => !o)}
          aria-label={openMobile ? "Close menu" : "Open menu"}
          aria-expanded={openMobile}
          aria-controls="mobile-menu"
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

      {/* Mobile menu overlay, grouped */}
      {openMobile && (
        <div
          id="mobile-menu"
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

          {/* Account section (signed in) */}
          {user && (
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: TH.muted, marginBottom: 8 }}>
                My account
              </div>
              <div style={{ fontSize: 13, color: TH.inkSoft, marginBottom: 6 }}>{user.email}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {ACCOUNT_LINKS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenMobile(false)} style={{
                    padding: "12px 0", borderBottom: `1px solid ${TH.edge}`, textDecoration: "none",
                    fontFamily: FONTS.display, fontWeight: 600, fontSize: 18, color: TH.ink,
                  }}>{item.label}</Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <Link href="/quiz" onClick={() => setOpenMobile(false)} style={{
              padding: "15px 24px", background: TH.ink, color: TH.surface, textDecoration: "none",
              borderRadius: 999, fontSize: 15, fontWeight: 600, textAlign: "center",
              boxShadow: `0 8px 20px ${TH.ink}33`,
            }}>{user ? "My stack →" : "Build my stack →"}</Link>
            {user ? (
              <button onClick={logout} style={{
                padding: "13px 24px", background: "transparent", color: "#b91c1c", cursor: "pointer",
                borderRadius: 999, fontSize: 14, fontWeight: 500, textAlign: "center",
                border: `1px solid ${TH.edge}`, fontFamily: FONTS.body,
              }}>Sign out</button>
            ) : (
              <Link href="/signin" onClick={() => setOpenMobile(false)} style={{
                padding: "13px 24px", background: "transparent", color: TH.inkSoft, textDecoration: "none",
                borderRadius: 999, fontSize: 14, fontWeight: 500, textAlign: "center", border: `1px solid ${TH.edge}`,
              }}>Sign in</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
