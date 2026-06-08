import type { Metadata } from "next";
import AboutView from "./AboutView";

export const metadata: Metadata = {
  title: "About, suppdoc.io",
  description: "suppdoc.io composes personalised supplement rituals from clean, evidence-led ingredients. Built to help you understand your stack, not just sell it.",
  alternates: {
    canonical: "/about",
    languages: { en: "/about", fr: "/fr/about", de: "/de/about", es: "/es/about", "x-default": "/about" },
  },
};

export default function Page() {
  return <AboutView locale="en" />;
}
