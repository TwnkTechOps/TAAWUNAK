# 🚨 Railway Quick Fix Guide

If your Railway deployment is crashing, follow these steps **IN ORDER**:

## ⚡ Quick Fix Steps

### 1. Check Backend Service Variables

Go to Railway Dashboard → **api** service → **Variables** tab

**MUST HAVE:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**OR manually:**
```
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### 2. Check Backend Service Settings

Go to Railway Dashboard → **api** service → **Settings** tab

**Root Directory:** `apps/api`
**Build Command:** (leave empty)
**Start Command:** (leave empty)

### 3. Check Frontend Service Settings

Go to Railway Dashboard → **frontend** service → **Settings** tab

**Root Directory:** `apps/web-enterprise`
**Build Command:** (leave empty)
**Start Command:** (leave empty)

### 4. Verify Database is Running

Go to Railway Dashboard → **Postgres** service → Check it's **"Active"**

### 5. Redeploy Services

1. Go to **api** service → **Deployments** → Click **"Redeploy"**
2. Go to **frontend** service → **Deployments** → Click **"Redeploy"**

### 6. Check Logs

After redeploy, check logs for:
- ✅ `Successfully connected to database`
- ❌ `DATABASE_URL environment variable is not set` (if you see this, go back to step 1)

---

## 🔍 Common Error Messages & Fixes

### Error: `PrismaClientInitializationError: Environment variable not found: DATABASE_URL`

**Fix:**
1. Go to **api** service → **Variables**
2. Add: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. Redeploy

### Error: `The executable 'cd' could not be found`

**Fix:**
1. Go to **api** service → **Settings**
2. Remove any **Start Command** (leave it empty)
3. Redeploy

### Error: `Cannot find module` or build failures

**Fix:**
1. Check **Root Directory** is set correctly
2. Backend: `apps/api`
3. Frontend: `apps/web-enterprise`
4. Redeploy

---

## 📋 Environment Variables Checklist

### Backend (api service):
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `JWT_SECRET=your-secret-key`
- [ ] `API_PORT=4312`
- [ ] `NODE_ENV=production`
- [ ] `WEB_ORIGIN=https://your-frontend-url.railway.app`

### Frontend (frontend service):
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app`
- [ ] `NODE_ENV=production`

---

## 🎯 The Most Common Issue

**90% of crashes are due to missing `DATABASE_URL`**

**Solution:**
1. Go to **Postgres** service → **Variables** → Copy `DATABASE_URL`
2. Go to **api** service → **Variables** → Add `DATABASE_URL` with the copied value
3. **OR** use Railway reference: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. Redeploy **api** service

---

## ✅ Success Indicators

When everything works, you'll see in logs:

**Backend:**
```
✅ Successfully connected to database
API running on http://localhost:4312
```

**Frontend:**
```
✓ Compiled successfully
```

**Test:**
- Visit: `https://your-backend-url.railway.app/health`
- Should return: `{"status":"ok"}`

---

**If you still have issues, check the full guide: `RAILWAY_CLEAN_SETUP.md`**
