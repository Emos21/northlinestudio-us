#!/usr/bin/env bash
# One-off conversion of the PHP site to static HTML.
# usage: tools/convert.sh [source-dir]   (default ~/polaris/northline-studio)
# Never copies demo/ (private prospect pages), includes/ or .htaccess.
set -euo pipefail
SRC="${1:-$HOME/polaris/northline-studio}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES="index services packages work about contact legal"

for p in $PAGES; do
  php -d display_errors=1 "$ROOT/tools/render.php" "$SRC" "$p.php" > "$ROOT/$p.html"
done

# .php links -> .html
for p in $PAGES; do
  sed -i -E 's/\b(index|services|packages|work|about|contact|legal)\.php\b/\1.html/g' "$ROOT/$p.html"
done

# server-side features -> client-side: enquiry form opens WhatsApp, ?src= tags WhatsApp links
sed -i 's|<form method="post" action="contact.html">|<form id="enquiry-form" action="contact.html" data-whatsapp="254743875608">|' "$ROOT/contact.html"
for p in $PAGES; do
  sed -i 's|</body>|<script src="assets/js/static-forms.js"></script>\n</body>|' "$ROOT/$p.html"
done

mkdir -p "$ROOT/assets"
cp -r "$SRC/assets/." "$ROOT/assets/"
cp "$SRC/manifest.webmanifest" "$SRC/robots.txt" "$SRC/sw.js" "$ROOT/"
sed -E 's/\b(index|services|packages|work|about|contact|legal)\.php\b/\1.html/g' "$SRC/sitemap.xml" > "$ROOT/sitemap.xml"
echo "converted: $PAGES"
