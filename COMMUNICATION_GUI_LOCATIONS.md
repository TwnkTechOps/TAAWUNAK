# Communication & Networking Module - GUI Locations

## 🎨 Frontend Pages Created

All GUI pages are located in: `apps/web-enterprise/app/(protected)/`

### 📍 Page Locations:

```
apps/web-enterprise/app/(protected)/
├── messaging/
│   └── page.tsx          ← Direct Messages & Group Chat
├── forums/
│   └── page.tsx          ← Discussion Forums
├── meetings/
│   └── page.tsx          ← Virtual Meetings
├── events/
│   └── page.tsx          ← Events & Webinars
├── communities/
│   └── page.tsx          ← Community Channels
└── knowledge/
    └── page.tsx          ← Knowledge Articles
```

---

## 🚀 How to Access the GUI

### Step 1: Start the Frontend
```bash
cd apps/web-enterprise
pnpm dev
```

Frontend runs on: `http://localhost:4320` (or your configured port)

### Step 2: Login
1. Navigate to `http://localhost:4320/auth/login`
2. Login with your credentials
3. You'll be redirected to the dashboard

### Step 3: Access Communication Features

Once logged in, you'll see new navigation items in the top menu:

- **Messages** → `/messaging` - Direct messaging and group chats
- **Forums** → `/forums` - Discussion forums
- **Meetings** → `/meetings` - Virtual meetings
- **Events** → `/events` - Events and webinars
- **Communities** → `/communities` - Community channels
- **Knowledge** → `/knowledge` - Knowledge articles

---

## 📱 Direct URLs

After logging in, you can directly access:

- `http://localhost:4320/messaging`
- `http://localhost:4320/forums`
- `http://localhost:4320/meetings`
- `http://localhost:4320/events`
- `http://localhost:4320/communities`
- `http://localhost:4320/knowledge`

---

## 🎯 Features Available in Each Page

### 1. Messages (`/messaging`)
- ✅ View all conversations
- ✅ Switch between Direct Messages and Group Chats
- ✅ Send encrypted messages
- ✅ Real-time message display
- ✅ Unread message indicators
- ✅ Message input with send button

### 2. Forums (`/forums`)
- ✅ Browse all forums
- ✅ Filter by category (AI, Renewable Energy, EdTech, etc.)
- ✅ Search forums
- ✅ View forum statistics (post count)
- ✅ Create new forum button

### 3. Meetings (`/meetings`)
- ✅ View all meetings
- ✅ Filter upcoming meetings
- ✅ Meeting statistics (upcoming, today's, total)
- ✅ Meeting details (time, participants, project link)
- ✅ Join meeting button
- ✅ Schedule meeting button

### 4. Events (`/events`)
- ✅ Browse all events
- ✅ Filter upcoming events
- ✅ Event statistics
- ✅ Event cards with details (date, time, location, type)
- ✅ Registration count
- ✅ Create event button

### 5. Communities (`/communities`)
- ✅ Browse community channels
- ✅ Filter by category
- ✅ Search channels
- ✅ View member and post counts
- ✅ Create channel button

### 6. Knowledge (`/knowledge`)
- ✅ Browse published articles
- ✅ Filter by category
- ✅ Search articles
- ✅ View article statistics (views, tags)
- ✅ Write article button

---

## 🎨 UI Components Used

All pages use the **Enterprise Card Components** we created earlier:
- `EnterpriseCard` - Main card container
- `EnterpriseKpiCard` - Statistics cards
- `EnterpriseCardHeader` - Card headers
- `EnterpriseCardTitle` - Card titles
- `EnterpriseCardContent` - Card content

---

## 🔒 Security

All pages are protected with:
- `ProtectedRoute` component - Requires authentication
- Automatic redirect to login if not authenticated
- JWT token validation

---

## 🧪 Testing the GUI

1. **Start both servers:**
   ```bash
   # Terminal 1: Backend API
   cd apps/api
   pnpm dev

   # Terminal 2: Frontend
   cd apps/web-enterprise
   pnpm dev
   ```

2. **Login:**
   - Go to `http://localhost:4320/auth/login`
   - Use your credentials

3. **Navigate:**
   - Click on "Messages", "Forums", "Meetings", etc. in the top navigation
   - Or directly visit the URLs above

4. **Test Features:**
   - Try creating a forum
   - Send a message
   - View meetings
   - Browse events
   - Join a community channel
   - Read knowledge articles

---

## 📝 Navigation Menu

The navigation menu in the Topbar (`components/Nav/Topbar.tsx`) has been updated to include:

```
Dashboard | Projects | Funding | Proposals | Papers | 
Messages | Forums | Meetings | Events | Communities | Knowledge
```

All communication features are accessible to authenticated users.

---

## 🎯 Next Steps for Full Functionality

The pages are created with basic listing and viewing. To add full functionality:

1. **Detail Pages** - Create individual pages for:
   - `/messaging/[userId]` - Individual conversation
   - `/forums/[id]` - Forum detail with posts
   - `/meetings/[id]` - Meeting detail
   - `/events/[id]` - Event detail
   - `/communities/[id]` - Channel detail
   - `/knowledge/[id]` - Article detail

2. **Create Forms** - Add modals/forms for:
   - Creating forums
   - Scheduling meetings
   - Creating events
   - Creating channels
   - Writing articles

3. **Real-time Updates** - Integrate WebSocket for:
   - Live message updates
   - Real-time notifications
   - Live meeting status

---

**Status**: ✅ All GUI pages created and accessible!

