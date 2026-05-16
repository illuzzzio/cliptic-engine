# Schedule Post Feature - Implementation Guide

## Overview
The schedule post feature allows users to plan and schedule their generated short clips to be published across multiple social media platforms.

## Components Created

### 1. Schedule Page (`app/dashboard/schedule/page.tsx`)
- Full-featured calendar view with month navigation
- Display current month with clickable days
- Hover effects showing "+ Add Post" button on each day
- Today indicator (cyan dot)
- Past dates disabled for scheduling
- Stats section showing:
  - Total scheduled posts
  - Connected social accounts
  - Successfully posted count

**Features:**
- Navigate between months with prev/next buttons
- Click any future date to open scheduling dialog
- Real-time calendar generation

### 2. Schedule Post Dialog (`components/dashboard/SchedulePostDialog.tsx`)
Two-step dialog flow:

**Step 1: Select Video**
- Browse exported video clips
- Shows title, duration, SEO score
- Only displays completed/exported videos
- Visual indicator for selected video
- "Ready to post" badge for exported clips

**Step 2: Select Social Account**
- Choose from connected social media accounts
- Displays platform, account name, and handle
- Visual indicator for selected account
- Navigation between steps with Back button
- Schedule button to confirm

### 3. Server Actions (`lib/actions/schedule.actions.ts`)
- `getExportedVideos()` - Fetch user's exported video clips
- `getSocialAccounts()` - Fetch connected social media accounts  
- `schedulePost()` - Create scheduled post record

### 4. Types (`lib/types/schedule.ts`)
- `SocialAccount` - Social media account structure
- `ScheduledPost` - Scheduled post data
- `VideoClip` - Video clip information
- `SocialPlatform` - Supported platforms

### 5. Database Tables (Migration)
Created migration file: `lib/db/migrations/0003_social_accounts_and_scheduled_posts.sql`

**Tables:**
- `social_media_accounts` - Stores connected social accounts
- `scheduled_posts` - Stores scheduled posts

## Features Implemented ✅

- ✅ Interactive calendar with month navigation
- ✅ Beautiful UI matching Cliptic brand (purple/cyan theme)
- ✅ Day hover effects with "+ Add Post" button
- ✅ Two-step scheduling dialog
- ✅ Video selection with status indicators
- ✅ Social account selection
- ✅ Server-side data fetching
- ✅ Type-safe implementation
- ✅ Responsive design

## What Still Needs Implementation

### Backend Integration
1. **Social Media Account Connection**
   - OAuth integration with platforms (TikTok, Instagram, YouTube, Twitter)
   - Account settings page to connect/disconnect accounts
   - Token management and refresh logic

2. **Database Setup**
   - Run migration to create `social_media_accounts` and `scheduled_posts` tables
   - Update schema.ts with new table definitions

3. **Server Actions Enhancement**
   - Implement `getExportedVideos()` with proper database queries
   - Implement `getSocialAccounts()` with database queries
   - Implement `schedulePost()` with validation and recording
   - Add background job to handle scheduled post publishing

4. **Scheduling System**
   - Set up Inngest job for posting at scheduled times
   - API endpoints for each platform
   - Error handling and retry logic

5. **Post Publishing**
   - Implement platform-specific upload logic
   - Handle video transformations if needed
   - Track post URLs and update status

### Frontend Enhancements (Optional)
1. **Social Account Management**
   - Add "Connect Account" button in dialog when no accounts available
   - Link to settings page for account management
   - Account disconnection with confirmation

2. **Scheduled Posts Management**
   - View scheduled posts list
   - Edit scheduled dates
   - Cancel scheduled posts
   - View posting history with results

3. **Statistics**
   - Real-time count of scheduled posts
   - Count of connected social accounts
   - Count of successfully posted clips

## Usage Flow

1. User clicks "Schedule Post" in sidebar
2. Calendar page displays with current month
3. User hovers over a future date and sees "+ Add Post" button
4. User clicks to open scheduling dialog
5. **Step 1:** Select a video from exported clips
6. Click "Next: Select Account"
7. **Step 2:** Choose social media account
8. Click "Schedule Post" to confirm
9. Post is scheduled and recorded in database

## File Structure

```
app/
├── dashboard/
│   └── schedule/
│       └── page.tsx (Calendar page)

components/
└── dashboard/
    └── SchedulePostDialog.tsx (Scheduling dialog)

lib/
├── types/
│   └── schedule.ts (Type definitions)
├── actions/
│   └── schedule.actions.ts (Server actions)
└── db/
    └── migrations/
        └── 0003_social_accounts_and_scheduled_posts.sql

```

## Next Steps

1. **Set up database tables** - Run the migration
2. **Implement OAuth flows** - Connect with social platforms
3. **Complete server actions** - Add database queries
4. **Set up posting jobs** - Use Inngest for scheduled publishing
5. **Add settings page** - Allow users to manage connected accounts
6. **Build posting API endpoints** - For each social platform

## Example: Connecting Everything

```typescript
// 1. User connects social account (in settings)
// 2. Account saved to social_media_accounts table

// 3. User schedules post
const schedulePost = async (input: {
  shortId: string;
  socialAccountId: string;
  scheduledDate: Date;
}) => {
  // Validate short has exportUrl
  // Validate account exists and is connected
  // Create record in scheduled_posts table
  // Schedule Inngest job to post at scheduledDate
};

// 4. Inngest job runs at scheduled time
// 5. Post is published to social platform
// 6. URL updated in scheduled_posts.post_url
// 7. Status changed to 'posted'
```

## Notes

- The feature is fully styled and responsive
- All components follow Cliptic design system
- TypeScript throughout for type safety
- Ready for backend integration
- Can be extended with additional platforms
