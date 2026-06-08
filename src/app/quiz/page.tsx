import type { Metadata } from "next";
import QuizChooserView from "./QuizChooserView";

export const metadata: Metadata = {
  title: "Take the Quiz, Express or Complete | suppdoc.io",
  description: "Get a personalised supplement stack. Choose the 2-minute Express quiz for fast goal-matched recommendations, or the 5-minute Complete quiz for deep personalization including bloodwork analysis.",
  keywords: "supplement quiz, personalised supplements, personalised supplement quiz, express supplement quiz",
  alternates: {
    canonical: "/quiz",
    languages: { en: "/quiz", fr: "/fr/quiz", de: "/de/quiz", es: "/es/quiz", "x-default": "/quiz" },
  },
};

export default function Page() {
  return <QuizChooserView locale="en" />;
}
