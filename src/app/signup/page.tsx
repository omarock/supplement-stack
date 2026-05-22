import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account — Phyla",
  description: "Create your free Phyla account to save your personalised supplement stack and track your wellness over time.",
};

export default function Page() {
  return <AuthForm mode="signup" />;
}
