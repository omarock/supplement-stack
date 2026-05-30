import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy, suppdoc.io",
  description: "How suppdoc.io handles your data, including accounts, bloodwork health data, AI processing, payments, and your deletion rights. We never sell personal data.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" lastUpdated="May 2026">
      <p>
        Your privacy matters to us, and because suppdoc.io handles health-related information, we try to be unusually clear about it. This policy explains what we collect, how it is used, who processes it on our behalf, and the controls you have. suppdoc.io is a consumer wellness and education tool. It is <strong>not</strong> a healthcare provider, and using it does not create a doctor&ndash;patient relationship.
      </p>

      <h2>1. What We Collect</h2>
      <p>
        <strong>Quiz responses.</strong> Your quiz answers (age, gender, goals, lifestyle, diet, etc.) are kept in your browser&apos;s localStorage so you can resume. If you submit the quiz, an anonymised copy of the inputs and the resulting stack is saved to our database to improve recommendations, linked to your account or email only if you are signed in.
      </p>
      <p>
        <strong>Account data.</strong> Accounts are optional. If you create one, we use email magic links or Google sign-in (via our auth provider, Supabase). We store your email address and an account identifier. We never see or store your Google password.
      </p>
      <p>
        <strong>Bloodwork and health data.</strong> If you use the bloodwork tool, the lab report (PDF or photo) you upload is sent to our AI provider to read and interpret your biomarkers, and the analysis is shown back to you. If you are signed in and choose &quot;save,&quot; the extracted results are stored in your account so you can track changes over time. If you do not save, we do not retain the report after the analysis is returned. We treat this as sensitive data.
      </p>
      <p>
        <strong>Tracker data.</strong> If you use the daily tracker, your check-ins (adherence, energy, sleep, mood, notes) are stored in your account to show your trends.
      </p>
      <p>
        <strong>Payment data.</strong> Premium is billed by Paddle, our Merchant of Record. Paddle collects and processes your payment details under its own privacy policy; we do <strong>not</strong> receive or store your card number. We receive your subscription status and the email tied to it.
      </p>
      <p>
        <strong>Analytics.</strong> We use privacy-respecting product analytics (page views, anonymous traffic sources). These load <strong>only if you consent</strong> via our cookie banner, and collect no directly identifying information.
      </p>

      <h2>2. How We Use AI</h2>
      <p>
        Recommendations, the stack audit, the chat assistant, and bloodwork analysis are generated using the Anthropic Claude API. The information you provide for these features (including an uploaded lab report) is sent to Anthropic solely to generate your result. Under Anthropic&apos;s API terms, this data is <strong>not</strong> used to train their models. AI output is educational and can contain errors, it is not a diagnosis, and you should confirm anything important with a qualified clinician.
      </p>

      <h2>3. Who Processes Your Data (Subprocessors)</h2>
      <ul>
        <li><strong>Supabase</strong> &mdash; database and authentication.</li>
        <li><strong>Anthropic</strong> &mdash; AI processing of quiz, audit, chat, and bloodwork inputs.</li>
        <li><strong>Paddle</strong> &mdash; payment processing (Merchant of Record).</li>
        <li><strong>Vercel</strong> &mdash; hosting and infrastructure.</li>
        <li><strong>Resend</strong> &mdash; transactional emails (e.g. magic links, digests).</li>
      </ul>

      <h2>4. What We Don&apos;t Do</h2>
      <ul>
        <li>We do <strong>not</strong> sell your data to third parties.</li>
        <li>We do <strong>not</strong> use cross-site advertising cookies or ad-tracking.</li>
        <li>We do <strong>not</strong> use your data, or your bloodwork, to train AI models.</li>
        <li>We do <strong>not</strong> store your payment card details.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        Essential cookies/localStorage keep the site working (sign-in, quiz progress). Optional analytics and affiliate-attribution cookies load only with your consent. You can change or withdraw consent anytime via the <strong>Cookie preferences</strong> link in the footer. See our <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>6. Affiliate Links</h2>
      <p>
        When you click a retailer link (such as iHerb or Amazon), the retailer sees the visit came from us via a rewards parameter, so they can credit us a small commission if you buy. The retailer&apos;s own privacy policy then applies to your activity on their site.
      </p>

      <h2>7. Data Retention &amp; Your Rights</h2>
      <p>
        Server-stored data is kept while your account is active so the features work across visits. You can delete browser-stored data anytime by clearing localStorage. For data we hold on our servers, including saved bloodwork, tracker history, and your account, you may request access, correction, export, or deletion by emailing <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>, and we will action it. Deleting your account removes your saved health data from our database.
      </p>

      <h2>8. Health Data &amp; Legal Status</h2>
      <p>
        suppdoc.io is a wellness and education product, not a covered entity under HIPAA, and the bloodwork feature is not a clinical diagnostic service. We apply strong safeguards to health data, but you should not upload information you are not comfortable sharing with a consumer tool, and you should always involve a licensed clinician in medical decisions.
      </p>

      <h2>9. Children</h2>
      <p>
        suppdoc.io is intended for adults. We do not knowingly collect data from anyone under 13. If you believe a child has used our service, contact us and we will remove the data.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy. Material changes will be reflected in the &quot;Last Updated&quot; date above.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy questions or data requests: <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
