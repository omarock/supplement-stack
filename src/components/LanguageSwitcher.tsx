"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LOCALES, LOCALE_NATIVE, stripLocale, localeHref, isLocalizedPath, type Locale } from "@/lib/i18n";
import { useT } from "@/components/I18nProvider";
import { TH, FONTS } from "@/lib/theme";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function choose(l: Locale) {
    setOpen(false);
    if (l === locale) return;
    const canonical = stripLocale(pathname || "/").path;
    const target = isLocalizedPath(canonical) ? canonical : "/";
    router.push(localeHref(target, l));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu" aria-expanded={open} aria-label={t("switcher.label")}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
          background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 999,
          padding: "6px 10px", color: TH.inkSoft, fontFamily: FONTS.body, fontSize: 13, fontWeight: 500,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        {locale.toUpperCase()}
      </button>
      {open && (
        <div role="menu" style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 150,
          background: TH.elevated, border: `1px solid ${TH.edge}`, borderRadius: 12,
          boxShadow: "0 12px 40px -12px rgba(10,37,64,0.25)", padding: 6, zIndex: 70,
          animation: "sd-fade-in .16s ease-out",
        }}>
          {LOCALES.map((l) => {
            const active = l === locale;
            return (
              <button key={l} role="menuitemradio" aria-checked={active} onClick={() => choose(l)} style={{
                display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? TH.accentGlow : "transparent",
                color: active ? TH.sageDeep : TH.ink, fontFamily: FONTS.body, fontSize: 14, fontWeight: active ? 600 : 500,
              }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = TH.bg; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {LOCALE_NATIVE[l]}
                <span style={{ ...{ fontFamily: FONTS.mono }, fontSize: 10.5, color: TH.muted }}>{l.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
