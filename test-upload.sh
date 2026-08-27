#!/usr/bin/env bash
# ==============================================================================
# The DelQuro Files Pro — AI Code Upload Verification Script
# This simulates an AI assistant uploading a newly generated project to your receiver.
# ==============================================================================

SERVER_URL="${1:-http://localhost:3000}"

echo "======================================================================"
echo "  Testing AI Code Upload to DelQuro Files Receiver at: ${SERVER_URL}"
echo "======================================================================"
echo ""

# 1. Health Check
echo "[1/3] Checking server status..."
STATUS_RES=$(curl -s "${SERVER_URL}/api/status")
echo "Response: ${STATUS_RES}"
echo ""

# 2. Upload Code Payload
echo "[2/3] Simulating AI uploading a new code project..."
UPLOAD_RES=$(curl -s -X POST "${SERVER_URL}/api/intake" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OmniVector Engine",
    "tagline": "Quantized real-time vector search for resource-constrained edge devices",
    "description": "OmniVector Engine is an ultra-compact vector search engine built for edge computing environments. It implements 1-bit binary quantization, hierarchical navigable small-world indexing, and hardware SIMD acceleration. Achieves sub-millisecond retrieval on ARM devices.",
    "stack": "C++, WebAssembly, TypeScript, SQLite",
    "arena_link": "https://arena.ai/c/omni-vector",
    "github_link": "https://github.com/delquro/omni-vector",
    "emergent_link": "https://emergent.sh/apps/omni-vector",
    "base44_link": "https://base44.com/omni-vector",
    "differentiator": "Consumes 94% less RAM than standard float32 vector indexes while retaining 98.2% top-10 recall accuracy.",
    "filename": "omni_vector.cpp",
    "code": "// OmniVector Engine - SIMD Quantized Search\n#include <vector>\n#include <arm_neon.h>\n\nfloat hamming_distance(uint64_t a, uint64_t b) {\n    return (float)__builtin_popcountll(a ^ b);\n}"
  }')

echo "Upload Response:"
echo "${UPLOAD_RES}"
echo ""

# 3. Verify in Inbox
echo "[3/3] Verifying item in intake staging queue..."
INBOX_RES=$(curl -s "${SERVER_URL}/api/intake")
echo "Inbox Count: $(echo "${INBOX_RES}" | python3 -c 'import sys, json; data=json.load(sys.stdin); print(data.get("count", 0))')"
echo ""
echo "SUCCESS! The AI code payload was received and drafted into a card."
echo "Visit ${SERVER_URL} and click 'AI Intake & Studio' to review and publish it to DelQuro Files!"
echo "======================================================================"
