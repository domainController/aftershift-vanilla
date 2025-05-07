// scripts/generate-updates.mjs
// ES module script to generate updates.html with grouped daily commits

import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

// --- ARCHIVING TO LOGS ---

// Paths for template and output
const TEMPLATE_PATH = path.resolve("updates.html");
const OUTPUT_PATH = path.resolve("updates.html");

// Create logs/ directory if it doesn't exist
const logsDir = path.resolve("logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define archive path
const archivePath = path.join(logsDir, "updates-archive.html");

// Icon picker based on commit message tag
function pickIcon(message) {
  const msg = message.toLowerCase();
  if (msg.includes("legal")) return "⚖️";
  if (msg.includes("content")) return "✍️";
  if (msg.includes("style") || msg.includes("css")) return "🎨";
  if (msg.includes("structure") || msg.includes("refactor")) return "🗂️";
  if (msg.includes("timeline") || msg.includes("log")) return "🕰️";
  if (msg.includes("docs")) return "📄";
  if (msg.includes("ux") || msg.includes("design")) return "🎯";
  if (msg.includes("form") || msg.includes("input")) return "📝";
  if (msg.includes("contact")) return "📬";
  if (msg.includes("search")) return "🔎";
  if (msg.includes("simulator")) return "🧮";
  if (msg.includes("navlink") || msg.includes("nav")) return "🧭";
  if (msg.includes("placeholder")) return "🚧";
  if (msg.includes("glossary")) return "📘";
  if (msg.includes("feat")) return "✅";
  if (msg.includes("fix") || msg.includes("chore")) return "🛠️";
  return "🔄"; // fallback
}

// Format a Date object into 'Saturday 26 April 2025'
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

// Retrieve last N commits
async function getCommits(sinceDays = 8) {
  const sinceDateObj = new Date();
  sinceDateObj.setHours(0, 0, 0, 0);
  sinceDateObj.setDate(sinceDateObj.getDate() - sinceDays);
  const sinceDate = sinceDateObj.toISOString();

  const log = await git.log([
    `--since=${sinceDate}`,
    `--max-count=1000`,
    `--all`,
  ]);

  const commits = [];
  for (const entry of log.all) {
    const hash = entry.hash;
    const dateObj = new Date(entry.date);
    const diff = await git.show([hash, "--name-only", "--pretty=format:"]);
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

// Group commits by day
function groupByDay(commits) {
  const groups = {};
  for (const c of commits) {
    if (!groups[c.isoDay]) {
      groups[c.isoDay] = { day: c.formattedDay, entries: [] };
    }
    groups[c.isoDay].entries.push(c);
  }
  return Object.entries(groups)
    .map(([iso, group]) => ({ iso, ...group }))
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}

async function main() {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const sinceDays = 8;
  const commits = await getCommits(sinceDays);
  const groups = groupByDay(commits);

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

  groups.sort((a, b) => (a.iso < b.iso ? 1 : -1));

  // Build HTML snippet
  let snippet = '<div class="legal-container">\n';
  for (const g of groups) {
    if (!g.entries.length) continue;
    snippet += `<strong>${g.entries[0].icon} ${g.day}</strong>\n`;
    snippet += "<ul>\n";
    for (const e of g.entries) {
      snippet += `  <li>${e.icon} ${e.time} – ${e.message}</li>\n`;
    }
    snippet += "</ul>\n";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = yesterday.toISOString().slice(0, 10);
  const yGroup = groups.find((g) => g.iso === yIso);

  const stats = yGroup
    ? `📊 Yesterday: ${
        yGroup.entries.length
      } updates across ${yGroup.entries.reduce(
        (sum, e) => sum + e.pageCount,
        0
      )} files.`
    : "📊 Yesterday: 0 updates.";

  snippet += `<p>${stats}</p>\n`;
  snippet += "</div>";

  const output = template.replace(
    /<!-- START UPDATES SNIPPET -->([\s\S]*?)<!-- END UPDATES SNIPPET -->/,
    `<!-- START UPDATES SNIPPET -->\n${snippet}\n<!-- END UPDATES SNIPPET -->`
  );

  fs.writeFileSync(OUTPUT_PATH, output, "utf-8");
  console.log(
    `✅ Generated ${OUTPUT_PATH} with ${groups.length} day group(s).`
  );

  // Archive also
  const updatesHtmlContent = fs.readFileSync(OUTPUT_PATH, "utf-8");
  fs.appendFileSync(archivePath, updatesHtmlContent + "\n\n", "utf-8");
  console.log(`✅ Updates archived successfully to ${archivePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
