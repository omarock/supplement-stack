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
