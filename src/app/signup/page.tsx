import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account — suppdoc.io",
  description: "Create your free suppdoc.io account to save your personalised supplement stack and track your wellness over time.",
};

export default function Page() {
  return <AuthForm mode="signup" />;
}
