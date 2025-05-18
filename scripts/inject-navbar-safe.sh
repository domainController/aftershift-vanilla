#!/bin/bash

# === CONFIGURATION ===
NAVBAR_FILE="scripts/navblock.html"
TARGET_FILE="philosophy.html"
BACKUP_FILE="${TARGET_FILE}.bak"

echo "🔧 Injection de la navbar depuis: $NAVBAR_FILE"
echo "➡️  Cible : $TARGET_FILE"

# === ÉTAPE 1 : Vérification des fichiers existants ===
if [[ ! -f "$NAVBAR_FILE" ]]; then
  echo "❌ ERREUR : Le fichier navbar ($NAVBAR_FILE) est introuvable."
  exit 1
fi

if [[ ! -f "$TARGET_FILE" ]]; then
  echo "❌ ERREUR : Le fichier cible ($TARGET_FILE) est introuvable."
  exit 1
fi

# === ÉTAPE 2 : Sauvegarde de la version actuelle ===
cp "$TARGET_FILE" "$BACKUP_FILE"
echo "✅ Sauvegarde effectuée → $BACKUP_FILE"

# === ÉTAPE 3 : Suppression du header actuel dans le fichier cible ===
# On supprime tout le bloc entre <header> et </header>
echo "🧹 Suppression de l'ancien bloc <header>...</header>..."
sed -i '' '/<header>/,/<\/header>/d' "$TARGET_FILE"
echo "✅ Bloc <header> supprimé"

# === ÉTAPE 4 : Insertion de la nouvelle navbar ===
# On insère juste après <body>
echo "🛠️ Insertion de la nouvelle navbar après <body>..."
awk -v insert="$(cat $NAVBAR_FILE)" '
  /<body[^>]*>/ {
    print;
    print insert;
    next
  }
  1
' "$BACKUP_FILE" > "$TARGET_FILE"

echo "✅ Navbar injectée avec succès"

# === ÉTAPE 5 : Résumé final ===
echo "✅ Fichier mis à jour : $TARGET_FILE"
echo "🗃️ Ancienne version disponible ici : $BACKUP_FILE"