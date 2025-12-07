#!/bin/bash
# Automatic GitHub Push Script for TAAWUNAK

echo "🚀 Automatic GitHub Push for TAAWUNAK"
echo "======================================"
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo "Usage: ./auto-push.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To get a token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token"
    echo ""
    exit 1
fi

TOKEN=$1
REPO_URL="https://${TOKEN}@github.com/TwnkTechOps/TAAWUNAK.git"

echo "📋 Steps:"
echo "1. Setting up remote with token..."
git remote set-url origin "$REPO_URL"

echo "2. Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/TwnkTechOps/TAAWUNAK"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Go to Railway: https://railway.app"
    echo "2. Deploy from GitHub repo"
    echo "3. Select TAAWUNAK"
    echo "4. Railway will auto-deploy!"
else
    echo ""
    echo "❌ Push failed. Possible issues:"
    echo "  - Token doesn't have 'repo' scope"
    echo "  - Token needs SSO authorization for TwnkTechOps"
    echo "  - Repository doesn't exist or no access"
    echo ""
    echo "💡 Try:"
    echo "  1. Regenerate token with 'repo' scope"
    echo "  2. Enable SSO for TwnkTechOps organization"
    echo "  3. Check repository access"
fi

# Reset remote to normal URL (without token)
git remote set-url origin https://github.com/TwnkTechOps/TAAWUNAK.git

