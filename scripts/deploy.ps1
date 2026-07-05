Param()

Write-Host "Installing dependencies..."
npm ci

Write-Host "Generating news.json..."
npm run fetch-news

Write-Host "Adding docs changes to git..."
git add docs

$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "No changes in docs to commit."
} else {
    git commit -m "chore(docs): update generated docs" -q
}

Write-Host "Pushing docs to gh-pages branch using git subtree..."
try {
    git rev-parse --verify origin/gh-pages > $null 2>&1
    git subtree push --prefix docs origin gh-pages
} catch {
    git subtree split --prefix docs -b gh-pages-temp
    git push origin gh-pages-temp:gh-pages --force
    git branch -D gh-pages-temp
}

Write-Host "Deployed docs to gh-pages."