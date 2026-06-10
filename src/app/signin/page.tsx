import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import NamespaceProvider from "@/components/NamespaceProvider";

export const metadata: Metadata = {
  title: "Sign in, suppdoc.io",
  description: "Sign in to your suppdoc.io account to revisit your supplement stack and quiz history.",
  alternates: {
    canonical: "/signin",
    languages: { en: "/signin", fr: "/fr/signin", de: "/de/signin", es: "/es/signin", "x-default": "/signin" },
  },
};

export default function Page() {
  return (
    <NamespaceProvider locale="en" keep="auth">
      <AuthForm mode="signin" />
    </NamespaceProvider>
  );
}
