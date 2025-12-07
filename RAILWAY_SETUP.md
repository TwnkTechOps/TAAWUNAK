# Railway Deployment for TAAWUNAK

**Repository**: https://github.com/TwnkTechOps/TAAWUNAK

## Quick Deploy Steps

### Step 1: Ensure Code is Pushed to GitHub

```bash
# Check if you have uncommitted changes
git status

# If you have changes, commit and push:
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub (use the same GitHub account that has access to `TwnkTechOps/TAAWUNAK`)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Authorize Railway** to access your GitHub repositories
6. **Search for "TAAWUNAK"** and select `TwnkTechOps/TAAWUNAK`
7. **Railway will auto-detect your Dockerfiles!** ✨

### Step 3: Add Services

Railway will show you options. You need to add **3 services**:

#### Service 1: PostgreSQL Database
1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates it automatically
3. **Copy the `DATABASE_URL`** (you'll need it for the backend)

#### Service 2: Backend (NestJS API)
1. Click **"+ New"** → **"GitHub Repo"**
2. Select `TwnkTechOps/TAAWUNAK` again
3. Railway will detect `apps/api/Dockerfile`
4. **Settings** → **Root Directory**: Set to `apps/api` (if not auto-detected)
5. **Settings** → **Port**: Set to `4312`
6. Add these **Environment Variables**:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string-here>
NODE_ENV=production
API_PORT=4312
WEB_ORIGIN=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
S3_ENDPOINT=https://storage.railway.app
S3_ACCESS_KEY=<your-key>
S3_SECRET_KEY=<your-secret>
S3_BUCKET=tawawunak
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

#### Service 3: Frontend (Next.js)
1. Click **"+ New"** → **"GitHub Repo"**
2. Select `TwnkTechOps/TAAWUNAK` again
3. Railway will detect `apps/web-enterprise/Dockerfile`
4. **Settings** → **Root Directory**: Set to `apps/web-enterprise` (if not auto-detected)
5. **Settings** → **Port**: Set to `4320` (or leave default)
6. Add these **Environment Variables**:

```
NEXT_PUBLIC_API_BASE_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

**Note**: `${{Backend.RAILWAY_PUBLIC_DOMAIN}}` automatically uses your backend service's public URL!

### Step 4: Run Database Migrations

After backend is deployed:

1. Go to **Backend service** → **Settings** → **Deploy**
2. Click **"Deploy"** tab
3. In the **"Run Command"** section, run:
   ```bash
   cd apps/api && pnpm prisma migrate deploy
   ```

Or use Railway's **CLI**:
```bash
railway run --service backend "cd apps/api && pnpm prisma migrate deploy"
```

### Step 5: Get Your URLs

After deployment (usually 2-5 minutes):

1. **Backend URL**: Go to Backend service → **Settings** → **Networking** → Copy the public domain
2. **Frontend URL**: Go to Frontend service → **Settings** → **Networking** → Copy the public domain

Your app will be live at:
- **Frontend**: `https://your-frontend.railway.app`
- **Backend**: `https://your-backend.railway.app`

## Environment Variables Reference

### Backend Service
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-filled from PostgreSQL service |
| `JWT_SECRET` | Random string | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | `production` | |
| `API_PORT` | `4312` | |
| `WEB_ORIGIN` | `${{Frontend.RAILWAY_PUBLIC_DOMAIN}}` | Auto-filled from Frontend service |
| `S3_ENDPOINT` | `https://storage.railway.app` | Or your MinIO URL |
| `S3_ACCESS_KEY` | Your key | |
| `S3_SECRET_KEY` | Your secret | |
| `S3_BUCKET` | `tawawunak` | |

### Frontend Service
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `${{Backend.RAILWAY_PUBLIC_DOMAIN}}` | Auto-filled from Backend service |
| `NODE_ENV` | `production` | |

## Railway Service References

Railway allows services to reference each other using:
- `${{ServiceName.VARIABLE_NAME}}` - Reference another service's variable
- `${{ServiceName.RAILWAY_PUBLIC_DOMAIN}}` - Get another service's public URL

This makes configuration automatic!

## Troubleshooting

### Issue: Services can't connect
- **Fix**: Use Railway's service references (`${{Backend.RAILWAY_PUBLIC_DOMAIN}}`)

### Issue: Database connection fails
- **Fix**: Make sure `DATABASE_URL` uses `${{Postgres.DATABASE_URL}}`
- **Fix**: Run migrations: `railway run --service backend "cd apps/api && pnpm prisma migrate deploy"`

### Issue: Frontend can't reach backend
- **Fix**: Set `NEXT_PUBLIC_API_BASE_URL` to `${{Backend.RAILWAY_PUBLIC_DOMAIN}}`

### Issue: Build fails
- **Fix**: Check Railway logs for specific errors
- **Fix**: Ensure Root Directory is set correctly (`apps/api` or `apps/web-enterprise`)

## Custom Domain (Optional)

1. Go to service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain
4. Railway provides DNS records to add

## Monitoring

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: See deployment history and rollback if needed

## Free Tier Limits

- ✅ **500 hours/month** free compute
- ✅ **$5 credit** monthly
- ✅ **PostgreSQL** included
- ✅ **Unlimited** deployments

## Next Steps After Deployment

1. ✅ Test your frontend URL
2. ✅ Test API endpoints
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring alerts
5. ✅ Share your public URL!

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your repo: https://github.com/TwnkTechOps/TAAWUNAK

---

**Ready to deploy?** Just push to GitHub and Railway will handle the rest! 🚀

