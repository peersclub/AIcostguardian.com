# 🚀 Vercel Production Deployment Guide - AI Cost Guardian

## ✅ Pre-Flight Checklist

### Build Status
- ✅ Application builds successfully
- ✅ All TypeScript errors resolved
- ✅ Security features implemented (Phase 1)
- ✅ Error handling implemented (Phase 2)
- ✅ Enterprise features ready

### Current Status
```bash
Build: ✅ Successful
Tests: ⚠️ Manual testing required
Security: ✅ Hardened
Performance: ✅ Optimized
```

---

## 🔧 Step 1: Environment Variables for Vercel

Copy these to your Vercel project settings under **Settings → Environment Variables**:

### Core Configuration (REQUIRED)
```env
# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-new-32-char-secret-for-production

# Google OAuth (REQUIRED for login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (Choose one)
DATABASE_URL=your-production-database-url

# Encryption (REQUIRED - Generate new for production!)
ENCRYPTION_KEY=generate-new-64-char-hex-key
```

### Generate Required Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32
```

### Optional Features
```env
# Redis for Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# Sentry Error Tracking
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ENABLED=true
NEXT_PUBLIC_SENTRY_ENABLED=true

# Slack Integration
SLACK_ASSETWORKS_WEBHOOK_URL=your-webhook-url
SLACK_AICOSTGUARDIAN_WEBHOOK_URL=your-webhook-url
ENABLE_SLACK_NOTIFICATIONS=true

# Email (Future)
ENABLE_EMAIL_NOTIFICATIONS=false
SENDGRID_API_KEY=your-sendgrid-key
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Confirm production deployment
```

### Option B: Via GitHub Integration
1. Push code to GitHub:
```bash
git add .
git commit -m "Production ready: Security & Error handling implemented"
git push origin main
```

2. In Vercel Dashboard:
   - Import GitHub repository
   - Configure environment variables
   - Deploy

---

## 📋 Step 3: Post-Deployment Setup

### 1. Database Migration
```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Generate Prisma client
npx prisma generate

# Push schema to production
npx prisma db push

# Seed initial data (IMPORTANT!)
npx tsx prisma/seed-enterprise.ts
```

### 2. Update OAuth Redirect URLs
In Google Cloud Console, add:
```
https://your-domain.vercel.app/api/auth/callback/google
```

### 3. Configure Redis (if using Upstash)
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL and token to Vercel env vars

---

## 🧪 Step 4: Production Testing

### Critical Paths to Test

#### 1. Authentication Flow
- [ ] Google OAuth login works
- [ ] Session persistence
- [ ] Logout functionality

#### 2. Super Admin Functions
```
Email: victor@aicostguardian.com
Path: /super-admin
Test: Organization management
```

#### 3. Organization Admin
```
Email: tech.admin@assetworks.ai
Path: /organization/members
Test: Member management, bulk upload
```

#### 4. API Key Management
- [ ] Add API key (encrypted storage)
- [ ] Test provider (OpenAI/Claude/Gemini)
- [ ] Delete key

#### 5. Security Features
- [ ] Rate limiting (make rapid requests)
- [ ] CSRF protection (check network tab)
- [ ] Input sanitization (try XSS)

#### 6. Error Handling
- [ ] Error boundaries (trigger error)
- [ ] Retry logic (disconnect network)
- [ ] Toast notifications

---

## 🔍 Step 5: Monitoring Setup

### 1. Vercel Analytics
Enable in Vercel Dashboard → Analytics

### 2. Error Tracking (Sentry)
- Errors automatically sent to Sentry
- Check dashboard at sentry.io

### 3. Performance Monitoring
```bash
# Run Lighthouse
npm run lighthouse

# Check bundle size
npm run analyze
```

### 4. Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

---

## 🛡️ Security Checklist

### Pre-Production
- [x] Rate limiting implemented
- [x] CSRF protection active
- [x] Input validation on all endpoints
- [x] API keys encrypted
- [x] Permission system active
- [x] Security headers configured

### Production Setup
- [ ] New NEXTAUTH_SECRET generated
- [ ] New ENCRYPTION_KEY generated
- [ ] Production database configured
- [ ] OAuth redirect URLs updated
- [ ] Redis configured for rate limiting
- [ ] Sentry enabled for error tracking

---

## 📊 Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Bundle Size: < 250KB (gzipped)

### Current Status
- Build Size: ✅ Optimized
- API Routes: ✅ All dynamic
- Static Pages: ✅ Pre-rendered
- Images: ✅ Optimized

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Can't reach database server
Solution: 
- Verify DATABASE_URL is correct
- Check if Vercel IP is whitelisted
- Ensure SSL mode is configured
```

#### 2. Google OAuth Not Working
```
Error: Redirect URI mismatch
Solution:
- Add production URL to Google Console
- Format: https://your-domain.vercel.app/api/auth/callback/google
```

#### 3. 500 Errors on API Routes
```
Check:
- Environment variables are set
- Database is accessible
- Logs in Vercel Functions tab
```

#### 4. Rate Limiting Not Working
```
Solution:
- Configure Upstash Redis
- Add UPSTASH_REDIS_REST_URL and TOKEN
- Falls back to in-memory if not configured
```

---

## 📝 Environment Variables Template

Create `.env.production` locally (don't commit!):

```env
# Core (REQUIRED)
NEXTAUTH_URL=https://aicostguardian.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
DATABASE_URL=<your-production-db>
ENCRYPTION_KEY=<generate-with-openssl>

# Features (OPTIONAL)
UPSTASH_REDIS_REST_URL=<from-upstash>
UPSTASH_REDIS_REST_TOKEN=<from-upstash>
SENTRY_DSN=<from-sentry>
NEXT_PUBLIC_SENTRY_DSN=<from-sentry>
SENTRY_ENABLED=true
NEXT_PUBLIC_SENTRY_ENABLED=true

# Integrations (OPTIONAL)
SLACK_ASSETWORKS_WEBHOOK_URL=<from-slack>
SLACK_AICOSTGUARDIAN_WEBHOOK_URL=<from-slack>
ENABLE_SLACK_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=false
```

---

## 🎯 Launch Checklist

### Before Deploy
- [ ] Generate new secrets
- [ ] Configure production database
- [ ] Update OAuth redirect URLs
- [ ] Review security settings

### Deploy
- [ ] Push to GitHub
- [ ] Import to Vercel
- [ ] Add environment variables
- [ ] Deploy to production

### After Deploy
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test authentication
- [ ] Test critical paths
- [ ] Enable monitoring
- [ ] Configure alerts

### Go Live
- [ ] Update DNS (if custom domain)
- [ ] Test with real users
- [ ] Monitor error rates
- [ ] Check performance metrics

---

## 📞 Support Information

### Technical Issues
- Check Vercel deployment logs
- Review function logs for API errors
- Monitor Sentry for exceptions

### Database Issues
- Verify connection string
- Check SSL requirements
- Review Prisma logs

### Authentication Issues
- Confirm OAuth configuration
- Check NEXTAUTH_URL matches domain
- Verify redirect URLs in Google Console

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Users can sign in with Google
- ✅ Super admin can manage organizations
- ✅ Organization admins can manage members
- ✅ API keys can be added and tested
- ✅ Usage tracking works
- ✅ No critical errors in logs
- ✅ Performance metrics met
- ✅ Security features active

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Production](https://next-auth.js.org/deployment)

---

**Version**: 3.0
**Last Updated**: 2025-08-13
**Status**: PRODUCTION READY ✅
**Security**: HARDENED ✅
**Error Handling**: IMPLEMENTED ✅