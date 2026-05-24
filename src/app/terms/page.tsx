import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — suppdoc.io",
  description: "Phyla's terms of service. By using the site, you agree to these terms covering use, intellectual property, disclaimers, and affiliate disclosure.",
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" lastUpdated="May 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of the Phyla website and services (the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
      </p>

      <h2>1. Use of the Service</h2>
      <p>
        Phyla provides educational information about supplements based on user-submitted quiz responses. The Service is provided &quot;as is&quot; for personal, non-commercial use. You may not copy, scrape, redistribute, or use the content for any commercial purpose without explicit permission.
      </p>

      <h2>2. No Medical Advice</h2>
      <p>
        suppdoc.io is <strong>not a medical provider</strong>. Nothing on the Service constitutes medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before starting any supplement, particularly if you have a medical condition, take prescription medication, or are pregnant or nursing.
      </p>
      <p>
        Quiz recommendations are educational only. Individual results vary, and supplements may interact with medications or health conditions in ways our algorithm cannot detect.
      </p>

      <h2>3. Affiliate Disclosure</h2>
      <p>
        suppdoc.io is an affiliate of iHerb. Links to iHerb products carry our rewards code. If you make a purchase after clicking, we may earn a commission — at no extra cost to you. We do not pay attention to commissions when selecting recommendations; product picks are based purely on evidence and user fit.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        All content on suppdoc.io — written articles, design, code, recommendation logic — is the property of Phyla or its licensors. You may share excerpts (with attribution) but may not reproduce articles in full without permission.
      </p>

      <h2>5. User Data</h2>
      <p>
        Quiz answers are stored locally in your browser (localStorage). We do not collect or store personally identifying information unless you explicitly provide it (e.g. via the contact form). See our <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Phyla and its affiliates are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Service or any supplement you purchase based on its recommendations. You assume all responsibility for your own health decisions.
      </p>

      <h2>7. Changes to These Terms</h2>
      <p>
        We may update these Terms at any time. Material changes will be reflected in the &quot;Last Updated&quot; date above. Continued use of the Service after changes constitutes acceptance.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction where suppdoc.io is operated. Any disputes shall be resolved in the appropriate courts of that jurisdiction.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms: <a href="mailto:hello@suppdoc.io">hello@suppdoc.io</a>
      </p>
    </LegalPage>
  );
}
