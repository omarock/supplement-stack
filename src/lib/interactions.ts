/**
 * Supplement interaction dataset — powers the programmatic /interactions/[pair]
 * pages and grounds the audit engine. Each entry is a real, well-documented
 * pairwise relationship using ids that exist in SUPPLEMENT_DB.
 *
 * Honest by design: we only publish a page for a pair we have something real to
 * say about (no thin "no known interaction" filler).
 */

export type InteractionKind = "synergy" | "timing" | "caution" | "redundant";

export interface Interaction {
  a: string;            // supplement id
  b: string;            // supplement id
  kind: InteractionKind;
  summary: string;      // one-line verdict
  detail: string;       // why it happens (1-2 sentences, plain English)
  advice: string;       // what to do
  evidence: "strong" | "moderate" | "emerging";
}

export const KIND_META: Record<InteractionKind, { label: string; verdict: string; hue: string; bg: string }> = {
  synergy:   { label: "Works better together", verdict: "Take together", hue: "#3f7a52", bg: "#f0f9f3" },
  timing:    { label: "Separate the timing",   verdict: "Space them apart", hue: "#b5751e", bg: "#fffbeb" },
  caution:   { label: "Use with caution",      verdict: "Check with a clinician", hue: "#b91c1c", bg: "#fef2f2" },
  redundant: { label: "Redundant together",    verdict: "Pick one", hue: "#6b4fc7", bg: "#f4f1ff" },
};

export const INTERACTIONS: Interaction[] = [
  { a: "iron", b: "calcium", kind: "timing", evidence: "strong",
    summary: "Calcium blocks iron absorption by up to ~50%.",
    detail: "Calcium competes with non-heme iron for absorption in the gut, so taking them together blunts how much iron you actually absorb.",
    advice: "Take iron on an empty stomach (with vitamin C); take calcium with a different meal, at least 2 hours apart." },
  { a: "iron", b: "vit-c", kind: "synergy", evidence: "strong",
    summary: "Vitamin C dramatically boosts iron absorption.",
    detail: "Vitamin C converts iron into a more absorbable form and counteracts dietary inhibitors, increasing uptake several-fold.",
    advice: "Take them together — pair your iron with ~200 mg vitamin C or a citrus food for the best effect." },
  { a: "iron", b: "zinc", kind: "timing", evidence: "moderate",
    summary: "High-dose iron and zinc compete for absorption.",
    detail: "Taken together in large doses they share absorption pathways and can reduce each other's uptake.",
    advice: "Separate them by a couple of hours — e.g. iron in the morning, zinc with dinner." },
  { a: "calcium", b: "mag-glycinate", kind: "timing", evidence: "moderate",
    summary: "Large calcium and magnesium doses can compete.",
    detail: "At high doses calcium and magnesium use overlapping transport, so mega-dosing both at once is less efficient.",
    advice: "Modest doses together are fine; if you take large amounts, split them across the day." },
  { a: "coq10", b: "ubiquinol", kind: "redundant", evidence: "strong",
    summary: "CoQ10 and ubiquinol are the same nutrient.",
    detail: "Ubiquinol is simply the reduced (active) form of CoQ10 — taking both is paying twice for one nutrient.",
    advice: "Pick one: ubiquinol if you're over 40 or want higher bioavailability, regular CoQ10 if you're younger or cost-conscious." },
  { a: "omega3", b: "omega3-algae", kind: "redundant", evidence: "strong",
    summary: "Two omega-3 sources doing the same job.",
    detail: "Fish oil and algae oil both deliver EPA/DHA — stacking them just overlaps.",
    advice: "Choose one: fish oil for cost and higher EPA, algae oil if you're vegan or fish-allergic." },
  { a: "5-htp", b: "tryptophan", kind: "caution", evidence: "moderate",
    summary: "Both raise serotonin — combining is rarely needed.",
    detail: "5-HTP and L-tryptophan act at different points of the same serotonin pathway; together they can push serotonin too far, especially with antidepressants.",
    advice: "Use one, not both. If you take an SSRI/SNRI, talk to your doctor before either." },
  { a: "nmn", b: "tmg", kind: "synergy", evidence: "emerging",
    summary: "TMG replaces methyl groups NMN uses up.",
    detail: "Making NAD+ from NMN consumes methyl groups; TMG (betaine) donates them back, which may prevent a methylation shortfall.",
    advice: "Many people pair NMN with ~1 g TMG daily. Sensible, low-risk combination." },
  { a: "nr", b: "tmg", kind: "synergy", evidence: "emerging",
    summary: "TMG supports methylation alongside NR.",
    detail: "Like NMN, NR raises NAD+ and can draw on methyl groups; TMG helps replenish them.",
    advice: "Pairing NR with TMG is a common, reasonable longevity stack choice." },
  { a: "ashwagandha", b: "rhodiola", kind: "timing", evidence: "moderate",
    summary: "One calming, one stimulating adaptogen.",
    detail: "Ashwagandha is calming (good for evening); rhodiola is energizing (good for morning). Taken together they can pull in opposite directions.",
    advice: "Take rhodiola in the morning and ashwagandha in the evening rather than at the same time." },
  { a: "mag-glycinate", b: "mag-citrate", kind: "redundant", evidence: "strong",
    summary: "Two magnesium forms — usually one is enough.",
    detail: "Glycinate is gentle and calming; citrate is more laxative. Stacking both mostly adds elemental magnesium and GI effects.",
    advice: "Pick the form for your goal: glycinate for sleep/stress, citrate for constipation." },
  { a: "mag-glycinate", b: "mag-threonate", kind: "redundant", evidence: "moderate",
    summary: "Overlapping magnesium forms.",
    detail: "Threonate is marketed for cognition, glycinate for sleep/stress — but both raise total magnesium and rarely need to be combined.",
    advice: "Choose one based on your primary goal to avoid excess magnesium." },
  { a: "omega3", b: "ginkgo", kind: "caution", evidence: "moderate",
    summary: "Both can thin the blood.",
    detail: "Omega-3 and ginkgo each have mild anti-platelet effects; combined — especially with blood thinners — they may raise bleeding risk.",
    advice: "Fine for most people at normal doses, but check with your doctor if you take anticoagulants or have surgery coming up." },
  { a: "omega3", b: "nattokinase", kind: "caution", evidence: "moderate",
    summary: "Compounded blood-thinning effect.",
    detail: "Nattokinase has fibrinolytic activity and omega-3 is mildly anti-platelet; together they can meaningfully affect clotting.",
    advice: "Avoid combining without medical guidance if you take blood thinners or have a bleeding disorder." },
  { a: "berberine", b: "chromium", kind: "synergy", evidence: "moderate",
    summary: "Both support healthy blood sugar.",
    detail: "Berberine improves insulin signalling and chromium supports glucose metabolism — complementary mechanisms.",
    advice: "Reasonable to pair for metabolic support. Monitor closely if you take diabetes medication." },
  { a: "mag-glycinate", b: "d3k2", kind: "synergy", evidence: "moderate",
    summary: "Magnesium helps your body use vitamin D.",
    detail: "The enzymes that activate vitamin D depend on magnesium, so adequate magnesium helps D3 work properly.",
    advice: "A good foundational pairing — take D3+K2 in the morning and magnesium in the evening." },
  { a: "curcumin", b: "omega3", kind: "synergy", evidence: "moderate",
    summary: "Complementary anti-inflammatory effects.",
    detail: "Curcumin and omega-3 dampen inflammation through different pathways, which can add up.",
    advice: "Safe, common combination for joint and recovery support." },
  { a: "green-tea", b: "iron", kind: "timing", evidence: "moderate",
    summary: "Green tea tannins inhibit iron absorption.",
    detail: "Polyphenols in green tea bind non-heme iron and reduce how much you absorb.",
    advice: "Keep green tea and iron at least 1–2 hours apart." },
  { a: "l-theanine", b: "green-tea", kind: "synergy", evidence: "moderate",
    summary: "Calm, focused energy together.",
    detail: "L-theanine smooths the stimulation from green tea's caffeine, giving focus without the jitters.",
    advice: "A classic pairing for calm focus — fine to take together." },
  { a: "zinc", b: "vit-c", kind: "synergy", evidence: "moderate",
    summary: "Immune-support pairing.",
    detail: "Zinc and vitamin C support different parts of immune function and are commonly combined, especially at the first sign of a cold.",
    advice: "Safe together; take zinc with food to avoid nausea." },
  { a: "ashwagandha", b: "melatonin", kind: "synergy", evidence: "moderate",
    summary: "Both support sleep, different ways.",
    detail: "Ashwagandha lowers cortisol/stress while melatonin cues sleep timing — complementary for sleep onset.",
    advice: "Reasonable evening pairing. Start melatonin low (0.5–1 mg)." },
  { a: "selenium", b: "iodine", kind: "synergy", evidence: "moderate",
    summary: "Thyroid pairing — but balance matters.",
    detail: "Both are needed for thyroid hormone production and conversion; selenium also protects the thyroid when iodine is supplemented.",
    advice: "Useful together for thyroid support, but don't mega-dose iodine — check with a clinician if you have thyroid disease." },

  // ── Mineral timing / competition ─────────────────────────────────────────
  { a: "iron", b: "mag-glycinate", kind: "timing", evidence: "moderate", summary: "Iron and magnesium can compete for absorption.", detail: "Both are divalent minerals that share transport, so large doses together reduce uptake of each.", advice: "Take iron in the morning and magnesium in the evening." },
  { a: "calcium", b: "zinc", kind: "timing", evidence: "moderate", summary: "Calcium blunts zinc absorption.", detail: "High-dose calcium competes with zinc in the gut.", advice: "Separate them by ~2 hours if you take large doses of both." },
  { a: "iron", b: "green-tea", kind: "timing", evidence: "strong", summary: "Green tea reduces iron absorption.", detail: "Tea polyphenols bind non-heme iron.", advice: "Keep green tea and iron 1–2 hours apart." },
  { a: "iron", b: "psyllium", kind: "timing", evidence: "moderate", summary: "Fibre can bind iron.", detail: "Soluble fibre like psyllium can trap minerals and slow absorption.", advice: "Take iron away from psyllium and other fibre supplements." },
  { a: "calcium", b: "iron", kind: "timing", evidence: "strong", summary: "Calcium blocks iron absorption.", detail: "Calcium competes with non-heme iron for uptake.", advice: "Space them at least 2 hours apart." },
  { a: "zinc", b: "mag-glycinate", kind: "timing", evidence: "emerging", summary: "Best taken a little apart at high doses.", detail: "Both minerals can compete when taken together in large amounts (though ZMA combines them at balanced doses).", advice: "Balanced doses together are fine; otherwise space them." },

  // ── B-vitamin / methylation synergies ────────────────────────────────────
  { a: "methylfolate", b: "b12", kind: "synergy", evidence: "strong", summary: "Folate and B12 work as a pair.", detail: "They recycle each other in methylation and red-blood-cell formation; supplementing folate alone can mask a B12 deficiency.", advice: "Take them together (a B-complex covers both)." },
  { a: "vit-b6", b: "methylfolate", kind: "synergy", evidence: "strong", summary: "Team players for homocysteine.", detail: "B6, folate and B12 together lower homocysteine more than any alone.", advice: "Combine them — ideally as a methylated B-complex." },
  { a: "vit-b6", b: "b12", kind: "synergy", evidence: "moderate", summary: "Nerve and energy support together.", detail: "Both are central to nerve function and energy metabolism.", advice: "Fine together; a B-complex is the simplest way." },
  { a: "tmg", b: "b-complex", kind: "synergy", evidence: "moderate", summary: "Both support methylation.", detail: "TMG and B-vitamins donate and recycle methyl groups, helping keep homocysteine in check.", advice: "Reasonable to combine for methylation support." },
  { a: "5-htp", b: "vit-b6", kind: "synergy", evidence: "moderate", summary: "B6 helps convert 5-HTP to serotonin.", detail: "The enzyme that turns 5-HTP into serotonin depends on vitamin B6.", advice: "Taking B6 alongside 5-HTP supports the conversion." },
  { a: "tryptophan", b: "vit-b6", kind: "synergy", evidence: "moderate", summary: "B6 aids tryptophan metabolism.", detail: "B6 is a cofactor in converting tryptophan toward serotonin.", advice: "Pairing is sensible; avoid stacking with other serotonin boosters." },
  { a: "iron", b: "b12", kind: "synergy", evidence: "moderate", summary: "Both build healthy red blood cells.", detail: "Iron and B12 address different causes of anaemia and fatigue.", advice: "Fine together — though take iron away from calcium/tea." },
  { a: "multivit", b: "b-complex", kind: "redundant", evidence: "moderate", summary: "Overlapping B vitamins.", detail: "A multivitamin already contains B vitamins, so adding a B-complex doubles up.", advice: "Use one — a B-complex only if you specifically need higher B doses." },
  { a: "multivit", b: "biotin", kind: "redundant", evidence: "moderate", summary: "Your multi likely has biotin.", detail: "Most multivitamins include biotin, making a separate one redundant for most people.", advice: "Add standalone biotin only for a specific hair/nail goal." },

  // ── Mitochondrial / energy synergies ─────────────────────────────────────
  { a: "coq10", b: "pqq", kind: "synergy", evidence: "moderate", summary: "Mitochondrial duo.", detail: "CoQ10 supports existing mitochondria while PQQ may promote new ones — complementary.", advice: "Common, well-tolerated pairing for energy and aging." },
  { a: "ala", b: "acetyl-l-carnitine", kind: "synergy", evidence: "moderate", summary: "Classic mitochondrial pairing.", detail: "ALCAR shuttles fat into mitochondria; ALA is a mitochondrial antioxidant — studied together for energy and cognition.", advice: "Reasonable to combine." },
  { a: "acetyl-l-carnitine", b: "l-carnitine", kind: "redundant", evidence: "strong", summary: "Two forms of carnitine.", detail: "ALCAR is acetylated L-carnitine — both raise carnitine; ALCAR crosses into the brain better.", advice: "Pick one: ALCAR for cognition, L-carnitine for general/exercise." },
  { a: "coq10", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Heart-health pairing.", detail: "CoQ10 supports cellular energy in heart muscle; omega-3 supports rhythm and triglycerides.", advice: "Common cardiovascular combination." },
  { a: "ubiquinol", b: "pqq", kind: "synergy", evidence: "moderate", summary: "Mitochondrial support.", detail: "Same rationale as CoQ10 + PQQ, with the more bioavailable ubiquinol form.", advice: "Fine together." },

  // ── Antioxidant recycling ────────────────────────────────────────────────
  { a: "vit-c", b: "vit-e", kind: "synergy", evidence: "moderate", summary: "They regenerate each other.", detail: "Vitamin C recycles oxidised vitamin E back to its active form.", advice: "A natural antioxidant pairing." },
  { a: "nac", b: "glycine", kind: "synergy", evidence: "emerging", summary: "GlyNAC — raises glutathione.", detail: "Glycine and NAC supply the building blocks of glutathione; together (GlyNAC) they raise it more than either alone.", advice: "Promising combination for antioxidant defence and aging." },
  { a: "nac", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "Precursor plus the finished product.", detail: "NAC is a glutathione precursor; taking both supports glutathione status.", advice: "Fine together, though NAC alone is often enough." },
  { a: "ala", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "ALA helps recycle glutathione.", detail: "Alpha-lipoic acid regenerates other antioxidants including glutathione.", advice: "Complementary antioxidant pairing." },
  { a: "vit-c", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "Vitamin C spares glutathione.", detail: "Vitamin C helps keep glutathione in its active reduced form.", advice: "Reasonable antioxidant combination." },
  { a: "vit-e", b: "selenium", kind: "synergy", evidence: "moderate", summary: "Antioxidant teammates.", detail: "Selenium-dependent enzymes and vitamin E protect cells from oxidation in tandem.", advice: "Fine together at sensible doses." },
  { a: "omega3", b: "astaxanthin", kind: "synergy", evidence: "moderate", summary: "Astaxanthin protects omega-3s.", detail: "Astaxanthin is a potent antioxidant that helps prevent omega-3 fats from oxidising.", advice: "Good pairing — some fish-oil products already include it." },
  { a: "omega3", b: "vit-e", kind: "synergy", evidence: "emerging", summary: "Vitamin E guards omega-3s.", detail: "A little vitamin E helps keep polyunsaturated omega-3s from going rancid.", advice: "Fine; don't mega-dose vitamin E." },

  // ── Sleep / calm synergies ───────────────────────────────────────────────
  { a: "glycine", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Calming sleep pairing.", detail: "Both calm the nervous system and support sleep onset and quality.", advice: "Nice evening combination." },
  { a: "l-theanine", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Relaxation without sedation.", detail: "L-theanine promotes calm focus; magnesium relaxes muscles and the nervous system.", advice: "Good for winding down." },
  { a: "gaba", b: "l-theanine", kind: "synergy", evidence: "emerging", summary: "Calm-focus pairing.", detail: "Both promote relaxation and may improve sleep onset.", advice: "Commonly combined; effects are gentle." },
  { a: "melatonin", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Sleep onset + relaxation.", detail: "Melatonin cues sleep timing; magnesium relaxes the body.", advice: "Start melatonin low (0.5–1 mg)." },
  { a: "valerian", b: "gaba", kind: "synergy", evidence: "emerging", summary: "Sedative pairing.", detail: "Both act on GABA pathways to promote sleep.", advice: "Use in the evening; can cause grogginess if overdone." },
  { a: "valerian", b: "passionflower", kind: "synergy", evidence: "moderate", summary: "Traditional sleep blend.", detail: "Often combined in sleep formulas for additive calming.", advice: "Evening use; avoid with sedatives/alcohol." },
  { a: "valerian", b: "lemon-balm", kind: "synergy", evidence: "moderate", summary: "Calming herbal pairing.", detail: "Lemon balm and valerian are traditionally combined for relaxation and sleep.", advice: "Gentle; take before bed." },
  { a: "magnolia-bark", b: "gaba", kind: "synergy", evidence: "emerging", summary: "Stress-and-sleep pairing.", detail: "Magnolia bark lowers cortisol and supports GABA tone.", advice: "Evening use for stress-driven sleeplessness." },
  { a: "ashwagandha", b: "l-theanine", kind: "synergy", evidence: "moderate", summary: "Daytime stress pairing.", detail: "Ashwagandha lowers stress hormones; L-theanine smooths anxious focus.", advice: "Works morning or evening." },
  { a: "ashwagandha", b: "magnolia-bark", kind: "synergy", evidence: "emerging", summary: "Cortisol-lowering pair.", detail: "Both target the stress/cortisol axis.", advice: "Good evening stress support." },

  // ── Serotonin / dopamine cautions ────────────────────────────────────────
  { a: "5-htp", b: "saffron", kind: "caution", evidence: "moderate", summary: "Both raise serotonin.", detail: "Stacking serotonergic supplements can be excessive, especially with antidepressants.", advice: "Use one; talk to your doctor if you take an SSRI/SNRI." },
  { a: "5-htp", b: "mucuna", kind: "caution", evidence: "emerging", summary: "Serotonin + dopamine push.", detail: "5-HTP raises serotonin and mucuna raises dopamine — combining can be intense and isn't well studied.", advice: "Approach cautiously; not with mood medications." },
  { a: "mucuna", b: "l-tyrosine", kind: "redundant", evidence: "moderate", summary: "Two dopamine precursors.", detail: "Both feed dopamine production via overlapping pathways.", advice: "Use one to avoid overshooting." },
  { a: "saffron", b: "5-htp", kind: "caution", evidence: "moderate", summary: "Serotonergic stacking.", detail: "Both lift mood via serotonin — combined effect is hard to dose.", advice: "Pick one; involve a clinician if on antidepressants." },

  // ── Nootropic synergies ──────────────────────────────────────────────────
  { a: "alpha-gpc", b: "citicoline", kind: "redundant", evidence: "moderate", summary: "Two choline donors.", detail: "Both raise acetylcholine via choline; stacking rarely adds benefit.", advice: "Pick one — citicoline also provides uridine." },
  { a: "huperzine", b: "alpha-gpc", kind: "synergy", evidence: "emerging", summary: "Raise and preserve acetylcholine.", detail: "Alpha-GPC supplies choline; huperzine slows acetylcholine breakdown.", advice: "Cycle huperzine (don't take daily long-term); watch for headaches." },
  { a: "citicoline", b: "phosphatidylserine", kind: "synergy", evidence: "moderate", summary: "Membrane + acetylcholine support.", detail: "Complementary cognitive mechanisms.", advice: "Reasonable nootropic pairing." },
  { a: "bacopa", b: "lions-mane", kind: "synergy", evidence: "emerging", summary: "Memory + nerve growth.", detail: "Bacopa supports memory; lion's mane supports nerve-growth factor — different angles on cognition.", advice: "Both need weeks of consistent use." },
  { a: "lions-mane", b: "alpha-gpc", kind: "synergy", evidence: "emerging", summary: "Nootropic stack.", detail: "Nerve-growth support plus acetylcholine fuel.", advice: "Common focus combination." },
  { a: "phosphatidylserine", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Brain-membrane pairing.", detail: "Both are key structural fats for neuronal membranes.", advice: "Good for cognition and mood." },
  { a: "choline", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Brain-building pair.", detail: "Choline and DHA are both critical for brain-cell membranes (and fetal brain development).", advice: "Especially relevant in pregnancy (with clinician guidance)." },
  { a: "l-tyrosine", b: "green-tea", kind: "synergy", evidence: "emerging", summary: "Focus under stress.", detail: "Tyrosine supports dopamine/noradrenaline; green tea adds calm-focus caffeine + theanine.", advice: "Good daytime focus pairing." },
  { a: "bacopa", b: "ginkgo", kind: "synergy", evidence: "emerging", summary: "Memory + circulation.", detail: "Bacopa supports memory consolidation; ginkgo supports cerebral blood flow.", advice: "Note ginkgo's mild blood-thinning if you take anticoagulants." },

  // ── Performance / muscle ─────────────────────────────────────────────────
  { a: "creatine", b: "beta-alanine", kind: "synergy", evidence: "strong", summary: "Strength + endurance.", detail: "Creatine boosts power output; beta-alanine buffers muscle acid for endurance — they target different systems.", advice: "Staple performance pairing." },
  { a: "creatine", b: "hmb", kind: "synergy", evidence: "moderate", summary: "Build and protect muscle.", detail: "Creatine supports strength gains; HMB reduces muscle breakdown.", advice: "Useful together, especially in a deficit or for older adults." },
  { a: "creatine", b: "whey-isolate", kind: "synergy", evidence: "strong", summary: "Classic muscle-building combo.", detail: "Protein supplies amino acids; creatine improves training performance.", advice: "Take post-workout together." },
  { a: "l-citrulline", b: "beetroot", kind: "synergy", evidence: "moderate", summary: "Nitric-oxide 'pump' pairing.", detail: "Both raise nitric oxide for blood flow via different routes (citrulline → arginine; beetroot nitrates).", advice: "Common pre-workout stack." },
  { a: "l-citrulline", b: "l-arginine", kind: "redundant", evidence: "strong", summary: "Citrulline raises arginine anyway.", detail: "L-citrulline converts to arginine and raises it more reliably than arginine itself.", advice: "Use citrulline; arginine adds little on top." },
  { a: "beetroot", b: "l-arginine", kind: "synergy", evidence: "emerging", summary: "Blood-flow pairing.", detail: "Nitrates plus an NO precursor support vasodilation.", advice: "Fine pre-workout." },
  { a: "beta-alanine", b: "taurine", kind: "timing", evidence: "emerging", summary: "They compete for uptake.", detail: "Beta-alanine and taurine share a transporter, so very high doses together may compete.", advice: "Minor — separate large doses if you take both." },
  { a: "bcaa", b: "eaa", kind: "redundant", evidence: "strong", summary: "EAAs already contain BCAAs.", detail: "Essential amino acids include the three BCAAs plus the rest needed for muscle protein synthesis.", advice: "Choose EAAs — they're the more complete option." },
  { a: "whey-isolate", b: "bcaa", kind: "redundant", evidence: "strong", summary: "Whey is already rich in BCAAs.", detail: "A whey shake delivers more BCAAs than a typical BCAA serving, plus the other amino acids.", advice: "Skip separate BCAAs if you take whey." },
  { a: "whey-isolate", b: "plant-protein", kind: "redundant", evidence: "moderate", summary: "Two protein sources.", detail: "Both serve the same role; choice is about diet and digestion.", advice: "Pick one based on dietary preference." },
  { a: "creatine", b: "taurine", kind: "synergy", evidence: "emerging", summary: "Cell hydration + performance.", detail: "Both are cell-volumising and support exercise performance.", advice: "Fine together." },
  { a: "tart-cherry", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Recovery pairing.", detail: "Both lower exercise-induced inflammation and soreness.", advice: "Good post-training combination." },

  // ── Joint / skin / beauty ────────────────────────────────────────────────
  { a: "glucosamine", b: "msm", kind: "synergy", evidence: "moderate", summary: "Joint-support staple.", detail: "Glucosamine supports cartilage; MSM supports connective tissue and comfort.", advice: "Frequently combined for joints." },
  { a: "glucosamine", b: "boswellia", kind: "synergy", evidence: "moderate", summary: "Structure + anti-inflammatory.", detail: "Glucosamine targets cartilage; boswellia calms joint inflammation.", advice: "Reasonable joint stack." },
  { a: "boswellia", b: "curcumin", kind: "synergy", evidence: "moderate", summary: "Anti-inflammatory pair.", detail: "Different anti-inflammatory pathways for joint comfort.", advice: "Common joint/recovery combination." },
  { a: "curcumin", b: "ginger", kind: "synergy", evidence: "moderate", summary: "Anti-inflammatory roots.", detail: "Turmeric and ginger have complementary anti-inflammatory and digestive effects.", advice: "Safe culinary-derived pairing." },
  { a: "collagen", b: "vit-c", kind: "synergy", evidence: "strong", summary: "Vitamin C is required to build collagen.", detail: "Your body needs vitamin C to synthesise collagen, so pairing supports skin, joints and tendons.", advice: "Take collagen with vitamin C." },
  { a: "collagen", b: "hyaluronic-acid", kind: "synergy", evidence: "moderate", summary: "Skin-hydration pairing.", detail: "Collagen supports skin structure; hyaluronic acid supports hydration.", advice: "Popular beauty combination." },
  { a: "collagen", b: "silica", kind: "synergy", evidence: "emerging", summary: "Skin, hair and nails.", detail: "Silica supports collagen formation and connective tissue.", advice: "Reasonable beauty pairing." },
  { a: "collagen", b: "biotin", kind: "synergy", evidence: "emerging", summary: "Hair and nail support.", detail: "Collagen supports the matrix; biotin supports keratin.", advice: "Common beauty combination." },
  { a: "lutein", b: "astaxanthin", kind: "synergy", evidence: "moderate", summary: "Eye-protection pairing.", detail: "Both are carotenoid antioxidants concentrating in eye tissue.", advice: "Good for screen-heavy lifestyles." },
  { a: "lutein", b: "bilberry", kind: "synergy", evidence: "emerging", summary: "Vision support.", detail: "Lutein protects the macula; bilberry supports retinal blood flow.", advice: "Reasonable eye-health combination." },

  // ── Gut ──────────────────────────────────────────────────────────────────
  { a: "probiotic", b: "inulin", kind: "synergy", evidence: "moderate", summary: "Synbiotic — probiotic + its food.", detail: "Inulin is a prebiotic fibre that feeds beneficial bacteria.", advice: "Classic gut pairing; introduce inulin slowly to avoid gas." },
  { a: "probiotic", b: "s-boulardii", kind: "synergy", evidence: "moderate", summary: "Bacteria + beneficial yeast.", detail: "S. boulardii is a yeast that complements bacterial probiotics, especially during/after antibiotics.", advice: "Fine together." },
  { a: "probiotic", b: "psyllium", kind: "synergy", evidence: "emerging", summary: "Probiotic + fibre.", detail: "Fibre supports a healthy microbiome alongside probiotics.", advice: "Drink plenty of water with psyllium." },
  { a: "zinc-carnosine", b: "dgl", kind: "synergy", evidence: "emerging", summary: "Gut-lining soothers.", detail: "Both support the stomach/gut lining via different mechanisms.", advice: "Common gut-repair pairing." },
  { a: "l-glutamine", b: "zinc-carnosine", kind: "synergy", evidence: "emerging", summary: "Gut-lining support.", detail: "Glutamine fuels gut cells; zinc-carnosine supports the mucosa.", advice: "Reasonable gut-repair combination." },
  { a: "digestive-enzymes", b: "probiotic", kind: "synergy", evidence: "emerging", summary: "Digestion + microbiome.", detail: "Enzymes aid breakdown of food; probiotics support the gut flora.", advice: "Fine together." },

  // ── Heart / metabolic ────────────────────────────────────────────────────
  { a: "red-yeast-rice", b: "coq10", kind: "synergy", evidence: "moderate", summary: "Red yeast rice can lower CoQ10.", detail: "Like statins, red yeast rice's monacolin K can deplete CoQ10.", advice: "Pairing CoQ10 with red yeast rice is commonly recommended." },
  { a: "red-yeast-rice", b: "vit-b3", kind: "caution", evidence: "moderate", summary: "Two lipid agents on the liver.", detail: "High-dose niacin and red yeast rice both affect lipids and can stress the liver together.", advice: "Don't combine without medical supervision and liver monitoring." },
  { a: "red-yeast-rice", b: "bergamot", kind: "synergy", evidence: "emerging", summary: "Complementary cholesterol support.", detail: "Different mechanisms for lowering LDL.", advice: "Discuss with your doctor, especially if also on a statin." },
  { a: "berberine", b: "red-yeast-rice", kind: "synergy", evidence: "emerging", summary: "Lipid + glucose support.", detail: "Berberine and red yeast rice both support cardiometabolic markers via different routes.", advice: "Monitor with a clinician if on medication." },
  { a: "berberine", b: "ala", kind: "synergy", evidence: "moderate", summary: "Blood-sugar pairing.", detail: "Both support insulin sensitivity and glucose handling.", advice: "Watch closely if you take diabetes medication." },
  { a: "berberine", b: "milk-thistle", kind: "synergy", evidence: "emerging", summary: "Metabolic + liver support.", detail: "Milk thistle may also improve berberine's absorption.", advice: "Reasonable metabolic combination." },
  { a: "omega3", b: "bergamot", kind: "synergy", evidence: "emerging", summary: "Lipid-support pairing.", detail: "Omega-3 lowers triglycerides; bergamot supports LDL/cholesterol.", advice: "Complementary heart support." },
  { a: "hawthorn", b: "coq10", kind: "synergy", evidence: "emerging", summary: "Heart-function pairing.", detail: "Both are traditionally used to support heart-muscle energy and function.", advice: "Check with a clinician if you take heart medication." },
  { a: "chromium", b: "ala", kind: "synergy", evidence: "moderate", summary: "Glucose-metabolism pair.", detail: "Chromium and alpha-lipoic acid both support insulin sensitivity.", advice: "Useful for metabolic support; monitor if medicated." },

  // ── Bleeding cautions ────────────────────────────────────────────────────
  { a: "ginkgo", b: "nattokinase", kind: "caution", evidence: "moderate", summary: "Compounded blood-thinning.", detail: "Both reduce clotting; together — or with anticoagulants — bleeding risk rises.", advice: "Avoid combining without medical guidance." },
  { a: "ginkgo", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Both can thin the blood.", detail: "Ginkgo and garlic each have mild anti-platelet effects.", advice: "Use caution with blood thinners or before surgery." },
  { a: "nattokinase", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Stacked clot effects.", detail: "Nattokinase breaks down fibrin; garlic is anti-platelet.", advice: "Avoid together if you take anticoagulants." },
  { a: "omega3", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Mild additive thinning.", detail: "Both gently reduce platelet stickiness.", advice: "Fine for most; cautious if on blood thinners." },
  { a: "ginkgo", b: "omega3", kind: "caution", evidence: "moderate", summary: "Both reduce clotting slightly.", detail: "Combined anti-platelet effect can matter with anticoagulants.", advice: "Check with your doctor if on blood thinners." },

  // ── Adaptogen / stimulant cautions ───────────────────────────────────────
  { a: "rhodiola", b: "panax-ginseng", kind: "caution", evidence: "moderate", summary: "Two stimulating adaptogens.", detail: "Both can be energising; together they may overstimulate or affect sleep.", advice: "Take in the morning; consider using just one." },
  { a: "panax-ginseng", b: "theacrine", kind: "caution", evidence: "emerging", summary: "Stacked stimulation.", detail: "Both are energising; combining can cause jitteriness or poor sleep.", advice: "Keep to the morning and start low." },
  { a: "theacrine", b: "green-tea", kind: "caution", evidence: "emerging", summary: "Layered stimulants.", detail: "Theacrine is caffeine-like; with green tea's caffeine the total stimulant load adds up.", advice: "Mind your total daily caffeine." },
  { a: "rhodiola", b: "theacrine", kind: "caution", evidence: "emerging", summary: "Energising stack.", detail: "Both lift energy/focus and can overshoot together.", advice: "Morning only; start with low doses." },
  { a: "panax-ginseng", b: "rhodiola", kind: "caution", evidence: "moderate", summary: "Overlapping stimulant adaptogens.", detail: "Stacking energising adaptogens dilutes the benefit of each and can disturb sleep.", advice: "Pick one, or separate clearly from bedtime." },

  // ── NAD+ / longevity ─────────────────────────────────────────────────────
  { a: "nmn", b: "nr", kind: "redundant", evidence: "moderate", summary: "Two NAD+ precursors.", detail: "NMN and NR both raise NAD+ through overlapping pathways.", advice: "Choose one rather than paying for both." },
  { a: "resveratrol", b: "pterostilbene", kind: "redundant", evidence: "moderate", summary: "Pterostilbene is methylated resveratrol.", detail: "They're close cousins with overlapping effects; pterostilbene is more bioavailable.", advice: "Use one — pterostilbene for absorption, resveratrol for cost." },
  { a: "nmn", b: "resveratrol", kind: "synergy", evidence: "emerging", summary: "Popular longevity pairing.", detail: "NMN raises NAD+ while resveratrol is theorised to activate sirtuins that use it.", advice: "Common stack; evidence is still early." },
  { a: "fisetin", b: "quercetin", kind: "synergy", evidence: "emerging", summary: "Senolytic flavonoids.", detail: "Both are studied as senolytics that clear aged cells, often used in pulses.", advice: "Typically taken intermittently, not daily." },
  { a: "ca-akg", b: "nmn", kind: "synergy", evidence: "emerging", summary: "Longevity-stack pairing.", detail: "Different proposed aging mechanisms (AKG metabolism vs NAD+).", advice: "Reasonable longevity combination; evidence early." },
  { a: "spermidine", b: "nmn", kind: "synergy", evidence: "emerging", summary: "Autophagy + NAD+.", detail: "Spermidine may promote autophagy while NMN supports NAD+.", advice: "Common longevity pairing." },

  // ── Greens / general redundancy ──────────────────────────────────────────
  { a: "spirulina", b: "chlorella", kind: "redundant", evidence: "moderate", summary: "Overlapping green algae.", detail: "Both are nutrient-dense algae with similar uses; many products combine them.", advice: "One is usually enough unless you want both profiles." },
  { a: "quercetin", b: "zinc", kind: "synergy", evidence: "emerging", summary: "Quercetin helps zinc get into cells.", detail: "Quercetin acts as a zinc ionophore, improving zinc's antiviral activity.", advice: "Popular immune pairing at the first sign of a cold." },
  { a: "quercetin", b: "vit-c", kind: "synergy", evidence: "moderate", summary: "Antioxidant + recycling.", detail: "Vitamin C helps recycle quercetin and the two support immune function together.", advice: "Common immune combination." },
  { a: "elderberry", b: "zinc", kind: "synergy", evidence: "moderate", summary: "Cold-season pairing.", detail: "Elderberry and zinc are both used at the onset of colds via different mechanisms.", advice: "Take zinc with food to avoid nausea." },

  // ── Hormonal (men's / women's) ───────────────────────────────────────────
  { a: "zinc", b: "d-aspartic", kind: "synergy", evidence: "emerging", summary: "Testosterone-support pairing.", detail: "Zinc supports baseline testosterone; D-aspartic acid may give a short-term nudge.", advice: "Evidence is modest; most benefit is in those who are deficient." },
  { a: "boron", b: "d-aspartic", kind: "synergy", evidence: "emerging", summary: "Free-testosterone angle.", detail: "Boron may raise free testosterone; D-aspartic acid targets production.", advice: "Reasonable to combine; effects are modest." },
  { a: "tongkat-ali", b: "zinc", kind: "synergy", evidence: "emerging", summary: "Libido + testosterone support.", detail: "Tongkat ali supports free testosterone and stress; zinc covers a common deficiency.", advice: "Popular men's-health pairing." },
  { a: "tongkat-ali", b: "ashwagandha", kind: "synergy", evidence: "moderate", summary: "Testosterone + cortisol.", detail: "Tongkat ali supports androgens; ashwagandha lowers cortisol — complementary.", advice: "Common men's-vitality stack." },
  { a: "maca", b: "tongkat-ali", kind: "synergy", evidence: "emerging", summary: "Libido pairing.", detail: "Maca supports libido and energy; tongkat ali supports testosterone.", advice: "Reasonable combination." },
  { a: "saw-palmetto", b: "nettle-root", kind: "synergy", evidence: "moderate", summary: "Prostate-support pair.", detail: "Both are traditionally combined for prostate and urinary support.", advice: "Common men's prostate formula pairing." },
  { a: "saw-palmetto", b: "pumpkin-seed-oil", kind: "synergy", evidence: "emerging", summary: "Prostate / urinary support.", detail: "Frequently combined for benign prostate symptoms.", advice: "Reasonable pairing." },
  { a: "nettle-root", b: "pumpkin-seed-oil", kind: "synergy", evidence: "emerging", summary: "Urinary-support pair.", detail: "Both support prostate and urinary comfort.", advice: "Often found together in men's formulas." },
  { a: "chasteberry", b: "evening-primrose", kind: "synergy", evidence: "emerging", summary: "PMS-support pairing.", detail: "Chasteberry supports hormonal balance; evening primrose oil supports cyclical symptoms.", advice: "Traditional women's-health combination." },
  { a: "black-cohosh", b: "evening-primrose", kind: "synergy", evidence: "emerging", summary: "Menopause-symptom support.", detail: "Often combined for hot flushes and cyclical comfort.", advice: "Discuss with a clinician, especially if you have hormone-sensitive conditions." },

  // ── Liver ────────────────────────────────────────────────────────────────
  { a: "milk-thistle", b: "nac", kind: "synergy", evidence: "moderate", summary: "Liver-support pair.", detail: "Milk thistle protects liver cells; NAC raises glutathione the liver relies on.", advice: "Common liver-support combination." },
  { a: "tudca", b: "milk-thistle", kind: "synergy", evidence: "emerging", summary: "Bile + liver-cell support.", detail: "TUDCA supports bile flow; milk thistle protects hepatocytes.", advice: "Reasonable liver pairing." },
  { a: "artichoke", b: "milk-thistle", kind: "synergy", evidence: "emerging", summary: "Liver + bile support.", detail: "Artichoke supports bile; milk thistle protects the liver.", advice: "Traditional liver/digestion combination." },
  { a: "dandelion", b: "milk-thistle", kind: "synergy", evidence: "emerging", summary: "Traditional liver/detox pair.", detail: "Both are used traditionally for liver and bile support.", advice: "Gentle pairing." },

  // ── Vitamin D ecosystem ──────────────────────────────────────────────────
  { a: "d3k2", b: "calcium", kind: "synergy", evidence: "strong", summary: "Vitamin D drives calcium absorption.", detail: "D3 increases calcium uptake and K2 helps route it to bone, not arteries.", advice: "A sensible bone-health trio (D3+K2 with calcium)." },
  { a: "d3k2", b: "boron", kind: "synergy", evidence: "emerging", summary: "Boron supports vitamin D status.", detail: "Boron may raise and prolong active vitamin D levels.", advice: "Reasonable bone/hormone pairing." },
  { a: "calcium", b: "vit-k2", kind: "synergy", evidence: "moderate", summary: "K2 directs calcium to bone.", detail: "Vitamin K2 activates proteins that put calcium into bone and keep it out of arteries.", advice: "Pair calcium with K2 (and vitamin D)." },
  { a: "vit-a", b: "d3k2", kind: "synergy", evidence: "emerging", summary: "Fat-soluble vitamins balance each other.", detail: "Vitamins A, D and K work together; balance matters more than mega-dosing one.", advice: "Modest doses together; avoid high-dose vitamin A in pregnancy." },
];

/** Canonical slug for a pair, order-independent. */
export function interactionSlug(a: string, b: string): string {
  return [a, b].sort().join("-and-");
}

/** Find an interaction by two ids, in either order. */
export function findInteraction(a: string, b: string): Interaction | undefined {
  return INTERACTIONS.find(i => (i.a === a && i.b === b) || (i.a === b && i.b === a));
}

/** Find an interaction by its canonical slug. */
export function interactionBySlug(slug: string): Interaction | undefined {
  return INTERACTIONS.find(i => interactionSlug(i.a, i.b) === slug);
}
