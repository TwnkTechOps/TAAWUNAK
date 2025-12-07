# How to Start the API Server

## 🚨 Current Issue
The API server is **not running**, which is why you see `ERR_CONNECTION_REFUSED` errors.

---

## ✅ Solution: Start API Server Manually

### **Step 1: Open a Terminal Window**

### **Step 2: Navigate to API Directory**
```bash
cd /Users/svm648/TAAWUNAK/apps/api
```

### **Step 3: Start the API Server**
```bash
pnpm dev
```

### **Step 4: Wait for Startup**
You should see:
```
[Nest] Starting Nest application...
[Nest] Nest application successfully started on http://localhost:4312
```

### **Step 5: Keep Terminal Open**
**Don't close the terminal** - the API server needs to keep running.

---

## 🔍 Verify It's Working

### In Browser:
1. Open: `http://localhost:4312/health`
2. Should see: `{"status":"ok"}` or similar JSON

### In Your App:
1. **Refresh the login page**
2. The `ERR_CONNECTION_REFUSED` errors should **stop**
3. You should be able to **login successfully**

---

## 📍 After API Starts

### Access Payment Gateway:
1. **Login** to the application
2. **Click "Payments"** in the top navigation bar
3. **OR** go to: `http://localhost:4320/payments`

### What You'll See:
- Payment Hub with 6 feature cards
- Quick stats dashboard
- Interactive menu
- Compliance badges

---

## ⚠️ If API Won't Start

### Check 1: Dependencies
```bash
cd apps/api
pnpm install
```

### Check 2: Database Running
```bash
docker ps | grep postgres
# If not running:
docker-compose up -d postgres
```

### Check 3: Prisma Client
```bash
cd apps/api
npx prisma generate
```

### Check 4: Port Available
```bash
lsof -i :4312
# If something is using it:
lsof -ti:4312 | xargs kill -9
```

---

## 🎯 Quick Summary

1. **Open terminal**
2. **Run:** `cd apps/api && pnpm dev`
3. **Wait** for "successfully started" message
4. **Refresh** your browser
5. **Login** and access `/payments`

---

**The API server must be running for the application to work!**

