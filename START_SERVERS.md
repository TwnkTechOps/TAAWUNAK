# How to Start All Servers

## 🚀 Quick Start Commands

### Start API Server (Backend)
```bash
cd apps/api
pnpm dev
```
**Runs on:** `http://localhost:4312`

### Start Frontend Server
```bash
cd apps/web-enterprise
pnpm dev
```
**Runs on:** `http://localhost:4320`

---

## 📍 Access Points

### After Starting Servers:

1. **Frontend:** `http://localhost:4320`
2. **Login:** `http://localhost:4320/auth/login`
3. **Payment Gateway:** `http://localhost:4320/payments` (after login)
4. **Communication Hub:** `http://localhost:4320/communication` (after login)
5. **Dashboard:** `http://localhost:4320/dashboard` (after login)

---

## ✅ Verify Servers Are Running

### Check API:
```bash
curl http://localhost:4312/health
```
Should return: `200 OK`

### Check Frontend:
```bash
curl http://localhost:4320
```
Should return: `200 OK` (HTML content)

---

## 🔧 Troubleshooting

### If API won't start:
1. Check if port 4312 is in use: `lsof -i :4312`
2. Kill existing process: `kill -9 <PID>`
3. Check database is running (PostgreSQL)
4. Run migrations: `cd apps/api && npx prisma migrate dev`

### If Frontend won't start:
1. Check if port 4320 is in use: `lsof -i :4320`
2. Kill existing process: `kill -9 <PID>`
3. Clear Next.js cache: `cd apps/web-enterprise && rm -rf .next`
4. Restart: `pnpm dev`

---

## 📝 Quick Checklist

- [ ] API server running on port 4312
- [ ] Frontend server running on port 4320
- [ ] Database (PostgreSQL) running
- [ ] Can access `http://localhost:4320`
- [ ] Can login successfully
- [ ] Can access `/payments` after login
- [ ] Can access `/communication` after login

---

**Note:** Both servers need to be running for the application to work properly.

