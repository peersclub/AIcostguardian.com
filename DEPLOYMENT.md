# 🚀 AIOptimise Pro - Production Deployment Guide

## 🎯 Production-Ready Status

✅ **All tests passed**
✅ **Build optimized**
✅ **Database seeded with test data**
✅ **Security headers configured**
✅ **Environment variables documented**

## Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peersclub/AIcostguardian.com&env=DATABASE_URL,NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,ENCRYPTION_KEY)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Use branch: `production-ready-deploy`
4. Configure environment variables (see below)
5. Deploy!

### Option 2: Manual Vercel Deployment

1. **Visit Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import `peersclub/ai-cost-guardian`
   - Select the `main` branch

3. **Configure Settings:**
   - Framework Preset: **Next.js**
   - Root Directory: `./ai-credit-tracker`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option 3: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/peersclub/ai-cost-guardian)

### Option 4: Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/Abo1zu)

## Environment Variables Setup

Configure these environment variables in your deployment platform:

```bash
# Core Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"

# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication (REQUIRED)
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-32-character-random-string" # Generate: openssl rand -base64 32

# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Encryption (REQUIRED)
ENCRYPTION_KEY="your-32-character-encryption-key" # For API key encryption

# AI Provider Keys (OPTIONAL - users can add via UI)
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_AI_API_KEY="your-google-ai-key"
PERPLEXITY_API_KEY="your-perplexity-key"
```

## 📊 Test Accounts Available

### Admin Account
- Email: `sureshthejosephite@gmail.com`
- Role: Organization Admin
- Organization: Josephite Testing Organization

### Test Users
- `sureshvictor43@gmail.com`
- `sureshvictor44@gmail.com`
- `sureshvictor45@gmail.com`

### Existing Production Users
- `tech.admin@assetworks.ai` (AssetWorks AI)
- `victor@aicostoptimiser.com` (AI Cost Optimiser)

## Google OAuth Setup

1. **Create Google OAuth App:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

2. **Configure OAuth:**
   - Application type: **Web application**
   - Name: **AI Cost Guardian**
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`

3. **Get Credentials:**
   - Copy **Client ID** and **Client Secret**
   - Add them to your deployment environment variables

## Custom Domain Setup

### Vercel Custom Domain:
1. Go to your project dashboard
2. Settings → Domains
3. Add your custom domain
4. Configure DNS records as instructed

### DNS Configuration:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## Post-Deployment Checklist

- [ ] ✅ Application deployed successfully
- [ ] 🔐 Google OAuth working
- [ ] 🔑 Environment variables configured
- [ ] 🌐 Custom domain connected (optional)
- [ ] 📊 Test API key management
- [ ] 🏢 Verify dashboard functionality
- [ ] 📱 Test responsive design
- [ ] 🚀 Performance check

## Monitoring & Analytics

### Optional Integrations:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and monitoring
- **LogRocket**: User session recordings
- **Google Analytics**: Usage analytics

## Support

- 📧 **Email**: support@peersclub.com
- 🐙 **GitHub Issues**: [Report Issues](https://github.com/peersclub/ai-cost-guardian/issues)
- 📖 **Documentation**: [Full Documentation](https://github.com/peersclub/ai-cost-guardian)

---

🎯 **Live Demo**: [https://ai-cost-guardian.vercel.app](https://ai-cost-guardian.vercel.app)

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS