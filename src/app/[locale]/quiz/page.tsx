import type { Metadata } from "next";
import QuizChooserView from "@/app/quiz/QuizChooserView";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("quiz.metaTitle"),
    description: t("quiz.metaDesc"),
    keywords: t("quiz.metaKeywords"),
    alternates: {
      canonical: localeHref("/quiz", loc),
      languages: { en: "/quiz", fr: "/fr/quiz", de: "/de/quiz", es: "/es/quiz", "x-default": "/quiz" },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <QuizChooserView locale={loc} />;
}
