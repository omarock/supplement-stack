import type { Metadata } from "next";
import ContactView from "./ContactView";

export const metadata: Metadata = {
  title: "Contact, suppdoc.io",
  description: "Get in touch with the suppdoc team. Questions about your stack, partnerships, or press inquiries, we reply within one business day.",
  alternates: {
    canonical: "/contact",
    languages: { en: "/contact", fr: "/fr/contact", de: "/de/contact", es: "/es/contact", "x-default": "/contact" },
  },
};

export default function Page() {
  return <ContactView locale="en" />;
}
