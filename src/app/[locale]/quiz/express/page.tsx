import type { Metadata } from "next";
import ExpressQuiz from "@/app/quiz/express/page";
import { isLocale, localeHref, lookup, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = (k: string) => lookup(getDict(loc), k);
  return {
    title: t("qe.metaTitle"),
    description: t("qe.metaDesc"),
    keywords: t("qe.metaKeywords"),
    alternates: {
      canonical: localeHref("/quiz/express", loc),
      languages: { en: "/quiz/express", fr: "/fr/quiz/express", de: "/de/quiz/express", es: "/es/quiz/express", "x-default": "/quiz/express" },
    },
  };
}

export default function Page() {
  return <ExpressQuiz />;
}
