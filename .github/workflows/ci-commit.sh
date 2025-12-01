#!/bin/sh
set -e

# Configure git author for commits made by Actions
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

# Check for changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Changes detected. Committing..."
  git add -A
  git commit -m "ci: auto-commit from GitHub Actions"
  # Push back to the default branch (main)
  git push origin HEAD:main
else
  echo "No changes to commit."
fi
