/**
 * Single source of truth for the homepage FAQ. Rendered by HomeClient's FAQ
 * section AND emitted as FAQPage JSON-LD by app/page.tsx (the server wrapper),
 * so the visible questions and the structured data can never drift apart.
 */
export const HOME_FAQ: [string, string][] = [
  ["Is this medical advice?", "No, suppdoc.io is for education and personal experimentation. We tell you what the research suggests and why. For diagnosis or treatment, please see a clinician."],
  ["How do the recommendations work?", "Your answers are matched against the published research and clinical dosing guidance for each ingredient, then filtered for your goals, diet, and safety flags. Every pick comes with the reasoning behind it."],
  ["Do I need a subscription?", "No subscription, no signup. You can get your stack for free. We earn a small commission only when you choose to buy through one of our retail partners like iHerb or Amazon, at no extra cost to you."],
  ["What if I don't need supplements?", "Sometimes you don't, and we'll tell you. The engine surfaces where lifestyle alone is enough, and where a supplement might actually move the needle."],
  ["Can a beginner use this?", "Absolutely. Every recommendation comes with plain-language reasoning, exact dose, what form to look for, and the best time of day to take it."],
];
