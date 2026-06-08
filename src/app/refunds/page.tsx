import type { Metadata } from "next";
import RefundsView from "./RefundsView";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy, suppdoc.io",
  description: "suppdoc.io's refund and cancellation policy for premium subscriptions, including our 14-day money-back guarantee and how to cancel.",
  alternates: {
    canonical: "/refunds",
    languages: { en: "/refunds", fr: "/fr/refunds", de: "/de/refunds", es: "/es/refunds", "x-default": "/refunds" },
  },
};

export default function Page() {
  return <RefundsView locale="en" />;
}
