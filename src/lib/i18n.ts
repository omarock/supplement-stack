// i18n core (client-safe: no message JSON imported here, so client bundles stay lean).
// English is the canonical/default language and lives at the root (no prefix).
// FR / DE / ES are served under /fr, /de, /es. Add a locale by extending LOCALES
// and adding a messages/<locale>.json + an entry in lib/i18n-dicts.ts.
export const LOCALES = ["en", "fr", "de", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// Locales that get a URL prefix (everything except the canonical English root).
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const LOCALE_NATIVE: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

/** Prefix a path for a locale (en -> unchanged; others -> /<locale>/path). */
export function localeHref(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip a leading locale segment from a path, returning the canonical (en) path. */
export function stripLocale(path: string): { locale: Locale; path: string } {
  const seg = path.split("/")[1];
  if (seg && isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = path.slice(seg.length + 1) || "/";
    return { locale: seg, path: rest };
  }
  return { locale: DEFAULT_LOCALE, path };
}

export type Dict = Record<string, unknown>;

/** Dot-path lookup into a dictionary; falls back to the key if missing. */
export function lookup(messages: Dict, path: string): string {
  const v = path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Dict)[k] : undefined),
    messages,
  );
  return typeof v === "string" ? v : path;
}
