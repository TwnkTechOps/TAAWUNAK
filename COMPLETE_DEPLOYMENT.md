# 🚀 Complete Deployment - Do It All Automatically

Your Docker images are **already built** and ready! Now we just need to push them to Docker Hub and setup Railway.

## ✅ Current Status

- ✅ **Backend image built:** `wasimsse/tawawunak-backend:latest`
- ✅ **Frontend image built:** `wasimsse/tawawunak-frontend:latest`
- ⏳ **Need to push to Docker Hub**

---

## 📤 Step 1: Push Images to Docker Hub

You need to login to Docker Hub first, then push:

```bash
# Login to Docker Hub (you'll be prompted for username/password)
docker login

# Push the images
./push-images-auto.sh wasimsse
```

**OR** if you prefer manual push:

```bash
docker login
docker push wasimsse/tawawunak-backend:latest
docker push wasimsse/tawawunak-frontend:latest
```

---

## 🚂 Step 2: Setup Railway

### 2.1 Create PostgreSQL Database

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** (or select existing)
3. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for database to provision
5. Go to **"Variables"** tab
6. **Copy the `DATABASE_URL`** value

### 2.2 Create Backend Service

1. In the same Railway project, click **"New"** → **"Empty Service"**
2. **Rename** to **"api"**
3. Go to **"Settings"** tab
4. Under **"Deploy"**, select **"Docker Hub Image"**
5. Enter image: `wasimsse/tawawunak-backend:latest`
6. Go to **"Variables"** tab, add:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
API_PORT=4312
NODE_ENV=production
WEB_ORIGIN=https://your-frontend-url.railway.app
```

### 2.3 Create Frontend Service

1. In the same Railway project, click **"New"** → **"Empty Service"**
2. **Rename** to **"frontend"**
3. Go to **"Settings"** tab
4. Under **"Deploy"**, select **"Docker Hub Image"**
5. Enter image: `wasimsse/tawawunak-frontend:latest`
6. Go to **"Variables"** tab, add:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

### 2.4 Get URLs and Link Services

1. **Backend URL:**
   - Go to **"api"** service → **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy URL (e.g., `https://api-production-xxxx.up.railway.app`)

2. **Frontend URL:**
   - Go to **"frontend"** service → **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy URL

3. **Update Variables:**
   - **Frontend:** Update `NEXT_PUBLIC_API_BASE_URL` with backend URL
   - **Backend:** Update `WEB_ORIGIN` with frontend URL

4. **Redeploy:**
   - Both services will auto-redeploy when variables change

---

## ✅ Step 3: Test

1. **Backend Health Check:**
   - Visit: `https://your-backend-url.railway.app/health`
   - Should return: `{"status":"ok"}`

2. **Frontend:**
   - Visit your frontend URL
   - Should show the login page

3. **Check Logs:**
   - Backend logs should show: `✅ Successfully connected to database`
   - Frontend logs should show successful startup

---

## 🎯 Quick Command Reference

```bash
# Login to Docker Hub
docker login

# Push images
./push-images-auto.sh wasimsse

# Or manually:
docker push wasimsse/tawawunak-backend:latest
docker push wasimsse/tawawunak-frontend:latest
```

---

## 🐛 Troubleshooting

### Can't push to Docker Hub
- Make sure you're logged in: `docker login`
- Check your Docker Hub username is correct: `wasimsse`
- Verify images exist: `docker images | grep wasimsse`

### Backend crashes on Railway
- Check `DATABASE_URL` is set: `${{Postgres.DATABASE_URL}}`
- Check logs for specific errors
- Verify database is running

### Frontend can't connect
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Make sure backend is running
- Check CORS settings

---

## 📝 Summary

**What's Done:**
- ✅ Images built locally
- ✅ Ready to push to Docker Hub

**What You Need to Do:**
1. Login to Docker Hub: `docker login`
2. Push images: `./push-images-auto.sh wasimsse`
3. Setup Railway (follow Step 2 above)
4. Test your application

---

**That's it! Your application will be live! 🚀**

