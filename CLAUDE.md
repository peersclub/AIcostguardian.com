# Claude Development Memory

## Next.js API Routes - CRITICAL

**ALWAYS add this to API routes that use authentication or database:**
```typescript
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
```

This prevents Next.js from attempting static generation during build, which will fail for routes that:
- Use `getServerSession()` or any auth
- Make database queries with Prisma
- Access request headers or cookies
- Depend on runtime environment variables

## Common Build Issues & Solutions

### 1. Vercel Build Failures
- **Error**: "Failed to collect page data for /api/..."
- **Solution**: Add `export const dynamic = 'force-dynamic'` to the route

### 2. Prisma Field Mismatches
- **Always verify** field names match the Prisma schema
- Common mismatches:
  - `inputTokens` → `promptTokens`
  - `outputTokens` → `completionTokens`
  - `operation` → store in `metadata` field instead
  - `updatedAt` → automatically managed by Prisma

### 3. TypeScript Map/Set Iteration
- **Error**: "can only be iterated through when using the '--downlevelIteration' flag"
- **Solution**: Use `Array.from()`:
  ```typescript
  // ❌ Wrong
  for (const [key, value] of myMap.entries()) {}
  
  // ✅ Correct
  for (const [key, value] of Array.from(myMap.entries())) {}
  ```

### 4. Session Type Issues
- Session objects often need type casting:
  ```typescript
  const session = await getServerSession(authOptions) as any
  ```

## Project-Specific Commands

### Build & Test
```bash
npm run build          # Test build locally BEFORE pushing
npm run lint          # Check for linting issues
npm run typecheck     # Check TypeScript types
```

### Database
```bash
npx prisma generate   # After schema changes
npx prisma db push    # Push schema to database
npx prisma studio     # View database in browser
```

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `ENCRYPTION_KEY` - 64-character hex encryption key (CRITICAL for API key decryption)

## Testing Checklist Before Deploy
1. ✅ Run `npm run build` locally
2. ✅ Check all TypeScript errors are resolved
3. ✅ Verify API routes have `dynamic` export
4. ✅ Verify pages with auth have `dynamic` export
5. ✅ Test authentication flow
6. ✅ Verify database connections work

## Pages That Need Dynamic Rendering
Pages that use authentication or database queries ALSO need the dynamic export:
```typescript
// app/dashboard/page.tsx or any page with auth
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  // ...
}
```

## Theme & Dark Mode Best Practices - CRITICAL

**NEVER use hardcoded colors like `text-gray-*` or `bg-gray-*` for text/UI elements**

Always use theme-aware Tailwind classes:
- `text-foreground` - Primary text color (adapts to theme)
- `text-muted-foreground` - Secondary/muted text
- `bg-background` - Page background
- `bg-card` - Card backgrounds
- `bg-muted` - Muted backgrounds
- `border-border` - Border colors
- `text-primary` - Primary brand color text
- `bg-primary` - Primary brand color background

### Common Replacements:
```
❌ text-gray-200 → ✅ text-foreground
❌ text-gray-400 → ✅ text-muted-foreground  
❌ text-gray-600 → ✅ text-muted-foreground
❌ bg-gray-800 → ✅ bg-card or bg-muted
❌ border-gray-700 → ✅ border-border
```

### Tables & Lists:
```typescript
// ✅ Correct table styling
<table className="w-full text-sm text-foreground">
  <thead>
    <tr className="border-b border-border">
      <th className="text-left py-2 text-foreground font-medium">...</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="py-2 text-foreground">...</td>
    </tr>
  </tbody>
</table>
```

### Form Controls:
```typescript
// ✅ Correct select/button styling
<SelectTrigger className="bg-background text-foreground border-border">
<Button className="text-foreground border-border">
```

## AI Provider Logos
- The project uses AI provider logos (OpenAI, Anthropic, Gemini, etc.) not company branding
- Located in: `/components/ui/ai-logos.tsx`
- Usage: `getAIProviderLogo(provider)` returns the appropriate logo component

## Known Pending Items
- Email Notifications - Needs SendGrid/Resend API keys
- Stripe Billing - Needs Stripe API keys
- Usage Tracking Webhooks - Needs provider webhook URLs

## Critical Environment Variable Issues Fixed (2025-09-17)

### API Key Decryption Error Resolution
**Problem**: AI responses were not displaying because API key decryption was failing with "Unsupported state or unable to authenticate data" errors.

**Root Cause**: The `ENCRYPTION_KEY` environment variable was not being loaded properly during development, causing the API key service to use the default fallback key instead of the actual encryption key used to encrypt the stored API keys.

**Solution**:
1. Identified that `.env.local` contains the correct `ENCRYPTION_KEY=b298211c4f63a69376c513c26de660b3d2f23a160b3c6d1fb4d9317bdac1a50f`
2. Development server must be started with explicit environment variable:
   ```bash
   ENCRYPTION_KEY=b298211c4f63a69376c513c26de660b3d2f23a160b3c6d1fb4d9317bdac1a50f npm run dev
   ```
3. For production deployments, ensure `ENCRYPTION_KEY` is properly set in environment configuration

**Impact**: This fix resolves the "I don't see the output" issue where AI responses were not being displayed despite successful API calls.

## Vercel Production Deployment Guide

### Required Environment Variables for Vercel
All environment variables must be set in Vercel dashboard under Settings → Environment Variables:

**Authentication & Security:**
- `NEXTAUTH_SECRET` - NextAuth secret key (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Production URL (e.g., `https://yourdomain.vercel.app`)
- `ENCRYPTION_KEY` - **CRITICAL**: `b298211c4f63a69376c513c26de660b3d2f23a160b3c6d1fb4d9317bdac1a50f`

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (use your production database)

**OAuth (Google):**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Optional Services:**
- `REDIS_URL` - Redis connection (for rate limiting)
- `REDIS_TOKEN` - Redis authentication token
- `SENDGRID_API_KEY` - Email service (for notifications)

### Vercel Build Configuration
The project is production-ready with:
- ✅ TypeScript compilation successful
- ✅ All critical build errors resolved
- ✅ Dynamic route configuration correct
- ✅ API routes properly configured with `dynamic = 'force-dynamic'`

### Deployment Steps
1. Connect GitHub repository to Vercel
2. Set all required environment variables in Vercel dashboard
3. Deploy - build will automatically succeed
4. Verify API key decryption works in production

## Progress Reports & Documentation

### Latest Progress Report (September 2025)
**File**: `PROGRESS_SEPT_2025.md` - Comprehensive feature completion analysis
- **Overall Platform Completion**: 88%
- **Core Infrastructure**: 100% complete
- **User Interface**: 95% complete (58 pages implemented)
- **API Layer**: 92% complete (122 endpoints)
- **Real-time Features**: 85% complete (recently implemented)

### Major Recent Updates (September 2025)
- ✅ **Real-time Usage Tracking System** - Complete proxy middleware implementation
- ✅ **Webhook Integration** - Universal webhook handlers for all AI providers
- ✅ **CSV Import System** - Bulk data import with auto-format detection
- ✅ **Enhanced API Key Management** - Health monitoring and fallback mechanisms
- ✅ **UI/UX Improvements** - Dark mode consistency fixes

### Key Features Completed
- **Authentication & Security**: NextAuth.js with Google OAuth + demo accounts
- **Database Architecture**: 63 models with comprehensive relationships
- **Multi-tenant Support**: Organizations, roles, permissions (5-tier hierarchy)
- **AI Provider Integration**: 7 providers (OpenAI, Claude, Gemini, Grok, Perplexity, Cohere, Mistral)
- **Dashboard & Analytics**: Real-time usage tracking and cost analysis
- **AIOptimise Chat**: Multi-provider AI interface with intelligent model selection

### Priority Development Areas
1. **Email Notification Service** (40% complete) - AWS SES integration needed
2. **Performance Optimization** (60% complete) - Dashboard load time improvement
3. **Team Collaboration** (75% complete) - User invitation system pending
4. **Advanced Analytics** (70% complete) - Predictive spending models

### Documentation Files
- `PROGRESS_SEPT_2025.md` - Complete feature analysis and roadmap
- `FEATURE_IMPLEMENTATION_STATUS.md` - Feature tracking matrix
- `DEVELOPMENT_PRIORITIES.md` - Development guidelines and priorities
- `CURRENT_UPGRADE_CONTEXT.md` - Recent changes and upgrade tracking
- `PRODUCT_KNOWLEDGE.md` - Product specifications and architecture
- `TESTING_GUIDE.md` - Comprehensive testing procedures

---
Last Updated: 2025-09-17
Generated during comprehensive progress analysis and feature completion review