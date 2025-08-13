# Vercel Deployment Guide - AI Cost Guardian Enterprise

## 🚀 Pre-Deployment Checklist

### ✅ Build Status
- Production build successful
- All TypeScript errors resolved
- Enterprise features implemented and tested

## 📋 Environment Variables for Vercel

Add these to your Vercel project settings:

### Required Variables
```env
# Database (Use your production database)
DATABASE_URL="postgresql://[YOUR_PRODUCTION_DB_URL]"

# NextAuth
NEXTAUTH_URL="https://[YOUR_DOMAIN].vercel.app"
NEXTAUTH_SECRET="[GENERATE_NEW_SECRET_FOR_PRODUCTION]"

# Google OAuth
GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLIENT_ID]"
GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLIENT_SECRET]"

# Encryption
ENCRYPTION_KEY="[YOUR_32_CHARACTER_KEY]"
```

### Optional Slack Integration
```env
# AssetWorks Slack
SLACK_ASSETWORKS_WEBHOOK_URL="[YOUR_WEBHOOK_URL]"
SLACK_ASSETWORKS_APP_ID="[YOUR_APP_ID]"
SLACK_ASSETWORKS_CLIENT_ID="[YOUR_CLIENT_ID]"
SLACK_ASSETWORKS_CLIENT_SECRET="[YOUR_CLIENT_SECRET]"
SLACK_ASSETWORKS_SIGNING_SECRET="[YOUR_SIGNING_SECRET]"
SLACK_ASSETWORKS_APP_TOKEN="[YOUR_APP_TOKEN]"

# AiCostGuardian Slack
SLACK_AICOSTGUARDIAN_WEBHOOK_URL="[YOUR_WEBHOOK_URL]"
SLACK_AICOSTGUARDIAN_APP_ID="[YOUR_APP_ID]"
SLACK_AICOSTGUARDIAN_CLIENT_ID="[YOUR_CLIENT_ID]"
SLACK_AICOSTGUARDIAN_CLIENT_SECRET="[YOUR_CLIENT_SECRET]"
SLACK_AICOSTGUARDIAN_SIGNING_SECRET="[YOUR_SIGNING_SECRET]"
SLACK_AICOSTGUARDIAN_APP_TOKEN="[YOUR_APP_TOKEN]"

# Feature Flags
ENABLE_SLACK_NOTIFICATIONS="true"
ENABLE_EMAIL_NOTIFICATIONS="false"
```

## 🔧 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Enterprise user management system - production ready"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the framework preset: **Next.js**
4. Add environment variables (see above)
5. Deploy

### 3. Post-Deployment Database Setup
After deployment, run these commands:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to production database
npx prisma db push

# 3. Seed initial data (organizations and users)
npx tsx prisma/seed-enterprise.ts
```

### 4. Update OAuth Redirect URLs
In Google Cloud Console, add your production URL:
```
https://[YOUR_DOMAIN].vercel.app/api/auth/callback/google
```

## 🧪 Post-Deployment Testing

### 1. Super Admin Access
- Login with: victor@aicostguardian.com
- Navigate to: /super-admin
- Verify organization management works

### 2. Organization Admin
- Login with: tech.admin@assetworks.ai
- Navigate to: /organization/members
- Test member management

### 3. API Endpoints
Test these endpoints:
- `/api/super-admin/organizations`
- `/api/organization/members`
- `/api/organization/stats`

## 📊 Enterprise Features Overview

### Super Admin Dashboard (`/super-admin`)
- Manage all organizations
- View platform statistics
- Create/edit/deactivate organizations
- Monitor revenue and growth

### Organization Management (`/organization/members`)
- Invite team members
- Bulk upload via CSV
- Role-based access control
- Usage tracking per member
- Slack notifications

### Security & Access Control
- **SUPER_ADMIN**: Platform administration
- **ADMIN**: Organization management
- **MANAGER**: Team management
- **USER**: Standard access
- **VIEWER**: Read-only access

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive keys
2. **Database**: Use connection pooling for production
3. **Authentication**: Ensure NEXTAUTH_SECRET is unique
4. **API Keys**: All stored encrypted in database
5. **Slack Webhooks**: Keep webhook URLs private

## 📱 Slack Webhook Configuration

To get actual webhook URLs:

### For AssetWorks:
1. Go to Slack App settings for AssetWorks
2. Navigate to "Incoming Webhooks"
3. Create webhook for desired channel
4. Copy webhook URL to env variable

### For AiCostGuardian:
1. Go to Slack App settings for AiCostGuardian
2. Navigate to "Incoming Webhooks"
3. Create webhook for desired channel
4. Copy webhook URL to env variable

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL mode is configured correctly

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check Google OAuth redirect URLs
- Ensure NEXTAUTH_SECRET is set

### Build Failures
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure Node version compatibility

## 📈 Monitoring

### Recommended Setup:
1. Enable Vercel Analytics
2. Set up error tracking (Sentry already configured)
3. Monitor database performance
4. Track API usage

## 🎯 Success Metrics

After deployment, verify:
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ Database queries execute
- ✅ Enterprise features accessible
- ✅ Slack notifications sent (if configured)
- ✅ Performance metrics acceptable

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Review function logs for API errors
3. Verify environment variables
4. Check database connectivity

## 🚀 Launch Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] OAuth redirect URLs updated
- [ ] Slack webhooks configured (optional)
- [ ] Super admin user created
- [ ] Test organizations created
- [ ] All features tested
- [ ] Performance validated
- [ ] Security reviewed
- [ ] Documentation updated

---

**Version**: 2.0.0-enterprise
**Last Updated**: 2025-08-13
**Status**: Production Ready