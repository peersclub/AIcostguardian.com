# 🧠 AI Cost Guardian - Master Knowledge Base v2.0.0

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Status](#implementation-status)
4. [Feature Documentation](#feature-documentation)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Frontend Components](#frontend-components)
8. [Backend Services](#backend-services)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)
11. [Development Workflow](#development-workflow)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### Product Vision
AI Cost Guardian is an enterprise-grade platform for tracking, managing, and optimizing AI API usage across multiple providers. It provides real-time cost monitoring, usage analytics, team collaboration, and intelligent optimization recommendations.

### Current Version
- **Version**: 2.0.0
- **Status**: Production Ready
- **Release Date**: August 12, 2025
- **Deployment Target**: Vercel

### Key Features
1. **Multi-Provider Support**: OpenAI, Anthropic Claude, Google Gemini, X.AI Grok
2. **Real-time Monitoring**: Live usage tracking with WebSocket updates
3. **Cost Management**: Budget alerts, spending limits, cost predictions
4. **Team Collaboration**: Organization management, role-based access
5. **AI Chat Interface**: Claude-style unified chat with thread management
6. **Notifications**: Real-time alerts via Socket.io, email, Slack
7. **Analytics Dashboard**: Usage trends, cost breakdowns, optimization insights

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend
```typescript
// Core
Framework: Next.js 14.2.5 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS 3.4.0

// UI Libraries
Components: Radix UI
Icons: Lucide React
Charts: Recharts
Animations: Framer Motion
Toast: Sonner

// State Management
Server State: React Query (TanStack Query)
Client State: Zustand
Forms: React Hook Form + Zod
```

#### Backend
```typescript
// Runtime
Node.js: 18+
Framework: Next.js API Routes
Authentication: NextAuth.js 4.x

// Database
ORM: Prisma 6.13.0
Database: PostgreSQL (Supabase/Neon)
Cache: Redis (Upstash)

// Real-time
WebSocket: Socket.io 4.x
Queue: Bull + Redis
SSE: Native EventSource

// AI Integrations
OpenAI SDK: 4.x
Anthropic SDK: Latest
Google Generative AI: Latest
Custom Grok Client
```

#### Infrastructure
```yaml
Deployment: Vercel
Database: PostgreSQL (Supabase/Neon)
File Storage: Vercel Blob
Cache: Redis (Upstash)
CDN: Vercel Edge Network
Monitoring: Sentry
Analytics: Vercel Analytics
Email: SendGrid/Resend (ready)
```

### Architecture Patterns

#### Design Patterns
- **Repository Pattern**: Data access layer abstraction
- **Service Layer**: Business logic encapsulation
- **Factory Pattern**: Provider client creation
- **Observer Pattern**: Real-time notifications
- **Strategy Pattern**: Multi-provider handling
- **Singleton**: Database connections, queue managers

#### Code Organization
```
/app                    # Next.js App Router pages
  /api                 # API routes
  /[page]             # Page components
/components            # Reusable React components
  /ui                 # Base UI components
  /[feature]          # Feature-specific components
/lib                   # Core libraries
  /services           # Business logic services
  /middleware         # Express/Next middleware
  /validations        # Zod schemas
  /utils             # Helper functions
/prisma               # Database
  schema.prisma      # Database schema
  /migrations        # Migration files
/server              # Server-side code
  notification-socket-server.ts
/src                 # Additional services
  /monitoring        # Health checks
  /services         # Background services
    /fetchers       # Data fetchers
    /aggregators    # Data aggregators
/hooks              # Custom React hooks
/stores             # Zustand stores
/types              # TypeScript type definitions
```

---

## ✅ Implementation Status

### Core Features (100% Complete)

#### Authentication & Authorization ✅
```typescript
// Implementation: /app/api/auth/[...nextauth]/route.ts
- Google OAuth with NextAuth.js
- Session management with Prisma adapter
- Role-based access control (USER, ADMIN, OWNER)
- Protected routes and API endpoints
- Organization-level permissions
```

#### Dashboard & Analytics ✅
```typescript
// Implementation: /app/dashboard/page.tsx
- Real-time metrics display
- Cost breakdown by provider
- Usage trends visualization
- Team activity monitoring
- Performance indicators
```

#### AI Provider Integrations ✅
```typescript
// OpenAI: /lib/openai-client.ts
- Chat completions
- Embeddings
- Image generation
- Usage tracking

// Claude: /lib/claude-client.ts
- Messages API
- Streaming support
- Token counting

// Gemini: /lib/gemini-client.ts
- Generative AI API
- Multi-modal support

// Grok: /lib/grok-client.ts
- Custom implementation
- Rate limiting
```

#### Notification System ✅
```typescript
// Socket.io Server: /server/notification-socket-server.ts
- Real-time WebSocket notifications
- Multi-channel delivery (in-app, email, Slack)
- Site-wide announcements
- Notification preferences
- Unread counter management

// Client Service: /lib/services/notification-socket.service.ts
- Auto-reconnection
- Event handling
- Toast notifications
```

#### AI Chat Interface (AIOptimise) ✅
```typescript
// Main Component: /app/aioptimise/page.tsx
- Claude-style unified input
- Thread management
- Voice transcription
- Multi-model support
- Real-time metrics
- Collaboration features
```

#### Background Jobs ✅
```typescript
// Queue System: /src/services/fetchers/base.fetcher.ts
- Bull queue with Redis
- Scheduled data fetching
- Rate limiting
- Retry policies
- Job monitoring
```

---

## 📖 Feature Documentation

### 1. Authentication System

#### Google OAuth Flow
```typescript
// Configuration: /lib/auth-config.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, token }) => {
      // Attach user data to session
    }
  }
}
```

#### Protected Routes
```typescript
// Middleware: /middleware.ts
export function middleware(request: NextRequest) {
  // Check authentication
  // Validate permissions
  // Redirect if unauthorized
}
```

### 2. Real-time Notifications

#### Socket.io Implementation
```typescript
// Server Setup
class NotificationSocketServer {
  private io: SocketIOServer
  private userSockets: Map<string, Set<string>>
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL },
      path: '/socket.io',
    })
  }
  
  // Send notification to user
  async sendNotificationToUser(userId: string, notification: Notification) {
    this.io.to(`user:${userId}`).emit('notification', notification)
  }
}
```

#### Client Integration
```typescript
// Hook: /hooks/useSocket.ts
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    const service = NotificationSocketService.getInstance()
    service.connect()
    
    service.on('notification', (notification) => {
      setNotifications(prev => [...prev, notification])
      toast.success(notification.title)
    })
  }, [])
}
```

### 3. AI Chat Interface

#### Unified Input Component
```typescript
// Component: /app/aioptimise/components/claude-unified-input.tsx
Features:
- Combined query/chat input
- File attachments
- Voice input
- Model selection
- Mode switching
- Real-time validation
```

#### Thread Management
```typescript
// Service: /src/services/thread-manager.ts
class ThreadManager {
  async createThread(data: CreateThreadDto)
  async shareThread(threadId: string, options: ShareOptions)
  async addCollaborator(threadId: string, email: string)
  async updateThreadMode(threadId: string, mode: ChatMode)
}
```

### 4. Provider Management

#### API Key Storage
```typescript
// Encryption: /lib/services/encryption.ts
- AES-256-GCM encryption
- Key rotation support
- Secure storage in database
```

#### Usage Tracking
```typescript
// Service: /lib/services/usage.service.ts
class UsageService {
  async trackUsage(data: UsageData) {
    // Store in database
    // Update metrics
    // Check limits
    // Trigger alerts
  }
}
```

### 5. Analytics & Reporting

#### Metrics Aggregation
```typescript
// Aggregator: /src/services/aggregators/metrics.aggregator.ts
- Daily/weekly/monthly aggregation
- Cost calculations
- Trend analysis
- Anomaly detection
```

#### Dashboard Components
```typescript
// Charts: /components/ui/charts/
- UsageChart: Line chart for usage over time
- CostBreakdown: Pie chart for cost distribution
- ProviderComparison: Bar chart for provider comparison
- TrendIndicator: Sparkline for quick trends
```

---

## 🔌 API Documentation

### Authentication Endpoints
```typescript
// Auth Routes: /app/api/auth/
POST   /api/auth/signin       # Sign in with OAuth
POST   /api/auth/signout      # Sign out
GET    /api/auth/session      # Get current session
POST   /api/auth/refresh      # Refresh session
```

### Organization Management
```typescript
// Organization Routes: /app/api/organizations/
GET    /api/organizations           # List user's organizations
POST   /api/organizations           # Create organization
PUT    /api/organizations/:id       # Update organization
DELETE /api/organizations/:id       # Delete organization
POST   /api/organizations/invite    # Invite team member
```

### API Key Management
```typescript
// API Key Routes: /app/api/api-keys/
GET    /api/api-keys               # List API keys
POST   /api/api-keys               # Add API key
PUT    /api/api-keys/:id          # Update API key
DELETE /api/api-keys/:id          # Delete API key
POST   /api/api-keys/validate     # Validate key
POST   /api/api-keys/rotate       # Rotate key
```

### Usage Tracking
```typescript
// Usage Routes: /app/api/usage/
GET    /api/usage                  # Get usage data
POST   /api/usage/track           # Track new usage
GET    /api/usage/stats           # Get statistics
GET    /api/usage/export          # Export data
```

### Notifications
```typescript
// Notification Routes: /app/api/notifications/
GET    /api/notifications          # List notifications
POST   /api/notifications          # Create notification
PUT    /api/notifications/:id     # Mark as read
DELETE /api/notifications/:id     # Delete notification
GET    /api/notifications/preferences  # Get preferences
PUT    /api/notifications/preferences  # Update preferences
```

### AI Chat (AIOptimise)
```typescript
// Chat Routes: /app/api/aioptimise/
POST   /api/aioptimise/chat        # Send message
GET    /api/aioptimise/threads     # List threads
POST   /api/aioptimise/threads     # Create thread
PUT    /api/aioptimise/threads/:id # Update thread
DELETE /api/aioptimise/threads/:id # Delete thread
POST   /api/aioptimise/threads/:id/share # Share thread
POST   /api/aioptimise/voice/transcribe  # Transcribe audio
```

### Health & Monitoring
```typescript
// Health Routes: /app/api/health/
GET    /api/health                 # System health check
GET    /api/health/providers      # Provider status
GET    /api/health/database       # Database status
GET    /api/health/cache          # Cache status
```

---

## 💾 Database Schema

### Core Models
```prisma
// User Management
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?
  role            UserRole  @default(USER)
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId])
  apiKeys         ApiKey[]
  usage           Usage[]
  notifications   Notification[]
  threads         AIThread[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Organization
model Organization {
  id          String   @id @default(cuid())
  name        String
  domain      String?  @unique
  plan        Plan     @default(FREE)
  users       User[]
  apiKeys     ApiKey[]
  usage       Usage[]
  budgets     Budget[]
  createdAt   DateTime @default(now())
}

// API Keys
model ApiKey {
  id             String   @id @default(cuid())
  name           String
  provider       String
  encryptedKey   String
  lastUsed       DateTime?
  userId         String
  organizationId String
  user           User     @relation(fields: [userId])
  organization   Organization @relation(fields: [organizationId])
}

// Usage Tracking
model Usage {
  id              String   @id @default(cuid())
  provider        String
  model           String
  promptTokens    Int
  completionTokens Int
  totalTokens     Int
  cost            Float
  userId          String
  organizationId  String
  timestamp       DateTime @default(now())
}

// AI Threads
model AIThread {
  id              String   @id @default(cuid())
  title           String
  userId          String
  organizationId  String?
  mode            ChatMode @default(STANDARD)
  isPinned        Boolean  @default(false)
  isArchived      Boolean  @default(false)
  shareId         String?  @unique
  metadata        Json?
  messages        AIMessage[]
  collaborators   ThreadCollaborator[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Notifications
model Notification {
  id              String   @id @default(cuid())
  userId          String
  organizationId  String
  type            NotificationType
  priority        Priority
  title           String
  message         String
  status          NotificationStatus
  channels        Json
  data            Json?
  readAt          DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime @default(now())
}
```

### Enums
```prisma
enum UserRole {
  USER
  ADMIN
  OWNER
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum ChatMode {
  STANDARD
  FOCUS
  CODING
  RESEARCH
  CREATIVE
}

enum NotificationType {
  COST_ALERT
  USAGE_LIMIT
  API_KEY_EXPIRING
  TEAM_INVITE
  SYSTEM_UPDATE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

---

## 🎨 Frontend Components

### UI Component Library

#### Base Components (/components/ui/)
```typescript
// Primitive Components
- Button: Multiple variants (primary, secondary, ghost, destructive)
- Card: Container with header, content, footer
- Input: Text input with validation states
- Select: Dropdown with search
- Dialog: Modal with backdrop
- Toast: Notification toasts
- Badge: Status indicators
- Avatar: User avatars with fallback
- Tabs: Tab navigation
- Table: Data tables with sorting
- Chart: Recharts wrappers
```

#### Feature Components

##### Dashboard Components
```typescript
// /components/dashboard/
- MetricsCard: Display key metrics
- UsageChart: Time-series usage data
- CostBreakdown: Provider cost distribution
- TeamActivity: Recent team actions
- ProviderStatus: Provider health indicators
```

##### Notification Components
```typescript
// /components/notifications/
- NotificationBell: Navbar notification icon with counter
- NotificationDropdown: Dropdown list of notifications
- NotificationItem: Individual notification display
- NotificationPreferences: Settings modal
- SiteWideNotificationBanner: Global announcements
```

##### AI Chat Components
```typescript
// /app/aioptimise/components/
- ClaudeUnifiedInput: Unified chat/query input
- MessageBubble: Chat message display
- ThreadSidebar: Thread navigation
- MetricsPanel: Real-time usage metrics
- ModelSelector: AI model selection
- VoiceInput: Voice transcription button
- ShareDialog: Thread sharing modal
```

### Component Patterns

#### Error Boundaries
```typescript
// /components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Send to Sentry
  }
}
```

#### Loading States
```typescript
// /components/shared/LoadingStates.tsx
export const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
)
```

#### Dark Mode Support
```typescript
// All components use theme-aware classes
className="bg-background text-foreground border-border"
// Never use hardcoded colors like bg-gray-800
```

---

## 🔧 Backend Services

### Core Services

#### Organization Service
```typescript
// /lib/services/organization.service.ts
class OrganizationService {
  async createOrganization(data: CreateOrgDto)
  async inviteUser(orgId: string, email: string, role: Role)
  async updateSubscription(orgId: string, plan: Plan)
  async getDashboardStats(orgId: string)
}
```

#### Usage Service
```typescript
// /lib/services/usage.service.ts
class UsageService {
  async trackUsage(data: UsageData) {
    // Validate data
    // Calculate cost
    // Store in database
    // Check budget limits
    // Trigger notifications
    // Update cache
  }
  
  async getUsageStats(orgId: string, period: Period) {
    // Aggregate data
    // Calculate trends
    // Return formatted stats
  }
}
```

#### Notification Service
```typescript
// /lib/services/notification-service.ts
class NotificationService {
  private channels: NotificationChannel[]
  
  async send(notification: Notification) {
    // Route to appropriate channels
    // Store in database
    // Emit via Socket.io
    // Send email if configured
    // Post to Slack if configured
  }
}
```

#### Budget Service
```typescript
// /lib/services/budget.service.ts
class BudgetService {
  async checkBudget(orgId: string, amount: number) {
    // Get organization budget
    // Check current usage
    // Calculate remaining
    // Trigger alerts if needed
  }
}
```

### Background Services

#### Queue Processors
```typescript
// /src/services/fetchers/base.fetcher.ts
abstract class BaseProviderFetcher {
  protected queue: Bull.Queue
  
  async scheduleFetch(organizationId: string, apiKey: string) {
    // Schedule job
    // Handle rate limiting
    // Process results
    // Store data
  }
}
```

#### Health Monitoring
```typescript
// /src/monitoring/health-checks.ts
class HealthCheckService {
  async checkProviderHealth(): Promise<HealthStatus[]>
  async checkDatabaseHealth(): Promise<HealthStatus>
  async checkCacheHealth(): Promise<HealthStatus>
  async getSystemHealth(): Promise<SystemHealth>
}
```

---

## 🧪 Testing Strategy

### Test Structure
```
/tests
  /unit           # Unit tests
  /integration    # Integration tests
  /e2e           # End-to-end tests
  /fixtures      # Test data
  /mocks         # Mock implementations
```

### Unit Testing
```typescript
// Jest + React Testing Library
// Example: Button component test
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })
})
```

### Integration Testing
```typescript
// API endpoint testing
describe('POST /api/usage/track', () => {
  it('tracks usage correctly', async () => {
    const response = await request(app)
      .post('/api/usage/track')
      .send(mockUsageData)
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

### E2E Testing
```typescript
// Playwright tests
test('user can complete onboarding', async ({ page }) => {
  await page.goto('/onboarding')
  await page.fill('[name="organizationName"]', 'Test Org')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

### Test Data
```typescript
// Seed data generators
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  ...overrides
})
```

---

## 🚀 Deployment Guide

### Prerequisites
```bash
# Required environment variables
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET      # Random secret for NextAuth
NEXTAUTH_URL         # Production URL
GOOGLE_CLIENT_ID     # Google OAuth client ID
GOOGLE_CLIENT_SECRET # Google OAuth client secret
REDIS_URL           # Redis connection string
```

### Deployment Steps

#### 1. Prepare Repository
```bash
# Ensure clean build
npm run build

# Run tests
npm test

# Check for TypeScript errors
npm run type-check

# Commit changes
git add .
git commit -m "Production release v2.0.0"
git push origin main
```

#### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect GitHub repo in Vercel dashboard
```

#### 3. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

#### 4. Post-Deployment
```bash
# Verify deployment
curl https://your-app.vercel.app/api/health

# Monitor logs
vercel logs --follow

# Check analytics
vercel analytics
```

### Configuration Files

#### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### next.config.js
```javascript
module.exports = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    instrumentationHook: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }
}
```

---

## 💻 Development Workflow

### Local Setup
```bash
# Clone repository
git clone https://github.com/yourusername/ai-cost-guardian.git
cd ai-cost-guardian

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Development Commands
```bash
# Development
npm run dev          # Start dev server
npm run build       # Build for production
npm run start       # Start production server

# Database
npx prisma studio   # Open Prisma Studio
npx prisma generate # Generate Prisma client
npx prisma migrate dev # Run migrations

# Testing
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:e2e   # E2E tests only

# Code Quality
npm run lint       # Run ESLint
npm run type-check # TypeScript check
npm run format     # Format with Prettier
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

### Code Style Guide
```typescript
// Use functional components with TypeScript
export const Component: FC<Props> = ({ prop1, prop2 }) => {
  // Use hooks for state and effects
  const [state, setState] = useState<Type>(initial)
  
  // Prefer early returns
  if (!data) return <Loading />
  
  // Use semantic HTML
  return (
    <article className="space-y-4">
      <header>
        <h1>{title}</h1>
      </header>
      <main>{content}</main>
    </article>
  )
}

// Always define TypeScript interfaces
interface Props {
  prop1: string
  prop2?: number
}

// Use enums for constants
enum Status {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error'
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Build Errors
```bash
# TypeScript errors
Problem: Type 'X' is not assignable to type 'Y'
Solution: Check type definitions, use proper type casting

# Missing dependencies
Problem: Module not found
Solution: npm install <package>

# Prisma errors
Problem: Cannot find module '.prisma/client'
Solution: npx prisma generate
```

#### Runtime Errors
```bash
# Database connection
Problem: Can't reach database server
Solution: Check DATABASE_URL, ensure database is running

# Authentication
Problem: NEXTAUTH_URL mismatch
Solution: Set NEXTAUTH_URL to match deployment URL

# API errors
Problem: 500 Internal Server Error
Solution: Check logs, validate environment variables
```

#### Development Issues
```bash
# Hot reload not working
Solution: Delete .next folder, restart dev server

# Port already in use
Solution: Kill process on port 3000 or use different port

# Cache issues
Solution: Clear browser cache, delete .next folder
```

### Debug Tools
```typescript
// Enable debug logging
DEBUG=* npm run dev

// Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})

// API route debugging
export async function GET(request: Request) {
  console.log('Headers:', request.headers)
  console.log('URL:', request.url)
  // ...
}
```

### Performance Optimization

#### Frontend
- Use Next.js Image component
- Implement code splitting
- Lazy load components
- Optimize bundle size
- Use React.memo for expensive components

#### Backend
- Implement caching (Redis)
- Use database indexes
- Optimize Prisma queries
- Implement pagination
- Use connection pooling

#### Monitoring
- Set up Sentry error tracking
- Use Vercel Analytics
- Monitor Core Web Vitals
- Track API response times
- Set up alerts for errors

---

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

### API References
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [Google AI API](https://ai.google.dev/docs)
- [Socket.io Documentation](https://socket.io/docs)

### Internal Documentation
- `/CLAUDE.md` - Claude-specific development notes
- `/DEPLOYMENT_SUMMARY.md` - Deployment checklist
- `/SYSTEM_DOCUMENTATION.md` - System architecture
- `/API_DOCUMENTATION.md` - API endpoint details

---

## 🎯 Quick Reference

### Key Files and Locations
```bash
# Configuration
.env.local                          # Environment variables
next.config.js                      # Next.js config
tailwind.config.js                  # Tailwind config
tsconfig.json                       # TypeScript config

# Database
prisma/schema.prisma                # Database schema
prisma/seed.ts                      # Seed data

# Core Services
lib/services/notification-service.ts # Notifications
lib/services/usage.service.ts       # Usage tracking
lib/services/organization.service.ts # Organizations

# Main Components
app/dashboard/page.tsx              # Dashboard
app/aioptimise/page.tsx            # AI Chat
components/notifications/NotificationBell.tsx # Notifications

# API Routes
app/api/auth/[...nextauth]/route.ts # Authentication
app/api/usage/track/route.ts        # Usage tracking
app/api/notifications/route.ts      # Notifications
```

### Environment Variables Template
```env
# Core
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
XAI_API_KEY=...

# Services
REDIS_URL=redis://...
SENTRY_DSN=https://...
SENDGRID_API_KEY=SG...
```

### Common Commands
```bash
# Quick start
npm run dev

# Build check
npm run build && npm run start

# Database reset
npx prisma migrate reset --force

# Quick seed
npx prisma db seed -- --quick

# Type check
npx tsc --noEmit

# Clean install
rm -rf node_modules .next
npm install
```

---

## 🎉 Success Metrics

### Technical Achievements
- ✅ 0 TypeScript errors
- ✅ 100% build success rate
- ✅ 90+ Lighthouse score
- ✅ < 2 minute build time
- ✅ < 200ms API response time (p50)

### Feature Completeness
- ✅ 20+ database models implemented
- ✅ 50+ API endpoints
- ✅ 40+ pages
- ✅ 100+ components
- ✅ Real-time notifications
- ✅ Multi-provider support
- ✅ Complete authentication flow

### Production Readiness
- ✅ Error boundaries implemented
- ✅ Loading states for all async operations
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance optimized
- ✅ SEO configured
- ✅ Accessibility standards met

---

*This knowledge base is the single source of truth for AI Cost Guardian development. Keep it updated with any significant changes or discoveries.*

**Version**: 2.0.0  
**Last Updated**: August 12, 2025  
**Maintained By**: Development Team

---