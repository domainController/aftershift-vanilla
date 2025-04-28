// scripts/generate-home-updates.mjs
// Corrected ES module script to inject last 2 days of updates into index.html

import { promises as fs } from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();
const INDEX_PATH = path.resolve("index.html");

// Icon picker based on commit message
function pickIcon(message) {
  const msg = message.toLowerCase();
  if (msg.includes("legal")) return "\u2696\ufe0f"; // ⚖️ = ⚖️
  if (msg.startsWith("feat")) return "\u2705"; // ✅
  if (msg.startsWith("fix") || msg.startsWith("chore")) return "\ud83d\udd27"; // 🔧
  return "\ud83d\udd04"; // 🔄
}

// Format Date to 'Friday 25 April 2025' (no comma)
function formatDay(dateObj) {
  return dateObj
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(",", "");
}

// Fetch commits from the last `sinceDays`
async function getCommits(sinceDays = 1) {
  const sinceDateObj = new Date();
  sinceDateObj.setHours(0, 0, 0, 0);
  sinceDateObj.setDate(sinceDateObj.getDate() - sinceDays);
  const sinceDate = sinceDateObj.toISOString();

  const log = await git.log([
    `--since=${sinceDate}`,
    "--max-count=1000",
    "--all",
  ]);

  const commits = [];
  for (const entry of log.all) {
    const dateObj = new Date(entry.date);
    const diff = await git.show([
      entry.hash,
      "--name-only",
      "--pretty=format:",
    ]);
    const pages = diff.split(/\r?\n/).filter((f) => f.endsWith(".html"));

    commits.push({
      dateObj,
      time: dateObj.toLocaleTimeString("en-GB", { hour12: false }),
      formattedDay: formatDay(dateObj),
      isoDay: dateObj.toISOString().slice(0, 10),
      message: entry.message,
      icon: pickIcon(entry.message),
      pageCount: pages.length,
    });
  }
  return commits;
}

// Group commits by isoDay
function groupByDay(commits) {
  const groups = {};
  for (const c of commits) {
    if (!groups[c.isoDay]) {
      groups[c.isoDay] = { day: c.formattedDay, entries: [] };
    }
    groups[c.isoDay].entries.push(c);
  }
  return Object.entries(groups)
    .map(([iso, g]) => ({ iso, ...g }))
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

async function main() {
  const commits = await getCommits(2);
  const groups = groupByDay(commits);

  // Build snippet with maximum 2 days
  let snippet = '<div class="legal-container">\n';
  for (const g of groups.slice(0, 1)) {
    if (!g.entries.length) continue;
    snippet += `<h2>${g.entries[0].icon} ${g.day}</h2>\n<ul>\n`;
    for (const e of g.entries) {
      snippet += `  <li>${e.icon} ${e.time} – ${e.message}</li>\n`;
    }
    snippet += "</ul>\n";
  }
  snippet += "</div>";

  let html = await fs.readFile(INDEX_PATH, "utf-8");

  if (
    !html.includes("<!-- START INDEX UPDATES -->") ||
    !html.includes("<!-- END INDEX UPDATES -->")
  ) {
    console.error("\u274c Could not find update markers in index.html");
    process.exit(1);
  }

  html = html.replace(
    /<!-- START INDEX UPDATES -->([\s\S]*?)<!-- END INDEX UPDATES -->/,
    `<!-- START INDEX UPDATES -->\n${snippet}\n<!-- END INDEX UPDATES -->`
  );

  await fs.writeFile(INDEX_PATH, html, "utf-8");
  console.log(`\u2705 Injected latest 2 days of updates into ${INDEX_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
