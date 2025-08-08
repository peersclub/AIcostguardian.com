# AI Cost Guardian - Quick Context File

> **Use this file as context when working on the AI Cost Guardian codebase**

## 🎯 What We're Building
**AI Cost Guardian** - A unified platform to track, control, and optimize AI API costs across all major providers (OpenAI, Claude, Gemini, etc.)

## 🔑 Core Problem
Companies spend $10K-$1M+ monthly on AI with no visibility, control, or optimization. We solve this by providing a single dashboard for all AI costs.

## 🏗️ Current State
- **Frontend**: ✅ 90% complete (beautiful UI, all pages built)
- **Backend**: ❌ 10% complete (mostly mock data)
- **Database**: ❌ Not implemented
- **Authentication**: ✅ Google OAuth working
- **Deployment**: ✅ Vercel configured

## 🎨 Tech Stack
```
Frontend:  Next.js 14, React 18, TypeScript, Tailwind CSS
Backend:   Next.js API Routes (Node.js)
Auth:      NextAuth.js (Google OAuth)
Database:  PostgreSQL (planned, not implemented)
Deploy:    Vercel
Providers: OpenAI, Anthropic, Google Gemini SDKs
```

## 📁 Project Structure
```
/anthropic-quickstarts/
├── app/                    # Next.js App Router
│   ├── (pages)/           # All page components
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout with auth
├── components/            # Reusable React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   └── shared/           # Shared components
├── lib/                   # Core libraries
│   ├── *-client.ts       # Provider API clients
│   ├── auth-config.ts    # NextAuth configuration
│   └── utils.ts          # Utility functions
├── public/               # Static assets (favicon, etc.)
└── types/                # TypeScript definitions
```

## 🔥 Critical Missing Pieces
1. **Database** - No data persistence
2. **Real API Calls** - All data is mocked
3. **API Key Encryption** - Security issue
4. **Payment Processing** - No Stripe integration
5. **Real-time Updates** - No WebSockets

## 🚀 Quick Commands
```bash
# Development
npm run dev          # Start dev server on :3000

# Build & Deploy
npm run build        # Build for production
git push origin main # Auto-deploy to Vercel

# Add new feature
1. Create UI in app/[feature]/page.tsx
2. Add API route in app/api/[feature]/route.ts
3. Create client in lib/[feature]-client.ts
4. Add types in types/[feature].ts
```

## 🔐 Environment Variables
```env
# Required for dev (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<any-random-string-for-dev>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>

# Provider API Keys (when implemented)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GEMINI_API_KEY=
```

## 📝 Key Files to Know
```typescript
// Core configuration
app/layout.tsx           // Root layout with providers
lib/auth-config.ts       // NextAuth setup
middleware.ts            // Route protection

// Mock data provider
components/DemoDataProvider.tsx  // Provides all mock data

// API clients (partially implemented)
lib/openai-client.ts     // OpenAI API wrapper
lib/claude-client.ts     // Claude API wrapper
lib/gemini-client.ts     // Gemini API wrapper

// Main pages
app/dashboard/page.tsx   // Main dashboard
app/settings/page.tsx    // API key management
app/analytics/*/         // Analytics pages
```

## 🎯 Current Sprint Focus
1. Set up PostgreSQL database
2. Implement user data persistence
3. Create real API provider integrations
4. Add API key encryption
5. Build usage tracking system

## 💡 Design Patterns Used
- **Provider Pattern**: DemoDataProvider for mock data
- **Compound Components**: UI components with sub-components
- **API Routes**: RESTful API design
- **Server Components**: Where possible for performance
- **Client Components**: For interactivity ("use client")

## 🐛 Known Issues
1. API keys stored in localStorage (not secure)
2. No rate limiting on API routes
3. Mock data sometimes inconsistent
4. No error tracking
5. No loading states in some areas

## 🔗 Important Links
- **Live Site**: https://aicostguardian.com
- **GitHub**: https://github.com/peersclub/AIcostguardian.com
- **Vercel Dashboard**: https://vercel.com/team/dashboard
- **Google OAuth Console**: https://console.cloud.google.com

## 📊 Feature Status
| Feature | UI | Backend | Status |
|---------|-----|---------|--------|
| Dashboard | ✅ | ❌ | Frontend only |
| Auth | ✅ | ✅ | Working |
| API Keys | ✅ | 🔧 | Local storage |
| Usage Tracking | ✅ | ❌ | Mock data |
| Team Management | ✅ | ❌ | Mock data |
| Billing | ✅ | ❌ | Static UI |
| Alerts | ✅ | ❌ | UI only |

## 🎨 UI Components Available
```typescript
// Import from components/ui/
Button, Card, Dialog, Input, Select, Table, Tabs,
Badge, Alert, Progress, Switch, Textarea, Label,
Separator, PremiumButton, PremiumCard, AILogos
```

## 🔄 Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

## 🆘 Common Tasks

### Add a new page
1. Create `app/your-page/page.tsx`
2. Add navigation in `components/Navigation.tsx`
3. Protect route in `middleware.ts` if needed

### Add new API endpoint
1. Create `app/api/your-endpoint/route.ts`
2. Export async functions: GET, POST, PUT, DELETE
3. Add authentication check if needed

### Add new provider
1. Create `lib/provider-client.ts`
2. Add to `lib/ai-providers-config.ts`
3. Create API routes in `app/api/provider/`
4. Add UI in settings page

## 🎯 Remember
- **Most UI is done** - Focus on backend
- **Use TypeScript** - Already configured
- **Mock data exists** - In DemoDataProvider
- **Auth works** - Google OAuth is set up
- **Deploy is automatic** - Push to main = deploy

---

*Use this context file when working on AI Cost Guardian. It has everything you need to know.*