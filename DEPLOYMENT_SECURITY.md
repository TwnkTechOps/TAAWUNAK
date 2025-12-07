# Deployment Security & Access Control Guide

## Current Security Status

### ✅ What's Already Secure:

1. **Authentication Required:**
   - Users must login to access protected pages
   - JWT tokens for session management
   - Password hashing (bcrypt)
   - Protected routes check authentication

2. **Role-Based Access Control (RBAC):**
   - Admin, Institution Admin, Researcher roles
   - Different access levels for different users
   - API endpoints protected with JWT guards

3. **API Security:**
   - CORS configured
   - JWT authentication on backend
   - Credentials required for API calls

### ⚠️ What's Public by Default:

**When you deploy to Vercel/Railway:**
- **Frontend URL is PUBLIC** - Anyone with the link can see the login page
- **Backend URL is PUBLIC** - API endpoints are accessible (but protected by auth)
- **Login/Register pages are PUBLIC** - Anyone can try to access them

**This is NORMAL for most web applications!** The security comes from:
- Users must login to access content
- Only authenticated users can see protected pages
- API requires valid JWT tokens

---

## Access Control Options

### Option 1: Public with Authentication (Current Setup) ✅ Recommended

**How it works:**
- Anyone can visit the URL
- Must login to access content
- Different users see different content based on roles

**Best for:**
- Public-facing applications
- Applications where users register themselves
- Demo/presentation purposes

**Security:**
- ✅ Login required for access
- ✅ Role-based permissions
- ✅ API protected with JWT
- ⚠️ Login page is visible to everyone

---

### Option 2: Password Protection (Vercel Pro Feature)

**Add password protection to entire site:**

1. **Vercel Dashboard:**
   - Go to your project → Settings → Deployment Protection
   - Enable "Password Protection"
   - Set a password
   - Only people with password can access the site

**Best for:**
- Private demos
- Client presentations
- Pre-launch testing

**Cost:** Requires Vercel Pro ($20/month)

---

### Option 3: IP Whitelisting (Advanced)

**Restrict access by IP address:**

1. **Vercel:**
   - Use Vercel Pro + Edge Middleware
   - Check IP address before allowing access

2. **Railway/Backend:**
   - Add IP filtering in NestJS middleware
   - Only allow specific IPs

**Best for:**
- Internal company tools
- Restricted access applications

---

### Option 4: Custom Domain + Private Access

**Make it harder to find:**

1. **Use custom domain** (not vercel.app)
   - Example: `app.yourcompany.com`
   - Only share with authorized people

2. **No public listing:**
   - Don't share URLs publicly
   - Only give links to authorized users

**Best for:**
- Private applications
- Internal tools

---

## Recommended Security Setup

### For Demo/Testing:

```env
# Frontend (Vercel)
NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app

# Backend (Railway)
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
DATABASE_URL=<railway-postgres-url>
```

**Access:**
- ✅ Public URL (anyone with link)
- ✅ Login required to access content
- ✅ Role-based permissions

---

### For Production:

1. **Use Custom Domain:**
   - `app.yourcompany.com` instead of `your-app.vercel.app`
   - More professional, harder to guess

2. **Strong Secrets:**
   ```env
   JWT_SECRET=<generate-strong-random-secret>
   # Use: openssl rand -base64 32
   ```

3. **HTTPS Only:**
   - Vercel/Railway provide HTTPS automatically
   - Force HTTPS in settings

4. **Environment Variables:**
   - Never commit secrets to Git
   - Use platform environment variables

5. **Database Security:**
   - Use managed PostgreSQL (Railway/Render)
   - Database not publicly accessible
   - Connection string in environment variables only

6. **API Rate Limiting:**
   - Add rate limiting to prevent abuse
   - Configure in NestJS

---

## Access Levels Explained

### Public Pages (No Login Required):
- `/auth/login` - Login page
- `/auth/register` - Registration page
- Landing page (if exists)

### Protected Pages (Login Required):
- `/dashboard` - User dashboard
- `/projects` - Projects list
- `/academic-output` - Academic content
- `/proposals` - Proposals
- `/communication` - Communication hub
- All other pages under `/(protected)/`

### Admin-Only Pages:
- `/admin/*` - Admin panel
- `/proposals/dashboard` - Decision maker dashboard
- `/proposals/evaluation` - Evaluation dashboard

---

## Security Checklist

### Before Deployment:

- [ ] Generate strong JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN correctly
- [ ] Use HTTPS (automatic on Vercel/Railway)
- [ ] Database credentials in environment variables
- [ ] No secrets in code
- [ ] Test authentication flow

### After Deployment:

- [ ] Test login/logout
- [ ] Verify protected routes require auth
- [ ] Check role-based access works
- [ ] Test API endpoints with/without auth
- [ ] Verify HTTPS is working
- [ ] Check CORS is configured correctly

---

## Making Your App More Private

### Quick Options:

1. **Password Protect (Vercel Pro):**
   - Settings → Deployment Protection
   - Add password
   - Only people with password can access

2. **Use Custom Domain:**
   - More professional
   - Harder to guess
   - Can add additional security

3. **IP Whitelisting (Advanced):**
   - Restrict by IP address
   - Requires Vercel Pro or custom middleware

4. **Private Repository:**
   - Keep code private
   - Only deploy from private repo
   - Don't share deployment URLs publicly

---

## Current Security Summary

**✅ Secure:**
- Authentication required for content
- JWT token-based sessions
- Role-based access control
- API endpoints protected
- HTTPS enabled (automatic)
- Database not publicly accessible

**⚠️ Public:**
- Login/register pages (normal for web apps)
- Frontend URL (anyone with link can see login page)
- Backend URL (but API requires authentication)

**This is the standard setup for web applications!**

---

## FAQ

**Q: Can anyone access my app?**
A: Anyone with the URL can see the login page, but they need valid credentials to access content.

**Q: Is my data safe?**
A: Yes, if you:
- Use strong JWT_SECRET
- Keep database credentials secret
- Use HTTPS (automatic)
- Don't commit secrets to Git

**Q: How do I make it private?**
A: Options:
1. Password protect (Vercel Pro)
2. Use custom domain + don't share URL
3. IP whitelisting (advanced)

**Q: Can I restrict registration?**
A: Yes, you can:
- Disable registration endpoint
- Add invitation-only registration
- Require admin approval

---

## Need More Security?

If you need enterprise-level security:
- Consider AWS with VPC
- Add WAF (Web Application Firewall)
- Implement SSO (Single Sign-On)
- Add audit logging
- Use private networks

For most use cases, the current setup (public URL + authentication) is sufficient and standard practice.

