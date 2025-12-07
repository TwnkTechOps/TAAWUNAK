# How to Access Payment Gateway Module

## 🌐 Where to See the Payment Gateway

### 1. **Main Payment Hub**
- **URL:** `http://localhost:4320/payments`
- **What you'll see:** Interactive hub with 6 payment feature cards
- **Requirements:** Must be logged in

### 2. **Navigation Menu**
- Look for **"Payments"** link in the top navigation bar (when logged in)
- It appears between "Communication" and "Admin" links

### 3. **Individual Feature Pages**
- `/payments/transactions` - View all transactions
- `/payments/wallet` - Digital wallet management
- `/payments/invoices` - Invoice management
- `/payments/refunds` - Refunds & disputes
- `/payments/admin` - Admin dashboard (admin only)

---

## 🚀 Quick Access Steps

1. **Make sure you're logged in:**
   - Go to `http://localhost:4320/auth/login`
   - Login with your credentials

2. **Access Payment Hub:**
   - Click "Payments" in the top navigation
   - OR go directly to `http://localhost:4320/payments`

3. **Explore Features:**
   - Click any feature card to navigate to that section
   - All features are accessible from the hub

---

## ⚠️ If You See Connection Errors

The `ERR_CONNECTION_REFUSED` errors mean the **API server is not running**. 

### To Start the API:

```bash
cd apps/api
pnpm dev
```

The API should run on port `4312`.

### To Start the Frontend (if not running):

```bash
cd apps/web-enterprise
pnpm dev
```

The frontend should run on port `4320`.

---

## 📍 File Locations

### Frontend Pages:
- Main Hub: `apps/web-enterprise/app/(protected)/payments/page.tsx`
- Transactions: `apps/web-enterprise/app/(protected)/payments/transactions/page.tsx`
- Wallet: `apps/web-enterprise/app/(protected)/payments/wallet/page.tsx`
- Invoices: `apps/web-enterprise/app/(protected)/payments/invoices/page.tsx`
- Refunds: `apps/web-enterprise/app/(protected)/payments/refunds/page.tsx`
- Admin: `apps/web-enterprise/app/(protected)/payments/admin/page.tsx`

### Components:
- Hub Component: `apps/web-enterprise/components/payments/PaymentHub.tsx`

### Backend:
- Module: `apps/api/src/modules/payments/`
- Services: `apps/api/src/modules/payments/services/`
- Gateways: `apps/api/src/modules/payments/gateways/`

---

## 🎯 What You'll See

### Payment Hub Page:
- **Header** with "Payment Gateway" title
- **4 Quick Stats Cards:**
  - Total Transactions
  - Wallet Balance (SAR)
  - Pending Invoices
  - Active Disputes
- **6 Feature Cards:**
  - Transactions
  - Digital Wallet
  - Invoices
  - Refunds & Disputes
  - Payment Gateways
  - Admin Dashboard
- **Compliance Notice** showing KSA compliance status

### Each Feature Page:
- Clean, professional UI
- Enterprise-level components
- Placeholder data (for MVP)
- Ready for real data integration

---

## ✅ Next Steps

1. **Start API server** (if not running)
2. **Login** to the application
3. **Click "Payments"** in navigation
4. **Explore** all 6 payment features

---

**Note:** The payment gateway is in **sandbox mode** for MVP. All gateways are placeholders and will be activated when payment processing is needed.

