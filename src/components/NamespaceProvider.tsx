import { I18nProvider } from "./I18nProvider";
import { getDict } from "@/lib/i18n-dicts";
import { pickNamespaces, type HeavyNamespace, type Locale } from "@/lib/i18n";

// Server helper that adds one heavy namespace (omitted from the base layout
// providers — see HEAVY_NAMESPACES) on top of the inherited base i18n context,
// for the single route whose client needs it. Because <I18nProvider> MERGES with
// its ancestor, this only ships the namespace itself (e.g. just `build`) into the
// RSC payload — the base chrome dict from the layout is NOT re-serialized.
//
// Server Component: getDict + the message JSON imports stay on the server; only
// the tiny sliced `messages` object reaches the client.
export default function NamespaceProvider({
  locale,
  keep,
  children,
}: {
  locale: Locale;
  keep: HeavyNamespace;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider locale={locale} messages={pickNamespaces(getDict(locale), [keep])}>
      {children}
    </I18nProvider>
  );
}
