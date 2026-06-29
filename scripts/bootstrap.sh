#!/usr/bin/env bash
# bootstrap.sh — run this locally to create the GitHub repo and push initial commit
# Prerequisites: gh CLI installed and authenticated (gh auth login)
# Usage: REPO_NAME=proxa ORG=your-github-username bash scripts/bootstrap.sh

set -e

REPO_NAME="${REPO_NAME:-proxa}"
ORG="${ORG:-$(gh api user -q .login)}"

echo "→ Creating GitHub repo $ORG/$REPO_NAME..."
gh repo create "$ORG/$REPO_NAME" \
  --private \
  --description "Trustless parametric prop-bet settlement engine on Solana" \
  --clone=false

echo "→ Initializing git..."
git init
git add .
git commit -m "chore: initial repo scaffold"

echo "→ Pushing to GitHub..."
git remote add origin "https://github.com/$ORG/$REPO_NAME.git"
git branch -M main
git push -u origin main

echo "→ Creating dev branch..."
git checkout -b dev
git push -u origin dev

echo "→ Setting up branch protection rules..."
GITHUB_TOKEN="$(gh auth token)" REPO="$ORG/$REPO_NAME" bash scripts/setup-branch-rules.sh

echo ""
echo "✅ Repo ready: https://github.com/$ORG/$REPO_NAME"
echo ""
echo "Share with teammates:"
echo "  git clone https://github.com/$ORG/$REPO_NAME"
echo "  cd $REPO_NAME"
echo "  git checkout dev"
echo "  git checkout -b feat/your-feature"
