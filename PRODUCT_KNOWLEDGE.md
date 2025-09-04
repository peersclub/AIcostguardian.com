# AI Cost Guardian - Complete Product Knowledge Base

## 🎯 Product Vision
**AI Cost Guardian** is an enterprise-grade AI usage tracking and cost management platform that provides real-time visibility into AI API consumption across multiple providers, helping organizations optimize their AI spending and maintain control over their AI infrastructure.

## 🏗️ Core Architecture

### Technology Stack
- **Frontend**: Next.js 14.2.5 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Neon/Supabase)
- **Authentication**: NextAuth.js with Google OAuth
- **Real-time**: Socket.io (when needed)
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel/Railway

### Database Schema
```
Core Entities:
- User (authentication, profile, role-based access)
- Organization (multi-tenant support)
- ApiKey (encrypted storage, provider management)
- UsageLog (token tracking, cost calculation)
- Budget (spending limits, alerts)
- Alert (threshold monitoring)
- ChatMessage (AIOptimise conversations)
- Thread (conversation organization)
- Notification (system alerts)
```

## 📦 Current Features (Implemented)

### 1. Authentication & User Management ✅
- Google OAuth integration
- Role-based access (SUPER_ADMIN, ADMIN, MEMBER, VIEWER)
- Multi-organization support
- Session management

### 2. API Key Management ✅
- Secure encrypted storage (AES-256-GCM)
- Support for 7 providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic Claude (Opus, Sonnet, Haiku)
  - Google Gemini (Pro, Pro Vision)
  - X.AI Grok (Beta)
  - Perplexity
  - Cohere
  - Mistral
- Key validation and testing
- Centralized management service

### 3. Dashboard ✅
**URL**: `/dashboard`
- Executive metrics overview
- Real-time cost tracking
- Provider performance breakdown
- Budget utilization
- Team usage analytics
- Business insights
- Trend analysis

### 4. Usage Analytics ✅
**URL**: `/usage`
- Detailed token usage tracking
- Cost breakdown by provider/model
- Time-based filtering (7d, 30d, 90d)
- Provider comparison
- Export to CSV
- Visual charts (line, bar, pie)

### 5. AIOptimise Chat Interface ✅
**URL**: `/aioptimise`
- Multi-provider AI chat
- Thread management
- Message history
- Context preservation
- Model switching
- Dark theme optimized UI
- Real-time usage tracking

### 6. Settings & Configuration ✅
**URL**: `/settings/*`
- API key configuration
- Organization management
- User preferences
- Notification settings
- Budget configuration

### 7. Onboarding Flow ✅
**URL**: `/onboarding/*`
- Step-by-step setup
- API key configuration
- Organization creation
- Initial budget setup

## 🔄 Data Flow

### Usage Tracking Flow
```
1. User makes API call (via AIOptimise or API)
   ↓
2. Request intercepted by tracking middleware
   ↓
3. API call executed with provider
   ↓
4. Response captured with token counts
   ↓
5. Usage data calculated and stored
   ↓
6. Real-time dashboard updated
   ↓
7. Alerts checked and triggered if needed
```

### Cost Calculation
- Real-time token counting
- Provider-specific pricing models
- Automatic cost aggregation
- Currency conversion support (future)

## 📊 Data Sources

### Real Usage Data
1. **Direct API Calls**: Through AIOptimise interface
2. **Proxy Tracking**: Middleware intercepts all API calls
3. **Manual Import**: CSV upload capability
4. **Webhook Integration**: Provider notifications (limited)

### Sample Data
- Generation scripts for testing
- Realistic usage patterns
- Multiple provider simulation

## 🚀 Product Roadmap

### Phase 1: Core Platform (✅ Complete)
- [x] User authentication
- [x] API key management
- [x] Basic dashboard
- [x] Usage tracking
- [x] AIOptimise chat

### Phase 2: Enhanced Analytics (🔄 In Progress)
- [x] Advanced dashboard metrics
- [x] Provider comparison
- [x] Cost optimization insights
- [ ] Predictive analytics
- [ ] Anomaly detection

### Phase 3: Enterprise Features (📋 Planned)
- [ ] Team collaboration
- [ ] Department budgets
- [ ] Approval workflows
- [ ] Custom reports
- [ ] API rate limiting
- [ ] Usage quotas

### Phase 4: Advanced Integration (🔮 Future)
- [ ] Slack/Teams integration
- [ ] CI/CD pipeline integration
- [ ] Custom provider support
- [ ] White-label options
- [ ] Mobile app
- [ ] Public API

## 🎨 UI/UX Principles

### Design System
- **Theme**: Dark mode optimized
- **Colors**: 
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)
  - Background: Gray-900 (#111827)
- **Components**: Radix UI base with custom styling
- **Icons**: Lucide React
- **Charts**: Recharts library

### User Experience Goals
1. **Instant Visibility**: Dashboard shows critical metrics immediately
2. **Actionable Insights**: Clear recommendations for cost optimization
3. **Seamless Integration**: Easy API key setup and management
4. **Real-time Updates**: Live data refresh without page reload
5. **Mobile Responsive**: Full functionality on all devices

## 🔐 Security & Compliance

### Security Measures
- **Encryption**: AES-256-GCM for API keys
- **Authentication**: OAuth 2.0 with PKCE
- **Authorization**: Role-based access control
- **Data Privacy**: No raw API data stored
- **Audit Logging**: All actions tracked
- **Rate Limiting**: API endpoint protection

### Compliance Considerations
- GDPR compliance for EU users
- SOC 2 Type II (future)
- ISO 27001 (future)
- Data residency options

## 📈 Business Model

### Target Users
1. **Primary**: Mid-size tech companies (50-500 employees)
2. **Secondary**: Enterprises with AI initiatives
3. **Tertiary**: AI-first startups

### Value Propositions
1. **Cost Savings**: 20-40% reduction in AI spending
2. **Visibility**: Complete overview of AI usage
3. **Control**: Budget limits and alerts
4. **Optimization**: Provider comparison and recommendations
5. **Compliance**: Usage audit trail

### Pricing Strategy (Future)
- **Starter**: Free (up to $100/month AI spend)
- **Professional**: $99/month (up to $5,000 AI spend)
- **Enterprise**: Custom pricing

## 🛠️ Development Guidelines

### Code Standards
```typescript
// Always use TypeScript with strict mode
// Prefer functional components with hooks
// Use server components where possible
// Implement proper error boundaries
// Add loading states for all async operations
```

### File Structure
```
/app              - Next.js 14 app router pages
/components       - Reusable React components
/lib             - Utility functions and services
  /core          - Core business logic
  /services      - External service integrations
/hooks           - Custom React hooks
/prisma          - Database schema and migrations
/public          - Static assets
/scripts         - Utility scripts
```

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Performance monitoring

### Git Workflow
- Feature branches from main
- PR reviews required
- Automated testing in CI
- Semantic versioning

## 🔧 Environment Variables

### Required
```
DATABASE_URL          - PostgreSQL connection
NEXTAUTH_URL         - Application URL
NEXTAUTH_SECRET      - Auth secret key
GOOGLE_CLIENT_ID     - OAuth client ID
GOOGLE_CLIENT_SECRET - OAuth client secret
ENCRYPTION_KEY       - API key encryption
```

### Optional
```
SENTRY_DSN           - Error tracking
VERCEL_ANALYTICS_ID - Analytics
UPSTASH_REDIS_URL    - Redis cache
EMAIL_SERVER         - SMTP configuration
```

## 📝 Key Decisions & Rationale

### Why These Technologies?
1. **Next.js 14**: Best DX, built-in optimization, server components
2. **Prisma**: Type-safe database access, migrations
3. **PostgreSQL**: Reliable, scalable, JSON support
4. **NextAuth**: Flexible, secure, well-maintained
5. **Tailwind**: Rapid development, consistent styling

### Why This Architecture?
1. **Monolithic**: Simpler deployment, easier debugging
2. **Server-first**: Better SEO, faster initial load
3. **API Routes**: Co-located with frontend, type sharing
4. **Edge Functions**: Global performance (future)

## 🚨 Known Issues & Limitations

### Current Limitations
1. **Historical Data**: Most providers don't offer usage APIs
2. **Real-time Sync**: Webhook support limited
3. **Rate Limits**: Provider API restrictions
4. **Mobile App**: Web-only currently

### Technical Debt
1. Some components need refactoring for reusability
2. Test coverage needs improvement
3. Performance optimization for large datasets
4. Better error handling in some areas

## 📞 Support & Resources

### Documentation
- README.md - Quick start guide
- CONTRIBUTING.md - Development setup
- API.md - API documentation
- DEPLOYMENT.md - Deployment guide

### Key Files
- `/CURRENT_UPGRADE_CONTEXT.md` - Active development tracking
- `/SYSTEM_DOCUMENTATION.md` - Technical architecture
- `/FEATURE_MATRIX.md` - Feature specifications
- `/Rule_Book.md` - Coding standards

## 🎯 Success Metrics

### Product Metrics
- Monthly Active Users (MAU)
- Average cost savings per user
- API calls tracked per month
- User retention rate
- Feature adoption rate

### Technical Metrics
- Page load time < 2s
- API response time < 200ms
- 99.9% uptime
- Error rate < 0.1%
- Test coverage > 80%

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run linting
npm run typecheck       # Check types

# Database
npx prisma studio       # Database GUI
npx prisma generate     # Generate client
npx prisma migrate dev  # Run migrations
npx prisma db push      # Push schema

# Scripts
npx tsx scripts/generate-usage-data.ts  # Generate sample data
npx tsx scripts/backfill-usage.ts       # Backfill usage data
npx tsx scripts/test-api-keys.ts        # Test API keys
```

---

Last Updated: 2025-09-04
Version: 1.0.0
Status: Production Ready