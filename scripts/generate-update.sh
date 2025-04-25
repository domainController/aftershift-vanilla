#!/bin/bash
# script: generate-update.sh
# description: Generates update.html from recent Git commits with human-readable timestamps.
# usage: ./generate-update.sh
# output: ./public/update.html + page-timestamp injection
# tags: update, changelog, html, automation

# === CONFIGURATION ===
REPO_PATH=$(pwd)  # Assumes script runs in root of repo
CHANGELOG_FILE="~/Documents/OB1Vanilla/CHANGELOG.md"
MAX_ENTRIES=10  # Max entries for updates.html

# === FUNCTIONS ===
function format_date() {
  LC_TIME=en_US.UTF-8 date -d "$1" "+%A %d %B %Y – %H:%M:%S"
}

function extract_commits() {
  git log --pretty=format:"%h|%ct|%s" | while IFS='|' read -r hash timestamp message; do
    formatted_date=$(format_date "@$timestamp")
    echo "### $formatted_date\n- $message ([commit](https://github.com/domainController/aftershift-vanilla/commit/$hash))\n"
  done
}

function update_changelog() {
  echo "# CHANGELOG" > "$CHANGELOG_FILE"
  echo "Generated on $(format_date "$(date +%s)")\n" >> "$CHANGELOG_FILE"
  extract_commits >> "$CHANGELOG_FILE"
}

function generate_updates_html() {
  head -n $(grep -n '###' "$CHANGELOG_FILE" | head -n $MAX_ENTRIES | tail -n 1 | cut -d: -f1) "$CHANGELOG_FILE" |
  pandoc -f markdown -t html -o "$REPO_PATH/updates.html"
}

# === EXECUTION ===
update_changelog
generate_updates_html

echo "✅ CHANGELOG.md and updates.html have been generated successfully."
