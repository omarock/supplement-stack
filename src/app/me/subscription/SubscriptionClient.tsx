"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TH, FONTS } from "@/lib/theme";

const D = { fontFamily: FONTS.display, fontWeight: 600 } as const;
const MM = { fontFamily: FONTS.mono } as const;

export interface SubView {
  status: string | null;
  plan: string | null;                 // monthly | annual
  currentPeriodEnd: string | null;
  nextBilledAt: string | null;
  cancelScheduled: boolean;
  cancelEffectiveAt: string | null;
  priceLabel: string;
  intervalLabel: string;
}

export interface BillingRow {
  id: string;
  date: string | null;
  amount: string;
  status: string;
  invoice: string | null;
}

type Action = "cancel" | "reactivate" | "change-plan" | "portal";

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function statusTone(status: string | null): { bg: string; fg: string; label: string } {
  switch (status) {
    case "active": return { bg: "#e7f4ec", fg: TH.sageDeep, label: "Active" };
    case "trialing": return { bg: "#eef2ff", fg: "#4f46e5", label: "Trialing" };
    case "past_due": return { bg: "#fef2f2", fg: "#b91c1c", label: "Past due" };
    case "paused": return { bg: "#fff7ed", fg: TH.amberDeep, label: "Paused" };
    case "canceled": return { bg: "#f3f4f6", fg: TH.muted, label: "Canceled" };
    default: return { bg: "#f3f4f6", fg: TH.muted, label: status ?? "Unknown" };
  }
}

export default function SubscriptionClient({ initial, billing }: {
  initial: SubView; billing: BillingRow[]; email: string;
}) {
  const router = useRouter();
  const [sub, setSub] = useState<SubView>(initial);
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const planLabel = sub.plan === "annual" ? "Premium · Annual" : sub.plan === "monthly" ? "Premium · Monthly" : "Premium";
  const otherPlan = sub.plan === "annual" ? "monthly" : "annual";
  const otherPlanLabel = otherPlan === "annual" ? "annual ($79/yr)" : "monthly ($9/mo)";
  const tone = statusTone(sub.status);

  async function run(action: Action, plan?: "monthly" | "annual") {
    setBusy(action); setError(null); setNotice(null);
    try {
      const res = await fetch("/api/paddle/manage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ...(plan ? { plan } : {}) }),
      });
      const body = await res.json();
      if (!body.ok) { setError(body.error ?? "Something went wrong. Please try again."); return; }

      if (action === "portal" && body.url) { window.location.href = body.url; return; }

      if (body.subscription) {
        setSub(s => ({
          ...s,
          status: body.subscription.status ?? s.status,
          plan: body.subscription.plan ?? s.plan,
          currentPeriodEnd: body.subscription.current_period_end ?? s.currentPeriodEnd,
          cancelScheduled: Boolean(body.subscription.cancel_at_period_end),
          cancelEffectiveAt: body.subscription.cancel_at_period_end
            ? (body.subscription.current_period_end ?? s.cancelEffectiveAt)
            : null,
        }));
      }
      if (action === "cancel") setNotice("Your subscription is set to cancel at the end of the current period. You keep full access until then.");
      if (action === "reactivate") setNotice("Welcome back, your subscription will continue as normal. No further action needed.");
      if (action === "change-plan") setNotice(`You're now on the ${plan} plan. The change is prorated automatically.`);
      setConfirmingCancel(false);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Plan card */}
      <div style={{
        background: `linear-gradient(135deg, ${TH.sage}12, ${TH.surface} 65%)`,
        border: `1.5px solid ${TH.sage}55`, borderRadius: 18, padding: "24px 26px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ ...D, fontSize: 22, color: TH.ink }}>{planLabel}</span>
          <span style={{ ...MM, fontSize: 11, fontWeight: 700, color: tone.fg, background: tone.bg, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.04em" }}>
            {tone.label.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 4 }}>
          <Field label="Price" value={`${sub.priceLabel} ${sub.intervalLabel}`.trim()} />
          <Field
            label={sub.cancelScheduled ? "Access ends" : "Renews on"}
            value={fmtDate(sub.cancelScheduled ? sub.cancelEffectiveAt ?? sub.currentPeriodEnd : sub.nextBilledAt ?? sub.currentPeriodEnd)}
          />
          <Field label="Billing status" value={tone.label} />
        </div>

        {sub.cancelScheduled && (
          <div role="status" style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 12,
            background: "#fff7ed", border: "1px solid #f5d3a8", fontSize: 13.5, color: TH.amberDeep, lineHeight: 1.5,
          }}>
            Your plan is scheduled to cancel on <strong>{fmtDate(sub.cancelEffectiveAt ?? sub.currentPeriodEnd)}</strong>. You keep full Premium access until then, change your mind anytime below.
          </div>
        )}
      </div>

      {/* Notices */}
      {notice && (
        <div role="status" style={{ padding: "12px 16px", borderRadius: 12, background: "#e7f4ec", border: `1px solid ${TH.sage}55`, fontSize: 13.5, color: TH.sageDeep, lineHeight: 1.5 }}>
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" style={{ padding: "12px 16px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13.5, color: "#b91c1c", lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px" }}>
        <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 4 }}>Manage your plan</div>
        <p style={{ fontSize: 13, color: TH.muted, margin: "0 0 16px" }}>
          Everything here is self-service, no need to contact support.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Switch plan */}
          <ActionRow
            title={`Switch to ${otherPlan} billing`}
            desc={otherPlan === "annual" ? "Save ~27% by paying yearly. Prorated automatically." : "Move to month-to-month billing. Prorated automatically."}
            button={`Switch to ${otherPlanLabel}`}
            onClick={() => run("change-plan", otherPlan)}
            loading={busy === "change-plan"}
            disabled={busy !== null}
          />

          {/* Reactivate or Cancel */}
          {sub.cancelScheduled ? (
            <ActionRow
              title="Keep my subscription"
              desc="Remove the scheduled cancellation and continue on Premium."
              button="Reactivate subscription"
              variant="primary"
              onClick={() => run("reactivate")}
              loading={busy === "reactivate"}
              disabled={busy !== null}
            />
          ) : confirmingCancel ? (
            <div style={{ border: "1px solid #fecaca", borderRadius: 14, padding: "16px 18px", background: "#fffbfb" }}>
              <div style={{ ...D, fontSize: 14.5, color: TH.ink, marginBottom: 4 }}>Cancel Premium?</div>
              <p style={{ fontSize: 13, color: TH.inkSoft, margin: "0 0 14px", lineHeight: 1.5 }}>
                You&apos;ll keep full access until <strong>{fmtDate(sub.currentPeriodEnd)}</strong>, then drop to the Free plan. You can reactivate anytime before then.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => run("cancel")} disabled={busy !== null} style={dangerBtn(busy === "cancel")}>
                  {busy === "cancel" ? "Cancelling…" : "Yes, cancel at period end"}
                </button>
                <button onClick={() => setConfirmingCancel(false)} disabled={busy !== null} style={ghostBtn()}>
                  Keep my plan
                </button>
              </div>
            </div>
          ) : (
            <ActionRow
              title="Cancel subscription"
              desc="Cancels at the end of your current billing period. No early cut-off."
              button="Cancel subscription"
              variant="danger"
              onClick={() => setConfirmingCancel(true)}
              loading={false}
              disabled={busy !== null}
            />
          )}

          {/* Hosted portal */}
          <ActionRow
            title="Payment method & invoices"
            desc="Update your card or download official invoices in Paddle's secure portal."
            button="Open billing portal"
            onClick={() => run("portal")}
            loading={busy === "portal"}
            disabled={busy !== null}
          />
        </div>
      </div>

      {/* Billing history */}
      <div style={{ background: TH.surface, border: `1px solid ${TH.edge}`, borderRadius: 18, padding: "22px 24px" }}>
        <div style={{ ...D, fontSize: 16, color: TH.ink, marginBottom: 14 }}>Billing history</div>
        {billing.length === 0 ? (
          <p style={{ fontSize: 13.5, color: TH.muted, margin: 0 }}>No charges yet. Your invoices will appear here after your first payment.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Recent payments on your subscription
              </caption>
              <thead>
                <tr>
                  <Th>Date</Th><Th>Amount</Th><Th>Status</Th><Th>Invoice</Th>
                </tr>
              </thead>
              <tbody>
                {billing.map(b => (
                  <tr key={b.id} style={{ borderTop: `1px solid ${TH.edge}` }}>
                    <Td>{fmtDate(b.date)}</Td>
                    <Td>{b.amount}</Td>
                    <Td><span style={{ ...MM, fontSize: 11, color: statusTone(b.status).fg }}>{b.status}</span></Td>
                    <Td>{b.invoice ? `#${b.invoice}` : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: TH.muted, textAlign: "center", margin: "4px 0 0", lineHeight: 1.6 }}>
        Payments are processed by Paddle, our Merchant of Record. Questions? Email{" "}
        <a href="mailto:hello@suppdoc.io" style={{ color: TH.sageDeep }}>hello@suppdoc.io</a>.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: TH.ink, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ActionRow({ title, desc, button, onClick, loading, disabled, variant }: {
  title: string; desc: string; button: string; onClick: () => void;
  loading: boolean; disabled: boolean; variant?: "primary" | "danger";
}) {
  const style = variant === "danger" ? dangerBtn(loading) : variant === "primary" ? primaryBtn(loading) : neutralBtn(loading);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
      padding: "14px 0", borderTop: `1px solid ${TH.edge}`,
    }}>
      <div style={{ flex: "1 1 240px", minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: TH.ink, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: TH.muted, lineHeight: 1.45 }}>{desc}</div>
      </div>
      <button onClick={onClick} disabled={disabled} style={style}>{loading ? "Working…" : button}</button>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" style={{ textAlign: "left", padding: "8px 12px 8px 0", ...MM, fontSize: 10.5, color: TH.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 12px 10px 0", color: TH.ink }}>{children}</td>;
}

function baseBtn(loading: boolean): React.CSSProperties {
  return {
    padding: "10px 18px", borderRadius: 999, border: "none", cursor: loading ? "wait" : "pointer",
    fontFamily: FONTS.display, fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap",
    opacity: loading ? 0.7 : 1, transition: "opacity .15s",
  };
}
function primaryBtn(loading: boolean): React.CSSProperties {
  return { ...baseBtn(loading), background: `linear-gradient(180deg, ${TH.sage}, ${TH.sageDeep})`, color: "#fff" };
}
function neutralBtn(loading: boolean): React.CSSProperties {
  return { ...baseBtn(loading), background: TH.surface, color: TH.ink, border: `1px solid ${TH.edgeStrong}` };
}
function dangerBtn(loading: boolean): React.CSSProperties {
  return { ...baseBtn(loading), background: "#fff", color: "#b91c1c", border: "1px solid #fecaca" };
}
function ghostBtn(): React.CSSProperties {
  return { ...baseBtn(false), background: "transparent", color: TH.inkSoft };
}
