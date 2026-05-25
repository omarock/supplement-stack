import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Medical Disclaimer — suppdoc.io",
  description: "suppdoc.io provides educational guidance only. This is not medical advice. Always consult a qualified healthcare professional before starting supplements.",
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Medical Disclaimer" lastUpdated="May 2026">
      <p>
        <strong>Read this carefully before using suppdoc.io&apos;s recommendations.</strong>
      </p>

      <h2>Educational Only</h2>
      <p>
        All content on suppdoc.io — including the quiz, recommendations, daily routines, articles, and product information — is provided for educational and informational purposes only. It is <strong>not intended as medical advice, diagnosis, or treatment</strong>.
      </p>

      <h2>Consult a Qualified Professional</h2>
      <p>
        Always seek the advice of a qualified healthcare professional (physician, registered dietitian, nutritionist, pharmacist, or other licensed clinician) before:
      </p>
      <ul>
        <li>Starting any new supplement</li>
        <li>Changing your dose or stopping a supplement</li>
        <li>Combining supplements with prescription medication</li>
        <li>Using supplements during pregnancy or while nursing</li>
        <li>Using supplements if you have any medical condition</li>
        <li>Giving supplements to children</li>
      </ul>

      <h2>Specific High-Risk Situations</h2>
      <p>
        Be especially careful and consult a clinician if you:
      </p>
      <ul>
        <li>Are on blood thinners (high-dose omega-3 and curcumin can affect coagulation)</li>
        <li>Have thyroid disease (some adaptogens affect thyroid function)</li>
        <li>Have autoimmune conditions (immune-stimulating supplements may worsen them)</li>
        <li>Are scheduled for surgery within 2 weeks (most supplements should be stopped)</li>
        <li>Take antidepressants (5-HTP, St John&apos;s wort, and others can interact)</li>
        <li>Are pregnant, planning pregnancy, or nursing</li>
      </ul>

      <h2>Quiz Limitations</h2>
      <p>
        Our quiz takes 10 questions. It cannot account for:
      </p>
      <ul>
        <li>Your full medical history</li>
        <li>All medications you take</li>
        <li>All your allergies, sensitivities, or genetic factors</li>
        <li>Lab values (e.g. ferritin, vitamin D status, hormone panels)</li>
      </ul>
      <p>
        Recommendations are educated guesses based on a population profile. A qualified clinician with access to your full history and blood work can tailor recommendations far more precisely.
      </p>

      <h2>Supplement Quality and Regulation</h2>
      <p>
        In most countries (including the US), supplements are <strong>not regulated like pharmaceuticals</strong>. Quality, dose accuracy, and contamination can vary between brands. We recommend brands available on iHerb that have been independently tested, but we cannot guarantee the quality of any specific batch. Always purchase from reputable retailers and check for third-party testing certifications (e.g. USP, NSF, ConsumerLab).
      </p>

      <h2>Adverse Effects</h2>
      <p>
        If you experience any adverse reaction to a supplement, stop taking it and contact a healthcare professional. Report serious adverse events to the appropriate regulatory body (e.g. FDA MedWatch in the US).
      </p>

      <h2>No Cure or Treatment Claims</h2>
      <p>
        No supplement on this site is intended to diagnose, treat, cure, or prevent any disease. Phrases like &quot;may support&quot;, &quot;can help&quot;, and &quot;commonly used for&quot; describe research-backed potential effects — not guaranteed outcomes.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        By using suppdoc.io, you accept full responsibility for your own health decisions. suppdoc.io, its affiliates, and contributors are not liable for any health consequences arising from acting on information presented on this site.
      </p>

      <p>
        <strong>When in doubt, ask a doctor.</strong>
      </p>
    </LegalPage>
  );
}
