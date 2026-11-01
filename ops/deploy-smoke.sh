#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:5000}"
for attempt in $(seq 1 20); do
  if curl --silent --show-error --fail --max-time 3 "${BASE}/health/ready" >/dev/null 2>&1; then
    curl --silent --show-error --fail --max-time 3 "${BASE}/health/live" >/dev/null
    echo "Deploy smoke PASS (attempt ${attempt})"
    exit 0
  fi
  sleep 2
done
echo 'Deploy smoke FAILED: readiness did not become healthy' >&2
exit 1
