import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — suppdoc.io",
  description: "suppdoc.io's privacy policy. We store quiz answers locally in your browser and never sell personal data. Read the full details.",
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated="May 2026">
      <p>
        Your privacy matters to us. This policy explains what data we collect, how we use it, and the controls you have.
      </p>

      <h2>1. What We Collect</h2>
      <p>
        <strong>Quiz responses.</strong> Your answers to our quiz (age, gender, goals, lifestyle, diet, etc.) are stored in your browser&apos;s localStorage. They never leave your device unless you choose to share them.
      </p>
      <p>
        <strong>Contact form data.</strong> If you email us, we store your email address and message to reply. We do not use this for marketing.
      </p>
      <p>
        <strong>Analytics.</strong> We use privacy-respecting analytics (page views, anonymous traffic sources) to understand which content is useful. No personal data is collected via analytics.
      </p>

      <h2>2. What We Don&apos;t Collect</h2>
      <ul>
        <li>We do <strong>not</strong> require accounts.</li>
        <li>We do <strong>not</strong> collect names, addresses, phone numbers, or payment information directly.</li>
        <li>We do <strong>not</strong> sell your data to third parties.</li>
        <li>We do <strong>not</strong> use cross-site tracking or advertising cookies.</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>
        We use essential cookies/localStorage to make the site work — for example, remembering your quiz progress between sessions. See our <a href="/cookies">Cookie Policy</a> for full details.
      </p>

      <h2>4. Affiliate Links</h2>
      <p>
        When you click an iHerb link, iHerb sees that the visit came from us (via the &quot;rcode&quot; parameter). This allows iHerb to credit us with a small commission if you purchase. iHerb&apos;s own privacy policy applies to your activity on their site.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You can clear all data suppdoc.io has stored in your browser at any time by clearing your browser&apos;s localStorage (Settings → Site Data → Clear). For any data we hold on our servers (e.g. contact emails), you may request access, correction, or deletion by emailing <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>.
      </p>

      <h2>6. Children</h2>
      <p>
        suppdoc.io is not intended for children under 13. We do not knowingly collect data from anyone under 13. If you believe a child has used our service, contact us and we will remove the data.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this policy. Material changes will be reflected in the &quot;Last Updated&quot; date above.
      </p>

      <h2>8. Contact</h2>
      <p>
        Privacy questions: <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
