import type { Metadata } from "next";
import AboutView from "@/app/about/AboutView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("about.metaTitle"),
    description: t("about.metaDesc"),
    alternates: {
      canonical: localeHref("/about", loc),
      languages: { en: "/about", fr: "/fr/about", de: "/de/about", es: "/es/about", "x-default": "/about" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <AboutView locale={loc} />;
}
