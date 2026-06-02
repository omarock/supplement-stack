"use client";

import { useState, useEffect } from "react";

const th = {
  paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", amber: "#b5751e", line: "rgba(10,37,64,0.08)",
};
const D = { fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600 } as const;

/** Compose + send a newsletter to the email_signups list (minus unsubscribes). */
export default function AdminNewsletter() {
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter").then(r => r.json()).then(b => {
      if (b.ok) { setCount(b.count); if (b.adminEmail) setTestEmail(b.adminEmail); }
    }).catch(() => {});
  }, []);

  async function send(mode: "test" | "all") {
    if (!subject.trim() || !bodyText.trim()) { setMsg({ ok: false, text: "Add a subject and body first." }); return; }
    if (mode === "all" && !confirmAll) { setMsg({ ok: false, text: "Tick the confirm box before sending to everyone." }); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, body: bodyText, mode, testEmail }),
      });
      const b = await res.json();
      if (b.ok) {
        setMsg({ ok: true, text: mode === "test" ? `Test sent to ${testEmail}. Check your inbox.` : `Sent to ${b.sent} subscribers${b.failed ? `, ${b.failed} failed` : ""}.` });
        if (mode === "all") setConfirmAll(false);
      } else setMsg({ ok: false, text: b.error || "Send failed." });
    } catch { setMsg({ ok: false, text: "Network error." }); }
    finally { setBusy(false); }
  }

  const input: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${th.line}`,
    fontSize: 15, fontFamily: '"Inter", system-ui, sans-serif', color: th.ink, boxSizing: "border-box",
  };

  return (
    <section style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <div style={{ ...D, fontSize: 18, color: th.ink }}>Newsletter</div>
        <div style={{ fontSize: 12.5, color: th.inkMute }}>
          {count === null ? "loading subscribers…" : <><strong style={{ color: th.ink }}>{count}</strong> subscribers</>}
        </div>
      </div>
      <p style={{ fontSize: 13, color: th.inkMute, margin: "0 0 14px", lineHeight: 1.5 }}>
        Write in plain text (a blank line starts a new paragraph; links auto-link). Always send a test to yourself first. Unsubscribes are handled automatically.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line" style={input} />
        <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder={"Write your email here.\n\nA blank line starts a new paragraph.\n\nPaste links like https://www.suppdoc.io/interactions and they become clickable."} rows={9} style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" style={{ ...input, flex: "1 1 220px", minWidth: 180 }} />
          <button onClick={() => send("test")} disabled={busy} style={{
            padding: "11px 18px", borderRadius: 999, border: `1px solid ${th.line}`, cursor: busy ? "wait" : "pointer",
            background: th.paper, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 600, fontSize: 14,
          }}>Send test to me</button>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 4, paddingTop: 14, borderTop: `1px solid ${th.line}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: th.inkSoft, cursor: "pointer" }}>
            <input type="checkbox" checked={confirmAll} onChange={e => setConfirmAll(e.target.checked)} />
            I&apos;ve sent a test and I&apos;m ready to email all {count ?? "…"} subscribers
          </label>
          <button onClick={() => send("all")} disabled={busy || !confirmAll} style={{
            padding: "11px 20px", borderRadius: 999, border: "none", cursor: busy || !confirmAll ? "not-allowed" : "pointer",
            background: confirmAll ? `linear-gradient(180deg, ${th.sage}, ${th.sageDeep})` : "#e5e7eb",
            color: confirmAll ? "#fff" : th.inkMute, ...D, fontSize: 14, marginLeft: "auto",
          }}>{busy ? "Sending…" : "Send to all subscribers"}</button>
        </div>
      </div>

      {msg && <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600, color: msg.ok ? th.sageDeep : "#b91c1c" }}>{msg.ok ? "✓ " : "✗ "}{msg.text}</div>}
    </section>
  );
}
