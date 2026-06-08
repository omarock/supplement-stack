// Server-side dictionary map. Imported by layouts/pages (Server Components) to get
// the messages for a locale; the current locale's dict is then passed to the
// client <I18nProvider>. Keeping the JSON imports here (not in lib/i18n.ts) avoids
// pulling all languages into client bundles.
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import de from "@/messages/de.json";
import es from "@/messages/es.json";
import type { Dict, Locale } from "./i18n";

export const DICTS: Record<Locale, Dict> = { en, fr, de, es };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS.en;
}
