#!/bin/bash

# Fichier source avec le bloc à insérer
SOURCE_FILE="navblock.html"

# Pattern de début et de fin du bloc à remplacer
START_TAG="<div class=\"navbar\">"
END_TAG="</div>"

# Lire tout le bloc à insérer
REPLACEMENT=$(<"$SOURCE_FILE")

# Parcours de tous les fichiers HTML
for file in *.html; do
  # Sauvegarde du fichier original
  cp "$file" "$file.bak"

  # Supprimer le bloc existant entre les tags, et remplacer par REPLACEMENT
  awk -v start="$START_TAG" -v end="$END_TAG" -v repl="$REPLACEMENT" '
    BEGIN {inside=0}
    {
      if ($0 ~ start) {
        print repl;
        inside=1;
      } else if ($0 ~ end && inside) {
        inside=0;
        next;
      }
      if (!inside) print;
    }
  ' "$file.bak" > "$file"

  echo "✅ Bloc mis à jour dans $file"
done