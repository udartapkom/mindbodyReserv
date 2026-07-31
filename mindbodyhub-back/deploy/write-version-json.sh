#!/usr/bin/env bash
# Write version.json into a build/deploy output directory.
# Usage:
#   ./write-version-json.sh <output-dir> <package-name> <package-version>
# Optional env:
#   DEPLOY_VERSION, GIT_SHA
set -euo pipefail

OUT_DIR="${1:?output dir required}"
NAME="${2:?package name required}"
VERSION="${3:?package version required}"

mkdir -p "$OUT_DIR"

GIT_SHA="${GIT_SHA:-}"
if [[ -z "$GIT_SHA" ]] && command -v git >/dev/null 2>&1; then
  GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || true)"
fi

DEPLOY_VERSION="${DEPLOY_VERSION:-${GIT_SHA:-$VERSION}}"
BUILT_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat >"$OUT_DIR/version.json" <<EOF
{
  "name": "$(printf '%s' "$NAME" | sed 's/"/\\"/g')",
  "version": "$(printf '%s' "$VERSION" | sed 's/"/\\"/g')",
  "deployVersion": "$(printf '%s' "$DEPLOY_VERSION" | sed 's/"/\\"/g')",
  "gitSha": $(if [[ -n "$GIT_SHA" ]]; then printf '"%s"' "$GIT_SHA"; else echo null; fi),
  "builtAt": "$BUILT_AT"
}
EOF

echo "Wrote $OUT_DIR/version.json (deployVersion=$DEPLOY_VERSION gitSha=${GIT_SHA:-none})"
