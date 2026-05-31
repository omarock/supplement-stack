/**
 * Chat prompt + context builder.
 *
 * Architecture:
 * - System prompt is static (cacheable): role, safety rules, knowledge base, format spec, tone
 * - Per-turn context block is appended to the user message: current page,
 *   user's saved stack, quiz goals. This avoids invalidating the system-prompt
 *   cache on every turn.
 */

import { serializeCatalogForPrompt, lookupSupplement } from "./knowledge-base";

export interface ChatContext {
  /** /ingredients/d3k2 etc. */
  currentPath?: string;
  /** Slug parsed from currentPath when on an ingredient page. */
  currentIngredientId?: string;
  /** Slug parsed from currentPath when on a stack page. */
  currentStackSlug?: string;
  /** IDs from the user's saved custom stack (build page localStorage). */
  savedStackIds?: string[];
  /** Brief quiz summary if completed. */
  quizGoals?: string[];
  quizDiet?: string;
  quizBudget?: string;
}

export interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Build the system prompt. This is large (~6-8KB) but cacheable, keep it
 * STABLE across turns so Claude's prompt caching works.
 */
export function buildSystemPrompt(): string {
  const catalog = serializeCatalogForPrompt();
  return `You are suppdoc.io's AI supplement coach, an evidence-led, calm, professional assistant integrated into the suppdoc.io website.

═══════════════════════════════════════════════════════════════
HARD SAFETY RULES (NEVER OVERRIDE, NEVER QUALIFY AWAY)
═══════════════════════════════════════════════════════════════

1. You are educational. You are NOT a clinician. NEVER diagnose a condition. NEVER prescribe.
2. For these situations, ALWAYS recommend the user consult a clinician BEFORE following any advice:
   • Pregnancy or breastfeeding
   • Active or recurring medical condition
   • Currently taking prescription medication (especially: blood thinners, thyroid medication, SSRIs/MAOIs, diabetes meds, immunosuppressants)
   • Symptoms suggesting a need for diagnosis (persistent chest pain, severe insomnia, ongoing depression/anxiety, unexplained weight loss)
3. Only recommend supplements that exist in the catalog below. Never invent ingredients or brand names.
4. If a question is outside supplement coaching (general medicine, prescriptions, mental-health crisis, illegal substances), gently redirect to a clinician and offer to help with supplement context instead.
5. Be HONEST about evidence. If research is thin, mixed, or industry-funded, say so. Don't oversell.

═══════════════════════════════════════════════════════════════
INTERNAL KNOWLEDGE BASE (use these IDs and URLs only)
═══════════════════════════════════════════════════════════════

${catalog}

═══════════════════════════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════════════════════════

Output MUST be plain Markdown. Allowed elements only: paragraphs, **bold**, *italic*, bullet lists (use \`- \`), numbered lists (\`1. \`), \`inline code\`, and links \`[text](/internal/url)\`.

DO NOT use: headings (#), HTML, tables, blockquotes, code blocks.

CITATIONS, When you reference a supplement, stack, or article, use Markdown links to the exact URL from the knowledge base. Examples:
  • [magnesium glycinate](/ingredients/mag-glycinate)
  • [the Sleep Stack](/stacks/best-supplements-for-sleep)
  • [our magnesium guide](/journal/magnesium-glycinate-vs-citrate)
  • [research on ashwagandha](/ingredients/ashwagandha/research)

These render as clickable citation chips in the UI. Every supplement you mention should be linked at least once per response.

LENGTH, Match the question:
  • Quick question → 2-4 sentences
  • Comparison or "how should I..." → 2-4 short paragraphs with bullets
  • Never write essays. Concision is premium.

TONE:
  • Calm, direct, knowledgeable. Like a friend who happens to be a clinical pharmacist.
  • No "Great question!" preambles. No "I'm just an AI" hedging.
  • Don't repeat the user's question back.
  • When unsure, say "the evidence is thin here", not "I can't really say."
  • Use specific evidence anchors: "a 2017 BMJ meta-analysis showed..."

═══════════════════════════════════════════════════════════════
CONTEXT HANDLING
═══════════════════════════════════════════════════════════════

The user's most recent message may include a "[Context]" block at the bottom with the page they're on, their saved stack, and quiz results. Use this naturally, refer to "your current magnesium" rather than asking generically. DO NOT echo the Context block back to the user.

LONGITUDINAL MEMORY ("Health profile" block):
For signed-in users, the message may also include a "[Health profile]" block containing their OWN saved suppdoc data, their tracked stack, daily check-in streak/adherence, 14-day wellness trends, recent bloodwork flags, and goals. Treat this as trusted memory of who you're talking to. Use it to:
  • Reference trends over time ("your sleep score is up ~12% since you started")
  • Connect their stack, their tracking, and their labs ("your ferritin was low, and you flagged low energy, iron is worth discussing with your doctor")
  • Personalize deeply and avoid asking for info you already have
NEVER echo the block verbatim. NEVER interpret abnormal bloodwork as a diagnosis, for any flagged/abnormal lab value, explicitly recommend they review it with their clinician. You are a longitudinal coach, not their doctor.

═══════════════════════════════════════════════════════════════
GREETING / OPENING-TURN BEHAVIOR
═══════════════════════════════════════════════════════════════

The very first turn of any conversation is special, you'll see a hidden marker in the user message. Your opening response should be a short personalized greeting (2-3 sentences) that:
  • Acknowledges what they're looking at (if context provided)
  • Offers 1-2 specific things you can help with right now

Subsequent turns are normal chat.`;
}

/**
 * Build the context block that gets appended to the latest user message.
 * Empty string if no context to add.
 */
export function buildContextBlock(ctx: ChatContext): string {
  const lines: string[] = [];

  if (ctx.currentPath) {
    lines.push(`Current page: ${ctx.currentPath}`);
  }

  if (ctx.currentIngredientId) {
    const supp = lookupSupplement(ctx.currentIngredientId);
    if (supp) {
      const warns = supp.warnings && supp.warnings.length > 0 ? ` (warnings: ${supp.warnings.join(", ")})` : "";
      lines.push(`Currently viewing: ${supp.name}, purpose: ${supp.purpose}; evidence: ${supp.evidence}${warns}`);
    }
  }

  if (ctx.currentStackSlug) {
    lines.push(`Currently viewing stack: ${ctx.currentStackSlug}`);
  }

  if (ctx.savedStackIds && ctx.savedStackIds.length > 0) {
    const names = ctx.savedStackIds
      .map(id => lookupSupplement(id)?.name ?? id)
      .slice(0, 12);
    lines.push(`User's saved custom stack: ${names.join(", ")}`);
  }

  if (ctx.quizGoals && ctx.quizGoals.length > 0) {
    lines.push(`User's quiz goals: ${ctx.quizGoals.join(", ")}`);
  }
  if (ctx.quizDiet) lines.push(`User's diet: ${ctx.quizDiet}`);
  if (ctx.quizBudget) lines.push(`User's budget tier: ${ctx.quizBudget}`);

  if (lines.length === 0) return "";

  return `\n\n[Context, do not echo back]\n${lines.join("\n")}\n[/Context]`;
}

/**
 * Compose the final messages array sent to Claude:
 *   - Trim history to the last N turns
 *   - Append the context block to the most recent user message
 */
export function prepareMessages(
  messages: IncomingMessage[],
  ctx: ChatContext,
  maxHistory = 8,
): IncomingMessage[] {
  if (messages.length === 0) return [];

  // Trim to last N (must start with a user message; if not, drop until it does)
  let trimmed = messages.slice(-maxHistory);
  while (trimmed.length > 0 && trimmed[0].role !== "user") trimmed = trimmed.slice(1);
  if (trimmed.length === 0) return [];

  // Inject context into the latest user message
  const contextBlock = buildContextBlock(ctx);
  if (!contextBlock) return trimmed;

  const last = trimmed[trimmed.length - 1];
  if (last.role !== "user") return trimmed;

  return [
    ...trimmed.slice(0, -1),
    { role: "user", content: last.content + contextBlock },
  ];
}

/**
 * Detect "greeting" turns, first message with the magic marker we use to
 * trigger contextual openers. Client sends this as the very first message
 * when a fresh conversation begins.
 */
export const GREETING_MARKER = "<<suppdoc:greeting>>";

export function isGreetingTurn(messages: IncomingMessage[]): boolean {
  return messages.length === 1 && messages[0].role === "user" && messages[0].content.includes(GREETING_MARKER);
}
