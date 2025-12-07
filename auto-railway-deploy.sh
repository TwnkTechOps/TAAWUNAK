#!/bin/bash
# Automatic Railway Deployment Script for TAAWUNAK

echo "🚀 Automatic Railway Deployment for TAAWUNAK"
echo "=============================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    if command -v brew &> /dev/null; then
        brew install railway
    elif command -v npm &> /dev/null; then
        npm install -g @railway/cli
    else
        echo "❌ Please install Railway CLI manually:"
        echo "   https://docs.railway.app/develop/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI ready!"
echo ""

# Login to Railway
echo "🔐 Step 1: Logging in to Railway..."
echo "This will open a browser for authentication..."
railway login

if [ $? -ne 0 ]; then
    echo "❌ Railway login failed"
    exit 1
fi

echo ""
echo "📋 Step 2: Creating Railway project..."
railway init

echo ""
echo "📋 Step 3: Linking to GitHub repository..."
railway link

echo ""
echo "📋 Step 4: Adding PostgreSQL database..."
railway add postgresql

echo ""
echo "📋 Step 5: Setting up Backend service..."
cd apps/api
railway up --service backend

echo ""
echo "📋 Step 6: Setting up Frontend service..."
cd ../web-enterprise
railway up --service frontend

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Railway dashboard"
echo "2. Run database migrations"
echo "3. Check deployment status"
echo ""
echo "🔗 Railway Dashboard: https://railway.app"

