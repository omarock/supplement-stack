/**
 * Supplement interaction dataset, powers the programmatic /interactions/[pair]
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
    detail: "Calcium competes with non-heme iron for the same DMT1 uptake transporter in the gut, so dairy or a calcium supplement in the same sitting can cut iron absorption by roughly a third to a half. The effect is largest for supplemental and plant iron and smaller for heme iron from meat.",
    advice: "Take iron on an empty stomach with about 200 mg of vitamin C, and keep calcium-rich meals or calcium pills at least 2 hours away. If iron upsets your stomach, a gentle form like bisglycinate with a small low-calcium snack is a reasonable compromise." },
  { a: "iron", b: "vit-c", kind: "synergy", evidence: "strong",
    summary: "Vitamin C dramatically boosts iron absorption.",
    detail: "Vitamin C reduces dietary iron to its more soluble ferrous form and shields it from inhibitors like tannins and phytates, which can lift uptake of non-heme iron several-fold. The benefit is greatest for plant and supplemental iron, exactly the iron most people struggle to absorb.",
    advice: "Take them together: pair your iron with roughly 200 mg of vitamin C or a vitamin-C-rich food such as citrus, peppers, or strawberries. There is no need for a separate megadose; a modest amount alongside the iron does the job." },
  { a: "iron", b: "zinc", kind: "timing", evidence: "moderate",
    summary: "High-dose iron and zinc compete for absorption.",
    detail: "Taken together in large doses they share absorption pathways and can reduce each other's uptake.",
    advice: "Separate them by a couple of hours, e.g. iron in the morning, zinc with dinner." },
  { a: "calcium", b: "mag-glycinate", kind: "timing", evidence: "moderate",
    summary: "Large calcium and magnesium doses can compete.",
    detail: "At high doses calcium and magnesium use overlapping transport, so mega-dosing both at once is less efficient.",
    advice: "Modest doses together are fine; if you take large amounts, split them across the day." },
  { a: "coq10", b: "ubiquinol", kind: "redundant", evidence: "strong",
    summary: "CoQ10 and ubiquinol are the same nutrient.",
    detail: "Ubiquinol is simply the reduced, active form of CoQ10 (ubiquinone), and your body interconverts the two, so taking both means paying twice for the same nutrient with no added benefit for most people.",
    advice: "Pick one. Ubiquinol is worth the higher price if you are over about 40 or absorb poorly; standard CoQ10 is perfectly effective and cheaper for younger people. Take either with a fat-containing meal, since absorption is much better with food." },
  { a: "omega3", b: "omega3-algae", kind: "redundant", evidence: "strong",
    summary: "Two omega-3 sources doing the same job.",
    detail: "Fish oil and algae oil both deliver the same active omega-3 fats, EPA and DHA (algae is in fact the original source fish get theirs from), so taking both just overlaps and adds cost without extra benefit for most people.",
    advice: "Choose one: fish oil is cheaper and usually higher in EPA, while algae oil is the vegan, fish-free option and is gentler on burping. Compare on the EPA/DHA dose, not the capsule count." },
  { a: "5-htp", b: "tryptophan", kind: "caution", evidence: "moderate",
    summary: "Both raise serotonin, combining is rarely needed.",
    detail: "5-HTP and L-tryptophan feed the same serotonin pathway at different steps (tryptophan converts to 5-HTP, which converts to serotonin), so taking both pushes serotonin from two directions. Combined with an SSRI, SNRI, MAOI, or other serotonergic drug, this raises the risk of serotonin excess.",
    advice: "Use one, not both, and keep the dose modest. If you take any antidepressant or a migraine medication that affects serotonin, do not add either without talking to your doctor first, given the risk of serotonin syndrome." },
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
    summary: "Two magnesium forms, usually one is enough.",
    detail: "Both are magnesium, just bound to different carriers: glycinate is gentle and calming and favours sleep and stress, while citrate draws water into the gut and is more laxative. Stacking both mainly adds elemental magnesium and digestive effects rather than new benefit.",
    advice: "Pick the form for your goal: glycinate at night for sleep and stress, citrate for occasional constipation. If you ever take both, keep the combined elemental magnesium sensible to avoid loose stools." },
  { a: "mag-glycinate", b: "mag-threonate", kind: "redundant", evidence: "moderate",
    summary: "Overlapping magnesium forms.",
    detail: "Threonate is marketed for cognition because it may raise brain magnesium, while glycinate is favoured for sleep and stress, but both simply raise your total magnesium and rarely need to be combined.",
    advice: "Choose one based on your main goal to avoid overshooting your intake. If cognition is the priority, threonate; for sleep and calm, glycinate is the cheaper, well-absorbed choice." },
  { a: "omega3", b: "ginkgo", kind: "caution", evidence: "moderate",
    summary: "Both can thin the blood.",
    detail: "Both have mild anti-platelet activity: omega-3 fats subtly reduce platelet aggregation, and ginkgo can do the same through its terpenoids. Alone at normal doses this is rarely an issue, but combined, and especially alongside aspirin, warfarin, or other anticoagulants, the effects can add up and raise bleeding risk.",
    advice: "For most healthy people, normal doses together are fine. If you take blood thinners or antiplatelet drugs, have a bleeding disorder, or have surgery or a dental procedure coming up, clear it with your doctor first and consider pausing both beforehand." },
  { a: "omega3", b: "nattokinase", kind: "caution", evidence: "moderate",
    summary: "Compounded blood-thinning effect.",
    detail: "Nattokinase is a fibrinolytic enzyme that breaks down fibrin and can reduce clot formation, while omega-3 is mildly anti-platelet. Stacked, the two act on different parts of clotting and can meaningfully shift the balance toward bleeding, particularly at higher nattokinase doses.",
    advice: "Do not combine these without medical guidance if you take anticoagulant or antiplatelet medication, have a clotting disorder, or are approaching surgery. For others, keep doses modest and stop before any procedure that carries a bleeding risk." },
  { a: "berberine", b: "chromium", kind: "synergy", evidence: "moderate",
    summary: "Both support healthy blood sugar.",
    detail: "Berberine improves insulin signalling and chromium supports glucose metabolism, complementary mechanisms.",
    advice: "Reasonable to pair for metabolic support. Monitor closely if you take diabetes medication." },
  { a: "mag-glycinate", b: "d3k2", kind: "synergy", evidence: "moderate",
    summary: "Magnesium helps your body use vitamin D.",
    detail: "The enzymes that activate vitamin D depend on magnesium, so adequate magnesium helps D3 work properly.",
    advice: "A good foundational pairing, take D3+K2 in the morning and magnesium in the evening." },
  { a: "curcumin", b: "omega3", kind: "synergy", evidence: "moderate",
    summary: "Complementary anti-inflammatory effects.",
    detail: "Curcumin and omega-3 dampen inflammation through different pathways, which can add up.",
    advice: "Safe, common combination for joint and recovery support." },
  { a: "green-tea", b: "iron", kind: "timing", evidence: "moderate",
    summary: "Green tea tannins inhibit iron absorption.",
    detail: "Polyphenols in green tea bind non-heme iron and reduce how much you absorb.",
    advice: "Keep green tea and iron at least 1-2 hours apart." },
  { a: "l-theanine", b: "green-tea", kind: "synergy", evidence: "moderate",
    summary: "Calm, focused energy together.",
    detail: "Green tea naturally contains both caffeine and L-theanine; adding extra L-theanine raises that ratio so the amino acid smooths the stimulation, giving alert, calm focus with fewer jitters and less of a crash.",
    advice: "A classic calm-focus pairing, fine to take together in the morning or early afternoon. A common ratio is roughly 2:1 theanine to caffeine; keep it earlier in the day to protect sleep." },
  { a: "zinc", b: "vit-c", kind: "synergy", evidence: "moderate",
    summary: "Immune-support pairing.",
    detail: "Zinc and vitamin C support different parts of immune function and are commonly combined, especially at the first sign of a cold.",
    advice: "Safe together; take zinc with food to avoid nausea." },
  { a: "ashwagandha", b: "melatonin", kind: "synergy", evidence: "moderate",
    summary: "Both support sleep, different ways.",
    detail: "Ashwagandha lowers cortisol/stress while melatonin cues sleep timing, complementary for sleep onset.",
    advice: "Reasonable evening pairing. Start melatonin low (0.5-1 mg)." },
  { a: "selenium", b: "iodine", kind: "synergy", evidence: "moderate",
    summary: "Thyroid pairing, but balance matters.",
    detail: "Both are needed for thyroid hormone production and conversion; selenium also protects the thyroid when iodine is supplemented.",
    advice: "Useful together for thyroid support, but don't mega-dose iodine, check with a clinician if you have thyroid disease." },

  // ── Mineral timing / competition ─────────────────────────────────────────
  { a: "iron", b: "mag-glycinate", kind: "timing", evidence: "moderate", summary: "Iron and magnesium can compete for absorption.", detail: "Both are divalent minerals that share transport, so large doses together reduce uptake of each.", advice: "Take iron in the morning and magnesium in the evening." },
  { a: "calcium", b: "zinc", kind: "timing", evidence: "moderate", summary: "Calcium blunts zinc absorption.", detail: "High-dose calcium competes with zinc in the gut.", advice: "Separate them by ~2 hours if you take large doses of both." },
  { a: "iron", b: "psyllium", kind: "timing", evidence: "moderate", summary: "Fibre can bind iron.", detail: "Soluble fibre like psyllium can trap minerals and slow absorption.", advice: "Take iron away from psyllium and other fibre supplements." },
  { a: "zinc", b: "mag-glycinate", kind: "timing", evidence: "emerging", summary: "Best taken a little apart at high doses.", detail: "Both minerals can compete when taken together in large amounts (though ZMA combines them at balanced doses).", advice: "Balanced doses together are fine; otherwise space them." },

  // ── B-vitamin / methylation synergies ────────────────────────────────────
  { a: "methylfolate", b: "b12", kind: "synergy", evidence: "strong", summary: "Folate and B12 work as a pair.", detail: "Folate and B12 work as a pair in methylation and red-blood-cell formation, each recycling the other. Crucially, supplementing folate alone can correct the anemia of a B12 deficiency while the nerve damage quietly progresses, which is why they are tested and taken together.", advice: "Take them together, easiest as a methylated B-complex. If you are vegan, over 50, or on metformin, prioritise B12 and have levels checked rather than relying on folate alone." },
  { a: "vit-b6", b: "methylfolate", kind: "synergy", evidence: "strong", summary: "Team players for homocysteine.", detail: "B6, folate and B12 together lower homocysteine more than any alone.", advice: "Combine them, ideally as a methylated B-complex." },
  { a: "vit-b6", b: "b12", kind: "synergy", evidence: "moderate", summary: "Nerve and energy support together.", detail: "Both are central to nerve function and energy metabolism.", advice: "Fine together; a B-complex is the simplest way." },
  { a: "tmg", b: "b-complex", kind: "synergy", evidence: "moderate", summary: "Both support methylation.", detail: "TMG and B-vitamins donate and recycle methyl groups, helping keep homocysteine in check.", advice: "Reasonable to combine for methylation support." },
  { a: "5-htp", b: "vit-b6", kind: "synergy", evidence: "moderate", summary: "B6 helps convert 5-HTP to serotonin.", detail: "The enzyme that turns 5-HTP into serotonin depends on vitamin B6.", advice: "Taking B6 alongside 5-HTP supports the conversion." },
  { a: "tryptophan", b: "vit-b6", kind: "synergy", evidence: "moderate", summary: "B6 aids tryptophan metabolism.", detail: "B6 is a cofactor in converting tryptophan toward serotonin.", advice: "Pairing is sensible; avoid stacking with other serotonin boosters." },
  { a: "iron", b: "b12", kind: "synergy", evidence: "moderate", summary: "Both build healthy red blood cells.", detail: "Iron and B12 address different causes of anaemia and fatigue.", advice: "Fine together, though take iron away from calcium/tea." },
  { a: "multivit", b: "b-complex", kind: "redundant", evidence: "moderate", summary: "Overlapping B vitamins.", detail: "A multivitamin already contains B vitamins, so adding a B-complex doubles up.", advice: "Use one, a B-complex only if you specifically need higher B doses." },
  { a: "multivit", b: "biotin", kind: "redundant", evidence: "moderate", summary: "Your multi likely has biotin.", detail: "Most multivitamins include biotin, making a separate one redundant for most people.", advice: "Add standalone biotin only for a specific hair/nail goal." },

  // ── Mitochondrial / energy synergies ─────────────────────────────────────
  { a: "coq10", b: "pqq", kind: "synergy", evidence: "moderate", summary: "Mitochondrial duo.", detail: "CoQ10 supports existing mitochondria while PQQ may promote new ones, complementary.", advice: "Common, well-tolerated pairing for energy and aging." },
  { a: "ala", b: "acetyl-l-carnitine", kind: "synergy", evidence: "moderate", summary: "Classic mitochondrial pairing.", detail: "ALCAR shuttles fat into mitochondria; ALA is a mitochondrial antioxidant, studied together for energy and cognition.", advice: "Reasonable to combine." },
  { a: "acetyl-l-carnitine", b: "l-carnitine", kind: "redundant", evidence: "strong", summary: "Two forms of carnitine.", detail: "ALCAR is simply acetylated L-carnitine, so both raise your carnitine levels; the difference is that ALCAR crosses into the brain more readily, while plain L-carnitine is geared toward muscle and exercise.", advice: "Pick one for your goal: ALCAR for cognition and focus, L-carnitine for general energy and exercise. Taking both mostly duplicates the carnitine pool." },
  { a: "coq10", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Heart-health pairing.", detail: "CoQ10 supports cellular energy in heart muscle; omega-3 supports rhythm and triglycerides.", advice: "Common cardiovascular combination." },
  { a: "ubiquinol", b: "pqq", kind: "synergy", evidence: "moderate", summary: "Mitochondrial support.", detail: "Same rationale as CoQ10 + PQQ, with the more bioavailable ubiquinol form.", advice: "Fine together." },

  // ── Antioxidant recycling ────────────────────────────────────────────────
  { a: "vit-c", b: "vit-e", kind: "synergy", evidence: "moderate", summary: "They regenerate each other.", detail: "Vitamin C recycles oxidised vitamin E back to its active form.", advice: "A natural antioxidant pairing." },
  { a: "nac", b: "glycine", kind: "synergy", evidence: "emerging", summary: "GlyNAC, raises glutathione.", detail: "Glycine and NAC supply the building blocks of glutathione; together (GlyNAC) they raise it more than either alone.", advice: "Promising combination for antioxidant defence and aging." },
  { a: "nac", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "Precursor plus the finished product.", detail: "NAC is a glutathione precursor; taking both supports glutathione status.", advice: "Fine together, though NAC alone is often enough." },
  { a: "ala", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "ALA helps recycle glutathione.", detail: "Alpha-lipoic acid regenerates other antioxidants including glutathione.", advice: "Complementary antioxidant pairing." },
  { a: "vit-c", b: "glutathione", kind: "synergy", evidence: "moderate", summary: "Vitamin C spares glutathione.", detail: "Vitamin C helps keep glutathione in its active reduced form.", advice: "Reasonable antioxidant combination." },
  { a: "vit-e", b: "selenium", kind: "synergy", evidence: "moderate", summary: "Antioxidant teammates.", detail: "Selenium-dependent enzymes and vitamin E protect cells from oxidation in tandem.", advice: "Fine together at sensible doses." },
  { a: "omega3", b: "astaxanthin", kind: "synergy", evidence: "moderate", summary: "Astaxanthin protects omega-3s.", detail: "Astaxanthin is a potent antioxidant that helps prevent omega-3 fats from oxidising.", advice: "Good pairing, some fish-oil products already include it." },
  { a: "omega3", b: "vit-e", kind: "synergy", evidence: "emerging", summary: "Vitamin E guards omega-3s.", detail: "A little vitamin E helps keep polyunsaturated omega-3s from going rancid.", advice: "Fine; don't mega-dose vitamin E." },

  // ── Sleep / calm synergies ───────────────────────────────────────────────
  { a: "glycine", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Calming sleep pairing.", detail: "Both calm the nervous system and support sleep onset and quality.", advice: "Nice evening combination." },
  { a: "l-theanine", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Relaxation without sedation.", detail: "L-theanine promotes calm focus; magnesium relaxes muscles and the nervous system.", advice: "Good for winding down." },
  { a: "gaba", b: "l-theanine", kind: "synergy", evidence: "emerging", summary: "Calm-focus pairing.", detail: "Both promote relaxation and may improve sleep onset.", advice: "Commonly combined; effects are gentle." },
  { a: "melatonin", b: "mag-glycinate", kind: "synergy", evidence: "moderate", summary: "Sleep onset + relaxation.", detail: "Melatonin cues sleep timing; magnesium relaxes the body.", advice: "Start melatonin low (0.5-1 mg)." },
  { a: "valerian", b: "gaba", kind: "synergy", evidence: "emerging", summary: "Sedative pairing.", detail: "Both act on GABA pathways to promote sleep.", advice: "Use in the evening; can cause grogginess if overdone." },
  { a: "valerian", b: "passionflower", kind: "synergy", evidence: "moderate", summary: "Traditional sleep blend.", detail: "Often combined in sleep formulas for additive calming.", advice: "Evening use; avoid with sedatives/alcohol." },
  { a: "valerian", b: "lemon-balm", kind: "synergy", evidence: "moderate", summary: "Calming herbal pairing.", detail: "Lemon balm and valerian are traditionally combined for relaxation and sleep.", advice: "Gentle; take before bed." },
  { a: "magnolia-bark", b: "gaba", kind: "synergy", evidence: "emerging", summary: "Stress-and-sleep pairing.", detail: "Magnolia bark lowers cortisol and supports GABA tone.", advice: "Evening use for stress-driven sleeplessness." },
  { a: "ashwagandha", b: "l-theanine", kind: "synergy", evidence: "moderate", summary: "Daytime stress pairing.", detail: "Ashwagandha lowers stress hormones; L-theanine smooths anxious focus.", advice: "Works morning or evening." },
  { a: "ashwagandha", b: "magnolia-bark", kind: "synergy", evidence: "emerging", summary: "Cortisol-lowering pair.", detail: "Both target the stress/cortisol axis.", advice: "Good evening stress support." },

  // ── Serotonin / dopamine cautions ────────────────────────────────────────
  { a: "5-htp", b: "saffron", kind: "caution", evidence: "moderate", summary: "Both raise serotonin.", detail: "Both lift mood by increasing serotonin activity, 5-HTP as a direct serotonin precursor and saffron through serotonergic compounds. Stacking two serotonergic supplements makes the combined effect hard to dose and riskier alongside antidepressants.", advice: "Choose one rather than both. If you take an SSRI, SNRI, or other serotonergic medication, speak with your clinician before using either, as the combination can contribute to serotonin excess." },
  { a: "5-htp", b: "mucuna", kind: "caution", evidence: "emerging", summary: "Serotonin + dopamine push.", detail: "5-HTP raises serotonin while mucuna (a natural L-dopa source) raises dopamine, so combining them pushes two major neurotransmitters at once. The interaction is poorly studied, can feel intense, and is risky alongside mood or Parkinson's medication.", advice: "Approach this combination cautiously and only short-term, if at all. Avoid it entirely if you take antidepressants, MAOIs, or dopaminergic drugs, and check with your doctor first." },
  { a: "mucuna", b: "l-tyrosine", kind: "redundant", evidence: "moderate", summary: "Two dopamine precursors.", detail: "Both feed dopamine production via overlapping pathways.", advice: "Use one to avoid overshooting." },

  // ── Nootropic synergies ──────────────────────────────────────────────────
  { a: "alpha-gpc", b: "citicoline", kind: "redundant", evidence: "moderate", summary: "Two choline donors.", detail: "Both are choline donors that raise acetylcholine for focus and memory; citicoline also supplies uridine, while alpha-GPC delivers a higher percentage of choline by weight. Their core effect overlaps.", advice: "Pick one: citicoline for the added uridine and a smoother feel, alpha-GPC for a higher choline yield. Stacking both rarely adds noticeable benefit." },
  { a: "huperzine", b: "alpha-gpc", kind: "synergy", evidence: "emerging", summary: "Raise and preserve acetylcholine.", detail: "Alpha-GPC supplies choline; huperzine slows acetylcholine breakdown.", advice: "Cycle huperzine (don't take daily long-term); watch for headaches." },
  { a: "citicoline", b: "phosphatidylserine", kind: "synergy", evidence: "moderate", summary: "Membrane + acetylcholine support.", detail: "Complementary cognitive mechanisms.", advice: "Reasonable nootropic pairing." },
  { a: "bacopa", b: "lions-mane", kind: "synergy", evidence: "emerging", summary: "Memory + nerve growth.", detail: "Bacopa supports memory; lion's mane supports nerve-growth factor, different angles on cognition.", advice: "Both need weeks of consistent use." },
  { a: "lions-mane", b: "alpha-gpc", kind: "synergy", evidence: "emerging", summary: "Nootropic stack.", detail: "Nerve-growth support plus acetylcholine fuel.", advice: "Common focus combination." },
  { a: "phosphatidylserine", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Brain-membrane pairing.", detail: "Both are key structural fats for neuronal membranes.", advice: "Good for cognition and mood." },
  { a: "choline", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Brain-building pair.", detail: "Choline and DHA are both critical for brain-cell membranes (and fetal brain development).", advice: "Especially relevant in pregnancy (with clinician guidance)." },
  { a: "l-tyrosine", b: "green-tea", kind: "synergy", evidence: "emerging", summary: "Focus under stress.", detail: "Tyrosine supports dopamine/noradrenaline; green tea adds calm-focus caffeine + theanine.", advice: "Good daytime focus pairing." },
  { a: "bacopa", b: "ginkgo", kind: "synergy", evidence: "emerging", summary: "Memory + circulation.", detail: "Bacopa supports memory consolidation; ginkgo supports cerebral blood flow.", advice: "Note ginkgo's mild blood-thinning if you take anticoagulants." },

  // ── Performance / muscle ─────────────────────────────────────────────────
  { a: "creatine", b: "beta-alanine", kind: "synergy", evidence: "strong", summary: "Strength plus endurance, different systems.", detail: "These target different systems: creatine restores the ATP-phosphocreatine energy pathway for short, powerful efforts, while beta-alanine raises muscle carnosine to buffer the acid that builds during sustained high-intensity work. That is why so many pre-workouts bundle them.", advice: "A staple performance pairing, safe to take daily. Both work by saturating muscle over weeks, so take them consistently rather than only on training days; beta-alanine's harmless skin tingling can be reduced by splitting the dose." },
  { a: "creatine", b: "hmb", kind: "synergy", evidence: "moderate", summary: "Build and protect muscle.", detail: "Creatine supports strength gains; HMB reduces muscle breakdown.", advice: "Useful together, especially in a deficit or for older adults." },
  { a: "creatine", b: "whey-isolate", kind: "synergy", evidence: "strong", summary: "Classic muscle-building combo.", detail: "These cover different bases: whey supplies the amino acids that are the raw material for muscle repair, while creatine improves training performance and cell hydration so you can train harder and recover. Together they are the most evidence-backed muscle-building pair.", advice: "A classic, safe daily combination. Take about 3 to 5 g creatine consistently (timing matters little) and enough protein to hit your daily target; post-workout is a convenient time for both." },
  { a: "l-citrulline", b: "beetroot", kind: "synergy", evidence: "moderate", summary: "Nitric-oxide 'pump' pairing.", detail: "Both raise nitric oxide for blood flow via different routes (citrulline → arginine; beetroot nitrates).", advice: "Common pre-workout stack." },
  { a: "l-citrulline", b: "l-arginine", kind: "redundant", evidence: "strong", summary: "Citrulline raises arginine anyway.", detail: "L-citrulline converts to L-arginine in the kidneys and raises blood arginine more reliably than arginine taken directly, because oral arginine is largely broken down in the gut first. So pairing them adds little.", advice: "Use citrulline (around 6 to 8 g pre-workout); adding separate arginine on top gives little extra. Save the money and the pill count for a single effective dose." },
  { a: "beetroot", b: "l-arginine", kind: "synergy", evidence: "emerging", summary: "Blood-flow pairing.", detail: "Nitrates plus an NO precursor support vasodilation.", advice: "Fine pre-workout." },
  { a: "beta-alanine", b: "taurine", kind: "timing", evidence: "emerging", summary: "They compete for uptake.", detail: "Beta-alanine and taurine share a transporter, so very high doses together may compete.", advice: "Minor, separate large doses if you take both." },
  { a: "bcaa", b: "eaa", kind: "redundant", evidence: "strong", summary: "EAAs already contain BCAAs.", detail: "Essential amino acids (EAAs) already include the three branched-chain amino acids plus the rest of the essentials your body needs to actually build muscle protein. BCAAs alone provide only part of that set.", advice: "Choose EAAs, they are the more complete option for muscle protein synthesis. Separate BCAAs add cost without advantage if you already take EAAs or enough total protein." },
  { a: "whey-isolate", b: "bcaa", kind: "redundant", evidence: "strong", summary: "Whey is already rich in BCAAs.", detail: "A whey shake already delivers more BCAAs than a typical BCAA serving, plus all the other essential amino acids needed for muscle repair. Adding standalone BCAAs on top is largely redundant.", advice: "If you take whey, skip separate BCAAs and put the budget toward total daily protein. BCAAs are mainly useful when training fasted without any protein source nearby." },
  { a: "whey-isolate", b: "plant-protein", kind: "redundant", evidence: "moderate", summary: "Two protein sources.", detail: "Both serve the same role; choice is about diet and digestion.", advice: "Pick one based on dietary preference." },
  { a: "creatine", b: "taurine", kind: "synergy", evidence: "emerging", summary: "Cell hydration + performance.", detail: "Both are cell-volumising and support exercise performance.", advice: "Fine together." },
  { a: "tart-cherry", b: "omega3", kind: "synergy", evidence: "moderate", summary: "Recovery pairing.", detail: "Both lower exercise-induced inflammation and soreness.", advice: "Good post-training combination." },

  // ── Joint / skin / beauty ────────────────────────────────────────────────
  { a: "glucosamine", b: "msm", kind: "synergy", evidence: "moderate", summary: "Joint-support staple.", detail: "Glucosamine supports cartilage; MSM supports connective tissue and comfort.", advice: "Frequently combined for joints." },
  { a: "glucosamine", b: "boswellia", kind: "synergy", evidence: "moderate", summary: "Structure + anti-inflammatory.", detail: "Glucosamine targets cartilage; boswellia calms joint inflammation.", advice: "Reasonable joint stack." },
  { a: "boswellia", b: "curcumin", kind: "synergy", evidence: "moderate", summary: "Anti-inflammatory pair.", detail: "Different anti-inflammatory pathways for joint comfort.", advice: "Common joint/recovery combination." },
  { a: "curcumin", b: "ginger", kind: "synergy", evidence: "moderate", summary: "Anti-inflammatory roots.", detail: "Turmeric and ginger have complementary anti-inflammatory and digestive effects.", advice: "Safe culinary-derived pairing." },
  { a: "collagen", b: "vit-c", kind: "synergy", evidence: "strong", summary: "Vitamin C is required to build collagen.", detail: "Vitamin C is a required cofactor for the enzymes that cross-link collagen, so without enough of it your body cannot build collagen properly no matter how much you supplement. Pairing them supports skin, joints, tendons, and bone.", advice: "Take collagen (typically 10 to 15 g) together with vitamin C, either as a supplement or a vitamin-C-rich food. Consistent daily use over 8 to 12 weeks is what tends to show results in skin and joint studies." },
  { a: "collagen", b: "hyaluronic-acid", kind: "synergy", evidence: "moderate", summary: "Skin-hydration pairing.", detail: "Collagen supports skin structure; hyaluronic acid supports hydration.", advice: "Popular beauty combination." },
  { a: "collagen", b: "silica", kind: "synergy", evidence: "emerging", summary: "Skin, hair and nails.", detail: "Silica supports collagen formation and connective tissue.", advice: "Reasonable beauty pairing." },
  { a: "collagen", b: "biotin", kind: "synergy", evidence: "emerging", summary: "Hair and nail support.", detail: "Collagen supports the matrix; biotin supports keratin.", advice: "Common beauty combination." },
  { a: "lutein", b: "astaxanthin", kind: "synergy", evidence: "moderate", summary: "Eye-protection pairing.", detail: "Both are carotenoid antioxidants concentrating in eye tissue.", advice: "Good for screen-heavy lifestyles." },
  { a: "lutein", b: "bilberry", kind: "synergy", evidence: "emerging", summary: "Vision support.", detail: "Lutein protects the macula; bilberry supports retinal blood flow.", advice: "Reasonable eye-health combination." },

  // ── Gut ──────────────────────────────────────────────────────────────────
  { a: "probiotic", b: "inulin", kind: "synergy", evidence: "moderate", summary: "Synbiotic, probiotic + its food.", detail: "Inulin is a prebiotic fibre that feeds beneficial bacteria.", advice: "Classic gut pairing; introduce inulin slowly to avoid gas." },
  { a: "probiotic", b: "s-boulardii", kind: "synergy", evidence: "moderate", summary: "Bacteria + beneficial yeast.", detail: "S. boulardii is a yeast that complements bacterial probiotics, especially during/after antibiotics.", advice: "Fine together." },
  { a: "probiotic", b: "psyllium", kind: "synergy", evidence: "emerging", summary: "Probiotic + fibre.", detail: "Fibre supports a healthy microbiome alongside probiotics.", advice: "Drink plenty of water with psyllium." },
  { a: "zinc-carnosine", b: "dgl", kind: "synergy", evidence: "emerging", summary: "Gut-lining soothers.", detail: "Both support the stomach/gut lining via different mechanisms.", advice: "Common gut-repair pairing." },
  { a: "l-glutamine", b: "zinc-carnosine", kind: "synergy", evidence: "emerging", summary: "Gut-lining support.", detail: "Glutamine fuels gut cells; zinc-carnosine supports the mucosa.", advice: "Reasonable gut-repair combination." },
  { a: "digestive-enzymes", b: "probiotic", kind: "synergy", evidence: "emerging", summary: "Digestion + microbiome.", detail: "Enzymes aid breakdown of food; probiotics support the gut flora.", advice: "Fine together." },

  // ── Heart / metabolic ────────────────────────────────────────────────────
  { a: "red-yeast-rice", b: "coq10", kind: "synergy", evidence: "moderate", summary: "Red yeast rice can lower CoQ10.", detail: "Like statins, red yeast rice's monacolin K can deplete CoQ10.", advice: "Pairing CoQ10 with red yeast rice is commonly recommended." },
  { a: "red-yeast-rice", b: "vit-b3", kind: "caution", evidence: "moderate", summary: "Two lipid agents on the liver.", detail: "Red yeast rice contains monacolin K, chemically the same as the statin lovastatin, and high-dose niacin (vitamin B3) is itself a lipid-lowering agent. Both are processed by the liver and together can raise liver enzymes and, rarely, cause muscle problems.", advice: "Do not stack these without medical supervision and periodic liver-enzyme and muscle monitoring. If you are already on a statin, treat red yeast rice as a duplicate and avoid adding it." },
  { a: "red-yeast-rice", b: "bergamot", kind: "synergy", evidence: "emerging", summary: "Complementary cholesterol support.", detail: "Different mechanisms for lowering LDL.", advice: "Discuss with your doctor, especially if also on a statin." },
  { a: "berberine", b: "red-yeast-rice", kind: "synergy", evidence: "emerging", summary: "Lipid + glucose support.", detail: "Berberine and red yeast rice both support cardiometabolic markers via different routes.", advice: "Monitor with a clinician if on medication." },
  { a: "berberine", b: "ala", kind: "synergy", evidence: "moderate", summary: "Blood-sugar pairing.", detail: "Both support insulin sensitivity and glucose handling.", advice: "Watch closely if you take diabetes medication." },
  { a: "berberine", b: "milk-thistle", kind: "synergy", evidence: "emerging", summary: "Metabolic + liver support.", detail: "Milk thistle may also improve berberine's absorption.", advice: "Reasonable metabolic combination." },
  { a: "omega3", b: "bergamot", kind: "synergy", evidence: "emerging", summary: "Lipid-support pairing.", detail: "Omega-3 lowers triglycerides; bergamot supports LDL/cholesterol.", advice: "Complementary heart support." },
  { a: "hawthorn", b: "coq10", kind: "synergy", evidence: "emerging", summary: "Heart-function pairing.", detail: "Both are traditionally used to support heart-muscle energy and function.", advice: "Check with a clinician if you take heart medication." },
  { a: "chromium", b: "ala", kind: "synergy", evidence: "moderate", summary: "Glucose-metabolism pair.", detail: "Chromium and alpha-lipoic acid both support insulin sensitivity.", advice: "Useful for metabolic support; monitor if medicated." },

  // ── Bleeding cautions ────────────────────────────────────────────────────
  { a: "ginkgo", b: "nattokinase", kind: "caution", evidence: "moderate", summary: "Compounded blood-thinning effect.", detail: "Both reduce clotting through complementary routes, ginkgo by inhibiting platelet aggregation and nattokinase by breaking down fibrin. Together, or on top of an anticoagulant, the combined effect can push bleeding risk higher than either alone.", advice: "Avoid pairing these without a clinician's sign-off, especially if you take blood thinners, have a bleeding disorder, or have surgery scheduled. Stop both well before any procedure." },
  { a: "ginkgo", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Both can thin the blood.", detail: "Ginkgo inhibits platelet aggregation and aged garlic has its own mild anti-platelet and blood-pressure-lowering effect, so the two can gently compound each other's thinning action.", advice: "Generally fine for healthy people at culinary or standard supplement doses. Use caution, and check with your doctor, if you take anticoagulants, have a bleeding disorder, or are heading into surgery." },
  { a: "nattokinase", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Stacked clot effects.", detail: "Nattokinase breaks down fibrin while garlic is mildly anti-platelet, so combining them stacks two different clot-reducing mechanisms and can raise bleeding risk, particularly with anticoagulant medication.", advice: "Avoid combining if you take blood thinners or have a bleeding disorder, and pause both before surgery. Otherwise keep doses moderate and watch for easy bruising or prolonged bleeding." },
  { a: "omega3", b: "aged-garlic", kind: "caution", evidence: "moderate", summary: "Mild additive thinning.", detail: "Both gently reduce platelet stickiness, omega-3 through its fatty acids and garlic through organosulfur compounds, so together they have a mild additive blood-thinning effect.", advice: "Fine for most people at normal doses and even helpful for heart health. Be cautious, and involve your doctor, if you are on blood thinners, have a clotting disorder, or have a procedure coming up." },

  // ── Adaptogen / stimulant cautions ───────────────────────────────────────
  { a: "rhodiola", b: "panax-ginseng", kind: "caution", evidence: "moderate", summary: "Two stimulating adaptogens.", detail: "Both rhodiola and panax ginseng are stimulating adaptogens that raise energy and alertness, so taken together they may overstimulate, cause jitteriness, or disrupt sleep, especially later in the day or at higher doses.", advice: "Take either one in the morning, start with low doses, and consider using just one rather than both. Avoid taking them in the afternoon or evening." },
  { a: "panax-ginseng", b: "theacrine", kind: "caution", evidence: "emerging", summary: "Stacked stimulation.", detail: "Both are stimulating: panax ginseng is an energising adaptogen and theacrine is a caffeine-like compound that raises alertness and focus. Taken together, especially later in the day, the combined stimulation can cause jitteriness, a faster heart rate, or trouble sleeping.", advice: "Keep this pairing to the morning and start with low doses of each. Watch your total daily stimulant load, including coffee and pre-workouts, and skip it if you are caffeine-sensitive or have a heart-rhythm concern." },
  { a: "theacrine", b: "green-tea", kind: "caution", evidence: "emerging", summary: "Layered stimulants.", detail: "Theacrine is a caffeine-like stimulant and green tea also contains caffeine, so stacking them adds to your total stimulant load and can tip you into jitteriness, anxiety, or disrupted sleep, particularly in slow caffeine metabolisers.", advice: "Mind your total daily caffeine across all sources. Take both earlier in the day, start low, and avoid the pairing in the afternoon or evening, or if you are caffeine-sensitive or pregnant." },
  { a: "rhodiola", b: "theacrine", kind: "caution", evidence: "emerging", summary: "Energising stack.", detail: "Rhodiola is an energising adaptogen and theacrine is a caffeine-like stimulant, so together they lift energy and focus from two directions and can easily overshoot into restlessness or poor sleep.", advice: "Use them in the morning only and begin with low doses. Consider whether you need both; if you keep the pair, account for any other caffeine you take that day." },

  // ── NAD+ / longevity ─────────────────────────────────────────────────────
  { a: "nmn", b: "nr", kind: "redundant", evidence: "moderate", summary: "Two NAD+ precursors.", detail: "NMN and NR are both NAD+ precursors that feed into the same salvage pathway to raise NAD+, so running both at once is largely overlapping and an expensive way to do one job.", advice: "Choose one rather than paying for both. NR has more human safety data; NMN is popular and well tolerated. Whichever you pick, consistency over months matters more than stacking." },
  { a: "resveratrol", b: "pterostilbene", kind: "redundant", evidence: "moderate", summary: "Pterostilbene is methylated resveratrol.", detail: "Pterostilbene is essentially a methylated version of resveratrol with the same family of effects but better absorption and a longer half-life, so the two heavily overlap.", advice: "Use one: pterostilbene for bioavailability, resveratrol for cost (and take resveratrol with fat to absorb it). Stacking both adds little beyond what one provides." },
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
  { a: "tongkat-ali", b: "ashwagandha", kind: "synergy", evidence: "moderate", summary: "Testosterone + cortisol.", detail: "Tongkat ali supports androgens; ashwagandha lowers cortisol, complementary.", advice: "Common men's-vitality stack." },
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
  { a: "d3k2", b: "calcium", kind: "synergy", evidence: "strong", summary: "Vitamin D drives calcium absorption.", detail: "Vitamin D3 increases how much calcium you absorb from the gut, and vitamin K2 activates the proteins that steer that calcium into bone and away from arteries, so the three work as a bone-health team rather than calcium alone.", advice: "A sensible bone-health combination, take D3+K2 with a meal containing fat. Do not over-supplement calcium; food-first is best, and high isolated calcium without K2 and D is the pattern to avoid." },
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

/** Unique on-page copy length (summary + detail + advice), in words. */
export function interactionWordCount(it: Interaction): number {
  return `${it.summary} ${it.detail} ${it.advice}`.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Single source of truth for "is this interaction page substantive enough to
 * index?". Used by BOTH the page noindex gate and the sitemap so they cannot
 * drift (the QA audit caught the sitemap submitting noindexed pages).
 */
export const INTERACTION_MIN_WORDS = 60;
export function interactionIndexable(it: Interaction): boolean {
  return interactionWordCount(it) >= INTERACTION_MIN_WORDS;
}
