# 🐳 Docker Deployment - Complete Setup

## ✅ What's Been Done

I've set up a complete Docker-based deployment system for TAAWUNAK. Everything is ready to build, push, and deploy to Railway.

### 📦 Created Files

1. **`build-docker-images.sh`** - Builds both frontend and backend Docker images
2. **`push-docker-images.sh`** - Pushes images to Docker Hub
3. **`deploy-to-railway.sh`** - All-in-one script (build + push + instructions)
4. **`DOCKER_RAILWAY_DEPLOY.md`** - Complete deployment guide
5. **`QUICK_START_DOCKER.md`** - Quick start guide
6. **`.dockerignore`** - Optimized Docker builds

### 🔧 Updated Files

1. **`apps/api/Dockerfile`** - Optimized backend image
2. **`apps/web-enterprise/Dockerfile`** - Fixed for Next.js standalone output
3. **`apps/api/src/services/prisma.service.ts`** - Better error handling
4. **`apps/api/src/main.ts`** - Startup validation

---

## 🚀 How to Deploy (3 Steps)

### Step 1: Build and Push Images

```bash
# Option A: All-in-one (Recommended)
./deploy-to-railway.sh your-dockerhub-username

# Option B: Step by step
./build-docker-images.sh
./push-docker-images.sh your-dockerhub-username
```

**You'll need:**
- Docker Desktop running
- Docker Hub account (free at hub.docker.com)
- Your Docker Hub username

### Step 2: Setup Railway

1. **Create PostgreSQL Database**
   - Railway Dashboard → New → Database → PostgreSQL
   - Copy `DATABASE_URL` from Variables

2. **Create Backend Service**
   - New → Empty Service → Rename to "api"
   - Settings → Deploy → **Docker Hub Image**
   - Image: `your-username/tawawunak-backend:latest`
   - Variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-secret-key
     API_PORT=4312
     NODE_ENV=production
     ```

3. **Create Frontend Service**
   - New → Empty Service → Rename to "frontend"
   - Settings → Deploy → **Docker Hub Image**
   - Image: `your-username/tawawunak-frontend:latest`
   - Variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
     NODE_ENV=production
     ```

4. **Link Services**
   - Generate domains for both services
   - Update `NEXT_PUBLIC_API_BASE_URL` with backend URL
   - Update `WEB_ORIGIN` in backend with frontend URL

### Step 3: Test

- Backend: `https://your-backend-url.railway.app/health` → Should return `{"status":"ok"}`
- Frontend: `https://your-frontend-url.railway.app` → Should show login page

---

## 📚 Documentation

- **Quick Start:** `QUICK_START_DOCKER.md`
- **Complete Guide:** `DOCKER_RAILWAY_DEPLOY.md`
- **Troubleshooting:** `RAILWAY_QUICK_FIX.md`

---

## 🎯 Key Advantages

✅ **No build time on Railway** - Images are pre-built  
✅ **Faster deployments** - Just pull and run  
✅ **Consistent builds** - Same image everywhere  
✅ **Easy updates** - Rebuild, push, redeploy  
✅ **Version control** - Tag images with versions  

---

## 🔄 Updating Your Application

When you make code changes:

1. **Rebuild images:**
   ```bash
   ./build-docker-images.sh
   ```

2. **Push updated images:**
   ```bash
   ./push-docker-images.sh your-username
   ```

3. **Redeploy on Railway:**
   - Railway will auto-pull latest images
   - Or manually: Deployments → Redeploy

---

## 🐛 Common Issues

### Images not found
- Make sure you pushed: `./push-docker-images.sh your-username`
- Verify on Docker Hub: `https://hub.docker.com/r/your-username/tawawunak-backend`

### DATABASE_URL error
- Add `DATABASE_URL=${{Postgres.DATABASE_URL}}` in backend variables
- Redeploy backend service

### Frontend can't connect
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Make sure backend is running
- Check backend CORS settings

---

## 📝 Image Names

- **Backend:** `your-username/tawawunak-backend:latest`
- **Frontend:** `your-username/tawawunak-frontend:latest`

---

## ✅ Next Steps

1. Run: `./deploy-to-railway.sh your-dockerhub-username`
2. Follow the instructions shown
3. Setup Railway services as described
4. Test your application

---

**Everything is ready! Just run the script and follow the instructions! 🚀**

