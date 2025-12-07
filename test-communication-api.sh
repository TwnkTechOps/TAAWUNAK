#!/bin/bash

# Communication Module API Testing Script
# Usage: ./test-communication-api.sh [JWT_TOKEN]

API_URL="http://localhost:4312"
TOKEN="${1:-YOUR_JWT_TOKEN_HERE}"

echo "🚀 Testing Communication & Networking Module API"
echo "=================================================="
echo "API URL: $API_URL"
echo ""

if [ "$TOKEN" == "YOUR_JWT_TOKEN_HERE" ]; then
  echo "⚠️  Please provide JWT token as argument:"
  echo "   ./test-communication-api.sh YOUR_JWT_TOKEN"
  echo ""
  echo "To get a token, login first:"
  echo "   curl -X POST $API_URL/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"your-email\",\"password\":\"your-password\"}'"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -n "Testing $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    if [ -n "$body" ] && [ "$body" != "null" ]; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body" | head -c 200
      echo ""
    fi
  else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    echo "$body" | head -c 200
    echo ""
  fi
  echo ""
}

# Test 1: Direct Messaging
echo "📨 Testing Direct Messaging"
echo "---------------------------"
test_endpoint "Get Conversations" "GET" "/messaging/direct/conversations"

# Test 2: Group Chat
echo "👥 Testing Group Chat"
echo "---------------------"
test_endpoint "Get Group Chats" "GET" "/messaging/groups"

# Test 3: Forums
echo "💬 Testing Discussion Forums"
echo "-----------------------------"
test_endpoint "Get Forums" "GET" "/forums"

# Test 4: Meetings
echo "📹 Testing Virtual Meetings"
echo "----------------------------"
test_endpoint "Get Meetings" "GET" "/meetings?upcoming=true"

# Test 5: Events
echo "🎉 Testing Events"
echo "-----------------"
test_endpoint "Get Events" "GET" "/events?upcoming=true"

# Test 6: Community Channels
echo "🌐 Testing Community Channels"
echo "------------------------------"
test_endpoint "Get Channels" "GET" "/communities/channels"

# Test 7: Knowledge Articles
echo "📚 Testing Knowledge Articles"
echo "-----------------------------"
test_endpoint "Get Articles" "GET" "/knowledge/articles"

echo "=================================================="
echo "✅ Testing Complete!"
echo ""
echo "To test creating new content, use the examples in:"
echo "   COMMUNICATION_MODULE_TESTING_GUIDE.md"

