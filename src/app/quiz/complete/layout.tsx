import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Quiz, deep-personalised supplement stack | suppdoc.io",
  description: "The thorough path to your supplement stack. Share your goals, lifestyle, diet and health context for a deeply personalised, evidence-graded plan, with optional bloodwork analysis.",
  keywords: "complete supplement quiz, personalised supplement plan, detailed supplement assessment, bloodwork supplement quiz",
  alternates: { canonical: "/quiz/complete" },
};

export default function CompleteQuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
