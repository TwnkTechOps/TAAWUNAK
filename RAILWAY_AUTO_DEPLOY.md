# Automatic Railway Deployment Guide

## Quick Automated Deployment

I've installed Railway CLI and created configuration files. Here's how to deploy automatically:

### Option 1: Automated Script (Recommended)

```bash
./auto-railway-deploy.sh
```

This script will:
1. ✅ Login to Railway (opens browser)
2. ✅ Create project
3. ✅ Link GitHub repo
4. ✅ Add PostgreSQL
5. ✅ Deploy backend
6. ✅ Deploy frontend

### Option 2: Manual CLI Commands

If the script doesn't work, run these commands:

```bash
# 1. Login (opens browser)
railway login

# 2. Create new project
railway init

# 3. Link to your GitHub repo
railway link

# 4. Add PostgreSQL database
railway add postgresql

# 5. Deploy backend
cd apps/api
railway up --service backend

# 6. Deploy frontend (in new terminal or after backend)
cd apps/web-enterprise
railway up --service frontend
```

### Option 3: Web Interface (Easiest)

Since Railway CLI requires browser authentication, the web interface might be easier:

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Search for "TAAWUNAK"**
6. **Select `TwnkTechOps/TAAWUNAK`**
7. **Railway auto-detects Dockerfiles!**

Railway will automatically:
- ✅ Detect `apps/api/Dockerfile` → Creates Backend service
- ✅ Detect `apps/web-enterprise/Dockerfile` → Creates Frontend service
- ✅ You can add PostgreSQL from the dashboard

## After Deployment

### Set Environment Variables

**Backend Service:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string>
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

**Frontend Service:**
```
NEXT_PUBLIC_API_BASE_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

### Run Database Migrations

After backend is deployed:
```bash
railway run --service backend "cd apps/api && pnpm prisma migrate deploy"
```

Or in Railway dashboard:
- Go to Backend service
- Click "Deploy" tab
- Run command: `cd apps/api && pnpm prisma migrate deploy`

## Configuration Files Created

- ✅ `railway.json` - Railway configuration
- ✅ `railway.toml` - Alternative config format
- ✅ `auto-railway-deploy.sh` - Automated deployment script

## Quick Start

**Easiest method:**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select TAAWUNAK
4. Railway does the rest!

Your app will be live in 5-10 minutes! 🚀

