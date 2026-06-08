import type { Metadata } from "next";
import AuditView from "@/app/audit/AuditView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("audit.metaTitle"),
    description: t("audit.metaDesc"),
    keywords: t("audit.metaKeywords"),
    alternates: {
      canonical: localeHref("/audit", loc),
      languages: { en: "/audit", fr: "/fr/audit", de: "/de/audit", es: "/es/audit", "x-default": "/audit" },
    },
    openGraph: { title: t("audit.ogTitle"), description: t("audit.ogDesc") },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <AuditView locale={loc} />;
}
