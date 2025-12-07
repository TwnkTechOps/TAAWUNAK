#!/bin/bash

# Docker Build and Push Script
# Usage: ./build-and-push.sh [dockerhub-username]

set -e

DOCKERHUB_USERNAME=${1:-"your-username"}

echo "🚀 TAAWUNAK Docker Build & Push Script"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "📦 Step 1: Building Docker images..."
echo ""

# Build Frontend
echo "Building frontend image..."
docker build -f apps/web-enterprise/Dockerfile -t tawawunak-frontend:latest . || {
    echo "❌ Frontend build failed!"
    exit 1
}
echo "✅ Frontend image built successfully"
echo ""

# Build Backend
echo "Building backend image..."
docker build -f apps/api/Dockerfile -t tawawunak-backend:latest . || {
    echo "❌ Backend build failed!"
    exit 1
}
echo "✅ Backend image built successfully"
echo ""

# Ask if user wants to push
read -p "Do you want to push images to Docker Hub? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Images built successfully. Push manually when ready:"
    echo "   docker tag tawawunak-frontend:latest $DOCKERHUB_USERNAME/tawawunak-frontend:latest"
    echo "   docker tag tawawunak-backend:latest $DOCKERHUB_USERNAME/tawawunak-backend:latest"
    echo "   docker push $DOCKERHUB_USERNAME/tawawunak-frontend:latest"
    echo "   docker push $DOCKERHUB_USERNAME/tawawunak-backend:latest"
    exit 0
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo "⚠️  Not logged in to Docker Hub. Please login first:"
    echo "   docker login"
    exit 1
fi

echo "🏷️  Step 2: Tagging images..."
docker tag tawawunak-frontend:latest $DOCKERHUB_USERNAME/tawawunak-frontend:latest
docker tag tawawunak-backend:latest $DOCKERHUB_USERNAME/tawawunak-backend:latest
echo "✅ Images tagged"
echo ""

echo "📤 Step 3: Pushing to Docker Hub..."
docker push $DOCKERHUB_USERNAME/tawawunak-frontend:latest || {
    echo "❌ Frontend push failed!"
    exit 1
}
echo "✅ Frontend pushed"

docker push $DOCKERHUB_USERNAME/tawawunak-backend:latest || {
    echo "❌ Backend push failed!"
    exit 1
}
echo "✅ Backend pushed"
echo ""

echo "🎉 Success! Images pushed to Docker Hub:"
echo "   - $DOCKERHUB_USERNAME/tawawunak-frontend:latest"
echo "   - $DOCKERHUB_USERNAME/tawawunak-backend:latest"
echo ""
echo "Next steps:"
echo "1. Deploy to Railway/Render/DigitalOcean"
echo "2. Use these image names in your deployment"
echo "3. Set environment variables"
echo "4. Get your public URLs!"

