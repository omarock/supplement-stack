import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/supabase-admin";
import SuppdocLogo from "@/components/SuppdocLogo";
import AdminAgents from "@/components/AdminAgents";

export const metadata: Metadata = {
  title: "Agents, suppdoc.io admin",
  robots: "noindex,nofollow",
};

const th = {
  bg: "var(--c-bg)", ink: "var(--c-ink)", inkSoft: "var(--c-ink-soft)", inkMute: "var(--c-muted)", sage: "var(--c-sage)", line: "var(--c-edge)",
};
const S = { fontFamily: '"Bricolage Grotesque", "Inter Display", system-ui, sans-serif', fontWeight: 600 } as const;
const MM = { fontFamily: '"JetBrains Mono", monospace' } as const;

async function checkAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) redirect("/signin?error=admin_not_configured");
  const cookieStore = await cookies();
  const supa = createServerClient(url, key, { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/signin?error=please_sign_in");
  if (!isAdminEmail(user.email)) redirect("/?error=not_admin");
  return user;
}

export default async function AgentsPage() {
  const user = await checkAdmin();
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.ink, fontFamily: '"Inter", system-ui, sans-serif' }}>
      <header style={{ padding: "18px 32px", borderBottom: `1px solid ${th.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SuppdocLogo size={22} />
          <span style={{ fontSize: 11, ...MM, color: th.sage, letterSpacing: "0.1em", marginLeft: 4 }}>ADMIN · AGENTS</span>
        </div>
        <Link href="/admin" style={{ fontSize: 13, color: th.inkSoft, textDecoration: "none" }}>← Back to dashboard</Link>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: th.sage, ...MM, letterSpacing: "0.1em", marginBottom: 10 }}>CONTENT ENGINE</div>
          <h1 style={{ ...S, fontSize: 48, color: th.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1 }}>Your content team.</h1>
          <p style={{ color: th.inkSoft, fontSize: 15, marginTop: 10, maxWidth: 640, lineHeight: 1.55 }}>
            Six agents find topics, write evidence-backed pages, draft social posts, build visuals, assemble your weekly email, and hunt for backlinks. They draft, you decide. Nothing reaches the public until you approve it here.
          </p>
        </div>
        <AdminAgents />
        <p style={{ marginTop: 32, fontSize: 11.5, color: th.inkMute }}>Signed in as {user.email}</p>
      </main>
    </div>
  );
}
