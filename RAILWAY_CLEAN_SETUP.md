# 🚀 Railway Clean Setup Guide - TAAWUNAK

This guide will help you set up TAAWUNAK on Railway from scratch with zero crashes.

## 📋 Prerequisites

1. Railway account (you have this)
2. GitHub repository connected (already done: `TwnkTechOps/TAAWUNAK`)

---

## 🗄️ Step 1: Create PostgreSQL Database

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** (or select existing project)
3. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for database to provision (30-60 seconds)
5. **IMPORTANT:** Click on the PostgreSQL service
6. Go to **"Variables"** tab
7. Find `DATABASE_URL` - **COPY THIS VALUE** (you'll need it)

The `DATABASE_URL` looks like:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## 🔧 Step 2: Create Backend Service (API)

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select **"TwnkTechOps/TAAWUNAK"**
3. Railway will create a service - **rename it to "api"**
4. Click on the **"api"** service
5. Go to **"Settings"** tab
6. Set **"Root Directory"** to: `apps/api`
7. Go to **"Variables"** tab
8. Add these environment variables:

### Required Environment Variables for Backend:

```bash
# Database (CRITICAL - Use the DATABASE_URL from PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# API Port (Railway sets this automatically, but include it)
API_PORT=4312

# CORS Origin (your frontend URL - update after frontend is deployed)
WEB_ORIGIN=https://your-frontend-url.railway.app

# Node Environment
NODE_ENV=production

# Optional: S3/MinIO (if you're using file storage)
# S3_ENDPOINT=your-s3-endpoint
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
# S3_BUCKET=your-bucket-name
```

**⚠️ CRITICAL:** 
- The `DATABASE_URL` must be copied from the PostgreSQL service's Variables tab
- Railway automatically provides `DATABASE_URL` as a reference variable - use that!

---

## 🎨 Step 3: Create Frontend Service

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select **"TwnkTechOps/TAAWUNAK"** (same repo)
3. Railway will create another service - **rename it to "frontend"**
4. Click on the **"frontend"** service
5. Go to **"Settings"** tab
6. Set **"Root Directory"** to: `apps/web-enterprise`
7. Go to **"Variables"** tab
8. Add these environment variables:

### Required Environment Variables for Frontend:

```bash
# Backend API URL (update after backend is deployed)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app

# Node Environment
NODE_ENV=production
```

**Note:** You'll need to update `NEXT_PUBLIC_API_BASE_URL` after the backend is deployed and you have its public URL.

---

## 🔄 Step 4: Configure Railway Build Settings

### For Backend Service (api):

1. Go to **"api"** service → **"Settings"** tab
2. Under **"Build & Deploy"**:
   - **Build Command:** Leave empty (Dockerfile handles it)
   - **Start Command:** Leave empty (Dockerfile CMD handles it)
   - **Dockerfile Path:** `apps/api/Dockerfile`

### For Frontend Service (frontend):

1. Go to **"frontend"** service → **"Settings"** tab
2. Under **"Build & Deploy"**:
   - **Build Command:** Leave empty (Dockerfile handles it)
   - **Start Command:** Leave empty (Dockerfile CMD handles it)
   - **Dockerfile Path:** `apps/web-enterprise/Dockerfile`

---

## 🗃️ Step 5: Run Database Migrations

After the backend service is deployed:

1. Go to **"api"** service → **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"**
4. Look for any Prisma migration errors

**OR** run migrations manually:

1. Go to **"api"** service → **"Settings"** tab
2. Scroll to **"Deploy Hooks"**
3. Add a **"Deploy Command"**:
   ```bash
   cd apps/api && pnpm prisma migrate deploy
   ```

**OR** use Railway CLI:

```bash
railway run --service api "cd apps/api && pnpm prisma migrate deploy"
```

---

## 🔗 Step 6: Link Services (Get URLs)

1. Go to **"api"** service → **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"** (or use the provided one)
4. Copy the public URL (e.g., `https://api-production-xxxx.up.railway.app`)
5. Go to **"frontend"** service → **"Variables"** tab
6. Update `NEXT_PUBLIC_API_BASE_URL` with the backend URL
7. Go to **"frontend"** service → **"Settings"** → **"Networking"**
8. Click **"Generate Domain"** for the frontend

---

## ✅ Step 7: Verify Everything Works

1. **Check Backend Logs:**
   - Go to **"api"** service → **"Deployments"** → **"View Logs"**
   - Look for: `API running on http://localhost:4312`
   - Look for: `PrismaClientInitializationError` (should NOT appear)

2. **Check Frontend Logs:**
   - Go to **"frontend"** service → **"Deployments"** → **"View Logs"**
   - Look for build success messages

3. **Test Backend:**
   - Visit: `https://your-backend-url.railway.app/health`
   - Should return: `{"status":"ok"}`

4. **Test Frontend:**
   - Visit your frontend URL
   - Should load the login page

---

## 🐛 Troubleshooting

### Error: `PrismaClientInitializationError: Environment variable not found: DATABASE_URL`

**Fix:**
1. Go to **"api"** service → **"Variables"** tab
2. Click **"New Variable"**
3. Name: `DATABASE_URL`
4. Value: Copy from PostgreSQL service's `DATABASE_URL`
5. **OR** use Railway's reference variable: `${{Postgres.DATABASE_URL}}`

### Error: `The executable 'cd' could not be found`

**Fix:**
- Remove any `startCommand` from Railway settings
- The Dockerfile `CMD` handles this automatically

### Error: Build fails with TypeScript/ESLint errors

**Fix:**
- This is normal - the build should still succeed
- Check `next.config.ts` - it's configured to ignore build errors

### Backend crashes immediately after starting

**Check:**
1. `DATABASE_URL` is set correctly
2. Database is accessible (check PostgreSQL service is running)
3. No syntax errors in logs

### Frontend can't connect to backend

**Fix:**
1. Update `NEXT_PUBLIC_API_BASE_URL` in frontend variables
2. Redeploy frontend service
3. Check CORS settings in backend (should allow all origins)

---

## 📝 Quick Checklist

- [ ] PostgreSQL database created
- [ ] Backend service created with root directory `apps/api`
- [ ] Frontend service created with root directory `apps/web-enterprise`
- [ ] `DATABASE_URL` set in backend variables
- [ ] `JWT_SECRET` set in backend variables
- [ ] `NEXT_PUBLIC_API_BASE_URL` set in frontend variables
- [ ] Both services have public domains
- [ ] Backend `/health` endpoint returns `{"status":"ok"}`
- [ ] Frontend loads without errors

---

## 🎯 Final Notes

1. **Always use Railway's reference variables** for `DATABASE_URL`:
   - In backend variables, use: `${{Postgres.DATABASE_URL}}`
   - This automatically links to your PostgreSQL service

2. **Service names matter:**
   - Backend: `api`
   - Frontend: `frontend`
   - Database: `Postgres` (default name)

3. **Root directories are critical:**
   - Backend: `apps/api`
   - Frontend: `apps/web-enterprise`

4. **Dockerfiles handle everything:**
   - No need for custom build/start commands
   - Just set root directory and variables

---

## 🆘 Still Having Issues?

1. Check Railway logs for specific error messages
2. Verify all environment variables are set
3. Ensure database is running
4. Check that root directories are correct
5. Verify Dockerfiles are in the correct locations

**Common Issues:**
- Missing `DATABASE_URL` → Add it to backend variables
- Wrong root directory → Set it in service settings
- Build fails → Check Dockerfile paths
- Service crashes → Check logs for Prisma errors

---

**Good luck! 🚀**

