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
  ["What supplements shouldn't be taken together?", "Some combinations compete for absorption or double up the same effect — calcium can blunt iron and zinc, and stacking several supplements that thin the blood or lower blood pressure can add up. Our free stack audit checks what you already take for interactions, redundancies, and dosing, and flags anything worth spacing out or raising with your doctor."],
  ["What's the best supplement for sleep?", "There's no single answer — it depends on what's keeping you up. The research most consistently points to magnesium (often the glycinate form), glycine, and L-theanine for winding down, while melatonin helps more with timing than with staying asleep. The quiz asks about your sleep and matches the evidence to you instead of guessing."],
  ["Are supplements actually worth it, or a waste of money?", "Often they're not needed, and we'll say so. Many gaps are better closed with food, light, and sleep, and plenty of products are dosed too low to do anything. Where the evidence is genuinely strong for your situation we show it with the studies linked; where it's thin, we tell you that too, so you only spend on what might actually help."],
];
