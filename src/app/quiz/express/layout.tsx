import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Express Quiz, your stack in 2 minutes | suppdoc.io",
  description: "The fast track to a personalised supplement stack. Answer a few goal-focused questions and get evidence-graded recommendations in about two minutes, no account needed.",
  keywords: "express supplement quiz, quick supplement recommendation, 2 minute supplement quiz, fast supplement stack",
  alternates: { canonical: "/quiz/express" },
};

export default function ExpressQuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
