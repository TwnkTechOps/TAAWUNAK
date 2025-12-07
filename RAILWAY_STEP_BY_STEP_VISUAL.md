# Railway Step-by-Step Visual Guide

## You're Currently On: API Service Page

You can see:
- Left sidebar with 3 services: next-enterprise, api (selected), web
- Right side showing "api" service details
- Tabs: Deployments, Variables, Metrics, Settings

---

## STEP 1: Configure Backend (API Service) - DO THIS FIRST

### 1.1: Set Root Directory
1. **Click on "Settings" tab** (right side, next to "Variables")
2. **Scroll down** to find "Root Directory" section
3. **Click in the "Root Directory" field**
4. **Type**: `apps/api`
5. **Click "Save"** or press Enter

### 1.2: Set Port
1. **Still in Settings tab**
2. **Find "Port" section**
3. **Set Port to**: `4312`
4. **Click "Save"**

### 1.3: Add Environment Variables
1. **Click on "Variables" tab** (right side)
2. **Click "New Variable"** or **"+ Add"** button
3. **Add these variables ONE BY ONE:**

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: `${{Postgres.DATABASE_URL}}`
   - Click "Add"

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: `HO9i36NuFCmHl9yEaS04ND1MpBgixRV2bACS2blhnKU=`
   - Click "Add"

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click "Add"

   **Variable 4:**
   - Name: `API_PORT`
   - Value: `4312`
   - Click "Add"

   **Variable 5:**
   - Name: `WEB_ORIGIN`
   - Value: `${{next-enterprise.RAILWAY_PUBLIC_DOMAIN}}`
   - Click "Add"

### 1.4: Deploy Backend
1. **Click on "Deploy" tab** (or "Deployments" tab)
2. **Click "Deploy" button** (or it may auto-deploy)
3. **Watch the build progress**

---

## STEP 2: Add PostgreSQL Database

### 2.1: Go to Architecture View
1. **Click the "X" button** (top right) to close the api service details
2. You'll see the Architecture view with all 3 services

### 2.2: Create Database
1. **Click "+ Create" button** (top right of the Architecture view)
2. **A menu will appear**
3. **Click "Database"**
4. **Select "PostgreSQL"**
5. Railway creates it automatically (takes 10-20 seconds)

---

## STEP 3: Configure Frontend (next-enterprise)

### 3.1: Open Frontend Service
1. **In the left sidebar**, click on **"next-enterprise"** service card
2. The service details will open on the right

### 3.2: Set Root Directory
1. **Click "Settings" tab**
2. **Find "Root Directory"**
3. **Set to**: `apps/web-enterprise`
4. **Click "Save"**

### 3.3: Add Environment Variables
1. **Click "Variables" tab**
2. **Click "New Variable"**

   **Variable 1:**
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `${{api.RAILWAY_PUBLIC_DOMAIN}}`
   - Click "Add"

   **Variable 2:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click "Add"

### 3.4: Deploy Frontend
1. **Click "Deploy" tab**
2. **Click "Deploy" button**

---

## STEP 4: Wait for Deployment

1. **Watch the build progress** in the "Deploy" tab
2. **Status will change**: offline → building → online
3. **This takes 5-10 minutes**

---

## STEP 5: Run Database Migrations

**After backend (api) shows "online":**

1. **Click on "api" service** (left sidebar)
2. **Click "Deploy" tab**
3. **Look for "Run Command" or "Shell" button**
4. **Click it**
5. **A terminal will open**
6. **Type this command:**
   ```
   cd apps/api && pnpm prisma migrate deploy
   ```
7. **Press Enter**
8. **Wait for migrations to complete**

---

## STEP 6: Get Your URLs

### 6.1: Backend URL
1. **Click "api" service**
2. **Click "Settings" tab**
3. **Find "Networking" section**
4. **Copy the "Public Domain"** (looks like: `api-production-xxxx.up.railway.app`)

### 6.2: Frontend URL
1. **Click "next-enterprise" service**
2. **Click "Settings" tab**
3. **Find "Networking" section**
4. **Copy the "Public Domain"** (looks like: `next-enterprise-production-xxxx.up.railway.app`)

---

## Visual Checklist

### Backend (api) Service:
- [ ] Root Directory set to `apps/api`
- [ ] Port set to `4312`
- [ ] DATABASE_URL variable added
- [ ] JWT_SECRET variable added
- [ ] NODE_ENV variable added
- [ ] API_PORT variable added
- [ ] WEB_ORIGIN variable added
- [ ] Deployed and showing "online"

### Frontend (next-enterprise) Service:
- [ ] Root Directory set to `apps/web-enterprise`
- [ ] NEXT_PUBLIC_API_BASE_URL variable added
- [ ] NODE_ENV variable added
- [ ] Deployed and showing "online"

### Database:
- [ ] PostgreSQL database created
- [ ] Database is running

### Migrations:
- [ ] Database migrations run successfully

---

## Troubleshooting

**If build fails:**
- Check Root Directory is correct
- Check all environment variables are set
- Look at build logs in "Deploy" tab

**If service stays offline:**
- Check build logs for errors
- Verify Dockerfile exists at correct path
- Make sure all variables are saved

**If database connection fails:**
- Verify DATABASE_URL uses `${{Postgres.DATABASE_URL}}`
- Make sure PostgreSQL service is running
- Run migrations again

---

**Follow these steps one by one, and your app will be live!** 🚀

