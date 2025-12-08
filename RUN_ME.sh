#!/bin/bash

# Complete Push Script - Run this after logging in to Docker Hub

set -e

DOCKER_USERNAME=${1:-"wasimsse"}

echo "🚀 Pushing TAAWUNAK Images to Docker Hub"
echo "========================================"
echo "Username: $DOCKER_USERNAME"
echo ""

# Check login status
if ! docker info 2>&1 | grep -qi "username"; then
    echo "❌ Not logged in to Docker Hub"
    echo ""
    echo "Please login first:"
    echo "  docker login"
    echo ""
    echo "Then run this script again:"
    echo "  ./RUN_ME.sh $DOCKER_USERNAME"
    exit 1
fi

echo "✅ Logged in to Docker Hub"
echo ""

# Verify images exist
if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-backend:latest > /dev/null 2>&1; then
    echo "❌ Backend image not found"
    exit 1
fi

if ! docker image inspect ${DOCKER_USERNAME}/tawawunak-frontend:latest > /dev/null 2>&1; then
    echo "❌ Frontend image not found"
    exit 1
fi

echo "✅ Images found locally"
echo ""

# Push backend
echo "📤 Pushing backend image..."
docker push ${DOCKER_USERNAME}/tawawunak-backend:latest
echo "✅ Backend pushed!"

# Push frontend
echo ""
echo "📤 Pushing frontend image..."
docker push ${DOCKER_USERNAME}/tawawunak-frontend:latest
echo "✅ Frontend pushed!"

echo ""
echo "🎉 SUCCESS! All images pushed to Docker Hub!"
echo ""
echo "Images:"
echo "  - ${DOCKER_USERNAME}/tawawunak-backend:latest"
echo "  - ${DOCKER_USERNAME}/tawawunak-frontend:latest"
echo ""
echo "Next: Setup Railway (see COMPLETE_DEPLOYMENT.md)"

