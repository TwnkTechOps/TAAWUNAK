# Communication & Networking Hub Guide

## Overview

The Communication & Networking module has been organized into a centralized hub accessible at `/communication`. This provides a unified interface for all communication features with an interactive menu.

## Structure

### Main Hub Page
- **Route**: `/communication`
- **Component**: `components/communication/CommunicationHub.tsx`
- **Page**: `app/(protected)/communication/page.tsx`

### Individual Feature Pages
All pages are located in `app/(protected)/` and are accessible via the hub:

1. **Direct Messaging** - `/messaging`
   - One-to-one and group messaging
   - End-to-end encryption
   - Real-time delivery

2. **Discussion Forums** - `/forums`
   - Topic-based discussions
   - Threaded conversations
   - Public and private forums

3. **Virtual Meetings** - `/meetings`
   - Schedule and join meetings
   - Automatic transcription
   - Integration with Teams, Zoom, Google Meet

4. **Events & Webinars** - `/events`
   - Workshops and conferences
   - Hackathons
   - Live and recorded sessions

5. **Community Channels** - `/communities`
   - Domain-specific communities
   - AI, renewable energy, education technology, etc.
   - Connect with peers

6. **Knowledge Base** - `/knowledge`
   - Publish articles
   - Share insights
   - Expert knowledge resources

## Navigation

The main navigation bar now includes a single "Communication" link that routes to `/communication`. From there, users can access all communication features through the interactive hub interface.

## Features

### Interactive Hub Menu
- **Quick Stats**: Overview of unread messages, upcoming meetings, events, and communities
- **Feature Cards**: Visual cards for each communication feature with:
  - Gradient icons
  - Hover animations
  - Direct links to feature pages
  - Status badges
- **Quick Actions**: Shortcuts for common tasks

### Design Elements
- Enterprise-level components (`EnterpriseCard`, `EnterpriseKpiCard`)
- Framer Motion animations
- Responsive grid layout
- Dark mode support
- Glass morphism effects
- Gradient backgrounds

## Troubleshooting

### 404 Errors
If you encounter 404 errors:

1. **Clear Next.js cache**:
   ```bash
   cd apps/web-enterprise
   rm -rf .next
   ```

2. **Restart the dev server**:
   ```bash
   pnpm dev
   ```

3. **Verify routes exist**:
   ```bash
   ls -la app/\(protected\)/messaging/
   ls -la app/\(protected\)/forums/
   ls -la app/\(protected\)/meetings/
   ls -la app/\(protected\)/events/
   ls -la app/\(protected\)/communities/
   ls -la app/\(protected\)/knowledge/
   ```

4. **Check authentication**: Ensure you're logged in, as all routes are protected

### Route Structure
All communication routes are in the `(protected)` route group:
- `app/(protected)/messaging/page.tsx` → `/messaging`
- `app/(protected)/forums/page.tsx` → `/forums`
- `app/(protected)/meetings/page.tsx` → `/meetings`
- `app/(protected)/events/page.tsx` → `/events`
- `app/(protected)/communities/page.tsx` → `/communities`
- `app/(protected)/knowledge/page.tsx` → `/knowledge`
- `app/(protected)/communication/page.tsx` → `/communication`

The `(protected)` route group doesn't affect the URL - it's just for organization and applies the `ProtectedRoute` wrapper via the layout.

## Testing

1. **Access the hub**: Navigate to `/communication` (must be logged in)
2. **Browse features**: Click on any feature card to navigate to that feature
3. **Check navigation**: Verify the "Communication" link appears in the top navigation bar
4. **Test responsiveness**: Resize the browser to test mobile/tablet layouts

## Next Steps

- Implement real-time data fetching for quick stats
- Add notification badges to feature cards
- Create breadcrumb navigation for better UX
- Add search functionality within the hub
- Implement keyboard shortcuts for quick navigation

