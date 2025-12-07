# 🎯 Next Steps: Complete Railway Deployment

## ✅ Step 1: Backend is Working!
Your backend ("web" service) is now running. Great job!

---

## 🔧 Step 2: Fix Frontend Service ("next-enterprise")

### Option A: Use Nixpacks (Recommended)

1. **Go to Railway Dashboard** → Click on **"next-enterprise"** service

2. **Click "Settings" tab**

3. **Under "Build & Deploy":**
   - **Builder**: Change to **"Nixpacks"**
   - **Root Directory**: Set to `apps/web-enterprise`
   - **Build Command**: Leave empty (auto-detects) OR set to:
     ```
     pnpm install && pnpm build
     ```

4. **Under "Deploy":**
   - **Start Command**: Set to:
     ```
     node server.js
     ```
   - **Port**: Set to `4320` (or leave auto if Railway detects it)

5. **Click "Save"**

6. **Go to "Deployments" tab** → Click **"Redeploy"**

---

### Option B: Use Dockerfile

1. **Go to Railway Dashboard** → Click on **"next-enterprise"** service

2. **Click "Settings" tab**

3. **Under "Build & Deploy":**
   - **Builder**: Change to **"Dockerfile"**
   - **Dockerfile Path**: `apps/web-enterprise/Dockerfile`
   - **Root Directory**: Leave empty (root `/`)

4. **Under "Deploy":**
   - **Start Command**: Leave empty (uses Dockerfile CMD)
   - **Port**: Set to `4320`

5. **Click "Save"**

6. **Go to "Deployments" tab** → Click **"Redeploy"**

---

## 🔗 Step 3: Connect Frontend to Backend

### Get Backend URL

1. Go to **"web"** service (backend)
2. Click **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"** (if not already exposed)
5. Copy the **Public Domain** (e.g., `web-production-xxxx.up.railway.app`)

### Set Frontend Environment Variable

1. Go to **"next-enterprise"** service (frontend)
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://your-backend-domain.railway.app` (use the domain from above)
5. Click **"Add"**

---

## 🗄️ Step 4: Configure Database

### Get PostgreSQL Connection String

1. Go to **PostgreSQL** service (database)
2. Click **"Variables"** tab
3. Find **`DATABASE_URL`** or **`POSTGRES_URL`**
4. Copy the connection string

### Set Database URL in Backend

1. Go to **"web"** service (backend)
2. Click **"Variables"** tab
3. Add/Update:
   - **Name**: `DATABASE_URL`
   - **Value**: (paste the PostgreSQL connection string)
4. Click **"Add"** or **"Update"**

---

## 🔐 Step 5: Set Required Environment Variables

### Backend ("web" service) Variables:

```
DATABASE_URL=postgresql://... (from PostgreSQL)
JWT_SECRET=your-secret-key-here (generate a random string)
API_PORT=4312
NODE_ENV=production
WEB_ORIGIN=https://your-frontend-domain.railway.app
```

### Frontend ("next-enterprise" service) Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.railway.app
NODE_ENV=production
PORT=4320
```

**To add variables:**
1. Go to service → **"Variables"** tab
2. Click **"+ New Variable"**
3. Enter name and value
4. Click **"Add"**

---

## 🗃️ Step 6: Run Database Migrations

### Option A: Using Railway CLI (Recommended)

1. **Install Railway CLI** (if not installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   railway link
   ```

4. **Run migrations**:
   ```bash
   cd apps/api
   railway run pnpm prisma migrate deploy
   ```

### Option B: Using Railway Shell

1. Go to **"web"** service (backend)
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Shell"** tab
5. Run:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```

---

## 🌐 Step 7: Expose Services (Make Public)

### Expose Backend

1. Go to **"web"** service
2. Click **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Copy the public URL

### Expose Frontend

1. Go to **"next-enterprise"** service
2. Click **"Settings"** tab
3. Scroll to **"Networking"**
4. Click **"Generate Domain"**
5. Copy the public URL

---

## ✅ Step 8: Verify Everything Works

### Check Backend

1. Visit: `https://your-backend-url.railway.app/health`
2. Should return: `{"status":"ok"}`

### Check Frontend

1. Visit: `https://your-frontend-url.railway.app`
2. Should load the login page
3. Try logging in (if you have test users)

---

## 🐛 Troubleshooting

### Frontend Still Crashing?

**Check Build Logs:**
- Look for build errors
- Ensure `pnpm build` completes
- Check if `.next/standalone` directory exists

**Check Deploy Logs:**
- Look for "Cannot find module" errors
- Check if port 4320 is correct
- Verify `NEXT_PUBLIC_API_BASE_URL` is set

### Backend Can't Connect to Database?

**Check:**
- `DATABASE_URL` is set correctly
- PostgreSQL service is running
- Connection string format is correct

### Frontend Can't Connect to Backend?

**Check:**
- `NEXT_PUBLIC_API_BASE_URL` is set
- Backend is exposed and has a public domain
- CORS is configured (should be `*` for now)

---

## 🎉 Success Checklist

- [ ] Backend service running
- [ ] Frontend service running
- [ ] Backend has public domain
- [ ] Frontend has public domain
- [ ] `DATABASE_URL` set in backend
- [ ] `NEXT_PUBLIC_API_BASE_URL` set in frontend
- [ ] Database migrations run
- [ ] Backend health check works
- [ ] Frontend loads in browser
- [ ] Can access login page

---

## 📞 Need Help?

If something isn't working:
1. Check **Build Logs** for build errors
2. Check **Deploy Logs** for runtime errors
3. Check **Variables** tab for missing env vars
4. Share the error messages for help!

