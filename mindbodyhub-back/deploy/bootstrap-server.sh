#!/usr/bin/env bash
# Bootstrap MindBodyHub on a small VPS (no Docker — ~1GB RAM).
# Run as root on the server.
set -euo pipefail

APP_ROOT=/opt/mindbodyhub
SWAPFILE=/swapfile

echo "==> Swap (2G) if missing"
if ! swapon --show | grep -q .; then
  if [[ ! -f "$SWAPFILE" ]]; then
    fallocate -l 2G "$SWAPFILE" || dd if=/dev/zero of="$SWAPFILE" bs=1M count=2048
    chmod 600 "$SWAPFILE"
    mkswap "$SWAPFILE"
  fi
  swapon "$SWAPFILE" || true
  grep -q "$SWAPFILE" /etc/fstab || echo "$SWAPFILE none swap sw 0 0" >> /etc/fstab
fi
free -h

echo "==> Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg ufw postgresql postgresql-contrib nginx certbot python3-certbot-nginx

echo "==> Node.js 20"
if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v
npm install -g pm2

echo "==> PostgreSQL role/db"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mindbodyhub') THEN
    CREATE ROLE mindbodyhub LOGIN PASSWORD 'CHANGE_ME_DB';
  END IF;
END
$$;
SELECT 'CREATE DATABASE mindbodyhub OWNER mindbodyhub'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mindbodyhub')\gexec
SQL

echo "==> MinIO binary"
if [[ ! -x /usr/local/bin/minio ]]; then
  curl -fsSL -o /usr/local/bin/minio https://dl.min.io/server/minio/release/linux-amd64/minio
  chmod +x /usr/local/bin/minio
fi
if [[ ! -x /usr/local/bin/mc ]]; then
  curl -fsSL -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc
  chmod +x /usr/local/bin/mc
fi
id minio >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin minio
mkdir -p /var/lib/minio/data
chown -R minio:minio /var/lib/minio

echo "==> App directories"
mkdir -p "$APP_ROOT"/{back,front,logs} /var/www/admin /var/www/certbot
mkdir -p /etc/mindbodyhub

echo "Bootstrap base packages done."
