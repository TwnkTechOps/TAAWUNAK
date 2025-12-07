# ⚡ Quick Railway Setup (5 Minutes)

## 🎯 What to Do Right Now

### 1️⃣ Backend Service ("web")

**Settings Tab:**
- Builder: **Nixpacks**
- Root Directory: **`apps/api`**
- Port: **4312** (auto-detected)

**Variables Tab - Add These:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=change-this-to-random-string
API_PORT=4312
NODE_ENV=production
```

**Networking Tab:**
- Click **"Generate Domain"** → Copy URL

---

### 2️⃣ Frontend Service ("next-enterprise")

**Settings Tab:**
- Builder: **Nixpacks**
- Root Directory: **`apps/web-enterprise`**
- Port: **4320**

**Variables Tab - Add These:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NODE_ENV=production
PORT=4320
```
*(Replace `your-backend-url` with the backend domain from step 1)*

**Networking Tab:**
- Click **"Generate Domain"** → This is your public URL!

---

### 3️⃣ Run Database Migrations

**Option A - Railway Shell:**
1. Go to **"web"** service → **Deployments** → **Latest** → **Shell**
2. Run: `cd apps/api && pnpm prisma migrate deploy`

**Option B - Railway CLI:**
```bash
railway run --service web pnpm prisma migrate deploy
```

---

## ✅ Done!

- Backend: `https://your-backend-url.railway.app`
- Frontend: `https://your-frontend-url.railway.app`
- Database: Connected ✅
- Migrations: Run ✅

---

## 🐛 If Something Breaks

1. **Check Build Logs** - Look for red errors
2. **Check Deploy Logs** - Look for runtime errors
3. **Verify Variables** - Make sure all env vars are set
4. **Redeploy** - Sometimes fixes issues

---

**Full Guide:** See `RAILWAY_AUTO_FIX.md` for detailed instructions.

