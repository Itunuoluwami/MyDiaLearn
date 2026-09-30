#!/usr/bin/env bash
# Commit a built site to a deploy branch, keeping that branch's history.
#
#   scripts/publish-deploy-branch.sh <branch> <directory>
#
# Appends a commit rather than force-pushing, so a server that last pulled an
# older build can always fast-forward. Server-only files (.env, App_Data
# uploads, iisnode logs) are gitignored on the branch, so a pull on the server
# never touches them.
set -euo pipefail

branch="$1"
source_dir="$(cd "$2" && pwd)"
repo_url="$(git config --get remote.origin.url)"
work="$(mktemp -d)"

git config --global user.name "github-actions[bot]"
git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
git config --global core.autocrlf false

# actions/checkout leaves an auth header in the workspace's git config; reuse it.
auth_header="$(git config --get http.https://github.com/.extraheader || true)"

if git -c http.extraheader="$auth_header" ls-remote --exit-code --heads "$repo_url" "$branch" >/dev/null; then
  git -c http.extraheader="$auth_header" clone --quiet --depth 1 --branch "$branch" "$repo_url" "$work"
else
  git init --quiet "$work"
  git -C "$work" checkout --quiet --orphan "$branch"
  git -C "$work" remote add origin "$repo_url"
fi

# Replace the tree wholesale so deleted files disappear from the site too.
find "$work" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$source_dir/." "$work/"

cat > "$work/.gitignore" <<'IGNORE'
# Created on the server, never deployed.
.env
.env.*
App_Data/
iisnode/
IGNORE

git -C "$work" add -A
if git -C "$work" diff --cached --quiet; then
  echo "$branch is already up to date."
  exit 0
fi

git -C "$work" commit --quiet -m "Deploy ${GITHUB_SHA:-local build}"
git -C "$work" -c http.extraheader="$auth_header" push --quiet origin "HEAD:$branch"
echo "Published $branch."
