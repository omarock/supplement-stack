import type { Metadata } from "next";
import RefundsView from "@/app/refunds/RefundsView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("refunds.metaTitle"),
    description: t("refunds.metaDesc"),
    alternates: {
      canonical: localeHref("/refunds", loc),
      languages: { en: "/refunds", fr: "/fr/refunds", de: "/de/refunds", es: "/es/refunds", "x-default": "/refunds" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <RefundsView locale={loc} />;
}
