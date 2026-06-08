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

/** Tiny {placeholder} interpolation for translated strings (e.g. "{n} of {total}"). */
export function fmt(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

// Canonical (English) paths that have localized /fr /de /es routes today. This
// is the single source of truth, consumed by navHref() (to keep in-app links
// safe) and by the LanguageSwitcher (to preserve the page across locales).
// Add a path here ONLY once its app/[locale]/<path>/page.tsx actually exists,
// otherwise a localized link would point at a non-existent route (404, because
// the [locale] segment uses dynamicParams=false).
export const LOCALIZED_PATHS = new Set<string>([
  "/",
  "/pricing",
  "/quiz",
  "/quiz/express",
  "/quiz/complete",
  "/build",
  "/audit",
  "/signin",
  "/signup",
  "/about",
  "/contact",
  "/help",
  "/refunds",
]);

/** Strip ?query / #hash so membership checks compare the bare pathname. */
function barePath(path: string): string {
  const i = path.search(/[?#]/);
  return i === -1 ? path : path.slice(0, i);
}

export function isLocalizedPath(path: string): boolean {
  return LOCALIZED_PATHS.has(barePath(path));
}

/**
 * Locale-aware in-app href. Prefixes /fr /de /es ONLY when the target has a
 * localized route; otherwise returns the canonical (English) path unchanged.
 * Client components should use this for navigation so a localized page never
 * links to a route that doesn't exist for that locale.
 */
export function navHref(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (!isLocalizedPath(path)) return path;
  // Preserve any ?query / #hash that localeHref (path-only) would drop.
  const bare = barePath(path);
  const suffix = path.slice(bare.length);
  return localeHref(bare, locale) + suffix;
}
