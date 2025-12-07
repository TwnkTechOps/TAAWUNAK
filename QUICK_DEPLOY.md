# Quick Deployment Guide - Get Public URL in 15 Minutes

## Fastest Option: Vercel (Frontend) + Railway (Backend)

### Step 1: Prepare Your Code (2 minutes)

1. **Make sure your code is on GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy Frontend to Vercel (5 minutes)

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your repository**
5. **Configure:**
   - Framework Preset: **Next.js**
   - Root Directory: `apps/web-enterprise`
   - Build Command: `cd ../.. && pnpm install && cd apps/web-enterprise && pnpm build`
   - Output Directory: `.next`
   - Install Command: `cd ../.. && pnpm install`
6. **Environment Variables:**
   - `NEXT_PUBLIC_API_BASE_URL` = (you'll get this from Railway in next step)
   - Leave others empty for now
7. **Click Deploy**
8. **Wait 2-3 minutes** → You'll get a public URL like: `https://your-app.vercel.app`

### Step 3: Deploy Backend to Railway (5 minutes)

1. **Go to:** https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**
5. **Add Service:**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your repo
   - **Settings:**
     - Root Directory: `apps/api`
     - Build Command: `pnpm install && pnpm build`
     - Start Command: `pnpm start`
6. **Add PostgreSQL Database:**
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
   - Railway will create it automatically
7. **Set Environment Variables:**
   - Click on your API service → **Variables** tab
   - Add:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-secret-key-change-this
     NODE_ENV=production
     PORT=4312
     CORS_ORIGIN=https://your-app.vercel.app
     ```
8. **Run Database Migrations:**
   - Click on your API service → **Settings** → **"Generate Domain"**
   - Copy the domain (e.g., `your-api.up.railway.app`)
   - In **Variables**, add:
     ```
     RAILWAY_ENVIRONMENT=production
     ```
   - Go to **Deployments** → Click on latest deployment → **View Logs**
   - In a new terminal, run:
     ```bash
     cd apps/api
     pnpm prisma migrate deploy
     ```
   OR add this to Railway:
   - In **Settings** → **"Deploy"** → Add build command:
     ```
     pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
     ```
9. **Get your API URL:**
   - Railway will give you a URL like: `https://your-api.up.railway.app`

### Step 4: Connect Frontend to Backend (2 minutes)

1. **Go back to Vercel**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Update:**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-api.up.railway.app`
4. **Redeploy:**
   - Go to **Deployments** → Click **"..."** → **"Redeploy"**

### Step 5: Test Your Public URL (1 minute)

1. **Frontend URL:** `https://your-app.vercel.app`
2. **Backend URL:** `https://your-api.up.railway.app/health`
3. **Test:** Open frontend URL in browser

---

## Alternative: Render.com (All-in-One, Slightly Slower)

### Single Platform Deployment

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Create 3 services:**

   **A. PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `tawawunak-db`
   - Create

   **B. Backend API:**
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - Name: `tawawunak-api`
     - Root Directory: `apps/api`
     - Environment: `Node`
     - Build Command: `cd apps/api && pnpm install && pnpm build`
     - Start Command: `cd apps/api && pnpm start`
   - Environment Variables:
     ```
     DATABASE_URL=<from PostgreSQL service>
     JWT_SECRET=your-secret
     NODE_ENV=production
     PORT=4312
     ```
   - Create

   **C. Frontend:**
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - Name: `tawawunak-web`
     - Root Directory: `apps/web-enterprise`
     - Environment: `Node`
     - Build Command: `cd apps/web-enterprise && pnpm install && pnpm build`
     - Start Command: `cd apps/web-enterprise && pnpm start`
   - Environment Variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://tawawunak-api.onrender.com
     ```
   - Create

4. **Run Migrations:**
   - Go to API service → Shell
   - Run: `cd apps/api && pnpm prisma migrate deploy`

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed (Vercel/Render)
- [ ] Backend deployed (Railway/Render)
- [ ] Database created and connected
- [ ] Migrations run
- [ ] Environment variables set
- [ ] Frontend connected to backend URL
- [ ] Test public URLs

---

## Expected URLs After Deployment

- **Frontend:** `https://your-app.vercel.app` or `https://tawawunak-web.onrender.com`
- **Backend:** `https://your-api.up.railway.app` or `https://tawawunak-api.onrender.com`
- **Health Check:** `https://your-api.up.railway.app/health`

---

## Troubleshooting

**Frontend can't connect to backend:**
- Check CORS_ORIGIN matches frontend URL
- Verify NEXT_PUBLIC_API_BASE_URL is correct
- Check backend logs in Railway/Render

**Database connection errors:**
- Verify DATABASE_URL is correct
- Run migrations: `pnpm prisma migrate deploy`
- Check database is running

**Build fails:**
- Check build logs
- Verify root directory is correct
- Ensure all dependencies are in package.json

---

## Time Estimate

- **Vercel + Railway:** ~15 minutes
- **Render (all-in-one):** ~20 minutes

**Fastest:** Vercel + Railway (recommended)

