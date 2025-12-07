#!/bin/bash

# Build Docker Images for TAAWUNAK
# This script builds both frontend and backend Docker images

set -e

echo "🐳 Building TAAWUNAK Docker Images"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Get Docker Hub username (optional - can be set via DOCKER_USERNAME env var)
DOCKER_USERNAME=${DOCKER_USERNAME:-"your-dockerhub-username"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo ""
echo "${BLUE}Configuration:${NC}"
echo "  Docker Hub Username: ${DOCKER_USERNAME}"
echo "  Image Tag: ${IMAGE_TAG}"
echo ""

# Prompt for Docker Hub username if not set
if [ "$DOCKER_USERNAME" = "your-dockerhub-username" ]; then
    read -p "Enter your Docker Hub username: " DOCKER_USERNAME
    if [ -z "$DOCKER_USERNAME" ]; then
        echo "❌ Docker Hub username is required"
        exit 1
    fi
fi

# Build backend image
echo ""
echo "${YELLOW}📦 Building Backend Image...${NC}"
docker build \
    -t ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG} \
    -t ${DOCKER_USERNAME}/tawawunak-backend:latest \
    -f apps/api/Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend image built successfully!${NC}"
    echo "   Image: ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG}"
else
    echo "❌ Backend image build failed"
    exit 1
fi

# Build frontend image
echo ""
echo "${YELLOW}📦 Building Frontend Image...${NC}"
docker build \
    -t ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG} \
    -t ${DOCKER_USERNAME}/tawawunak-frontend:latest \
    -f apps/web-enterprise/Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend image built successfully!${NC}"
    echo "   Image: ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG}"
else
    echo "❌ Frontend image build failed"
    exit 1
fi

echo ""
echo "${GREEN}🎉 All images built successfully!${NC}"
echo ""
echo "Images created:"
echo "  - ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG}"
echo "  - ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG}"
echo ""
echo "Next steps:"
echo "  1. Run: ./push-docker-images.sh ${DOCKER_USERNAME}"
echo "  2. Or manually: docker push ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG}"
echo "  3. Or manually: docker push ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG}"
echo ""

