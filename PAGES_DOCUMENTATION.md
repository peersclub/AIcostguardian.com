# AI Cost Guardian - Complete Pages Documentation

## 🚀 Quick Start
1. Run `npm run dev` to start the development server
2. Access the application at `http://localhost:3000`
3. Sign in with Google OAuth to access all features

---

## 📄 All Application Pages

### 1. **Landing Page**
- **URL**: `/`
- **File**: `/app/page.tsx`
- **Description**: Modern landing page with hero section, features showcase, pricing tiers, and testimonials
- **Access**: Public (no authentication required)
- **Features**:
  - Hero section with gradient animations
  - Feature cards showcasing capabilities
  - Pricing comparison table
  - Customer testimonials
  - Call-to-action buttons

### 2. **Authentication Pages**

#### Sign In
- **URL**: `/auth/signin`
- **File**: `/app/auth/signin/page.tsx`
- **Description**: Beautiful sign-in page with Google OAuth integration
- **Access**: Public
- **Features**:
  - Google Sign-In button
  - Animated gradient background
  - Security badges
  - Responsive design

#### Sign In Error
- **URL**: `/auth/error`
- **File**: `/app/auth/error/page.tsx`
- **Description**: Error page for authentication failures
- **Access**: Public

### 3. **Dashboard**
- **URL**: `/dashboard`
- **File**: `/app/dashboard/page.tsx`
- **Description**: Main dashboard with AI usage analytics and cost tracking
- **Access**: Requires authentication
- **Features**:
  - Real-time usage statistics
  - Cost breakdown by provider
  - Monthly trends chart
  - Token usage visualization
  - Quick actions panel
  - Recent activity feed

### 4. **Settings Page** ⭐
- **URL**: `/settings`
- **File**: `/app/settings/page.tsx`
- **Description**: Comprehensive settings management with API key configuration
- **Access**: Requires authentication
- **Features**:
  - **API Keys Tab**: 
    - Add/Edit/Delete API keys for all providers
    - Real-time validation before saving
    - Admin/Organization key detection
    - Encrypted storage in database
    - Test functionality for each key
    - Links to detailed test pages
  - **General Tab**: Default model preferences, temperature settings
  - **Team Tab**: Team member management
  - **Security Tab**: 2FA, encryption status, activity logs

### 5. **AI Provider Test Pages** 🧪

#### OpenAI Test Page
- **URL**: `/api/openai/test`
- **File**: `/app/api/[provider]/test/page.tsx`
- **Description**: Test OpenAI API keys with CURL commands
- **Access**: Requires authentication
- **Features**:
  - API key input or use stored key
  - Model selection (GPT-4o, GPT-3.5, etc.)
  - Custom prompt testing
  - CURL command generation
  - Direct OpenAI API CURL
  - Response viewer

#### Claude Test Page
- **URL**: `/api/claude/test`
- **File**: `/app/api/[provider]/test/page.tsx`
- **Description**: Test Anthropic Claude API keys
- **Access**: Requires authentication
- **Features**:
  - Claude model selection
  - Admin key detection
  - CURL commands for Claude API
  - Response formatting

#### Claude Admin Test Page
- **URL**: `/api/claude-admin/test`
- **File**: `/app/api/[provider]/test/page.tsx`
- **Description**: Special page for Claude Admin keys
- **Access**: Requires authentication
- **Features**:
  - Admin key validation
  - Organization management info

#### Gemini Test Page
- **URL**: `/api/gemini/test`
- **File**: `/app/api/[provider]/test/page.tsx`
- **Description**: Test Google Gemini API keys
- **Access**: Requires authentication
- **Features**:
  - Gemini model selection
  - Google AI API CURL commands

#### Grok Test Page
- **URL**: `/api/grok/test`
- **File**: `/app/api/[provider]/test/page.tsx`
- **Description**: Test X.AI Grok API keys
- **Access**: Requires authentication
- **Features**:
  - Grok model selection
  - X.AI API testing

### 6. **Analytics Pages** 📊

#### Usage Analytics
- **URL**: `/analytics/usage`
- **File**: `/app/analytics/usage/page.tsx`
- **Description**: Detailed usage analytics and metrics
- **Access**: Requires authentication
- **Features**:
  - Token usage over time
  - Model usage breakdown
  - Cost analysis
  - Export functionality

#### Trends Analytics
- **URL**: `/analytics/trends`
- **File**: `/app/analytics/trends/page.tsx`
- **Description**: Trend analysis and predictions
- **Access**: Requires authentication
- **Features**:
  - Usage trends
  - Cost projections
  - Comparative analysis

#### Providers Analytics
- **URL**: `/analytics/providers`
- **File**: `/app/analytics/providers/page.tsx`
- **Description**: Provider-specific analytics
- **Access**: Requires authentication
- **Features**:
  - Provider comparison
  - Performance metrics
  - Cost efficiency analysis

### 7. **AI Cost Calculator**
- **URL**: `/ai-cost-calculator`
- **File**: `/app/ai-cost-calculator/page.tsx`
- **Description**: Interactive cost calculator for AI usage
- **Access**: Requires authentication
- **Features**:
  - Real-time cost calculation
  - Multi-provider comparison
  - Token-based pricing
  - Monthly cost projections

### 8. **Billing Page**
- **URL**: `/billing`
- **File**: `/app/billing/page.tsx`
- **Description**: Billing and subscription management
- **Access**: Requires authentication
- **Features**:
  - Current plan details
  - Usage-based billing
  - Invoice history
  - Payment methods

### 9. **Team Management**
- **URL**: `/team`
- **File**: `/app/team/page.tsx`
- **Description**: Team collaboration and management
- **Access**: Requires authentication
- **Features**:
  - Team member list
  - Role management
  - Invitation system
  - Activity tracking

### 10. **Onboarding Flow** 🎯

#### Onboarding Setup
- **URL**: `/onboarding/setup`
- **File**: `/app/onboarding/setup/page.tsx`
- **Description**: Initial setup wizard for new users
- **Access**: Requires authentication (first-time users)
- **Features**:
  - Step-by-step setup
  - Provider selection
  - API key configuration
  - Initial preferences

### 11. **Provider Management**
- **URL**: `/providers`
- **File**: `/app/providers/page.tsx`
- **Description**: Manage AI provider integrations
- **Access**: Requires authentication
- **Features**:
  - Provider list
  - Enable/disable providers
  - Configuration management

### 12. **Super Admin Panel** 👑
- **URL**: `/superadmin`
- **File**: `/app/superadmin/page.tsx`
- **Description**: Administrative panel for system management
- **Access**: Requires admin role
- **Features**:
  - User management
  - System settings
  - Database management
  - Analytics overview

### 13. **AI Usage Monitoring Dashboard** 🎯
- **URL**: `/monitoring/dashboard`
- **File**: `/app/monitoring/dashboard/page.tsx`
- **Description**: Real-time AI usage monitoring across all providers
- **Access**: Requires authentication
- **Features**:
  - **Real-time monitoring**: Live usage updates every 5 seconds
  - **Multi-provider tracking**: OpenAI, Claude, Gemini, Grok
  - **Cost analytics**: Real-time cost breakdown and projections
  - **Interactive charts**: Provider usage, model performance, trends
  - **Intelligent insights**: AI-powered optimization suggestions
  - **Alert management**: Set cost thresholds and notifications
  - **Export reports**: CSV/JSON data export
  - **5 main tabs**:
    - Overview: Summary cards and charts
    - Providers: Detailed provider breakdown
    - Insights: Optimization recommendations
    - Alerts: Cost monitoring setup
    - Reports: Data export and analytics

### 14. **Monitoring Test Suite**
- **URL**: `/monitoring/test`
- **File**: `/app/monitoring/test/page.tsx`
- **Description**: Test suite for monitoring features
- **Access**: Requires authentication
- **Features**:
  - Test all monitoring APIs
  - Generate sample usage data
  - Verify real-time updates
  - Test alert functionality

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET /api/auth/session` - Get current session

### API Key Management
- `GET /api/api-keys` - Fetch user's API keys
- `POST /api/api-keys` - Save new API key
- `DELETE /api/api-keys?id={keyId}` - Delete API key
- `GET /api/settings/api-keys` - Alternative endpoint for settings

### Provider Test Endpoints
- `GET /api/openai/test` - Check OpenAI configuration
- `POST /api/openai/test` - Test OpenAI API key
- `GET /api/claude/test` - Check Claude configuration
- `POST /api/claude/test` - Test Claude API key
- `GET /api/claude-admin/test` - Check Claude Admin configuration
- `POST /api/claude-admin/test` - Test Claude Admin key
- `GET /api/gemini/test` - Check Gemini configuration
- `POST /api/gemini/test` - Test Gemini API key
- `GET /api/grok/test` - Check Grok configuration
- `POST /api/grok/test` - Test Grok API key

### Onboarding & Providers
- `GET /api/onboarding` - Get onboarding status
- `POST /api/onboarding` - Update onboarding progress
- `GET /api/providers` - Get provider configurations
- `POST /api/providers` - Update provider settings

### Monitoring & Analytics
- `GET /api/monitoring/usage` - Fetch usage data
- `POST /api/monitoring/usage` - Store usage metrics
- `GET /api/monitoring/alerts` - Get active alerts
- `POST /api/monitoring/alerts` - Create/update alerts
- `GET /api/monitoring/insights` - Get AI-powered insights
- `GET /api/monitoring/export` - Export usage data (CSV/JSON)
- `WS /api/monitoring/websocket` - Real-time usage streaming
- `POST /api/notifications` - Send notifications

---

## 🎨 Key Components

### Shared Components
- `/components/AuthWrapper.tsx` - Authentication wrapper
- `/components/Navigation.tsx` - Main navigation
- `/components/settings/ApiKeyManager.tsx` - API key management UI
- `/components/ui/ai-logos.tsx` - AI provider logos
- `/components/shared/ErrorStates.tsx` - Error display components
- `/components/shared/LoadingStates.tsx` - Loading animations

### Provider Components
- `/components/providers/ProviderCard.tsx` - Provider display card
- `/components/providers/ProviderSetup.tsx` - Provider setup wizard
- `/components/onboarding/OnboardingSteps.tsx` - Onboarding flow

---

## 🔐 Access Control

### Public Pages (No Auth Required)
- `/` - Landing page
- `/auth/signin` - Sign in page
- `/auth/error` - Auth error page

### Protected Pages (Auth Required)
- `/dashboard` - Main dashboard
- `/settings` - Settings management
- `/analytics/*` - All analytics pages
- `/ai-cost-calculator` - Cost calculator
- `/billing` - Billing management
- `/team` - Team management
- `/api/*/test` - All API test pages

### Admin Only Pages
- `/superadmin` - Super admin panel

---

## 🚦 Navigation Flow

1. **New User Flow**:
   - Landing Page → Sign In → Onboarding Setup → Dashboard

2. **Returning User Flow**:
   - Sign In → Dashboard → Settings (for API keys) → Test Pages

3. **API Key Setup Flow**:
   - Settings → Add API Key → Test Key → Save → Use in Dashboard

4. **Testing Flow**:
   - Settings → Click "Details" on any key → Test Page → Enter prompt → Test → View CURL

---

## 🛠️ Development Tips

### Adding a New Page
1. Create file in `/app/[page-name]/page.tsx`
2. Add authentication with `AuthWrapper` if needed
3. Import shared components from `/components`
4. Add to navigation if needed

### Testing API Keys
1. Go to Settings (`/settings`)
2. Add your API key
3. Click "Test Key" to validate
4. Click "Details" for CURL commands
5. Use the test page for detailed testing

### Database Queries
- API keys are stored encrypted in PostgreSQL
- Use Prisma client for database operations
- Check `/prisma/schema.prisma` for schema

---

## 📦 Environment Variables

Required for full functionality:
```env
# Database
DATABASE_URL="your-neon-database-url"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-key"
```

---

## 🎯 Quick Access Links

When running locally (`npm run dev`):

- **Main App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Settings**: http://localhost:3000/settings
- **Monitoring Dashboard**: http://localhost:3000/monitoring/dashboard
- **OpenAI Test**: http://localhost:3000/api/openai/test
- **Claude Test**: http://localhost:3000/api/claude/test
- **Gemini Test**: http://localhost:3000/api/gemini/test
- **Grok Test**: http://localhost:3000/api/grok/test
- **Monitoring Test**: http://localhost:3000/monitoring/test

---

## 📝 Notes

- All API keys are encrypted using AES-256-GCM before storage
- The system supports both admin and regular API keys
- Test pages can be accessed directly or via Settings page links
- Provider IDs: `openai`, `claude`, `gemini`, `grok`
- Database provider names: `openai`, `anthropic`, `google`, `xai`