// scripts/generate-updates.mjs
// ES module script to generate updates.html with grouped daily commits
import { promises as fs } from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();
// Paths for template and output (root)
const TEMPLATE_PATH = path.resolve("update.html");
const OUTPUT_PATH = path.resolve("update.html");

// Icon picker based on commit message tag
function pickIcon(message) {
  const msg = message.toLowerCase();
  if (msg.includes("legal")) return "⚖️";
  if (msg.startsWith("feat")) return "✅";
  if (msg.startsWith("fix") || msg.startsWith("chore")) return "🔧";
  return "🔄";
}

// Format a Date object into 'Friday 25 April 2025' (no comma)
function formatDay(dateObj) {
  let s = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.replace(",", "");
}

// Retrieve last N commits
async function getCommits(sinceDays = 8) {
  // récupère tous les commits depuis **minuit** il y a sinceDays jours
  const sinceDateObj = new Date();
  sinceDateObj.setHours(0, 0, 0, 0); // on positionne à minuit aujourd'hui
  sinceDateObj.setDate(sinceDateObj.getDate() - sinceDays);
  const sinceDate = sinceDateObj.toISOString();
  // on récupère tous les commits depuis sinceDate (minuit J-sinceDays), jusqu’à HEAD
  // et on prend jusqu’à 1000 commits pour être sûr de tout couvrir
  // on passe simplement les options en CLI pour être sûr que le '--since' est bien appliqué
  // tu passes tout en arguments CLI : depuis sinceDate jusqu’à 1000 commits,
  // en incluant --all pour ne rien louper
  const log = await git.log([
    `--since=${sinceDate}`,
    `--max-count=1000`,
    `--all`,
  ]);
  const commits = [];
  for (const entry of log.all) {
    const hash = entry.hash;
    const dateObj = new Date(entry.date);
    // files changed
    const diff = await git.show([hash, "--name-only", "--pretty=format:"]);
    const pages = diff.split(/[\r?\n]+/).filter((f) => f.endsWith(".html"));
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
    if (!groups[c.isoDay])
      groups[c.isoDay] = { day: c.formattedDay, entries: [] };
    groups[c.isoDay].entries.push(c);
  }
  // convert to array sorted descending by isoDay
  return Object.entries(groups)
    .map(([iso, g]) => ({ iso, ...g }))
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

async function main() {
  const template = await fs.readFile(TEMPLATE_PATH, "utf-8");
  const sinceDays = 8; // ← cover 8 days: today + 7 previous
  const commits = await getCommits(sinceDays);
  const groups = groupByDay(commits);

  // === BEGIN remplir les jours manquants ===
  const DAY_MS = 24 * 60 * 60 * 1000;
  const allDays = Array.from({ length: sinceDays }, (_, i) => {
    const d = new Date(Date.now() - i * DAY_MS);
    return d.toISOString().slice(0, 10);
  });
  allDays.forEach((iso) => {
    if (!groups.find((g) => g.iso === iso)) {
      const d = new Date(iso);
      groups.push({ iso, day: formatDay(d), entries: [] });
    }
  });
  // ré-trier en décroissant
  groups.sort((a, b) => (a.iso < b.iso ? 1 : -1));
  // === END remplir les jours manquants ==='

  // Build snippet HTML
  let snippet = '<div class="legal-container">\n';
  for (const g of groups) {
    // on ne traite que les jours qui ont au moins un commit
    if (!g.entries.length) continue;
    snippet += `<h2>${g.entries[0].icon} ${g.day}</h2>\n`;
    snippet += "<ul>\n";
    for (const e of g.entries) {
      snippet += `  <li>${e.icon} ${e.time} – ${e.message}</li>\n`;
    }
    snippet += "</ul>\n";
  }
  // Yesterday stats
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = yesterday.toISOString().slice(0, 10);
  const yGroup = groups.find((g) => g.iso === yIso);
  let stats;
  if (yGroup) {
    const updates = yGroup.entries.length;
    const files = yGroup.entries.reduce((sum, e) => sum + e.pageCount, 0);
    stats = `📊 Yesterday: ${updates} updates across ${files} files.`;
  } else {
    stats = "📊 Yesterday: 0 updates.";
  }
  snippet += `<p>${stats}</p>\n`;
  snippet += "</div>";

  // Inject snippet
  const output = template.replace(
    /<!-- START UPDATES SNIPPET -->([\s\S]*?)<!-- END UPDATES SNIPPET -->/,
    `<!-- START UPDATES SNIPPET -->\n${snippet}\n<!-- END UPDATES SNIPPET -->`
  );

  await fs.writeFile(OUTPUT_PATH, output, "utf-8");
  console.log(
    `✅ Generated ${OUTPUT_PATH} with ${groups.length} day group(s).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
