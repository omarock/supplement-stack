import type { Metadata } from "next";
import HelpView from "@/app/help/HelpView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("help.metaTitle"),
    description: t("help.metaDesc"),
    alternates: {
      canonical: localeHref("/help", loc),
      languages: { en: "/help", fr: "/fr/help", de: "/de/help", es: "/es/help", "x-default": "/help" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <HelpView locale={loc} />;
}
