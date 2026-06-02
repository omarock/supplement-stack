"use client";

import { useState } from "react";

const th = {
  paper: "#ffffff", ink: "#0a2540", inkSoft: "#3c4858", inkMute: "#6b7280",
  sage: "#5ba373", sageDeep: "#3f7a52", line: "rgba(10,37,64,0.08)",
};

/**
 * Admin tool: grant a founding member lifetime Premium after they pay their
 * one-time Payoneer invoice. Posts to /api/admin/grant-premium (admin-gated).
 */
export default function AdminGrantPremium() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(revoke: boolean) {
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) { setMsg({ ok: false, text: "Enter a valid email." }); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/grant-premium", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: e, revoke }),
      });
      const b = await res.json();
      if (b.ok) {
        setMsg({ ok: true, text: revoke ? `Premium revoked for ${b.email}` : `Lifetime Premium granted to ${b.email}` });
        if (!revoke) setEmail("");
      } else {
        setMsg({ ok: false, text: b.error || "Failed." });
      }
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ background: th.paper, border: `1px solid ${th.line}`, borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
      <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: th.ink, marginBottom: 4 }}>
        Founding members, grant Premium
      </div>
      <p style={{ fontSize: 13, color: th.inkMute, margin: "0 0 14px", lineHeight: 1.5 }}>
        After a founding member pays their one-time Payoneer invoice, enter their email to switch on lifetime Premium. Find interested emails in the Email signups export (source <strong>founding-member</strong>).
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="customer@email.com"
          onKeyDown={e => { if (e.key === "Enter") submit(false); }}
          style={{
            flex: "1 1 260px", minWidth: 220, padding: "11px 14px", borderRadius: 10,
            border: `1px solid ${th.line}`, fontSize: 15, fontFamily: '"Inter", system-ui, sans-serif', color: th.ink,
          }}
        />
        <button onClick={() => submit(false)} disabled={busy} style={{
          padding: "11px 18px", borderRadius: 999, border: "none", cursor: busy ? "wait" : "pointer",
          background: `linear-gradient(180deg, ${th.sage}, ${th.sageDeep})`, color: "#fff",
          fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 14,
        }}>
          {busy ? "Working…" : "Grant lifetime Premium"}
        </button>
        <button onClick={() => submit(true)} disabled={busy} title="Revoke access" style={{
          padding: "11px 16px", borderRadius: 999, border: `1px solid ${th.line}`, cursor: busy ? "wait" : "pointer",
          background: "transparent", color: th.inkMute, fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 500, fontSize: 13,
        }}>
          Revoke
        </button>
      </div>
      {msg && (
        <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600, color: msg.ok ? th.sageDeep : "#b91c1c" }}>
          {msg.ok ? "✓ " : "✗ "}{msg.text}
        </div>
      )}
    </section>
  );
}
