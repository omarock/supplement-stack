#!/bin/bash
# Fetch real iHerb product URLs by scraping iHerb search results

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Each entry: supplement_id|brand|product|grep_filter
# grep_filter narrows down to the right product (slug fragment)
QUERIES=(
  "d3k2|NOW+Foods+Vitamin+D-3+K-2+120+capsules|now-foods-vitamin-d-3-k-2"
  "omega3|Sports+Research+Triple+Strength+Omega-3+1250mg|sports-research-triple-strength-omega"
  "omega3-algae|Ovega-3+Plant+Based+Omega-3+60+softgels|ovega-3"
  "multivit|Garden+of+Life+mykind+Organics+Womens+Multi|garden-of-life-mykind-organics-women"
  "mag-glycinate|Doctors+Best+High+Absorption+Magnesium+240|doctor-s-best-high-absorption-magnesium"
  "ashwagandha|Jarrow+Formulas+Ashwagandha+300+mg+120|jarrow-formulas-ashwagandha"
  "l-theanine|NOW+Foods+L-Theanine+200+mg+120|now-foods-l-theanine-200"
  "glycine|NOW+Foods+Glycine+Pure+Powder|now-foods-glycine-pure-powder"
  "b12|Jarrow+Formulas+Methyl+B-12+5000+mcg+lozenges|jarrow-formulas-methyl-b-12"
  "b-complex|Thorne+Basic+B+Complex+60|thorne-basic-b-complex"
  "rhodiola|NOW+Foods+Rhodiola+500+mg+120|now-foods-rhodiola-500"
  "lions-mane|Host+Defense+Lions+Mane+60|host-defense-lion"
  "creatine|Optimum+Nutrition+Creatine+Monohydrate+Powder|optimum-nutrition-micronized-creatine"
  "collagen|Sports+Research+Collagen+Peptides|sports-research-collagen-peptides"
  "curcumin|Doctors+Best+High+Absorption+Curcumin+BioPerine+180|doctor-s-best-curcumin"
  "glucosamine|NOW+Foods+Glucosamine+Chondroitin+MSM+180|now-foods-glucosamine-chondroitin-msm"
  "vit-c|NOW+Foods+Vitamin+C-1000+Rose+Hips+250|now-foods-vitamin-c-1000"
  "zinc|Thorne+Zinc+Picolinate+15+mg+60|thorne-zinc-picolinate"
  "elderberry|Sambucol+Black+Elderberry+Original+Syrup|sambucol-black-elderberry"
  "probiotic|Garden+of+Life+Dr+Formulated+Probiotics+Mood|garden-of-life-dr-formulated"
  "digestive-enzymes|Enzymedica+Digest+Gold+ATPro|enzymedica-digest-gold"
  "iron|Solgar+Gentle+Iron+25+mg+180|solgar-gentle-iron"
  "coq10|Doctors+Best+High+Absorption+CoQ10+100+mg|doctor-s-best-high-absorption-coq10"
  "biotin|Sports+Research+Biotin+5000+mcg+120|sports-research-biotin"
)

for entry in "${QUERIES[@]}"; do
  IFS='|' read -r id q filter <<< "$entry"
  url="https://www.iherb.com/search?kw=${q}"

  html=$(curl -sL -A "$UA" \
    -H 'Accept: text/html' \
    -H 'Accept-Language: en-US,en;q=0.9' \
    -H 'Accept-Encoding: identity' \
    --max-redirs 5 --max-time 25 \
    "$url")

  # Find first /pr/ URL matching our filter
  product_path=$(echo "$html" | grep -oE "/pr/[a-z0-9-]*${filter}[a-z0-9-]*/[0-9]+" | head -1)

  if [ -z "$product_path" ]; then
    # Fallback: just take the first product
    product_path=$(echo "$html" | grep -oE "/pr/[a-z0-9-]+/[0-9]+" | head -1)
  fi

  echo "$id|$product_path"
  sleep 0.5
done
