#!/bin/bash

# Automatic Docker Image Push Script
# Handles Docker Hub login and pushes images

set -e

DOCKER_USERNAME=${1:-"wasimsse"}
IMAGE_TAG="latest"

echo "🚀 Pushing Docker Images to Docker Hub"
echo "======================================"
echo "Username: $DOCKER_USERNAME"
echo ""

# Check if images exist
if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG} > /dev/null 2>&1; then
    echo "❌ Backend image not found. Please build first: ./build-docker-images.sh"
    exit 1
fi

if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG} > /dev/null 2>&1; then
    echo "❌ Frontend image not found. Please build first: ./build-docker-images.sh"
    exit 1
fi

# Check Docker Hub login
echo "Checking Docker Hub login status..."
if docker info 2>&1 | grep -qi "username"; then
    echo "✅ Already logged in to Docker Hub"
else
    echo "⚠️  Not logged in to Docker Hub"
    echo ""
    echo "Please login to Docker Hub:"
    echo "  Run: docker login"
    echo "  Enter your Docker Hub username and password"
    echo ""
    echo "Or if you have a token:"
    echo "  Run: echo 'YOUR_TOKEN' | docker login --username $DOCKER_USERNAME --password-stdin"
    echo ""
    read -p "Press Enter after you've logged in, or Ctrl+C to cancel..."
fi

# Push backend
echo ""
echo "📤 Pushing backend image..."
docker push ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG} || {
    echo "❌ Failed to push backend image"
    echo "Make sure you're logged in: docker login"
    exit 1
}

# Push frontend
echo ""
echo "📤 Pushing frontend image..."
docker push ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG} || {
    echo "❌ Failed to push frontend image"
    exit 1
}

echo ""
echo "✅ All images pushed successfully!"
echo ""
echo "Images on Docker Hub:"
echo "  - ${DOCKER_USERNAME}/tawawunak-backend:${IMAGE_TAG}"
echo "  - ${DOCKER_USERNAME}/tawawunak-frontend:${IMAGE_TAG}"
echo ""
echo "Next: Setup Railway using these images (see DOCKER_RAILWAY_DEPLOY.md)"

