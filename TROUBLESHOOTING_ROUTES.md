# Troubleshooting: Routes Not Showing in Browser

## ✅ Frontend Server Status
- **Frontend:** Running on port 4320 ✅
- **Backend API:** Running on port 4312 ✅

## 🔍 How to Access the Routes

Since we're using `next-intl` with `[locale]` routing, the routes can be accessed in different ways:

### **Option 1: With Locale Prefix (Recommended)**
```
http://localhost:4320/en/papers
http://localhost:4320/en/participation
http://localhost:4320/en/payments/gateways
```

### **Option 2: Without Locale (Default Locale)**
```
http://localhost:4320/papers
http://localhost:4320/participation
http://localhost:4320/payments/gateways
```

### **Option 3: Arabic Locale**
```
http://localhost:4320/ar/papers
http://localhost:4320/ar/participation
```

## 🔐 Authentication Required

**Important:** All these routes are **protected** and require:
1. **You must be logged in** - If not logged in, you'll be redirected to `/auth/login`
2. **Proper user role** - Some routes require admin or institution admin privileges

## 🧪 Testing Steps

1. **Make sure you're logged in:**
   - Go to `http://localhost:4320/auth/login`
   - Login with your credentials

2. **Try accessing the routes:**
   - `http://localhost:4320/papers` (or `/en/papers`)
   - `http://localhost:4320/participation` (admin/institution admin only)
   - `http://localhost:4320/payments/gateways`

3. **Check browser console:**
   - Open DevTools (F12)
   - Check for any errors in Console tab
   - Check Network tab for failed requests

4. **Check if API is responding:**
   - Open DevTools → Network tab
   - Look for requests to `http://localhost:4312/papers`
   - Check if they return 200 or 401 (401 is expected if not logged in)

## 🐛 Common Issues

### **Issue 1: 404 Not Found**
- **Cause:** Route not recognized by Next.js
- **Fix:** Clear `.next` cache and restart:
  ```bash
  cd apps/web-enterprise
  rm -rf .next
  pnpm dev
  ```

### **Issue 2: Redirected to Login**
- **Cause:** Not authenticated
- **Fix:** Login first at `/auth/login`

### **Issue 3: Blank Page**
- **Cause:** JavaScript error or API connection issue
- **Fix:** 
  - Check browser console for errors
  - Verify API is running on port 4312
  - Check Network tab for failed API calls

### **Issue 4: Route Shows but No Data**
- **Cause:** API endpoint not responding or returning empty data
- **Fix:**
  - Check API logs
  - Test API directly: `curl http://localhost:4312/papers` (with auth cookie)
  - Verify database has data

## 🔧 Quick Fixes

### **Clear Cache and Restart:**
```bash
# Stop servers (Ctrl+C)
cd apps/web-enterprise
rm -rf .next
pnpm dev

# In another terminal
cd apps/api
pnpm dev
```

### **Check Route Files Exist:**
```bash
ls -la apps/web-enterprise/app/[locale]/(protected)/papers/
ls -la apps/web-enterprise/app/[locale]/(protected)/participation/
```

### **Verify Navigation Links:**
- Check topbar navigation - links should be visible when logged in
- Click on "Papers" or "Participation" links in the navigation

## 📍 Exact URLs to Try

1. **After Login, try these in order:**
   - `http://localhost:4320/dashboard` (should work)
   - `http://localhost:4320/papers` (should show papers page)
   - `http://localhost:4320/en/papers` (alternative)
   - `http://localhost:4320/participation` (if admin)
   - `http://localhost:4320/payments/gateways` (should work)

2. **If still not working:**
   - Check browser console for specific errors
   - Check Network tab for failed requests
   - Verify you're logged in (check if `/dashboard` works)

---

**If routes still don't show, please share:**
- Browser console errors
- Network tab errors
- What URL you're trying to access
- Whether you're logged in or not

