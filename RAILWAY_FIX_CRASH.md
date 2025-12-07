# Railway Crash Fix - Module Not Found

## Problem
```
Error: Cannot find module '/app/apps/api/dist/main.js'
```

## Root Cause
The Dockerfile was copying `dist` to the wrong location, causing a path mismatch.

## Solution Applied

### 1. Fixed Dockerfile Path
Updated `apps/api/Dockerfile` to copy `dist` to the correct location:
```dockerfile
COPY --from=base /app/apps/api/dist ./apps/api/dist
```

### 2. Fixed Railway Start Command
Updated `railway.json` to use the correct path:
```json
"startCommand": "cd apps/api && node dist/main.js"
```

## Steps to Fix on Railway

### Option 1: Use Dockerfile (Recommended)
1. Go to your **"web"** service (backend API) on Railway
2. Click **Settings** tab
3. Under **Build & Deploy**:
   - **Builder**: Select "Dockerfile"
   - **Dockerfile Path**: `apps/api/Dockerfile`
   - **Root Directory**: Leave empty (or set to root `/`)
4. Under **Deploy**:
   - **Start Command**: `cd apps/api && node dist/main.js`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** (or wait for auto-deploy from GitHub)

### Option 2: Use Nixpacks (Alternative)
If Dockerfile doesn't work, use Nixpacks:

1. Go to **Settings** tab
2. Under **Build & Deploy**:
   - **Builder**: Select "Nixpacks"
   - **Root Directory**: `apps/api`
3. Under **Deploy**:
   - **Start Command**: `node dist/main.js`
4. Add these **Environment Variables**:
   ```
   NODE_ENV=production
   API_PORT=4312
   ```
5. Click **Save** and **Redeploy**

## Verify Build Logs

After redeploying, check **Build Logs** to ensure:
- ✅ `pnpm install` completes
- ✅ `pnpm prisma generate` completes
- ✅ `pnpm build` completes
- ✅ `dist/main.js` is created

## Verify Deploy Logs

Check **Deploy Logs** to ensure:
- ✅ No "Cannot find module" errors
- ✅ Server starts: `API running on http://localhost:4312`
- ✅ No crashes after startup

## If Still Crashing

1. **Check Build Logs**: Look for build errors
2. **Check Deploy Logs**: Look for runtime errors
3. **Verify Environment Variables**: Ensure all required vars are set
4. **Check Root Directory**: Make sure it's set correctly

## Required Environment Variables

Make sure these are set in Railway:
- `DATABASE_URL` (from PostgreSQL service)
- `JWT_SECRET`
- `API_PORT=4312`
- `NODE_ENV=production`
- `WEB_ORIGIN` (your frontend URL)

## Next Steps

After fixing the backend:
1. Fix the frontend service ("next-enterprise")
2. Connect frontend to backend URL
3. Run database migrations

