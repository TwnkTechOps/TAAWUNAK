# Deployment Guide

This guide covers hosting options for the TAAWUNAK platform, which consists of:
- **Frontend**: Next.js application (`apps/web-enterprise`)
- **Backend**: NestJS API (`apps/api`)
- **Database**: PostgreSQL (via Prisma)

## Recommended Hosting Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - Easiest ⭐

**Frontend (Next.js) on Vercel:**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in CDN and edge functions
- ✅ Zero-config Next.js support
- ✅ Environment variables management

**Steps:**
1. Push code to GitHub/GitLab
2. Connect Vercel to your repository
3. Set root directory to `apps/web-enterprise`
4. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` (your backend URL)
   - Database connection strings
   - Auth secrets

**Backend (NestJS) on Railway or Render:**
- ✅ Easy PostgreSQL setup
- ✅ Automatic deployments
- ✅ Free tier available (with limits)

**Steps:**
1. Connect GitHub repository
2. Set root directory to `apps/api`
3. Add PostgreSQL database
4. Run Prisma migrations
5. Set environment variables

---

### Option 2: DigitalOcean App Platform - All-in-One

**Pros:**
- ✅ Host both frontend and backend together
- ✅ Managed PostgreSQL database
- ✅ Simple deployment process
- ✅ $5/month starter plan

**Steps:**
1. Create App Platform project
2. Add frontend component (Next.js)
3. Add backend component (Node.js)
4. Add managed PostgreSQL database
5. Configure environment variables
6. Deploy

---

### Option 3: AWS (Production-Grade)

**Architecture:**
- **Frontend**: AWS Amplify or CloudFront + S3
- **Backend**: AWS Elastic Beanstalk or ECS
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: S3 for file uploads

**Pros:**
- ✅ Highly scalable
- ✅ Enterprise-grade security
- ✅ Global CDN
- ⚠️ More complex setup

---

### Option 4: Self-Hosted (VPS)

**Recommended Providers:**
- DigitalOcean Droplets ($6/month)
- Linode ($5/month)
- Vultr ($6/month)
- Hetzner (€4/month)

**Steps:**
1. Create Ubuntu VPS
2. Install Node.js, PostgreSQL, Nginx
3. Clone repository
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt

---

## Quick Start: Vercel + Railway (Recommended)

### Frontend on Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd apps/web-enterprise
   vercel
   ```

3. **Configure:**
   - Set build command: `pnpm build`
   - Set output directory: `.next`
   - Add environment variables in Vercel dashboard

### Backend on Railway

1. **Create Railway account** at railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select repository** and set:
   - Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
4. **Add PostgreSQL** service
5. **Set environment variables:**
   ```
   DATABASE_URL=<railway-postgres-url>
   JWT_SECRET=<your-secret>
   NODE_ENV=production
   ```
6. **Run migrations:**
   ```bash
   pnpm prisma migrate deploy
   ```

---

## Environment Variables Checklist

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=4312
CORS_ORIGIN=https://your-app.vercel.app
```

---

## Database Migration

Before deploying, ensure database is migrated:

```bash
cd apps/api
pnpm prisma migrate deploy
pnpm prisma generate
```

---

## Build Commands

### Frontend
```bash
cd apps/web-enterprise
pnpm install
pnpm build
pnpm start
```

### Backend
```bash
cd apps/api
pnpm install
pnpm build
pnpm start
```

---

## Cost Estimates

| Option | Frontend | Backend | Database | Total/Month |
|--------|----------|---------|----------|-------------|
| Vercel + Railway | Free | $5-10 | Included | $5-10 |
| DigitalOcean App | $5 | $5 | $15 | $25 |
| AWS (minimal) | $1 | $10 | $15 | $26+ |
| VPS (self-hosted) | Included | Included | Included | $5-10 |

---

## Recommended for Your Use Case

**For Development/Demo:**
- Vercel (Frontend) - Free
- Railway (Backend + DB) - Free tier or $5/month

**For Production:**
- Vercel (Frontend) - Pro plan if needed
- Railway or DigitalOcean (Backend + DB)
- Consider CDN for static assets

---

## Next Steps

1. Choose your hosting provider
2. Set up database (managed PostgreSQL recommended)
3. Configure environment variables
4. Run Prisma migrations
5. Deploy frontend
6. Deploy backend
7. Test the deployment
8. Set up custom domain (optional)

Need help with a specific provider? Let me know!

