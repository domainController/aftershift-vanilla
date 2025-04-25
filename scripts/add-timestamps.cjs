#!/usr/bin/env node
// scripts/add-timestamps.js
// CommonJS version: injecte un timestamp 'Updated:' en bas à droite pour chaque page HTML modifiée.

const fs = require("fs").promises;
const path = require("path");
const cheerio = require("cheerio");
const { execSync } = require("child_process");

async function injectTimestamp(file) {
  console.log(`🔄 Processing ${file}...`);
  const html = await fs.readFile(file, "utf-8");
  const $ = cheerio.load(html);

  // 1. Supprime l'ancien timestamp
  $(".page-timestamp").remove();

  // 2. Formate la date en anglais (UK)
  const now = new Date().toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // 3. Crée le paragraphe
  const stamp = `<p class="page-timestamp">Updated: ${now}</p>`;

  // 4. Injecte avant </body>
  $("h1").first().after(stamp);

  // 5. Écrit le fichier
  await fs.writeFile(file, $.html(), "utf-8");
  console.log(`✅ Timestamp injected into ${file}`);
}

(async () => {
  try {
    // 1. Récupère les fichiers HTML modifiés dans le dernier commit
    const changed = execSync('git diff --name-only HEAD~1 HEAD -- "*.html"', {
      encoding: "utf8",
    })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    if (changed.length === 0) {
      console.log("⏩ No HTML files changed in last commit.");
      return;
    }

    // 2. Injecte les timestamps
    for (const file of changed) {
      if (
        await fs
          .stat(file)
          .then((s) => s.isFile())
          .catch(() => false)
      ) {
        await injectTimestamp(file);
      }
    }

    console.log(`\n🎉 Done. Stamped ${changed.length} file(s).`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
