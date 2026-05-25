/**
 * Product database — top 3 iHerb options per supplement.
 *
 * Strategy:
 * - "primary" = the bestseller / most-recommended (shown on the results card)
 * - 2 alternatives provide variety (value pick + premium pick)
 * - Each has a specific iHerb product path (direct product page) when known,
 *   else falls back to a tightly-scoped iHerb search.
 */

export interface ProductOption {
  brand: string;
  productName: string;
  size: string;            // e.g. "120 capsules"
  approxPrice: number;     // USD
  rating: number;          // 0-5
  reviewCount: number;
  badge: "Bestseller" | "Editor's Pick" | "Best Value" | "Premium" | "Vegan";
  productPath?: string;    // direct iHerb product path "/pr/.../12345"
  searchQuery?: string;    // fallback search query (used if productPath missing)
  brandBg: string;         // soft background tint for branded card
  brandInk: string;        // brand-name text color
  imageUrl?: string;       // optional override: real product photo URL (Unsplash, iHerb CDN, or local)
  // --- Rich product detail (optional, used by /products/[id] page) ---
  form?: string;                  // e.g. "Capsules", "Softgels", "Powder", "Liquid", "Gummies"
  ingredientForm?: string;        // e.g. "Magnesium Glycinate", "Acetyl-L-Carnitine HCl"
  servingSize?: string;           // e.g. "1 capsule", "2 tablets"
  servingsPerContainer?: number;  // e.g. 120
  mgPerServing?: string;          // e.g. "500 mg"
  certifications?: string[];      // e.g. ["Kosher", "Halal", "GMP", "Non-GMO", "USP", "NSF", "Vegan", "Gluten-Free"]
  fullDescription?: string;       // multi-paragraph description for /products/[id] (overrides supplement.description)
  amazonAsin?: string;            // optional Amazon ASIN for direct product link
}

// ─── Product Database ────────────────────────────────────────────────────────
export const PRODUCTS: Record<string, ProductOption[]> = {

  d3k2: [
    {
      brand: "NOW Foods", productName: "Vitamin D-3 & K-2", size: "120 veg capsules",
      approxPrice: 12, rating: 4.8, reviewCount: 11500, badge: "Bestseller",
      productPath: "/pr/now-foods-vitamin-d3-2-000-iu-120-softgels/8229",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/d3k2.jpg",
      form: "Veg Capsules",
      ingredientForm: "Cholecalciferol (D3) + Menaquinone-7 (K2 MK-7)",
      servingSize: "1 veg capsule",
      servingsPerContainer: 120,
      mgPerServing: "2,000 IU D3 + 100 mcg K2",
      certifications: ["Non-GMO", "Vegetarian", "GMP", "Soy Free", "Kosher"],
      fullDescription: "NOW Foods Vitamin D-3 & K-2 combines two synergistic nutrients into a single daily veg capsule. The D-3 (cholecalciferol) is the same form your skin produces from sunlight, while the K-2 is menaquinone-7 — the long-acting form derived from natto fermentation. Together they support bone density, immune resilience, and cardiovascular calcium routing. NOW Foods has been a family-owned supplement manufacturer since 1968, with an in-house lab in Bloomingdale, Illinois that conducts purity and potency testing on every batch. This product has over 11,000 reviews on iHerb and averages 4.8 stars — one of the top-rated D3/K2 combinations on the platform.",
    },
    {
      brand: "Sports Research", productName: "Vitamin D3 + K2", size: "60 softgels",
      approxPrice: 15, rating: 4.8, reviewCount: 6800, badge: "Editor's Pick",
      searchQuery: "Sports Research Vitamin D3 K2",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
    {
      brand: "Doctor's Best", productName: "Vitamin D3 5000 IU + K2", size: "60 softgels",
      approxPrice: 11, rating: 4.7, reviewCount: 4100, badge: "Best Value",
      searchQuery: "Doctor's Best Vitamin D3 5000 K2",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
  ],

  omega3: [
    {
      brand: "Sports Research", productName: "Triple Strength Omega-3 Fish Oil", size: "90 softgels",
      approxPrice: 24, rating: 4.8, reviewCount: 15200, badge: "Bestseller",
      productPath: "/pr/sports-research-alaskan-omega-3-fish-oil-triple-strength-180-softgels/72037",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/omega3.jpg",
      form: "Softgels",
      ingredientForm: "Wild Alaskan Fish Oil (Triglyceride form, IFOS 5-star certified)",
      servingSize: "2 softgels",
      servingsPerContainer: 45,
      mgPerServing: "1,250 mg EPA+DHA (per 2 softgels)",
      certifications: ["IFOS 5-Star", "Non-GMO", "GMP", "Wild Caught", "Gluten Free"],
      fullDescription: "Sports Research Triple Strength Omega-3 delivers 1,250 mg of combined EPA and DHA in the natural triglyceride (TG) form — the same molecular structure as omega-3s in whole fish, with significantly better absorption and stability than the cheaper ethyl ester (EE) form found in mass-market supplements. The fish are wild-caught from sustainable Alaskan waters and certified by IFOS (International Fish Oil Standards) at the highest 5-star rating for purity, potency, and oxidation stability. This is the bestselling omega-3 on iHerb with over 15,000 reviews. Each batch is third-party tested for heavy metals, PCBs, and dioxins, with certificates of analysis available on request.",
    },
    {
      brand: "Nordic Naturals", productName: "Ultimate Omega", size: "60 softgels",
      approxPrice: 27, rating: 4.9, reviewCount: 8400, badge: "Premium",
      searchQuery: "Nordic Naturals Ultimate Omega",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
    {
      brand: "NOW Foods", productName: "Ultra Omega-3", size: "180 softgels",
      approxPrice: 20, rating: 4.7, reviewCount: 7200, badge: "Best Value",
      searchQuery: "NOW Foods Ultra Omega-3",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
  ],

  "omega3-algae": [
    {
      brand: "Ovega-3", productName: "Plant-Based Omega-3", size: "60 softgels",
      approxPrice: 28, rating: 4.6, reviewCount: 2400, badge: "Bestseller",
      productPath: "/pr/swanson-vitamins-plant-based-omega-3-120-liquid-vegan-capsules/149122",
      brandBg: "#d1fae5", brandInk: "#065f46",
      imageUrl: "/products/omega3-algae.jpg",
      form: "Vegan Softgels",
      ingredientForm: "DHA + EPA from microalgae (Schizochytrium sp.)",
      servingSize: "1 softgel",
      servingsPerContainer: 60,
      mgPerServing: "500 mg total omega-3 (135 mg EPA + 270 mg DHA)",
      certifications: ["Vegan", "Non-GMO", "Sustainably Sourced", "Mercury Free", "GMP"],
      fullDescription: "Ovega-3 was one of the first algae-based omega-3 supplements on the US market, providing a fully vegan alternative to fish oil without compromising on EPA and DHA content. The omega-3s are extracted from sustainably-cultivated marine microalgae (Schizochytrium sp.) grown in closed-loop systems — entirely free of ocean contamination concerns. Each softgel delivers 500 mg of total omega-3s. Vegans, vegetarians, and people with fish or shellfish allergies depend on algae oil as their long-chain omega-3 source. Standard dose is 1–2 softgels daily with a fat-containing meal for optimal absorption.",
    },
    {
      brand: "Nordic Naturals", productName: "Algae Omega", size: "60 softgels",
      approxPrice: 31, rating: 4.8, reviewCount: 1900, badge: "Premium",
      searchQuery: "Nordic Naturals Algae Omega",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
    {
      brand: "Sports Research", productName: "Vegan Omega 3 from Algae", size: "60 softgels",
      approxPrice: 26, rating: 4.7, reviewCount: 1500, badge: "Vegan",
      searchQuery: "Sports Research Vegan Omega from Algae",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],

  multivit: [
    {
      brand: "Garden of Life", productName: "mykind Organics Multivitamin", size: "60 tablets",
      approxPrice: 28, rating: 4.7, reviewCount: 4200, badge: "Bestseller",
      productPath: "/pr/garden-of-life-organics-women-s-multi-60-vegan-tablets/106223",
      brandBg: "#d1fae5", brandInk: "#065f46",
      imageUrl: "/products/multivit.jpg",
      form: "Vegan Tablets",
      ingredientForm: "Whole-food cultured vitamins + organic-food blend",
      servingSize: "2 tablets",
      servingsPerContainer: 30,
      mgPerServing: "16 vitamins + 8 minerals from 30+ organic foods",
      certifications: ["USDA Organic", "Non-GMO Project Verified", "Vegan", "Gluten Free", "Kosher"],
      fullDescription: "Garden of Life mykind Organics was the first certified-organic, whole-food multivitamin ever to reach the US market — formulated by author and health advocate Alicia Silverstone. The vitamins are cultured on whole-food substrates (broccoli, peppers, oranges, tomatoes, beets) rather than synthesized chemically, providing them alongside the natural cofactors that enhance recognition and absorption by the body. Take 2 tablets daily with food. Available in Women, Men, Prenatal, and 40+ formulations tuned to life stage. Note: the daily serving spans 2 tablets, so a 60-tablet bottle is a 30-day supply.",
    },
    {
      brand: "Thorne", productName: "Basic Nutrients 2/Day", size: "60 capsules",
      approxPrice: 38, rating: 4.8, reviewCount: 1800, badge: "Premium",
      searchQuery: "Thorne Basic Nutrients 2 Day",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
    {
      brand: "Pure Encapsulations", productName: "O.N.E. Multivitamin", size: "60 capsules",
      approxPrice: 42, rating: 4.8, reviewCount: 2900, badge: "Editor's Pick",
      searchQuery: "Pure Encapsulations O.N.E. Multivitamin",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
  ],

  "mag-glycinate": [
    {
      brand: "Doctor's Best", productName: "High Absorption Magnesium Glycinate", size: "240 tablets",
      approxPrice: 18, rating: 4.7, reviewCount: 32000, badge: "Bestseller",
      productPath: "/pr/doctor-s-best-high-absorption-magnesium-120-tablets-100-mg-per-tablet/15",
      brandBg: "#dbeafe", brandInk: "#1e40af",
      imageUrl: "/products/mag-glycinate.jpg",
      form: "Tablets",
      ingredientForm: "Magnesium Glycinate Lysinate Chelate (Albion TRAACS)",
      servingSize: "2 tablets",
      servingsPerContainer: 120,
      mgPerServing: "200 mg elemental magnesium (per 2 tablets)",
      certifications: ["Non-GMO", "Gluten Free", "Soy Free", "GMP", "Vegan"],
      fullDescription: "Doctor's Best High Absorption Magnesium uses the patented Albion TRAACS chelate — a glycinate-lysinate complex that is exceptionally well-absorbed and non-laxative even at high doses, making it suitable for evening sleep support. Albion is the same chelate technology used in most clinical magnesium studies, ensuring you get the form that researchers have validated. Each two-tablet serving delivers 200 mg of elemental magnesium; for a target of 400 mg/day, take two servings — one with dinner and one before bed. With over 32,000 reviews on iHerb, this is one of the most-recommended magnesium products on the platform.",
    },
    {
      brand: "NOW Foods", productName: "Magnesium Glycinate", size: "180 tablets",
      approxPrice: 15, rating: 4.7, reviewCount: 9800, badge: "Best Value",
      searchQuery: "NOW Foods Magnesium Glycinate Tablets",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "KAL", productName: "Magnesium Glycinate 400", size: "180 tablets",
      approxPrice: 22, rating: 4.7, reviewCount: 6200, badge: "Premium",
      searchQuery: "KAL Magnesium Glycinate 400",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],

  ashwagandha: [
    {
      brand: "Jarrow Formulas", productName: "Ashwagandha KSM-66", size: "120 veg capsules",
      approxPrice: 18, rating: 4.7, reviewCount: 5400, badge: "Bestseller",
      productPath: "/pr/jarrow-formulas-ashwagandha-300-mg-120-veggie-capsules/3302",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/ashwagandha.jpg",
      form: "Veggie Capsules",
      ingredientForm: "KSM-66 Ashwagandha Root Extract (5% withanolides)",
      servingSize: "1 veggie capsule",
      servingsPerContainer: 120,
      mgPerServing: "300 mg KSM-66 (root only, full-spectrum)",
      certifications: ["Vegetarian", "Non-GMO", "GMP", "Kosher", "Soy Free"],
      fullDescription: "Jarrow Formulas Ashwagandha uses KSM-66 — the most clinically studied ashwagandha extract in the world, with over 20 published randomized controlled trials demonstrating effects on stress, cortisol, sleep, and exercise recovery. KSM-66 is made exclusively from ashwagandha roots (no leaf, which contains different bioactives) using a green-chemistry process that requires no chemical solvents. The 5% withanolide standardization ensures consistent dosing batch to batch. Take 1–2 capsules daily for 600 mg, the dose used in most clinical research. Effects typically emerge within 2–4 weeks. Best taken with a meal to maximize absorption.",
    },
    {
      brand: "NOW Foods", productName: "Ashwagandha", size: "180 veg capsules",
      approxPrice: 17, rating: 4.6, reviewCount: 7100, badge: "Best Value",
      searchQuery: "NOW Foods Ashwagandha 450",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "Solgar", productName: "Ashwagandha Root Extract", size: "60 veg capsules",
      approxPrice: 24, rating: 4.7, reviewCount: 2800, badge: "Premium",
      searchQuery: "Solgar Ashwagandha Root Extract",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
  ],

  "l-theanine": [
    {
      brand: "NOW Foods", productName: "L-Theanine 200mg with Suntheanine", size: "120 veg capsules",
      approxPrice: 18, rating: 4.7, reviewCount: 6900, badge: "Bestseller",
      productPath: "/pr/now-foods-l-theanine-120-veg-capsules/54096",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/l-theanine.jpg",
      form: "Veggie Capsules",
      ingredientForm: "Suntheanine L-Theanine (pure L-isomer)",
      servingSize: "1 veg capsule",
      servingsPerContainer: 120,
      mgPerServing: "200 mg Suntheanine L-Theanine",
      certifications: ["Non-GMO", "Vegan", "Kosher", "GMP", "Soy Free", "Halal"],
      fullDescription: "NOW Foods L-Theanine uses Suntheanine — the patented, pure L-isomer form developed by Japan's Taiyo International and used in nearly all published L-theanine research. Unlike cheaper racemic D/L mixes, Suntheanine delivers only the bioactive L-form, ensuring the calming alpha-wave response the clinical studies validate. Take 1 capsule any time of day; it pairs especially well with coffee or matcha to smooth the stimulant edge without sacrificing alertness. The 120-capsule bottle at 200 mg each provides 4 months of daily use.",
    },
    {
      brand: "Doctor's Best", productName: "Suntheanine L-Theanine", size: "90 veg capsules",
      approxPrice: 16, rating: 4.7, reviewCount: 3200, badge: "Editor's Pick",
      searchQuery: "Doctor's Best Suntheanine L-Theanine",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
    {
      brand: "Jarrow Formulas", productName: "Theanine 200", size: "60 veg capsules",
      approxPrice: 19, rating: 4.7, reviewCount: 1800, badge: "Premium",
      searchQuery: "Jarrow Formulas Theanine 200",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],

  glycine: [
    {
      brand: "NOW Foods", productName: "Glycine Pure Powder", size: "454 g",
      approxPrice: 14, rating: 4.7, reviewCount: 3400, badge: "Bestseller",
      productPath: "/pr/now-foods-glycine-pure-powder-1-lb-454-g/615",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/glycine.jpg",
      form: "Pure Powder",
      ingredientForm: "L-Glycine (free-form, no fillers)",
      servingSize: "1 level teaspoon (~3 g)",
      servingsPerContainer: 75,
      mgPerServing: "3 g free-form L-glycine",
      certifications: ["Non-GMO", "Vegan", "Kosher", "GMP", "Gluten Free"],
      fullDescription: "NOW Foods Glycine Powder provides pure free-form L-glycine — the smallest of the amino acids and a precursor to glutathione, collagen, and creatine. The powder dissolves clearly in water with a faintly sweet taste, making it easy to add to evening tea or any wind-down ritual. Standard clinical sleep dose is 3 g (one level teaspoon) taken 30–60 minutes before bed. The 8 oz (227 g) tub provides 75 daily servings — roughly 2.5 months of nightly use. Pure glycine has no smell and won't alter the taste of most beverages.",
    },
    {
      brand: "Source Naturals", productName: "Glycine 500mg", size: "200 capsules",
      approxPrice: 12, rating: 4.6, reviewCount: 1100, badge: "Best Value",
      searchQuery: "Source Naturals Glycine 500",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
    {
      brand: "BulkSupplements", productName: "Glycine Powder", size: "500 g",
      approxPrice: 16, rating: 4.7, reviewCount: 5200, badge: "Editor's Pick",
      searchQuery: "BulkSupplements Glycine Powder",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
  ],

  b12: [
    {
      brand: "Jarrow Formulas", productName: "Methyl B-12 1000mcg", size: "100 lozenges",
      approxPrice: 12, rating: 4.8, reviewCount: 11000, badge: "Bestseller",
      productPath: "/pr/jarrow-formulas-methyl-b-12-fruit-500-mcg-100-chewable-tablets/43808",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/b12.jpg",
      form: "Sublingual Lozenges",
      ingredientForm: "Methylcobalamin (active B12)",
      servingSize: "1 lozenge",
      servingsPerContainer: 100,
      mgPerServing: "1,000 mcg Methylcobalamin",
      certifications: ["Vegan", "Non-GMO", "Kosher", "Gluten Free"],
      fullDescription: "Jarrow Formulas Methyl B-12 uses methylcobalamin — the active, ready-to-use form of vitamin B12 that the body can absorb directly without enzymatic conversion. The lemon-flavored sublingual lozenge dissolves under the tongue, allowing B12 to be absorbed through the oral mucosa, bypassing potential gut absorption issues that affect older adults and people on PPIs, metformin, or with autoimmune gastritis. Vegans and vegetarians need a reliable B12 source like this one — daily or weekly use covers the requirement and prevents the silent neurological damage of long-term deficiency.",
    },
    {
      brand: "Garden of Life", productName: "mykind Organics B-12 Spray", size: "58 ml",
      approxPrice: 16, rating: 4.7, reviewCount: 3400, badge: "Editor's Pick",
      searchQuery: "Garden of Life mykind Organics B-12 Spray",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
    {
      brand: "Thorne", productName: "Methylcobalamin B12", size: "60 capsules",
      approxPrice: 22, rating: 4.8, reviewCount: 1600, badge: "Premium",
      searchQuery: "Thorne Methylcobalamin",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
  ],

  "b-complex": [
    {
      brand: "Thorne", productName: "Basic B Complex", size: "60 capsules",
      approxPrice: 28, rating: 4.8, reviewCount: 4400, badge: "Bestseller",
      productPath: "/pr/thorne-basic-b-complex-60-capsules/18791",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
      imageUrl: "/products/b-complex.jpg",
      form: "Veggie Capsules",
      ingredientForm: "Active forms of all 8 B vitamins (methylated where applicable)",
      servingSize: "1 capsule",
      servingsPerContainer: 60,
      mgPerServing: "Full B-complex (B1, B2, B3, B5, B6, B7, B9, B12 — active forms)",
      certifications: ["Gluten Free", "Dairy Free", "Soy Free", "Non-GMO"],
      fullDescription: "Thorne Basic B Complex is the practitioner-grade foundational B-vitamin formula featuring all eight B vitamins in their active, bioavailable forms — including methylfolate (5-MTHF), methylcobalamin (B12), and P-5-P (B6). This is critical for the estimated 30–50% of adults with MTHFR variants who poorly activate synthetic folic acid and cyanocobalamin. Thorne is one of the most trusted clinician brands in the US, with strict purity testing on every batch and NSF Certified for Sport status on many products. Take 1 capsule with breakfast — B vitamins can be mildly energizing and are best avoided in the evening.",
    },
    {
      brand: "Jarrow Formulas", productName: "B-Right Complex", size: "100 capsules",
      approxPrice: 16, rating: 4.8, reviewCount: 8100, badge: "Best Value",
      searchQuery: "Jarrow B-Right",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
    {
      brand: "Pure Encapsulations", productName: "B-Complex Plus", size: "60 capsules",
      approxPrice: 34, rating: 4.8, reviewCount: 1900, badge: "Premium",
      searchQuery: "Pure Encapsulations B-Complex Plus",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
  ],

  rhodiola: [
    {
      brand: "NOW Foods", productName: "Rhodiola 500mg", size: "120 veg capsules",
      approxPrice: 17, rating: 4.6, reviewCount: 4800, badge: "Bestseller",
      productPath: "/pr/now-foods-rhodiola-500-mg-120-veg-capsules/123463",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/rhodiola.jpg",
      form: "Veggie Capsules",
      ingredientForm: "Rhodiola Rosea Root Extract (3% rosavins, 1% salidrosides)",
      servingSize: "1 capsule",
      servingsPerContainer: 60,
      mgPerServing: "500 mg Rhodiola standardized extract",
      certifications: ["Non-GMO", "Vegan", "Kosher", "Halal", "GMP"],
      fullDescription: "NOW Foods Rhodiola provides a standardized root extract of Rhodiola rosea — the Arctic adaptogen traditionally used to enhance stamina and stress resilience. Standardization to 3% rosavins and 1% salidrosides ensures consistent dosing of the two active marker compounds across batches. Take 1 capsule in the morning or early afternoon (avoid evening — Rhodiola is gently stimulating). Effects on perceived fatigue and stress tolerance typically appear within days, building over 2–4 weeks. Best taken on an empty stomach for fastest absorption. Avoid during pregnancy and with bipolar disorder.",
    },
    {
      brand: "Gaia Herbs", productName: "Rhodiola Rosea", size: "60 veg capsules",
      approxPrice: 21, rating: 4.7, reviewCount: 2100, badge: "Editor's Pick",
      searchQuery: "Gaia Herbs Rhodiola Rosea",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
    {
      brand: "Doctor's Best", productName: "Rhodiola", size: "60 veg capsules",
      approxPrice: 14, rating: 4.6, reviewCount: 1600, badge: "Best Value",
      searchQuery: "Doctor's Best Rhodiola",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
  ],

  "lions-mane": [
    {
      brand: "Host Defense", productName: "Lion's Mane", size: "60 capsules",
      approxPrice: 27, rating: 4.7, reviewCount: 6300, badge: "Bestseller",
      productPath: "/pr/host-defense-mushrooms-lion-s-mane-60-capsules-0-5-g-per-capsule/21455",
      brandBg: "#f5f5f4", brandInk: "#57534e",
      imageUrl: "/products/lions-mane.jpg",
      form: "Veg Capsules",
      ingredientForm: "Organic Lion's Mane (fruiting body + mycelium)",
      servingSize: "2 capsules",
      servingsPerContainer: 60,
      mgPerServing: "1,000 mg Organic Hericium erinaceus",
      certifications: ["USDA Organic", "Non-GMO Project Verified", "Vegan", "Kosher", "Gluten Free"],
      fullDescription: "Host Defense was founded by world-renowned mycologist Paul Stamets and grows all its mushrooms organically in the Pacific Northwest. The Lion's Mane formula uses both fruiting body and mycelium to deliver the full spectrum of bioactive compounds — hericenones (concentrated in the fruiting body) and erinacines (concentrated in the mycelium). Both compound classes have been studied for their support of nerve growth factor (NGF). Take 2 capsules daily; effects on cognition, focus, and memory build over 8–12 weeks of consistent use, paralleling the natural pace of neuroplastic change.",
    },
    {
      brand: "Real Mushrooms", productName: "Organic Lions Mane Extract", size: "120 capsules",
      approxPrice: 30, rating: 4.8, reviewCount: 4900, badge: "Editor's Pick",
      searchQuery: "Real Mushrooms Lions Mane Extract",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
    {
      brand: "NOW Foods", productName: "Lion's Mane 500mg", size: "60 veg capsules",
      approxPrice: 18, rating: 4.6, reviewCount: 2400, badge: "Best Value",
      searchQuery: "NOW Foods Lion's Mane 500",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
  ],

  creatine: [
    {
      brand: "Optimum Nutrition", productName: "Creatine Monohydrate Powder", size: "600 g",
      approxPrice: 24, rating: 4.8, reviewCount: 13800, badge: "Bestseller",
      productPath: "/pr/optimum-nutrition-micronized-creatine-powder-unflavored-1-32-lb-600-g/68616",
      brandBg: "#fef9c3", brandInk: "#854d0e",
      imageUrl: "/products/creatine.jpg",
      form: "Powder (Unflavored)",
      ingredientForm: "Creatine Monohydrate (micronized)",
      servingSize: "1 rounded teaspoon (5 g)",
      servingsPerContainer: 120,
      mgPerServing: "5 g creatine monohydrate",
      certifications: ["Informed Choice", "GMP", "Gluten Free"],
      fullDescription: "Optimum Nutrition Micronized Creatine is the unflavored, micronized form of the most-researched performance supplement in the world. Micronization reduces particle size, improving dissolution in water and minimizing the rare gut discomfort that plain creatine can cause. Each 5 g serving delivers a clinically-effective daily dose of pure creatine monohydrate — no fillers, no stimulants, no flavors. The 600 g tub provides 120 daily servings (a 4-month supply), making this one of the best per-serving values on iHerb. Mix with water, juice, or a post-workout shake; effects build over 2–4 weeks as muscle phosphocreatine stores saturate.",
    },
    {
      brand: "NOW Foods", productName: "Creatine Monohydrate Pure Powder", size: "1 kg",
      approxPrice: 26, rating: 4.8, reviewCount: 5400, badge: "Best Value",
      searchQuery: "NOW Foods Creatine Monohydrate Pure Powder",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "BulkSupplements", productName: "Creatine Monohydrate", size: "500 g",
      approxPrice: 16, rating: 4.8, reviewCount: 9100, badge: "Editor's Pick",
      searchQuery: "BulkSupplements Creatine Monohydrate",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
  ],

  collagen: [
    {
      brand: "Sports Research", productName: "Collagen Peptides", size: "454 g",
      approxPrice: 32, rating: 4.7, reviewCount: 21000, badge: "Bestseller",
      productPath: "/pr/sports-research-collagen-peptides-unflavored-16-oz-454-g/71106",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/collagen.jpg",
      form: "Pure Powder (Unflavored)",
      ingredientForm: "Hydrolyzed Type I & III Collagen Peptides (grass-fed bovine)",
      servingSize: "1 scoop (~11 g)",
      servingsPerContainer: 41,
      mgPerServing: "11 g hydrolyzed collagen peptides (18 amino acids)",
      certifications: ["Grass-Fed", "Non-GMO Project Verified", "Paleo Friendly", "Keto Certified", "Gluten Free"],
      fullDescription: "Sports Research Collagen Peptides are sourced from grass-fed, pasture-raised cattle, then hydrolyzed into small di- and tripeptides that the body absorbs easily and uses for skin elasticity, joint comfort, and connective tissue repair. The unflavored powder dissolves clear in hot or cold beverages — coffee, smoothies, water, soups — without clumping or grit. Each scoop delivers 11 g of Type I and III collagen plus all 18 collagen amino acids. Standard daily dose is 1–2 scoops. Visible improvements in skin elasticity, hair, and nails typically emerge after 8–12 weeks of consistent use.",
    },
    {
      brand: "Vital Proteins", productName: "Collagen Peptides", size: "284 g",
      approxPrice: 27, rating: 4.7, reviewCount: 12400, badge: "Premium",
      searchQuery: "Vital Proteins Collagen Peptides",
      brandBg: "#e0e7ff", brandInk: "#3730a3",
    },
    {
      brand: "Garden of Life", productName: "Grass Fed Collagen Peptides", size: "560 g",
      approxPrice: 35, rating: 4.7, reviewCount: 4800, badge: "Editor's Pick",
      searchQuery: "Garden of Life Grass Fed Collagen Peptides",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
  ],

  curcumin: [
    {
      brand: "Doctor's Best", productName: "High Absorption Curcumin with BioPerine", size: "180 capsules",
      approxPrice: 22, rating: 4.7, reviewCount: 7600, badge: "Bestseller",
      productPath: "/pr/doctor-s-best-curcumin-phytosome-180-veggie-caps-500-mg-per-capsule/46873",
      brandBg: "#dbeafe", brandInk: "#1e40af",
      imageUrl: "/products/curcumin.jpg",
      form: "Veggie Capsules",
      ingredientForm: "Curcumin C3 Complex + BioPerine (piperine 95%)",
      servingSize: "1 capsule",
      servingsPerContainer: 120,
      mgPerServing: "500 mg curcuminoids + 5 mg BioPerine",
      certifications: ["Vegan", "Non-GMO", "Gluten Free", "Soy Free", "GMP"],
      fullDescription: "Doctor's Best Curcumin pairs C3 Complex — a clinically-validated standardized extract delivering 95% total curcuminoids (curcumin, demethoxycurcumin, and bisdemethoxycurcumin) — with BioPerine, a patented black-pepper extract that increases curcumin bioavailability by up to 2,000%. Without piperine or another bioavailability enhancer, plain curcumin is poorly absorbed. Take 1–2 capsules daily with a meal containing fat for additional absorption support. Pause use for 1–2 weeks before any scheduled surgery and use cautiously alongside blood-thinning medications due to mild antiplatelet effects.",
    },
    {
      brand: "Thorne", productName: "Meriva-SF", size: "120 capsules",
      approxPrice: 56, rating: 4.8, reviewCount: 1900, badge: "Premium",
      searchQuery: "Thorne Meriva-SF Curcumin",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
    {
      brand: "NOW Foods", productName: "Curcumin", size: "120 veg capsules",
      approxPrice: 20, rating: 4.7, reviewCount: 3200, badge: "Best Value",
      searchQuery: "NOW Foods Curcumin",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
  ],

  glucosamine: [
    {
      brand: "NOW Foods", productName: "Glucosamine & Chondroitin with MSM", size: "180 veg capsules",
      approxPrice: 25, rating: 4.7, reviewCount: 6900, badge: "Bestseller",
      productPath: "/pr/now-foods-glucosamine-chondroitin-with-msm-180-capsules/581",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/glucosamine.jpg",
      form: "Capsules",
      ingredientForm: "Glucosamine HCl + Chondroitin Sulfate + MSM",
      servingSize: "3 capsules",
      servingsPerContainer: 60,
      mgPerServing: "1,500 mg Glucosamine + 1,200 mg Chondroitin + 500 mg MSM",
      certifications: ["GMP", "Non-GMO"],
      fullDescription: "NOW Foods Glucosamine, Chondroitin & MSM is the classic joint-support triad delivered in the clinically-referenced 1,500/1,200/500 mg daily ratio. Glucosamine HCl provides the precursor for cartilage glycosaminoglycans; chondroitin sulfate attracts water to the cartilage matrix and inhibits cartilage-degrading enzymes; MSM contributes bioavailable sulfur for connective tissue and joint comfort. Allow 8–12 weeks of consistent daily use to gauge response. Important: glucosamine is shellfish-derived — this product is not appropriate for those with shellfish allergies.",
    },
    {
      brand: "Doctor's Best", productName: "Glucosamine Chondroitin MSM", size: "240 capsules",
      approxPrice: 28, rating: 4.7, reviewCount: 3400, badge: "Best Value",
      searchQuery: "Doctor's Best Glucosamine Chondroitin MSM",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
    {
      brand: "Solgar", productName: "Glucosamine Chondroitin MSM", size: "120 tablets",
      approxPrice: 36, rating: 4.7, reviewCount: 1800, badge: "Premium",
      searchQuery: "Solgar Glucosamine Chondroitin MSM",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],

  "vit-c": [
    {
      brand: "NOW Foods", productName: "Vitamin C-1000 with Rose Hips", size: "250 tablets",
      approxPrice: 14, rating: 4.8, reviewCount: 7800, badge: "Bestseller",
      productPath: "/pr/now-foods-c-500-with-rose-hips-250-tablets/478",
      brandBg: "#fdebe1", brandInk: "#c2410c",
      imageUrl: "/products/vit-c.jpg",
      form: "Capsules",
      ingredientForm: "Calcium Ascorbate + Citrus Bioflavonoids (buffered, non-acidic)",
      servingSize: "2 capsules",
      servingsPerContainer: 90,
      mgPerServing: "1,000 mg buffered Vitamin C + bioflavonoid complex",
      certifications: ["Non-GMO Project Verified", "Vegan", "Gluten Free"],
      fullDescription: "Nature's Way Buffered Vitamin C combines calcium ascorbate — a non-acidic, pH-balanced form of vitamin C — with citrus bioflavonoids (rutin, hesperidin, and quercetin), the natural plant compounds that accompany vitamin C in whole foods and enhance its antioxidant activity. The buffered form is significantly gentler on the stomach than plain ascorbic acid, making higher daily doses (1,000–2,000 mg) comfortable for sensitive digestive systems. Vitamin C is water-soluble; split larger doses across the day for sustained tissue saturation.",
    },
    {
      brand: "Nature's Way", productName: "Vitamin C Buffered", size: "100 capsules",
      approxPrice: 11, rating: 4.7, reviewCount: 2900, badge: "Best Value",
      searchQuery: "Nature's Way Vitamin C Buffered",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
    {
      brand: "Thorne", productName: "Vitamin C with Flavonoids", size: "90 capsules",
      approxPrice: 23, rating: 4.8, reviewCount: 1400, badge: "Premium",
      searchQuery: "Thorne Vitamin C Flavonoids",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
  ],

  zinc: [
    {
      brand: "Thorne", productName: "Zinc Picolinate 15mg", size: "60 capsules",
      approxPrice: 12, rating: 4.8, reviewCount: 6700, badge: "Bestseller",
      productPath: "/pr/thorne-zinc-picolinate-15-mg-60-capsules/18476",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
      imageUrl: "/products/zinc.jpg",
      form: "Capsules",
      ingredientForm: "Zinc Picolinate (highly bioavailable chelate)",
      servingSize: "1 capsule",
      servingsPerContainer: 60,
      mgPerServing: "15 mg elemental zinc (as zinc picolinate)",
      certifications: ["NSF Certified for Sport", "Gluten Free", "Dairy Free", "Soy Free"],
      fullDescription: "Thorne Zinc Picolinate delivers 15 mg of elemental zinc bound to picolinic acid — a chelate that significantly enhances absorption compared to cheaper forms like zinc oxide. Thorne is one of the most-trusted practitioner brands in the US and one of the few supplement companies to hold NSF Certified for Sport status on many products, ensuring purity, potency, and freedom from over 200 banned substances. Take 1 capsule with food. Long-term doses above 40 mg/day can disrupt copper balance — pair with 1–2 mg of copper if dosing higher or for extended periods.",
    },
    {
      brand: "NOW Foods", productName: "Zinc Picolinate 50mg", size: "120 veg capsules",
      approxPrice: 9, rating: 4.7, reviewCount: 4100, badge: "Best Value",
      searchQuery: "NOW Foods Zinc Picolinate",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "Solgar", productName: "Zinc Picolinate 22mg", size: "100 tablets",
      approxPrice: 13, rating: 4.7, reviewCount: 1200, badge: "Editor's Pick",
      searchQuery: "Solgar Zinc Picolinate",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],

  elderberry: [
    {
      brand: "Sambucol", productName: "Black Elderberry Original", size: "120 ml",
      approxPrice: 18, rating: 4.8, reviewCount: 8200, badge: "Bestseller",
      productPath: "/pr/sambucol-black-elderberry-immune-syrup-original-formula-4-fl-oz-120-ml/68251",
      brandBg: "#ede9fe", brandInk: "#5b21b6",
      imageUrl: "/products/elderberry.jpg",
      form: "Liquid Syrup",
      ingredientForm: "Black Elderberry Standardized Extract (Sambucus nigra)",
      servingSize: "1 teaspoon (5 mL)",
      servingsPerContainer: 23,
      mgPerServing: "~3,800 mg elderberry fruit equivalent",
      certifications: ["Kosher", "Gluten Free", "Non-GMO"],
      fullDescription: "Sambucol Black Elderberry is the original clinically-studied elderberry preparation — the same syrup used in the placebo-controlled trials that established elderberry's role in upper respiratory immune support. Developed by Israeli virologist Dr. Madeleine Mumcuoglu, the extract is standardized to a consistent anthocyanin content (the dark purple pigments that drive elderberry's antiviral activity). At the first sign of cold or flu symptoms, take 1 teaspoon four times daily for 3–5 days. Not recommended for daily preventive use in people with autoimmune conditions, as elderberry gently activates immune signaling.",
    },
    {
      brand: "Gaia Herbs", productName: "Black Elderberry Syrup", size: "89 ml",
      approxPrice: 22, rating: 4.7, reviewCount: 1900, badge: "Premium",
      searchQuery: "Gaia Herbs Black Elderberry Syrup",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
    {
      brand: "Nature's Way", productName: "Sambucus Elderberry Gummies", size: "60 gummies",
      approxPrice: 14, rating: 4.7, reviewCount: 5800, badge: "Best Value",
      searchQuery: "Nature's Way Sambucus Elderberry Gummies",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
  ],

  probiotic: [
    {
      brand: "Garden of Life", productName: "Dr. Formulated Probiotics Mood+", size: "60 capsules",
      approxPrice: 42, rating: 4.6, reviewCount: 6400, badge: "Bestseller",
      productPath: "/pr/garden-of-life-dr-formulated-probiotics-mood-60-vegetarian-capsules/71133",
      brandBg: "#d1fae5", brandInk: "#065f46",
      imageUrl: "/products/probiotic.jpg",
      form: "Veggie Capsules (delayed-release)",
      ingredientForm: "50 Billion CFU, 15 probiotic strains (Lacto + Bifido + S. boulardii)",
      servingSize: "1 capsule",
      servingsPerContainer: 60,
      mgPerServing: "50 billion CFU at expiration (15 strains, mood-focused blend)",
      certifications: ["Non-GMO Project Verified", "Vegetarian", "Gluten Free", "Dairy Free", "Soy Free", "Shelf Stable"],
      fullDescription: "Garden of Life Dr. Formulated Probiotics Mood+ is a 50-billion-CFU multi-strain probiotic specifically formulated by Dr. David Perlmutter for the gut-brain axis. Key strains — Lactobacillus helveticus R0052 and Bifidobacterium longum R0175 — have published clinical research demonstrating effects on mood, stress, and emotional well-being via the vagus nerve and short-chain fatty acid production. The delayed-release capsule protects bacteria through stomach acid for delivery to the colon. Take 1 capsule daily; refrigeration extends potency but isn't strictly required.",
    },
    {
      brand: "Renew Life", productName: "Ultimate Flora Extra Care", size: "60 capsules",
      approxPrice: 38, rating: 4.7, reviewCount: 4300, badge: "Editor's Pick",
      searchQuery: "Renew Life Ultimate Flora Extra Care 30 Billion",
      brandBg: "#dbeafe", brandInk: "#1e40af",
    },
    {
      brand: "Now Foods", productName: "Probiotic-10 50 Billion", size: "100 veg capsules",
      approxPrice: 36, rating: 4.7, reviewCount: 7900, badge: "Best Value",
      searchQuery: "NOW Foods Probiotic-10 50 Billion",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
  ],

  "digestive-enzymes": [
    {
      brand: "Enzymedica", productName: "Digest Gold + ATPro", size: "120 capsules",
      approxPrice: 38, rating: 4.8, reviewCount: 5100, badge: "Bestseller",
      productPath: "/pr/enzymedica-digest-gold-with-atpro-maximum-strength-21-capsules/74618",
      brandBg: "#ede9fe", brandInk: "#5b21b6",
      imageUrl: "/products/digestive-enzymes.jpg",
      form: "Veggie Capsules",
      ingredientForm: "Broad-spectrum plant-based enzyme blend (Thera-blend technology)",
      servingSize: "1 capsule",
      servingsPerContainer: 90,
      mgPerServing: "14 digestive enzymes (Amylase, Protease, Lipase, Cellulase, Lactase + 9 more)",
      certifications: ["Non-GMO Project Verified", "Vegan", "Kosher", "Gluten Free", "Dairy Free"],
      fullDescription: "Enzymedica Digest Gold is one of the most potent broad-spectrum digestive enzyme blends on the market, providing 14 enzymes that target every macronutrient in food: proteases for protein, lipase for fat, amylase and glucoamylase for starches, lactase for dairy, alpha-galactosidase for cruciferous-vegetable carbs, and cellulase for plant fibers. The Thera-blend technology ensures each enzyme remains active across the wide pH range of the entire digestive tract. Take 1 capsule at the start of each main meal — especially useful for large meals, plant-heavy diets, or anyone experiencing post-meal bloating.",
    },
    {
      brand: "NOW Foods", productName: "Super Enzymes", size: "180 tablets",
      approxPrice: 22, rating: 4.7, reviewCount: 6200, badge: "Best Value",
      searchQuery: "NOW Foods Super Enzymes",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "Garden of Life", productName: "Dr. Formulated Enzymes Organic Digest+", size: "90 chewables",
      approxPrice: 18, rating: 4.6, reviewCount: 1900, badge: "Editor's Pick",
      searchQuery: "Garden of Life Dr Formulated Enzymes Digest+",
      brandBg: "#d1fae5", brandInk: "#065f46",
    },
  ],

  iron: [
    {
      brand: "Solgar", productName: "Gentle Iron Bisglycinate 25mg", size: "180 veg capsules",
      approxPrice: 16, rating: 4.8, reviewCount: 4200, badge: "Bestseller",
      productPath: "/pr/solgar-gentle-iron-25-mg-180-vegetable-capsules/10625",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/iron.jpg",
      form: "Veg Capsules",
      ingredientForm: "Iron Bisglycinate (Ferrochel, by Albion)",
      servingSize: "1 veg capsule",
      servingsPerContainer: 90,
      mgPerServing: "25 mg elemental iron (as bisglycinate)",
      certifications: ["Vegan", "Non-GMO", "Kosher", "Gluten Free", "Sugar Free"],
      fullDescription: "Solgar Gentle Iron uses Ferrochel — a patented Albion iron bisglycinate chelate that is significantly better absorbed and dramatically gentler on the stomach than ferrous sulfate, the form found in most cheap iron supplements. Constipation, nausea, and stomach upset, the most common complaints about iron supplementation, are largely eliminated with the chelated form. Take 1 capsule daily with vitamin C-rich food (or a 500 mg vitamin C supplement) to maximize absorption. Take away from coffee, tea, calcium, or dairy — all of which inhibit iron absorption. Recheck ferritin levels every 3 months to confirm progress.",
    },
    {
      brand: "Thorne", productName: "Iron Bisglycinate 25mg", size: "60 capsules",
      approxPrice: 14, rating: 4.8, reviewCount: 2800, badge: "Premium",
      searchQuery: "Thorne Iron Bisglycinate",
      brandBg: "#f3f4f6", brandInk: "#1f2937",
    },
    {
      brand: "MegaFood", productName: "Blood Builder", size: "60 tablets",
      approxPrice: 22, rating: 4.7, reviewCount: 7400, badge: "Editor's Pick",
      searchQuery: "MegaFood Blood Builder",
      brandBg: "#fee2e2", brandInk: "#991b1b",
    },
  ],

  coq10: [
    {
      brand: "Doctor's Best", productName: "Ubiquinol with Kaneka", size: "60 softgels",
      approxPrice: 32, rating: 4.7, reviewCount: 5800, badge: "Bestseller",
      productPath: "/pr/doctor-s-best-high-absorption-coq10-100-mg-120-softgels/10930",
      brandBg: "#dbeafe", brandInk: "#1e40af",
      imageUrl: "/products/coq10.jpg",
      form: "Softgels",
      ingredientForm: "Kaneka Ubiquinol (active reduced form of CoQ10)",
      servingSize: "1 softgel",
      servingsPerContainer: 60,
      mgPerServing: "100 mg Kaneka Ubiquinol",
      certifications: ["Non-GMO", "Gluten Free", "Soy Free", "GMP"],
      fullDescription: "Doctor's Best High Absorption Ubiquinol uses the Kaneka brand — the original Japan-developed ubiquinol used in nearly all published clinical studies on the active reduced form of CoQ10. Unlike conventional CoQ10 (ubiquinone), which must first be converted to ubiquinol before use — a conversion that becomes progressively less efficient with age and is impaired by statin medications — ubiquinol is immediately bioavailable. Take 1 softgel with a fat-containing meal for optimal absorption. Especially relevant for adults over 40, anyone on statin medication, and those seeking cardiovascular support.",
    },
    {
      brand: "NOW Foods", productName: "CoQ10 100mg", size: "150 veg capsules",
      approxPrice: 28, rating: 4.8, reviewCount: 4100, badge: "Best Value",
      searchQuery: "NOW Foods CoQ10 100",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "Qunol", productName: "Mega CoQ10 Ubiquinol 100mg", size: "60 softgels",
      approxPrice: 36, rating: 4.7, reviewCount: 3200, badge: "Premium",
      searchQuery: "Qunol Mega CoQ10 Ubiquinol",
      brandBg: "#e0e7ff", brandInk: "#3730a3",
    },
  ],

  biotin: [
    {
      brand: "Sports Research", productName: "Biotin 5000mcg with Coconut Oil", size: "120 softgels",
      approxPrice: 14, rating: 4.7, reviewCount: 12300, badge: "Bestseller",
      productPath: "/pr/sports-research-biotin-5-000-mcg-120-veggie-softgels/71109",
      brandBg: "#fef3c7", brandInk: "#92400e",
      imageUrl: "/products/biotin.jpg",
      form: "Coconut Oil Liquid Softgels",
      ingredientForm: "Biotin (D-Biotin) suspended in MCT coconut oil",
      servingSize: "1 softgel",
      servingsPerContainer: 120,
      mgPerServing: "5,000 mcg D-Biotin (with 130 mg coconut oil)",
      certifications: ["Non-GMO", "Gluten Free", "Soy Free", "Vegetarian", "Made in USA"],
      fullDescription: "Sports Research Biotin uses a unique liquid-softgel format where 5,000 mcg of D-biotin is suspended in cold-pressed organic coconut oil — providing additional MCT support and improving stability and bioavailability. The 120-softgel bottle provides a 4-month supply at one daily softgel. Visible hair shaft thickness and nail growth improvements typically emerge after 2–3 months of consistent use. Important caveat: discontinue at least 48 hours before any blood test to avoid interference with thyroid, hormone, and other biotin-based laboratory immunoassays.",
    },
    {
      brand: "NOW Foods", productName: "Biotin 5000mcg", size: "120 veg capsules",
      approxPrice: 10, rating: 4.7, reviewCount: 4400, badge: "Best Value",
      searchQuery: "NOW Foods Biotin 5000",
      brandBg: "#fdebe1", brandInk: "#c2410c",
    },
    {
      brand: "Solgar", productName: "Biotin 10000mcg", size: "120 veg capsules",
      approxPrice: 22, rating: 4.8, reviewCount: 1900, badge: "Editor's Pick",
      searchQuery: "Solgar Biotin 10000",
      brandBg: "#fef3c7", brandInk: "#92400e",
    },
  ],
};

/**
 * Get the products for a given supplement ID.
 * Returns an empty array if no products are defined for this supplement.
 */
export function getProducts(supplementId: string): ProductOption[] {
  return PRODUCTS[supplementId] ?? [];
}

/**
 * Get the primary (top recommended) product for a supplement.
 */
export function getPrimaryProduct(supplementId: string): ProductOption | null {
  const list = PRODUCTS[supplementId];
  return list && list.length > 0 ? list[0] : null;
}
