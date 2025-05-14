// scripts/add-timestamps-all.js
import fs from "fs/promises";
import path from "path";
import { readdir } from "fs/promises";

const folder = "./"; // Répertoire courant

console.log("📦 Scanning directory for .html files...");

let files;
try {
  files = await readdir(folder);
} catch (err) {
  console.error("❌ Unable to read directory:", err.message);
  process.exit(1);
}

const htmlFiles = files.filter((f) => f.endsWith(".html"));
console.log(`🔍 Found ${htmlFiles.length} HTML file(s).\n`);

for (const file of htmlFiles) {
  console.log(`➡️ Processing: ${file}`);

  let content;
  try {
    content = await fs.readFile(file, "utf-8");
  } catch (err) {
    console.error(`❌ Failed to read ${file}:`, err.message);
    continue;
  }

  const timestampHTML = `<small class="timestamp">Last updated: ${new Date().toLocaleString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  )}</small>\n`;

  if (content.includes('<small class="timestamp">')) {
    content = content.replace(/<small class="timestamp">.*?<\/small>\s*/s, "");
    console.log("♻️  Removed existing timestamp.");
  } else {
    console.log("ℹ️  No existing timestamp found.");
  }

  const h1Match = content.match(/<h1[^>]*>/);
  if (!h1Match) {
    console.warn(`⚠️  No <h1> tag found in ${file}. Skipping.`);
    continue;
  }

  const indexAfterH1 = content.indexOf(h1Match[0]) + h1Match[0].length;
  const updated =
    content.slice(0, indexAfterH1) +
    "\n" +
    timestampHTML +
    content.slice(indexAfterH1);

  try {
    await fs.writeFile(file, updated);
    console.log(`✅ Timestamp inserted into ${file}\n`);
  } catch (err) {
    console.error(`❌ Failed to write ${file}:`, err.message);
  }
}

console.log("✅ Batch timestamp process finished.");
