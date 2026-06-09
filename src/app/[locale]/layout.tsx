import { notFound } from "next/navigation";
import { isLocale, DEFAULT_LOCALE, PREFIXED_LOCALES } from "@/lib/i18n";
import { getDict } from "@/lib/i18n-dicts";
import { I18nProvider } from "@/components/I18nProvider";

// Only the prefixed locales (fr/de/es) are valid here; English lives at the root.
export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}
export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === DEFAULT_LOCALE) notFound();
  return (
    <I18nProvider locale={locale} messages={getDict(locale)}>
      {/* The <html> element lives in the root layout (above this segment) and is
          hardcoded lang="en". Correct it for fr/de/es before paint, mirroring the
          THEME_INIT pattern, so screen readers and Chrome auto-translate see the
          right language. hreflang in <head> carries the SEO signal. */}
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};` }} />
      {children}
    </I18nProvider>
  );
}
