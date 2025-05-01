// scripts/add-timestamps.mjs
// Script ultra simple pour mettre à jour manuellement une liste de fichiers

import fs from "fs";
import path from "path";
import simpleGit from "simple-git";
import { fileURLToPath } from "url";

// Setup Node ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Préparer Git pour aller chercher la date du dernier commit
const git = simpleGit();

// ✍️ Ici tu ajoutes manuellement tous les fichiers à mettre à jour
const filesToUpdate = [
  "index.html",
  "updates.html",
  "home.html",
  "timeline.html",
  "about.html",
  "legal.html",
  "posts.html",
  "claim.html",
  "context.html",
  // Ajoute ici d'autres fichiers HTML manuellement si besoin
];

// Fonction pour récupérer la date du dernier commit
const getLastCommitDate = async () => {
  const log = await git.log({ maxCount: 1 });
  return new Date(log.latest.date);
};

const updateTimestamps = async () => {
  if (filesToUpdate.length === 0) {
    console.log("ℹ️ No files listed for timestamp update.");
    process.exit(0);
  }

  console.log("🛠 Starting manual timestamp update...");

  const lastCommitDate = await getLastCommitDate();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = lastCommitDate.toLocaleString("en-US", options);

  const timestampHTML = `<small class="timestamp" style="display: block; text-align: center;">Last updated: ${formattedDate}</small>\n`;

  for (const file of filesToUpdate) {
    const filePath = path.resolve(__dirname, "../", file);
    console.log(`📄 Processing ${file}...`);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf-8");

      if (content.includes('<small class="timestamp"')) {
        content = content.replace(
          /<small class="timestamp".*?<\/small>\n?/,
          timestampHTML
        );
        console.log(`♻️ Updated existing timestamp in ${file}`);
      } else if (content.includes("<h1")) {
        content = content.replace(
          /(<h1[^>]*>.*?<\/h1>)/s,
          `$1\n${timestampHTML}`
        );
        console.log(`➕ Inserted new timestamp after <h1> in ${file}`);
      } else {
        console.warn(`⚠️ No <h1> found in ${file}. Skipped.`);
      }

      fs.writeFileSync(filePath, content, "utf-8");
    } else {
      console.warn(`⚠️ File ${file} not found. Skipped.`);
    }
  }

  console.log("✅ Manual timestamp update process finished.");
};

updateTimestamps();
