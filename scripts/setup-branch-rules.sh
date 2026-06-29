#!/usr/bin/env bash
# setup-branch-rules.sh
# Run this ONCE after creating the repo on GitHub.
# Usage: GITHUB_TOKEN=ghp_xxx REPO=org/proxa bash scripts/setup-branch-rules.sh

set -e

if [ -z "$GITHUB_TOKEN" ] || [ -z "$REPO" ]; then
  echo "Usage: GITHUB_TOKEN=ghp_xxx REPO=owner/repo bash scripts/setup-branch-rules.sh"
  exit 1
fi

AUTH="Authorization: Bearer $GITHUB_TOKEN"
BASE="https://api.github.com/repos/$REPO"

echo "→ Protecting main (2 reviews, require CI, block force push)..."
curl -s -X PUT "$BASE/branches/main/protection" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["Lint", "Build SDK", "Build Anchor Programs", "Test Anchor Programs"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 2,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' | jq '.url // .message'

echo "→ Protecting dev (1 review, require CI, block force push)..."
curl -s -X PUT "$BASE/branches/dev/protection" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["Lint", "Build SDK"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }' | jq '.url // .message'

echo "✅ Branch rules applied."
echo ""
echo "Next steps:"
echo "  1. Invite teammates as Collaborators (repo Settings → Collaborators)"
echo "  2. They fork or clone, branch from dev: git checkout -b feat/your-feature"
echo "  3. PRs go: feat/* → dev → main"
