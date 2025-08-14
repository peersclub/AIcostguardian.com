# AI Cost Guardian - Functional Pages Guide

## Navigation Updated (2025-08-14)

All navigation links have been updated to point to functional pages with real API connections. Mock/static demonstration pages have been removed from the main navigation.

## Dashboard & Analytics

### Functional Pages:
- **Dashboard** (`/dashboard`) - Live dashboard with real-time metrics
- **Usage & Analytics** (`/usage`) - Complete usage tracking with API data
- **Cost Calculator** (`/ai-cost-calculator`) - Interactive cost calculation tool
- **Monitoring Dashboard** (`/monitoring/dashboard`) - Real-time monitoring with alerts
- **Alerts** (`/alerts`) - Alert management system with rules and notifications

### Redirected Mock Pages:
- ❌ `/analytics/usage` → Redirects to `/usage` (functional with real data)
- ❌ `/analytics/trends` → Redirects to `/usage` (functional with real data)
- ❌ `/analytics/providers` → Redirects to `/usage` (functional with real data)
- ❌ `/analytics/*/v2` → All v2 routes redirect to `/usage`

## AIOptimise

### Functional Page:
- **AIOptimise** (`/aioptimise`) - AI chat optimization with:
  - CSRF token authentication fixed
  - Enhanced UI components
  - Thread management
  - Message history
  - Multi-model support

## Team & Organization Management

### Functional Pages:
- **Team Members** (`/organization/members`) - Full member management with:
  - Add/invite members
  - Edit roles and permissions
  - Bulk upload via CSV
  - Usage tracking per member
  - Department management

### Removed Mock Pages:
- ❌ ~~/team/members~~ (removed) → Use `/organization/members` (functional)
- ❌ `/team/permissions` (mock) → Use `/organization/permissions` (functional)
- ❌ `/team/limits` (mock) → Use `/organization/usage-limits` (functional)

## Settings & Configuration

### Functional Pages:
- **General Settings** (`/settings`) - Account and app settings
- **API Keys** (`/settings/api-keys`) - API key management with rotation
- **Notifications** (`/notifications/settings`) - Notification preferences
- **Billing** (`/billing`) - Billing and subscription management

## Key Features of Functional Pages

### 1. Organization Members (`/organization/members`)
- **Add Members**: Click "Invite Member" button
- **Edit Roles**: Click edit icon next to member
- **Bulk Upload**: Upload CSV file with member list
- **Track Usage**: View cost per member
- **Permissions**: Manage member access levels

### 2. Usage & Analytics (`/usage`)
- **Real-time Data**: Live API usage tracking
- **Provider Breakdown**: Usage by AI provider
- **Cost Analysis**: Detailed cost breakdown
- **Export Data**: Download usage reports
- **Time Filters**: View by day/week/month

### 3. Monitoring Dashboard (`/monitoring/dashboard`)
- **Live Metrics**: Real-time usage monitoring
- **Alert Management**: Create and manage cost alerts
- **Insights**: AI-powered usage insights
- **Export Reports**: Download monitoring data

### 4. Alerts System (`/alerts`)
- **Create Rules**: Set up alert rules for costs/usage
- **Active Alerts**: View and acknowledge alerts
- **Notification Channels**: Configure email/webhook alerts
- **Alert History**: Track past alerts and resolutions

## Authentication Requirements

Most functional pages require authentication. Ensure you:
1. Sign in with Google OAuth
2. Have proper role permissions (ADMIN/MANAGER for team management)
3. Have an organization set up

## API Endpoints

All functional pages connect to real API endpoints:
- `/api/organization/members` - Member management
- `/api/usage/*` - Usage tracking
- `/api/monitoring/*` - Monitoring data
- `/api/alerts/*` - Alert management
- `/api/settings/*` - Settings management

## Environment Requirements

Ensure these are configured in `.env.local`:
```
DATABASE_URL=your_database_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

## Testing Functional Pages

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Sign in** at `/auth/signin`

3. **Navigate to functional pages**:
   - Dashboard → Overview → View live metrics
   - Dashboard → Usage & Analytics → Track API usage
   - Settings → Team Members → Manage team
   - Settings → API Keys → Manage API keys

## Notes

- All pages now use real API data, not mock data
- CSRF protection is active on all POST/PUT/DELETE requests
- Rate limiting is applied to prevent abuse
- WebSocket connections available for real-time updates

---

Last Updated: 2025-08-14
Updated By: Claude Code Assistant