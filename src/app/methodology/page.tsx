import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

export const metadata: Metadata = {
  title: "Methodology, How We Score Evidence | suppdoc.io",
  description: "How suppdoc.io evaluates supplement evidence, builds personalised recommendations, and decides which ingredients to recommend. Our public methodology in plain English.",
  keywords: "suppdoc methodology, supplement evidence scoring, how supplement quizzes work, transparent supplement recommendations",
  openGraph: {
    title: "How we score evidence, suppdoc.io",
    description: "Our public methodology for evaluating supplement evidence and building personalised recommendations.",
  },
};

export default function MethodologyPage() {
  return (
    <div style={{ minHeight: "100vh", background: TH.bg, color: TH.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section style={{
          padding: "var(--section-pad-y) var(--section-pad-x) 40px",
          maxWidth: 880, margin: "0 auto",
        }}>
          <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
            Methodology
          </div>
          <h1 style={{
            ...D, fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 18px",
          }}>
            How we <span style={SI}>score evidence</span>.
          </h1>
          <p style={{
            fontSize: 18, color: TH.inkSoft, lineHeight: 1.6, margin: 0,
            maxWidth: 680,
          }}>
            Most supplement sites won&apos;t tell you how they decide what to recommend. We will. This page documents exactly how the suppdoc.io engine evaluates evidence, matches you to ingredients, and applies safety filters, so you can decide for yourself whether to trust it.
          </p>

          {/* Trust stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14,
            marginTop: 30,
          }}>
            {[
              { n: "151", l: "ingredients evidence-graded", c: TH.sageDeep },
              { n: "4", l: "transparent evidence tiers", c: TH.amberDeep },
              { n: "100%", l: "of claims linked to studies", c: "#4338ca" },
              { n: "0", l: "own-brand pills we sell", c: TH.ink },
            ].map(s => (
              <div key={s.l} style={{
                background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 16, padding: "18px 18px",
              }}>
                <div style={{ ...D, fontSize: 34, lineHeight: 1, letterSpacing: "-0.03em", color: s.c }}>{s.n}</div>
                <div style={{ fontSize: 12.5, color: TH.muted, marginTop: 8, lineHeight: 1.4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TLDR strip */}
        <section style={{ padding: "0 var(--section-pad-x) 32px", maxWidth: 880, margin: "0 auto" }}>
          <div style={{
            background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
            border: `1px solid ${TH.edge}`,
            borderRadius: 18, padding: "22px 26px",
          }}>
            <div style={{ ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
              TL;DR
            </div>
            <ul style={{
              listStyle: "none", padding: 0, margin: 0,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {[
                "Every supplement is tagged with goals it addresses, evidence tier, and safety warnings.",
                "Your answers build a profile. We score each supplement against that profile, then filter for safety.",
                "Evidence tiers are based on the quality and quantity of human RCTs and meta-analyses.",
                "We don't sell our own pills, so we have no incentive to over-recommend.",
                "When the answer is 'fix sleep first, no supplement needed', we say that too.",
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, color: TH.inkSoft, lineHeight: 1.55 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TH.sage} strokeWidth="2.5" style={{ marginTop: 4, flexShrink: 0 }}>
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sections */}
        <article style={{
          padding: "20px var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 760, margin: "0 auto",
        }}>
          {/* Evidence tiers */}
          <Section number="01" title="The four evidence tiers">
            <P>Every supplement in our 151-ingredient catalog is rated with one of four evidence labels. These are <strong>conservative</strong>, we'd rather under-claim and earn trust than over-claim and lose it.</P>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0 20px" }}>
              <TierCard
                tier="Very strong" strength={4} delay={0}
                color="#15803d"
                bg="#dcfce7"
                examples="Vitamin D, Omega-3, Creatine, Magnesium glycinate, Zinc, B12"
                criteria={[
                  "Multiple meta-analyses of randomised controlled trials",
                  "Mechanism well-understood",
                  "Consistent dose-response data in humans",
                  "Decades of safety record",
                ]}
              />
              <TierCard
                tier="Strong" strength={3} delay={0.12}
                color="#a16207"
                bg="#fef3c7"
                examples="Ashwagandha, L-theanine, Collagen peptides, Curcumin, CoQ10"
                criteria={[
                  "At least one well-designed meta-analysis OR multiple high-quality RCTs",
                  "Consistent direction of effect across trials",
                  "Reasonable safety profile",
                ]}
              />
              <TierCard
                tier="Moderate" strength={2} delay={0.24}
                color="#4338ca"
                bg="#e0e7ff"
                examples="Rhodiola, Lion's mane, 5-HTP, Bacopa"
                criteria={[
                  "Multiple RCTs of variable quality OR strong observational data",
                  "Some mixed findings",
                  "Useful for specific use cases but not universally",
                ]}
              />
              <TierCard
                tier="Emerging" strength={1} delay={0.36}
                color="#5b21b6"
                bg="#ede9fe"
                examples="NMN, Fisetin, Urolithin A (Mitopure), Spermidine"
                criteria={[
                  "Early human trials show promise",
                  "Strong mechanistic / preclinical rationale",
                  "Long-term human safety data still accumulating",
                ]}
              />
            </div>
            <P>The <Link href="/ingredients" style={linkStyle}>ingredient pages</Link> display the tier as a colored badge. The <Link href="/journal" style={linkStyle}>research subpages</Link> (e.g. <Link href="/ingredients/d3k2/research" style={linkStyle}>/ingredients/d3k2/research</Link>) cite the actual studies behind the rating.</P>
          </Section>

          {/* Profile matching */}
          <Section number="02" title="How your profile gets matched">
            <P>The quiz, build, and audit tools all run the same engine under the hood. Here&apos;s the simplified flow.</P>
            <ScoreFlow />
            <Ol items={[
              "Your answers (goals, lifestyle, sleep, stress, diet, conditions) become a set of tags, e.g. low-sleep, high-stress, vegan, joint-pain.",
              "Each ingredient is scored: tag-matches × 2 + evidence boost + priority. Ingredients with no tag overlap score zero.",
              "Safety filter removes any ingredient whose warnings overlap your conditions or allergies (pregnancy, thyroid meds, blood thinners, etc.).",
              "Vegan filter removes non-vegan options if you've opted in.",
              "The top-scoring ingredients are selected greedily within your monthly budget cap, with a stack-size limit by tier.",
              "We add a baseline (e.g. D3) if nothing matched well, and we tell you when that happens.",
            ]} />
            <P>For the <Link href="/audit" style={linkStyle}>audit tool</Link>, the same engine runs in reverse: detect what you take, score against your goals, then flag overlaps, gaps, and timing issues.</P>
          </Section>

          {/* Safety filter */}
          <Section number="03" title="The safety filter">
            <P>Some ingredients have hard-coded warnings that exclude them automatically when relevant. We never override these, even if a supplement scores extremely well on goal-match, the safety filter wins.</P>
            <div style={{
              padding: "16px 18px", background: TH.surface,
              border: `1px solid ${TH.edge}`, borderRadius: 14, margin: "14px 0",
            }}>
              <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                Auto-excluded when relevant
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: TH.inkSoft, lineHeight: 1.65 }}>
                <li><strong>Pregnant or breastfeeding:</strong> ashwagandha, lion&apos;s mane, rhodiola, mucuna, white willow, ceramides, several adaptogens</li>
                <li><strong>Blood thinner medication:</strong> high-dose omega-3, curcumin, nattokinase, white willow, red yeast rice</li>
                <li><strong>Thyroid medication:</strong> ashwagandha (can potentiate), iodine</li>
                <li><strong>Active autoimmune disease:</strong> astragalus, elderberry, some adaptogens (immune-stimulating)</li>
                <li><strong>Fish or shellfish allergy:</strong> fish-based omega-3 (algae omega-3 substituted automatically)</li>
                <li><strong>Bipolar disorder:</strong> rhodiola, mucuna (mood-modulating)</li>
              </ul>
            </div>
            <P>For anything outside the auto-excluded list, and there are always edge cases, we recommend consulting a clinician before starting. This is on every result page, not buried.</P>
          </Section>

          {/* What we won't recommend */}
          <Section number="04" title="What we won't recommend, no matter what">
            <P>An honest catalog has gaps by design. Here&apos;s what you won&apos;t find recommended on suppdoc.io, and why.</P>
            <Ul items={[
              "Prescription-only medications, hormones (testosterone, HGH, thyroid), or scheduled substances.",
              "Stimulants with significant abuse potential or cardiovascular risk profiles (DMAA, ephedra, yohimbine at high doses).",
              "Generic 'detox' / 'cleanse' products without evidence of clinical effect.",
              "Mega-doses outside the range with safety data behind them.",
              "Anything sold by an 'anti-aging clinic' without peer-reviewed publication.",
              "Anything that depends on an active subscription or proprietary blend to evaluate (we need to see the dose).",
            ]} />
          </Section>

          {/* Conflict of interest */}
          <Section number="05" title="How we make money (and how we don't)">
            <P>This matters because every supplement quiz on the internet recommends products from the company that owns it. We don&apos;t.</P>
            <P><strong>What we earn:</strong> a small affiliate commission when you buy a recommended product from iHerb, Amazon, or other trusted retailers via our links. We never pay attention to commission rate when selecting recommendations, we have no commercial reason to push one brand over another.</P>
            <P><strong>What we don&apos;t do:</strong> sell our own private label, run a subscription, white-label other companies&apos; products, or accept payment from manufacturers to feature their brands.</P>
            <P>If a supplement that would be best for you happens to have no affiliate program at all, we still recommend it. The <Link href="/ingredients/melatonin" style={linkStyle}>melatonin</Link> and <Link href="/ingredients/methylfolate" style={linkStyle}>methylfolate</Link> entries are examples.</P>
          </Section>

          {/* Editorial process */}
          <Section number="06" title="Editorial process">
            <P>Every ingredient page, research summary, and blog article is written or reviewed by the suppdoc.io editorial team. We&apos;re building toward an external advisory board (clinical pharmacist + RD + sports physician); for now, every recommendation is grounded in:</P>
            <Ol items={[
              "Peer-reviewed primary literature, preferably meta-analyses and large RCTs, accessible via PubMed",
              "Authoritative guidelines (ISSN, AHA, NICE, WHO) where available",
              "Cross-reference against Examine.com and other independent references",
              "Pharmacist + dietitian consultation for tier assignments",
            ]} />
            <P>When we get something wrong, and we will, we update the article and add a note to the <Link href="/changelog" style={linkStyle}>changelog</Link>. We don&apos;t silently revise.</P>
          </Section>

          {/* AI specifically */}
          <Section number="07" title="What 'AI' actually means here">
            <P>We use the word AI honestly. Specifically, two things qualify:</P>
            <Ul items={[
              "Our recommendation engine is an algorithmic tag-matching + scoring system. It runs on every quiz, build, and audit. This is the same kind of system that powers a recommendation engine on a streaming service, it's not a language model.",
              "Our chat assistant, audit explainer, and plain-English stack builder use Claude Sonnet 4.6 (Anthropic) at request time, grounded in our 151-ingredient knowledge base. When you click a citation chip, it links to a real internal page.",
            ]} />
            <P>What we don&apos;t do: claim our AI has read 1,243 studies, claim it's been "trained on medical data", or claim it&apos;s smarter than a clinician. It&apos;s a tool. A good one. Not a replacement for human judgement on your own health.</P>
          </Section>

          {/* Updates */}
          <Section number="08" title="When this changes">
            <P>This page is the canonical source. If we update our scoring criteria, safety rules, or evidence tiers, we update this page first and post a note in the <Link href="/changelog" style={linkStyle}>changelog</Link>. The current version of the methodology was last revised on the date in the page metadata.</P>
            <P>Question, disagreement, or correction? Email <a href="mailto:hello@suppdoc.io" style={linkStyle}>hello@suppdoc.io</a>, we read every one.</P>
          </Section>
        </article>

        {/* CTA */}
        <section style={{
          padding: "0 var(--section-pad-x) var(--section-pad-y)",
          maxWidth: 760, margin: "0 auto",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${TH.sage} 0%, ${TH.sageDeep} 100%)`,
            borderRadius: 22, padding: "32px 36px", color: "#fff", textAlign: "center",
          }}>
            <h2 style={{ ...D, fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.1 }}>
              Ready to put it to work?
            </h2>
            <p style={{ fontSize: 15, opacity: 0.92, margin: "0 0 22px", maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
              Take the 2-minute quiz, build your own stack, or audit what you&apos;re already taking.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link href="/quiz" style={ctaBtn("#ffffff", TH.sageDeep)}>Start the quiz →</Link>
              <Link href="/audit" style={ctaBtn("transparent", "#ffffff", true)}>Audit my stack →</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        @keyframes tier-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes flow-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .tier-card { transition: transform .16s ease, box-shadow .16s ease; }
        .tier-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -16px rgba(10,37,64,0.28); }
        .flow-node { transition: transform .16s ease, box-shadow .16s ease; }
        .flow-node:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -14px rgba(10,37,64,0.30); }
      `}</style>
    </div>
  );
}

// ─── Scoring flow diagram ───────────────────────────────────────────────────
function ScoreFlow() {
  const steps = [
    { label: "Your answers", sub: "goals · sleep · diet", color: TH.sage },
    { label: "Tags", sub: "low-sleep, vegan…", color: TH.amber },
    { label: "Score", sub: "match × 2 + evidence", color: "#4338ca" },
    { label: "Safety filter", sub: "warnings removed", color: "#b91c1c" },
    { label: "Your stack", sub: "within budget", color: TH.sageDeep },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "stretch", gap: 8, flexWrap: "wrap",
      margin: "8px 0 18px", padding: "18px 16px",
      background: `linear-gradient(135deg, ${TH.surface} 0%, ${TH.bg} 100%)`,
      border: `1px solid ${TH.edge}`, borderRadius: 16,
    }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "contents" }}>
          <div className="flow-node" style={{
            flex: "1 1 120px", minWidth: 0,
            background: TH.surface, border: `1px solid ${TH.edge}`, borderTop: `3px solid ${s.color}`,
            borderRadius: 12, padding: "12px 12px", textAlign: "center",
            animation: `flow-in .45s ease-out ${i * 0.1}s both`,
          }}>
            <div style={{ ...MM, fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: TH.ink, lineHeight: 1.2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: TH.muted, marginTop: 3, lineHeight: 1.3 }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div aria-hidden style={{ display: "flex", alignItems: "center", color: TH.mutedDim, fontSize: 16, flexShrink: 0 }}>→</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────────────────
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
        <span style={{
          ...MM, fontSize: 12, color: TH.sageDeep, letterSpacing: "0.1em",
          padding: "3px 9px", background: `${TH.sage}1a`, borderRadius: 999,
        }}>{number}</span>
        <h2 style={{
          ...D, fontSize: 24, color: TH.ink, margin: 0,
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>{title}</h2>
      </div>
      <div style={{ color: TH.inkSoft, fontSize: 16, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 14px" }}>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 14px", paddingLeft: 20 }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: 6, lineHeight: 1.65 }}>{item}</li>)}
    </ul>
  );
}

function Ol({ items }: { items: string[] }) {
  return (
    <ol style={{ margin: "0 0 14px", paddingLeft: 22 }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: 6, lineHeight: 1.65 }}>{item}</li>)}
    </ol>
  );
}

function TierCard({ tier, color, bg, examples, criteria, strength, delay }: { tier: string; color: string; bg: string; examples: string; criteria: string[]; strength: number; delay: number }) {
  return (
    <div className="tier-card" style={{
      padding: "16px 18px", background: TH.surface,
      border: `1px solid ${TH.edge}`, borderRadius: 14, borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{
          padding: "4px 12px", background: bg, color, ...MM, fontSize: 11.5,
          fontWeight: 700, letterSpacing: "0.05em", borderRadius: 999, textTransform: "uppercase",
        }}>{tier}</span>
        {/* Animated evidence-strength meter (4 segments) */}
        <span aria-label={`Evidence strength ${strength} of 4`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {[0, 1, 2, 3].map(i => (
            <span key={i} style={{
              width: 22, height: 6, borderRadius: 999, overflow: "hidden",
              background: TH.edge, position: "relative",
            }}>
              {i < strength && (
                <span style={{
                  position: "absolute", inset: 0, background: color, borderRadius: 999,
                  transformOrigin: "left center",
                  animation: `tier-fill .5s cubic-bezier(.2,.7,.2,1) ${delay + i * 0.09}s both`,
                }} />
              )}
            </span>
          ))}
        </span>
        <span style={{ ...MM, fontSize: 11, color, fontWeight: 600 }}>{strength}/4</span>
      </div>
      <div style={{ fontSize: 13, color: TH.muted, fontStyle: "italic", marginBottom: 10 }}>e.g. {examples}</div>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: TH.inkSoft, lineHeight: 1.6 }}>
        {criteria.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: TH.sageDeep, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2,
};

function ctaBtn(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
    background: bg, color, textDecoration: "none",
    border: outline ? `1px solid ${color}55` : "none",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
}
