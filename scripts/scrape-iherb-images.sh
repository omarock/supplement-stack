#!/bin/bash
# Scrape iHerb product image URLs for each supplement.
# For each (id, search_query) pair:
#   1. Hit iHerb search to find first product URL
#   2. Fetch that product page
#   3. Extract the preload image URL (cloudinary CDN)
# Output: id|imageUrl on stdout

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Format: id|search query (76 new supplements, all the ones added in batches 1-4)
declare -A QUERIES=(
  ["nac"]="Now Foods NAC 600mg"
  ["taurine"]="NOW Foods Taurine 1000mg"
  ["acetyl-l-carnitine"]="Jarrow Formulas Acetyl L-Carnitine 500mg"
  ["l-carnitine"]="NOW Foods L-Carnitine Tartrate 1000mg"
  ["ala"]="Doctor's Best Alpha Lipoic Acid 300mg"
  ["berberine"]="Thorne Berberine 500mg"
  ["quercetin"]="Solgar Quercetin Complex Bromelain"
  ["resveratrol"]="Doctor's Best Trans-Resveratrol"
  ["pqq"]="Life Extension PQQ Caps 20mg"
  ["ubiquinol"]="Kaneka Ubiquinol 100mg"
  ["mag-citrate"]="NOW Foods Magnesium Citrate 200mg"
  ["mag-threonate"]="Magtein Magnesium L-Threonate Capsules"
  ["vit-k2"]="Doctor's Best Natural Vitamin K2 MK-7"
  ["selenium"]="NOW Foods Selenium 200mcg"
  ["iodine"]="Nature's Way Kelp 600mg"
  ["chromium"]="NOW Foods Chromium Picolinate 200mcg"
  ["boron"]="NOW Foods Boron 3mg"
  ["inositol"]="Wholesome Story Myo D-Chiro Inositol 40 1"
  ["melatonin"]="Life Extension Melatonin 300mcg"
  ["5-htp"]="NOW Foods 5-HTP 100mg"
  ["valerian"]="Nature's Way Valerian Root 530mg"
  ["saffron"]="Sports Research Saffron Affron"
  ["holy-basil"]="Organic India Tulsi Holy Basil"
  ["panax-ginseng"]="Korea Ginseng Corp Korean Red Ginseng Extract"
  ["bacopa"]="Himalaya Bacopa Caplets"
  ["ginkgo"]="Nature's Way Ginkgo Biloba 120mg"
  ["citicoline"]="Jarrow Formulas Citicoline CDP-Choline"
  ["alpha-gpc"]="NOW Foods Alpha GPC 300mg"
  ["phosphatidylserine"]="Doctor's Best Phosphatidylserine 100mg"
  ["astaxanthin"]="Sports Research Astaxanthin 12mg"
  ["lutein"]="Doctor's Best Lutein FloraGlo 20mg"
  ["msm"]="Doctor's Best MSM OptiMSM Powder"
  ["boswellia"]="Life Extension 5-LOX AprèsFlex Boswellia"
  ["l-glutamine"]="Thorne L-Glutamine Powder"
  ["milk-thistle"]="Jarrow Formulas Milk Thistle Silymarin"
  ["spirulina"]="Nutrex Hawaii Spirulina Pacifica 500mg"
  ["chlorella"]="Sun Chlorella A Tablets"
  ["beetroot"]="HumanN BeetElite Pre Workout"
  ["l-citrulline"]="NOW Foods L-Citrulline Pure Powder"
  ["beta-alanine"]="NOW Foods Beta Alanine Pure Powder"
  ["mct-oil"]="Sports Research MCT Oil Coconut"
  ["tongkat-ali"]="Double Wood Tongkat Ali 400mg"
  ["maca"]="Navitas Organics Maca Powder"
  ["cordyceps"]="Host Defense Cordyceps Capsules"
  ["reishi"]="Host Defense Reishi Capsules"
  ["methylfolate"]="Thorne 5-MTHF L-Methylfolate 1mg"
  ["vit-a"]="NOW Foods Vitamin A 10000 IU"
  ["vit-e"]="NOW Foods Vitamin E Mixed Tocopherols 400IU"
  ["phosphatidylcholine"]="BodyBio PC Phosphatidylcholine Liquid"
  ["choline"]="NOW Foods Choline Bitartrate 500mg"
  ["vit-b6"]="Pure Encapsulations P5P 50 Pyridoxal Phosphate"
  ["vit-b1"]="Doctor's Best Benfotiamine 300mg"
  ["vit-b3"]="Thorne Niacinamide 500mg"
  ["vit-b2"]="NOW Foods Riboflavin 100mg"
  ["zma"]="Optimum Nutrition ZMA Capsules"
  ["lithium-orotate"]="Pure Encapsulations Lithium Orotate 5mg"
  ["fenugreek"]="Life Extension Testofen Fenugreek"
  ["dim"]="Pure Encapsulations DIM Detox 100mg"
  ["saw-palmetto"]="NOW Foods Saw Palmetto 320mg Standardized"
  ["evening-primrose"]="Nature's Way EFAGold Evening Primrose 1300mg"
  ["cranberry"]="Solgar Cranberry Extract PACran"
  ["hawthorn"]="Nature's Way Hawthorn Berries 510mg"
  ["aged-garlic"]="Kyolic Aged Garlic Extract Cardiovascular"
  ["nattokinase"]="Doctor's Best Nattokinase 2000 FU"
  ["psyllium"]="NOW Foods Psyllium Husk Powder"
  ["inulin"]="NOW Foods Inulin Powder Prebiotic"
  ["ginger"]="NOW Foods Ginger Root Extract"
  ["green-tea"]="Life Extension Mega Green Tea Extract Decaffeinated"
  ["l-tyrosine"]="NOW Foods L-Tyrosine 500mg"
  ["tudca"]="Nutricost TUDCA 500mg"
  ["whey-isolate"]="Naked Whey Protein Isolate Grass Fed Unflavored"
  ["plant-protein"]="Naked Pea Plant Protein Unflavored"
  ["dha-prenatal"]="Nordic Naturals Prenatal DHA Strawberry"
  ["bcaa"]="Scivation Xtend Original BCAA Powder"
  ["eaa"]="Kion Aminos Essential Amino Acids"
  ["moringa"]="Kuli Kuli Pure Organic Moringa Powder"
)

scrape_image() {
  local id="$1"
  local query="$2"
  # encode space → +
  local encoded=$(echo "$query" | sed 's/ /+/g')

  # Step 1: find first product URL from search
  local product_path
  product_path=$(curl -sL -A "$UA" -H 'Accept: text/html' -H 'Accept-Language: en-US,en;q=0.9' -H 'Accept-Encoding: identity' --max-redirs 5 "https://www.iherb.com/search?kw=${encoded}" 2>/dev/null \
    | grep -oE '/pr/[a-z0-9-]+/[0-9]+' \
    | head -1)

  if [ -z "$product_path" ]; then
    echo "${id}|NOT_FOUND|" >&2
    return
  fi

  # Step 2: fetch product page, extract image URL
  local img_url
  img_url=$(curl -sL -A "$UA" -H 'Accept: text/html' -H 'Accept-Language: en-US,en;q=0.9' -H 'Accept-Encoding: identity' "https://www.iherb.com${product_path}" 2>/dev/null \
    | grep -oE 'as="image"[^>]+href="[^"]+' \
    | grep -oE 'https://[^"]+\.jpg' \
    | head -1)

  if [ -z "$img_url" ]; then
    echo "${id}|NO_IMAGE|${product_path}" >&2
    return
  fi

  # Convert blurred preview to full quality
  img_url=$(echo "$img_url" | sed 's|q_auto:low,e_blur:500|q_auto:eco|')

  echo "${id}|${img_url}|${product_path}"
}

# Sort keys for stable output
for id in $(echo "${!QUERIES[@]}" | tr ' ' '\n' | sort); do
  scrape_image "$id" "${QUERIES[$id]}"
  sleep 0.4
done
