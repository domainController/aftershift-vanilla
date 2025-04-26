// add-timestamps.cjs
// Script pour insérer ou mettre à jour proprement un timestamp dans index.html
// Version corrigée avec remplacement intelligent.

// Importer les modules nécessaires
const fs = require("fs");
const path = require("path");

// Définir le chemin du fichier cible
const filePath = path.join(__dirname, "..", "index.html");

// Lire le contenu actuel du fichier
let content = fs.readFileSync(filePath, "utf8");

// Générer le timestamp actuel
const now = new Date();
const timestampText = `<small class="timestamp" style="display: block; text-align: center;">Last updated: ${now.toLocaleString(
  "en-GB",
  { dateStyle: "full", timeStyle: "short" }
)}</small>`;

// Définir un modèle de recherche d'ancien timestamp
const timestampRegex =
  /<small class="timestamp"[^>]*>Last updated: .*?<\/small>/;

// Fonction principale
function updateOrInsertTimestamp() {
  if (timestampRegex.test(content)) {
    // Si un ancien timestamp existe, le remplacer
    console.log("✅ Ancien timestamp détecté : remplacement en cours...");
    content = content.replace(timestampRegex, timestampText);
  } else {
    // Si aucun timestamp existant, chercher la balise <h1> pour insérer après
    const h1EndIndex = content.indexOf("</h1>");
    if (h1EndIndex !== -1) {
      console.log("✅ Aucun ancien timestamp : insertion après le <h1>...");
      content =
        content.slice(0, h1EndIndex + 5) +
        "\n" +
        timestampText +
        content.slice(h1EndIndex + 5);
    } else {
      console.error(
        "❌ Erreur : aucune balise <h1> trouvée pour insérer le timestamp."
      );
      return;
    }
  }

  // Réécrire le fichier avec la mise à jour
  fs.writeFileSync(filePath, content, "utf8");
  console.log(
    "✅ Timestamp mis à jour avec succès à",
    now.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
  );
}

// Exécuter la fonction principale
updateOrInsertTimestamp();
