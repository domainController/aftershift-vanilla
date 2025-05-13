#!/bin/bash

echo "🧨 Suppression de tous les fichiers .html modifiés..."
find . -name "*.html" -type f ! -name "*.bak" -delete

echo "♻️ Restauration des sauvegardes .bak → .html..."
find . -name "*.html.bak" | while read bak; do
  restored="${bak%.bak}"
  mv "$bak" "$restored"
  echo "✔️ Restauré : $restored"
done

echo "✅ Tous les fichiers HTML restaurés à partir des sauvegardes."