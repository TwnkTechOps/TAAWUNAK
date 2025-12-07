# Fix Render Deployment Error

## Problem
Error: `failed to read dockerfile: open Dockerfile: no such file or directory`

Render is looking for `Dockerfile` in the root, but your Dockerfiles are in:
- `apps/api/Dockerfile` (Backend)
- `apps/web-enterprise/Dockerfile` (Frontend)

## Solution: Configure Root Directory

### For Backend Service:

1. **Go to your Render dashboard**
2. **Click on your backend service** (the one that failed)
3. **Go to "Settings" tab**
4. **Find "Root Directory"** section
5. **Set Root Directory to**: `apps/api`
6. **Save changes**
7. **Manual Deploy** → Render will rebuild with correct path

### For Frontend Service:

1. **Click on your frontend service**
2. **Go to "Settings" tab**
3. **Set Root Directory to**: `apps/web-enterprise`
4. **Save changes**
5. **Manual Deploy**

## Alternative: Use Dockerfile Path

If Root Directory doesn't work, you can specify Dockerfile path:

1. **Settings** → **Build & Deploy**
2. **Dockerfile Path**: Set to `apps/api/Dockerfile` (for backend)
3. **Dockerfile Path**: Set to `apps/web-enterprise/Dockerfile` (for frontend)

## Quick Fix Steps

### Backend Service:
```
Settings → Root Directory → apps/api → Save → Manual Deploy
```

### Frontend Service:
```
Settings → Root Directory → apps/web-enterprise → Save → Manual Deploy
```

## After Fixing

Render will:
1. ✅ Find the correct Dockerfile
2. ✅ Build your Docker image
3. ✅ Deploy successfully

## If Still Failing

Check:
- Root Directory is set correctly
- Dockerfile exists at that path
- Build logs show correct path being used

---

**Set Root Directory to `apps/api` for backend and `apps/web-enterprise` for frontend!** 🚀

