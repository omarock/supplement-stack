"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/I18nProvider";
import { TH } from "@/lib/theme";

/**
 * Light / Dark theme switch (a sliding sun↔moon knob).
 * - Persists "light" | "dark" in localStorage ("sd-theme").
 * - Writes <html data-theme>, which the CSS variables in globals.css react to.
 * - Reads the resolved theme from the DOM on mount (the no-flash init script in
 *   layout.tsx has already applied it), so the knob never flickers on hydration.
 * System mode was removed: any legacy "system" preference resolves to light and
 * is rewritten to an explicit choice on the next toggle.
 */
type Theme = "light" | "dark";
const KEY = "sd-theme";

function apply(t: Theme) {
  const el = document.documentElement;
  el.classList.add("theme-anim"); // transition only during the switch
  el.dataset.theme = t;
  window.setTimeout(() => el.classList.remove("theme-anim"), 360);
}

const SUN = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);
const MOON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default function ThemeToggle({ size = 28 }: { size?: number }) {
  const { t } = useT();
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dom = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(dom);
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem(KEY, next); } catch {}
    apply(next);
  }

  const isDark = ready && theme === "dark";
  const trackW = Math.round(size * 2);
  const knob = size - 6;
  const slide = trackW - knob - 6;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t("theme.label")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      onClick={toggle}
      style={{
        position: "relative", width: trackW, height: size, flexShrink: 0, padding: 0,
        borderRadius: 999, border: `1px solid ${TH.edge}`, cursor: "pointer",
        background: isDark ? TH.inkBg : TH.bg,
        transition: "background .25s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute", top: 3, left: 3,
          width: knob, height: knob, borderRadius: 999,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: TH.surface, color: isDark ? TH.sageDeep : TH.amberDeep,
          boxShadow: "0 1px 4px rgba(10,37,64,0.22)",
          transform: isDark ? `translateX(${slide}px)` : "translateX(0)",
          transition: "transform .26s cubic-bezier(.34,1.3,.5,1)",
        }}
      >
        {isDark ? MOON : SUN}
      </span>
    </button>
  );
}
