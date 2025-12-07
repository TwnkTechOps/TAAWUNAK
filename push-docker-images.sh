#!/bin/bash

# Push Docker Images to Docker Hub
# This script pushes both frontend and backend Docker images to Docker Hub

set -e

echo "🚀 Pushing TAAWUNAK Docker Images to Docker Hub"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get Docker Hub username
DOCKER_USERNAME=${1:-${DOCKER_USERNAME:-"your-dockerhub-username"}}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

if [ "$DOCKER_USERNAME" = "your-dockerhub-username" ]; then
    echo "${RED}❌ Docker Hub username is required${NC}"
    echo ""
    echo "Usage: $0 <dockerhub-username>"
    echo "   OR: export DOCKER_USERNAME=your-username"
    exit 1
fi

echo ""
echo "${BLUE}Configuration:${NC}"
echo "  Docker Hub Username: ${DOCKER_USERNAME}"
echo "  Image Tag: ${IMAGE_TAG}"
echo ""

# Check if images exist locally
BACKEND_IMAGE="${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG}"

if ! docker image inspect ${BACKEND_IMAGE} > /dev/null 2>&1; then
    echo "${YELLOW}⚠️  Backend image not found locally. Building it first...${NC}"
    ./build-docker-images.sh
fi

if ! docker image inspect ${FRONTEND_IMAGE} > /dev/null 2>&1; then
    echo "${YELLOW}⚠️  Frontend image not found locally. Building it first...${NC}"
    ./build-docker-images.sh
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    echo "${YELLOW}⚠️  Not logged in to Docker Hub. Please login...${NC}"
    docker login
fi

# Push backend image
echo ""
echo "${YELLOW}📤 Pushing Backend Image...${NC}"
docker push ${BACKEND_IMAGE}
docker push ${DOCKER_USERNAME}/tawawunak-backend:latest

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend image pushed successfully!${NC}"
else
    echo "${RED}❌ Backend image push failed${NC}"
    exit 1
fi

# Push frontend image
echo ""
echo "${YELLOW}📤 Pushing Frontend Image...${NC}"
docker push ${FRONTEND_IMAGE}
docker push ${DOCKER_USERNAME}/tawawunak-frontend:latest

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend image pushed successfully!${NC}"
else
    echo "${RED}❌ Frontend image push failed${NC}"
    exit 1
fi

echo ""
echo "${GREEN}🎉 All images pushed successfully!${NC}"
echo ""
echo "Images available on Docker Hub:"
echo "  - ${BACKEND_IMAGE}"
echo "  - ${FRONTEND_IMAGE}"
echo ""
echo "Next steps:"
echo "  1. Go to Railway Dashboard"
echo "  2. Create services using these images"
echo "  3. See: DOCKER_RAILWAY_DEPLOY.md for setup instructions"
echo ""

