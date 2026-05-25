#!/bin/bash
# Scrape Amazon ASINs for each supplement. For each (id, "Brand Product"):
#   1. Hit Amazon search with full browser headers
#   2. Extract first non-sponsored data-asin
# Output: id|ASIN on stdout.

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

# id|"Brand Product Search"
ROWS=(
  "d3k2|NOW Foods Vitamin D3 K2 softgels"
  "omega3|Sports Research Omega-3 Fish Oil Triple Strength softgels"
  "omega3-algae|Ovega-3 Plant-Based Omega-3 vegan softgels"
  "multivit|Garden of Life mykind Organics Whole Food Multivitamin"
  "mag-glycinate|Doctor's Best High Absorption Magnesium Glycinate tablets"
  "ashwagandha|Jarrow Formulas Ashwagandha KSM-66 300mg"
  "l-theanine|NOW Foods L-Theanine Suntheanine 200mg"
  "glycine|NOW Foods Glycine Powder"
  "b12|Jarrow Formulas Methyl B-12 1000mcg lozenges"
  "b-complex|Thorne Basic B Complex capsules"
  "rhodiola|NOW Foods Rhodiola 500mg"
  "lions-mane|Host Defense Lion's Mane mushroom capsules"
  "creatine|Optimum Nutrition Micronized Creatine Monohydrate Powder"
  "collagen|Sports Research Collagen Peptides Powder Grass-Fed"
  "curcumin|Doctor's Best Curcumin C3 Complex BioPerine"
  "glucosamine|NOW Foods Glucosamine Chondroitin MSM"
  "vit-c|Nature's Way Buffered Vitamin C 1000mg"
  "zinc|Thorne Zinc Picolinate 15mg"
  "elderberry|Sambucol Black Elderberry Syrup"
  "probiotic|Garden of Life Dr Formulated Probiotics Mood Plus"
  "digestive-enzymes|Enzymedica Digest Gold capsules"
  "iron|Solgar Gentle Iron Bisglycinate 25mg"
  "coq10|Doctor's Best High Absorption Ubiquinol Kaneka 100mg"
  "biotin|Sports Research Biotin 5000mcg coconut oil softgels"
  "nac|NOW Foods NAC 600mg veg capsules"
  "taurine|NOW Foods Taurine 1000mg"
  "acetyl-l-carnitine|Jarrow Formulas Acetyl L-Carnitine 500mg"
  "l-carnitine|NOW Foods L-Carnitine Tartrate 1000mg tablets"
  "ala|Doctor's Best Alpha Lipoic Acid 300mg"
  "berberine|Thorne Berberine 500mg"
  "quercetin|Solgar Quercetin Complex Bromelain 500mg"
  "resveratrol|Doctor's Best Trans Resveratrol 100mg"
  "pqq|Life Extension PQQ Caps 20mg"
  "ubiquinol|Kaneka Ubiquinol 100mg softgels"
  "mag-citrate|NOW Foods Magnesium Citrate 200mg"
  "mag-threonate|Magtein Magnesium L-Threonate Brain Health"
  "vit-k2|Doctor's Best Natural Vitamin K2 MK-7 100mcg"
  "selenium|NOW Foods Selenium 200mcg"
  "iodine|Nature's Way Kelp Iodine 600mg"
  "chromium|NOW Foods Chromium Picolinate 200mcg"
  "boron|NOW Foods Boron 3mg"
  "inositol|Wholesome Story Myo Inositol D-Chiro Inositol 40:1"
  "melatonin|Life Extension Melatonin 300mcg"
  "5-htp|NOW Foods 5-HTP 100mg veg capsules"
  "valerian|Nature's Way Valerian Root 530mg"
  "saffron|Sports Research Saffron Affron 28mg"
  "holy-basil|Organic India Tulsi Holy Basil capsules"
  "panax-ginseng|Korean Red Ginseng Extract 6 year"
  "bacopa|Himalaya Bacopa 750mg"
  "ginkgo|Nature's Way Ginkgo Biloba 120mg"
  "citicoline|Jarrow Formulas Citicoline CDP-Choline 250mg"
  "alpha-gpc|NOW Foods Alpha GPC 300mg"
  "phosphatidylserine|Doctor's Best Phosphatidylserine 100mg"
  "astaxanthin|Sports Research Astaxanthin 12mg"
  "lutein|Doctor's Best Lutein FloraGlo 20mg Zeaxanthin"
  "msm|Doctor's Best MSM OptiMSM Powder"
  "boswellia|Life Extension 5-LOX Inhibitor Boswellia AprèsFlex"
  "l-glutamine|Thorne L-Glutamine Powder"
  "milk-thistle|Jarrow Formulas Milk Thistle Silymarin 150mg"
  "spirulina|Nutrex Hawaii Spirulina Pacifica 500mg tablets"
  "chlorella|Sun Chlorella A 200mg tablets"
  "beetroot|HumanN BeetElite Pre-Workout"
  "l-citrulline|NOW Foods L-Citrulline Pure Powder"
  "beta-alanine|NOW Foods Beta-Alanine Pure Powder CarnoSyn"
  "mct-oil|Sports Research MCT Oil C8 from Coconut"
  "tongkat-ali|Double Wood Tongkat Ali 400mg"
  "maca|Navitas Organics Maca Powder Organic"
  "cordyceps|Host Defense Cordyceps capsules"
  "reishi|Host Defense Reishi capsules"
  "methylfolate|Thorne 5-MTHF L-Methylfolate 1mg"
  "vit-a|NOW Foods Vitamin A 10000 IU softgels"
  "vit-e|NOW Foods Vitamin E Mixed Tocopherols 400 IU"
  "phosphatidylcholine|BodyBio PC Phosphatidylcholine Liquid"
  "choline|NOW Foods Choline Bitartrate 500mg"
  "vit-b6|Pure Encapsulations P5P 50 Pyridoxal 5 Phosphate"
  "vit-b1|Doctor's Best Benfotiamine 300mg"
  "vit-b3|Thorne Niacinamide 500mg"
  "vit-b2|NOW Foods Riboflavin B2 100mg"
  "zma|Optimum Nutrition ZMA capsules"
  "lithium-orotate|Pure Encapsulations Lithium Orotate 5mg"
  "fenugreek|Life Extension Testofen Fenugreek 600mg"
  "dim|Pure Encapsulations DIM Detox 100mg"
  "saw-palmetto|NOW Foods Saw Palmetto Extract 320mg"
  "evening-primrose|Nature's Way EFAGold Evening Primrose 1300mg"
  "cranberry|Solgar Cranberry Extract PACran 500mg"
  "hawthorn|Nature's Way Hawthorn Berries 565mg"
  "aged-garlic|Kyolic Aged Garlic Extract Cardiovascular 1000mg"
  "nattokinase|Doctor's Best Nattokinase 2000 FU"
  "psyllium|NOW Foods Psyllium Husk Powder"
  "inulin|NOW Foods Inulin Pure Powder Prebiotic"
  "ginger|NOW Foods Ginger Root Extract 250mg"
  "green-tea|Life Extension Mega Green Tea Extract Decaffeinated"
  "l-tyrosine|NOW Foods L-Tyrosine 500mg"
  "tudca|Nutricost TUDCA 500mg"
  "whey-isolate|Naked Whey Protein Isolate Grass Fed Unflavored"
  "plant-protein|Naked Pea Plant Protein Unflavored"
  "dha-prenatal|Nordic Naturals Prenatal DHA softgels"
  "bcaa|Scivation Xtend BCAA Original Powder"
  "eaa|Kion Aminos Essential Amino Acids"
  "moringa|Kuli Kuli Organic Moringa Powder"
)

scrape_asin() {
  local id="$1"
  local query="$2"
  local encoded=$(echo "$query" | sed 's/ /+/g')

  local asin
  asin=$(curl -sL -A "$UA" \
    -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
    -H 'Accept-Language: en-US,en;q=0.9' \
    -H 'Accept-Encoding: gzip, deflate, br' \
    -H 'Sec-Ch-Ua: "Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"' \
    -H 'Sec-Ch-Ua-Mobile: ?0' \
    -H 'Sec-Ch-Ua-Platform: "Windows"' \
    -H 'Sec-Fetch-Dest: document' \
    -H 'Sec-Fetch-Mode: navigate' \
    -H 'Upgrade-Insecure-Requests: 1' \
    --compressed --max-redirs 3 \
    "https://www.amazon.com/s?k=${encoded}" 2>/dev/null \
    | grep -oE 'data-asin="[A-Z0-9]{10}"' \
    | head -1 \
    | sed 's/data-asin="//; s/"//')

  if [ -z "$asin" ]; then
    echo "${id}|NOT_FOUND" >&2
    return
  fi

  echo "${id}|${asin}"
}

for row in "${ROWS[@]}"; do
  IFS='|' read -r id query <<< "$row"
  scrape_asin "$id" "$query"
  sleep 0.6
done
