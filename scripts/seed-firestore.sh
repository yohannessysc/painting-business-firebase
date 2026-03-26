#!/usr/bin/env bash
set -euo pipefail

# Seeds Firestore collections via the deployed admin endpoint.
# Requires: curl, jq

SITE_URL="https://eps-yk-2026.web.app"
ADMIN_EMAIL="evolutionspaintingsolutions@gmail.com"

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required but not installed."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed."
  echo "Install with: brew install jq"
  exit 1
fi

if [[ "${1:-}" == "--help" ]]; then
  cat <<EOF
Usage: scripts/seed-firestore.sh [--dry-run]

Options:
  --dry-run   Validate payload and list docs without writing to Firestore

Environment overrides:
  SITE_URL
  ADMIN_EMAIL
  API_KEY_OVERRIDE
EOF
  exit 0
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Allow environment overrides while keeping sensible defaults.
SITE_URL="${SITE_URL_OVERRIDE:-$SITE_URL}"
ADMIN_EMAIL="${ADMIN_EMAIL_OVERRIDE:-$ADMIN_EMAIL}"
API_KEY_OVERRIDE="${API_KEY_OVERRIDE:-}"

echo "Seeding Firestore via: $SITE_URL"
echo "Admin email: $ADMIN_EMAIL"

read -r -s -p "Enter admin password: " ADMIN_PASSWORD
echo

if [[ -z "$ADMIN_PASSWORD" ]]; then
  echo "Error: password cannot be empty."
  exit 1
fi

if [[ -n "$API_KEY_OVERRIDE" ]]; then
  API_KEY="$API_KEY_OVERRIDE"
else
  INIT_JSON=$(curl -s "$SITE_URL/__/firebase/init.json")
  API_KEY=$(echo "$INIT_JSON" | jq -r '.apiKey // empty')
fi

if [[ -z "$API_KEY" ]]; then
  echo "Error: could not read apiKey from $SITE_URL/__/firebase/init.json"
  echo "Response was:"
  echo "${INIT_JSON:-<not-fetched>}"
  exit 1
fi

AUTH_JSON=$(curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"returnSecureToken\":true}")

ID_TOKEN=$(echo "$AUTH_JSON" | jq -r '.idToken // empty')
FIREBASE_UID=$(echo "$AUTH_JSON" | jq -r '.localId // empty')
AUTH_ERROR=$(echo "$AUTH_JSON" | jq -r '.error.message // empty')

if [[ -n "$AUTH_ERROR" ]]; then
  echo "Error: Firebase auth failed: $AUTH_ERROR"
  exit 1
fi

if [[ -z "$ID_TOKEN" || -z "$FIREBASE_UID" ]]; then
  echo "Error: failed to retrieve auth token or UID."
  echo "Auth response:"
  echo "$AUTH_JSON"
  exit 1
fi

SEED_PAYLOAD=$(jq -n \
  --arg adminUserId "$FIREBASE_UID" \
  --arg adminEmail "$ADMIN_EMAIL" \
  --argjson dryRun "$DRY_RUN" \
  '{adminUserId: $adminUserId, adminEmail: $adminEmail, dryRun: $dryRun}')

SEED_RESPONSE=$(curl -s -X POST "$SITE_URL/api/admin/seed" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SEED_PAYLOAD")

OK=$(echo "$SEED_RESPONSE" | jq -r '.ok // false')
if [[ "$OK" != "true" ]]; then
  echo "Seed call failed. Response:"
  echo "$SEED_RESPONSE" | jq
  exit 1
fi

echo "Seed call succeeded:"
echo "$SEED_RESPONSE" | jq
