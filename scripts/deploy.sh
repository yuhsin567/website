#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
npm ci

echo "Generating news.json..."
npm run fetch-news

echo "Adding docs changes to git..."
git add docs

if git diff --cached --quiet; then
  echo "No changes in docs to commit."
else
  git commit -m "chore(docs): update generated docs" || true
fi

echo "Pushing docs to gh-pages branch using git subtree..."
# Attempt subtree push; if it fails, show guidance
if git rev-parse --verify origin/gh-pages >/dev/null 2>&1; then
  git subtree push --prefix docs origin gh-pages || {
    echo "git subtree push failed. You can try splitting and pushing manually:"
    echo "  git subtree split --prefix docs -b gh-pages-temp"
    echo "  git push origin gh-pages-temp:gh-pages --force"
    echo "  git branch -D gh-pages-temp"
    exit 1
  }
else
  # No remote gh-pages yet: create via split push
  git subtree split --prefix docs -b gh-pages-temp
  git push origin gh-pages-temp:gh-pages --force
  git branch -D gh-pages-temp
fi

echo "Deployed docs to gh-pages."