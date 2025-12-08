#!/bin/bash

# Login and Push Script - Handles Docker Hub authentication and push

set -e

DOCKER_USERNAME=${1:-"wasimsse"}

echo "🔐 Docker Hub Login & Push Script"
echo "=================================="
echo ""

# Check if already logged in
if docker info 2>&1 | grep -qi "username"; then
    echo "✅ Already logged in to Docker Hub"
    LOGGED_IN=true
else
    echo "⚠️  Need to login to Docker Hub"
    LOGGED_IN=false
fi

# Try to login if not logged in
if [ "$LOGGED_IN" = false ]; then
    echo ""
    echo "Attempting to login..."
    echo "If this fails, please run manually: docker login"
    echo ""
    
    # Try login (will prompt if needed)
    if docker login 2>&1 | tee /tmp/docker-login.log; then
        echo "✅ Login successful!"
    else
        echo ""
        echo "❌ Login failed or requires interactive input"
        echo ""
        echo "Please run this command manually in your terminal:"
        echo "  docker login"
        echo ""
        echo "Then run this script again:"
        echo "  ./login-and-push.sh $DOCKER_USERNAME"
        exit 1
    fi
fi

# Now push the images
echo ""
echo "📤 Pushing images to Docker Hub..."
echo ""

# Push backend
echo "Pushing backend..."
if docker push ${DOCKER_USERNAME}/tawawunak-backend:latest; then
    echo "✅ Backend pushed successfully!"
else
    echo "❌ Backend push failed"
    exit 1
fi

# Push frontend
echo ""
echo "Pushing frontend..."
if docker push ${DOCKER_USERNAME}/tawawunak-frontend:latest; then
    echo "✅ Frontend pushed successfully!"
else
    echo "❌ Frontend push failed"
    exit 1
fi

echo ""
echo "🎉 All images pushed successfully!"
echo ""
echo "Images available on Docker Hub:"
echo "  - ${DOCKER_USERNAME}/tawawunak-backend:latest"
echo "  - ${DOCKER_USERNAME}/tawawunak-frontend:latest"
echo ""
echo "Next: Setup Railway (see COMPLETE_DEPLOYMENT.md)"

