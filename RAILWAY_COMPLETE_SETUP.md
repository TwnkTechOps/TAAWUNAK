# 🚀 Railway Complete Setup Guide - Clean Version

**Last Updated**: December 7, 2025  
**Status**: All issues fixed, ready for deployment

---

## 📋 Prerequisites

- ✅ Code pushed to GitHub: `https://github.com/TwnkTechOps/TAAWUNAK`
- ✅ Railway account created
- ✅ GitHub connected to Railway

---

## 🎯 Step 1: Create PostgreSQL Database

1. **Go to Railway Dashboard** → Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. **Wait for it to deploy** (takes ~30 seconds)
3. **Click on the PostgreSQL service**
4. **Go to "Variables" tab**
5. **Find `DATABASE_URL`** - Copy this value (you'll need it later)
   - It looks like: `postgresql://postgres:password@host:port/railway`
6. **Note the service name** (usually "Postgres" or "PostgreSQL") - You'll need this name

---

## 🔧 Step 2: Create Backend Service ("api")

1. **Go to Railway Dashboard** → Click **"+ New"** → **"GitHub Repo"**
2. **Select**: `TwnkTechOps/TAAWUNAK`
3. **Railway will create a service** - Name it **"api"** (or rename it)

### Configure Backend Service:

4. **Click on "api" service** → **"Settings" tab**

5. **Build & Deploy Section:**
   - **Builder**: Select **"Nixpacks"**
   - **Root Directory**: Type `apps/api`
   - **Build Command**: Leave empty (auto-detects)
   - **Start Command**: Leave empty (auto-detects)

6. **Variables Section** → Click **"+ New Variable"** → Add these **ONE BY ONE**:

   ```
   Variable 1:
   Name: DATABASE_URL
   Value: ${{Postgres.DATABASE_URL}}
   (Click dropdown and select from Postgres service, or type the service name)
   
   Variable 2:
   Name: JWT_SECRET
   Value: your-super-secret-jwt-key-change-this-in-production-12345
   
   Variable 3:
   Name: API_PORT
   Value: 4312
   
   Variable 4:
   Name: NODE_ENV
   Value: production
   ```

7. **Networking Section**:
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `api-production-xxxx.up.railway.app`)
   - **Save this URL!** You'll need it for frontend

8. **Click "Save"** (if there's a save button)

9. **Go to "Deployments" tab** → Railway will auto-deploy
   - **Watch Build Logs**: Should see `pnpm install`, `pnpm build` completing
   - **Watch Deploy Logs**: Should see "API running on http://localhost:4312"
   - ✅ **If you see errors, check the troubleshooting section below**

---

## 🎨 Step 3: Create Frontend Service ("next-enterprise")

1. **Go to Railway Dashboard** → Click **"+ New"** → **"GitHub Repo"**
2. **Select**: `TwnkTechOps/TAAWUNAK` (same repo)
3. **Railway will create a service** - Name it **"next-enterprise"** (or rename it)

### Configure Frontend Service:

4. **Click on "next-enterprise" service** → **"Settings" tab**

5. **Build & Deploy Section:**
   - **Builder**: Select **"Nixpacks"**
   - **Root Directory**: Type `apps/web-enterprise`
   - **Build Command**: Leave empty (auto-detects)
   - **Start Command**: Leave empty (auto-detects)
   - **Port**: Type `4320`

6. **Variables Section** → Click **"+ New Variable"** → Add these:

   ```
   Variable 1:
   Name: NEXT_PUBLIC_API_BASE_URL
   Value: https://api-production-xxxx.up.railway.app
   (Use the backend URL from Step 2, Step 7)
   
   Variable 2:
   Name: NODE_ENV
   Value: production
   
   Variable 3:
   Name: PORT
   Value: 4320
   ```

7. **Networking Section**:
   - Click **"Generate Domain"**
   - Copy the URL - **This is your public website URL!**

8. **Click "Save"**

9. **Go to "Deployments" tab** → Railway will auto-deploy
   - **Watch Build Logs**: Should see `pnpm install`, `pnpm build` completing
   - **Watch Deploy Logs**: Should see Next.js server starting
   - ✅ **If you see errors, check the troubleshooting section below**

---

## 🗄️ Step 4: Run Database Migrations

**After backend is deployed successfully:**

### Option A: Railway Shell (Easiest)

1. **Go to "api" service** → **"Deployments" tab**
2. **Click on the latest deployment** (should show "Active" or "Success")
3. **Click "Shell" tab** (or "View Logs" → "Shell")
4. **In the terminal, type:**
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```
5. **Press Enter**
6. **Should see**: `Applied migration: xxxxx` messages
7. **Done!**

### Option B: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
cd apps/api
railway run --service api pnpm prisma migrate deploy
```

---

## ✅ Step 5: Verify Everything Works

### Check Backend:

1. **Visit**: `https://your-backend-url.railway.app/health`
2. **Should return**: `{"status":"ok"}`

### Check Frontend:

1. **Visit**: `https://your-frontend-url.railway.app`
2. **Should load**: Login page or home page

### Check Services Status:

1. **Go to Railway Dashboard**
2. **All services should show**: Green "Online" status
3. **No crashes** in the activity feed

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: "Cannot find module '/app/apps/api/dist/main.js'"

**Fix**:
1. Go to **Settings** → **Root Directory**: Make sure it's `apps/api` (not `/apps/api`)
2. **Builder**: Make sure it's **"Nixpacks"**
3. **Redeploy**

---

**Error**: "Environment variable not found: DATABASE_URL"

**Fix**:
1. Go to **Variables** tab
2. Make sure `DATABASE_URL` is set
3. Value should be: `${{Postgres.DATABASE_URL}}` (replace `Postgres` with your PostgreSQL service name)
4. **Redeploy**

---

**Error**: "Error loading shared library libssl.so.1.1"

**Fix**: 
- ✅ Already fixed in code (using Debian base image)
- If you still see this, make sure you're using the latest code from GitHub
- **Redeploy**

---

### Frontend Won't Start

**Error**: "Cannot find module" or build fails

**Fix**:
1. Go to **Settings** → **Root Directory**: Make sure it's `apps/web-enterprise`
2. **Builder**: Make sure it's **"Nixpacks"**
3. **Port**: Make sure it's `4320`
4. **Redeploy**

---

**Error**: "Failed to fetch" or can't connect to backend

**Fix**:
1. Go to **Variables** tab
2. Check `NEXT_PUBLIC_API_BASE_URL` is set
3. Value should be: `https://your-backend-url.railway.app` (with `https://`)
4. Make sure backend is running and has a public domain
5. **Redeploy**

---

### Database Connection Issues

**Error**: "Can't reach database server"

**Fix**:
1. Make sure PostgreSQL service is running (green status)
2. Check `DATABASE_URL` in backend Variables
3. Use Railway variable reference: `${{Postgres.DATABASE_URL}}`
4. **Redeploy backend**

---

## 📝 Quick Reference: All Required Variables

### Backend ("api") Service:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key-here
API_PORT=4312
NODE_ENV=production
```

### Frontend ("next-enterprise") Service:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NODE_ENV=production
PORT=4320
```

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created and running
- [ ] Backend service created with Root Directory: `apps/api`
- [ ] Backend variables set (DATABASE_URL, JWT_SECRET, API_PORT, NODE_ENV)
- [ ] Backend has public domain
- [ ] Backend builds successfully
- [ ] Backend runs without crashes
- [ ] Frontend service created with Root Directory: `apps/web-enterprise`
- [ ] Frontend variables set (NEXT_PUBLIC_API_BASE_URL, NODE_ENV, PORT)
- [ ] Frontend has public domain
- [ ] Frontend builds successfully
- [ ] Frontend runs without crashes
- [ ] Database migrations run
- [ ] Backend health check works
- [ ] Frontend loads in browser

---

## 🆘 Still Having Issues?

1. **Check Build Logs** - Look for red errors
2. **Check Deploy Logs** - Look for runtime errors
3. **Verify Variables** - Make sure all are set correctly
4. **Check Service Names** - Make sure PostgreSQL service name matches in `${{ServiceName.DATABASE_URL}}`
5. **Redeploy** - After any changes, always redeploy

---

## 📞 Final Notes

- **All code fixes are in GitHub** - Railway will auto-deploy when you push
- **Use Nixpacks** - It's the easiest and most reliable
- **Root Directories are critical** - Must be exactly `apps/api` and `apps/web-enterprise`
- **Variables must be set** - Especially `DATABASE_URL` for backend
- **Always redeploy after changes** - Settings changes require redeploy

---

**You're all set! Follow these steps and your application will be live.** 🚀

