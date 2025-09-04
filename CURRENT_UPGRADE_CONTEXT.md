# AI Cost Guardian - Upgrade Context & Planning

## Current System State (2025-09-04)
- **Version**: 1.0.0
- **Server**: Running on http://localhost:3000
- **Stack**: Next.js 14.2.5, TypeScript, Prisma, PostgreSQL
- **Auth**: NextAuth.js with Google OAuth
- **AI Providers**: OpenAI, Claude, Gemini, Grok

## Key Architecture Components

### Frontend Structure
- `/app` - Next.js 14 app router pages
- `/components` - Reusable UI components (Radix UI + Tailwind)
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks

### Backend Structure
- `/prisma` - Database schema and migrations
- `/server` - API endpoints and server utilities
- `/lib/api` - API route handlers
- `/lib/services` - Business logic services

### Configuration Files
- `.env.local` - Environment variables (active)
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - Auth and route protection
- `next.config.js` - Next.js configuration

## Planned Upgrades

### Priority 1: Enhanced Centralized API Key Management System
- **Objective**: Improve and centralize API key validation and management across all features
- **Current State**: 
  - ✅ Central service exists at `/lib/core/api-key.service.ts`
  - ✅ Encryption/decryption implemented
  - ✅ Provider validation for 7 AI providers
  - ✅ Caching mechanism (5-minute TTL)
  - ⚠️ Not all features use the central service consistently
  
- **Files to Modify**:
  - `/lib/core/api-key.service.ts` - Enhance with better error handling
  - `/app/api/api-keys/route.ts` - Already using central service ✅
  - `/app/aioptimiseV2/*.tsx` - Update to use central validation
  - `/app/usage/*.tsx` - Ensure consistent API key fetching
  - `/app/onboarding/*.tsx` - Add API key validation during setup
  - `/lib/core/usage.service.ts` - Integrate with API key service
  
- **New Features to Add**:
  1. **Unified Error Handling**: Consistent error messages and retry logic
  2. **API Key Health Check**: Background validation of stored keys
  3. **Rate Limit Detection**: Detect and report rate limit issues
  4. **Fallback Mechanism**: Auto-switch to backup keys if available
  5. **Audit Logging**: Track all API key operations
  
- **Dependencies**:
  - Existing: crypto, prisma, fetch API
  - No new dependencies required
  
- **Testing Required**:
  - Unit tests for each provider validation
  - Integration tests for key rotation
  - Error scenario testing (invalid keys, rate limits, network issues)
  - End-to-end testing of all features using API keys

## Change Log

### 2025-09-04 - API Key Management & UI Improvements
- **Modified files:**
  - `/app/settings/api-keys/page.tsx` - Direct navigation to onboarding
  - `/app/onboarding/api-setup/page.tsx` - Added all 7 supported providers
  
- **UI Improvements:**
  1. ✅ **Direct Navigation**: "Add New Key" button now goes directly to `/onboarding/api-setup`
  2. ✅ **All Providers Available**: Added all 7 AI providers (OpenAI, Claude, Gemini, Grok, Perplexity, Cohere, Mistral)
  3. ✅ **Default Display**: Shows 4 main providers by default (OpenAI, Claude, Gemini, Grok)
  4. ✅ **Provider Naming Fix**: Aligned provider names with backend service (`claude` instead of `anthropic`, `gemini` instead of `google`)

### 2025-09-04 - API Key Management Fixes
- **Fixed issues:**
  - ✅ **Provider Case Sensitivity**: Converted all uppercase providers (GOOGLE→gemini, ANTHROPIC→claude) in database
  - ✅ **Claude Validation**: Updated to check key format and handle billing/credit errors properly
  - ✅ **Data Consistency**: Fixed provider storage to use lowercase consistently
  
- **Database Migrations:**
  - Converted 22 API keys from uppercase/old naming to lowercase/new naming
  - Fixed duplicate provider naming (GOOGLE→gemini, ANTHROPIC→claude)
  
- **Important Notes:**
  - API keys are user-specific due to unique constraint on [userId, provider]
  - Must be logged in to see your keys at /settings/api-keys
  - Each user can only have one key per provider

### 2025-09-04 - UI/UX Fixes for AIOptimise Interface
- **Fixed issues:**
  - ✅ **Dropdown Hover States**: Fixed white background on hover in all dropdown menus
  - ✅ **Theme Consistency**: Applied dark theme classes to all dropdown components
  - ✅ **Navigation Updates**: Changed all references from /aioptimiseV2 to /aioptimise
  
- **Modified components:**
  - `/app/aioptimise/components/thread-sidebar-enhanced.tsx` - Fixed dropdown styling
  - `/app/aioptimise/components/claude-unified-input.tsx` - Fixed mode/model selector dropdowns
  - `/app/aioptimise/components/message-enhanced.tsx` - Fixed message action dropdowns
  - `/app/aioptimise/components/claude-input.tsx` - Fixed model selector dropdown
  
- **UI improvements:**
  1. All dropdown menus now have consistent dark theme (bg-gray-900, border-gray-800)
  2. Hover states use bg-gray-800 instead of default white
  3. Focus states properly styled for accessibility
  4. Text colors use text-gray-200 for better contrast
  5. Fixed thread action button visibility (opacity-50 instead of opacity-0)
  6. Fixed input layout with items-stretch and proper minimum heights
  7. Added z-index to input containers to prevent overlap issues
  8. Fixed button minimum widths to prevent text wrapping

### 2025-09-04 - Centralized API Key Management System Implementation
- **Modified files:**
  - Created `/lib/core/api-key-manager.ts` - Enhanced API key manager with health monitoring
  - Created `/hooks/use-api-keys.ts` - React hook for unified API key operations
  - Created `/components/api-keys/api-key-validator.tsx` - Reusable validation component
  - Updated `/Users/Victor/anthropic-quickstarts/CURRENT_UPGRADE_CONTEXT.md` - Documentation
  
- **Added features:**
  1. ✅ **Health Monitoring**: Real-time API key health checks with 5-minute intervals
  2. ✅ **Fallback Mechanism**: Automatic fallback to organization members' keys
  3. ✅ **Rate Limit Detection**: Identifies and tracks rate-limited providers
  4. ✅ **Audit Logging**: Comprehensive logging of all API key operations
  5. ✅ **Enhanced Error Handling**: Differentiates between error types with retry logic
  6. ✅ **Unified React Hook**: Single source of truth for all components
  7. ✅ **Validation Component**: Reusable UI component with multiple view modes
  
- **Architecture improvements:**
  - Singleton pattern for consistent state management
  - Caching mechanism to reduce API calls
  - TypeScript interfaces for type safety
  - Abort controller for request cancellation
  - Auto-refresh mechanism every 5 minutes
  
- **Test results:**
  - Pending integration testing
  - Components ready for integration with existing features

## Testing Checklist
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Database migrations work
- [ ] Authentication flow intact
- [ ] Real-time features functional

## Important Context Notes
- Database is PostgreSQL via Prisma ORM
- Authentication uses NextAuth.js sessions
- Real-time updates via Socket.io
- Error tracking with Sentry
- Analytics with Vercel Analytics
- Email notifications via AWS SES

## Commands Reference
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build production
npm run lint            # Run linting
npm run typecheck       # Check TypeScript

# Database
npx prisma studio       # Open database GUI
npx prisma generate     # Generate client
npx prisma migrate dev  # Run migrations
npx prisma db push      # Push schema changes

# Testing
npm test                # Run tests
npm run test:e2e        # End-to-end tests
```

## Related Documentation
- PROJECT_INSTRUCTIONS.md - Core project guidelines
- SYSTEM_DOCUMENTATION.md - System architecture
- FEATURE_MATRIX.md - Feature specifications
- Rule_Book.md - Development standards