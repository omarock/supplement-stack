"use client";

import { useEffect, useState, useCallback } from "react";

const th = {
  bg: "#f6f5f1", paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", amber: "#b5751e", red: "#b91c1c", line: "rgba(10,37,64,0.08)",
};
const D = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

type Json = Record<string, unknown>;
interface Item {
  id: string; agent: string; kind: string; status: string; title: string | null; slug: string | null;
  priority: number; payload: Json; edited: Json | null; needs_review: boolean; created_at: string;
}
interface Run {
  id: string; agent: string; model: string | null; status: string; items_created: number;
  cost_usd: number; input_tokens: number; output_tokens: number; trigger: string; error: string | null; created_at: string;
}
interface AgentMeta { key: string; title: string; blurb: string; schedule: string; model: string }

const KIND_LABEL: Record<string, string> = {
  opportunity: "Topic opportunity", seo_draft: "Page draft", social_post: "Social posts",
  visual: "Visual assets", newsletter: "Newsletter issue", pr_target: "PR outreach",
};

function pill(bg: string, color: string): React.CSSProperties {
  return { display: "inline-block", padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg, color };
}
const btn = (bg: string, color: string, ghost = false): React.CSSProperties => ({
  padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
  border: ghost ? `1px solid ${th.line}` : "none", background: ghost ? th.paper : bg, color,
  fontFamily: '"Inter", system-ui, sans-serif',
});

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentMeta[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<Item[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/agents").then(x => x.json());
      if (r.ok) { setAgents(r.agents); setItems(r.items); setHistory(r.history ?? []); setRuns(r.runs); }
      else setFlash({ ok: false, text: r.error || "Failed to load." });
    } catch { setFlash({ ok: false, text: "Network error." }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function runNow(key: string) {
    setBusy(`run:${key}`); setFlash(null);
    try {
      const r = await fetch(`/api/agents/${key}`, { method: "POST" }).then(x => x.json());
      if (r.ok) setFlash({ ok: true, text: `${key}: ${r.itemsCreated} new item(s) (${r.status}).` });
      else setFlash({ ok: false, text: `${key} failed: ${r.error || r.status}` });
      await load();
    } catch { setFlash({ ok: false, text: "Run failed (network)." }); }
    finally { setBusy(null); }
  }

  async function act(action: string, item: Item, extra: Json = {}) {
    setBusy(`${action}:${item.id}`); setFlash(null);
    try {
      const r = await fetch("/api/admin/agents", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, id: item.id, ...extra }),
      }).then(x => x.json());
      if (r.ok) {
        if (action !== "newsletter_send" || extra.mode === "all") setItems(prev => prev.filter(i => i.id !== item.id));
        if (r.published) setFlash({ ok: true, text: `Published live at /library/${r.slug}` });
        else if (action === "newsletter_send") setFlash({ ok: true, text: extra.mode === "all" ? `Sent to ${r.sent} subscribers.` : `Test sent (${r.sent}).` });
        else setFlash({ ok: true, text: `Done: ${action}.` });
      } else setFlash({ ok: false, text: r.error || "Action failed." });
    } catch { setFlash({ ok: false, text: "Network error." }); }
    finally { setBusy(null); }
  }

  const byAgent = (key: string) => items.filter(i => i.agent === key);
  const lastRun = (key: string) => runs.find(r => r.agent === key);
  const totalSpend = runs.reduce((s, r) => s + Number(r.cost_usd || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {flash && (
        <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          background: flash.ok ? "#f0f9f3" : "#fef2f2", color: flash.ok ? th.sageDeep : th.red }}>
          {flash.ok ? "✓ " : "✗ "}{flash.text}
        </div>
      )}

      {/* Run-now panel */}
      <section>
        <h2 style={{ ...D, fontSize: 22, margin: "0 0 4px" }}>The six agents</h2>
        <p style={{ fontSize: 13, color: th.inkMute, margin: "0 0 14px" }}>
          Automatic schedules are off, so nothing spends on its own. The free way to feed these is the Import box below (content generated in your Claude Code chat). &ldquo;Run now&rdquo; still works if you ever want the website to generate something itself, it uses your API key and costs a few cents per run.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {agents.map(a => {
            const lr = lastRun(a.key);
            return (
              <div key={a.key} style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ ...D, fontSize: 16, color: th.ink }}>{a.title}</div>
                  <span style={pill(th.sageDeep === a.model ? "#eee" : "#f0f9f3", th.sageDeep)}>{a.model}</span>
                </div>
                <p style={{ fontSize: 12.5, color: th.inkSoft, margin: "8px 0 10px", lineHeight: 1.45 }}>{a.blurb}</p>
                <div style={{ fontSize: 11, color: th.inkMute, ...MM, marginBottom: 12 }}>
                  {a.schedule}{lr ? ` · last: ${lr.status}, ${lr.items_created} item(s)` : " · not run yet"}
                </div>
                <button disabled={busy === `run:${a.key}`} onClick={() => runNow(a.key)} style={{ ...btn(th.ink, "#fff"), opacity: busy === `run:${a.key}` ? 0.6 : 1 }}>
                  {busy === `run:${a.key}` ? "Running…" : "Run now"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Import from Claude Code (zero API cost) */}
      <ImportBox onDone={load} setFlash={setFlash} />

      {/* Queue */}
      <section>
        <h2 style={{ ...D, fontSize: 22, margin: "0 0 4px" }}>Approval inbox {items.length > 0 && <span style={{ color: th.sage }}>({items.length})</span>}</h2>
        {loading ? (
          <p style={{ color: th.inkMute, fontSize: 13 }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: th.inkMute, fontSize: 13 }}>Nothing waiting. Run an agent above to fill the inbox.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(item => <ItemCard key={item.id} item={item} busy={busy} act={act} />)}
          </div>
        )}
      </section>

      {/* Published & approved */}
      <HistorySection history={history} />

      {/* Run log */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ ...D, fontSize: 22, margin: "0 0 12px" }}>Recent runs</h2>
          <div style={{ fontSize: 12.5, color: th.inkSoft }}>Last 20 runs cost <strong style={{ color: th.ink }}>${totalSpend.toFixed(2)}</strong></div>
        </div>
        {runs.length === 0 ? (
          <p style={{ color: th.inkMute, fontSize: 13 }}>No runs yet.</p>
        ) : (
          <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ borderBottom: `1px solid ${th.line}` }}>
                {["WHEN", "AGENT", "STATUS", "ITEMS", "COST", "TRIGGER"].map(h =>
                  <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontWeight: 500, color: th.inkMute, ...MM, fontSize: 10, letterSpacing: "0.08em" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${th.line}` }}>
                    <td style={{ padding: "9px 12px", color: th.inkSoft, ...MM }}>{new Date(r.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ padding: "9px 12px", color: th.ink }}>{r.agent}</td>
                    <td style={{ padding: "9px 12px", color: r.status === "error" ? th.red : r.status === "ok" ? th.sageDeep : th.inkMute }}>{r.status}{r.error ? ` (${r.error.slice(0, 40)})` : ""}</td>
                    <td style={{ padding: "9px 12px", color: th.ink }}>{r.items_created}</td>
                    <td style={{ padding: "9px 12px", color: th.inkSoft, ...MM }}>${Number(r.cost_usd || 0).toFixed(3)}</td>
                    <td style={{ padding: "9px 12px", color: th.inkMute }}>{r.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── One queue item, rendered by kind ───────────────────────────────────────
function ItemCard({ item, busy, act }: { item: Item; busy: string | null; act: (a: string, i: Item, e?: Json) => void }) {
  const p = (item.edited ?? item.payload) as Json;
  const str = (k: string) => (p[k] == null ? "" : String(p[k]));
  const isBusy = (a: string) => busy === `${a}:${item.id}`;

  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={pill("#eef1f5", th.ink)}>{KIND_LABEL[item.kind] ?? item.kind}</span>
          {item.priority > 0 && <span style={pill("#f0f9f3", th.sageDeep)}>score {item.priority}</span>}
          {item.needs_review && <span style={pill("#fffbeb", th.amber)}>needs clinical review</span>}
        </div>
        <span style={{ fontSize: 11, color: th.inkMute, ...MM }}>{new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
      </div>

      <div style={{ ...D, fontSize: 16, color: th.ink, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</div>

      {/* kind-specific body */}
      {item.kind === "opportunity" && <OpportunityBody p={p} str={str} />}
      {item.kind === "seo_draft" && <SeoBody item={item} p={p} str={str} />}
      {item.kind === "social_post" && <SocialBody p={p} />}
      {item.kind === "pr_target" && <PrBody str={str} />}
      {item.kind === "visual" && <VisualBody p={p} />}
      {item.kind === "newsletter" && <NewsletterBody item={item} p={p} busy={busy} act={act} />}

      {/* generic actions (newsletter has its own send controls) */}
      {item.kind !== "newsletter" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${th.line}` }}>
          <button disabled={isBusy("approve")} onClick={() => act("approve", item)} style={btn(th.sage, "#fff")}>
            {item.kind === "seo_draft" ? (isBusy("approve") ? "Publishing…" : "Approve & publish") :
             item.kind === "opportunity" ? "Approve (write it)" : "Approve"}
          </button>
          <button disabled={isBusy("reject")} onClick={() => act("reject", item)} style={btn("", th.red, true)}>Reject</button>
          <button disabled={isBusy("park")} onClick={() => act("park", item)} style={btn("", th.inkMute, true)}>Park</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, ...MM, color: th.inkMute, letterSpacing: "0.06em" }}>{label}: </span>
      <span style={{ fontSize: 13, color: th.inkSoft }}>{children}</span>
    </div>
  );
}

function OpportunityBody({ p, str }: { p: Json; str: (k: string) => string }) {
  const links = (p.internal_link_targets as string[]) ?? [];
  return (
    <div>
      <Field label="query">{str("query")}</Field>
      <Field label="why now">{str("search_demand_proxy")}</Field>
      <Field label="page type">{str("target_page_type")} · {str("coverage_gap")}</Field>
      {links.length > 0 && <Field label="interlink">{links.slice(0, 5).join(", ")}</Field>}
      {!!p.angle && <Field label="social angle">{str("angle")}</Field>}
    </div>
  );
}

function SeoBody({ item, p, str }: { item: Item; p: Json; str: (k: string) => string }) {
  const cites = (p.external_citations as Json[]) ?? [];
  return (
    <div>
      <Field label="will publish at">/library/{item.slug}</Field>
      <Field label="meta">{str("meta_description")}</Field>
      <Field label="words">{str("word_count")} · grade {str("reading_grade")} · CTA {str("tool_embed")}</Field>
      {cites.length > 0 && <Field label="citations">{cites.length} source(s)</Field>}
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontSize: 12.5, color: th.sage, cursor: "pointer", fontWeight: 600 }}>Preview body</summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12.5, color: th.inkSoft, lineHeight: 1.55, marginTop: 8, maxHeight: 320, overflow: "auto", background: th.bg, padding: 12, borderRadius: 8 }}>
          {str("body_md")}
        </pre>
      </details>
    </div>
  );
}

function SocialBody({ p }: { p: Json }) {
  const variants = (p.variants as Json[]) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {variants.map((v, i) => (
        <div key={i} style={{ background: th.bg, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, ...MM, color: th.sage, marginBottom: 4 }}>{String(v.platform ?? "post").toUpperCase()}</div>
          {!!v.hook && <div style={{ fontSize: 13, color: th.ink, fontWeight: 600, marginBottom: 4 }}>{String(v.hook)}</div>}
          <div style={{ fontSize: 12.5, color: th.inkSoft, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{String(v.body ?? "")}</div>
          {!!v.cta_url && <div style={{ fontSize: 12, color: th.sageDeep, marginTop: 4 }}>{String(v.cta_url)}</div>}
          <CopyBtn text={`${v.hook ? v.hook + "\n\n" : ""}${v.body ?? ""}${v.cta_url ? "\n\n" + v.cta_url : ""}`} />
        </div>
      ))}
    </div>
  );
}

function PrBody({ str }: { str: (k: string) => string }) {
  return (
    <div>
      <Field label="outlet">{str("outlet")} ({str("target_type")})</Field>
      <Field label="contact">{str("contact_hint")}</Field>
      <Field label="asset to offer">{str("suggested_asset")}</Field>
      <div style={{ background: th.bg, borderRadius: 8, padding: 10, marginTop: 6 }}>
        <div style={{ fontSize: 13, color: th.ink, fontWeight: 600, marginBottom: 4 }}>Subject: {str("pitch_subject")}</div>
        <div style={{ fontSize: 12.5, color: th.inkSoft, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{str("pitch_body")}</div>
        <div style={{ fontSize: 12, color: th.inkMute, marginTop: 6, fontStyle: "italic" }}>Follow-up: {str("follow_up_line")}</div>
        <CopyBtn text={`Subject: ${str("pitch_subject")}\n\n${str("pitch_body")}`} />
      </div>
    </div>
  );
}

function VisualBody({ p }: { p: Json }) {
  const assets = (p.assets as Json[]) ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {assets.map((a, i) => (
        <div key={i} style={{ background: th.bg, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, ...MM, color: th.sage, marginBottom: 6 }}>{String(a.asset_type ?? "asset").toUpperCase()} · {String(a.dimensions ?? "")}</div>
          {typeof a.svg === "string" && (a.svg as string).trim().startsWith("<svg") ? (
            <div style={{ maxWidth: 360, border: `1px solid ${th.line}`, borderRadius: 6, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: a.svg as string }} />
          ) : <div style={{ fontSize: 12, color: th.inkMute }}>(no inline SVG)</div>}
          <div style={{ fontSize: 11.5, color: th.inkMute, marginTop: 6 }}>alt: {String(a.alt_text ?? "")}</div>
        </div>
      ))}
    </div>
  );
}

function NewsletterBody({ item, p, busy, act }: { item: Item; p: Json; busy: string | null; act: (a: string, i: Item, e?: Json) => void }) {
  const subjects = (p.subject_line_options as string[]) ?? [item.title ?? ""];
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [text, setText] = useState(String(p.body_text ?? ""));
  const [confirm, setConfirm] = useState(false);
  const isBusy = (a: string, mode?: string) => busy === `${a}:${item.id}` && (!mode || true);

  return (
    <div>
      {!!p.preheader && <Field label="preheader">{String(p.preheader)}</Field>}
      <div style={{ margin: "8px 0 6px", fontSize: 11, ...MM, color: th.inkMute }}>SUBJECT (pick one or edit)</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {subjects.map((s, i) => (
          <button key={i} onClick={() => setSubject(s)} style={{ ...btn(subject === s ? th.ink : "", subject === s ? "#fff" : th.inkSoft, subject !== s), fontSize: 12 }}>{s}</button>
        ))}
      </div>
      <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${th.line}`, fontSize: 14, boxSizing: "border-box", marginBottom: 8 }} />
      <textarea value={text} onChange={e => setText(e.target.value)} rows={10} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${th.line}`, fontSize: 13, lineHeight: 1.55, boxSizing: "border-box", resize: "vertical", fontFamily: '"Inter", system-ui, sans-serif' }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10, paddingTop: 12, borderTop: `1px solid ${th.line}` }}>
        <button disabled={!!busy} onClick={() => act("newsletter_send", item, { mode: "test", subject, text })} style={btn("", th.ink, true)}>Send test to me</button>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: th.inkSoft, cursor: "pointer" }}>
          <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} /> I sent a test, ready to email everyone
        </label>
        <button disabled={!!busy || !confirm} onClick={() => act("newsletter_send", item, { mode: "all", subject, text })}
          style={{ ...btn(confirm ? th.sage : "#e5e7eb", confirm ? "#fff" : th.inkMute), marginLeft: "auto" }}>
          {isBusy("newsletter_send") ? "Sending…" : "Send to all"}
        </button>
        <button disabled={!!busy} onClick={() => act("reject", item)} style={btn("", th.red, true)}>Discard</button>
      </div>
    </div>
  );
}

function ImportBox({ onDone, setFlash }: { onDone: () => void; setFlash: (f: { ok: boolean; text: string } | null) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function importItems() {
    setBusy(true); setFlash(null);
    let items: unknown;
    try { items = JSON.parse(text.trim()); }
    catch { setFlash({ ok: false, text: "That is not valid JSON. Paste the whole block I gave you, including the [ and ]." }); setBusy(false); return; }
    if (!Array.isArray(items)) items = [items];
    try {
      const r = await fetch("/api/admin/agents", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "import", items }),
      }).then(x => x.json());
      if (r.ok) { setFlash({ ok: true, text: `Imported ${r.imported} item(s) into your inbox.` }); setText(""); setOpen(false); onDone(); }
      else setFlash({ ok: false, text: r.error || "Import failed." });
    } catch { setFlash({ ok: false, text: "Network error." }); }
    finally { setBusy(false); }
  }

  return (
    <section style={{ background: th.paper, border: `1px dashed ${th.sage}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ ...D, fontSize: 16, color: th.ink }}>Import from chat (free, no API cost)</div>
          <div style={{ fontSize: 12.5, color: th.inkMute, marginTop: 2 }}>Paste the content block from your Claude Code chat here. It lands in the inbox below, exactly like an agent run, but costs nothing.</div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={btn("", th.sageDeep, true)}>{open ? "Close" : "Open"}</button>
      </div>
      {open && (
        <div style={{ marginTop: 12 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder='Paste the JSON block here, e.g. [ { "kind": "seo_draft", ... } ]'
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${th.line}`, fontSize: 12.5, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.5, boxSizing: "border-box", resize: "vertical" }} />
          <button disabled={busy || !text.trim()} onClick={importItems} style={{ ...btn(th.sage, "#fff"), marginTop: 8, opacity: busy || !text.trim() ? 0.6 : 1 }}>
            {busy ? "Importing…" : "Import to inbox"}
          </button>
        </div>
      )}
    </section>
  );
}

function HistorySection({ history }: { history: Item[] }) {
  const live = history.filter(i => i.kind === "seo_draft" && i.status === "published");
  const ideas = history.filter(i => i.kind === "opportunity" && i.status === "approved");
  const ready = history.filter(i => ["social_post", "pr_target", "visual"].includes(i.kind) && i.status === "approved");
  const sent = history.filter(i => i.kind === "newsletter" && i.status === "sent");

  const READY_LABEL: Record<string, string> = { social_post: "Posts ready to publish", pr_target: "Outreach ready to send", visual: "Visuals approved" };

  return (
    <section>
      <h2 style={{ ...D, fontSize: 22, margin: "0 0 4px" }}>Published &amp; approved</h2>
      <p style={{ fontSize: 13, color: th.inkMute, margin: "0 0 14px" }}>
        Everything you have signed off. Approved ideas wait here until the SEO and Social agents pick them up on their next run.
      </p>
      {history.length === 0 ? (
        <p style={{ color: th.inkMute, fontSize: 13 }}>Nothing approved yet. Approve items in the inbox above and they will show up here.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {live.length > 0 && (
            <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ ...D, fontSize: 15, color: th.ink, marginBottom: 4 }}>Live on your site <span style={{ color: th.sage }}>({live.length})</span></div>
              <div style={{ fontSize: 12, color: th.inkMute, marginBottom: 10 }}>Real, indexable pages. Click to open them.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {live.map(i => (
                  <a key={i.id} href={`https://www.suppdoc.io/library/${i.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", justifyContent: "space-between", gap: 10, textDecoration: "none", padding: "8px 10px", borderRadius: 8, background: th.bg }}>
                    <span style={{ fontSize: 13.5, color: th.ink, fontWeight: 600 }}>{i.title}</span>
                    <span style={{ fontSize: 12, color: th.sageDeep, whiteSpace: "nowrap" }}>/library/{i.slug} ↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {ideas.length > 0 && (
            <HistoryGroup title="Approved ideas, waiting for the writers" sub="The SEO and Social agents turn these into pages and posts on their next run." items={ideas} color={th.amber} />
          )}
          {ready.length > 0 && (
            <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 16 }}>
              <div style={{ ...D, fontSize: 15, color: th.ink, marginBottom: 10 }}>Approved, ready for you <span style={{ color: th.sage }}>({ready.length})</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ready.map(i => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 8, background: th.bg }}>
                    <span style={{ fontSize: 13, color: th.ink }}>{i.title}</span>
                    <span style={{ fontSize: 11, color: th.inkMute, whiteSpace: "nowrap" }}>{READY_LABEL[i.kind] ?? i.kind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sent.length > 0 && (
            <HistoryGroup title="Newsletters sent" sub="Issues emailed to your list." items={sent} color={th.sageDeep} />
          )}
        </div>
      )}
    </section>
  );
}

function HistoryGroup({ title, sub, items, color }: { title: string; sub: string; items: Item[]; color: string }) {
  return (
    <div style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ ...D, fontSize: 15, color: th.ink, marginBottom: 4 }}>{title} <span style={{ color }}>({items.length})</span></div>
      <div style={{ fontSize: 12, color: th.inkMute, marginBottom: 10 }}>{sub}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(i => (
          <div key={i.id} style={{ fontSize: 13, color: th.inkSoft, padding: "7px 10px", borderRadius: 8, background: th.bg }}>{i.title}</div>
        ))}
      </div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}
      style={{ ...btn("", th.sageDeep, true), fontSize: 11.5, padding: "5px 11px", marginTop: 8 }}>
      {done ? "Copied ✓" : "Copy"}
    </button>
  );
}
