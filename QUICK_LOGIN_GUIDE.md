# Quick Login Guide - Fix 401 Errors

## ✅ The 401 Errors Are NORMAL

The errors you're seeing are **expected behavior**:

1. **`/auth/me` returns 401** = You're not logged in yet (this is normal!)
2. **`/auth/login` returns 401** = Wrong credentials OR missing OTP code

---

## 🚀 How to Login Successfully

### Step 1: Go to Login Page
Navigate to: `http://localhost:4320/auth/login`

### Step 2: Enter Credentials

**Test Account (Already Created):**
- Email: `test@example.com`
- Password: `test123`

**OR Register New Account:**
- Go to: `http://localhost:4320/auth/register`
- Fill in your details
- Click "Register"

### Step 3: Handle OTP (If Required)

If you see a message asking for OTP:
1. Look for the **demo OTP code** in the message (e.g., `177635`)
2. The OTP field should be **auto-filled** for you
3. Click "Login" again

### Step 4: Success!

After successful login:
- You'll be redirected to `/dashboard`
- The 401 errors will **stop appearing**
- You can now access all communication features

---

## 🔍 Understanding the Errors

### `/auth/me` - 401 Unauthorized
**What it means:** "You're not logged in"
**Is it an error?** NO - This is normal!
**What happens:** The app checks if you're logged in on every page load

### `/auth/login` - 401 Unauthorized  
**What it means:** "Login failed - wrong credentials or missing OTP"
**Is it an error?** YES - But fixable!
**Solutions:**
- Check your email/password
- Enter the OTP code if required
- Register a new account if needed

---

## 🧪 Test Login Flow

### Test 1: Check if API is Running
```bash
curl http://localhost:4312/auth/me
# Expected: 401 Unauthorized (normal if not logged in)
```

### Test 2: Login with OTP
```bash
# First attempt (will require OTP)
curl -X POST http://localhost:4312/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Response will include: "demoOtp": "XXXXXX"

# Second attempt with OTP
curl -X POST http://localhost:4312/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","otp":"XXXXXX"}'

# Expected: 201 Created with token
```

---

## 💡 Tips

1. **The OTP is auto-filled** - The login page automatically fills the OTP code for you in demo mode
2. **Check the message box** - The OTP code is shown in the blue message box
3. **401 on `/auth/me` is OK** - This is just the app checking your login status
4. **After login, errors stop** - Once authenticated, all 401s will disappear

---

## 🎯 Quick Checklist

- [ ] Frontend running on `http://localhost:4320`
- [ ] Backend running on `http://localhost:4312`
- [ ] Go to `/auth/login`
- [ ] Enter email and password
- [ ] Enter OTP if shown
- [ ] Click "Login"
- [ ] Should redirect to `/dashboard`
- [ ] 401 errors should stop

---

**Remember:** The 401 errors on `/auth/me` are **informational only** - they don't break anything. Once you login successfully, they'll disappear!

