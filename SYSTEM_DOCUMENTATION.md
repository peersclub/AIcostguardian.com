# AI Cost Guardian - Complete System Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features Overview](#features-overview)
5. [Implementation Status](#implementation-status)
6. [Core Components](#core-components)
7. [API Routes](#api-routes)
8. [Global Functions & Utilities](#global-functions--utilities)
9. [Authentication & Security](#authentication--security)
10. [Data Flow](#data-flow)
11. [Development Roadmap](#development-roadmap)

---

## Executive Summary

**AI Cost Guardian** is an enterprise-grade AI cost management platform designed to track, monitor, and optimize AI API usage across multiple providers (OpenAI, Claude, Gemini, Perplexity, Grok). The system provides real-time monitoring, cost analytics, usage tracking, and team management capabilities.

### Key Value Propositions
- **Multi-Provider Support**: Unified dashboard for all major AI providers
- **Real-Time Monitoring**: Live usage tracking and cost calculations
- **Enterprise Features**: Team management, role-based access, usage limits
- **Cost Optimization**: Insights and recommendations for reducing AI costs
- **Security First**: Enterprise-grade security with API key encryption

---

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Pages     │  │  Components  │  │   Hooks/Utils    │  │
│  │  (App Dir)  │  │   (React)    │  │                  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Auth     │  │   Provider   │  │   Management     │  │
│  │  (NextAuth) │  │   Clients    │  │     APIs         │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   OpenAI    │  │    Claude    │  │     Gemini       │  │
│  │     API     │  │      API     │  │       API        │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
/anthropic-quickstarts/
├── app/                         # Next.js App Router
│   ├── (public)/               # Public pages
│   ├── (protected)/            # Protected pages
│   ├── api/                    # API routes
│   └── layout.tsx              # Root layout
├── components/                  # React components
│   ├── ui/                     # UI components
│   └── shared/                 # Shared components
├── lib/                        # Core libraries
│   ├── *-client.ts            # API clients
│   └── utils.ts               # Utilities
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript definitions
└── public/                     # Static assets
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + CSS Modules
- **Animations**: Framer Motion
- **Icons**: Lucide React + Custom AI logos
- **Forms**: React Hook Form (planned)
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: Local JSON (temporary) → PostgreSQL (planned)

### AI Provider SDKs
- **OpenAI**: `openai` v5.11.0
- **Claude**: `@anthropic-ai/sdk` v0.57.0
- **Gemini**: `@google/generative-ai` v0.24.1
- **Grok/Perplexity**: Custom HTTP clients

### DevOps & Tools
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics
- **Type Checking**: TypeScript 5
- **Linting**: ESLint
- **Package Manager**: npm

---

## Features Overview

### 1. Dashboard & Analytics
- **Real-time Usage Metrics**: Live tracking of API calls
- **Cost Analytics**: Detailed cost breakdown by provider
- **Usage Trends**: Historical data visualization
- **Performance Metrics**: Response times, success rates

### 2. Multi-Provider Management
- **Supported Providers**:
  - OpenAI (GPT-3.5, GPT-4, DALL-E, Whisper)
  - Anthropic Claude (Claude 3 Opus, Sonnet, Haiku)
  - Google Gemini (Pro, Ultra)
  - Perplexity AI
  - Grok

### 3. Team & Organization Management
- **User Roles**: Admin, Developer, Viewer
- **Team Invitations**: Email-based invites
- **Usage Limits**: Per-user and per-team limits
- **Access Control**: Role-based permissions

### 4. Cost Optimization
- **Model Comparison**: Side-by-side cost analysis
- **Usage Insights**: Recommendations for cost reduction
- **Budget Alerts**: Threshold-based notifications
- **Cost Calculator**: Predictive cost modeling

### 5. Security Features
- **API Key Management**: Encrypted storage
- **Enterprise SSO**: Google OAuth (more providers planned)
- **Audit Logs**: Track all API key usage
- **Data Privacy**: No storage of API responses

---

## Implementation Status

### ✅ Fully Implemented (Backend + Frontend)

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication** | NextAuth with Google OAuth | ✅ Complete |
| **Dashboard Layout** | Main dashboard structure | ✅ Complete |
| **Navigation** | App-wide navigation system | ✅ Complete |
| **Theme System** | Dark mode support | ✅ Complete |
| **Error Handling** | Global error boundaries | ✅ Complete |
| **Loading States** | Skeleton loaders | ✅ Complete |

### 🔄 Frontend Only (Mock Data)

| Feature | Description | Backend Needed |
|---------|-------------|----------------|
| **Usage Dashboard** | Display usage metrics | Database integration |
| **Cost Analytics** | Cost breakdown charts | Real API data |
| **Team Management** | Team member list | User database |
| **Settings** | API key management | Secure storage |
| **Billing** | Subscription management | Payment integration |
| **Provider Comparison** | Model comparison table | Real pricing data |

### 🏗️ Partially Implemented

| Feature | Current State | Missing |
|---------|--------------|---------|
| **API Clients** | Basic structure created | Full implementation |
| **Usage Tracking** | Mock tracking | Database persistence |
| **Alerts System** | UI created | Backend logic |
| **Onboarding** | Flow designed | Integration |

### ❌ Not Yet Implemented

| Feature | Priority | Complexity |
|---------|----------|------------|
| **Database Integration** | High | Medium |
| **Real-time Updates** | High | High |
| **Payment Processing** | Medium | High |
| **Email Notifications** | Medium | Low |
| **API Rate Limiting** | High | Medium |
| **Data Export** | Low | Low |
| **Webhooks** | Low | Medium |

---

## Core Components

### Authentication Components
```typescript
// components/SessionProvider.tsx
- Wraps app with NextAuth session
- Provides auth context globally

// components/AuthWrapper.tsx  
- Protects routes requiring authentication
- Handles redirect to login

// components/LoginRequired.tsx
- Shows login prompt for unauthorized users
```

### Layout Components
```typescript
// components/Navigation.tsx
- Main navigation sidebar
- Responsive mobile menu
- User profile dropdown

// components/NavigationProgress.tsx
- Page transition progress bar
- Visual loading indicator

// components/DemoDataProvider.tsx
- Provides mock data context
- Simulates backend responses
```

### UI Components
```typescript
// components/ui/
├── button.tsx         # Button variations
├── card.tsx          # Card containers
├── dialog.tsx        # Modal dialogs
├── input.tsx         # Form inputs
├── select.tsx        # Dropdowns
├── table.tsx         # Data tables
├── tabs.tsx          # Tab navigation
├── badge.tsx         # Status badges
├── alert.tsx         # Alert messages
├── progress.tsx      # Progress bars
├── separator.tsx     # Visual dividers
├── switch.tsx        # Toggle switches
├── textarea.tsx      # Text areas
├── label.tsx         # Form labels
├── premium-button.tsx # Premium CTAs
├── premium-card.tsx   # Premium features
├── premium-stats.tsx  # Stats display
├── ai-logos.tsx      # Provider logos
└── demo-label.tsx    # Demo indicators
```

---

## API Routes

### Authentication Routes
```typescript
/api/auth/[...nextauth]   # NextAuth handler
  - GET/POST: Handle OAuth flow
  - Providers: Google OAuth
  - Session management
```

### Provider Usage Routes
```typescript
/api/openai/usage         # OpenAI usage stats
/api/claude/usage         # Claude usage stats  
/api/gemini/usage         # Gemini usage stats
/api/grok/usage          # Grok usage stats
/api/usage/all           # Aggregate usage
/api/usage/recent        # Recent activity
```

### Provider Test Routes
```typescript
/api/openai/test         # Test OpenAI connection
/api/claude/test         # Test Claude connection
/api/gemini/test         # Test Gemini connection
/api/grok/test          # Test Grok connection
```

### Management Routes
```typescript
/api/team/members        # Team member management
/api/team/stats         # Team statistics
/api/settings/api-keys  # API key management
/api/subscription/status # Subscription info
/api/subscription/upgrade # Upgrade plans
/api/alerts/rules       # Alert configuration
/api/alerts/active      # Active alerts
/api/alerts/notifications # Alert history
```

### Claude Admin Routes (Enterprise)
```typescript
/api/claude-admin/organization  # Org management
/api/claude-admin/users        # User management
/api/claude-admin/usage        # Usage analytics
/api/claude-admin/billing      # Billing info
/api/claude-admin/api-keys     # Key management
/api/claude-admin/version      # API version
```

---

## Global Functions & Utilities

### Utility Functions (`lib/utils.ts`)
```typescript
// Class name utilities
cn(...classes)           # Merge CSS classes with conflict resolution

// Example usage:
cn("text-white", condition && "bg-blue-500")
```

### API Clients (`lib/*-client.ts`)
```typescript
// OpenAI Client
class OpenAIClient {
  - testConnection()     # Verify API key
  - getUsage()          # Fetch usage data
  - makeRequest()       # Execute API call
}

// Claude Client  
class ClaudeClient {
  - testApiKey()        # Verify API key
  - getUsage()         # Fetch usage data
  - createMessage()    # Send message
}

// Gemini Client
class GeminiClient {
  - testConnection()   # Verify API key
  - getUsage()        # Fetch usage data
  - generateContent() # Generate response
}
```

### Authentication Config (`lib/auth-config.ts`)
```typescript
// NextAuth configuration
- Providers setup (Google OAuth)
- Session callbacks
- JWT token handling
- Enterprise email validation
- Company extraction from email domain
```

### API Key Store (`lib/api-key-store.ts`)
```typescript
// Temporary local storage for API keys
class ApiKeyStore {
  - setKey(provider, key)    # Store API key
  - getKey(provider)         # Retrieve API key
  - removeKey(provider)      # Delete API key
  - getAllKeys()            # List all keys
}
```

### Usage Tracker (`lib/usage-tracker.ts`)
```typescript
// Mock usage tracking
class UsageTracker {
  - trackUsage(provider, data)  # Record usage
  - getUsage(provider)          # Get usage data
  - clearUsage()               # Reset tracking
}
```

### Subscription Manager (`lib/subscription.ts`)
```typescript
// Subscription utilities
- getCurrentPlan()            # Get active plan
- getAvailablePlans()        # List all plans
- calculateUsagePercentage() # Usage vs limit
```

### Provider Configuration (`lib/ai-providers-config.ts`)
```typescript
// Provider metadata
- Provider list with logos
- Model configurations
- Pricing information
- Feature availability
```

---

## Authentication & Security

### Current Implementation
1. **NextAuth.js Integration**
   - Google OAuth provider
   - JWT session strategy
   - Secure cookie handling

2. **Enterprise Email Validation**
   - Blocks consumer email domains
   - Extracts company from email
   - Configurable domain allowlist

3. **Protected Routes**
   - Middleware-based protection
   - Role-based access control (planned)
   - Session validation

### Security Measures
- **API Key Encryption**: Keys encrypted before storage (planned)
- **HTTPS Only**: Enforced in production
- **CORS Protection**: Configured headers
- **Rate Limiting**: Per-endpoint limits (planned)
- **Input Validation**: Schema validation (planned)
- **XSS Protection**: React's built-in protection
- **CSRF Protection**: NextAuth CSRF tokens

---

## Data Flow

### User Authentication Flow
```
User → Google OAuth → NextAuth → JWT Token → Session → Protected Routes
```

### API Key Management Flow
```
User Input → Validation → Encryption → Local Storage → API Client → Provider API
```

### Usage Tracking Flow
```
API Call → Provider Response → Usage Extraction → Aggregation → Dashboard Display
```

### Cost Calculation Flow
```
Usage Data → Model Pricing → Cost Calculation → Aggregation → Analytics Display
```

---

## Development Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] Project setup and configuration
- [x] Authentication system
- [x] Basic UI components
- [x] Navigation and routing
- [x] Mock data providers

### Phase 2: Core Features (Current 🏗️)
- [ ] Database integration (PostgreSQL)
- [ ] Real API key management
- [ ] Actual usage tracking
- [ ] Live provider integration
- [ ] Basic alerting system

### Phase 3: Advanced Features (Planned 📋)
- [ ] Real-time updates (WebSockets)
- [ ] Advanced analytics
- [ ] Custom dashboards
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Batch operations

### Phase 4: Enterprise Features (Future 🔮)
- [ ] SSO providers (SAML, OIDC)
- [ ] Advanced RBAC
- [ ] Audit logging
- [ ] Compliance reports
- [ ] Custom integrations
- [ ] White-labeling

### Phase 5: Optimization (Future 🚀)
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] CDN integration
- [ ] Mobile app
- [ ] API SDK
- [ ] Marketplace integrations

---

## Next Steps (Priority Order)

### 1. Database Integration (Critical)
```typescript
// Required tables
- users
- organizations  
- api_keys
- usage_logs
- alerts
- team_members
- subscriptions
```

### 2. Real Provider Integration
- Implement actual API calls
- Store and retrieve real usage data
- Calculate actual costs
- Handle API errors gracefully

### 3. Security Enhancements
- Implement API key encryption
- Add rate limiting
- Set up audit logging
- Implement RBAC

### 4. Payment Integration
- Stripe/Paddle integration
- Subscription management
- Usage-based billing
- Invoice generation

### 5. Notification System
- Email notifications
- In-app notifications
- Webhook dispatching
- Alert escalation

---

## Environment Variables

### Required for Production
```env
# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Database (when implemented)
DATABASE_URL=postgresql://...

# Payment (when implemented)  
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (when implemented)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASSWORD=...

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

---

## Testing Strategy

### Current Testing
- Manual testing only
- Mock data validation

### Planned Testing
```typescript
// Unit Tests
- Component testing with React Testing Library
- API route testing with MSW
- Utility function testing with Jest

// Integration Tests
- Auth flow testing
- API integration testing
- Database operation testing

// E2E Tests
- Critical user journeys with Playwright
- Cross-browser testing
- Performance testing
```

---

## Performance Considerations

### Current Optimizations
- Static generation where possible
- Image optimization with Next.js Image
- Code splitting automatic with Next.js
- Lazy loading for heavy components

### Planned Optimizations
- Implement caching strategy
- Database query optimization
- API response caching
- CDN for static assets
- Service worker for offline support

---

## Monitoring & Observability

### Current Monitoring
- Vercel Analytics (page views, Web Vitals)
- Console error logging

### Planned Monitoring
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Custom metrics dashboard
- API performance tracking
- User behavior analytics

---

## Contributing Guidelines

### Code Standards
- TypeScript for type safety
- ESLint configuration enforced
- Prettier for formatting
- Conventional commits
- PR reviews required

### Development Workflow
1. Create feature branch
2. Implement feature
3. Add tests (when testing is set up)
4. Update documentation
5. Submit PR
6. Code review
7. Merge to main

---

## Support & Documentation

### Current Documentation
- README.md - Basic setup
- DEPLOYMENT.md - Deployment guide
- AUTHENTICATION_SETUP.md - Auth configuration
- SYSTEM_DOCUMENTATION.md - This document

### Planned Documentation
- API documentation (OpenAPI/Swagger)
- Component storybook
- Video tutorials
- Integration guides
- Troubleshooting guide

---

## License & Legal

- **License**: Proprietary (for now)
- **Privacy Policy**: Required before production
- **Terms of Service**: Required before production
- **Data Processing Agreement**: For enterprise customers

---

## Contact & Resources

- **Repository**: github.com/peersclub/AIcostguardian.com
- **Deployment**: aicostguardian.com
- **Support**: support@aicostguardian.com (to be set up)
- **Documentation**: docs.aicostguardian.com (planned)

---

*Last Updated: August 2025*
*Version: 1.0.0-beta*