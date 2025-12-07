# 🚀 What to Do on Railway RIGHT NOW

## ✅ Good News!
Your code is pushed to GitHub. Railway **will auto-deploy** if GitHub is connected, BUT you need to configure the services first!

---

## 📋 Step-by-Step: Configure Railway Services

### 🔧 Step 1: Configure Backend Service ("web")

1. **Go to Railway Dashboard** → Click on **"web"** service (your backend)

2. **Click "Settings" tab** (gear icon)

3. **Under "Build & Deploy" section:**
   - **Builder**: Change dropdown to **"Nixpacks"** (not Dockerfile)
   - **Root Directory**: Type `apps/api`
   - **Build Command**: Leave empty (it will use `railway.toml`)
   - **Start Command**: Leave empty (it will use `railway.toml`)

4. **Click "Variables" tab** → Click **"+ New Variable"** → Add these one by one:
   ```
   Name: DATABASE_URL
   Value: ${{Postgres.DATABASE_URL}}
   ```
   *(Click the dropdown and select "Postgres.DATABASE_URL" - Railway will auto-fill)*
   
   ```
   Name: JWT_SECRET
   Value: change-this-to-a-random-secret-string-12345
   ```
   
   ```
   Name: API_PORT
   Value: 4312
   ```
   
   ```
   Name: NODE_ENV
   Value: production
   ```

5. **Click "Networking" tab** (or scroll down in Settings)
   - Click **"Generate Domain"** button
   - Copy the URL (e.g., `web-production-xxxx.up.railway.app`)
   - **Save this URL!** You'll need it for frontend

6. **Click "Save"** (if there's a save button)

7. **Go to "Deployments" tab**
   - Click **"Redeploy"** button (or wait for auto-deploy)
   - Watch the build logs - should see `pnpm install`, `pnpm build`, etc.

---

### 🎨 Step 2: Configure Frontend Service ("next-enterprise")

1. **Go to Railway Dashboard** → Click on **"next-enterprise"** service (your frontend)

2. **Click "Settings" tab**

3. **Under "Build & Deploy" section:**
   - **Builder**: Change dropdown to **"Nixpacks"**
   - **Root Directory**: Type `apps/web-enterprise`
   - **Build Command**: Leave empty
   - **Start Command**: Leave empty
   - **Port**: Type `4320`

4. **Click "Variables" tab** → Click **"+ New Variable"** → Add:
   ```
   Name: NEXT_PUBLIC_API_BASE_URL
   Value: https://your-backend-url.railway.app
   ```
   *(Replace `your-backend-url` with the URL you copied from backend in Step 1)*
   
   ```
   Name: NODE_ENV
   Value: production
   ```
   
   ```
   Name: PORT
   Value: 4320
   ```

5. **Click "Networking" tab**
   - Click **"Generate Domain"** button
   - Copy the URL - **This is your public website URL!**

6. **Click "Save"**

7. **Go to "Deployments" tab**
   - Click **"Redeploy"** button
   - Watch the build logs

---

### 🗄️ Step 3: Run Database Migrations

**After backend is deployed successfully:**

1. **Go to "web" service** → **"Deployments" tab**
2. Click on the **latest deployment** (should show "Active" or "Success")
3. Click **"Shell" tab** (or "View Logs" → "Shell")
4. In the terminal, type:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```
5. Press Enter
6. Should see: `Applied migration: xxxxx` messages

---

## 🔄 Auto-Deploy vs Manual Deploy

### ✅ Auto-Deploy (If GitHub is Connected)
- Railway watches your GitHub repo
- When you push to `main` branch, it automatically redeploys
- **You still need to configure settings above first!**

### 🔧 Manual Deploy
- Go to service → **"Deployments" tab**
- Click **"Redeploy"** button
- Or click **"Redeploy"** on a specific deployment

---

## ✅ How to Know It's Working

### Backend ("web"):
1. **Build Logs** show:
   - ✅ `pnpm install` completes
   - ✅ `pnpm prisma generate` completes
   - ✅ `pnpm build` completes
   - ✅ No red errors

2. **Deploy Logs** show:
   - ✅ `API running on http://localhost:4312`
   - ✅ No "Cannot find module" errors
   - ✅ Service stays running (green status)

3. **Test**: Visit `https://your-backend-url.railway.app/health`
   - Should return: `{"status":"ok"}`

### Frontend ("next-enterprise"):
1. **Build Logs** show:
   - ✅ `pnpm install` completes
   - ✅ `pnpm build` completes
   - ✅ No red errors

2. **Deploy Logs** show:
   - ✅ Next.js server starts
   - ✅ No errors
   - ✅ Service stays running

3. **Test**: Visit `https://your-frontend-url.railway.app`
   - Should load the login page

---

## 🐛 Troubleshooting

### "Service keeps crashing"
- Check **Deploy Logs** for error messages
- Verify all **Variables** are set correctly
- Check **Root Directory** is correct (`apps/api` or `apps/web-enterprise`)

### "Build fails"
- Check **Build Logs** for errors
- Verify **Root Directory** is correct
- Make sure **Builder** is set to **"Nixpacks"**

### "Can't connect to database"
- Verify `DATABASE_URL` is set in backend variables
- Check PostgreSQL service is running
- Run migrations (Step 3 above)

---

## 🎉 Success Checklist

- [ ] Backend service configured (Nixpacks, Root: `apps/api`)
- [ ] Backend variables set (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Backend has public domain
- [ ] Backend builds successfully
- [ ] Backend runs without crashes
- [ ] Frontend service configured (Nixpacks, Root: `apps/web-enterprise`)
- [ ] Frontend variables set (NEXT_PUBLIC_API_BASE_URL, etc.)
- [ ] Frontend has public domain
- [ ] Frontend builds successfully
- [ ] Frontend runs without crashes
- [ ] Database migrations run
- [ ] Backend health check works
- [ ] Frontend loads in browser

---

## 💡 Quick Tips

1. **Always check Build Logs first** - Most issues show up there
2. **Variables are case-sensitive** - Type them exactly as shown
3. **Root Directory must match** - `apps/api` for backend, `apps/web-enterprise` for frontend
4. **Redeploy after changing settings** - Click "Redeploy" button
5. **Watch the logs** - They tell you what's wrong

---

**Need help?** Share the error message from Build Logs or Deploy Logs!

