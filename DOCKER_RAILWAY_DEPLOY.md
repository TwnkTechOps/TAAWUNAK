# 🐳 Docker Images Deployment on Railway

This guide shows you how to deploy TAAWUNAK using pre-built Docker images on Railway.

## 📋 Prerequisites

1. Docker Desktop installed and running
2. Docker Hub account (free at [hub.docker.com](https://hub.docker.com))
3. Railway account

---

## 🚀 Step 1: Build Docker Images

### Option A: Using the Build Script (Recommended)

```bash
# Make scripts executable
chmod +x build-docker-images.sh push-docker-images.sh

# Build images
./build-docker-images.sh
```

The script will:
- Build backend image: `your-username/tawawunak-backend:latest`
- Build frontend image: `your-username/tawawunak-frontend:latest`

### Option B: Manual Build

```bash
# Build backend
docker build -t your-username/tawawunak-backend:latest -f apps/api/Dockerfile .

# Build frontend
docker build -t your-username/tawawunak-frontend:latest -f apps/web-enterprise/Dockerfile .
```

---

## 📤 Step 2: Push Images to Docker Hub

### Option A: Using the Push Script (Recommended)

```bash
# Push images to Docker Hub
./push-docker-images.sh your-dockerhub-username
```

You'll be prompted to login to Docker Hub if not already logged in.

### Option B: Manual Push

```bash
# Login to Docker Hub
docker login

# Push backend
docker push your-username/tawawunak-backend:latest

# Push frontend
docker push your-username/tawawunak-frontend:latest
```

---

## 🗄️ Step 3: Create PostgreSQL Database on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** (or select existing)
3. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for database to provision
5. Go to **"Variables"** tab
6. **Copy the `DATABASE_URL`** value (you'll need it)

---

## 🔧 Step 4: Create Backend Service on Railway

1. In the same Railway project, click **"New"** → **"Empty Service"**
2. **Rename** the service to **"api"**
3. Go to **"Settings"** tab
4. Under **"Deploy"**, select **"Docker Hub Image"**
5. Enter image name: `your-username/tawawunak-backend:latest`
6. Go to **"Variables"** tab
7. Add these environment variables:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
API_PORT=4312
NODE_ENV=production
WEB_ORIGIN=https://your-frontend-url.railway.app
```

**Important:** Replace `your-username` with your actual Docker Hub username.

---

## 🎨 Step 5: Create Frontend Service on Railway

1. In the same Railway project, click **"New"** → **"Empty Service"**
2. **Rename** the service to **"frontend"**
3. Go to **"Settings"** tab
4. Under **"Deploy"**, select **"Docker Hub Image"**
5. Enter image name: `your-username/tawawunak-frontend:latest`
6. Go to **"Variables"** tab
7. Add these environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

**Important:** 
- Replace `your-username` with your actual Docker Hub username
- Update `NEXT_PUBLIC_API_BASE_URL` after backend is deployed (get URL from backend service)

---

## 🔗 Step 6: Get Service URLs and Link Them

1. **Backend URL:**
   - Go to **"api"** service → **"Settings"** → **"Networking"**
   - Click **"Generate Domain"** (or use provided one)
   - Copy the URL (e.g., `https://api-production-xxxx.up.railway.app`)

2. **Frontend URL:**
   - Go to **"frontend"** service → **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy the URL

3. **Update Environment Variables:**
   - Go to **"frontend"** service → **"Variables"**
   - Update `NEXT_PUBLIC_API_BASE_URL` with backend URL
   - Go to **"api"** service → **"Variables"**
   - Update `WEB_ORIGIN` with frontend URL

4. **Redeploy Services:**
   - Both services will auto-redeploy when variables change
   - Or manually: Go to **"Deployments"** → Click **"Redeploy"**

---

## 🗃️ Step 7: Run Database Migrations

After backend is running:

1. Go to **"api"** service → **"Deployments"** → **"View Logs"**
2. Check if migrations ran automatically
3. If not, you can run them manually:

**Option A: Using Railway CLI**
```bash
railway run --service api "cd apps/api && pnpm prisma migrate deploy"
```

**Option B: Using Railway Dashboard**
1. Go to **"api"** service → **"Settings"** → **"Deploy Hooks"**
2. Add **"Deploy Command"**: `cd apps/api && pnpm prisma migrate deploy`

---

## ✅ Step 8: Verify Deployment

### Check Backend:
1. Visit: `https://your-backend-url.railway.app/health`
2. Should return: `{"status":"ok"}`

### Check Frontend:
1. Visit your frontend URL
2. Should show the login page

### Check Logs:
- **Backend logs** should show: `✅ Successfully connected to database`
- **Frontend logs** should show: `✓ Compiled successfully`

---

## 🔄 Updating Images

When you make changes to the code:

1. **Rebuild images:**
   ```bash
   ./build-docker-images.sh
   ```

2. **Push updated images:**
   ```bash
   ./push-docker-images.sh your-username
   ```

3. **Redeploy on Railway:**
   - Railway will automatically pull the latest images
   - Or manually: Go to **"Deployments"** → Click **"Redeploy"**

---

## 🐛 Troubleshooting

### Images not found on Docker Hub

**Fix:**
- Make sure you pushed the images: `./push-docker-images.sh your-username`
- Verify images exist: Visit `https://hub.docker.com/r/your-username/tawawunak-backend`

### Backend crashes with DATABASE_URL error

**Fix:**
1. Go to **"api"** service → **"Variables"**
2. Add: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. Redeploy

### Frontend can't connect to backend

**Fix:**
1. Check `NEXT_PUBLIC_API_BASE_URL` in frontend variables
2. Make sure backend URL is correct
3. Check backend CORS settings (should allow all origins)

### Images are outdated

**Fix:**
1. Rebuild: `./build-docker-images.sh`
2. Push: `./push-docker-images.sh your-username`
3. Redeploy services on Railway

---

## 📝 Quick Reference

### Image Names:
- Backend: `your-username/tawawunak-backend:latest`
- Frontend: `your-username/tawawunak-frontend:latest`

### Required Environment Variables:

**Backend:**
- `DATABASE_URL` (from PostgreSQL service)
- `JWT_SECRET`
- `API_PORT=4312`
- `NODE_ENV=production`
- `WEB_ORIGIN` (frontend URL)

**Frontend:**
- `NEXT_PUBLIC_API_BASE_URL` (backend URL)
- `NODE_ENV=production`

---

## 🎯 Advantages of Docker Images

✅ **Faster deployments** - No build time on Railway  
✅ **Consistent builds** - Same image works everywhere  
✅ **Version control** - Tag images with versions  
✅ **Easy rollback** - Use previous image tags  
✅ **Local testing** - Test images before pushing  

---

**That's it! Your application should now be running on Railway using Docker images! 🚀**

