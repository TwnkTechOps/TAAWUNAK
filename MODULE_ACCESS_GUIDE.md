# Module Access Guide 📍

## How to Access the Modules

### 🔐 Prerequisites
1. **You must be logged in** - Both modules are protected routes
2. **Login URL**: `http://localhost:4320/auth/login`
3. **After login**, you'll see navigation links in the top bar

---

## 📄 Research Paper Management Module

### Navigation Path:
1. **Top Navigation Bar** → Click **"Papers"** link
2. Or directly visit: `http://localhost:4320/papers`

### Available Pages:

| Page | URL | Description |
|------|-----|-------------|
| **Paper Listing** | `/papers` | View all papers with search & filters |
| **Submit Paper** | `/papers/new` | Create and submit a new research paper |
| **Paper Details** | `/papers/[id]` | View paper details, stats, and actions |
| **Versions** | `/papers/[id]/versions` | Manage paper versions and history |
| **Reviews** | `/papers/[id]/reviews` | Assign and manage peer reviews |
| **Citations** | `/papers/[id]/citations` | Add and view citations |
| **Collaborators** | `/papers/[id]/collaborators` | Manage paper collaborators |
| **Plagiarism Check** | `/papers/[id]/plagiarism` | Run plagiarism similarity check |

### Quick Access from Paper Details:
When viewing a paper (`/papers/[id]`), you'll see action buttons for:
- Versions
- Reviews
- Citations
- Collaborators
- Plagiarism Check

---

## 👥 Inclusive R&D Participation Module

### Navigation Path:
1. **Top Navigation Bar** → Click **"Participation"** link
2. Or directly visit: `http://localhost:4320/participation`

### Available Pages:

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/participation` | Main dashboard with stats and participants |
| **Quota Management** | `/participation/quota` | View and manage participation quotas |
| **Invitations** | `/participation/invitations` | Send and manage invitations |
| **Analytics** | `/participation/analytics` | View participation analytics |
| **Suggestions** | `/participation/suggestions` | View suggested projects to join |

### Quick Access from Dashboard:
The participation dashboard has quick action cards linking to:
- Manage Quota
- Invitations
- Suggestions

---

## 🎯 Navigation Bar Location

Both modules are accessible from the **top navigation bar** (Topbar component):

```
[Logo] [Dashboard] [Projects] [Funding] [Proposals] [Papers] [Communication] [Payments] [Participation] [Admin]
                                                                     ↑                    ↑
                                                          Research Papers          R&D Participation
```

### Topbar Component Location:
- File: `apps/web-enterprise/components/Nav/Topbar.tsx`
- Lines: ~59 (Papers link), ~60 (Participation link)

---

## 🚀 Quick Start

1. **Start the servers** (if not running):
   ```bash
   # Terminal 1: Backend
   cd apps/api
   pnpm dev
   
   # Terminal 2: Frontend
   cd apps/web-enterprise
   pnpm dev
   ```

2. **Login**:
   - Go to: `http://localhost:4320/auth/login`
   - Enter your credentials

3. **Access Modules**:
   - Click **"Papers"** in the top nav → Research Paper Management
   - Click **"Participation"** in the top nav → R&D Participation

---

## 📁 File Locations

### Frontend Pages:
```
apps/web-enterprise/app/[locale]/(protected)/
├── papers/
│   ├── page.tsx                    # Main listing
│   ├── new/page.tsx                 # Submit paper
│   └── [id]/
│       ├── page.tsx                 # Details
│       ├── versions/page.tsx        # Versions
│       ├── reviews/page.tsx         # Reviews
│       ├── citations/page.tsx       # Citations
│       ├── collaborators/page.tsx   # Collaborators
│       └── plagiarism/page.tsx      # Plagiarism
└── participation/
    ├── page.tsx                     # Dashboard
    ├── quota/page.tsx               # Quota
    ├── invitations/page.tsx         # Invitations
    ├── analytics/page.tsx            # Analytics
    └── suggestions/page.tsx         # Suggestions
```

### Backend Services:
```
apps/api/src/modules/
├── papers/
│   ├── papers.service.ts           # Paper business logic
│   ├── papers.controller.ts         # API endpoints
│   └── papers.module.ts            # Module definition
└── participation/
    ├── participation.service.ts     # Participation business logic
    ├── participation.controller.ts  # API endpoints
    └── participation.module.ts     # Module definition
```

---

## 🔍 Finding the Navigation Links

The navigation links are defined in:
- **File**: `apps/web-enterprise/components/Nav/Topbar.tsx`
- **Lines**: 
  - Papers: ~59
  - Participation: ~60

Both links are visible when you're **authenticated** and have the appropriate role (Researcher, Admin, or Institution Admin).

---

## ✅ Verification Checklist

- [ ] Frontend server running on `http://localhost:4320`
- [ ] Backend API running on `http://localhost:4312`
- [ ] Logged in successfully
- [ ] Can see "Papers" link in top navigation
- [ ] Can see "Participation" link in top navigation
- [ ] Can access `/papers` page
- [ ] Can access `/participation` page

If any of these fail, check:
1. Both servers are running
2. You're logged in
3. Your user role has access (Researcher, Admin, or Institution Admin)

