import type { Metadata } from "next";
import PricingView from "@/app/pricing/PricingView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

// Reads cookies (session) via the shared view, so render per-request like /pricing.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const d = getDict(loc);
  const t = (k: string) => lookup(d, k);
  return {
    title: t("pricing.metaTitle"),
    description: t("pricing.metaDesc"),
    alternates: {
      canonical: localeHref("/pricing", loc),
      languages: { en: "/pricing", fr: "/fr/pricing", de: "/de/pricing", es: "/es/pricing", "x-default": "/pricing" },
    },
  };
}

export default function LocalePricingPage() {
  return <PricingView />;
}
