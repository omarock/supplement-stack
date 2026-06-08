"use client";

import { createContext, useContext } from "react";
import { type Dict, type Locale, DEFAULT_LOCALE, lookup, localeHref } from "@/lib/i18n";

type I18nValue = { locale: Locale; messages: Dict };
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, messages: {} });

export function I18nProvider({ locale, messages, children }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

/**
 * Client translation hook.
 *  t(key)     -> translated string (dot-path; falls back to the key)
 *  lh(path)   -> locale-aware href (prefixes /fr, /de, /es; en unchanged)
 *  locale     -> current locale
 */
export function useT() {
  const { locale, messages } = useContext(I18nContext);
  return {
    locale,
    t: (key: string) => lookup(messages, key),
    lh: (path: string) => localeHref(path, locale),
  };
}
