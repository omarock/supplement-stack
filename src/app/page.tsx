import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { HOME_FAQ } from "@/lib/home-faq";

// Server wrapper so the client homepage can carry a self-canonical (a client
// component cannot export metadata). metadataBase is set in layout.tsx.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", fr: "/fr", de: "/de", es: "/es", "x-default": "/" },
  },
};

// FAQPage structured data, built from the same source the homepage renders, so
// Google and AI engines can extract the Q&A. (The visible FAQ lives in HomeClient.)
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HomeClient />
    </>
  );
}
