import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import NamespaceProvider from "@/components/NamespaceProvider";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("auth.metaSigninTitle"),
    description: t("auth.metaSigninDesc"),
    alternates: {
      canonical: localeHref("/signin", loc),
      languages: { en: "/signin", fr: "/fr/signin", de: "/de/signin", es: "/es/signin", "x-default": "/signin" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return (
    <NamespaceProvider locale={loc} keep="auth">
      <AuthForm mode="signin" />
    </NamespaceProvider>
  );
}
