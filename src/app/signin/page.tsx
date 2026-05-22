import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — Phyla",
  description: "Sign in to your Phyla account to revisit your supplement stack and quiz history.",
};

export default function Page() {
  return <AuthForm mode="signin" />;
}
