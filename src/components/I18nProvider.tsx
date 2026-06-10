"use client";

import { createContext, useContext, useMemo } from "react";
import { type Dict, type Locale, DEFAULT_LOCALE, lookup, fmt, navHref } from "@/lib/i18n";

type I18nValue = { locale: Locale; messages: Dict };
const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, messages: {} });

/**
 * Providers MERGE their messages over any ancestor provider's (shallow, by
 * top-level namespace). This lets the layout ship a lean base dict (chrome +
 * shared content, minus the heavy page namespaces) while a single route adds
 * just its own namespace on top via <NamespaceProvider> — without re-shipping
 * the base. The nearest provider's `locale` wins. Existing root(en) -> [locale]
 * nesting is unaffected: the locale dict has the same namespaces, so it wins the
 * merge exactly as a replace would have.
 */
export function I18nProvider({ locale, messages, children }: I18nValue & { children: React.ReactNode }) {
  const parent = useContext(I18nContext);
  const value = useMemo<I18nValue>(
    () => ({ locale, messages: { ...parent.messages, ...messages } }),
    [locale, parent.messages, messages],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
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
