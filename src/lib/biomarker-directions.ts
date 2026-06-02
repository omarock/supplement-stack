/**
 * High/low split content for /biomarkers/[marker]/[direction]. These capture the
 * exact queries people paste from a lab report ("low ferritin", "high
 * homocysteine", "high TSH"), which the combined explainer page does not target
 * as cleanly. Keys are BIOMARKERS keys; nutrients are SUPPLEMENT_DB ids.
 *
 * YMYL: `medical: true` marks a direction that is primarily a clinical finding
 * (thyroid, glucose, lipids, overload); those pages lead with "see a doctor" and
 * frame supplements as support only. Never diagnose or treat.
 */

export interface DirectionInfo {
  title: string;       // "Low ferritin (low iron stores)"
  summary: string;     // answer-first
  detail: string;      // what it means + mechanism
  causes: string[];
  symptoms: string[];
  nutrients: string[]; // SUPPLEMENT_DB ids that help this direction (empty when it's purely medical)
  action: string;      // what to do + retest
  seeDoctor: string;   // red flags / when it needs a clinician
  medical?: boolean;   // primarily a clinical finding
}

export const BIOMARKER_DIRECTION: Record<string, { low?: DirectionInfo; high?: DirectionInfo }> = {
  ferritin: {
    low: {
      title: "Low ferritin (low iron stores)",
      summary: "Low ferritin means your iron stores are depleted, and it is one of the most common reversible causes of fatigue, hair shedding, and restless legs, often before a standard anaemia test turns abnormal.",
      detail: "Ferritin is your stored iron, and it falls first when iron runs low, so a low ferritin catches a problem early. Iron is needed to carry oxygen and make dopamine, which is why low stores show up as tiredness, hair loss, and restless legs. Many labs flag ferritin as normal well below the level at which symptoms appear.",
      causes: ["Heavy menstrual periods", "A low-iron or mostly plant-based diet", "Blood loss from the gut", "Poor absorption (low stomach acid, coeliac disease)", "Pregnancy or endurance training"],
      symptoms: ["Fatigue and low stamina", "Hair shedding", "Restless legs at night", "Cold hands and feet", "Breathlessness on exertion", "Pale skin"],
      nutrients: ["iron", "vit-c"],
      action: "Take iron (a gentle form like bisglycinate) on an empty stomach with about 200 mg of vitamin C, away from coffee, tea, and calcium. Every-other-day dosing can absorb better. Recheck ferritin after 8 to 12 weeks, and importantly, find the cause of the loss.",
      seeDoctor: "Low ferritin should be reviewed by a doctor to find why iron is low, especially with no obvious cause, since gut blood loss needs excluding. Do not take high-dose iron long-term without testing.",
    },
    high: {
      title: "High ferritin",
      summary: "A high ferritin most often reflects inflammation rather than too much iron, but it can also signal genuine iron overload, so it needs a doctor's interpretation, not a supplement.",
      detail: "Ferritin rises both when iron stores are high and when there is inflammation anywhere in the body, including infection, fatty liver, heavy alcohol use, or metabolic problems. True iron overload (haemochromatosis) is a real but less common cause. Because the meaning depends on the full picture, this is a result to interpret with a clinician.",
      causes: ["Inflammation or recent infection", "Fatty liver or metabolic syndrome", "Heavy alcohol use", "Genuine iron overload (haemochromatosis)", "Frequent iron supplementation or transfusions"],
      symptoms: ["Often none", "Fatigue or joint pain (with overload)", "Symptoms of the underlying condition"],
      nutrients: [],
      action: "Do not take iron. The next step is medical: your doctor will look at related markers (transferrin saturation, inflammatory markers, liver tests) to tell inflammation from overload.",
      seeDoctor: "Always discuss a high ferritin with a doctor. Persistent or very high levels need investigation, and iron overload is treatable once identified.",
      medical: true,
    },
  },

  vitamin_d: {
    low: {
      title: "Low vitamin D",
      summary: "Low vitamin D is extremely common, especially in winter and in people who spend most of the day indoors, and is linked to low mood, muscle weakness, fatigue, and more frequent infections.",
      detail: "Vitamin D is made in the skin from sunlight, so levels fall in the darker months and in those with limited sun exposure or darker skin. It has receptors throughout the body, which is why a shortfall is associated with low mood, achy weak muscles, and weaker immunity. It is cheap to test and easy to correct.",
      causes: ["Limited sun exposure or indoor lifestyle", "Darker skin tone", "Winter at higher latitudes", "Older age", "Obesity or malabsorption"],
      symptoms: ["Low mood, worse in winter", "Muscle aches or weakness", "Fatigue", "Frequent colds or infections", "Bone or back aches"],
      nutrients: ["d3k2"],
      action: "Take vitamin D3 with vitamin K2 and a meal containing fat. The dose depends on how low you are, so retest after about 3 months and adjust. Sensible sun exposure helps in summer.",
      seeDoctor: "Very low levels or symptoms of bone pain warrant a doctor's review, and high-dose vitamin D should be monitored with testing to avoid going too high.",
    },
  },

  b12: {
    low: {
      title: "Low vitamin B12",
      summary: "Low B12 causes fatigue, brain fog, and tingling, and matters because the nerve damage it causes can become permanent if it is missed, so it is worth correcting promptly.",
      detail: "B12 is needed to make red blood cells and to maintain the protective sheath around nerves, so a deficiency causes both anaemia-type fatigue and neurological symptoms like pins and needles. Risk is higher in vegans, older adults, and people on metformin or acid-blockers. Folate can mask the blood signs while nerve damage continues.",
      causes: ["Vegan or low-animal-product diet", "Older age (reduced absorption)", "Metformin or long-term acid-blockers", "Pernicious anaemia (autoimmune)", "Gut conditions affecting absorption"],
      symptoms: ["Tingling or numbness in hands or feet", "Brain fog and poor memory", "Fatigue", "Low mood", "A sore, red tongue"],
      nutrients: ["b12", "methylfolate"],
      action: "Take B12, choosing a sublingual or higher-dose form if absorption is the issue. If you are vegan, older, or on metformin, this is a maintenance supplement, not a one-off. Recheck after a few months.",
      seeDoctor: "New or worsening numbness, or a very low B12, needs a doctor to find the cause (pernicious anaemia needs injections) and to protect the nerves before damage sets.",
    },
  },

  folate: {
    low: {
      title: "Low folate",
      summary: "Low folate, like low B12, causes fatigue and is involved in low mood and raised homocysteine; it is corrected with methylfolate, ideally checked alongside B12.",
      detail: "Folate works as a pair with B12 in making red blood cells and in the methylation pathway that keeps homocysteine, a cardiovascular and cognitive risk marker, in range. A shortfall causes a large-cell anaemia and tiredness, and it is especially important before and during pregnancy for neural-tube development.",
      causes: ["Low intake of leafy greens, legumes, and fortified foods", "Pregnancy (higher needs)", "Heavy alcohol use", "Certain medications", "Malabsorption"],
      symptoms: ["Fatigue", "Low mood", "Mouth ulcers or a sore tongue", "Poor concentration"],
      nutrients: ["methylfolate", "b12"],
      action: "Take methylfolate, and check B12 at the same time since the two are linked and B12 should not be missed. If you could become pregnant, adequate folate is a priority.",
      seeDoctor: "Confirm the cause with a doctor, and always pair folate with B12 testing so a B12 deficiency is not masked.",
    },
  },

  magnesium: {
    low: {
      title: "Low magnesium",
      summary: "Low magnesium is linked to muscle cramps, poor sleep, anxiety, and palpitations, and the standard serum test often misses it because most magnesium sits inside cells.",
      detail: "Magnesium is involved in hundreds of reactions, including muscle relaxation, the stress response, and the GABA pathway that supports sleep. A serum magnesium can read normal even when body stores are low, so symptoms plus risk factors matter as much as the number. Glycinate is the gentle, well-absorbed form.",
      causes: ["Low intake of greens, nuts, and whole grains", "Heavy alcohol use", "Gut losses or diuretics", "High stress", "Type 2 diabetes"],
      symptoms: ["Muscle cramps and twitches", "Poor sleep", "Anxiety or feeling on edge", "Palpitations", "Headaches"],
      nutrients: ["mag-glycinate"],
      action: "Take magnesium glycinate in the evening, where it doubles as sleep support, and eat more magnesium-rich foods. Most people tolerate it well; citrate is more laxative.",
      seeDoctor: "Significant symptoms or known kidney disease should be reviewed by a doctor, since magnesium handling changes with kidney function.",
    },
  },

  zinc: {
    low: {
      title: "Low zinc",
      summary: "Low zinc shows up as frequent infections, slow wound healing, a poor sense of taste or smell, and skin or hair problems, and is more common in vegetarians and older adults.",
      detail: "Zinc is essential for immune-cell function, tissue repair, taste, and testosterone, so a shortfall touches many systems. It is harder to absorb from plant-heavy diets high in phytates, which is why vegetarians are at higher risk.",
      causes: ["Vegetarian or vegan diet", "Older age", "Gut conditions affecting absorption", "High alcohol intake", "Heavy sweating in athletes"],
      symptoms: ["Frequent infections", "Slow wound healing", "Reduced taste or smell", "Hair thinning", "Acne or skin issues"],
      nutrients: ["zinc"],
      action: "Take zinc (around 15 to 30 mg) with food to avoid nausea, and not at the same time as iron. Do not exceed about 40 mg a day long-term, since too much zinc lowers copper.",
      seeDoctor: "Persistent infections or healing problems should be assessed by a doctor rather than assumed to be zinc.",
    },
  },

  testosterone_total: {
    low: {
      title: "Low testosterone",
      summary: "Low testosterone in men can cause fatigue, low libido, low mood, and loss of muscle, but the symptoms are non-specific, so a low result needs a morning retest and a doctor's review.",
      detail: "Testosterone is needed for libido, energy, mood, and muscle, and it dips with age, poor sleep, obesity, and low zinc or vitamin D. Because levels vary through the day and the symptoms overlap with many other conditions, a single low reading is confirmed with a second morning sample and interpreted by a clinician.",
      causes: ["Older age", "Obesity", "Poor sleep or sleep apnoea", "Low zinc or vitamin D", "Chronic stress or illness, some medications"],
      symptoms: ["Low libido", "Fatigue", "Low mood", "Reduced muscle and strength", "Erectile problems"],
      nutrients: ["zinc", "d3k2", "ashwagandha"],
      action: "Correct low zinc and vitamin D, prioritise sleep, strength training, and fat loss if overweight, which raise testosterone naturally. Confirm a low reading with a morning retest.",
      seeDoctor: "Do not self-diagnose. A confirmed low testosterone needs a doctor to find the cause and discuss whether treatment is appropriate.",
      medical: true,
    },
  },

  tsh: {
    high: {
      title: "High TSH (underactive thyroid)",
      summary: "A high TSH usually means the thyroid is underactive (hypothyroidism), which causes fatigue, weight gain, cold intolerance, and low mood. This is a medical diagnosis to discuss with a doctor.",
      detail: "TSH is the signal the brain sends to the thyroid, so it rises when the thyroid is sluggish and the body is trying to push it harder. The most common cause is autoimmune (Hashimoto's). Selenium supports thyroid enzymes and iodine is the raw material, but an underactive thyroid is treated by a doctor, often with thyroid hormone, not by supplements.",
      causes: ["Autoimmune thyroiditis (Hashimoto's)", "Iodine deficiency or excess", "Previous thyroid treatment", "Certain medications", "Recovery from illness (transient)"],
      symptoms: ["Fatigue", "Weight gain", "Feeling cold", "Dry skin and hair", "Constipation", "Low mood"],
      nutrients: ["selenium", "d3k2"],
      action: "This is a result to take to your doctor. Selenium (and adequate, not excessive, iodine) supports thyroid function, but confirmed hypothyroidism is managed medically with monitoring.",
      seeDoctor: "Always review a high TSH with a doctor, who will repeat it, check thyroid antibodies and free T4, and decide on treatment. Do not mega-dose iodine, which can worsen thyroid problems.",
      medical: true,
    },
    low: {
      title: "Low TSH (overactive thyroid)",
      summary: "A low TSH usually means the thyroid is overactive (hyperthyroidism), which causes palpitations, weight loss, anxiety, and heat intolerance, and needs prompt medical assessment.",
      detail: "When the thyroid produces too much hormone, the brain stops signalling and TSH drops. This speeds the body up, causing a fast or irregular heartbeat, unintended weight loss, tremor, and anxiety. It is a medical condition that needs diagnosis and treatment, not supplements.",
      causes: ["Graves' disease (autoimmune)", "Thyroid nodules", "Too much thyroid medication", "Excess iodine", "Thyroiditis"],
      symptoms: ["Palpitations or a fast heartbeat", "Unintended weight loss", "Anxiety and tremor", "Feeling hot, sweating", "Trouble sleeping"],
      nutrients: [],
      action: "Do not take iodine or thyroid-stimulating supplements. The next step is medical: a doctor will confirm with free T4 and antibodies and arrange treatment.",
      seeDoctor: "See a doctor promptly for a low TSH, especially with palpitations or weight loss, as an overactive thyroid affects the heart and needs treatment.",
      medical: true,
    },
  },

  free_t4: {
    low: {
      title: "Low free T4",
      summary: "A low free T4, usually alongside a high TSH, points to an underactive thyroid and the same symptoms (fatigue, cold, weight gain), and is a medical finding for your doctor.",
      detail: "Free T4 is the available thyroid hormone, so a low level confirms the thyroid is not producing enough, typically with a raised TSH. Selenium supports thyroid enzymes, but treatment of an underactive thyroid is medical.",
      causes: ["Autoimmune thyroiditis (Hashimoto's)", "Iodine deficiency", "Pituitary problems (rarely)", "Previous thyroid treatment"],
      symptoms: ["Fatigue", "Feeling cold", "Weight gain", "Dry skin", "Low mood"],
      nutrients: ["selenium"],
      action: "Take this to your doctor with your TSH. Selenium and adequate iodine support the thyroid, but a low free T4 is managed medically.",
      seeDoctor: "A low free T4 needs a doctor's review and usually treatment with monitoring.",
      medical: true,
    },
  },

  homocysteine: {
    high: {
      title: "High homocysteine",
      summary: "A high homocysteine is associated with cardiovascular and cognitive risk and is usually driven by low B vitamins, so it is one of the most directly fixable markers with methylfolate, B12, and B6.",
      detail: "Homocysteine is an amino acid kept in range by folate, B12, and B6 (with TMG as a backup). When those run low, or with the common MTHFR gene variant, it builds up, and elevated levels are linked to heart disease and faster cognitive decline. Lowering it with B vitamins is straightforward and measurable.",
      causes: ["Low folate, B12, or B6", "The MTHFR gene variant", "Kidney impairment", "Older age", "Heavy coffee or alcohol intake"],
      symptoms: ["Usually none (it is silent)", "Symptoms relate to any underlying B12 deficiency"],
      nutrients: ["methylfolate", "b12", "vit-b6", "tmg"],
      action: "Take a methylated B-complex (methylfolate, methyl-B12, B6), and add TMG if it stays high. Recheck after about 3 months. Address coffee and alcohol intake too.",
      seeDoctor: "A high homocysteine is worth discussing with a doctor, who can check B12 and folate, consider kidney function, and factor it into your overall heart-health picture.",
    },
  },

  hs_crp: {
    high: {
      title: "High hs-CRP (inflammation)",
      summary: "A high hs-CRP is a marker of inflammation in the body and is linked to cardiovascular risk; the priority is finding and addressing the source, with omega-3 and curcumin as support.",
      detail: "hs-CRP rises with inflammation from any cause, including infection, excess body fat, smoking, and chronic conditions, and a persistently raised level is associated with heart disease. Because a recent cold or injury also raises it, the test is most meaningful when you are well. Omega-3 and curcumin lower inflammation, but the real lever is the underlying cause.",
      causes: ["Recent infection or illness", "Excess body fat or metabolic syndrome", "Smoking", "Chronic inflammatory conditions", "Poor diet and inactivity"],
      symptoms: ["Often none", "Symptoms of the underlying cause"],
      nutrients: ["omega3", "curcumin"],
      action: "Recheck when you are well, not during an illness. The biggest levers are weight, not smoking, exercise, and diet; omega-3 and curcumin support lower inflammation alongside.",
      seeDoctor: "A persistently high hs-CRP should be reviewed by a doctor as part of your cardiovascular risk and to look for an underlying cause.",
      medical: true,
    },
  },

  ldl: {
    high: {
      title: "High LDL cholesterol",
      summary: "A high LDL raises cardiovascular risk and is a medical decision; omega-3, bergamot, and berberine can support a healthier profile, but they sit alongside, not instead of, your doctor's plan.",
      detail: "LDL carries cholesterol into artery walls, so a high level over time raises heart-disease risk, weighed against your other risk factors. Diet and exercise move it, and some supplements help modestly: bergamot and berberine for LDL, omega-3 for triglycerides. Red yeast rice is effectively a low-dose statin and must be used only under medical supervision.",
      causes: ["Diet high in saturated and trans fat", "Genetics (familial high cholesterol)", "Low physical activity", "Underactive thyroid", "Excess body weight"],
      symptoms: ["None (it is silent until it causes disease)"],
      nutrients: ["omega3", "bergamot", "berberine"],
      action: "Improve diet (more fibre and unsaturated fat, less refined carbohydrate), exercise, and stop smoking, which move lipids most. Discuss supplements and any need for medication with your doctor.",
      seeDoctor: "Cholesterol management is a medical decision, especially with other risk factors. Do not replace prescribed medication with supplements, and never combine red yeast rice with a statin.",
      medical: true,
    },
  },

  triglycerides: {
    high: {
      title: "High triglycerides",
      summary: "High triglycerides are strongly tied to sugar, refined carbs, and alcohol, and respond well to diet plus omega-3, though a very high level needs a doctor.",
      detail: "Triglycerides are fats in the blood that rise with excess sugar, refined carbohydrate, and alcohol, and high levels add to cardiovascular and, when very high, pancreatitis risk. Omega-3 fish oil reliably lowers them, and dietary change is powerful.",
      causes: ["High sugar and refined-carb intake", "Alcohol", "Excess body weight", "Poorly controlled blood sugar", "Underactive thyroid"],
      symptoms: ["Usually none", "Very high levels can cause abdominal pain"],
      nutrients: ["omega3"],
      action: "Cut sugar, refined carbs, and alcohol, lose excess weight, and add omega-3, which together can move triglycerides substantially. Recheck after a few months.",
      seeDoctor: "Very high triglycerides need prompt medical review (pancreatitis risk), and any management fits into your wider heart-health plan with a doctor.",
      medical: true,
    },
  },

  glucose_fasting: {
    high: {
      title: "High fasting glucose",
      summary: "A high fasting glucose suggests prediabetes or diabetes and is a medical finding; diet, weight, and exercise are the main levers, with berberine and chromium as support under guidance.",
      detail: "Fasting glucose reflects your blood sugar after an overnight fast, and a raised level signals insulin resistance, the lead-in to type 2 diabetes. HbA1c gives the longer-term picture. Berberine and chromium support insulin sensitivity, but a raised glucose is something to confirm and manage with a doctor.",
      causes: ["Insulin resistance and excess body fat", "Diet high in refined carbohydrate", "Inactivity", "Genetics and family history", "Poor sleep and chronic stress"],
      symptoms: ["Often none early on", "Thirst, frequent urination, fatigue (higher levels)"],
      nutrients: ["berberine", "chromium", "ala"],
      action: "Diet (fewer refined carbs and liquid sugars, more protein and fibre), weight loss, and exercise are the foundation. Berberine and chromium support blood-sugar handling, ideally with medical oversight.",
      seeDoctor: "A high fasting glucose should be confirmed and managed with a doctor (with HbA1c), and supplements that lower blood sugar must not be combined with diabetes medication without supervision.",
      medical: true,
    },
  },

  hba1c: {
    high: {
      title: "High HbA1c (prediabetes risk)",
      summary: "A high HbA1c shows your average blood sugar has been raised for months, indicating prediabetes or diabetes, and is a medical finding driven mostly by diet, weight, and activity.",
      detail: "HbA1c reflects average blood sugar over about three months, so it is the key marker for prediabetes and diabetes. The good news is that lifestyle change moves it powerfully, and catching it in the prediabetes range is a strong prompt to act before it progresses.",
      causes: ["Insulin resistance and excess body fat", "Diet high in refined carbohydrate", "Inactivity", "Family history", "Poor sleep and stress"],
      symptoms: ["Often none in the prediabetes range", "Thirst, frequent urination, fatigue (diabetes range)"],
      nutrients: ["berberine", "chromium", "ala"],
      action: "Reduce refined carbohydrate and liquid sugar, build muscle and walk after meals, and lose excess weight, which can return a prediabetes HbA1c toward normal. Berberine supports glucose control under medical guidance.",
      seeDoctor: "A raised HbA1c should be reviewed and tracked with a doctor, who will confirm the stage and guide management. Do not combine glucose-lowering supplements with diabetes medication unsupervised.",
      medical: true,
    },
  },
};

export interface DirParam { marker: string; direction: "low" | "high" }

export function directionParams(): DirParam[] {
  const out: DirParam[] = [];
  for (const [marker, d] of Object.entries(BIOMARKER_DIRECTION)) {
    if (d.low) out.push({ marker, direction: "low" });
    if (d.high) out.push({ marker, direction: "high" });
  }
  return out;
}

export function directionFor(marker: string, direction: string): DirectionInfo | undefined {
  if (direction !== "low" && direction !== "high") return undefined;
  return BIOMARKER_DIRECTION[marker]?.[direction];
}
