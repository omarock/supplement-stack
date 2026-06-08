import type { Metadata } from "next";
import CompleteQuiz from "@/app/quiz/complete/page";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("qc.metaTitle"),
    description: t("qc.metaDesc"),
    keywords: t("qc.metaKeywords"),
    alternates: {
      canonical: localeHref("/quiz/complete", loc),
      languages: { en: "/quiz/complete", fr: "/fr/quiz/complete", de: "/de/quiz/complete", es: "/es/quiz/complete", "x-default": "/quiz/complete" },
    },
  };
}

export default function Page() {
  return <CompleteQuiz />;
}
