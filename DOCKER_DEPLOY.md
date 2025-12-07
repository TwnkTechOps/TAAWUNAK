# 🐳 Docker Deployment Guide

This guide shows you how to build, test, and deploy Docker images for TAAWUNAK.

## 📦 What We'll Create

1. **Frontend Docker Image** - Next.js application
2. **Backend Docker Image** - NestJS API
3. **Test locally** - Verify everything works
4. **Push to registry** - Docker Hub or other
5. **Deploy** - To any Docker-compatible platform

---

## Step 1: Build Docker Images Locally

### Build Frontend Image

```bash
cd /Users/svm648/TAAWUNAK
docker build -f apps/web-enterprise/Dockerfile -t tawawunak-frontend:latest .
```

### Build Backend Image

```bash
docker build -f apps/api/Dockerfile -t tawawunak-backend:latest .
```

### Or Build Both at Once

```bash
docker build -f apps/web-enterprise/Dockerfile -t tawawunak-frontend:latest .
docker build -f apps/api/Dockerfile -t tawawunak-backend:latest .
```

**Expected time:** 5-10 minutes for first build

---

## Step 2: Test Locally with Docker Compose

### Create `.env` file for production:

```bash
cd /Users/svm648/TAAWUNAK
cat > .env.prod << EOF
POSTGRES_USER=tawawunak
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=tawawunak
JWT_SECRET=your-strong-jwt-secret
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4312
EOF
```

### Start all services:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Check logs:

```bash
# Frontend logs
docker logs tawawunak-web -f

# Backend logs
docker logs tawawunak-api -f

# Database logs
docker logs tawawunak-postgres -f
```

### Test:

- Frontend: http://localhost:3000
- Backend: http://localhost:4312/health
- Database: localhost:5432

### Stop services:

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Step 3: Push to Docker Registry

### Option A: Docker Hub (Free)

1. **Create account:** https://hub.docker.com/signup
2. **Login:**
   ```bash
   docker login
   ```
3. **Tag images:**
   ```bash
   docker tag tawawunak-frontend:latest YOUR_DOCKERHUB_USERNAME/tawawunak-frontend:latest
   docker tag tawawunak-backend:latest YOUR_DOCKERHUB_USERNAME/tawawunak-backend:latest
   ```
4. **Push:**
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/tawawunak-frontend:latest
   docker push YOUR_DOCKERHUB_USERNAME/tawawunak-backend:latest
   ```

### Option B: GitHub Container Registry (Free)

1. **Create GitHub Personal Access Token** with `write:packages` permission
2. **Login:**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```
3. **Tag images:**
   ```bash
   docker tag tawawunak-frontend:latest ghcr.io/YOUR_GITHUB_USERNAME/tawawunak-frontend:latest
   docker tag tawawunak-backend:latest ghcr.io/YOUR_GITHUB_USERNAME/tawawunak-backend:latest
   ```
4. **Push:**
   ```bash
   docker push ghcr.io/YOUR_GITHUB_USERNAME/tawawunak-frontend:latest
   docker push ghcr.io/YOUR_GITHUB_USERNAME/tawawunak-backend:latest
   ```

---

## Step 4: Deploy to Platform

### Option 1: Railway (Easiest) ⭐

1. **Go to:** https://railway.app
2. **New Project** → **"Deploy from GitHub"**
3. **Add Services:**
   - **PostgreSQL** (managed database)
   - **Empty Service** → **"Deploy from Docker Hub"**
     - Image: `YOUR_DOCKERHUB_USERNAME/tawawunak-backend:latest`
     - Port: 4312
   - **Empty Service** → **"Deploy from Docker Hub"**
     - Image: `YOUR_DOCKERHUB_USERNAME/tawawunak-frontend:latest`
     - Port: 3000
4. **Set Environment Variables:**
   - Backend:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-secret
     NODE_ENV=production
     PORT=4312
     CORS_ORIGIN=https://your-frontend.railway.app
     ```
   - Frontend:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
     ```
5. **Generate domains** for each service
6. **Done!** Your app is live

### Option 2: Render.com

1. **Go to:** https://render.com
2. **New** → **"Web Service"**
3. **Connect Docker Hub**
4. **Select image:** `YOUR_DOCKERHUB_USERNAME/tawawunak-backend:latest`
5. **Set environment variables**
6. **Repeat for frontend**
7. **Add PostgreSQL database**
8. **Deploy!**

### Option 3: DigitalOcean App Platform

1. **Go to:** https://cloud.digitalocean.com/apps
2. **Create App** → **"Container Registry"**
3. **Connect Docker Hub**
4. **Add components:**
   - Backend (from Docker Hub)
   - Frontend (from Docker Hub)
   - PostgreSQL database
5. **Configure environment variables**
6. **Deploy!**

### Option 4: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. **Login:**
   ```bash
   fly auth login
   ```
3. **Create apps:**
   ```bash
   fly apps create tawawunak-backend
   fly apps create tawawunak-frontend
   ```
4. **Deploy:**
   ```bash
   fly deploy --image YOUR_DOCKERHUB_USERNAME/tawawunak-backend:latest --app tawawunak-backend
   fly deploy --image YOUR_DOCKERHUB_USERNAME/tawawunak-frontend:latest --app tawawunak-frontend
   ```

---

## Quick Start Script

I'll create a script to automate the build and push process:

```bash
#!/bin/bash
# build-and-push.sh

DOCKERHUB_USERNAME="your-username"

echo "🔨 Building images..."
docker build -f apps/web-enterprise/Dockerfile -t tawawunak-frontend:latest .
docker build -f apps/api/Dockerfile -t tawawunak-backend:latest .

echo "🏷️  Tagging images..."
docker tag tawawunak-frontend:latest $DOCKERHUB_USERNAME/tawawunak-frontend:latest
docker tag tawawunak-backend:latest $DOCKERHUB_USERNAME/tawawunak-backend:latest

echo "📤 Pushing to Docker Hub..."
docker push $DOCKERHUB_USERNAME/tawawunak-frontend:latest
docker push $DOCKERHUB_USERNAME/tawawunak-backend:latest

echo "✅ Done! Images pushed to Docker Hub"
```

---

## Testing Checklist

Before pushing, test locally:

- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Docker Compose starts all services
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check works: http://localhost:4312/health
- [ ] Can login/register
- [ ] Database migrations run
- [ ] All environment variables set correctly

---

## Environment Variables Reference

### Frontend (.env)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
NODE_ENV=production
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-strong-secret-key
NODE_ENV=production
PORT=4312
CORS_ORIGIN=https://your-frontend-url.com
```

---

## Advantages of Docker Deployment

✅ **Tested & Verified** - Test locally before deploying
✅ **Consistent** - Same image works everywhere
✅ **Portable** - Deploy to any Docker-compatible platform
✅ **Version Control** - Tag images with versions
✅ **Rollback** - Easy to rollback to previous versions
✅ **Scalable** - Easy to scale horizontally

---

## Next Steps

1. Build images locally
2. Test with Docker Compose
3. Push to Docker Hub/GHCR
4. Deploy to your chosen platform
5. Get public URLs!

Need help with any step? Let me know!

