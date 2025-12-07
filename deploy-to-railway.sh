#!/bin/bash

# Complete Deployment Script for TAAWUNAK
# This script builds, pushes, and provides instructions for Railway deployment

set -e

echo "🚀 TAAWUNAK Complete Deployment Script"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get Docker Hub username
DOCKER_USERNAME=${1:-${DOCKER_USERNAME}}

if [ -z "$DOCKER_USERNAME" ]; then
    echo "${YELLOW}Enter your Docker Hub username:${NC}"
    read -p "Username: " DOCKER_USERNAME
    if [ -z "$DOCKER_USERNAME" ]; then
        echo "${RED}❌ Docker Hub username is required${NC}"
        exit 1
    fi
fi

echo ""
echo "${BLUE}Using Docker Hub username: ${DOCKER_USERNAME}${NC}"
echo ""

# Step 1: Build images
echo "${YELLOW}Step 1: Building Docker images...${NC}"
export DOCKER_USERNAME=$DOCKER_USERNAME
./build-docker-images.sh

if [ $? -ne 0 ]; then
    echo "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 2: Push images
echo ""
echo "${YELLOW}Step 2: Pushing images to Docker Hub...${NC}"
./push-docker-images.sh $DOCKER_USERNAME

if [ $? -ne 0 ]; then
    echo "${RED}❌ Push failed${NC}"
    exit 1
fi

# Step 3: Display instructions
echo ""
echo "${GREEN}✅ Images built and pushed successfully!${NC}"
echo ""
echo "${BLUE}========================================${NC}"
echo "${BLUE}Next Steps for Railway Deployment:${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "1. Go to Railway Dashboard: https://railway.app/dashboard"
echo ""
echo "2. Create PostgreSQL Database:"
echo "   - Click 'New' → 'Database' → 'Add PostgreSQL'"
echo "   - Copy the DATABASE_URL from Variables tab"
echo ""
echo "3. Create Backend Service:"
echo "   - Click 'New' → 'Empty Service'"
echo "   - Rename to 'api'"
echo "   - Settings → Deploy → Select 'Docker Hub Image'"
echo "   - Image: ${DOCKER_USERNAME}/tawawunak-backend:latest"
echo "   - Variables → Add:"
echo "     * DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo "     * JWT_SECRET=your-secret-key"
echo "     * API_PORT=4312"
echo "     * NODE_ENV=production"
echo ""
echo "4. Create Frontend Service:"
echo "   - Click 'New' → 'Empty Service'"
echo "   - Rename to 'frontend'"
echo "   - Settings → Deploy → Select 'Docker Hub Image'"
echo "   - Image: ${DOCKER_USERNAME}/tawawunak-frontend:latest"
echo "   - Variables → Add:"
echo "     * NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app"
echo "     * NODE_ENV=production"
echo ""
echo "5. Get URLs and Link Services:"
echo "   - Backend: Settings → Networking → Generate Domain"
echo "   - Frontend: Settings → Networking → Generate Domain"
echo "   - Update NEXT_PUBLIC_API_BASE_URL with backend URL"
echo "   - Update WEB_ORIGIN in backend with frontend URL"
echo ""
echo "6. Test:"
echo "   - Backend: https://your-backend-url.railway.app/health"
echo "   - Frontend: https://your-frontend-url.railway.app"
echo ""
echo "${BLUE}For detailed instructions, see: DOCKER_RAILWAY_DEPLOY.md${NC}"
echo ""

