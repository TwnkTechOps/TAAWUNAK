# Complete Railway Deployment Guide

## Current Status
✅ You've upgraded Railway - now you can deploy services!
✅ Railway detected your repository: `TwnkTechOps/TAAWUNAK`
✅ 3 services detected: api, next-enterprise, web

## Step-by-Step Setup

### Step 1: Configure Backend (api) Service

1. **Click on "api" service** (already selected)
2. **Go to "Settings" tab**
3. **Set Root Directory**: `apps/api`
4. **Set Port**: `4312`
5. **Go to "Variables" tab** and add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=HO9i36NuFCmHl9yEaS04ND1MpBgixRV2bACS2blhnKU=
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}
```

6. **Click "Deploy" tab**
7. **Click "Deploy" button** (or it will auto-deploy)

### Step 2: Configure Frontend (next-enterprise) Service

1. **Click on "next-enterprise" service** (in left sidebar)
2. **Go to "Settings" tab**
3. **Set Root Directory**: `apps/web-enterprise`
4. **Set Port**: `4320` (or leave default)
5. **Go to "Variables" tab** and add:

```
NEXT_PUBLIC_API_BASE_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

6. **Click "Deploy" tab**
7. **Click "Deploy" button**

### Step 3: Add PostgreSQL Database

1. **Click "+ Create" button** (top right of Architecture view)
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. Railway creates it automatically
5. **Copy the DATABASE_URL** (you'll need it, but Railway auto-fills it)

### Step 4: Delete Unused Service (Optional)

If "web" service is not needed:
1. Click on "web" service
2. Settings → Delete Service

### Step 5: Deploy Services

After configuring:
1. Railway will automatically start building
2. Watch the "Deploy" tab for progress
3. Services will go: offline → building → online

### Step 6: Run Database Migrations

After backend is deployed and online:

1. **Go to "api" service**
2. **Click "Deploy" tab**
3. **Click "Run Command"** or **"Shell"** button
4. **Run this command:**
   ```bash
   cd apps/api && pnpm prisma migrate deploy
   ```

Or use Railway CLI:
```bash
railway run --service api "cd apps/api && pnpm prisma migrate deploy"
```

## Environment Variables Reference

### Backend (api) Service:
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-filled from PostgreSQL |
| `JWT_SECRET` | `HO9i36NuFCmHl9yEaS04ND1MpBgixRV2bACS2blhnKU=` | Generated secret |
| `NODE_ENV` | `production` | |
| `API_PORT` | `4312` | |
| `WEB_ORIGIN` | `${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}` | Auto-filled from frontend |

### Frontend (next-enterprise) Service:
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `${{api.RAILWAY_PUBLIC_DOMAIN}}` | Auto-filled from backend |
| `NODE_ENV` | `production` | |

## Railway Service References

Railway uses `${{ServiceName.VARIABLE}}` syntax:
- `${{Postgres.DATABASE_URL}}` - Gets database URL
- `${{api.RAILWAY_PUBLIC_DOMAIN}}` - Gets backend public URL
- `${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}` - Gets frontend public URL

## Quick Checklist

- [ ] Configured "api" service (Root: `apps/api`, Port: `4312`)
- [ ] Configured "next-enterprise" service (Root: `apps/web-enterprise`)
- [ ] Added PostgreSQL database
- [ ] Set all environment variables
- [ ] Services are building/deploying
- [ ] Ran database migrations
- [ ] Services show "online" status
- [ ] Got public URLs

## After Deployment

1. **Get your URLs:**
   - Backend: Go to "api" service → Settings → Networking → Public Domain
   - Frontend: Go to "next-enterprise" service → Settings → Networking → Public Domain

2. **Test your app:**
   - Frontend URL: `https://your-frontend.railway.app`
   - Backend API: `https://your-backend.railway.app/health`

3. **Set up custom domain** (optional):
   - Settings → Networking → Custom Domain

## Troubleshooting

**Service stays offline:**
- Check build logs in "Deploy" tab
- Verify Root Directory is correct
- Check environment variables are set

**Build fails:**
- Check Dockerfile exists at correct path
- Verify all dependencies
- Check build logs for specific errors

**Database connection fails:**
- Verify DATABASE_URL uses `${{Postgres.DATABASE_URL}}`
- Make sure PostgreSQL service is running
- Run migrations: `cd apps/api && pnpm prisma migrate deploy`

---

**Your app will be live once services show "online"!** 🚀

