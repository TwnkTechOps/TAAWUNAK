#!/bin/bash

# Complete Push Script - Login and Push Images
# Run this in your terminal (not through automation)

set -e

DOCKER_USERNAME=${1:-"wasimsse"}

echo "🚀 TAAWUNAK - Complete Push Script"
echo "=================================="
echo "Username: $DOCKER_USERNAME"
echo ""

# Step 1: Check if logged in
if docker info 2>&1 | grep -qi "username"; then
    echo "✅ Already logged in to Docker Hub"
    LOGGED_IN=true
else
    echo "⚠️  Need to login to Docker Hub"
    LOGGED_IN=false
fi

# Step 2: Login if needed
if [ "$LOGGED_IN" = false ]; then
    echo ""
    echo "Please login to Docker Hub..."
    echo "You'll be prompted for your username and password"
    echo ""
    docker login
    
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
    echo "✅ Login successful!"
fi

# Step 3: Verify images exist
echo ""
echo "Checking images..."
if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-backend:latest > /dev/null 2>&1; then
    echo "❌ Backend image not found"
    echo "Run: ./build-docker-images.sh first"
    exit 1
fi

if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-frontend:latest > /dev/null 2>&1; then
    echo "❌ Frontend image not found"
    echo "Run: ./build-docker-images.sh first"
    exit 1
fi

echo "✅ Images found"
echo ""

# Step 4: Push backend
echo "📤 Pushing backend image..."
echo "This may take a few minutes..."
docker push ${DOCKER_USERNAME}/tawawunak-backend:latest

if [ $? -eq 0 ]; then
    echo "✅ Backend pushed successfully!"
else
    echo "❌ Backend push failed"
    exit 1
fi

# Step 5: Push frontend
echo ""
echo "📤 Pushing frontend image..."
echo "This may take a few minutes..."
docker push ${DOCKER_USERNAME}/tawawunak-frontend:latest

if [ $? -eq 0 ]; then
    echo "✅ Frontend pushed successfully!"
else
    echo "❌ Frontend push failed"
    exit 1
fi

# Success!
echo ""
echo "🎉 SUCCESS! All images pushed to Docker Hub!"
echo ""
echo "Images available:"
echo "  - ${DOCKER_USERNAME}/tawawunak-backend:latest"
echo "  - ${DOCKER_USERNAME}/tawawunak-frontend:latest"
echo ""
echo "Next steps:"
echo "  1. Go to Railway Dashboard"
echo "  2. Create PostgreSQL database"
echo "  3. Create backend service using: ${DOCKER_USERNAME}/tawawunak-backend:latest"
echo "  4. Create frontend service using: ${DOCKER_USERNAME}/tawawunak-frontend:latest"
echo ""
echo "See COMPLETE_DEPLOYMENT.md for detailed Railway setup instructions"

