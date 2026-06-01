/**
 * One-off: remove the word "AI" from visible marketing / UI / SEO copy and
 * reframe it premium. Scoped to explicit files and explicit phrases so it
 * NEVER touches code logic. Deliberately leaves the legal/honesty pages
 * (privacy, methodology, editorial) and internal code comments intact.
 *
 * Run: node scripts/strip-ai-copy.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// file (relative to src) -> ordered list of [from, to] literal replacements
const MAP = {
  "components/SiteHeader.tsx": [
    [`{ label: "AI quiz", href: "/quiz"`, `{ label: "Personalised quiz", href: "/quiz"`],
  ],
  "app/quiz/page.tsx": [
    [`personalised supplements, AI supplement quiz,`, `personalised supplements, personalised supplement quiz,`],
    [`Service 01 · AI Quiz`, `Service 01 · Personalised Quiz`],
  ],
  "app/audit/AuditClient.tsx": [
    [`Service 03 · AI Audit`, `Service 03 · Stack Audit`],
  ],
  "app/audit/page.tsx": [
    [`Interaction Checker (free AI), suppdoc.io`, `Interaction Checker (free), suppdoc.io`],
    [`our free AI audit flags`, `our free audit flags`],
    [`analyzer, AI supplement review, supplement optimization`, `analyzer, supplement stack review, supplement optimization`],
    [`Paste your supplements. AI flags redundancies`, `Paste your supplements. We flag redundancies`],
  ],
  "app/api/chat/route.ts": [
    [`I'm suppdoc.io's AI coach.`, `I'm suppdoc.io's supplement coach.`],
    [`While our full AI is being set up`, `While the full coach is being set up`],
    [`Our AI assistant is being set up, meanwhile,`, `Our coach is being set up, meanwhile,`],
    [`Our AI assistant is being set up. While that's connecting`, `Our coach is being set up. While that's connecting`],
  ],
  "app/api/bloodwork/analyze/route.ts": [
    [`This is a basic rule-based reading, connect an AI key for full report parsing.`, `This is a basic rule-based reading; full report parsing is not enabled yet.`],
    [`AI analysis isn't available right now.`, `Full analysis isn't available right now.`],
  ],
  "app/pricing/PricingClient.tsx": [
    [`"AI quiz + stack builder + audit"`, `"Personalised quiz + stack builder + audit"`],
    [`"AI coach with memory of your data"`, `"Coach with memory of your data"`],
  ],
  "app/pricing/page.tsx": [
    [`and an AI coach that remembers your data.`, `and a coach that remembers your data.`],
  ],
  "app/me/subscription/page.tsx": [
    [`and the AI coach with memory of your data.`, `and the coach with memory of your data.`],
  ],
  "app/me/page.tsx": [
    [`full trends & AI memory.`, `full trends & coach memory.`],
    [`Upload a lab report, AI flags deficiencies and matches targeted supplements.`, `Upload a lab report, we flag deficiencies and match targeted supplements.`],
  ],
  "app/layout.tsx": [
    [`suppdoc.io, AI supplement stacks, audit`, `suppdoc.io, personalised supplement stacks, audit`],
    [`the evidence-graded AI supplement platform.`, `the evidence-graded supplement platform.`],
    [`suppdoc.io, AI supplement stack, supplement audit`, `suppdoc.io, personalised supplement stack, supplement audit`],
    [`Evidence-graded AI supplement platform. Personalised stacks, interaction checking`, `Evidence-graded supplement platform. Personalised stacks, interaction checking`],
  ],
  "app/track/TrackerClient.tsx": [
    [`analytics, AI memory & reminders`, `analytics, coach memory & reminders`],
    [`"Get insights", "AI weekly summary"`, `"Get insights", "Weekly summary"`],
    [`✦ AI Weekly Summary`, `✦ Weekly Summary`],
  ],
  "components/ChatAssistant/Launcher.tsx": [
    [`"Close AI assistant" : "Open AI assistant"`, `"Close supplement coach" : "Open supplement coach"`],
    [`      }}>\n        AI\n        <span style={{`, `      }}>\n        sd\n        <span style={{`],
  ],
  "components/ChatAssistant/Panel.tsx": [
    [`aria-label="suppdoc AI assistant"`, `aria-label="suppdoc supplement coach"`],
    [`suppdoc AI`, `suppdoc coach`],
  ],
  "app/build/BuildClient.tsx": [
    [`}}>AI</span>`, `}}>FOR YOU</span>`],
    [`"claude" ? "AI-composed for you" :`, `"claude" ? "Composed for you" :`],
    [`"template" ? "STACK" : "AI"}`, `"template" ? "STACK" : "FOR YOU"}`],
  ],
  "app/interactions/page.tsx": [
    [`for an instant AI check.`, `for an instant check.`],
    [`paste your supplements and our AI flags interactions, redundancies, and timing issues instantly`, `paste your supplements and we flag interactions, redundancies, and timing issues instantly`],
  ],
  "app/interactions/[pair]/page.tsx": [
    [`our free AI checker flags every interaction`, `our free checker flags every interaction`],
  ],
  "app/biomarkers/[marker]/page.tsx": [
    [`our AI reads {b.label.toLowerCase()} and your other markers, then matches`, `we read {b.label.toLowerCase()} and your other markers, then match`],
  ],
  "app/bloodwork/BloodworkClient.tsx": [
    [`Our AI reads your biomarkers, flags what&apos;s low or high, and suggests`, `We read your biomarkers, flag what&apos;s low or high, and suggest`],
  ],
  "app/bloodwork/page.tsx": [
    [`Bloodwork Supplement Analysis (free AI), upload`, `Bloodwork Supplement Analysis (free), upload`],
    [`and our AI reads your biomarkers, flags what`, `and we read your biomarkers, flag what`],
    [`Upload your labs. AI reads your biomarkers and matches`, `Upload your labs. We read your biomarkers and match`],
    [`Can AI analyze my blood test results?`, `Can suppdoc analyze my blood test results?`],
    [`suppdoc's AI extracts your biomarkers`, `suppdoc extracts your biomarkers`],
  ],
  "app/changelog/page.tsx": [
    [`title: "AI chat assistant"`, `title: "Chat coach"`],
    [`Added a floating AI coach`, `Added a floating supplement coach`],
  ],
  "lib/competitors.ts": [
    [`label: "Personalised AI quiz"`, `label: "Personalised quiz"`],
    [`label: "AI chat assistant"`, `label: "Chat coach"`],
  ],
  "lib/chat-context.ts": [
    [`You are suppdoc.io's AI supplement coach,`, `You are suppdoc.io's supplement coach,`],
    [`No "I'm just an AI" hedging.`, `No "I'm just an assistant" hedging.`],
  ],
};

let changed = 0;
const notFound = [];

for (const [rel, pairs] of Object.entries(MAP)) {
  const file = path.join(ROOT, "src", rel);
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) {
    if (!text.includes(from)) {
      notFound.push(`${rel}  <<  ${JSON.stringify(from).slice(0, 70)}`);
      continue;
    }
    text = text.split(from).join(to);
    changed++;
  }
  fs.writeFileSync(file, text, "utf8");
}

console.log(`Applied ${changed} replacement(s).`);
if (notFound.length) {
  console.log(`\nNOT FOUND (${notFound.length}) -- needs manual review:`);
  notFound.forEach(n => console.log("  " + n));
} else {
  console.log("All phrases matched.");
}
