#!/bin/bash

# Quick Docker Test Script
# Tests building and running the Docker images locally

set -e

echo "🧪 Testing Docker Builds"
echo "========================"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "📦 Building Frontend..."
docker build -f apps/web-enterprise/Dockerfile -t tawawunak-frontend:test . || {
    echo "❌ Frontend build failed!"
    exit 1
}
echo "✅ Frontend built successfully"
echo ""

echo "📦 Building Backend..."
docker build -f apps/api/Dockerfile -t tawawunak-backend:test . || {
    echo "❌ Backend build failed!"
    exit 1
}
echo "✅ Backend built successfully"
echo ""

echo "✅ Both images built successfully!"
echo ""
echo "To test locally:"
echo "  docker-compose -f docker-compose.prod.yml up"
echo ""
echo "Or run individually:"
echo "  docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:4312 tawawunak-frontend:test"
echo "  docker run -p 4312:4312 -e DATABASE_URL=... -e JWT_SECRET=... tawawunak-backend:test"

