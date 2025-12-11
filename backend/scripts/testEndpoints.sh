#!/bin/bash
# Test script for verifying all three API endpoint fixes

echo "======================================================================"
echo "API Endpoint Verification Tests"
echo "======================================================================"
echo ""

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Prerequisites:"
echo "1. Backend server must be running (npm start)"
echo "2. You must have a valid faculty/admin token"
echo "3. You must have valid student and achievement IDs from the database"
echo ""
echo "======================================================================"
echo ""

# Test 1: GET /api/student-achievements
echo "TEST 1: GET /api/student-achievements"
echo "----------------------------------------------------------------------"
echo "Testing if GET endpoint exists (should not return 'Cannot GET')..."
echo ""
echo "Command:"
echo "curl -X GET \"$BASE_URL/api/student-achievements\""
echo ""
echo "Expected: JSON response with achievements array"
echo "Actual response:"
curl -X GET "$BASE_URL/api/student-achievements"
echo ""
echo ""

# Test 2: GET /api/achievements (to get valid achievement IDs)
echo "TEST 2: GET /api/achievements"
echo "----------------------------------------------------------------------"
echo "Fetching valid achievement IDs from database..."
echo ""
echo "Command:"
echo "curl -X GET \"$BASE_URL/api/achievements\""
echo ""
echo "Response:"
curl -X GET "$BASE_URL/api/achievements"
echo ""
echo ""
echo "${YELLOW}ACTION REQUIRED:${NC} Copy a valid achievement _id from above for next test"
echo ""

# Test 3: POST /api/student-achievements (requires manual token and IDs)
echo "TEST 3: POST /api/student-achievements"
echo "----------------------------------------------------------------------"
echo "${YELLOW}MANUAL TEST REQUIRED${NC}"
echo ""
echo "Replace the following placeholders:"
echo "  - YOUR_FACULTY_TOKEN: Your JWT token from login"
echo "  - VALID_STUDENT_ID: A student's _id from database"
echo "  - VALID_ACHIEVEMENT_ID: An achievement _id from TEST 2 above"
echo ""
echo "Command:"
cat << 'EOF'
curl -X POST "http://localhost:5000/api/student-achievements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN" \
  -d '{
    "studentId": "VALID_STUDENT_ID",
    "achievementId": "VALID_ACHIEVEMENT_ID"
  }'
EOF
echo ""
echo "Expected: Success response with txHash and 'onChainCreated: true'"
echo ""
echo ""

# Test 4: GET /api/blockchain/balance/:wallet
echo "TEST 4: GET /api/blockchain/balance/:wallet"
echo "----------------------------------------------------------------------"
echo "${YELLOW}MANUAL TEST REQUIRED${NC}"
echo ""
echo "Replace STUDENT_WALLET_ADDRESS with the student's wallet address"
echo ""
echo "Command:"
echo "curl -X GET \"$BASE_URL/api/blockchain/balance/STUDENT_WALLET_ADDRESS\""
echo ""
echo "Expected after successful achievement award:"
echo '{"wallet":"0x...","raw":"100","human":100}'
echo ""
echo "If balance is 0, it means no achievements have been successfully granted yet."
echo ""
echo ""

echo "======================================================================"
echo "Summary of Issues and Fixes"
echo "======================================================================"
echo ""
echo "${GREEN}✅ Issue 1 - POST returns 'Achievement not found'${NC}"
echo "   Root Cause: User sending incorrect achievement ID"
echo "   Fix: Use valid achievement _id from database (see TEST 2)"
echo ""
echo "${GREEN}✅ Issue 2 - GET returns 'Cannot GET'${NC}"
echo "   Root Cause: Missing GET route in studentAchievements.js"
echo "   Fix: Added GET '/', GET '/:id', DELETE '/:id' routes"
echo "   Status: FIXED - Test with TEST 1"
echo ""
echo "${GREEN}✅ Issue 3 - Balance returns 0${NC}"
echo "   Root Cause: No achievements granted yet (due to Issue 1)"
echo "   Fix: Award achievements using correct IDs (see TEST 3)"
echo "   Status: Will resolve after Issue 1 is addressed"
echo ""
echo "======================================================================"
