# Run Database Migration

## ⚠️ Important: Migration Required

The database schema has been updated with new models for:
- Research Paper Management
- Inclusive R&D Participation

**You need to run the migration before the modules will work.**

---

## 🚀 How to Run Migration

### **Option 1: Interactive (Recommended)**
```bash
cd apps/api
npx prisma migrate dev --name add_papers_and_participation
```

This will:
1. Create a new migration file
2. Apply it to your database
3. Regenerate Prisma Client

### **Option 2: If Migration Already Exists**
```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

---

## ✅ After Migration

1. **Restart API Server:**
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Verify Tables Created:**
   ```bash
   # Check if tables exist
   psql -h localhost -p 55432 -U edutech -d edutech -c "\dt" | grep -E "Paper|Participation|RDParticipant|Gender"
   ```

---

## 📋 New Tables Created

**Research Papers:**
- `Paper` (enhanced)
- `PaperVersion`
- `PaperReview`
- `PaperCollaborator`
- `PaperShare`
- `PaperCitation`
- `Patent`

**Inclusive R&D Participation:**
- `ParticipationQuota`
- `GenderQuota`
- `RDParticipant`
- `RDParticipantInvitation`

---

## 🎯 Test After Migration

1. **Papers Module:**
   - Go to `/papers`
   - Click "Submit Paper"
   - Fill form and submit
   - View paper details

2. **Participation Module:**
   - Go to `/participation`
   - View quota dashboard
   - Go to `/participation/quota` to manage quotas

---

**Run the migration now to activate both modules!**

