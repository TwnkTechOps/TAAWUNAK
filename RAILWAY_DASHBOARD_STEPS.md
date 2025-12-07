# Railway Dashboard - Step by Step

## Current Screen: "Create a New Project"

You're on the Railway dashboard and ready to deploy!

### Step 1: Click "Deploy a GitHub Repository"
- Look for the **GitHub icon** (octocat logo) in the "Create a New Project" section
- OR click anywhere in the "Deploy a GitHub Repository" area
- This will open the repository selection

### Step 2: Authorize GitHub (if needed)
- Railway will ask to connect to your GitHub account
- Click **"Authorize Railway"** or **"Connect GitHub"**
- Make sure to authorize access to the **TwnkTechOps** organization

### Step 3: Select Your Repository
- Railway will show a list of your GitHub repositories
- **Search for "TAAWUNAK"** in the search box
- Click on **`TwnkTechOps/TAAWUNAK`**

### Step 4: Railway Auto-Detection
Railway will automatically:
- ✅ Detect `apps/api/Dockerfile` → Creates **Backend** service
- ✅ Detect `apps/web-enterprise/Dockerfile` → Creates **Frontend** service
- ✅ Start building and deploying

### Step 5: Add PostgreSQL Database
After Railway creates the services:
1. Click **"+ New"** button (top right)
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway creates it automatically

### Step 6: Set Environment Variables

**Backend Service:**
Go to Backend service → Settings → Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string>
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

**Frontend Service:**
Go to Frontend service → Settings → Variables:
```
NEXT_PUBLIC_API_BASE_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

### Step 7: Run Database Migrations
After backend is deployed:
1. Go to Backend service
2. Click **"Deploy"** tab
3. Click **"Run Command"**
4. Enter: `cd apps/api && pnpm prisma migrate deploy`
5. Click **"Run"**

## What Happens Next

1. Railway builds your Docker images
2. Deploys both services
3. Provides public URLs (HTTPS automatically)
4. Your app is live! 🚀

## Quick Navigation

**Current Screen:**
- You're on: Dashboard → "Create a New Project"

**Next:**
- Click GitHub icon → Select TAAWUNAK → Railway does the rest!

---

**Your app will be live in 5-10 minutes!** 🎉

