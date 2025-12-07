#!/bin/bash
# Automatic GitHub Repository Setup and Push Script

echo "🚀 Automatic GitHub Setup for TAAWUNAK"
echo "======================================"
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    echo ""
    echo "Step 1: Authenticate with GitHub"
    echo "Please run: gh auth login"
    echo "Then select:"
    echo "  - GitHub.com"
    echo "  - HTTPS"
    echo "  - Login with a web browser"
    echo ""
    read -p "Have you authenticated? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Step 2: Creating repository..."
        gh repo create TwnkTechOps/TAAWUNAK --private --source=. --remote=origin --push
        echo "✅ Done!"
    fi
else
    echo "⚠️  GitHub CLI not installed"
    echo ""
    echo "Installing GitHub CLI..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install gh
        else
            echo "Please install Homebrew first: https://brew.sh"
            exit 1
        fi
    else
        echo "Please install GitHub CLI: https://cli.github.com"
        exit 1
    fi
fi
