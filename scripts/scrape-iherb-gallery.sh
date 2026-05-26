#!/bin/bash
# Given a base iHerb image URL (e.g. images/now/now00086/v/68.jpg), test offsets
# +5, +10, +15, +20 to find additional product views. Output existing URLs.
# Input file: scripts/iherb_images.txt (id|imageUrl|productPath)
# Output file: scripts/iherb_gallery.txt (id|url1,url2,url3,...)

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

while IFS='|' read -r id base_url _; do
  [ -z "$id" ] && continue
  [ -z "$base_url" ] && continue
  [[ ! "$base_url" =~ /v/[0-9]+\.jpg ]] && continue

  # Extract base path and starting number
  prefix=$(echo "$base_url" | sed 's|/v/[0-9]*\.jpg||')
  start=$(echo "$base_url" | grep -oE '/v/[0-9]+\.jpg' | grep -oE '[0-9]+')

  urls=()
  for offset in 0 5 10 15 20; do
    n=$((start + offset))
    url="${prefix}/v/${n}.jpg"
    code=$(curl -sI -o /dev/null -w "%{http_code}" -A "$UA" "$url")
    if [ "$code" = "200" ]; then
      urls+=("$url")
    fi
    sleep 0.15
  done

  if [ ${#urls[@]} -gt 0 ]; then
    IFS=','
    echo "${id}|${urls[*]}"
  fi
done < scripts/iherb_images.txt
