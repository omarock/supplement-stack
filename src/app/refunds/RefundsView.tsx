import LegalPage from "@/components/LegalPage";
import { richText } from "@/components/RichText";
import { getDict } from "@/lib/i18n-dicts";
import { lookup, type Locale } from "@/lib/i18n";

// Billing / refund policy. Translated faithfully; the Paddle (merchant of record)
// and email links are kept literal, only the surrounding sentence is localized.
export default function RefundsView({ locale }: { locale: Locale }) {
  const t = (k: string) => lookup(getDict(locale), k);
  return (
    <LegalPage eyebrow={t("refunds.eyebrow")} title={t("refunds.title")} lastUpdated={t("refunds.lastUpdated")} lastUpdatedLabel={t("refunds.lastUpdatedLabel")}>
      <p>{t("refunds.intro")}</p>

      <h2>{t("refunds.h1")}</h2>
      <p>{richText(t("refunds.p1"))}</p>

      <h2>{t("refunds.h2")}</h2>
      <p>{richText(t("refunds.p2"))}</p>

      <h2>{t("refunds.h3")}</h2>
      <p>{richText(t("refunds.p3"))}</p>

      <h2>{t("refunds.h4")}</h2>
      <p>{richText(t("refunds.p4"))}</p>

      <h2>{t("refunds.h5")}</h2>
      <p>
        {t("refunds.p5pre")} <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a> {t("refunds.p5mid")}{" "}
        <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a>{t("refunds.p5post")}
      </p>

      <h2>{t("refunds.h6")}</h2>
      <p>{richText(t("refunds.p6"))}</p>

      <h2>{t("refunds.h7")}</h2>
      <p>
        {t("refunds.p7pre")}{" "}
        <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
