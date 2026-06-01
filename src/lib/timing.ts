/**
 * Supplement timing dataset, powers the programmatic /timing/[slug] pages
 * ("best time to take X"). High-volume, buyer-adjacent, low-competition queries.
 *
 * Every entry is established, practical guidance keyed to an id that exists in
 * SUPPLEMENT_DB. Honest by design: we only publish a timing page where there is
 * a real, non-trivial answer (so no thin "take it whenever" filler).
 *
 * window = when in the day; drives grouping + the colored verdict chip.
 * food   = the one-line food rule. summary/detail/howTo = the on-page copy.
 */

export type TimingWindow =
  | "morning" | "evening" | "bedtime" | "with-meals" | "pre-workout" | "anytime" | "split";

export interface TimingInfo {
  window: TimingWindow;
  bestTime: string;   // short human label, e.g. "Morning, with a fatty meal"
  food: string;       // one-line food rule
  summary: string;    // answer-first verdict (one or two sentences)
  detail: string;     // why the timing matters (mechanism)
  howTo: string;      // practical: dose + when + with/without food
  avoid?: string;     // optional caution
}

export const WINDOW_META: Record<TimingWindow, { label: string; verdict: string; hue: string; bg: string }> = {
  "morning":     { label: "Best in the morning",   verdict: "Take in the morning",  hue: "#b5751e", bg: "#fffbeb" },
  "evening":     { label: "Best in the evening",   verdict: "Take in the evening",  hue: "#6b4fc7", bg: "#f4f1ff" },
  "bedtime":     { label: "Best before bed",       verdict: "Take before bed",      hue: "#3f4f7a", bg: "#eef1fb" },
  "with-meals":  { label: "Take with meals",       verdict: "Take with food",       hue: "#3f7a52", bg: "#f0f9f3" },
  "pre-workout": { label: "Take before training",  verdict: "Take pre-workout",     hue: "#b91c1c", bg: "#fef2f2" },
  "anytime":     { label: "Anytime, stay consistent", verdict: "Anytime",           hue: "#6b7280", bg: "#f3f4f6" },
  "split":       { label: "Split across the day",  verdict: "Split the dose",       hue: "#0e7490", bg: "#ecfeff" },
};

export const TIMING: Record<string, TimingInfo> = {
  "mag-glycinate": { window: "bedtime", bestTime: "Evening or before bed", food: "With or without food",
    summary: "Take magnesium glycinate in the evening, ideally 30 to 60 minutes before bed.",
    detail: "Magnesium glycinate is the calming, sleep-friendly form: it relaxes muscle and quiets an over-active nervous system, and the glycine it is bound to is itself mildly sedating. Because it is gentle and non-laxative, it does not need food and is easy to take last thing at night.",
    howTo: "Take 200 to 400 mg of elemental magnesium about 30 to 60 minutes before bed. It works with or without food. If you take a large iron or zinc dose, keep it a couple of hours apart, since high mineral doses can compete.",
    avoid: "No need to take it in the morning unless you are splitting a large dose." },

  "mag-threonate": { window: "evening", bestTime: "Evening", food: "With or without food",
    summary: "Take magnesium L-threonate in the evening; it is the form marketed for the brain.",
    detail: "Threonate is promoted for cognition because it may raise magnesium levels in the brain, and like other magnesium forms it is calming, which suits the end of the day. The dose is split across several capsules to deliver the studied amount.",
    howTo: "Take the labelled dose (often three capsules supplying around 140 to 145 mg elemental magnesium) in the evening. With or without food is fine.",
    avoid: "Taking it earlier is unnecessary and the calming effect is better used at night." },

  "mag-citrate": { window: "evening", bestTime: "Evening, with water", food: "With a full glass of water",
    summary: "Take magnesium citrate in the evening with plenty of water; it doubles as a gentle laxative.",
    detail: "Citrate draws water into the gut, which is why it relieves occasional constipation and why timing matters: an evening dose works overnight, and water helps it move things along comfortably.",
    howTo: "Take it in the evening with a full glass of water. Start with a modest dose and increase only if needed, since too much causes loose stools.",
    avoid: "For pure relaxation or sleep, glycinate is gentler on the gut than citrate." },

  "d3k2": { window: "morning", bestTime: "Morning, with a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take vitamin D3 and K2 with your largest fat-containing meal, usually in the morning.",
    detail: "Vitamins D3 and K2 are fat-soluble, so a meal containing fat dramatically improves how much you absorb. Many people take vitamin D earlier in the day because, for some, taking it late can interfere with sleep.",
    howTo: "Take it with breakfast or lunch if either contains fat (eggs, avocado, oily fish, full-fat dairy, nuts). A larger weekly dose with a fatty meal also works if daily dosing is hard to remember.",
    avoid: "Do not take it on an empty stomach or with a fat-free meal, you will absorb far less." },

  "vit-k2": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take vitamin K2 with a meal that contains fat, ideally alongside vitamin D3.",
    detail: "K2 is fat-soluble and works hand in hand with vitamin D and calcium, activating the proteins that steer calcium into bone and away from arteries. Food with fat is what unlocks its absorption.",
    howTo: "Take it with your main fatty meal, paired with D3 for convenience. Time of day matters little, the fat does.",
    avoid: "If you take a blood thinner like warfarin, do not start K2 without your doctor, as it interacts." },

  "vit-c": { window: "anytime", bestTime: "Anytime; split larger doses", food: "With or without food",
    summary: "Take vitamin C anytime; split doses above ~500 mg for better absorption.",
    detail: "Vitamin C is water-soluble and its absorption saturates, so smaller, split doses are used more efficiently than one large dose, which is mostly excreted. It does not need food, and taking it with iron actually boosts iron uptake.",
    howTo: "Keep single doses around 200 to 500 mg, or split a higher daily total into morning and evening. Take it alongside iron if you want to improve iron absorption.",
    avoid: "Very large single doses can cause loose stools and are largely wasted." },

  "vit-e": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take vitamin E with a meal that contains fat, and keep the dose modest.",
    detail: "Vitamin E is fat-soluble, so dietary fat is needed for proper absorption. It pairs naturally with vitamin C, which helps regenerate it.",
    howTo: "Take it with your main meal of the day. Choose mixed tocopherols and keep the dose modest, since high doses offer no benefit and can mildly thin the blood.",
    avoid: "Avoid high-dose vitamin E if you are on blood thinners or facing surgery." },

  "vit-a": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take vitamin A with a fat-containing meal; balance it with vitamins D and K.",
    detail: "Vitamin A is fat-soluble and absorbs best with dietary fat. It works in balance with vitamins D and K, so moderate doses beat mega-dosing any one of them.",
    howTo: "Take it with a meal containing fat. Keep the dose modest as part of a balanced fat-soluble vitamin intake.",
    avoid: "Avoid high-dose preformed vitamin A in pregnancy, where excess is harmful." },

  "b12": { window: "morning", bestTime: "Morning", food: "With or without food",
    summary: "Take vitamin B12 in the morning; it can be mildly energizing.",
    detail: "B12 is water-soluble and central to energy metabolism, so many people prefer it earlier in the day. Sublingual forms bypass the gut, which helps older adults and anyone with low stomach acid or on metformin.",
    howTo: "Take it in the morning, with or without food. A higher dose a few times a week also works, since the body stores B12.",
    avoid: "Some find B12 stimulating, so avoid taking it right before bed." },

  "b-complex": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take a B-complex in the morning with food.",
    detail: "B-complex contains B12 and B6, which can be energizing, so it suits the start of the day. Taking it with food reduces the mild nausea some people get on an empty stomach.",
    howTo: "Take it with breakfast. The harmless bright-yellow urine afterward is just excess riboflavin.",
    avoid: "Avoid late-day dosing if B vitamins leave you feeling wired." },

  "methylfolate": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take methylfolate in the morning with food, ideally alongside B12.",
    detail: "Methylfolate drives methylation and works as a pair with B12; some people feel subtly stimulated by it, so morning suits it best. Food softens any stomach upset.",
    howTo: "Take it with breakfast, paired with methyl-B12. If you have had a high homocysteine reading, recheck after a few months.",
    avoid: "Avoid taking it late if it feels activating." },

  "vit-b6": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take vitamin B6 with food, usually in the morning, and keep long-term doses modest.",
    detail: "B6 is water-soluble and supports nerves, mood, and the homocysteine pathway. It is well tolerated with food, but very high doses taken for a long time can cause nerve symptoms.",
    howTo: "Take it with a meal, morning or split. Keep long-term intake at or below about 100 mg per day unless a clinician directs otherwise.",
    avoid: "Do not megadose B6 for months at a time." },

  "vit-b3": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take niacinamide (B3) with food; the non-flush form avoids the niacin flush.",
    detail: "Niacinamide is the non-flushing form of vitamin B3 and is gentle with food. The other form, plain niacin, causes a harmless but uncomfortable warm flush, especially on an empty stomach.",
    howTo: "Take it with a meal. If you ever use flush-causing niacin for cholesterol, do so only under medical supervision.",
    avoid: "High-dose niacin plus other lipid agents can stress the liver, get medical guidance." },

  "biotin": { window: "anytime", bestTime: "Anytime", food: "With or without food",
    summary: "Take biotin anytime, but stop it 2 to 3 days before any blood test.",
    detail: "Biotin is water-soluble and well absorbed at any time, and benefits for hair and nails build over months, not days. The one real timing rule is about lab tests, not the body.",
    howTo: "Take it whenever is consistent for you. Crucially, pause high-dose biotin for 2 to 3 days before bloodwork and tell your doctor you take it.",
    avoid: "High-dose biotin can distort thyroid and heart (troponin) blood tests if not paused first." },

  "choline": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take choline with food; split larger doses to limit a fishy body odor.",
    detail: "Choline supports brain and liver function. Taking it with food aids tolerance, and splitting higher doses reduces the harmless but off-putting fishy smell some people notice at high intakes.",
    howTo: "Take it with meals, split across the day if your dose is high.",
    avoid: "Cut the dose if you notice a fishy body odor." },

  "multivit": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take a multivitamin in the morning with food.",
    detail: "A multivitamin mixes fat-soluble vitamins (which need dietary fat) with minerals (which can nauseate on an empty stomach), so a meal covers both. Morning suits the energizing B vitamins inside.",
    howTo: "Take it with breakfast. If your product is a two-a-day, split it between two meals as the label suggests.",
    avoid: "Avoid taking it on an empty stomach, which can cause nausea and waste the fat-soluble vitamins." },

  "iron": { window: "morning", bestTime: "Morning, empty stomach, with vitamin C", food: "Empty stomach, away from coffee, tea, dairy and calcium",
    summary: "Take iron in the morning on an empty stomach with vitamin C, away from coffee, tea, and calcium.",
    detail: "Iron absorbs best in an acidic, empty stomach, and vitamin C boosts uptake several-fold. Coffee, tea, dairy, calcium, and high-fibre foods all block it, so they must be kept apart from your iron dose.",
    howTo: "Take it with a small glass of orange juice or about 200 mg of vitamin C, 30 minutes before food. Keep coffee, tea, and calcium at least 2 hours away. Every-other-day dosing can actually absorb better and is gentler.",
    avoid: "If iron upsets your stomach, a gentle form like bisglycinate with a small low-calcium snack is a fair compromise." },

  "zinc": { window: "evening", bestTime: "Evening or between meals", food: "With a little food to avoid nausea",
    summary: "Take zinc with a small amount of food, ideally away from iron and calcium.",
    detail: "Zinc absorbs well on an empty stomach but often causes nausea, so a little food is the practical compromise. It competes with iron and copper, so high doses are best separated from them.",
    howTo: "Take up to about 40 mg per day with a light snack, separated from iron by a couple of hours. For colds, short-term use at the first sign is the typical approach.",
    avoid: "Do not take high-dose zinc long-term, it can deplete copper." },

  "selenium": { window: "anytime", bestTime: "Anytime, with food", food: "With food",
    summary: "Take selenium with food; the dose matters more than the time of day.",
    detail: "Selenium supports the thyroid and antioxidant enzymes, but it has a relatively narrow safe range, so the key is dose, not timing. Food reduces any stomach upset.",
    howTo: "Take around 100 to 200 mcg with a meal. A couple of Brazil nuts already supply a day's worth, so do not double up.",
    avoid: "Do not megadose selenium, too much is toxic." },

  "iodine": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take iodine in the morning with food, and do not mega-dose it.",
    detail: "Iodine is the raw material for thyroid hormone, and selenium helps the thyroid use it safely. The thyroid is sensitive, so a modest, consistent morning dose is the right approach.",
    howTo: "Take a modest dose with breakfast, ideally with adequate selenium. If you have thyroid disease, check with a clinician first.",
    avoid: "Excess iodine can paradoxically trigger thyroid problems." },

  "chromium": { window: "with-meals", bestTime: "With meals", food: "With food",
    summary: "Take chromium with meals to support blood-sugar handling.",
    detail: "Chromium helps insulin move glucose into cells, so taking it with the meals that raise blood sugar makes practical sense. Food also improves tolerance.",
    howTo: "Take it with one or two of your main meals. Monitor closely if you are on diabetes medication.",
    avoid: "Watch for low blood sugar if you combine it with glucose-lowering drugs." },

  "boron": { window: "anytime", bestTime: "Anytime, with food", food: "With food",
    summary: "Take a low dose of boron anytime, with food.",
    detail: "Boron supports bone, hormones, and vitamin D status at small doses, and may help the body hold onto active vitamin D a little longer. There is no benefit to high amounts, so timing is flexible and the dose is what matters.",
    howTo: "Take around 3 to 6 mg with a meal, at whatever time you will remember it. More is not better.",
    avoid: "Do not take large doses of boron." },

  "omega3": { window: "with-meals", bestTime: "With your largest fat-containing meal", food: "With a fat-containing meal",
    summary: "Take fish oil with your largest fat-containing meal to absorb more and avoid fishy burps.",
    detail: "Omega-3 fats are fat-soluble, so a fatty meal improves absorption, and food plus splitting the dose greatly reduces the fishy reflux and burping that put many people off. Time of day matters little.",
    howTo: "Take it with dinner or your biggest meal. Splitting the dose across two meals and keeping capsules in the freezer both cut burps.",
    avoid: "Avoid taking it on an empty stomach, which worsens fishy reflux and lowers absorption." },

  "omega3-algae": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take algae omega-3 with a fat-containing meal, the same as fish oil.",
    detail: "Algae oil delivers the same EPA and DHA as fish oil and is the vegan, fish-free option. Being fat-soluble, it absorbs best with dietary fat, and it tends to be gentler on burping.",
    howTo: "Take it with your main fatty meal. Compare products on EPA and DHA content, not capsule count.",
    avoid: "An empty stomach lowers absorption." },

  "dha-prenatal": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take prenatal DHA with a fat-containing meal, at whatever time you will remember it daily.",
    detail: "DHA is a fat-soluble omega-3 critical for fetal brain and eye development, so consistent daily intake with dietary fat matters more than the hour. Food also reduces fishy reflux during pregnancy.",
    howTo: "Take it with a meal containing fat, daily. Many take it with dinner. Follow your clinician's guidance during pregnancy.",
    avoid: "Skip it on an empty stomach if pregnancy reflux is an issue." },

  "evening-primrose": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take evening primrose oil with food; effects on cyclical symptoms build over weeks.",
    detail: "Evening primrose supplies the fatty acid GLA, which is fat-soluble and absorbs better with a meal. Benefits for cyclical or skin symptoms accumulate over time rather than working acutely.",
    howTo: "Take it with a meal, consistently, and give it several weeks to judge.",
    avoid: "Use caution alongside blood thinners or before surgery." },

  "creatine": { window: "anytime", bestTime: "Anytime, every day", food: "With or without food",
    summary: "Take creatine at any time of day; daily consistency matters far more than timing.",
    detail: "Creatine works by saturating your muscles over weeks, so the total taken each day is what counts, not the clock. Research shows only a tiny edge, if any, to taking it after training.",
    howTo: "Take 3 to 5 g every single day, including rest days. Pair it with a meal or a post-workout shake if that helps you remember. A loading phase is optional.",
    avoid: "Skipping doses, not timing, is what limits results." },

  "beta-alanine": { window: "split", bestTime: "Split across the day", food: "With food",
    summary: "Take beta-alanine any time, splitting the dose to reduce the harmless tingling.",
    detail: "Like creatine, beta-alanine works by building up in muscle over weeks, so daily total beats timing. Its only quirk is a harmless skin-tingling (paresthesia) after larger single doses, which splitting solves.",
    howTo: "Take 3 to 6 g per day, split into two or three smaller doses with food to minimise tingling.",
    avoid: "You do not need to take it right before training for it to work." },

  "l-citrulline": { window: "pre-workout", bestTime: "30 to 60 minutes pre-workout", food: "Empty stomach",
    summary: "Take L-citrulline 30 to 60 minutes before training on an empty stomach.",
    detail: "Citrulline raises nitric oxide and blood flow for the session ahead, so it is timed to peak during your workout. An empty stomach speeds absorption.",
    howTo: "Take 6 to 8 g of citrulline (or citrulline malate) about 30 to 60 minutes pre-workout.",
    avoid: "There is little point taking it on non-training days for performance." },

  "beetroot": { window: "pre-workout", bestTime: "2 to 3 hours pre-workout", food: "With or without food",
    summary: "Take beetroot 2 to 3 hours before exercise for the blood-flow benefit.",
    detail: "Beetroot supplies dietary nitrate that the body converts to nitric oxide, and blood nitrate peaks roughly 2 to 3 hours after intake, so it is timed earlier than most pre-workouts.",
    howTo: "Take it 2 to 3 hours before training, on its own or with l-citrulline. Pink urine or stool afterward is harmless.",
    avoid: "Taken right before training it may not have peaked yet." },

  "whey-isolate": { window: "anytime", bestTime: "Around workouts, or to hit your daily protein", food: "With or without food",
    summary: "Take whey isolate around training or whenever helps you reach your daily protein target.",
    detail: "Whey is a fast-absorbing complete protein, convenient after a workout, but the evidence is clear that total daily protein matters far more than the timing of any one shake.",
    howTo: "Use it post-workout or between meals to top up protein. Aim for your daily protein goal first; the exact timing is secondary.",
    avoid: "Do not obsess over an anabolic window, daily total is what drives results." },

  "bcaa": { window: "pre-workout", bestTime: "Around training (if training fasted)", food: "With or without food",
    summary: "Take BCAAs around training, mainly useful only if you train fasted.",
    detail: "BCAAs are most relevant when you work out without any protein nearby. If you already eat enough protein or use whey, they add little, since complete protein already supplies them.",
    howTo: "If training fasted, take them shortly before or during the session. Otherwise, put the budget toward total daily protein.",
    avoid: "They are largely redundant if you hit your protein target." },

  "ashwagandha": { window: "evening", bestTime: "Evening (or split AM and PM)", food: "With food",
    summary: "Take ashwagandha in the evening for stress and sleep; daily use is what builds the effect.",
    detail: "Ashwagandha lowers cortisol and the stress response, which suits the evening and supports sleep, though a standardised extract works taken morning or night. Its benefit accrues over weeks of consistent use, not from a single dose.",
    howTo: "Take 300 to 600 mg of a standardised extract (such as KSM-66) with food, in the evening, or split morning and evening. Give it 4 to 8 weeks.",
    avoid: "Check with a doctor first if you have thyroid disease, as it can affect thyroid levels." },

  "rhodiola": { window: "morning", bestTime: "Morning, empty stomach", food: "Empty stomach",
    summary: "Take rhodiola in the morning on an empty stomach; it is too stimulating for later in the day.",
    detail: "Rhodiola is an energizing adaptogen that fights fatigue and lifts alertness, so a late dose can disrupt sleep. An empty stomach absorbs it well.",
    howTo: "Take 200 to 400 mg of a standardised extract first thing in the morning, before food.",
    avoid: "Avoid afternoon or evening dosing, it can keep you awake." },

  "panax-ginseng": { window: "morning", bestTime: "Morning", food: "With or without food",
    summary: "Take Korean (Panax) ginseng in the morning; it is stimulating.",
    detail: "Panax ginseng is an energizing adaptogen that raises alertness, so morning suits it and late dosing can interfere with sleep. Many people cycle it.",
    howTo: "Take a standardised dose in the morning. Consider cycling (a few weeks on, a week off).",
    avoid: "Avoid late-day use, and do not stack it with other strong stimulants." },

  "holy-basil": { window: "anytime", bestTime: "Anytime, often evening for stress", food: "With or without food",
    summary: "Take holy basil (tulsi) consistently; many use it in the evening for stress.",
    detail: "Holy basil is a calming adaptogen used for stress and balance, so an evening dose suits stress-driven unwinding, though it is gentle enough for any time. Its effect builds with regular use.",
    howTo: "Take a standardised extract daily, evening if you want stress and sleep support.",
    avoid: "It may mildly lower blood sugar, monitor if you are diabetic." },

  "cordyceps": { window: "morning", bestTime: "Morning or pre-workout", food: "With or without food",
    summary: "Take cordyceps in the morning or before exercise for energy and stamina.",
    detail: "Cordyceps is used to support energy, oxygen use, and exercise performance, so morning or pre-workout timing fits its stimulating, endurance-oriented profile.",
    howTo: "Take it in the morning or 30 to 60 minutes before training, daily, since its stamina benefit builds with consistent use over a couple of weeks.",
    avoid: "Avoid late-evening doses if it feels energizing." },

  "reishi": { window: "bedtime", bestTime: "Evening or before bed", food: "With or without food",
    summary: "Take reishi in the evening; it is the calming, sleep-leaning mushroom.",
    detail: "Reishi is traditionally used for relaxation, stress, and sleep, which makes the evening its natural slot, unlike the more energizing cordyceps.",
    howTo: "Take it in the evening or before bed, consistently over weeks, as its calming effect builds gradually rather than acting like a fast sedative.",
    avoid: "It may add to blood thinners, use caution if you take them." },

  "saffron": { window: "anytime", bestTime: "Anytime, consistent daily", food: "With food",
    summary: "Take saffron at a consistent time each day; mood effects build over weeks.",
    detail: "Saffron supports mood through serotonergic activity, and trials dose it daily over weeks, so consistency matters more than the hour. Food aids tolerance.",
    howTo: "Take around 28 to 30 mg of a standardised extract daily, with food, at a time you will not forget.",
    avoid: "Do not combine it with antidepressants without medical advice, given its serotonin activity." },

  "l-theanine": { window: "anytime", bestTime: "Anytime; with caffeine or in the evening", food: "With or without food",
    summary: "Take L-theanine whenever you want calm focus: with coffee in the morning, or alone in the evening.",
    detail: "L-theanine promotes relaxed alertness without sedation and acts within 30 to 60 minutes, so it is flexible. Paired with caffeine it smooths the jitters; taken alone at night it helps you unwind.",
    howTo: "Take 100 to 200 mg with your morning coffee for calm focus, or in the evening to relax. A 2:1 theanine-to-caffeine ratio is common.",
    avoid: "It is non-sedating, so it will not knock you out like a sleep aid." },

  "glycine": { window: "bedtime", bestTime: "Before bed", food: "With or without food",
    summary: "Take glycine about 30 to 60 minutes before bed for sleep.",
    detail: "Glycine is a calming neurotransmitter that gently lowers core body temperature, a signal that helps you fall asleep and improves sleep quality, which is why a bedtime dose makes the most of it.",
    howTo: "Take around 3 g before bed. It dissolves easily in water and tastes slightly sweet, so it is easy to take last thing at night.",
    avoid: "There is little reason to take it in the morning." },

  "nac": { window: "morning", bestTime: "Morning, empty stomach (or with food if it upsets you)", food: "Best on an empty stomach",
    summary: "Take NAC on an empty stomach, often in the morning, away from any nitrate heart medication.",
    detail: "NAC is absorbed better fasted and is the precursor your body uses to make glutathione, its master antioxidant. Some people get mild stomach upset, in which case a little food helps.",
    howTo: "Take 600 to 1200 mg on an empty stomach, morning or split. Take it well apart from nitrate medications.",
    avoid: "Take it away from nitrate heart drugs, and check with a doctor if you take regular medication." },

  "taurine": { window: "anytime", bestTime: "Anytime; pre-workout or evening", food: "With or without food",
    summary: "Take taurine anytime; it suits pre-workout or the evening equally.",
    detail: "Taurine is well tolerated, cell-volumizing, and calming, so it works before training for performance or in the evening for relaxation. Timing is flexible.",
    howTo: "Take 1 to 3 g, pre-workout or in the evening, with or without food.",
    avoid: "At very high doses it shares a transporter with beta-alanine, so space large doses of both." },

  "l-tyrosine": { window: "morning", bestTime: "Morning, empty stomach, before demanding tasks", food: "Empty stomach",
    summary: "Take L-tyrosine in the morning on an empty stomach, 30 to 60 minutes before stressful or demanding work.",
    detail: "Tyrosine is the raw material for dopamine and noradrenaline, which get depleted under stress, so it is timed before mental load. It competes with food protein for absorption, so fasted is better.",
    howTo: "Take 500 to 2000 mg about 30 to 60 minutes before a demanding task, away from protein.",
    avoid: "Take it earlier in the day to protect sleep." },

  "5-htp": { window: "bedtime", bestTime: "Evening or before bed", food: "Away from protein",
    summary: "Take 5-HTP in the evening, away from protein meals.",
    detail: "5-HTP is a serotonin precursor that the body converts toward melatonin in the evening, supporting mood and sleep. Protein-rich meals compete for its transport into the brain.",
    howTo: "Start with a low dose in the evening, away from a big protein meal. Use it short-term.",
    avoid: "Do not combine 5-HTP with antidepressants or other serotonergic drugs, because of serotonin-syndrome risk." },

  "melatonin": { window: "bedtime", bestTime: "30 to 60 minutes before bed", food: "With or without food",
    summary: "Take a low dose of melatonin 30 to 60 minutes before your target bedtime.",
    detail: "Melatonin is a timing signal, not a sedative, so when you take it matters more than how much. A small dose shortly before bed shifts your clock toward sleep; more is not better and can leave you groggy.",
    howTo: "Take 0.5 to 1 mg about 30 to 60 minutes before bed. For jet lag, dose at bedtime in your destination time zone.",
    avoid: "High doses and late-night dosing cause next-day grogginess." },

  "valerian": { window: "bedtime", bestTime: "30 to 60 minutes before bed", food: "With or without food",
    summary: "Take valerian 30 to 60 minutes before bed.",
    detail: "Valerian appears to raise calming GABA activity and is used as a mild sedative, so it is timed shortly before sleep.",
    howTo: "Take it 30 to 60 minutes before bed. It can take a couple of weeks of regular use to notice the full effect.",
    avoid: "Do not combine it with alcohol or sedatives, and do not drive after taking it." },

  "inositol": { window: "split", bestTime: "Morning and evening (split)", food: "With or without food",
    summary: "Split inositol into a morning and an evening dose, especially at the higher amounts used for PCOS or mood.",
    detail: "Inositol is often taken at larger daily totals (such as 2 to 4 g) for cycle, mood, or metabolic support, and splitting it keeps levels steadier and is gentler on the gut.",
    howTo: "Take half in the morning and half in the evening. The 40:1 myo to D-chiro ratio is the well-studied form for PCOS.",
    avoid: "Very high single doses may cause mild GI upset." },

  "coq10": { window: "morning", bestTime: "Morning or midday, with a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take CoQ10 with a fat-containing meal earlier in the day, as it can be mildly energizing.",
    detail: "CoQ10 is fat-soluble, so food with fat greatly improves its absorption. Because it supports cellular energy, some people find it slightly stimulating, so morning or midday suits it.",
    howTo: "Take it with breakfast or lunch containing fat. Ubiquinol is the better-absorbed form if you are over about 40.",
    avoid: "Avoid taking it late at night if it feels energizing." },

  "ubiquinol": { window: "morning", bestTime: "Morning or midday, with a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take ubiquinol with a fatty meal earlier in the day; it is the better-absorbed CoQ10.",
    detail: "Ubiquinol is the reduced, active form of CoQ10 and is fat-soluble, so a fatty meal is essential for absorption. It can be mildly energizing, favouring morning or midday.",
    howTo: "Take it with a fat-containing breakfast or lunch. It is worth the higher price if you are older or absorb CoQ10 poorly.",
    avoid: "Skip late-evening doses if it affects your sleep." },

  "curcumin": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take curcumin with a fat-containing meal, and choose an enhanced-absorption form.",
    detail: "Plain curcumin is poorly absorbed, so it is paired with black pepper (piperine) or formulated as a phospholipid or micellar form, and taken with fat, which together transform its uptake.",
    howTo: "Take an enhanced-absorption curcumin with a meal containing fat. Split the dose for joint or recovery use.",
    avoid: "Use caution with blood thinners, as curcumin can mildly affect clotting." },

  "resveratrol": { window: "morning", bestTime: "Morning, with a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take resveratrol with a fat-containing meal, often in the morning alongside NMN.",
    detail: "Resveratrol is fat-soluble and poorly absorbed without fat. In longevity stacks it is commonly taken in the morning with NMN, the theory being it works with the NAD+ that NMN provides.",
    howTo: "Take it with a fatty breakfast. Many pair it with NMN in the morning.",
    avoid: "It can mildly thin the blood, use caution with anticoagulants." },

  "quercetin": { window: "with-meals", bestTime: "With food; split larger doses", food: "With food",
    summary: "Take quercetin with food, ideally with vitamin C or bromelain to aid absorption.",
    detail: "Quercetin is poorly absorbed, so it is often sold with bromelain or vitamin C and taken with food to improve uptake. It supports immune and histamine balance.",
    howTo: "Take it with meals, paired with vitamin C or bromelain, splitting a higher daily dose.",
    avoid: "It can affect how some medications are processed, check if you take regular drugs." },

  "ala": { window: "morning", bestTime: "Empty stomach, 30 minutes before a meal", food: "Best on an empty stomach",
    summary: "Take alpha-lipoic acid on an empty stomach, about 30 minutes before a meal.",
    detail: "ALA absorbs better fasted, and minerals in food can blunt its uptake, so it is timed before eating. It supports insulin sensitivity and acts as an antioxidant.",
    howTo: "Take it 30 minutes before breakfast or split before meals. If you are diabetic, monitor blood sugar, as ALA can lower it.",
    avoid: "Watch for low blood sugar when combined with glucose-lowering medication." },

  "astaxanthin": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take astaxanthin with a fat-containing meal.",
    detail: "Astaxanthin is a fat-soluble carotenoid antioxidant, so dietary fat is needed for proper absorption. Time of day is flexible, but pairing it with the same meal each day makes it easy to stay consistent.",
    howTo: "Take it with your main fatty meal, consistently, since it builds up in skin and tissue over several weeks before the benefit shows.",
    avoid: "An empty stomach lowers absorption." },

  "lutein": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take lutein and zeaxanthin with a fat-containing meal for eye support.",
    detail: "These carotenoids are fat-soluble and concentrate in the eye over time, so fat aids absorption and consistency matters more than the hour.",
    howTo: "Take it with a meal containing fat, daily, and give it weeks to build up in eye tissue before judging any benefit for screen fatigue or glare.",
    avoid: "An empty stomach reduces uptake." },

  "green-tea": { window: "morning", bestTime: "Earlier in the day, with food", food: "With food",
    summary: "Take green tea extract (EGCG) earlier in the day and with food, not late or fasted.",
    detail: "Green tea extract contains caffeine, so late dosing disrupts sleep, and high-dose EGCG taken on an empty stomach has rare links to liver stress, so food is the safer choice.",
    howTo: "Take it with a morning or midday meal. Mind your total caffeine across all sources.",
    avoid: "Avoid high-dose EGCG on an empty stomach and late in the day." },

  "pqq": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take PQQ in the morning with food; it pairs well with CoQ10.",
    detail: "PQQ supports mitochondria and can be mildly energizing, so morning suits it, and it is commonly stacked with CoQ10 or ubiquinol at the same fatty meal.",
    howTo: "Take it with breakfast, ideally alongside CoQ10 for the mitochondrial pairing, and give it several weeks for any energy benefit to show.",
    avoid: "Avoid late dosing if it feels energizing." },

  "lions-mane": { window: "anytime", bestTime: "Anytime, often morning for focus", food: "With or without food",
    summary: "Take lion's mane consistently each day; many take it in the morning for focus.",
    detail: "Lion's mane is studied for slow nerve-growth-factor support, so the benefit builds over weeks and daily consistency outweighs timing. Some take it in the morning for mental clarity.",
    howTo: "Take a fruiting-body product daily, morning if you want a focus angle. Give it several weeks.",
    avoid: "Do not expect a same-day effect, it works gradually." },

  "bacopa": { window: "with-meals", bestTime: "With a meal (fatty helps)", food: "With food",
    summary: "Take bacopa with a meal; its memory benefit builds over 8 to 12 weeks.",
    detail: "Bacopa's active bacosides are fat-soluble, so a meal aids absorption and also reduces the stomach upset it can cause fasted. Its effect on memory accrues over months, not days.",
    howTo: "Take around 300 mg of a standardised extract with a meal, daily, for at least 8 to 12 weeks.",
    avoid: "Taken on an empty stomach it commonly causes GI upset." },

  "ginkgo": { window: "anytime", bestTime: "Anytime, consistent daily", food: "With or without food",
    summary: "Take ginkgo at a consistent time each day; the benefit builds with regular use.",
    detail: "Ginkgo is taken to support circulation and memory, and its effect accumulates over weeks of daily use, so timing is flexible. It does have mild blood-thinning activity.",
    howTo: "Take 120 to 240 mg of a standardised extract daily, with or without food.",
    avoid: "Use caution with anticoagulants or before surgery, given its blood-thinning effect." },

  "alpha-gpc": { window: "anytime", bestTime: "Pre-study or pre-workout", food: "With or without food",
    summary: "Take alpha-GPC before mental work or training; it raises acetylcholine quickly.",
    detail: "Alpha-GPC delivers choline that the brain rapidly turns into acetylcholine for focus and power output, so it is timed before cognitive or physical effort, taking effect within hours.",
    howTo: "Take around 300 mg before studying or training, with or without food.",
    avoid: "Cut the dose if you get a headache, the usual sign of too much choline." },

  "citicoline": { window: "morning", bestTime: "Morning or early afternoon", food: "With or without food",
    summary: "Take citicoline in the morning or early afternoon for focus.",
    detail: "Citicoline raises acetylcholine and supports brain-cell membranes, and because it is mildly stimulating for focus, earlier in the day suits it. It also supplies uridine, which supports those same membranes.",
    howTo: "Take around 250 mg in the morning or early afternoon. Give it a few weeks of daily use for the memory and focus benefit.",
    avoid: "Avoid late dosing if it feels activating." },

  "phosphatidylserine": { window: "with-meals", bestTime: "With a meal; evening for stress", food: "With a fat-containing meal",
    summary: "Take phosphatidylserine with a meal; an evening dose can blunt stress and cortisol.",
    detail: "Phosphatidylserine is a fat-soluble membrane phospholipid, so food aids absorption, and because it can lower an exaggerated cortisol response, an evening dose helps stress-related sleep issues.",
    howTo: "Take around 100 mg with a meal containing fat, evening if cortisol or stress is the target.",
    avoid: "An empty stomach lowers absorption." },

  "glucosamine": { window: "with-meals", bestTime: "With food, daily", food: "With food",
    summary: "Take glucosamine with food, daily; joint benefits build over 4 to 8 weeks.",
    detail: "Glucosamine supports cartilage and joint comfort, and trials dose it daily over weeks, so consistency matters far more than the hour. Food improves tolerance.",
    howTo: "Take about 1500 mg per day with meals (split if needed), and give it 4 to 8 weeks.",
    avoid: "Glucosamine is often shellfish-derived, check the source if you have an allergy." },

  "msm": { window: "with-meals", bestTime: "With food; split larger doses", food: "With food",
    summary: "Take MSM with food, splitting larger doses across the day.",
    detail: "MSM supplies sulfur for connective tissue and joint comfort and is well tolerated, so timing is flexible. Splitting a higher dose with meals improves comfort.",
    howTo: "Take 1 to 3 g per day with food, split if your dose is on the higher end.",
    avoid: "Some find a large single dose mildly loosens stools." },

  "boswellia": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take boswellia with food; joint and inflammation benefits build with daily use.",
    detail: "Boswellia's boswellic acids calm inflammatory enzymes, and absorption improves with a meal. Its effect on joints accrues over weeks.",
    howTo: "Take a standardised (AKBA-enhanced) extract with food, daily, and allow several weeks, since it works gradually rather than for acute pain.",
    avoid: "Check with a clinician if you take anti-inflammatory or blood-thinning medication." },

  "collagen": { window: "anytime", bestTime: "Anytime, with vitamin C", food: "With or without food",
    summary: "Take collagen at any time, ideally with vitamin C; results show over 8 to 12 weeks.",
    detail: "Collagen peptides supply amino acids for skin, joints, and connective tissue, and vitamin C is required to build collagen, so pairing them helps. The timing does not matter, but consistency does.",
    howTo: "Take 10 to 15 g daily with a source of vitamin C, in coffee, water, or a smoothie. Give it 8 to 12 weeks.",
    avoid: "Do not expect quick results, skin and joint changes are gradual." },

  "probiotic": { window: "anytime", bestTime: "Same time daily; many take it at bedtime or with a meal", food: "Per product label",
    summary: "Take a probiotic at the same time each day; consistency matters more than the exact hour.",
    detail: "The evidence on timing is mixed and product-dependent: some strains survive stomach acid better taken with or just before a meal, others are dosed at bedtime when the gut is quiet. The reliable rule is daily consistency.",
    howTo: "Follow the label, take it at the same time each day, and keep it a couple of hours apart from antibiotics. Many products are fine with breakfast or at bedtime.",
    avoid: "Do not take it at the same moment as an antibiotic dose." },

  "s-boulardii": { window: "anytime", bestTime: "Anytime; safe alongside antibiotics", food: "With or without food",
    summary: "Take S. boulardii any time, and unlike bacterial probiotics it is safe taken with antibiotics.",
    detail: "S. boulardii is a beneficial yeast, so antibiotics do not kill it, which is exactly why it is used during and after a course to reduce antibiotic-associated diarrhoea.",
    howTo: "Take it daily, including alongside antibiotics and for a week or two after. With or without food is fine.",
    avoid: "Anyone immunocompromised or with a central line should check with a doctor first." },

  "digestive-enzymes": { window: "with-meals", bestTime: "With or just before meals", food: "With food",
    summary: "Take digestive enzymes with or just before the meal you want them to act on.",
    detail: "Enzymes break food down into absorbable pieces, so they have to be present while you eat, which is why they are timed to the start of a meal.",
    howTo: "Take them with the first bites of a meal, especially larger or richer ones.",
    avoid: "Taking them between meals does little, they need food to work on." },

  "psyllium": { window: "with-meals", bestTime: "Before meals, with lots of water", food: "With a full glass of water, away from medication",
    summary: "Take psyllium before meals with a large glass of water, and keep it away from medications.",
    detail: "Psyllium is a gel-forming fibre, so it needs plenty of water to work and not clump, and taken before a meal it can blunt appetite and the blood-sugar rise. Its gel can also slow drug absorption.",
    howTo: "Mix it into a full glass of water and drink promptly, before meals, and take any medication at least 2 hours apart.",
    avoid: "Never take it with too little water, and separate it from your medicines." },

  "inulin": { window: "with-meals", bestTime: "With food; start with a small dose", food: "With food",
    summary: "Take inulin with food and build the dose up slowly to avoid gas.",
    detail: "Inulin is a prebiotic fibre that gut bacteria ferment, which produces gas and bloating if you start too high, so it is introduced gradually with meals.",
    howTo: "Start with a small dose with food and increase slowly over a week or two. Drink plenty of water.",
    avoid: "People with IBS or FODMAP sensitivity may not tolerate it, start very low." },

  "ginger": { window: "with-meals", bestTime: "With food (or before travel for nausea)", food: "With food",
    summary: "Take ginger with food, or shortly before travel if you are using it for nausea.",
    detail: "Ginger supports digestion and eases nausea, so it is taken with meals for comfort, or 30 to 60 minutes before a trigger such as travel or a queasy morning.",
    howTo: "Take a standardised extract with meals, or before a known nausea trigger.",
    avoid: "It can mildly thin the blood, use caution with anticoagulants." },

  "berberine": { window: "with-meals", bestTime: "With meals, split across the day", food: "With food",
    summary: "Take berberine with meals, split into two or three doses across the day.",
    detail: "Berberine blunts the post-meal blood-sugar spike, so it is timed with meals, and because it has a short half-life and can upset the stomach, the daily total is split rather than taken at once.",
    howTo: "Take around 500 mg with breakfast, lunch, and dinner (up to about 1500 mg per day). Monitor closely if you take diabetes medication.",
    avoid: "Berberine changes how the body processes many drugs, check with a pharmacist if you take regular medication." },

  "milk-thistle": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take milk thistle with food for better absorption.",
    detail: "Milk thistle's silymarin is fat-soluble and poorly absorbed, so a meal improves uptake. It is used to support liver cells.",
    howTo: "Take a standardised silymarin extract with meals, daily, choosing a phospholipid or enhanced-absorption form where possible.",
    avoid: "It supports a healthy liver but is not a treatment for liver disease, get persistent symptoms checked." },

  "tudca": { window: "with-meals", bestTime: "With food", food: "With food",
    summary: "Take TUDCA with food to support bile flow and the liver.",
    detail: "TUDCA is a bile acid that supports bile flow and protects liver cells under stress, and taking it with food fits its role in digestion.",
    howTo: "Take it with meals, per the product label, splitting the dose across the day if you take a higher amount.",
    avoid: "See a doctor for jaundice, itching, or abnormal liver tests rather than self-treating." },

  "tongkat-ali": { window: "morning", bestTime: "Morning", food: "With or without food",
    summary: "Take tongkat ali in the morning; it can be energizing and may disrupt sleep if taken late.",
    detail: "Tongkat ali supports free testosterone, energy, and libido, and because it can feel stimulating, morning suits it best. Many people cycle it.",
    howTo: "Take a standardised extract in the morning, daily, and consider cycling (for example five days on, two off).",
    avoid: "Avoid late-day dosing if it affects your sleep." },

  "maca": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take maca in the morning with food; it is energizing and works over weeks.",
    detail: "Maca supports energy and libido and is mildly energizing, so morning suits it, and like other adaptogens its effect builds with consistent daily use.",
    howTo: "Take a few grams of powder (or the capsule equivalent) with breakfast, daily.",
    avoid: "Effects vary between people, give it a few weeks before deciding." },

  "fenugreek": { window: "with-meals", bestTime: "With meals", food: "With food",
    summary: "Take fenugreek with meals; benefits for libido or blood sugar build over weeks.",
    detail: "Fenugreek is used for libido, testosterone, and blood-sugar support, and it is taken with food both for tolerance and because it can blunt post-meal glucose.",
    howTo: "Take a standardised extract (such as Testofen) with meals, daily, and give it several weeks for libido or strength effects.",
    avoid: "It can lower blood sugar, monitor if you take diabetes medication." },

  "dim": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take DIM with a fat-containing meal for absorption.",
    detail: "DIM supports healthy estrogen metabolism and is fat-soluble and poorly absorbed on its own, so a fatty meal (or an enhanced-absorption form) is needed.",
    howTo: "Take it with a meal containing fat, daily, choosing a bioavailable form (with BioPerine or microencapsulated) to get a useful dose.",
    avoid: "Harmless darker urine can occur, it is not a concern." },

  "saw-palmetto": { window: "with-meals", bestTime: "With a fat-containing meal", food: "With a fat-containing meal",
    summary: "Take saw palmetto with a fat-containing meal; prostate benefits build over weeks.",
    detail: "Saw palmetto's active fats are best absorbed with food, and its effect on urinary and prostate symptoms accrues over weeks of daily use.",
    howTo: "Take a standardised extract with a fatty meal, daily, and give it several weeks.",
    avoid: "Get urinary symptoms checked by a doctor first, they can signal conditions needing treatment." },

  "nmn": { window: "morning", bestTime: "Morning", food: "With or without food",
    summary: "Take NMN in the morning, in line with the body's daily NAD+ rhythm.",
    detail: "NMN raises NAD+, the coenzyme behind cellular energy and repair, and NAD+ naturally peaks earlier in the day, so morning dosing aligns with that rhythm. It is often stacked with resveratrol and fat.",
    howTo: "Take it in the morning, on its own or with a fatty breakfast and resveratrol.",
    avoid: "Late-day dosing runs against the natural NAD+ cycle." },

  "nr": { window: "morning", bestTime: "Morning", food: "With or without food",
    summary: "Take nicotinamide riboside (NR) in the morning, like NMN.",
    detail: "NR raises NAD+ much like NMN, and the same circadian logic applies: morning dosing matches the body's natural daytime NAD+ rhythm, when the coenzyme is most in demand for energy and repair.",
    howTo: "Take it in the morning, with or without food, daily, and treat consistency over months as more important than the exact dose.",
    avoid: "There is little reason to take it at night." },

  "tmg": { window: "morning", bestTime: "Morning, with food", food: "With food",
    summary: "Take TMG in the morning with food; it pairs with NAD+ boosters and B vitamins.",
    detail: "TMG (betaine) donates methyl groups and is often added to NMN or NR stacks to replace the methyl groups the NAD+ pathway uses up. Morning fits because it is usually stacked with those daytime supplements.",
    howTo: "Take around 1 to 3 g in the morning with food, alongside your NAD+ booster and B vitamins.",
    avoid: "Adequate folate and B12 support the same methylation system." },

  "acetyl-l-carnitine": { window: "morning", bestTime: "Morning, empty stomach", food: "Best on an empty stomach",
    summary: "Take acetyl-L-carnitine in the morning on an empty stomach for energy and focus.",
    detail: "ALCAR shuttles fat into mitochondria for energy and crosses into the brain, so it is used in the morning for an energy and focus angle, and absorbs better fasted.",
    howTo: "Take it in the morning before food, or split morning and early afternoon.",
    avoid: "Avoid late dosing if it feels energizing." },

  "l-glutamine": { window: "anytime", bestTime: "Anytime; empty stomach for gut support", food: "With or without food",
    summary: "Take L-glutamine anytime; an empty stomach is often used for gut-lining support.",
    detail: "Glutamine is the main fuel for gut-lining cells, so for digestive support it is often taken between meals on an empty stomach, though timing is flexible for general use.",
    howTo: "Take several grams daily, between meals for gut support, introducing it gradually.",
    avoid: "Check with a clinician if you have liver or kidney disease before high doses." },
};

/** All ids that have a timing page (those with a TIMING entry). */
export const TIMING_IDS = Object.keys(TIMING);

export function timingFor(id: string): TimingInfo | undefined {
  return TIMING[id];
}

/** Word count of the unique on-page copy, used as the index gate. */
export function timingWordCount(t: TimingInfo): number {
  return `${t.summary} ${t.detail} ${t.howTo} ${t.avoid ?? ""}`.trim().split(/\s+/).filter(Boolean).length;
}

export const TIMING_MIN_WORDS = 60;
export function timingIndexable(t: TimingInfo): boolean {
  return timingWordCount(t) >= TIMING_MIN_WORDS;
}
