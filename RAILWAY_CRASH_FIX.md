# Fix Railway Service Crash

## Current Status
- ✅ API service: **Online** (working)
- ❌ Frontend service: **Crashed** (needs fixing)

## Step 1: Check Crash Logs

1. **Click on the crashed service** (the one showing "CRASHED" button)
2. **Click "Deploy" tab** (or "Logs" tab)
3. **Scroll down to see the error logs**
4. **Look for red error messages** at the bottom

Common crash reasons:
- Missing environment variables
- Port configuration issue
- Build error
- Runtime error

## Step 2: Common Fixes

### Fix 1: Check Environment Variables

Make sure frontend has:
- ✅ `NEXT_PUBLIC_API_BASE_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}`
- ✅ `NODE_ENV=production`

### Fix 2: Check Port Configuration

1. **Go to Settings tab**
2. **Check Port** is set correctly
3. **For Next.js**, Railway usually auto-detects port
4. **If needed**, set Port to: `4320` or leave empty (auto)

### Fix 3: Check Root Directory

1. **Settings tab**
2. **Root Directory** should be: `apps/web-enterprise`
3. **Save if changed**

### Fix 4: Check Build Logs

1. **Deploy tab**
2. **Look at build logs** (scroll up)
3. **Check for build errors**

## Step 3: Restart Service

### Option A: Quick Restart
1. **Click "Restart" button** (visible in the crashed service view)
2. **Wait for rebuild**

### Option B: Manual Restart
1. **Go to "Deploy" tab**
2. **Click "Redeploy"** or **"Deploy"** button
3. **Select latest commit**
4. **Deploy**

## Step 4: Verify After Restart

1. **Watch the build logs**
2. **Status should change**: crashed → building → online
3. **Check for any new errors**

## Common Crash Causes & Solutions

### Issue: "Port already in use"
**Fix**: Check Port setting, make sure it's unique

### Issue: "Environment variable missing"
**Fix**: Add missing variables in Variables tab

### Issue: "Build failed"
**Fix**: Check Root Directory, verify Dockerfile exists

### Issue: "Module not found"
**Fix**: Check build logs, may need to rebuild

### Issue: "Database connection failed"
**Fix**: Only affects backend, frontend shouldn't need database

## Quick Checklist

- [ ] Checked crash logs for error message
- [ ] Verified environment variables are set
- [ ] Verified Root Directory is correct
- [ ] Checked Port configuration
- [ ] Restarted service
- [ ] Service is building
- [ ] Service shows "online"

## If Still Crashing

1. **Copy the error message** from logs
2. **Check specific error**:
   - Build error? → Fix Dockerfile/build config
   - Runtime error? → Check environment variables
   - Port error? → Fix port configuration
   - Module error? → May need to rebuild

3. **Try redeploying** from a previous working commit

---

**First, check the logs to see what error caused the crash!** 🔍

