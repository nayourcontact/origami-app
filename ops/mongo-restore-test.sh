#!/usr/bin/env bash
set -euo pipefail
# Restore to a SEPARATE isolated test database only. Never run against production.
: "${RESTORE_TEST_URI:?Set RESTORE_TEST_URI to an isolated disposable MongoDB database}"
ARCHIVE="${1:?Usage: RESTORE_TEST_URI=... ./mongo-restore-test.sh backup.archive.gz}"
[ -r "$ARCHIVE" ] || exit 1
sha256sum -c "$ARCHIVE.sha256"
# Require the operator to manually verify the isolation of RESTORE_TEST_URI before proceeding.
[ "${CONFIRM_ISOLATED_RESTORE:-}" = 'YES' ] || { echo 'Set CONFIRM_ISOLATED_RESTORE=YES after verifying restore target isolation' >&2; exit 1; }
mongorestore --uri="$RESTORE_TEST_URI" --archive="$ARCHIVE" --gzip --drop
printf 'Restore command completed; validate collections, counts, sample records and app compatibility on isolated DB.\n'
