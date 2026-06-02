/**
 * Symptom & deficiency dataset, powers the programmatic /symptoms/[slug] pages
 * ("supplements for [symptom]", "[symptom] and which nutrients to check").
 *
 * This is the top-of-funnel pillar: large, low-competition, non-brand demand
 * that routes to the quiz, the bloodwork tool, and ingredient guides.
 *
 * Hard YMYL guardrail: every entry frames nutrients as "commonly associated
 * with" a symptom, never as a diagnosis or treatment. `redFlags` always tells
 * the reader when to see a clinician. nutrients[] are SUPPLEMENT_DB ids and
 * biomarkers[] are BIOMARKERS keys, so links resolve to real pages.
 */

export type SymptomCategory =
  | "energy" | "cognitive" | "sleep" | "mood-stress" | "hair-skin-nails"
  | "muscle-joint" | "immune" | "digestive" | "heart-circulation" | "hormonal" | "bone";

export interface SymptomInfo {
  label: string;            // display name
  category: SymptomCategory;
  summary: string;          // answer-first verdict
  detail: string;           // why these nutrients are linked (mechanism)
  nutrients: string[];      // SUPPLEMENT_DB ids, most-associated first
  biomarkers: string[];     // BIOMARKERS keys worth checking
  redFlags: string;         // when to see a clinician
  lifestyle?: string;       // non-supplement levers
}

export const CATEGORY_META: Record<SymptomCategory, { label: string; hue: string; bg: string }> = {
  "energy":          { label: "Energy & fatigue",     hue: "#b5751e", bg: "#fffbeb" },
  "cognitive":       { label: "Focus & memory",       hue: "#0e7490", bg: "#ecfeff" },
  "sleep":           { label: "Sleep",                hue: "#3f4f7a", bg: "#eef1fb" },
  "mood-stress":     { label: "Mood & stress",        hue: "#6b4fc7", bg: "#f4f1ff" },
  "hair-skin-nails": { label: "Hair, skin & nails",   hue: "#c2410c", bg: "#fdebe1" },
  "muscle-joint":    { label: "Muscle & joints",      hue: "#3f7a52", bg: "#f0f9f3" },
  "immune":          { label: "Immunity",             hue: "#b91c1c", bg: "#fef2f2" },
  "digestive":       { label: "Digestion",            hue: "#4d7c0f", bg: "#f3faea" },
  "heart-circulation": { label: "Heart & circulation", hue: "#be123c", bg: "#fff1f3" },
  "hormonal":        { label: "Hormones & libido",    hue: "#a16207", bg: "#fefce8" },
  "bone":            { label: "Bone health",          hue: "#6b7280", bg: "#f3f4f6" },
};

export const SYMPTOMS: Record<string, SymptomInfo> = {
  // ── Energy ────────────────────────────────────────────────────────────────
  "fatigue": { label: "Fatigue and low energy", category: "energy",
    summary: "Persistent fatigue is most often linked to low iron, vitamin B12, vitamin D, or an underactive thyroid, the first things worth checking before reaching for a stimulant.",
    detail: "Iron and B12 are needed to carry oxygen and produce energy inside your cells, so a shortfall in either is a classic cause of tiredness, especially in menstruating women, vegans, and older adults. Low vitamin D and low thyroid hormone also commonly show up as flat, heavy fatigue, and magnesium supports the energy-producing steps inside the cell.",
    nutrients: ["iron", "b12", "d3k2", "mag-glycinate", "methylfolate"],
    biomarkers: ["ferritin", "b12", "vitamin_d", "tsh", "hba1c"],
    redFlags: "See a doctor if fatigue is severe, sudden, or comes with weight loss, breathlessness, a racing heart, or feeling faint, since these can signal anaemia, thyroid disease, or other conditions that need testing, not a supplement.",
    lifestyle: "Sleep, daylight, hydration, and steady meals move energy more than any pill; treat supplements as a fix for a measured shortfall." },

  "tired-after-sleeping": { label: "Tired even after a full night's sleep", category: "energy",
    summary: "Feeling unrefreshed despite enough sleep often points to low iron, vitamin D, B12, or a thyroid or blood-sugar issue rather than a sleep-quantity problem.",
    detail: "If you sleep enough hours but still wake exhausted, the cause is frequently metabolic rather than behavioural: low ferritin (iron stores), low vitamin D, or an underactive thyroid all blunt daytime energy, and CoQ10 supports the mitochondria that produce it. Poor sleep quality from undiagnosed sleep apnoea is also common and is not fixed by supplements.",
    nutrients: ["iron", "d3k2", "b12", "mag-glycinate", "coq10"],
    biomarkers: ["ferritin", "vitamin_d", "tsh", "b12"],
    redFlags: "If you snore loudly, stop breathing in your sleep, or feel sleepy enough to nod off during the day, ask your doctor about sleep apnoea and thyroid testing rather than self-treating.",
    lifestyle: "A consistent wake time, morning daylight, and limiting alcohol and late screens improve sleep quality more than supplements." },

  "afternoon-energy-crash": { label: "Afternoon energy crash", category: "energy",
    summary: "A mid-afternoon slump is usually a blood-sugar swing; chromium, magnesium, and B vitamins support steadier glucose handling alongside better meals.",
    detail: "The classic 2pm crash often follows a high-carbohydrate lunch that spikes then drops blood sugar. Chromium and magnesium support how insulin moves glucose into cells, and B vitamins are central to turning food into energy, so a shortfall can worsen the dip, though the meal itself is the main lever.",
    nutrients: ["chromium", "mag-glycinate", "b-complex", "ala"],
    biomarkers: ["glucose_fasting", "hba1c"],
    redFlags: "Frequent shakiness, sweating, or near-fainting between meals warrants a doctor's review for blood-sugar problems rather than a supplement.",
    lifestyle: "Add protein and fibre to lunch, walk for 10 minutes after eating, and you will often blunt the crash without anything else." },

  "low-stamina": { label: "Low stamina and exercise fatigue", category: "energy",
    summary: "Tiring quickly during exercise is commonly linked to low iron stores; iron, CoQ10, and creatine support oxygen delivery and energy output.",
    detail: "Even without full anaemia, low ferritin reduces how much oxygen your blood carries to working muscle, which shows up first as breathlessness and early fatigue on exertion, especially in athletes and menstruating women. CoQ10 fuels mitochondrial energy and creatine supports short, powerful efforts.",
    nutrients: ["iron", "coq10", "creatine", "b12", "beetroot"],
    biomarkers: ["ferritin", "b12"],
    redFlags: "Unusual breathlessness, chest tightness, or a racing heart during light activity should be checked by a doctor before you train through it.",
    lifestyle: "Pair iron-rich foods with vitamin C, and build training volume gradually so fatigue is conditioning, not a deficiency." },

  // ── Cognitive ─────────────────────────────────────────────────────────────
  "brain-fog": { label: "Brain fog", category: "cognitive",
    summary: "Brain fog is commonly associated with low vitamin B12, iron, vitamin D, or omega-3, and with thyroid and blood-sugar problems.",
    detail: "B12 and iron shortfalls slow the brain's oxygen and energy supply and are among the most common nutritional causes of a foggy, slow-thinking feeling. Low vitamin D and the omega-3 DHA, a core structural fat in the brain, are also linked to poorer mental clarity, and an underactive thyroid or swings in blood sugar can mimic the same symptom.",
    nutrients: ["b12", "iron", "d3k2", "omega3", "mag-threonate"],
    biomarkers: ["b12", "ferritin", "vitamin_d", "tsh", "hs_crp"],
    redFlags: "Get medical advice if brain fog is sudden, worsening, or comes with confusion, numbness, severe headaches, or trouble speaking, which need prompt assessment.",
    lifestyle: "Sleep, hydration, lowering alcohol, and managing stress are first-line; nutrients help when one is genuinely low." },

  "poor-concentration": { label: "Poor concentration", category: "cognitive",
    summary: "Trouble focusing is often linked to low iron, B12, or omega-3; these support the brain chemistry and oxygen supply that attention depends on.",
    detail: "Iron is needed to make dopamine, the focus-and-motivation neurotransmitter, so low ferritin commonly shows up as distractibility and difficulty sustaining attention. Omega-3 supports neuronal membranes, and L-tyrosine is the raw material for dopamine that can be depleted under stress and heavy mental load.",
    nutrients: ["iron", "omega3", "b12", "l-tyrosine", "l-theanine"],
    biomarkers: ["ferritin", "b12"],
    redFlags: "Long-standing, significant attention problems are worth discussing with a clinician, who can assess for ADHD, thyroid, sleep, or mood causes rather than nutrition alone.",
    lifestyle: "Single-tasking, sleep, and cutting afternoon caffeine often help focus more than any supplement." },

  "memory-problems": { label: "Memory problems and forgetfulness", category: "cognitive",
    summary: "Everyday forgetfulness is linked to low B12, omega-3, and vitamin D; raised homocysteine is a checkable marker tied to memory in older adults.",
    detail: "B12, folate, and B6 keep homocysteine in check, and a raised homocysteine is associated with faster memory decline, which is why it is worth testing. The omega-3 DHA is a structural brain fat, and lion's mane and bacopa are studied for memory support, though both build over weeks.",
    nutrients: ["b12", "omega3", "methylfolate", "lions-mane", "bacopa"],
    biomarkers: ["b12", "folate", "homocysteine", "vitamin_d"],
    redFlags: "Memory loss that disrupts daily life, gets clearly worse, or involves getting lost or losing words needs a medical assessment, not a supplement.",
    lifestyle: "Sleep, exercise, social engagement, and managing blood pressure have the strongest evidence for protecting memory." },

  // ── Sleep ─────────────────────────────────────────────────────────────────
  "trouble-sleeping": { label: "Trouble falling asleep", category: "sleep",
    summary: "Difficulty falling asleep is commonly eased by magnesium glycinate, glycine, and a low dose of melatonin, alongside a consistent wind-down.",
    detail: "Magnesium relaxes muscle and a wired nervous system, glycine gently lowers core body temperature to cue sleep, and melatonin is a timing signal that shortens how long it takes to drop off. L-theanine takes the edge off racing, anxious thoughts at bedtime.",
    nutrients: ["mag-glycinate", "glycine", "melatonin", "l-theanine"],
    biomarkers: ["magnesium", "vitamin_d"],
    redFlags: "See a doctor if insomnia is persistent, or comes with low mood, loud snoring, or daytime sleepiness, since these point to causes supplements will not fix.",
    lifestyle: "A fixed wake time, morning light, a cool dark room, and no screens or caffeine late are the foundation; supplements assist, they do not replace it." },

  "waking-at-night": { label: "Waking up during the night", category: "sleep",
    summary: "Frequent night waking is often linked to low magnesium and stress; magnesium glycinate and glycine support deeper, less broken sleep.",
    detail: "Magnesium calms the nervous system and supports the GABA pathway that keeps you asleep, and many people who wake repeatedly are low in it. Glycine improves sleep quality, and an evening of high cortisol from stress is a common non-nutritional cause of 3am waking that adaptogens like ashwagandha can help blunt over time.",
    nutrients: ["mag-glycinate", "glycine", "ashwagandha"],
    biomarkers: ["magnesium"],
    redFlags: "Waking gasping or choking, or a partner noticing you stop breathing, needs a sleep-apnoea assessment from a doctor.",
    lifestyle: "Avoid alcohol near bed (it fragments sleep), keep the room cool, and address evening stress." },

  "restless-legs": { label: "Restless legs at night", category: "sleep",
    summary: "Restless legs are strongly linked to low iron stores; checking ferritin and correcting low iron is the first and most effective step, with magnesium as support.",
    detail: "Low ferritin is one of the best-established nutritional causes of restless legs syndrome, because iron is needed for the dopamine signalling that controls limb movement, and symptoms often improve when ferritin is raised above the lab's bare minimum. Magnesium may help muscle relaxation alongside.",
    nutrients: ["iron", "mag-glycinate"],
    biomarkers: ["ferritin", "iron"],
    redFlags: "Restless legs that disrupt sleep are worth a doctor's visit to check ferritin (aim is usually well above the lab floor) and review any medications that can trigger it.",
    lifestyle: "Cutting evening caffeine and alcohol and gentle stretching can reduce symptoms." },

  // ── Mood & stress ─────────────────────────────────────────────────────────
  "low-mood": { label: "Low mood", category: "mood-stress",
    summary: "Low mood is commonly associated with low vitamin D, omega-3, B12, and folate; these support the brain chemistry behind mood regulation.",
    detail: "Vitamin D receptors sit throughout the brain and low levels are repeatedly linked to low mood, especially in darker months. The omega-3 EPA is the form studied for mood, and B12 and folate are needed to make serotonin and to keep homocysteine, which is associated with depression, in range.",
    nutrients: ["d3k2", "omega3", "b12", "methylfolate", "saffron"],
    biomarkers: ["vitamin_d", "b12", "folate", "homocysteine"],
    redFlags: "If low mood lasts more than two weeks, affects daily life, or includes thoughts of self-harm, contact a doctor or a crisis line now. Supplements are not a substitute for care.",
    lifestyle: "Daylight, exercise, sleep, and social connection have strong evidence for mood and pair well with addressing any deficiency." },

  "anxiety": { label: "Anxiety and feeling on edge", category: "mood-stress",
    summary: "Feeling anxious and tense is commonly supported by magnesium, L-theanine, and ashwagandha, which calm an over-active stress response.",
    detail: "Magnesium regulates the nervous system and the stress hormone response, and a shortfall is associated with greater anxiety. L-theanine raises calming alpha brain-wave activity within an hour, and ashwagandha lowers cortisol over weeks of daily use, which is why it suits ongoing stress.",
    nutrients: ["mag-glycinate", "l-theanine", "ashwagandha"],
    biomarkers: ["magnesium"],
    redFlags: "Panic attacks, anxiety that limits your life, or physical symptoms like chest pain deserve a clinician's assessment; do not rely on supplements for a clinical anxiety disorder.",
    lifestyle: "Cutting caffeine, breathing practice, exercise, and sleep are first-line and often do more than any supplement." },

  "high-stress": { label: "Feeling constantly stressed", category: "mood-stress",
    summary: "Chronic stress is supported by ashwagandha, magnesium, and L-theanine, which blunt cortisol and ease the body's stress response.",
    detail: "Sustained stress keeps cortisol elevated and burns through magnesium, creating a loop that worsens tension and sleep. Ashwagandha is the best-studied adaptogen for lowering cortisol and perceived stress over weeks, magnesium calms the nervous system, and rhodiola helps with stress-related fatigue.",
    nutrients: ["ashwagandha", "mag-glycinate", "l-theanine", "rhodiola"],
    biomarkers: ["magnesium"],
    redFlags: "If stress is tipping into burnout, persistent low mood, or physical illness, treat it as a health issue and involve a clinician, not just a supplement.",
    lifestyle: "Boundaries, sleep, exercise, and reducing stimulants address the source; adaptogens support the body while you do." },

  "seasonal-low-mood": { label: "Seasonal low mood (winter blues)", category: "mood-stress",
    summary: "Mood and energy that dip in the darker months are strongly linked to low vitamin D; testing and correcting it is the key step.",
    detail: "Vitamin D is made in the skin from sunlight, so levels fall in winter at higher latitudes exactly when seasonal low mood appears, and the two are repeatedly linked. Omega-3 supports mood through the year, and morning light exposure is a powerful non-supplement lever.",
    nutrients: ["d3k2", "omega3"],
    biomarkers: ["vitamin_d"],
    redFlags: "If winter low mood is severe or recurs every year and affects your functioning, ask a doctor about seasonal affective disorder and light therapy.",
    lifestyle: "Get outside in the morning, use a light box if needed, and keep exercise and social plans through winter." },

  // ── Hair, skin & nails ────────────────────────────────────────────────────
  "hair-loss": { label: "Hair loss and thinning hair", category: "hair-skin-nails",
    summary: "Diffuse hair shedding is commonly linked to low iron, low vitamin D, low zinc, or a thyroid problem; these are worth checking before blaming biotin.",
    detail: "Low ferritin is one of the most common reversible causes of diffuse hair thinning, particularly in women, and low vitamin D, zinc, and thyroid hormone are all associated with shedding. Biotin only helps in the rare case of a true biotin shortfall, so testing the others first is smarter.",
    nutrients: ["iron", "d3k2", "zinc", "biotin", "collagen"],
    biomarkers: ["ferritin", "vitamin_d", "zinc", "tsh"],
    redFlags: "Patchy hair loss, a receding pattern, scalp scarring, or sudden heavy shedding should be assessed by a doctor or dermatologist, since the cause and treatment differ.",
    lifestyle: "Enough protein, gentle hair handling, and treating the underlying deficiency matter more than any single hair pill. Important: pause high-dose biotin before blood tests, as it can skew them." },

  "brittle-nails": { label: "Brittle, weak nails", category: "hair-skin-nails",
    summary: "Nails that split and peel are commonly linked to low iron and, in a true shortfall, low biotin; collagen and zinc support nail structure.",
    detail: "Iron deficiency can make nails thin, brittle, or spoon-shaped, so ferritin is worth checking. Biotin has the most evidence specifically for brittle nails of any supplement, and collagen and zinc support the keratin matrix nails are built from.",
    nutrients: ["biotin", "iron", "collagen", "zinc"],
    biomarkers: ["ferritin"],
    redFlags: "Sudden nail changes, pitting, colour changes, or separation from the nail bed can reflect thyroid, psoriasis, or fungal causes and deserve a clinician's look.",
    lifestyle: "Limit harsh detergents and water exposure, keep nails moisturised, and give any supplement 3 to 6 months, since nails grow slowly." },

  "dry-skin": { label: "Dry, dull skin", category: "hair-skin-nails",
    summary: "Persistently dry skin is supported by omega-3, vitamin D, and vitamin C; these support the skin barrier and collagen it depends on.",
    detail: "Omega-3 fats are part of the skin's barrier that holds water in, so a low intake is linked to dryness and inflammation. Vitamin C is required to build collagen, and low vitamin D is associated with several skin conditions, while collagen peptides support the skin matrix over weeks.",
    nutrients: ["omega3", "d3k2", "vit-c", "collagen"],
    biomarkers: ["vitamin_d"],
    redFlags: "Itchy, scaly, or spreading rashes, or dryness that resists moisturiser, should be seen by a doctor or dermatologist.",
    lifestyle: "A fragrance-free moisturiser, shorter warm (not hot) showers, and hydration do more for the barrier than supplements alone." },

  "acne": { label: "Acne and breakouts", category: "hair-skin-nails",
    summary: "Adult breakouts may be supported by zinc and omega-3, which have mild evidence for reducing inflammatory acne, alongside proper skincare.",
    detail: "Zinc has anti-inflammatory and oil-regulating effects and has modest evidence for reducing inflammatory acne, and omega-3 may help calm the inflammation behind breakouts. These are supportive, not a replacement for dermatologist-led treatment when acne is moderate or scarring.",
    nutrients: ["zinc", "omega3"],
    biomarkers: ["zinc"],
    redFlags: "Moderate to severe, painful, or scarring acne should be treated by a doctor or dermatologist, as effective prescription options exist that supplements cannot match.",
    lifestyle: "A gentle, consistent routine and not over-washing usually help; take zinc with food to avoid nausea." },

  "slow-wound-healing": { label: "Slow wound healing", category: "hair-skin-nails",
    summary: "Cuts and bruises that heal slowly are commonly linked to low zinc, low vitamin C, or inadequate protein, all essential for tissue repair.",
    detail: "Zinc and vitamin C are required to build new tissue and collagen, so a shortfall slows healing and is more common in older adults and those eating little fresh food. Adequate protein supplies the raw material, and poorly controlled blood sugar also delays healing.",
    nutrients: ["zinc", "vit-c", "collagen"],
    biomarkers: ["zinc", "hba1c"],
    redFlags: "Wounds that will not heal, spread, or look infected, especially with diabetes, need prompt medical care.",
    lifestyle: "Enough protein and fresh fruit and vegetables, plus good blood-sugar control, support repair." },

  // ── Muscle & joints ───────────────────────────────────────────────────────
  "muscle-cramps": { label: "Muscle cramps", category: "muscle-joint",
    summary: "Recurrent muscle cramps are commonly linked to low magnesium, with potassium and vitamin D as supporting factors and hydration as the first check.",
    detail: "Magnesium is central to muscle relaxation, so a shortfall is a classic cause of night cramps and twitches. Low potassium and dehydration also trigger cramps, and low vitamin D is associated with muscle aches, though most exercise cramps are about fluid and electrolytes rather than a deficiency.",
    nutrients: ["mag-glycinate", "d3k2"],
    biomarkers: ["magnesium", "vitamin_d"],
    redFlags: "Cramps with significant weakness, swelling, dark urine, or that are severe and persistent should be checked by a doctor.",
    lifestyle: "Hydrate, replace electrolytes around hard exercise, and stretch; magnesium glycinate at night helps many people." },

  "muscle-twitches": { label: "Muscle twitches and eyelid spasms", category: "muscle-joint",
    summary: "Small, repetitive muscle twitches are most commonly linked to low magnesium, along with stress, caffeine, and poor sleep.",
    detail: "Magnesium stabilises nerve and muscle excitability, so a shortfall can cause the harmless flickering twitches many people get in the eyelid or calf. Excess caffeine, stress, and tiredness amplify them, and they usually settle once magnesium and rest improve.",
    nutrients: ["mag-glycinate"],
    biomarkers: ["magnesium"],
    redFlags: "Twitching that spreads, comes with weakness or muscle wasting, or persists for weeks should be assessed by a doctor.",
    lifestyle: "Cut back caffeine, improve sleep, and trial magnesium glycinate; most benign twitches resolve." },

  "muscle-weakness": { label: "Muscle weakness", category: "muscle-joint",
    summary: "Generalised muscle weakness is commonly linked to low vitamin D and low magnesium, and sometimes to thyroid problems, all worth checking.",
    detail: "Vitamin D is needed for muscle function and low levels are associated with weakness and aching, particularly in older adults. Magnesium supports muscle contraction, and an under- or over-active thyroid can also cause weakness, so testing helps separate a nutrient cause from another one.",
    nutrients: ["d3k2", "mag-glycinate", "creatine"],
    biomarkers: ["vitamin_d", "tsh"],
    redFlags: "Weakness that is sudden, one-sided, progressive, or affects breathing or swallowing is a medical emergency, seek care immediately.",
    lifestyle: "Resistance exercise and enough protein build strength; correct any deficiency alongside." },

  "joint-pain": { label: "Joint pain and stiffness", category: "muscle-joint",
    summary: "Aching joints are supported by omega-3 and curcumin (anti-inflammatory) and by collagen and glucosamine for the joint structure itself.",
    detail: "Omega-3 and curcumin calm inflammation through different pathways and have reasonable evidence for joint comfort, while collagen and glucosamine support cartilage and connective tissue over weeks. Low vitamin D is also associated with musculoskeletal aches.",
    nutrients: ["omega3", "curcumin", "collagen", "glucosamine", "d3k2"],
    biomarkers: ["vitamin_d", "hs_crp"],
    redFlags: "A hot, swollen, red joint, joint pain with fever, or rapidly worsening pain needs prompt medical assessment.",
    lifestyle: "Movement, strength work, and weight management protect joints; give supplements 8 to 12 weeks." },

  "slow-recovery": { label: "Slow recovery after exercise", category: "muscle-joint",
    summary: "Lingering soreness and slow recovery are supported by protein, omega-3, magnesium, and creatine, which aid repair and reduce inflammation.",
    detail: "Total daily protein is the biggest lever for muscle repair, while omega-3 and tart cherry lower exercise-induced inflammation and soreness. Magnesium supports muscle relaxation and sleep (when most recovery happens), and creatine improves the capacity to train and recover.",
    nutrients: ["whey-isolate", "omega3", "mag-glycinate", "creatine", "tart-cherry"],
    biomarkers: ["vitamin_d", "ferritin"],
    redFlags: "Recovery that keeps worsening, or severe soreness with very dark urine after hard exercise, should be checked by a doctor.",
    lifestyle: "Sleep, protein, and sensible training progression do most of the work; supplements fine-tune it." },

  // ── Immunity ──────────────────────────────────────────────────────────────
  "frequent-colds": { label: "Frequent colds and low immunity", category: "immune",
    summary: "Catching colds often is commonly linked to low vitamin D and zinc; vitamin C and elderberry support the immune response at onset.",
    detail: "Vitamin D and zinc are both essential for immune-cell function, and low levels are associated with more frequent and longer infections. Zinc taken at the first sign of a cold can shorten it, vitamin C supports barrier and white-cell function, and elderberry is used at onset.",
    nutrients: ["d3k2", "zinc", "vit-c", "elderberry"],
    biomarkers: ["vitamin_d", "zinc"],
    redFlags: "Recurrent severe infections, infections that will not clear, or unexplained fevers and weight loss need a medical work-up, not just supplements.",
    lifestyle: "Sleep, stress management, and hand hygiene have real effects; take zinc with food and only short-term at high doses." },

  // ── Digestion ─────────────────────────────────────────────────────────────
  "bloating": { label: "Bloating and gas", category: "digestive",
    summary: "Frequent bloating is supported by a probiotic, digestive enzymes, and ginger, alongside identifying trigger foods.",
    detail: "Bloating often reflects how gut bacteria ferment certain foods, so a probiotic can help balance the microbiome and digestive enzymes can aid the breakdown of meals. Ginger supports stomach emptying and eases discomfort, while a low-FODMAP trial often pinpoints the real triggers.",
    nutrients: ["probiotic", "digestive-enzymes", "ginger"],
    biomarkers: [],
    redFlags: "Bloating with weight loss, blood in stool, persistent pain, or a change in bowel habits that lasts weeks needs a doctor's assessment.",
    lifestyle: "Eat slowly, identify trigger foods, and introduce fibre gradually; chronic bloating deserves a proper look." },

  "constipation": { label: "Constipation", category: "digestive",
    summary: "Constipation is commonly eased by magnesium citrate and psyllium fibre, with a probiotic supporting longer-term regularity, plus water and movement.",
    detail: "Magnesium citrate draws water into the gut to soften stool and is a gentle, effective option, while psyllium adds the bulk that fibre-poor diets lack. A probiotic can improve transit over time, but fluid, fibre from food, and daily movement are the foundation.",
    nutrients: ["mag-citrate", "psyllium", "probiotic"],
    biomarkers: ["tsh"],
    redFlags: "New constipation in mid-life, blood in stool, unexplained weight loss, or alternating constipation and diarrhoea should be investigated by a doctor.",
    lifestyle: "Water, fibre-rich foods, daily walking, and a consistent toilet routine usually resolve everyday constipation." },

  "poor-digestion": { label: "Poor digestion and indigestion", category: "digestive",
    summary: "Feeling heavy or uncomfortable after meals is supported by digestive enzymes, a probiotic, and DGL for the stomach lining.",
    detail: "Digestive enzymes help break food into absorbable pieces and can ease the post-meal heaviness some people feel, especially with age as natural enzyme output falls. A probiotic supports the microbiome, and DGL (a licorice extract) soothes the stomach lining in reflux-type discomfort.",
    nutrients: ["digestive-enzymes", "probiotic", "dgl", "ginger"],
    biomarkers: [],
    redFlags: "Persistent indigestion, difficulty swallowing, vomiting, or pain that wakes you needs a doctor's assessment rather than self-treatment.",
    lifestyle: "Smaller, slower meals, less alcohol and late eating, and managing stress improve digestion." },

  // ── Heart & circulation ───────────────────────────────────────────────────
  "cold-hands-feet": { label: "Cold hands and feet", category: "heart-circulation",
    summary: "Persistently cold hands and feet can be linked to low iron or a thyroid problem; iron and omega-3 support oxygen delivery and circulation.",
    detail: "Low ferritin reduces oxygen-carrying capacity and can leave the extremities cold, and an underactive thyroid slows metabolism and circulation, both worth checking. Omega-3 supports healthy blood flow, though cold extremities are often simply poor circulation or Raynaud's.",
    nutrients: ["iron", "omega3"],
    biomarkers: ["ferritin", "tsh"],
    redFlags: "Fingers or toes that turn white then blue, or cold limbs with pain or skin changes, should be reviewed by a doctor.",
    lifestyle: "Stay warm, keep moving, and limit nicotine, which constricts blood vessels." },

  "high-cholesterol": { label: "High cholesterol", category: "heart-circulation",
    summary: "To support a healthy lipid profile, omega-3 lowers triglycerides and bergamot and berberine are studied for LDL; this is support alongside, not instead of, medical care.",
    detail: "Omega-3 fish oil reliably lowers triglycerides, while bergamot and berberine have evidence for nudging LDL and total cholesterol down through different routes. These are adjuncts: if your cholesterol is high enough to need treatment, that is a decision for your doctor, and red yeast rice is effectively a low-dose statin that must be used under supervision.",
    nutrients: ["omega3", "bergamot", "berberine", "red-yeast-rice"],
    biomarkers: ["ldl", "total_cholesterol", "triglycerides", "hdl"],
    redFlags: "Cholesterol management is a medical decision, especially if you have other heart-disease risk factors. Do not stop or replace prescribed medication with supplements, and do not combine red yeast rice with a statin.",
    lifestyle: "Diet (more fibre and unsaturated fat, less refined carbohydrate), exercise, and not smoking move lipids more than most supplements." },

  "palpitations": { label: "Heart palpitations", category: "heart-circulation",
    summary: "Occasional benign palpitations can be linked to low magnesium and to caffeine and stress; magnesium supports a steady heart rhythm, but palpitations always merit a check.",
    detail: "Magnesium and potassium help regulate the heart's electrical activity, and a magnesium shortfall is associated with extra beats, which is why deficiency is worth excluding. Caffeine, alcohol, stress, and an overactive thyroid are common triggers of harmless palpitations.",
    nutrients: ["mag-glycinate"],
    biomarkers: ["magnesium", "tsh"],
    redFlags: "Palpitations with chest pain, breathlessness, fainting, or that are fast and sustained are an emergency. Even occasional palpitations should be mentioned to a doctor to rule out a rhythm or thyroid problem.",
    lifestyle: "Reduce caffeine and alcohol, manage stress, and sleep well; see a doctor to be safe." },

  // ── Hormones & libido ─────────────────────────────────────────────────────
  "low-libido": { label: "Low libido", category: "hormonal",
    summary: "Low sex drive can be supported by zinc, ashwagandha, and maca, and in men by tongkat ali, alongside checking testosterone and thyroid.",
    detail: "Zinc is needed to make testosterone and a shortfall lowers it, ashwagandha can improve libido partly by lowering stress, and maca is studied for sex drive without clearly changing hormones. In men, tongkat ali supports free testosterone, so checking testosterone and thyroid first makes sense.",
    nutrients: ["zinc", "ashwagandha", "maca", "tongkat-ali"],
    biomarkers: ["testosterone_total", "tsh", "vitamin_d"],
    redFlags: "A clear drop in libido, especially with fatigue, mood changes, or erectile problems, deserves a doctor's review and bloodwork rather than guesswork.",
    lifestyle: "Sleep, stress, relationship factors, alcohol, and certain medications affect libido strongly; address these alongside." },

  "low-testosterone-signs": { label: "Signs of low testosterone", category: "hormonal",
    summary: "Symptoms suggesting low testosterone are supported by zinc, vitamin D, ashwagandha, and boron, but the symptom is non-specific so a blood test is essential.",
    detail: "Zinc and vitamin D are both required for normal testosterone, and correcting a shortfall can restore levels, while ashwagandha and boron may give a modest nudge. Fatigue, low libido, and low mood overlap with many other causes, so a measured testosterone level is what separates a real deficiency from look-alikes.",
    nutrients: ["zinc", "d3k2", "ashwagandha", "boron", "tongkat-ali"],
    biomarkers: ["testosterone_total", "vitamin_d"],
    redFlags: "Do not self-diagnose low testosterone. Get it measured (ideally a morning sample) and reviewed by a doctor, who can find the cause and discuss real options.",
    lifestyle: "Sleep, strength training, fat loss if overweight, and limiting alcohol raise testosterone naturally and pair well with correcting a deficiency." },

  "pms": { label: "PMS symptoms", category: "hormonal",
    summary: "Premenstrual symptoms are supported by magnesium and vitamin B6, with evening primrose and chasteberry used for cyclical and mood symptoms.",
    detail: "Magnesium and vitamin B6 together have evidence for easing premenstrual mood and physical symptoms, evening primrose supplies GLA used for cyclical breast tenderness, and chasteberry acts on hormone signalling to support the luteal phase. Effects build over a few cycles.",
    nutrients: ["mag-glycinate", "vit-b6", "evening-primrose", "chasteberry"],
    biomarkers: [],
    redFlags: "Severe premenstrual mood symptoms (PMDD), or symptoms that disrupt your life, deserve a clinician's care. Avoid chasteberry in pregnancy or with hormonal medication without advice.",
    lifestyle: "Regular exercise, sleep, and limiting salt, caffeine, and alcohol around your period help; give supplements two to three cycles." },

  // ── Bone ──────────────────────────────────────────────────────────────────
  "weak-bones": { label: "Weak bones and bone health", category: "bone",
    summary: "Supporting bone strength centres on vitamin D, vitamin K2, magnesium, and adequate calcium, ideally from food, working as a team.",
    detail: "Vitamin D drives calcium absorption, vitamin K2 activates the proteins that steer calcium into bone and away from arteries, and magnesium is needed to use vitamin D, so the four work together rather than alone. Isolated high-dose calcium without D and K2 is the pattern to avoid.",
    nutrients: ["d3k2", "vit-k2", "mag-glycinate"],
    biomarkers: ["vitamin_d"],
    redFlags: "A fracture from a minor fall, loss of height, or known osteoporosis needs medical management and possibly a bone-density scan, not just supplements.",
    lifestyle: "Weight-bearing and resistance exercise, enough protein and dietary calcium, and not smoking protect bone density." },

  // ── Other / common ────────────────────────────────────────────────────────
  "tingling-numbness": { label: "Tingling and numbness in hands or feet", category: "cognitive",
    summary: "Pins and needles or numbness can be linked to low vitamin B12, and the link is important because B12 nerve damage can become permanent if missed.",
    detail: "B12 is essential for the protective sheath around nerves, so a deficiency classically causes tingling, numbness, or a pins-and-needles feeling in the hands and feet, often before any anaemia shows. Folate and B6 support the same nerve and methylation pathways, which is why B12 should be checked specifically.",
    nutrients: ["b12", "methylfolate", "vit-b6"],
    biomarkers: ["b12", "folate", "homocysteine"],
    redFlags: "New, spreading, or one-sided numbness or weakness needs urgent medical assessment. Persistent tingling should be checked, and B12 measured, before it is dismissed.",
    lifestyle: "If you are vegan, over 50, or on metformin or acid-blockers, your B12 risk is higher, so test rather than guess." },

  "headaches": { label: "Frequent headaches and migraines", category: "cognitive",
    summary: "Recurrent headaches and migraines are supported by magnesium, riboflavin (B2), and CoQ10, which have the best evidence among supplements for prevention.",
    detail: "Magnesium, high-dose riboflavin, and CoQ10 each have trial evidence for reducing migraine frequency and are recommended in some headache guidelines as preventives, working on the energy and excitability of brain cells. They are taken daily for prevention, not for an acute attack.",
    nutrients: ["mag-glycinate", "vit-b2", "coq10"],
    biomarkers: ["magnesium"],
    redFlags: "A sudden severe (thunderclap) headache, a headache with fever and stiff neck, or one with vision loss, weakness, or confusion is an emergency. New or changing headaches need a doctor.",
    lifestyle: "Regular sleep, meals, hydration, and identifying triggers reduce headaches; give preventive supplements two to three months." },

  "sugar-cravings": { label: "Sugar and carb cravings", category: "energy",
    summary: "Strong sugar cravings are supported by chromium and magnesium, which steady blood-sugar handling, alongside protein-forward meals.",
    detail: "Cravings often follow blood-sugar swings, and chromium supports how insulin clears glucose while magnesium is involved in insulin sensitivity, so a shortfall can worsen the cycle. The most powerful lever, though, is meals built around protein and fibre that keep glucose steady.",
    nutrients: ["chromium", "mag-glycinate"],
    biomarkers: ["glucose_fasting", "hba1c"],
    redFlags: "Intense thirst, frequent urination, and unexplained weight loss alongside cravings can signal diabetes and need a doctor's check.",
    lifestyle: "Protein at breakfast, fewer liquid sugars, sleep, and stress management cut cravings more than any supplement." },

  "dizziness": { label: "Dizziness and lightheadedness", category: "energy",
    summary: "Frequent lightheadedness can be linked to low iron or B12 (anaemia); checking ferritin and B12 is sensible, though many causes are not nutritional.",
    detail: "Anaemia from low iron or B12 reduces oxygen delivery and commonly causes lightheadedness, especially on standing, so those are worth measuring. That said, dehydration, blood-pressure changes, inner-ear problems, and medications are frequent non-nutritional causes.",
    nutrients: ["iron", "b12"],
    biomarkers: ["ferritin", "b12"],
    redFlags: "Dizziness with fainting, chest pain, severe headache, slurred speech, or that is sudden and spinning needs prompt medical care.",
    lifestyle: "Stand up slowly, stay hydrated, and review medications with a pharmacist; persistent dizziness needs a diagnosis." },

  "eye-strain": { label: "Eye strain and tired eyes", category: "cognitive",
    summary: "Screen-related eye strain and tired eyes are supported by lutein, zeaxanthin, and omega-3, which support the macula and tear film.",
    detail: "Lutein and zeaxanthin concentrate in the macula and filter blue light, and omega-3 supports the tear film that keeps eyes comfortable, so both are used for screen-heavy lifestyles. Astaxanthin is also studied for eye fatigue, though screen habits matter most.",
    nutrients: ["lutein", "omega3", "astaxanthin"],
    biomarkers: [],
    redFlags: "Eye pain, sudden vision changes, flashes, floaters, or persistent redness need an eye doctor promptly, not a supplement.",
    lifestyle: "Use the 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds), blink consciously, and adjust screen brightness." },
};

/** All ids that have a symptom page. */
export const SYMPTOM_SLUGS = Object.keys(SYMPTOMS);

export function symptomFor(slug: string): SymptomInfo | undefined {
  return SYMPTOMS[slug];
}

/** Unique on-page copy length, used as the index gate. */
export function symptomWordCount(s: SymptomInfo): number {
  return `${s.summary} ${s.detail} ${s.redFlags} ${s.lifestyle ?? ""}`.trim().split(/\s+/).filter(Boolean).length;
}

export const SYMPTOM_MIN_WORDS = 60;
export function symptomIndexable(s: SymptomInfo): boolean {
  return symptomWordCount(s) >= SYMPTOM_MIN_WORDS;
}
