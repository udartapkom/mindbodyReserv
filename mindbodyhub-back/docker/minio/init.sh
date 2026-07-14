#!/bin/sh
set -eu

MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
MINIO_BUCKET_AVATARS="${MINIO_BUCKET_AVATARS:-avatars}"
MINIO_BUCKET_MATERIALS="${MINIO_BUCKET_MATERIALS:-materials}"

echo "Waiting for MinIO at ${MINIO_HOST}:${MINIO_PORT}..."

until mc alias set local "http://${MINIO_HOST}:${MINIO_PORT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" >/dev/null 2>&1; do
  sleep 2
done

mc mb "local/${MINIO_BUCKET_AVATARS}" --ignore-existing
mc mb "local/${MINIO_BUCKET_MATERIALS}" --ignore-existing

# Материалы курсов — публичное чтение (картинки в контенте)
mc anonymous set download "local/${MINIO_BUCKET_MATERIALS}"

echo "MinIO buckets ready: ${MINIO_BUCKET_AVATARS}, ${MINIO_BUCKET_MATERIALS}"
