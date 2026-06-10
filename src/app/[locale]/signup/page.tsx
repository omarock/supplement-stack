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
    title: t("auth.metaSignupTitle"),
    description: t("auth.metaSignupDesc"),
    alternates: {
      canonical: localeHref("/signup", loc),
      languages: { en: "/signup", fr: "/fr/signup", de: "/de/signup", es: "/es/signup", "x-default": "/signup" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return (
    <NamespaceProvider locale={loc} keep="auth">
      <AuthForm mode="signup" />
    </NamespaceProvider>
  );
}
