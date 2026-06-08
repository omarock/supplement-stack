import type { Metadata } from "next";
import HelpView from "./HelpView";

export const metadata: Metadata = {
  title: "Help & FAQ, suppdoc.io",
  description: "Frequently asked questions about suppdoc.io's quiz, supplement recommendations, affiliate links, and safety guidelines.",
  alternates: {
    canonical: "/help",
    languages: { en: "/help", fr: "/fr/help", de: "/de/help", es: "/es/help", "x-default": "/help" },
  },
};

export default function Page() {
  return <HelpView locale="en" />;
}
