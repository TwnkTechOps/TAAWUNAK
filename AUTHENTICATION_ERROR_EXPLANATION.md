# Understanding the 401 Unauthorized Errors

## 🔍 What's Happening

The 401 errors you're seeing are **NORMAL and EXPECTED** behavior. Here's why:

### 1. `/auth/me` Endpoint (401 is Normal)

**What it does:**
- Checks if you're currently logged in
- Returns your user information if authenticated
- Returns 401 if NOT authenticated

**Why you see 401:**
- The `useAuth` hook calls `/auth/me` on every page load
- If you're not logged in, it returns 401 (Unauthorized)
- This is **expected behavior** - it means "you need to log in"

**This is NOT an error** - it's the system checking your authentication status.

### 2. `/auth/login` Endpoint (401 means invalid credentials)

**What it does:**
- Authenticates you with email and password
- Returns 401 if credentials are wrong or user doesn't exist

**Why you might see 401:**
- Wrong email/password
- User account doesn't exist yet
- Account is suspended

---

## ✅ How to Fix

### Step 1: Register a New Account

If you don't have an account yet, register first:

1. Go to: `http://localhost:4320/auth/register`
2. Fill in:
   - Full Name
   - Email
   - Password
3. Click "Register"
4. You'll be automatically logged in

### Step 2: Login

If you already have an account:

1. Go to: `http://localhost:4320/auth/login`
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the dashboard

### Step 3: Test User Credentials

I've created a test user for you:

- **Email:** `test@example.com`
- **Password:** `test123`

You can use these credentials to login and test the communication features.

---

## 🛠️ Technical Details

### Why 401s Appear in Console

The `useAuth` hook runs on every page load and checks authentication status:

```typescript
// This runs automatically on page load
useEffect(() => {
  refreshAuth(); // Calls /auth/me
}, []);
```

When you're not logged in:
- `/auth/me` returns 401
- Hook sets `user = null`
- This is **normal behavior**

### Suppressing Console Errors (Optional)

If you want to hide these expected 401s from the console, the frontend now handles them silently. The errors won't break anything - they're just informational.

---

## 🧪 Testing Authentication

### Test 1: Check if API is Running
```bash
curl http://localhost:4312/auth/me
# Should return: 401 Unauthorized (expected if not logged in)
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:4312/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpass","fullName":"Your Name"}'
```

### Test 3: Login
```bash
curl -X POST http://localhost:4312/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpass"}' \
  -c cookies.txt
```

### Test 4: Check Auth Status (After Login)
```bash
curl http://localhost:4312/auth/me \
  -b cookies.txt
# Should return: 200 OK with user data
```

---

## 📝 Summary

- ✅ **401 on `/auth/me`** = Normal (means "not logged in")
- ✅ **401 on `/auth/login`** = Wrong credentials or user doesn't exist
- ✅ **Solution:** Register or login with correct credentials
- ✅ **Test User:** `test@example.com` / `test123`

The errors are informational - they don't break the app. Once you login, the 401s will stop appearing.

---

**Next Steps:**
1. Register a new account OR login with test credentials
2. Navigate to `/messaging`, `/forums`, `/meetings`, etc.
3. All features will work once authenticated!

