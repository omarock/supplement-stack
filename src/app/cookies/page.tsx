import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — suppdoc.io",
  description: "suppdoc.io uses minimal essential storage to remember your quiz progress. We don't use advertising or tracking cookies. Full details inside.",
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Cookie Policy" lastUpdated="May 2026">
      <p>
        suppdoc.io uses minimal browser storage to make the site work properly. We do <strong>not</strong> use advertising, cross-site tracking, or third-party marketing cookies.
      </p>

      <h2>What We Store</h2>
      <p>
        We use the browser&apos;s <strong>localStorage</strong> to remember:
      </p>
      <ul>
        <li><strong>phylaQuizDraft</strong> — Your in-progress quiz answers, so you can return and continue.</li>
        <li><strong>phylaQuizData</strong> — Your completed quiz answers, so the results page can show your personalised stack.</li>
      </ul>
      <p>
        That&apos;s it. No tracking IDs, no advertising data, no third-party scripts injected.
      </p>

      <h2>How to Clear It</h2>
      <p>
        Open your browser&apos;s developer tools (F12 in most browsers), go to Console, and run:
      </p>
      <p>
        <code style={{ background: "rgba(28,29,24,0.05)", padding: "4px 8px", borderRadius: 6, fontSize: 13 }}>localStorage.clear()</code>
      </p>
      <p>
        Or use your browser&apos;s &quot;Clear site data&quot; setting for suppdoc.io.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        When you click an iHerb link, you leave our site and iHerb&apos;s own cookie/privacy policy applies. We have no control over iHerb&apos;s cookies.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use privacy-respecting analytics (e.g. Plausible, Fathom, or similar) that count visits without tracking individuals. If we use these, they do not store personally identifying cookies on your device.
      </p>

      <h2>Contact</h2>
      <p>
        Cookie questions: <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
