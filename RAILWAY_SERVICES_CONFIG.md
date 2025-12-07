# Railway Services Configuration Guide

## Current Status
Railway has detected 3 services from your repository:
1. **next-enterprise** - Frontend (offline)
2. **api** - Backend (offline)
3. **web** - Additional service (offline)

## Step 1: Configure Each Service

### Service 1: Backend (api)
1. **Click on the "api" service card**
2. Go to **"Settings"** tab
3. **Root Directory**: Set to `apps/api`
4. **Build Command**: Leave default (Railway detects Dockerfile)
5. **Start Command**: Leave default
6. **Port**: Set to `4312`

**Environment Variables** (Settings → Variables):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string>
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}
```

### Service 2: Frontend (next-enterprise)
1. **Click on the "next-enterprise" service card**
2. Go to **"Settings"** tab
3. **Root Directory**: Set to `apps/web-enterprise`
4. **Build Command**: Leave default (Railway detects Dockerfile)
5. **Start Command**: Leave default
6. **Port**: Set to `4320` (or leave default)

**Environment Variables** (Settings → Variables):
```
NEXT_PUBLIC_API_BASE_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

### Service 3: Web (if needed)
- This might be a duplicate or unused service
- You can delete it if not needed, or configure it separately

## Step 2: Add PostgreSQL Database

1. Click **"+ Create"** button (top right of Architecture view)
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway creates it automatically
5. **Copy the DATABASE_URL** from the database service

## Step 3: Generate JWT Secret

Run this command locally to generate a secure JWT secret:
```bash
openssl rand -base64 32
```

Or use this online tool: https://generate-secret.vercel.app/32

## Step 4: Set Environment Variables

### For Backend (api) Service:
1. Click on **"api"** service
2. Go to **"Variables"** tab
3. Add each variable:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET` = `<your-generated-secret>`
   - `NODE_ENV` = `production`
   - `API_PORT` = `4312`
   - `WEB_ORIGIN` = `${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}`

### For Frontend (next-enterprise) Service:
1. Click on **"next-enterprise"** service
2. Go to **"Variables"** tab
3. Add:
   - `NEXT_PUBLIC_API_BASE_URL` = `${{api.RAILWAY_PUBLIC_DOMAIN}}`
   - `NODE_ENV` = `production`

## Step 5: Deploy Services

After configuring:
1. Railway will automatically start building
2. Watch the **"Deploy"** tab for build progress
3. Services will go from "offline" → "building" → "online"

## Step 6: Run Database Migrations

After backend is deployed:
1. Go to **"api"** service
2. Click **"Deploy"** tab
3. Click **"Run Command"** or **"Shell"**
4. Run:
   ```bash
   cd apps/api && pnpm prisma migrate deploy
   ```

## Troubleshooting

**Service stays offline:**
- Check build logs in "Deploy" tab
- Verify Root Directory is correct
- Check environment variables

**Build fails:**
- Check Dockerfile paths
- Verify all dependencies in package.json
- Check build logs for specific errors

**Database connection fails:**
- Verify DATABASE_URL is set correctly
- Make sure PostgreSQL service is running
- Check database migrations ran successfully

## Quick Checklist

- [ ] Configured "api" service (Root: `apps/api`)
- [ ] Configured "next-enterprise" service (Root: `apps/web-enterprise`)
- [ ] Added PostgreSQL database
- [ ] Set all environment variables
- [ ] Generated JWT_SECRET
- [ ] Services are building/deploying
- [ ] Ran database migrations
- [ ] Services are online!

---

**Your app will be live once all services show "online"!** 🚀

