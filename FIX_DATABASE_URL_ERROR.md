# 🔧 Fix: DATABASE_URL Missing Error

## ❌ Error
```
PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL.
```

## ✅ Solution

The backend services are starting successfully, but they need the `DATABASE_URL` environment variable set in Railway.

---

## 🚀 Step-by-Step Fix

### Step 1: Get PostgreSQL Connection String

1. **Go to Railway Dashboard**
2. **Click on your PostgreSQL service** (usually named "Postgres" or "PostgreSQL")
3. **Click "Variables" tab**
4. **Find `DATABASE_URL`** or `POSTGRES_URL`
5. **Copy the entire connection string** (it looks like: `postgresql://user:password@host:port/database`)

**OR** if you don't see it:
- Go to **"Connect"** or **"Data"** tab
- Look for **"Connection String"** or **"DATABASE_URL"**
- Copy it

---

### Step 2: Set DATABASE_URL in Backend Services

You need to set `DATABASE_URL` in **BOTH** backend services:

#### For "api" service:

1. **Go to "api" service** → **"Variables" tab**
2. **Click "+ New Variable"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste the connection string from Step 1
5. **Click "Add"**

#### For "web" service (if it's also a backend):

1. **Go to "web" service** → **"Variables" tab**
2. **Click "+ New Variable"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste the connection string from Step 1
5. **Click "Add"**

---

### Step 3: Use Railway Variable Reference (Recommended)

Instead of copying the connection string, you can use Railway's variable reference:

1. **Go to "api" service** → **"Variables" tab**
2. **Click "+ New Variable"**
3. **Name**: `DATABASE_URL`
4. **Value**: Click the dropdown and select **`${{Postgres.DATABASE_URL}}`**
   - Or type: `${{Postgres.DATABASE_URL}}`
   - Replace `Postgres` with your actual PostgreSQL service name
5. **Click "Add"**

This automatically links to your PostgreSQL service!

---

### Step 4: Set Other Required Variables

While you're in the Variables tab, make sure these are also set:

**For "api" service:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-random-secret-key-here
API_PORT=4312
NODE_ENV=production
```

**For "web" service (if backend):**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-random-secret-key-here
API_PORT=4312
NODE_ENV=production
```

---

### Step 5: Redeploy Services

After setting the variables:

1. **Go to "api" service** → **"Deployments" tab**
2. **Click "Redeploy"**
3. **Watch Deploy Logs** - Should see:
   - ✅ No "DATABASE_URL" errors
   - ✅ Prisma connects successfully
   - ✅ "API running on http://localhost:4312"

4. **Repeat for "web" service** (if it's a backend)

---

## ✅ Verify It's Fixed

After redeploying, check **Deploy Logs**:

**Should see:**
- ✅ No "Environment variable not found: DATABASE_URL" errors
- ✅ Prisma client initializes successfully
- ✅ API starts: "API running on http://localhost:4312"
- ✅ Service stays running (green status)

**Should NOT see:**
- ❌ "PrismaClientInitializationError"
- ❌ "Environment variable not found"
- ❌ Service crashing immediately

---

## 🔍 How to Find Your PostgreSQL Service Name

1. **Go to Railway Dashboard**
2. **Look at the left sidebar** - you'll see your services listed
3. **Find the PostgreSQL service** (usually has a database icon)
4. **Note the exact name** (e.g., "Postgres", "PostgreSQL", "postgres")
5. **Use that name in the variable reference**: `${{YourServiceName.DATABASE_URL}}`

---

## 💡 Quick Reference

**Variable Name**: `DATABASE_URL`  
**Variable Value**: `${{Postgres.DATABASE_URL}}` (or your PostgreSQL service name)  
**Where to Set**: Service → Variables tab → + New Variable

---

## 🐛 Still Having Issues?

1. **Check service name**: Make sure the PostgreSQL service name matches in `${{ServiceName.DATABASE_URL}}`
2. **Check Variables tab**: Verify `DATABASE_URL` is actually set (should show in the list)
3. **Redeploy**: After setting variables, always redeploy the service
4. **Check logs**: Look for any other errors in Deploy Logs

---

**Once `DATABASE_URL` is set, your services should start successfully!** 🎉

