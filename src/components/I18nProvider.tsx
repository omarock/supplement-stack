"use client";

import { createContext, useContext } from "react";
import { type Dict, type Locale, DEFAULT_LOCALE, lookup, fmt, navHref } from "@/lib/i18n";

type I18nValue = { locale: Locale; messages: Dict };
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, messages: {} });

export function I18nProvider({ locale, messages, children }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

/**
 * Client translation hook.
 *  t(key, vars?) -> translated string (dot-path; falls back to the key).
 *                   vars fill {placeholders}, e.g. t("x.spots", { n: 3 }).
 *  lh(path)      -> locale-aware href; only prefixes /fr /de /es when the
 *                   target has a localized route, else returns it unchanged.
 *  locale        -> current locale
 */
export function useT() {
  const { locale, messages } = useContext(I18nContext);
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) => fmt(lookup(messages, key), vars),
    lh: (path: string) => navHref(path, locale),
  };
}
