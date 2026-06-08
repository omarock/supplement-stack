"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { TH, FONTS } from "@/lib/theme";
import type { AuditResponse, AuditFinding } from "@/app/api/audit-stack/route";
import ThinkingMessages, { PHRASES } from "@/components/ThinkingMessages";
import TrackStackCTA from "@/components/TrackStackCTA";
import EmailCapture from "@/components/EmailCapture";
import { track } from "@/lib/analytics";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const SI = { fontFamily: FONTS.serifItalic, fontStyle: "italic" as const, fontWeight: 400 };
const MM = { fontFamily: FONTS.mono } as const;

const EXAMPLE_STACK = `Vitamin D3 5000 IU
Omega-3 fish oil 1500mg
Magnesium glycinate 400mg
Ashwagandha KSM-66 600mg
Creatine 5g
Vitamin C 1000mg
Zinc picolinate 30mg
Iron 25mg
Calcium 500mg`;

export default function AuditClient() {
  const [text, setText] = useState("");
  const [bloodwork, setBloodwork] = useState("");
  const [showLabs, setShowLabs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async (input: string, labs: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/audit-stack", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input, bloodwork: labs.trim() || undefined }),
      });
      const body: AuditResponse = await res.json();
      if (!body.ok) {
        setError(body.error ?? "Something went wrong.");
      } else {
        setResult(body);
        track("audit_run", { score: body.score ?? 0, poweredBy: body.poweredBy ?? "rules", detected: body.detected?.length ?? 0 });
        // Smooth-scroll to result
        setTimeout(() => {
          document.getElementById("audit-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main style={{ padding: "var(--section-pad-y) var(--section-pad-x) 80px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 36, animation: "sd-fade-in .5s ease-out" }}>
          <div style={{
            ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em",
            marginBottom: 14, textTransform: "uppercase",
          }}>Service 03 · Stack Audit</div>
          <h1 style={{
            ...D, fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.04,
            letterSpacing: "-0.03em", margin: "0 0 16px",
          }}>
            Audit your current <span style={SI}>stack</span>.
          </h1>
          <p style={{
            fontSize: 18, color: TH.inkSoft, maxWidth: 620, margin: "0 auto",
            lineHeight: 1.55,
          }}>
            Paste what you take today. We&apos;ll find what&apos;s redundant, missing, risky, or mistimed, then suggest a cleaner version. Add your recent bloodwork for a deeper, lab-aware check. Free, instant, no signup.
          </p>
        </header>

        {/* Input panel */}
        <section style={{
          background: TH.surface, border: `1px solid ${TH.edge}`,
          borderRadius: 22, padding: "24px 26px",
          boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.08)",
        }}>
          <label htmlFor="audit-text" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 13, fontWeight: 500, color: TH.inkSoft, marginBottom: 10,
          }}>
            <span>Your current supplements (one per line, include dose if you know it)</span>
            <button
              type="button"
              onClick={() => setText(EXAMPLE_STACK)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: TH.sageDeep, fontSize: 12.5, fontWeight: 500, padding: 0,
              }}
            >
              Load example
            </button>
          </label>

          <textarea
            id="audit-text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"e.g.\nVitamin D3 5000 IU\nMagnesium glycinate 400mg\nAshwagandha 600mg\nOmega-3 1g\n…"}
            rows={9}
            spellCheck={false}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "14px 16px", border: `1.5px solid ${TH.edge}`,
              borderRadius: 14, fontSize: 15, lineHeight: 1.6,
              fontFamily: FONTS.body, color: TH.ink, background: TH.bg,
              outline: "none", resize: "vertical",
              transition: "border-color .2s, box-shadow .2s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 4px ${TH.accentGlow}`; }}
            onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
          />

          {/* Optional bloodwork, for a deeper, lab-aware audit */}
          <div style={{ marginTop: 14 }}>
            {!showLabs ? (
              <button
                type="button"
                onClick={() => setShowLabs(true)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12,
                  background: `color-mix(in srgb, ${TH.sage} 5%, transparent)`, border: `1px dashed color-mix(in srgb, ${TH.sage} 50%, transparent)`,
                  cursor: "pointer", color: TH.sageDeep, fontSize: 13.5, fontWeight: 500,
                  fontFamily: FONTS.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <span aria-hidden>🩸</span> Add recent lab results for a deeper, lab-aware audit
                <span style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.04em" }}>OPTIONAL</span>
              </button>
            ) : (
              <div>
                <label htmlFor="audit-labs" style={{ display: "block", fontSize: 13, fontWeight: 500, color: TH.inkSoft, marginBottom: 8 }}>
                  Recent lab / bloodwork results
                  <span style={{ color: TH.muted, fontWeight: 400 }}> we&apos;ll cross-check them against your stack (flag conflicts, spot deficiencies)</span>
                </label>
                <textarea
                  id="audit-labs"
                  value={bloodwork}
                  onChange={e => setBloodwork(e.target.value)}
                  placeholder={"e.g.\nVitamin D 22 ng/mL\nFerritin 180 ng/mL\nB12 350 pg/mL\nMagnesium 1.8 mg/dL"}
                  rows={5}
                  spellCheck={false}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "14px 16px", border: `1.5px solid ${TH.edge}`,
                    borderRadius: 14, fontSize: 15, lineHeight: 1.6,
                    fontFamily: FONTS.body, color: TH.ink, background: TH.bg,
                    outline: "none", resize: "vertical",
                    transition: "border-color .2s, box-shadow .2s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.boxShadow = `0 0 0 4px ${TH.accentGlow}`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            )}
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 14, flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.5 }}>
              <strong style={{ color: TH.inkSoft }}>Privacy:</strong> What you paste isn&apos;t stored. Educational use only, not medical advice.
            </div>
            <button
              type="button"
              onClick={() => runAudit(text, bloodwork)}
              disabled={loading || text.trim().length < 5}
              style={{
                padding: "13px 22px", borderRadius: 999, border: "none",
                background: loading ? TH.muted : TH.inkBg, color: "#fff",
                fontFamily: FONTS.body, fontWeight: 500, fontSize: 14.5,
                cursor: loading || text.trim().length < 5 ? "not-allowed" : "pointer",
                opacity: text.trim().length < 5 ? 0.5 : 1,
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: loading ? "none" : `0 8px 22px color-mix(in srgb, ${TH.ink} 13%, transparent)`,
                transition: "all .2s",
              }}
            >
              {loading ? (
                <ThinkingMessages phrases={PHRASES.audit} interval={900} />
              ) : (
                <>
                  Audit my stack
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {error && (
            <div role="alert" style={{
              marginTop: 14, padding: "10px 14px", borderRadius: 10,
              background: "#fef2f2", color: "#991b1b", fontSize: 13.5,
            }}>
              {error}
            </div>
          )}
        </section>

        {/* What we check, only show before result */}
        {!result && !loading && (
          <section style={{ marginTop: 40 }}>
            <div style={{
              ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em",
              marginBottom: 14, textAlign: "center", textTransform: "uppercase",
            }}>What we check</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}>
              {[
                { ic: "⚠", t: "Interactions", d: "Iron + calcium, NMN without methyl donor, NSAID-like stacking." },
                { ic: "↻", t: "Redundancies", d: "Two omega-3s, CoQ10 + ubiquinol, three magnesiums." },
                { ic: "✚", t: "Missing nutrients", d: "Foundational gaps you might want to fix." },
                { ic: "◐", t: "Timing", d: "What to take morning vs evening, on empty stomach, etc." },
                { ic: "$", t: "Cost analysis", d: "Spot waste, same effect for less." },
                { ic: "★", t: "Evidence quality", d: "Each pick scored by published research." },
              ].map(item => (
                <div key={item.t} style={{
                  padding: "16px 18px", background: TH.surface,
                  border: `1px solid ${TH.edge}`, borderRadius: 14,
                }}>
                  <div style={{
                    fontSize: 18, color: TH.sageDeep, marginBottom: 6,
                  }} aria-hidden>{item.ic}</div>
                  <div style={{ ...D, fontSize: 15, color: TH.ink, marginBottom: 4 }}>{item.t}</div>
                  <div style={{ fontSize: 13, color: TH.muted, lineHeight: 1.5 }}>{item.d}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Result */}
        {result && (
          <section id="audit-result" style={{ marginTop: 36, animation: "sd-fade-in .4s ease-out" }}>
            <AuditResult data={result} onRedo={() => { setResult(null); setText(""); setBloodwork(""); setShowLabs(false); }} />
            <div style={{ maxWidth: 760, margin: "24px auto 0" }}>
              <EmailCapture source="audit" headline="Get your audit by email" sub="We'll send your audit plus a short weekly evidence brief. No spam, unsubscribe anytime." />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// ─── Audit result UI ──────────────────────────────────────────────────────
function AuditResult({ data, onRedo }: { data: AuditResponse; onRedo: () => void }) {
  const scoreColor = data.score >= 85 ? TH.sageDeep : data.score >= 65 ? TH.amberDeep : "#b91c1c";
  const matchedCount = data.detected.filter(d => d.matched).length;
  const unmatched = data.detected.filter(d => !d.matched);
  const groups = groupFindings(data.findings);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Score + summary */}
      <div style={{
        display: "grid", gridTemplateColumns: "var(--audit-score-cols)", gap: 22,
        background: TH.surface, border: `1px solid ${TH.edge}`,
        borderRadius: 22, padding: "26px 28px",
        boxShadow: "0 1px 3px rgba(10,37,64,0.04), 0 14px 36px rgba(10,37,64,0.08)",
      }}>
        {/* Score ring */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <ScoreRing value={data.score} color={scoreColor} />
          <div>
            <div style={{ ...MM, fontSize: 11, color: TH.muted, letterSpacing: "0.12em", marginBottom: 4, textTransform: "uppercase" }}>
              Stack score
            </div>
            <div style={{ ...D, fontSize: 30, color: TH.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {data.score >= 85 ? "Strong stack." : data.score >= 65 ? "Decent, with room." : data.score >= 50 ? "Needs cleanup." : "Significant issues."}
            </div>
            <div style={{ fontSize: 13.5, color: TH.muted, marginTop: 6 }}>
              {matchedCount} ingredient{matchedCount === 1 ? "" : "s"} recognized
              {data.monthlyCostEstimate ? ` · ~$${data.monthlyCostEstimate}/mo` : ""}
            </div>
          </div>
        </div>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 8,
        }}>
          <span style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {data.poweredBy === "claude" ? "Powered by Claude" : "Rule-based audit"}
          </span>
          <button onClick={onRedo} style={{
            padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
            background: TH.bg, border: `1px solid ${TH.edge}`, color: TH.ink, cursor: "pointer",
          }}>
            Audit another stack
          </button>
        </div>
      </div>

      {/* Findings groups */}
      {groups.map(g => (
        <div key={g.kind} style={{
          background: TH.surface, border: `1px solid ${TH.edge}`,
          borderRadius: 18, padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <FindingBadge kind={g.kind} />
            <h2 style={{ ...D, fontSize: 18, color: TH.ink, margin: 0, letterSpacing: "-0.015em" }}>
              {g.label}{" "}
              <span style={{ color: TH.muted, fontWeight: 500, fontSize: 14, ...MM }}>· {g.items.length}</span>
            </h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {g.items.map((f, i) => (
              <li key={i} style={{
                padding: "12px 14px", background: TH.bg, borderRadius: 12,
                borderLeft: `3px solid ${kindColor(f.kind)}`,
              }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: TH.ink, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: TH.inkSoft, lineHeight: 1.55 }}>{f.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {data.findings.length === 0 && (
        <div style={{
          background: "#f0f9f3", border: `1px solid color-mix(in srgb, ${TH.sage} 20%, transparent)`, borderRadius: 18,
          padding: "20px 22px", display: "flex", gap: 12, alignItems: "center",
        }}>
          <span style={{ fontSize: 22 }} aria-hidden>🌿</span>
          <div>
            <div style={{ ...D, fontSize: 17, color: TH.sageDeep, marginBottom: 2 }}>Clean stack.</div>
            <div style={{ fontSize: 13.5, color: TH.inkSoft }}>
              We didn&apos;t find any interactions, redundancies, or major gaps. Stay consistent and re-audit if you change anything.
            </div>
          </div>
        </div>
      )}

      {/* Suggested simplified stack */}
      {data.suggestedStack && data.suggestedStack.length > 0 && (
        <div style={{
          background: `linear-gradient(135deg, ${TH.bg} 0%, ${TH.surface} 100%)`,
          border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px",
        }}>
          <div style={{
            ...MM, fontSize: 11, color: TH.sageDeep, letterSpacing: "0.12em",
            marginBottom: 10, textTransform: "uppercase",
          }}>Recommended additions</div>
          <h2 style={{ ...D, fontSize: 20, color: TH.ink, margin: "0 0 14px", letterSpacing: "-0.015em" }}>
            What we&apos;d add to make it complete
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.suggestedStack.slice(0, 6).map(s => (
              <Link key={s.id} href={`/ingredients/${s.id}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", background: TH.surface,
                borderRadius: 12, border: `1px solid ${TH.edge}`,
                textDecoration: "none", color: "inherit",
                transition: "border-color .15s, transform .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = TH.sage; e.currentTarget.style.transform = "translateX(2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = TH.edge; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: TH.ink }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.5, marginTop: 2 }}>{s.reason}</div>
                </div>
                <span style={{ color: TH.sageDeep, fontSize: 13 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched */}
      {unmatched.length > 0 && (
        <div style={{
          background: TH.surface, border: `1px solid ${TH.edge}`,
          borderRadius: 14, padding: "16px 18px",
        }}>
          <div style={{ fontSize: 13, color: TH.muted, marginBottom: 6 }}>
            We couldn&apos;t recognize these, likely brand-specific or outside our 200+ ingredient library:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unmatched.map((u, i) => (
              <span key={i} style={{
                padding: "3px 10px", background: TH.bg,
                borderRadius: 999, fontSize: 12.5, color: TH.inkSoft,
              }}>{u.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* WOW → HOOK: track the audited stack over time */}
      <TrackStackCTA
        stackName="My audited stack"
        stackIds={data.detected.filter(d => d.matched && d.id).map(d => d.id!)}
        source="audit"
      />

      {/* CTA */}
      <div style={{
        background: TH.inkBg, color: "#fff", borderRadius: 18,
        padding: "26px 28px", textAlign: "center",
      }}>
        <h3 style={{ ...D, fontSize: 22, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
          Want a fresh stack instead?
        </h3>
        <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 18px" }}>
          Take the quiz or describe your goals in plain English, we&apos;ll compose one from scratch.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <Link href="/quiz" style={ctaBtn(TH.surface, TH.ink)}>Take the quiz →</Link>
          <Link href="/build" style={ctaBtn("transparent", TH.surface, true)}>Describe my goals →</Link>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6, marginTop: 12, textAlign: "center" }}>
        Educational use only, not medical advice. Always consult a qualified clinician before changing your supplements, especially if you have medical conditions, take prescription medications, or are pregnant or nursing.
      </p>

      <style>{`
        :root { --audit-score-cols: 1fr auto; }
        @media (max-width: 640px) { :root { --audit-score-cols: 1fr; } }
      `}</style>
    </div>
  );
}

function ctaBtn(bg: string, color: string, outline = false): React.CSSProperties {
  return {
    padding: "11px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 500,
    background: bg, color, textDecoration: "none",
    border: outline ? `1px solid ${color}55` : "none",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
}

function kindColor(kind: AuditFinding["kind"]): string {
  if (kind === "warning") return "#dc2626";
  if (kind === "redundant") return "#d97706";
  if (kind === "missing") return "#5ba373";
  if (kind === "timing") return "#a78bfa";
  if (kind === "cost") return "#0a2540";
  return "#6b7280";
}

function FindingBadge({ kind }: { kind: AuditFinding["kind"] }) {
  const map: Record<AuditFinding["kind"], { label: string; bg: string; fg: string }> = {
    warning:   { label: "⚠", bg: "#fee2e2", fg: "#991b1b" },
    redundant: { label: "↻", bg: "#fef3c7", fg: "#92400e" },
    missing:   { label: "✚", bg: "#dcfce7", fg: "#166534" },
    timing:    { label: "◐", bg: "#ede9fe", fg: "#5b21b6" },
    cost:      { label: "$", bg: "#dbeafe", fg: "#1e40af" },
    info:      { label: "ℹ", bg: "#f3f4f6", fg: "#3c4858" },
  };
  const m = map[kind];
  return (
    <span style={{
      width: 30, height: 30, borderRadius: 999,
      background: m.bg, color: m.fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 600,
    }} aria-hidden>{m.label}</span>
  );
}

function groupFindings(findings: AuditFinding[]) {
  const order: AuditFinding["kind"][] = ["warning", "redundant", "missing", "timing", "cost", "info"];
  const labels: Record<AuditFinding["kind"], string> = {
    warning: "Safety & interactions",
    redundant: "Redundancies",
    missing: "What's missing",
    timing: "Timing & absorption",
    cost: "Cost",
    info: "Notes",
  };
  return order
    .map(kind => ({ kind, label: labels[kind], items: findings.filter(f => f.kind === kind) }))
    .filter(g => g.items.length > 0);
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke={TH.edge} strokeWidth="6" fill="none" />
        <circle
          cx="48" cy="48" r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        ...D, fontSize: 26, color: TH.ink, letterSpacing: "-0.02em",
      }}>{value}</div>
    </div>
  );
}
