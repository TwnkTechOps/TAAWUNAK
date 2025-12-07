# Push Code to GitHub - Quick Guide

## Your Repository
**URL**: https://github.com/TwnkTechOps/TAAWUNAK

## Step 1: Create Personal Access Token

1. **Go to**: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Name it**: "TAAWUNAK Deployment"
4. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (if you use GitHub Actions)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you'll only see it once!)

## Step 2: Push Your Code

Run these commands:

```bash
cd /Users/svm648/TAAWUNAK

# Your code is already committed, just push:
git push -u origin main
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

## Alternative: Use GitHub Desktop

If command line is difficult:

1. **Download GitHub Desktop**: https://desktop.github.com
2. **Sign in** with your GitHub account
3. **Add repository**: File → Add Local Repository
4. **Select**: `/Users/svm648/TAAWUNAK`
5. **Click "Publish repository"**

## After Pushing

Once your code is on GitHub:

1. ✅ Go back to Railway
2. ✅ Click "Deploy from GitHub repo"
3. ✅ Select `TwnkTechOps/TAAWUNAK`
4. ✅ Railway will detect your Dockerfiles and deploy!

## Troubleshooting

**Issue**: "Repository not found"
- Make sure you're part of the `TwnkTechOps` organization
- Check repository visibility (private repos need proper access)

**Issue**: "Permission denied"
- Use Personal Access Token, not password
- Make sure token has `repo` scope

**Issue**: "Authentication failed"
- Token might be expired
- Generate a new token and try again

---

**Quick Command Summary:**
```bash
# 1. Get token from: https://github.com/settings/tokens
# 2. Push code:
git push -u origin main
# 3. Use token as password when prompted
```

