#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== AI Cost Guardian - Full Application Flow Test ===${NC}\n"

# Test 1: Homepage accessibility
echo -e "${YELLOW}Test 1: Homepage Accessibility${NC}"
if curl -s http://localhost:3000 | grep -q "AI Cost Guardian"; then
    echo -e "${GREEN}✓ Homepage loads successfully${NC}"
else
    echo -e "${RED}✗ Homepage failed to load${NC}"
fi

# Test 2: Authentication page
echo -e "\n${YELLOW}Test 2: Authentication Page${NC}"
if curl -s http://localhost:3000/auth/signin | grep -q "Sign in"; then
    echo -e "${GREEN}✓ Sign-in page accessible${NC}"
else
    echo -e "${RED}✗ Sign-in page not accessible${NC}"
fi

# Test 3: Dashboard redirect (should redirect to signin)
echo -e "\n${YELLOW}Test 3: Dashboard Protection${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard)
if [ "$response" = "307" ] || [ "$response" = "302" ]; then
    echo -e "${GREEN}✓ Dashboard properly protected (redirects to login)${NC}"
else
    echo -e "${RED}✗ Dashboard not properly protected${NC}"
fi

# Test 4: API endpoints
echo -e "\n${YELLOW}Test 4: API Endpoints${NC}"

# Test API keys endpoint (should return 401 without auth)
api_keys_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/api-keys)
if [ "$api_keys_response" = "401" ]; then
    echo -e "${GREEN}✓ API keys endpoint properly secured${NC}"
else
    echo -e "${RED}✗ API keys endpoint not secured (expected 401, got $api_keys_response)${NC}"
fi

# Test usage endpoint (should return 401 without auth)
usage_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/usage)
if [ "$usage_response" = "401" ]; then
    echo -e "${GREEN}✓ Usage endpoint properly secured${NC}"
else
    echo -e "${RED}✗ Usage endpoint not secured (expected 401, got $usage_response)${NC}"
fi

# Test 5: Settings page
echo -e "\n${YELLOW}Test 5: Settings Page${NC}"
settings_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/settings)
if [ "$settings_response" = "307" ] || [ "$settings_response" = "302" ]; then
    echo -e "${GREEN}✓ Settings page properly protected${NC}"
else
    echo -e "${RED}✗ Settings page not properly protected${NC}"
fi

# Test 6: Team page
echo -e "\n${YELLOW}Test 6: Team Page${NC}"
team_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/team)
if [ "$team_response" = "307" ] || [ "$team_response" = "302" ]; then
    echo -e "${GREEN}✓ Team page properly protected${NC}"
else
    echo -e "${RED}✗ Team page not properly protected${NC}"
fi

# Test 7: Analytics pages
echo -e "\n${YELLOW}Test 7: Analytics Pages${NC}"
analytics_pages=("usage" "trends" "providers")
for page in "${analytics_pages[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/analytics/$page)
    if [ "$response" = "307" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✓ Analytics/$page properly protected${NC}"
    else
        echo -e "${RED}✗ Analytics/$page not properly protected${NC}"
    fi
done

# Test 8: AI Cost Calculator
echo -e "\n${YELLOW}Test 8: AI Cost Calculator${NC}"
calc_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ai-cost-calculator)
if [ "$calc_response" = "307" ] || [ "$calc_response" = "302" ]; then
    echo -e "${GREEN}✓ AI Cost Calculator properly protected${NC}"
else
    echo -e "${RED}✗ AI Cost Calculator not properly protected${NC}"
fi

# Test 9: Billing page
echo -e "\n${YELLOW}Test 9: Billing Page${NC}"
billing_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/billing)
if [ "$billing_response" = "307" ] || [ "$billing_response" = "302" ]; then
    echo -e "${GREEN}✓ Billing page properly protected${NC}"
else
    echo -e "${RED}✗ Billing page not properly protected${NC}"
fi

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}All basic functionality tests completed!${NC}"
echo -e "\nNext steps for manual testing:"
echo -e "1. Sign in with Google OAuth at http://localhost:3000/auth/signin"
echo -e "2. Navigate to Settings and add API keys"
echo -e "3. Check the Usage tab in Dashboard for mock data visualization"
echo -e "4. Test all navigation links and features"
echo -e "\nApplication is ready for manual testing!"