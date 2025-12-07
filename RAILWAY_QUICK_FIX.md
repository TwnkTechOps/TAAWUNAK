# 🚨 Quick Fix for Railway Crash

## The Problem
Your backend service is crashing because it can't find `/app/apps/api/dist/main.js`

## ✅ Solution (Choose One)

### Option A: Use Nixpacks (Easiest - Recommended)

1. **Go to Railway Dashboard** → Click on **"web"** service (your backend)

2. **Click "Settings" tab**

3. **Under "Build & Deploy":**
   - **Builder**: Change to **"Nixpacks"**
   - **Root Directory**: Set to `apps/api`
   - **Build Command**: Leave empty (auto-detects) OR set to:
     ```
     pnpm install && pnpm prisma generate && pnpm build
     ```

4. **Under "Deploy":**
   - **Start Command**: Set to:
     ```
     node dist/main.js
     ```

5. **Click "Save"**

6. **Go to "Deployments" tab** → Click **"Redeploy"**

---

### Option B: Use Dockerfile

1. **Go to Railway Dashboard** → Click on **"web"** service

2. **Click "Settings" tab**

3. **Under "Build & Deploy":**
   - **Builder**: Change to **"Dockerfile"**
   - **Dockerfile Path**: `apps/api/Dockerfile`
   - **Root Directory**: Leave empty (root `/`)

4. **Under "Deploy":**
   - **Start Command**: Leave empty (uses Dockerfile CMD)

5. **Click "Save"**

6. **Go to "Deployments" tab** → Click **"Redeploy"**

---

## 🔍 Check Build Logs

After redeploying, check **"Build Logs"** tab:

✅ Should see:
- `pnpm install` completing
- `pnpm prisma generate` completing  
- `pnpm build` completing
- No errors

❌ If you see errors:
- Share the error message
- Check if `DATABASE_URL` is set
- Check if all dependencies installed

---

## 🔍 Check Deploy Logs

After build succeeds, check **"Deploy Logs"** tab:

✅ Should see:
- `API running on http://localhost:4312`
- No "Cannot find module" errors
- Service stays running

❌ If still crashing:
- Check the error message
- Verify environment variables are set
- Check if port 4312 is correct

---

## 📋 Required Environment Variables

Make sure these are set in Railway (Variables tab):

```
DATABASE_URL=postgresql://... (from PostgreSQL service)
JWT_SECRET=your-secret-key
API_PORT=4312
NODE_ENV=production
WEB_ORIGIN=https://your-frontend-url.railway.app
```

---

## 🎯 After Backend Works

Once backend is running:
1. Fix frontend service ("next-enterprise")
2. Set `NEXT_PUBLIC_API_BASE_URL` to backend URL
3. Run database migrations

---

## 💡 Still Having Issues?

Share:
1. Build logs (full output)
2. Deploy logs (full output)
3. Environment variables list (without secrets)
