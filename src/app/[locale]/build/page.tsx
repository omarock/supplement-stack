import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BuildClient from "@/app/build/BuildClient";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";
import { TH } from "@/lib/theme";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("build.metaTitle"),
    description: t("build.metaDesc"),
    keywords: t("build.metaKeywords"),
    alternates: {
      canonical: localeHref("/build", loc),
      languages: { en: "/build", fr: "/fr/build", de: "/de/build", es: "/es/build", "x-default": "/build" },
    },
    openGraph: { title: t("build.ogTitle"), description: t("build.ogDesc") },
  };
}

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <BuildClient />
      <SiteFooter />
    </div>
  );
}
