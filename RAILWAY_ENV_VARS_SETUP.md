# 🔐 Railway Environment Variables Setup Guide

## 🎯 Quick Fix for Current Error

**Error**: `Environment variable not found: DATABASE_URL`

**Fix**: Set `DATABASE_URL` in your backend services (see below)

---

## 📋 Required Environment Variables

### Backend Service ("api" or "web")

**Go to service → Variables tab → Add these:**

| Variable Name | Value | Notes |
|-------------|-------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Use Railway variable reference |
| `JWT_SECRET` | `your-random-secret-key` | Generate a random string |
| `API_PORT` | `4312` | Port number |
| `NODE_ENV` | `production` | Environment |

---

### Frontend Service ("next-enterprise")

**Go to service → Variables tab → Add these:**

| Variable Name | Value | Notes |
|-------------|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend-url.railway.app` | Backend public URL |
| `NODE_ENV` | `production` | Environment |
| `PORT` | `4320` | Port number |

---

## 🔧 How to Set Variables in Railway

### Method 1: Using Railway Variable Reference (Recommended)

1. **Go to service** → **"Variables" tab**
2. **Click "+ New Variable"**
3. **Name**: Type the variable name (e.g., `DATABASE_URL`)
4. **Value**: Click the dropdown → Select from available services
   - For `DATABASE_URL`: Select `${{Postgres.DATABASE_URL}}`
   - This automatically links to your PostgreSQL service
5. **Click "Add"**

### Method 2: Manual Entry

1. **Go to service** → **"Variables" tab**
2. **Click "+ New Variable"**
3. **Name**: Type the variable name
4. **Value**: Type or paste the value
5. **Click "Add"**

---

## 🔗 Linking Services with Variables

Railway allows you to reference variables from other services:

**Syntax**: `${{ServiceName.VariableName}}`

**Examples**:
- `${{Postgres.DATABASE_URL}}` - Database connection from PostgreSQL service
- `${{api.RAILWAY_PUBLIC_DOMAIN}}` - Public URL from API service

**Benefits**:
- ✅ Automatically updates if source service changes
- ✅ No need to manually copy/paste values
- ✅ Secure - values are managed by Railway

---

## 📝 Step-by-Step: Complete Setup

### 1. Set Backend Variables

**For "api" service:**

1. Go to **"api"** → **Variables**
2. Add:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   JWT_SECRET = generate-random-string-here
   API_PORT = 4312
   NODE_ENV = production
   ```
3. **Save**

### 2. Get Backend URL

1. Go to **"api"** → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `api-production-xxxx.up.railway.app`)

### 3. Set Frontend Variables

**For "next-enterprise" service:**

1. Go to **"next-enterprise"** → **Variables**
2. Add:
   ```
   NEXT_PUBLIC_API_BASE_URL = https://api-production-xxxx.up.railway.app
   NODE_ENV = production
   PORT = 4320
   ```
   *(Use the backend URL from step 2)*
3. **Save**

### 4. Redeploy Services

1. Go to each service → **Deployments** → **Redeploy**
2. Watch logs to verify they start successfully

---

## ✅ Verification Checklist

- [ ] `DATABASE_URL` set in backend service(s)
- [ ] `JWT_SECRET` set in backend service(s)
- [ ] `API_PORT` set in backend service(s)
- [ ] `NODE_ENV=production` set in all services
- [ ] `NEXT_PUBLIC_API_BASE_URL` set in frontend
- [ ] Backend has public domain
- [ ] Frontend has public domain
- [ ] All services redeployed
- [ ] No errors in Deploy Logs

---

## 🎉 Success!

Once all variables are set and services are redeployed:
- ✅ Backend connects to database
- ✅ Frontend connects to backend
- ✅ All services running
- ✅ Application is live!

---

**Need help?** Check `FIX_DATABASE_URL_ERROR.md` for detailed troubleshooting.

