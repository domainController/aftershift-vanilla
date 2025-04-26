import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Préparation pour obtenir le chemin du fichier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Récupération des fichiers passés en arguments depuis le pre-push hook
const filesToUpdate = process.argv.slice(2);

// Générer la date/heure au moment exact du push
const now = new Date();
const options = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};
const dateString = now.toLocaleDateString("en-GB", options);
const timeString = now.toLocaleTimeString("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

// Le code HTML du timestamp à insérer
const timestamp = `<small class="timestamp" style="display: block; text-align: center;">Last updated: ${dateString} at ${timeString}</small>`;

// Pour chaque fichier HTML passé en argument
filesToUpdate.forEach((filePathRelative) => {
  const filePath = path.resolve(__dirname, "../", filePathRelative);

  // Vérifie si le fichier existe réellement
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Si un timestamp existe déjà, on le remplace
  if (content.includes('<small class="timestamp"')) {
    content = content.replace(
      /<small class="timestamp".*?<\/small>/s,
      timestamp
    );
    console.log(`✅ Updated timestamp in ${filePathRelative}`);
  } else {
    // Sinon, on l'ajoute juste après le premier <h1>
    content = content.replace(
      /<h1[^>]*>.*?<\/h1>/s,
      (match) => `${match}\n${timestamp}`
    );
    console.log(`✅ Inserted timestamp into ${filePathRelative}`);
  }

  // Écriture du contenu corrigé dans le fichier
  fs.writeFileSync(filePath, content, "utf-8");
});
