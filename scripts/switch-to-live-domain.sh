#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Domain-Switch: Preview → Produktiv
# ─────────────────────────────────────────────────────────────────────
# Tauscht alle Vorkommen der Preview-Domain gegen die Live-Domain.
# Betroffen: canonical, og:url, JSON-LD @id, sameAs, sitemap.xml.
#
# Nutzung (aus dem Repo-Root ausführen):
#   ./scripts/switch-to-live-domain.sh
#   ./scripts/switch-to-live-domain.sh --dry-run   # nur zeigen was passieren würde
#   ./scripts/switch-to-live-domain.sh --revert    # zurück auf Preview
#
# Nach dem Switch: git status prüfen, committen, pushen.
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

PREVIEW_DOMAIN="https://abraemswig-wq.github.io/quint-marketing-preview"
LIVE_DOMAIN="https://quint-marketing.de"

MODE="${1:-run}"

if [[ "$MODE" == "--revert" ]]; then
  FROM="$LIVE_DOMAIN"
  TO="$PREVIEW_DOMAIN"
  echo "→ Revert: $FROM  →  $TO"
else
  FROM="$PREVIEW_DOMAIN"
  TO="$LIVE_DOMAIN"
  echo "→ Live-Switch: $FROM  →  $TO"
fi

# Alle HTML- und XML-Dateien im Repo-Root und in Unterordnern (außer node_modules, .git, scripts)
FILES=$(find . -type f \( -name "*.html" -o -name "*.xml" \) \
  -not -path "./.git/*" \
  -not -path "./scripts/*" \
  -not -path "./node_modules/*")

if [[ "$MODE" == "--dry-run" ]]; then
  echo
  echo "=== DRY-RUN: betroffene Dateien mit Vorkommen ==="
  total=0
  for f in $FILES; do
    n=$(grep -c "$FROM" "$f" 2>/dev/null) || n=0
    if [[ "$n" -gt 0 ]]; then
      printf "  %-50s %3d Vorkommen\n" "$f" "$n"
      total=$((total + n))
    fi
  done
  echo
  echo "→ Total: $total Vorkommen in ${TO#https://}"
  echo
  echo "→ Bei echtem Run würden alle Vorkommen ersetzt."
  echo "→ Danach: git diff prüfen, git add + commit + push."
  exit 0
fi

# Backup + Ersetzen
CHANGED=0
for f in $FILES; do
  if grep -q "$FROM" "$f" 2>/dev/null; then
    sed -i.bak "s|$FROM|$TO|g" "$f"
    rm -f "$f.bak"
    CHANGED=$((CHANGED + 1))
  fi
done

echo
echo "✅ $CHANGED Dateien aktualisiert."
echo
echo "Nächste Schritte:"
echo "  1. git status   # prüfen was geändert wurde"
echo "  2. git diff     # spot-check auf Datei-Ebene"
echo "  3. git add -A && git commit -m 'Domain-Switch: Preview → Live'"
echo "  4. git push"
echo
echo "Zurück-Switch bei Bedarf: ./scripts/switch-to-live-domain.sh --revert"
