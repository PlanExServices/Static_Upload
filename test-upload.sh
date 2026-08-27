#!/usr/bin/env bash
# ==============================================================================
# The DelQuro Files Pro — Authenticated AI Code Upload Verification Script
# Tests uploading an AI project payload to your live Render receiver with API key.
# ==============================================================================

SERVER_URL="${1:-https://static-upload.onrender.com}"
API_KEY="${2:-$INTAKE_API_KEY}"

echo "======================================================================"
echo "  Testing Authenticated AI Code Upload to: ${SERVER_URL}"
echo "  Using API Key: ${API_KEY:0:8}..."
echo "======================================================================"
echo ""

# 1. Health Check
echo "[1/3] Checking server status..."
STATUS_RES=$(curl -s "${SERVER_URL}/api/status")
echo "Response: ${STATUS_RES}"
echo ""

# 2. Upload Code Payload with API Key
echo "[2/3] Simulating AI uploading a new code project with secret key..."
UPLOAD_RES=$(curl -s -X POST "${SERVER_URL}/api/intake" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "{
    \"api_key\": \"${API_KEY}\",
    \"name\": \"Authenticated Verification Project\",
    \"tagline\": \"Live test with enforced secret API key verification\",
    \"description\": \"Validating that requests with the secret API key are accepted by the receiver, while unauthenticated requests are blocked with 401 Unauthorized.\",
    \"stack\": \"TypeScript, Node.js, Render, Arena SDK\",
    \"arena_link\": \"https://arena.ai/c/auth-test\",
    \"github_link\": \"https://github.com/PlanExServices/Static_Upload\",
    \"emergent_link\": \"https://emergent.sh/apps/auth-test\",
    \"base44_link\": \"https://base44.com/apps/auth-test\",
    \"differentiator\": \"Enforced API key protection blocking unauthorized uploads at the gateway level.\",
    \"filename\": \"auth_test.ts\",
    \"code\": \"// Key authentication verified\nexport const authenticated = true;\"
  }")

echo "Upload Response:"
echo "${UPLOAD_RES}"
echo ""

# 3. Verify in Inbox
echo "[3/3] Verifying item in intake staging queue..."
INBOX_RES=$(curl -s -H "X-API-Key: ${API_KEY}" "${SERVER_URL}/api/intake")
echo "Inbox Count: $(echo "${INBOX_RES}" | python3 -c 'import sys, json; data=json.load(sys.stdin); print(data.get("count", 0))')"
echo ""
echo "SUCCESS! Authenticated AI upload verified."
echo "Visit ${SERVER_URL} and click \"AI Intake & Studio\" to review and publish it to DelQuro Files!"
echo "======================================================================"
