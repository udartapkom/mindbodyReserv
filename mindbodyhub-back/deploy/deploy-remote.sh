#!/usr/bin/env bash
# Deploy MindBodyHub updates to production VPS.
# Usage (from repo root on your machine):
#   export DEPLOY_HOST=root@89.108.71.23
#   ./mindbodyhub-back/deploy/deploy-remote.sh
#
# Optional release metadata (written into version.json for admin/front/api,
# and can also be set in API .env as DEPLOY_VERSION / GIT_SHA):
#   export DEPLOY_VERSION=2026.07.28
#   export GIT_SHA=$(git rev-parse --short HEAD)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="${DEPLOY_HOST:?Set DEPLOY_HOST, e.g. root@89.108.71.23}"
SSH_OPTS=${SSH_OPTS:-"-o StrictHostKeyChecking=accept-new"}
WRITE_VERSION="$ROOT/mindbodyhub-back/deploy/write-version-json.sh"

if [[ -z "${GIT_SHA:-}" ]] && command -v git >/dev/null 2>&1; then
  GIT_SHA="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || true)"
  export GIT_SHA
fi
if [[ -z "${DEPLOY_VERSION:-}" && -n "${GIT_SHA:-}" ]]; then
  DEPLOY_VERSION="$GIT_SHA"
  export DEPLOY_VERSION
fi

pkg_version() {
  node -p "require('$1/package.json').version"
}

echo "==> Build API"
(cd "$ROOT/mindbodyhub-back" && npm ci && npm run build)
"$WRITE_VERSION" "$ROOT/mindbodyhub-back/dist" "mindbodyhub-back" "$(pkg_version "$ROOT/mindbodyhub-back")"

echo "==> Build front"
(cd "$ROOT/mindbodyhub-front" && \
  NEXT_PUBLIC_API_BASE_URL=https://api.mindbodyhub.pro \
  NEXT_PUBLIC_SITE_URL=https://mindbodyhub.pro \
  npm ci && npm run build)
mkdir -p "$ROOT/mindbodyhub-front/.next/standalone/public"
cp -a "$ROOT/mindbodyhub-front/public/." "$ROOT/mindbodyhub-front/.next/standalone/public/" 2>/dev/null || true
cp -a "$ROOT/mindbodyhub-front/.next/static" "$ROOT/mindbodyhub-front/.next/standalone/.next/"
FRONT_VER="$(pkg_version "$ROOT/mindbodyhub-front")"
"$WRITE_VERSION" "$ROOT/mindbodyhub-front/public" "mindbodyhub-front" "$FRONT_VER"
"$WRITE_VERSION" "$ROOT/mindbodyhub-front/.next/standalone/public" "mindbodyhub-front" "$FRONT_VER"

echo "==> Build admin"
(cd "$ROOT/mindbodyhub-admin" && \
  VITE_API_BASE_URL=https://api.mindbodyhub.pro \
  npm ci && npm run build)
"$WRITE_VERSION" "$ROOT/mindbodyhub-admin/dist" "mindbodyhub-admin" "$(pkg_version "$ROOT/mindbodyhub-admin")"

echo "==> Upload"
rsync -az -e "ssh $SSH_OPTS" \
  "$ROOT/mindbodyhub-back/package.json" \
  "$ROOT/mindbodyhub-back/package-lock.json" \
  "$HOST:/opt/mindbodyhub/back/"
rsync -az --delete -e "ssh $SSH_OPTS" \
  "$ROOT/mindbodyhub-back/dist/" "$HOST:/opt/mindbodyhub/back/dist/"
rsync -az -e "ssh $SSH_OPTS" \
  "$ROOT/mindbodyhub-back/deploy/" "$HOST:/opt/mindbodyhub/back/deploy/"
rsync -az --delete -e "ssh $SSH_OPTS" \
  "$ROOT/mindbodyhub-front/.next/standalone/" "$HOST:/opt/mindbodyhub/front/"
rsync -az --delete -e "ssh $SSH_OPTS" \
  "$ROOT/mindbodyhub-admin/dist/" "$HOST:/var/www/admin/"

echo "==> Remote install + restart"
ssh $SSH_OPTS "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
cd /opt/mindbodyhub/back
npm ci --omit=dev
# Prefer ecosystem so front stays on :3000 and API on :4000
if [[ -f /opt/mindbodyhub/ecosystem.config.cjs ]]; then
  pm2 startOrReload /opt/mindbodyhub/ecosystem.config.cjs --update-env
else
  pm2 restart mbh-api mbh-front --update-env
fi
nginx -t && systemctl reload nginx
sleep 2
curl -fsS https://api.mindbodyhub.pro/health
echo
REMOTE

echo "Deploy done."
