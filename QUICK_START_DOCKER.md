# ⚡ Quick Start - Docker Images on Railway

**Fastest way to get TAAWUNAK running on Railway using Docker images.**

## 🚀 One-Command Deployment

```bash
# Make scripts executable (first time only)
chmod +x *.sh

# Build, push, and get instructions
./deploy-to-railway.sh your-dockerhub-username
```

This will:
1. ✅ Build both Docker images
2. ✅ Push them to Docker Hub
3. ✅ Show you Railway setup instructions

---

## 📋 Manual Steps (if needed)

### 1. Build Images
```bash
./build-docker-images.sh
```

### 2. Push to Docker Hub
```bash
./push-docker-images.sh your-dockerhub-username
```

### 3. Setup Railway

1. **Create PostgreSQL Database**
   - Railway Dashboard → New → Database → PostgreSQL
   - Copy `DATABASE_URL` from Variables

2. **Create Backend Service**
   - New → Empty Service → Rename to "api"
   - Settings → Deploy → Docker Hub Image
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
   - Settings → Deploy → Docker Hub Image
   - Image: `your-username/tawawunak-frontend:latest`
   - Variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
     NODE_ENV=production
     ```

4. **Get URLs & Link**
   - Generate domains for both services
   - Update `NEXT_PUBLIC_API_BASE_URL` with backend URL
   - Update `WEB_ORIGIN` in backend with frontend URL

5. **Test**
   - Backend: `https://your-backend-url.railway.app/health`
   - Frontend: `https://your-frontend-url.railway.app`

---

## 🎯 What You Get

✅ **Pre-built Docker images** - No build time on Railway  
✅ **Fast deployments** - Just pull and run  
✅ **Consistent builds** - Same image everywhere  
✅ **Easy updates** - Rebuild, push, redeploy  

---

## 📚 Full Documentation

- **Complete Guide:** `DOCKER_RAILWAY_DEPLOY.md`
- **Troubleshooting:** `RAILWAY_QUICK_FIX.md`
- **Clean Setup:** `RAILWAY_CLEAN_SETUP.md`

---

**That's it! Your app will be live in minutes! 🚀**

