# 🚀 Railway Auto-Fix Guide

## ✅ What I Fixed

1. **Backend Dockerfile**: Fixed path issues for `dist/main.js`
2. **Frontend Dockerfile**: Changed port from 3000 to 4320
3. **Railway Configs**: Created service-specific `railway.toml` files for both services
4. **Build Commands**: Configured proper Nixpacks build commands

---

## 📋 Step-by-Step: Configure Services on Railway

### 🔧 Backend Service ("web")

1. **Go to Railway** → Click **"web"** service
2. **Settings Tab**:
   - **Builder**: Select **"Nixpacks"**
   - **Root Directory**: Set to `apps/api`
   - **Build Command**: (leave empty - auto-detects from `railway.toml`)
   - **Start Command**: (leave empty - auto-detects from `railway.toml`)
3. **Variables Tab** → Add these:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key-change-this
   API_PORT=4312
   NODE_ENV=production
   ```
4. **Save** → **Redeploy**

---

### 🎨 Frontend Service ("next-enterprise")

1. **Go to Railway** → Click **"next-enterprise"** service
2. **Settings Tab**:
   - **Builder**: Select **"Nixpacks"**
   - **Root Directory**: Set to `apps/web-enterprise`
   - **Build Command**: (leave empty - auto-detects from `railway.toml`)
   - **Start Command**: (leave empty - auto-detects from `railway.toml`)
   - **Port**: Set to `4320`
3. **Variables Tab** → Add these:
   ```
   NEXT_PUBLIC_API_BASE_URL=${{web.RAILWAY_PUBLIC_DOMAIN}}
   NODE_ENV=production
   PORT=4320
   ```
   **Note**: Replace `${{web.RAILWAY_PUBLIC_DOMAIN}}` with actual backend URL after exposing it
4. **Save** → **Redeploy**

---

## 🔗 Step 1: Expose Backend & Get URL

1. **Go to "web" service** → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `web-production-xxxx.up.railway.app`)
4. **Update frontend variable**:
   - Go to **"next-enterprise"** → **Variables**
   - Update `NEXT_PUBLIC_API_BASE_URL` to: `https://your-backend-url.railway.app`

---

## 🔗 Step 2: Expose Frontend

1. **Go to "next-enterprise" service** → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL - this is your public frontend URL!

---

## 🗄️ Step 3: Database Setup

### Get Database URL

1. **Go to PostgreSQL service**
2. **Variables tab** → Find `DATABASE_URL` or `POSTGRES_URL`
3. Copy the connection string

### Set in Backend

1. **Go to "web" service** → **Variables**
2. Add/Update `DATABASE_URL` with the PostgreSQL connection string

---

## 🗃️ Step 4: Run Migrations

### Option A: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
cd apps/api
railway run --service web pnpm prisma migrate deploy
```

### Option B: Railway Shell

1. **Go to "web" service** → **Deployments** → **Latest**
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

---

## ✅ Verification Checklist

- [ ] Backend builds successfully (check Build Logs)
- [ ] Backend runs without crashes (check Deploy Logs)
- [ ] Backend has public domain
- [ ] Frontend builds successfully (check Build Logs)
- [ ] Frontend runs without crashes (check Deploy Logs)
- [ ] Frontend has public domain
- [ ] `DATABASE_URL` set in backend
- [ ] `NEXT_PUBLIC_API_BASE_URL` set in frontend (with backend URL)
- [ ] Database migrations run
- [ ] Backend health check works: `https://backend-url/health`
- [ ] Frontend loads: `https://frontend-url`

---

## 🐛 Troubleshooting

### Backend Still Crashing?

**Check Build Logs:**
- Ensure `pnpm build` completes
- Check if `dist/main.js` exists after build

**Check Deploy Logs:**
- Look for "Cannot find module" errors
- Verify `DATABASE_URL` is set
- Check if Prisma client is generated

**Fix:**
1. Go to **Settings** → **Root Directory**: `apps/api`
2. Ensure **Builder** is **"Nixpacks"**
3. **Redeploy**

### Frontend Still Crashing?

**Check Build Logs:**
- Ensure `pnpm build` completes
- Check if `.next/standalone` directory exists

**Check Deploy Logs:**
- Look for "Cannot find module" errors
- Verify port is 4320
- Check if `NEXT_PUBLIC_API_BASE_URL` is set

**Fix:**
1. Go to **Settings** → **Root Directory**: `apps/web-enterprise`
2. Ensure **Builder** is **"Nixpacks"**
3. Set **Port** to `4320`
4. **Redeploy**

---

## 🎉 Success!

Once everything is working:
- Your backend API is live
- Your frontend is live
- Users can access your application!

