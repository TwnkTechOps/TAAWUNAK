# 🚀 Deploy Now - Step by Step Guide

Follow these steps to deploy your application and get public URLs in 15 minutes!

## Prerequisites Check

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Code pushed to GitHub repository
- [ ] Vercel account (we'll create it)
- [ ] Railway account (we'll create it)

---

## Step 1: Push Code to GitHub (5 minutes)

### If you don't have a GitHub repo yet:

1. **Go to:** https://github.com/new
2. **Create new repository:**
   - Repository name: `tawawunak` (or your choice)
   - Make it **Private** (recommended) or Public
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code:**
   ```bash
   cd /Users/svm648/TAAWUNAK
   git init  # if not already a git repo
   git add .
   git commit -m "Initial commit - ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tawawunak.git
   git push -u origin main
   ```

### If you already have a GitHub repo:

```bash
cd /Users/svm648/TAAWUNAK
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

1. **Go to:** https://vercel.com/signup
2. **Sign up with GitHub** (click "Continue with GitHub")
3. **Authorize Vercel** to access your repositories
4. **Click "Add New Project"**
5. **Import your repository:**
   - Find `tawawunak` (or your repo name)
   - Click "Import"
6. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** Click "Edit" → Set to `apps/web-enterprise`
   - **Build Command:** Leave default (or set to: `cd ../.. && pnpm install && cd apps/web-enterprise && pnpm build`)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `pnpm install` (or leave default)
7. **Environment Variables:**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://your-api.up.railway.app` (we'll update this after backend is deployed)
   - For now, leave it empty or use a placeholder
8. **Click "Deploy"**
9. **Wait 2-3 minutes** for build to complete
10. **Copy your frontend URL:** `https://your-app.vercel.app` ✅

---

## Step 3: Deploy Backend to Railway (5 minutes)

1. **Go to:** https://railway.app/signup
2. **Sign up with GitHub** (click "Continue with GitHub")
3. **Authorize Railway** to access your repositories
4. **Click "New Project"**
5. **Select "Deploy from GitHub repo"**
6. **Choose your repository** (`tawawunak`)
7. **Add PostgreSQL Database:**
   - Click **"+ New"** button
   - Select **"Database"** → **"PostgreSQL"**
   - Railway will create it automatically
   - Wait for it to provision (30 seconds)
8. **Configure API Service:**
   - Click on your repository service
   - Go to **"Settings"** tab
   - **Root Directory:** Set to `apps/api`
   - **Build Command:** `pnpm install && pnpm prisma generate && pnpm build`
   - **Start Command:** `pnpm start`
9. **Set Environment Variables:**
   - Go to **"Variables"** tab
   - Click **"+ New Variable"**
   - Add these variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-strong-secret-key-change-this-in-production
     NODE_ENV=production
     PORT=4312
     CORS_ORIGIN=https://your-app.vercel.app
     ```
   - Replace `your-app.vercel.app` with your actual Vercel URL from Step 2
10. **Generate Domain:**
    - Go to **"Settings"** → **"Generate Domain"**
    - Railway will create a URL like: `your-api.up.railway.app`
    - **Copy this URL** ✅
11. **Run Database Migrations:**
    - Go to **"Deployments"** tab
    - Wait for first deployment to complete
    - Click on the deployment → **"View Logs"**
    - In a new terminal, run:
      ```bash
      cd /Users/svm648/TAAWUNAK/apps/api
      pnpm prisma migrate deploy
      ```
    - OR add to Railway build command (already done above)

---

## Step 4: Connect Frontend to Backend (2 minutes)

1. **Go back to Vercel**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Update `NEXT_PUBLIC_API_BASE_URL`:**
   - Click on the variable
   - Change value to: `https://your-api.up.railway.app` (from Railway)
   - Save
4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment → **"Redeploy"**
   - Wait for redeploy to complete

---

## Step 5: Test Your Deployment (1 minute)

1. **Open your frontend URL:** `https://your-app.vercel.app`
2. **Test backend:** `https://your-api.up.railway.app/health`
3. **Try logging in:**
   - If you have test users, try logging in
   - If not, register a new account

---

## Troubleshooting

### Frontend can't connect to backend:
- Check `NEXT_PUBLIC_API_BASE_URL` in Vercel matches Railway URL
- Check CORS_ORIGIN in Railway matches Vercel URL
- Check Railway logs for errors

### Database errors:
- Make sure migrations ran: `pnpm prisma migrate deploy`
- Check DATABASE_URL is correct in Railway
- Check Railway PostgreSQL service is running

### Build fails:
- Check build logs in Vercel/Railway
- Verify root directory is correct
- Check all dependencies are in package.json

---

## Your Public URLs

After deployment, you'll have:

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-api.up.railway.app`
- **Health Check:** `https://your-api.up.railway.app/health`

---

## Next Steps

1. ✅ Test login/registration
2. ✅ Create admin user (if needed)
3. ✅ Test protected routes
4. ✅ Set up custom domain (optional)
5. ✅ Add password protection (optional, Vercel Pro)

---

## Need Help?

If you get stuck at any step, let me know and I'll help you troubleshoot!

