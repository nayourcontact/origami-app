#!/usr/bin/env bash
set -euo pipefail
# Run on the droplet with a private MongoDB URI from a protected environment file.
: "${MONGO_URI:?MONGO_URI must be supplied securely}"
DEST="${BACKUP_DIR:-/home/app/backups/mongodb}"
mkdir -p "$DEST"
chmod 700 "$DEST"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$DEST/origami-$STAMP.archive.gz"
umask 077
mongodump --uri="$MONGO_URI" --archive="$FILE" --gzip
[ -s "$FILE" ] || { echo 'Empty backup' >&2; exit 1; }
sha256sum "$FILE" > "$FILE.sha256"
chmod 600 "$FILE" "$FILE.sha256"
find "$DEST" -maxdepth 1 -name 'origami-*.archive.gz' -mtime +"${RETENTION_DAYS:-14}" -delete
find "$DEST" -maxdepth 1 -name 'origami-*.archive.gz.sha256' -mtime +"${RETENTION_DAYS:-14}" -delete
echo "Backup created: $FILE"
