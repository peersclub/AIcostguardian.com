# Enterprise System End-to-End Test Checklist

## Test Environment
- **URL**: http://localhost:3000
- **Database**: PostgreSQL (Neon)
- **Test Data**: Seeded via `seed-enterprise.ts`

## 1. Super Admin Flow ✅

### Login
- [ ] Navigate to http://localhost:3000/auth/signin
- [ ] Login with: victor@aicostguardian.com
- [ ] Should redirect to dashboard

### Access Super Admin Dashboard
- [ ] Navigate to http://localhost:3000/super-admin
- [ ] Should see platform statistics:
  - Total Organizations: 4
  - Active Organizations: 4
  - Total Users: 5+
  - Monthly Revenue
  - Average Org Size
  - Growth percentage

### Manage Organizations
- [ ] View all organizations in table
- [ ] AssetWorks AI should show as ENTERPRISE
- [ ] Can toggle organization active/inactive status
- [ ] Can create new organization (test with dummy data)

## 2. Organization Admin Flow ✅

### Login as Org Admin
- [ ] Login with: tech.admin@assetworks.ai
- [ ] Should have access to dashboard

### Access Team Management
- [ ] Navigate to http://localhost:3000/organization/members
- [ ] Should see team statistics:
  - Total Members
  - Active Members
  - Pending Invites
  - Total Spend
  - Avg/User

### View Members
- [ ] Should see all AssetWorks members:
  - tech.admin@assetworks.ai (Admin)
  - suresh.victor@assetworks.ai (User)
  - victor.salomon@assetworks.ai (User)
  - ram.s@assetworks.ai (User)

### Invite New Members
- [ ] Click "Invite Members" button
- [ ] Enter test email(s)
- [ ] Select role
- [ ] Submit invitation
- [ ] Should see success message
- [ ] Slack notification should be sent (if webhook configured)

### Bulk Upload Members
- [ ] Click "Bulk Upload" button
- [ ] Download CSV template
- [ ] Create test CSV:
```csv
email,name,role,department,jobTitle
test.user1@assetworks.ai,Test User 1,USER,Engineering,Developer
test.user2@assetworks.ai,Test User 2,MANAGER,Product,PM
```
- [ ] Upload CSV file
- [ ] Should see processing results
- [ ] Slack notification for bulk upload

### Manage Member Roles
- [ ] Change a member's role from dropdown
- [ ] Should update immediately
- [ ] Cannot demote self if only admin

## 3. Regular Member Flow ✅

### Login as Member
- [ ] Login with: suresh.victor@assetworks.ai
- [ ] Should have access to dashboard
- [ ] Should NOT see admin features

### Access Restrictions
- [ ] Cannot access /super-admin (redirects)
- [ ] Cannot access /organization/members admin features
- [ ] Can view own usage and API keys

## 4. API Testing ✅

### Super Admin APIs
```bash
# Get organizations (as super admin)
curl http://localhost:3000/api/super-admin/organizations \
  -H "Cookie: [session-cookie]"

# Get platform stats
curl http://localhost:3000/api/super-admin/stats \
  -H "Cookie: [session-cookie]"
```

### Organization APIs
```bash
# Get members
curl http://localhost:3000/api/organization/members \
  -H "Cookie: [session-cookie]"

# Get organization stats
curl http://localhost:3000/api/organization/stats \
  -H "Cookie: [session-cookie]"
```

## 5. Slack Integration Testing ✅

### Prerequisites
- [ ] Update .env.local with actual webhook URLs
- [ ] Restart server after updating env variables

### Test Notifications
1. **Member Invitation**
   - Sends to organization's Slack channel
   - Shows inviter, invitee, role

2. **Bulk Upload**
   - Shows uploader, count, errors
   - Sends completion notification

3. **Organization Creation**
   - Sends to super admin Slack
   - Shows org details

## 6. Production Build Test ✅

```bash
# Build for production
npm run build

# Should complete without errors
# Check for TypeScript issues
# Verify all pages compile
```

## 7. Vercel Deployment Checklist ✅

### Environment Variables
Add to Vercel dashboard:
```
DATABASE_URL=[your-production-db]
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=[generate-new-secret]
GOOGLE_CLIENT_ID=[your-client-id]
GOOGLE_CLIENT_SECRET=[your-client-secret]
ENCRYPTION_KEY=[your-encryption-key]

# Slack (optional)
SLACK_ASSETWORKS_WEBHOOK_URL=[webhook-url]
SLACK_AICOSTGUARDIAN_WEBHOOK_URL=[webhook-url]
ENABLE_SLACK_NOTIFICATIONS=true
```

### Database Migration
```bash
# After deployment, run in production:
npx prisma generate
npx prisma db push
npx tsx prisma/seed-enterprise.ts
```

### Post-Deployment Tests
- [ ] Login works with Google OAuth
- [ ] Super admin dashboard accessible
- [ ] Organization management works
- [ ] Member management works
- [ ] API endpoints respond correctly

## Known Issues & Solutions

### Issue: Port 3000 in use
```bash
lsof -i :3000
kill -9 [PID]
```

### Issue: Database connection errors
- Check DATABASE_URL in .env.local
- Verify database is accessible
- Run `npx prisma generate`

### Issue: Slack notifications not sending
- Verify webhook URLs are correct
- Check ENABLE_SLACK_NOTIFICATIONS=true
- Look for console logs about Slack

## Test Users Summary

| Email | Role | Organization | Password |
|-------|------|--------------|----------|
| victor@aicostguardian.com | Super Admin | Platform | Google OAuth |
| tech.admin@assetworks.ai | Admin | AssetWorks AI | Google OAuth |
| suresh.victor@assetworks.ai | User | AssetWorks AI | Google OAuth |
| victor.salomon@assetworks.ai | User | AssetWorks AI | Google OAuth |
| ram.s@assetworks.ai | User | AssetWorks AI | Google OAuth |

## Success Criteria
- ✅ All user roles can login
- ✅ Access control works correctly
- ✅ CRUD operations on organizations
- ✅ Member invitation and management
- ✅ Bulk upload functionality
- ✅ Slack notifications (when configured)
- ✅ Production build successful
- ✅ Ready for Vercel deployment