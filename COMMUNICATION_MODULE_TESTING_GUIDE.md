# Communication & Networking Module - Testing Guide

## 📍 Where Features Are Implemented

### Backend Services Location:
```
apps/api/src/modules/
├── messaging/          # Direct & Group Chat
│   ├── messaging.service.ts
│   ├── messaging.controller.ts
│   └── messaging.module.ts
├── forums/             # Discussion Forums
│   ├── forums.service.ts
│   ├── forums.controller.ts
│   └── forums.module.ts
├── meetings/           # Virtual Meetings
│   ├── meetings.service.ts
│   ├── meetings.controller.ts
│   └── meetings.module.ts
├── events/             # Events & Webinars
│   ├── events.service.ts
│   ├── events.controller.ts
│   └── events.module.ts
├── communities/        # Community Channels
│   ├── communities.service.ts
│   ├── communities.controller.ts
│   └── communities.module.ts
└── knowledge/          # Knowledge Articles
    ├── knowledge.service.ts
    ├── knowledge.controller.ts
    └── knowledge.module.ts
```

### Database Schema:
```
apps/api/prisma/schema.prisma
```

### Encryption Service:
```
apps/api/src/services/encryption.service.ts
```

---

## 🧪 How to Test

### Step 1: Start the API Server

```bash
cd apps/api
pnpm dev
```

The API should be running on `http://localhost:4312`

### Step 2: Get Authentication Token

First, you need to login to get a JWT token:

```bash
# Login
curl -X POST http://localhost:4312/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }' \
  -c cookies.txt

# The token will be in cookies or response
```

### Step 3: Test Each Feature

---

## 📝 Testing Examples

### 1. Direct Messaging

#### Send a Direct Message
```bash
curl -X POST http://localhost:4312/messaging/direct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "receiverId": "user-id-here",
    "content": "Hello! This is a test message.",
    "encrypted": true
  }'
```

#### Get Conversations
```bash
curl http://localhost:4312/messaging/direct/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Messages with a User
```bash
curl "http://localhost:4312/messaging/direct/USER_ID_HERE?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Group Chat

#### Create Group Chat
```bash
curl -X POST http://localhost:4312/messaging/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Project Team Chat",
    "description": "Chat for our project team",
    "isPrivate": false
  }'
```

#### Get Your Group Chats
```bash
curl http://localhost:4312/messaging/groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Send Group Message
```bash
curl -X POST http://localhost:4312/messaging/groups/GROUP_ID_HERE/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Hello team!",
    "encrypted": true
  }'
```

---

### 3. Discussion Forums

#### Create Forum
```bash
curl -X POST http://localhost:4312/forums \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "AI Research Discussion",
    "description": "Discuss AI research topics",
    "category": "AI",
    "isPublic": true,
    "tags": ["ai", "research", "machine-learning"]
  }'
```

#### Get Forums
```bash
curl "http://localhost:4312/forums?category=AI&search=research" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Post
```bash
curl -X POST http://localhost:4312/forums/FORUM_ID_HERE/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New AI Breakthrough",
    "content": "I found an interesting paper on...",
    "tags": ["ai", "paper"]
  }'
```

#### Vote on Post
```bash
curl -X POST http://localhost:4312/forums/posts/POST_ID_HERE/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vote": "up"
  }'
```

---

### 4. Virtual Meetings

#### Create Meeting
```bash
curl -X POST http://localhost:4312/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Project Kickoff Meeting",
    "description": "Initial project discussion",
    "startTime": "2024-12-20T10:00:00Z",
    "endTime": "2024-12-20T11:00:00Z",
    "meetingType": "PLATFORM",
    "projectId": "optional-project-id"
  }'
```

#### Get Meetings
```bash
curl "http://localhost:4312/meetings?upcoming=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Add Participant
```bash
curl -X POST http://localhost:4312/meetings/MEETING_ID_HERE/participants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-id-to-add"
  }'
```

#### Create Transcript
```bash
curl -X POST http://localhost:4312/meetings/MEETING_ID_HERE/transcripts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Full transcript text here...",
    "summary": "Meeting summary: Discussed project goals...",
    "language": "en",
    "isPublic": false,
    "accessLevel": "PARTICIPANTS"
  }'
```

---

### 5. Events

#### Create Event
```bash
curl -X POST http://localhost:4312/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "AI Workshop 2024",
    "description": "Learn about AI technologies",
    "eventType": "WORKSHOP",
    "startTime": "2024-12-25T09:00:00Z",
    "endTime": "2024-12-25T17:00:00Z",
    "timezone": "UTC",
    "location": "Virtual",
    "isVirtual": true,
    "maxAttendees": 100,
    "registrationRequired": true,
    "registrationDeadline": "2024-12-24T23:59:59Z",
    "isPublic": true,
    "tags": ["ai", "workshop", "education"]
  }'
```

#### Register for Event
```bash
curl -X POST http://localhost:4312/events/EVENT_ID_HERE/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Events
```bash
curl "http://localhost:4312/events?eventType=WORKSHOP&upcoming=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Community Channels

#### Create Channel
```bash
curl -X POST http://localhost:4312/communities/channels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "AI Researchers",
    "description": "Channel for AI researchers",
    "category": "AI",
    "isPublic": true
  }'
```

#### Join Channel
```bash
curl -X POST http://localhost:4312/communities/channels/CHANNEL_ID_HERE/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Channel Post
```bash
curl -X POST http://localhost:4312/communities/channels/CHANNEL_ID_HERE/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Check out this new research paper!"
  }'
```

---

### 7. Knowledge Articles

#### Create Article
```bash
curl -X POST http://localhost:4312/knowledge/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Introduction to Machine Learning",
    "content": "Full article content in markdown...",
    "excerpt": "A comprehensive guide to ML",
    "category": "AI",
    "tags": ["machine-learning", "ai", "tutorial"]
  }'
```

#### Publish Article
```bash
curl -X POST http://localhost:4312/knowledge/articles/ARTICLE_ID_HERE/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Publish to External Platform
```bash
curl -X POST http://localhost:4312/knowledge/articles/ARTICLE_ID_HERE/publish-external \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "platforms": ["Medium", "LinkedIn"]
  }'
```

---

## 🛠️ Using Postman or Insomnia

1. **Import Collection**: Create a new collection
2. **Set Base URL**: `http://localhost:4312`
3. **Add Auth Header**: 
   - Type: Bearer Token
   - Token: Your JWT token from login
4. **Test Endpoints**: Use the examples above

---

## 🧪 Quick Test Script

Create a file `test-communication.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:4312"
TOKEN="YOUR_JWT_TOKEN_HERE"

# Test 1: Get Conversations
echo "Testing Direct Messages..."
curl -X GET "$API_URL/messaging/direct/conversations" \
  -H "Authorization: Bearer $TOKEN"

# Test 2: Get Forums
echo "\n\nTesting Forums..."
curl -X GET "$API_URL/forums" \
  -H "Authorization: Bearer $TOKEN"

# Test 3: Get Events
echo "\n\nTesting Events..."
curl -X GET "$API_URL/events?upcoming=true" \
  -H "Authorization: Bearer $TOKEN"

# Test 4: Get Channels
echo "\n\nTesting Community Channels..."
curl -X GET "$API_URL/communities/channels" \
  -H "Authorization: Bearer $TOKEN"

# Test 5: Get Articles
echo "\n\nTesting Knowledge Articles..."
curl -X GET "$API_URL/knowledge/articles" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Frontend Testing

The frontend components are not yet created. To test from the frontend:

1. **Start Frontend**: `cd apps/web-enterprise && pnpm dev`
2. **Login**: Navigate to `/auth/login`
3. **Access Features**: Once frontend components are built, you can access:
   - `/messaging` - Direct messages
   - `/forums` - Discussion forums
   - `/meetings` - Virtual meetings
   - `/events` - Events
   - `/communities` - Community channels
   - `/knowledge` - Knowledge articles

---

## 🔍 Verify Database

Check that data is being saved:

```bash
# Connect to PostgreSQL
psql -h localhost -p 55432 -U your_user -d edutech

# Check tables
\dt

# View messages
SELECT * FROM "DirectMessage" LIMIT 10;

# View forums
SELECT * FROM "DiscussionForum" LIMIT 10;

# View meetings
SELECT * FROM "VirtualMeeting" LIMIT 10;
```

---

## ✅ Testing Checklist

- [ ] API server is running
- [ ] Can login and get JWT token
- [ ] Can send direct message
- [ ] Can create group chat
- [ ] Can create forum
- [ ] Can create meeting
- [ ] Can create event
- [ ] Can create channel
- [ ] Can create article
- [ ] Encryption is working (check database - content should be encrypted)
- [ ] Access control is working (try accessing other user's private content)

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" errors
**Solution**: Make sure you're including the JWT token in the Authorization header

### Issue: "Not Found" errors
**Solution**: Check that the API server is running on port 4312

### Issue: Database errors
**Solution**: Make sure PostgreSQL is running and migrations are applied:
```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

### Issue: CORS errors
**Solution**: Check that CORS is configured in `apps/api/src/main.ts`

---

**Need Help?** Check the API logs for detailed error messages!

