import type { Metadata } from "next";
import ContactView from "@/app/contact/ContactView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("contact.metaTitle"),
    description: t("contact.metaDesc"),
    alternates: {
      canonical: localeHref("/contact", loc),
      languages: { en: "/contact", fr: "/fr/contact", de: "/de/contact", es: "/es/contact", "x-default": "/contact" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <ContactView locale={loc} />;
}
