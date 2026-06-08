"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/I18nProvider";
import { TH, FONTS } from "@/lib/theme";

/**
 * Theme switcher: Light / System / Dark.
 * - Persists the preference in localStorage ("sd-theme").
 * - "system" follows the OS and live-updates when the OS theme changes.
 * - Resolves to a concrete light|dark and writes <html data-theme>, which the
 *   CSS variables in globals.css react to (the whole app re-themes).
 * - A no-flash inline script in layout.tsx applies the same on first paint.
 */
type Pref = "light" | "system" | "dark";
const KEY = "sd-theme";

function resolve(p: Pref): "light" | "dark" {
  if (p === "system") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return p;
}

function apply(p: Pref) {
  const el = document.documentElement;
  el.classList.add("theme-anim");                  // enable transition only during the switch
  el.dataset.theme = resolve(p);
  window.setTimeout(() => el.classList.remove("theme-anim"), 360);
}

const SUN = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);
const MONITOR = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" />
  </svg>
);
const MOON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const OPTIONS: { value: Pref; labelKey: string; icon: React.ReactNode }[] = [
  { value: "light", labelKey: "theme.light", icon: SUN },
  { value: "system", labelKey: "theme.system", icon: MONITOR },
  { value: "dark", labelKey: "theme.dark", icon: MOON },
];

export default function ThemeToggle({ size = 28 }: { size?: number }) {
  const { t } = useT();
  // Default is LIGHT (not "system"): new visitors get the light theme unless they
  // explicitly opt into System or Dark via this toggle. Those choices still work
  // and persist in localStorage; only the no-preference default changed.
  const [pref, setPref] = useState<Pref>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: Pref = "light";
    try { stored = (localStorage.getItem(KEY) as Pref) || "light"; } catch {}
    setPref(stored);
    setReady(true);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let cur: Pref = "light";
      try { cur = (localStorage.getItem(KEY) as Pref) || "light"; } catch {}
      if (cur === "system") apply("system");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  function choose(p: Pref) {
    setPref(p);
    try { localStorage.setItem(KEY, p); } catch {}
    apply(p);
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("theme.label")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 2, padding: 3,
        borderRadius: 999, border: `1px solid ${TH.edge}`, background: TH.surface,
        fontFamily: FONTS.body,
      }}
    >
      {OPTIONS.map((o) => {
        const active = ready && pref === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            aria-label={t(o.labelKey)}
            title={t(o.labelKey)}
            onClick={() => choose(o.value)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: size, height: size, borderRadius: 999, border: "none", cursor: "pointer",
              background: active ? TH.accentGlow : "transparent",
              color: active ? TH.sageDeep : TH.muted,
              transition: "color .15s, background .15s",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = TH.ink; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = TH.muted; }}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}
