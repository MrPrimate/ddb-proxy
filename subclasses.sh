#!/bin/bash

for c in $(jq -r '.data | .[] | .name' classes.json); do
  curl 'https://proxy.ddb.mrprimate.co.uk/proxy/subclass' \
  -H 'authority: proxy.ddb.mrprimate.co.uk' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36' \
  -H 'content-type: application/json' \
  -H 'accept: */*' \
  -H 'sec-gpc: 1' \
  -H 'origin: https://vtt.bilger.info' \
  -H 'sec-fetch-site: cross-site' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-dest: empty' \
  -H 'referer: https://vtt.bilger.info/' \
  -H 'accept-language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' \
  --data-raw "{\"cobalt\":\"eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..5a_OqQIpsZBOmRkO6sf5Ww.zywdy4qceNIl6SdtMCP7DsaQYtWw94AALUvWrLeIEvNp9AnKX_uLZdjjPDU122mS.NYQuO-4zdOT8Kvq8eW-IvA\",\"campaignId\":\"1447964\",\"betaKey\":\"fb8b9eb5-352e-4f4e-a8ed-a2e92d3e5b89\",\"className\":\"$c\"}" \
  --compressed > subclass/$c.json
done
