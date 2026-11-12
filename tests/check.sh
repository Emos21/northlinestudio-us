#!/usr/bin/env bash
# Static-site checks. Exit non-zero on the first failing group. Run from anywhere.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PAGES="index services packages work about contact legal"
fail=0
ok()  { echo "ok    $1"; }
bad() { echo "FAIL  $1"; fail=1; }

# 1. every page exists and has a title and a canonical on .html
for p in $PAGES; do
  [ -s "$p.html" ] || { bad "$p.html missing or empty"; continue; }
  grep -q '<title>' "$p.html" && ok "$p.html has title" || bad "$p.html has no title"
  if [ "$p" = index ]; then
    grep -q 'rel="canonical" href="https://northlinestudio.us/"' index.html && ok "index canonical" || bad "index canonical"
  else
    grep -q "rel=\"canonical\" href=\"https://northlinestudio.us/$p.html\"" "$p.html" && ok "$p canonical" || bad "$p canonical"
  fi
done

# 2. no PHP left anywhere in the deployable files
if grep -rn -E '\.php|<\?php|<\?=' --include=*.html --include=*.js --include=*.xml --include=*.webmanifest --include=sw.js . 2>/dev/null | grep -v -E '^\./(_raw|tools|tests)/|^\./404\.html:' ; then
  bad "PHP reference found in deployable files"
else ok "no PHP references"; fi

# 3. every local href/src resolves to a file
missing=0
for p in $PAGES 404; do
  while IFS= read -r ref; do
    f="${ref%%[?#]*}"
    case "$f" in http*|mailto:*|tel:*|//*|data:*|javascript:*|*"'"*|*'+'*|*'{'*) continue ;; esac
    f="${f#/}"; [ -z "$f" ] && f=index.html
    [ -e "$f" ] || { echo "      $p.html -> $ref not found"; missing=1; }
  done < <(grep -o -E '(href|src)="[^"]+"' "$p.html" | sed -E 's/^(href|src)="//; s/"$//' | sort -u)
done
[ $missing = 0 ] && ok "all local links and assets resolve" || bad "broken local links"

# 4. only known top-level entries are tracked (nothing private can slip into the public repo)
ALLOWED=" .nojekyll 404.html CNAME MAIN.md about.html assets contact.html index.html legal.html manifest.webmanifest packages.html robots.txt services.html sitemap.xml sw.js tests tools work.html "
unexpected=0
for e in $(git ls-files | cut -d/ -f1 | sort -u); do
  case "$ALLOWED" in *" $e "*) ;; google*.html) ;; *) echo "      unexpected tracked entry: $e"; unexpected=1 ;; esac
done
[ $unexpected = 0 ] && ok "tracked entries are all on the allowlist" || bad "unexpected tracked entries"

# 5. Pages config
[ "$(cat CNAME)" = "northlinestudio.us" ] && ok "CNAME" || bad "CNAME"
[ -e .nojekyll ] && ok ".nojekyll" || bad ".nojekyll"

# 6. contact form is client-side only
grep -q 'id="enquiry-form"' contact.html && ok "enquiry form wired" || bad "enquiry form not wired"
grep -q 'method="post"' contact.html && bad "contact form still posts to a server" || ok "no server post"
for p in $PAGES; do grep -q 'assets/js/static-forms.js' "$p.html" || bad "$p.html lacks static-forms.js"; done
node --check assets/js/static-forms.js 2>/dev/null && ok "static-forms.js parses" || bad "static-forms.js syntax"

# 6b. custom 404: must work at any depth, stay out of the index, forward old .php links
if [ -s 404.html ]; then
  grep -q 'name="robots" content="noindex"' 404.html && ok "404 noindex" || bad "404 missing noindex"
  grep -q 'rel="canonical"' 404.html && bad "404 must not have a canonical" || ok "404 no canonical"
  if grep -n -o -E '(href|src)="[^/h#mt][^"]*"' 404.html | grep -v -E 'href="(mailto|tel):' ; then bad "404 has relative paths (breaks at /a/b/c)"; else ok "404 paths are root-absolute"; fi
  grep -q '\.php' 404.html && grep -q 'location.replace' 404.html && ok "404 forwards old .php links" || bad "404 .php forwarding missing"
  grep -q 'prefers-reduced-motion' 404.html && ok "404 respects reduced motion" || bad "404 reduced motion"
  grep -q '—' 404.html && bad "404 contains an em dash" || ok "404 no em dash"
else bad "404.html missing"; fi

# 7. sitemap lists only .html pages, once each
[ "$(grep -c '<loc>' sitemap.xml)" = 7 ] && ok "sitemap 7 urls" || bad "sitemap url count"

# 8. no CLAUDE.md tracked or staged
if git ls-files --error-unmatch CLAUDE.md >/dev/null 2>&1; then bad "CLAUDE.md is tracked"; else ok "CLAUDE.md not tracked"; fi

[ $fail = 0 ] && echo "ALL PASS" || { echo "FAILED"; exit 1; }
