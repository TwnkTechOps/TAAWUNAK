# 🔧 Fix: "The executable `cd` could not be found" Error

## ❌ Error
```
Container failed to start
The executable `cd` could not be found.
```

## ✅ Solution

**Problem**: Railway config files had `cd` in the start command, but `cd` is a shell builtin, not an executable.

**Fix**: Removed `startCommand` from Railway configs. When using **Dockerfile**, Railway uses the Dockerfile's `CMD` automatically.

---

## 🚀 What I Fixed

1. **Removed `startCommand` from root `railway.json`**
2. **Removed `startCommand` from root `railway.toml`**
3. **Removed `startCommand` from service-specific configs**
4. **Dockerfile already has correct `CMD`**: `["node", "dist/main.js"]`
5. **Dockerfile already sets `WORKDIR`**: `/app/apps/api`

---

## ✅ How It Works Now

**When using Dockerfile:**
- Railway uses the Dockerfile's `CMD` instruction
- No need for `startCommand` in Railway config
- Dockerfile sets `WORKDIR /app/apps/api`
- Dockerfile has `CMD ["node", "dist/main.js"]`
- Everything works automatically!

**When using Nixpacks:**
- Railway auto-detects the start command
- Or you can set it in Railway dashboard (without `cd`)

---

## 🔄 What to Do Now

1. **The fix is already in GitHub** - Railway will auto-deploy
2. **OR manually redeploy**:
   - Go to service → **Deployments** → **Redeploy**
3. **Watch Deploy Logs** - Should see:
   - ✅ Container starts successfully
   - ✅ "API running on http://localhost:4312"
   - ✅ No "cd" errors

---

## 📝 Important Notes

**For Dockerfile deployments:**
- ✅ **DO NOT** set `startCommand` in Railway config
- ✅ Let Dockerfile's `CMD` handle it
- ✅ Dockerfile already has correct `WORKDIR` and `CMD`

**For Nixpacks deployments:**
- ✅ Set Root Directory: `apps/api` or `apps/web-enterprise`
- ✅ Railway auto-detects start command
- ✅ Or set it in dashboard (without `cd`)

---

## ✅ Verification

After redeploy, check **Deploy Logs**:

**Should see:**
- ✅ Container starts
- ✅ No "cd" errors
- ✅ Service runs successfully

**Should NOT see:**
- ❌ "The executable `cd` could not be found"
- ❌ Container failed to start

---

**The fix is pushed to GitHub. Just redeploy!** 🚀

