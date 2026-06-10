import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import NamespaceProvider from "@/components/NamespaceProvider";

export const metadata: Metadata = {
  title: "Create account, suppdoc.io",
  description: "Create your free suppdoc.io account to save your personalised supplement stack and track your wellness over time.",
  alternates: {
    canonical: "/signup",
    languages: { en: "/signup", fr: "/fr/signup", de: "/de/signup", es: "/es/signup", "x-default": "/signup" },
  },
};

export default function Page() {
  return (
    <NamespaceProvider locale="en" keep="auth">
      <AuthForm mode="signup" />
    </NamespaceProvider>
  );
}
