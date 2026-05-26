#!/bin/bash
# Scrape iHerb image URLs (primary + gallery) for the 24 ORIGINAL supplements
# that currently use local /products/*.jpg files. Reads from a hardcoded list
# of (id, productPath) since these aren't in the iherb_images.txt scrape.

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# id|productPath (24 originals — paths from products.ts)
ROWS=(
  "d3k2|/pr/now-foods-vitamin-d3-2-000-iu-120-softgels/8229"
  "omega3|/pr/sports-research-alaskan-omega-3-fish-oil-triple-strength-180-softgels/72037"
  "omega3-algae|/pr/swanson-vitamins-plant-based-omega-3-120-liquid-vegan-capsules/149122"
  "multivit|/pr/garden-of-life-organics-women-s-multi-60-vegan-tablets/106223"
  "mag-glycinate|/pr/doctor-s-best-high-absorption-magnesium-120-tablets-100-mg-per-tablet/15"
  "ashwagandha|/pr/jarrow-formulas-ashwagandha-300-mg-120-veggie-capsules/3302"
  "l-theanine|/pr/now-foods-l-theanine-120-veg-capsules/54096"
  "b-complex|/pr/thorne-basic-b-complex-60-capsules/18791"
  "creatine|/pr/optimum-nutrition-micronized-creatine-powder-unflavored-1-32-lb-600-g/68616"
  "curcumin|/pr/doctor-s-best-curcumin-from-turmeric-root-with-c3-complex-bioperine-500-mg-120-veggie-caps/13"
  "glycine|/pr/now-foods-glycine-pure-powder-1-lb-454-g/688"
  "b12|/pr/jarrow-formulas-methyl-b-12-1000-mcg-100-lozenges/229"
  "rhodiola|/pr/now-foods-rhodiola-500-mg-60-veg-capsules/4514"
  "lions-mane|/pr/host-defense-mushrooms-lion-s-mane-60-vegetarian-capsules/35720"
  "collagen|/pr/sports-research-collagen-peptides-unflavored-1-lb-454-g/72035"
  "glucosamine|/pr/now-foods-glucosamine-chondroitin-with-msm-180-veg-capsules/3017"
  "vit-c|/pr/nature-s-way-buffered-vitamin-c-1000-mg-180-veg-capsules/127434"
  "zinc|/pr/thorne-zinc-picolinate-15-mg-60-capsules/82811"
  "elderberry|/pr/sambucol-black-elderberry-liquid-original-formula-7-8-fl-oz-230-ml/12091"
  "probiotic|/pr/garden-of-life-dr-formulated-probiotics-mood-50-billion-cfu-60-veggie-capsules/76089"
  "digestive-enzymes|/pr/enzymedica-digest-gold-with-atpro-180-capsules/3306"
  "iron|/pr/solgar-gentle-iron-25-mg-180-veg-capsules/16823"
  "coq10|/pr/doctor-s-best-high-absorption-ubiquinol-with-kaneka-100-mg-60-veg-softgels/93063"
  "biotin|/pr/sports-research-biotin-with-coconut-oil-5-000-mcg-120-veggie-softgels/71109"
)

scrape() {
  local id="$1"
  local product_path="$2"
  # Fetch product page to get the primary image URL
  local img_url
  img_url=$(curl -sL -A "$UA" -H 'Accept: text/html' -H 'Accept-Language: en-US,en;q=0.9' -H 'Accept-Encoding: identity' "https://www.iherb.com${product_path}" 2>/dev/null \
    | grep -oE 'as="image"[^>]+href="[^"]+' \
    | grep -oE 'https://[^"]+\.jpg' \
    | head -1)

  if [ -z "$img_url" ]; then
    echo "${id}|NOT_FOUND|${product_path}" >&2
    return
  fi

  # Convert blurred preview to full quality
  img_url=$(echo "$img_url" | sed 's|q_auto:low,e_blur:500|q_auto:eco|')
  echo "${id}|${img_url}|${product_path}"
}

for row in "${ROWS[@]}"; do
  IFS='|' read -r id productPath <<< "$row"
  scrape "$id" "$productPath"
  sleep 0.6
done
