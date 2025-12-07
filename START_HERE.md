# 🚀 START HERE - Railway Deployment

**Quick Start Guide** - Follow these steps in order

---

## ✅ Step 1: Create PostgreSQL Database (2 minutes)

1. Railway Dashboard → **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Wait for deployment (~30 seconds)
3. Click on PostgreSQL service → **"Variables"** tab
4. **Copy `DATABASE_URL`** or note the service name (e.g., "Postgres")

---

## ✅ Step 2: Create Backend Service (5 minutes)

1. Railway Dashboard → **"+ New"** → **"GitHub Repo"** → Select `TwnkTechOps/TAAWUNAK`
2. Rename service to **"api"**

### Settings:
- **Builder**: Nixpacks
- **Root Directory**: `apps/api`

### Variables (add all):
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
JWT_SECRET = your-secret-key-here
API_PORT = 4312
NODE_ENV = production
```

### Networking:
- Click **"Generate Domain"** → Copy URL

3. **Redeploy** → Watch logs

---

## ✅ Step 3: Create Frontend Service (5 minutes)

1. Railway Dashboard → **"+ New"** → **"GitHub Repo"** → Select `TwnkTechOps/TAAWUNAK`
2. Rename service to **"next-enterprise"**

### Settings:
- **Builder**: Nixpacks
- **Root Directory**: `apps/web-enterprise`
- **Port**: `4320`

### Variables (add all):
```
NEXT_PUBLIC_API_BASE_URL = https://your-backend-url.railway.app
NODE_ENV = production
PORT = 4320
```
*(Use backend URL from Step 2)*

### Networking:
- Click **"Generate Domain"** → This is your website URL!

3. **Redeploy** → Watch logs

---

## ✅ Step 4: Run Migrations (2 minutes)

1. **"api" service** → **Deployments** → **Latest** → **Shell**
2. Run:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

---

## ✅ Step 5: Test (1 minute)

- Backend: `https://your-backend-url.railway.app/health` → Should return `{"status":"ok"}`
- Frontend: `https://your-frontend-url.railway.app` → Should load

---

## 🎉 Done!

**Full Guide**: See `RAILWAY_COMPLETE_SETUP.md` for detailed instructions

**Troubleshooting**: Check the troubleshooting section in `RAILWAY_COMPLETE_SETUP.md`

---

**Total Time**: ~15 minutes  
**Status**: All code fixes are in GitHub, just configure Railway!

