# API Server Troubleshooting

## 🔴 Current Issue: ERR_CONNECTION_REFUSED

The API server on port `4312` is not running or not accessible.

---

## ✅ Solution: Start the API Server

### Method 1: Terminal Command
```bash
cd apps/api
pnpm dev
```

### Method 2: Check if Already Running
```bash
# Check if API is running
lsof -i :4312

# If nothing shows, start it:
cd apps/api
pnpm dev
```

### Method 3: Kill and Restart
```bash
# Kill any existing process on port 4312
lsof -ti:4312 | xargs kill -9

# Start fresh
cd apps/api
pnpm dev
```

---

## 🔍 Verify API is Running

### Check 1: Port Status
```bash
lsof -i :4312
```
Should show a Node.js process listening on port 4312

### Check 2: Health Endpoint
```bash
curl http://localhost:4312/health
```
Should return: `{"status":"ok"}` or similar

### Check 3: Browser
Open: `http://localhost:4312/health`
Should show JSON response

---

## 📋 What Should Happen

1. **API starts successfully:**
   - You'll see: `Nest application successfully started`
   - Port: `4312`
   - No errors in terminal

2. **Frontend connects:**
   - `ERR_CONNECTION_REFUSED` errors stop
   - Login works
   - All API calls succeed

3. **Payment Gateway accessible:**
   - After login, click "Payments" in navigation
   - All payment features work

---

## ⚠️ Common Issues

### Issue 1: Port Already in Use
```bash
# Find process using port 4312
lsof -i :4312

# Kill it
kill -9 <PID>

# Restart API
cd apps/api
pnpm dev
```

### Issue 2: Database Not Running
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not, start it:
docker-compose up -d postgres
```

### Issue 3: Prisma Client Not Generated
```bash
cd apps/api
npx prisma generate
pnpm dev
```

### Issue 4: Missing Dependencies
```bash
cd apps/api
pnpm install
pnpm dev
```

---

## 🚀 Quick Fix Commands

```bash
# Navigate to API directory
cd apps/api

# Install dependencies (if needed)
pnpm install

# Generate Prisma client (if needed)
npx prisma generate

# Start API server
pnpm dev
```

---

## ✅ Success Indicators

When API is running correctly:
- ✅ Terminal shows: `Nest application successfully started`
- ✅ No `ERR_CONNECTION_REFUSED` errors in browser console
- ✅ `http://localhost:4312/health` returns JSON
- ✅ Login page works
- ✅ Can access `/payments` after login

---

**The API server is starting now. Wait 20-30 seconds, then refresh your browser!**

