# Railway Deployment Guide (Easiest & Free)

Railway is the **easiest** platform to deploy your Docker images. It's free to start and requires **zero manual configuration** - just connect your GitHub repo and it auto-deploys!

## Why Railway?

✅ **100% Free** for small projects (500 hours/month free)  
✅ **Zero Configuration** - Auto-detects Docker  
✅ **Automatic Deployments** - Push to GitHub = Auto-deploy  
✅ **Built-in PostgreSQL** - Free database included  
✅ **Free SSL** - HTTPS automatically  
✅ **Custom Domains** - Free subdomain + custom domain support  

## Quick Start (5 minutes)

### Step 1: Push to GitHub

If you haven't already:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub (free)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your TAAWUNAK repository**
6. **Railway auto-detects Docker!** ✨

### Step 3: Add Services

Railway will detect your `docker-compose.prod.yml` or you can add services manually:

#### Add Backend Service:
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repo
3. Railway auto-detects the Dockerfile in `apps/api/Dockerfile`
4. Set **Root Directory**: `apps/api` (if needed)
5. Add environment variables (see below)

#### Add Frontend Service:
1. Click **"+ New"** → **"GitHub Repo"**  
2. Select your repo again
3. Railway auto-detects the Dockerfile in `apps/web-enterprise/Dockerfile`
4. Set **Root Directory**: `apps/web-enterprise` (if needed)
5. Add environment variables (see below)

#### Add Database:
1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates a free PostgreSQL database automatically
3. Copy the `DATABASE_URL` (you'll need it)

### Step 4: Environment Variables

#### Backend Service Variables:
```
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate a random string>
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=https://your-frontend-url.railway.app
S3_ENDPOINT=<your-minio-url-or-use-railway-storage>
S3_ACCESS_KEY=<your-key>
S3_SECRET_KEY=<your-secret>
S3_BUCKET=tawawunak
```

#### Frontend Service Variables:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NODE_ENV=production
```

### Step 5: Deploy!

That's it! Railway will:
- ✅ Build your Docker images automatically
- ✅ Deploy both services
- ✅ Generate public URLs
- ✅ Set up HTTPS
- ✅ Handle restarts automatically

## Free Tier Limits

- **500 hours/month** (enough for 24/7 small apps)
- **$5 free credit** monthly
- **PostgreSQL** included
- **Custom domains** supported

## Pro Tips

1. **Auto-Deploy**: Every push to `main` branch = automatic deployment
2. **Preview Deployments**: Create preview environments for PRs
3. **Logs**: View logs directly in Railway dashboard
4. **Metrics**: Monitor CPU, memory, and network usage
5. **Rollback**: One-click rollback to previous deployments

## Alternative: Render (Also Free & Easy)

If Railway doesn't work, try **Render.com**:

1. Sign up at https://render.com
2. Connect GitHub
3. New → Web Service
4. Select your repo
5. Set:
   - **Build Command**: `docker build -f apps/api/Dockerfile -t backend . && docker run backend`
   - **Start Command**: (auto-detected)
6. Add environment variables
7. Deploy!

## Troubleshooting

**Issue**: Services not connecting
- **Fix**: Use Railway's internal service URLs (e.g., `http://backend:4312`)

**Issue**: Database connection fails
- **Fix**: Use the `DATABASE_URL` from Railway's PostgreSQL service

**Issue**: Frontend can't reach backend
- **Fix**: Set `NEXT_PUBLIC_API_BASE_URL` to your backend's public Railway URL

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect Railway to GitHub
3. ✅ Add services (Backend, Frontend, Database)
4. ✅ Set environment variables
5. ✅ Deploy and share your public URL!

Your app will be live at: `https://your-app.railway.app` 🚀

