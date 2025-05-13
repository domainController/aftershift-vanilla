#!/bin/bash

# Vérifie que le fichier cible est passé en argument
TARGET="$1"
NAVFILE="navblock.html"
BACKUP="${TARGET}.bak"

if [[ -z "$TARGET" || ! -f "$TARGET" ]]; then
  echo "❌ Veuillez fournir un fichier HTML valide en argument."
  echo "Usage : ./inject-navbar-safe.sh fichier.html"
  exit 1
fi

if [[ ! -f "$NAVFILE" ]]; then
  echo "❌ Fichier $NAVFILE introuvable."
  exit 1
fi

echo "📦 Sauvegarde de $TARGET → $BACKUP"
cp "$TARGET" "$BACKUP"

echo "🧹 Suppression du bloc <header> existant dans $TARGET"
sed -i '' -e '/<header>/,/<\/header>/d' "$TARGET"

echo "➕ Insertion du contenu de $NAVFILE juste après <body>"
awk '/<body>/ { print; system("cat navblock.html"); next } 1' "$TARGET" > temp && mv temp "$TARGET"

echo "✅ Navbar insérée avec succès dans $TARGET"