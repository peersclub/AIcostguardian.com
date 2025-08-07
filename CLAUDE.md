# AI Cost Guardian - Project Knowledge Base
## For Claude: Essential Project Information

### 🎯 Project Vision
AI Cost Guardian is an enterprise-grade AI usage tracking and cost optimization platform. We're building the world's best solution for managing AI infrastructure costs across multiple providers.

### 🏗️ Project Structure

```
/
├── app/                    # Next.js 14 App Router pages
│   ├── api/               # API routes
│   ├── analytics/         # Analytics dashboards
│   ├── billing/           # Billing management
│   ├── dashboard/         # Main dashboard
│   ├── integrations/      # Provider integrations
│   ├── onboarding/        # User onboarding flow
│   ├── providers/         # Provider management
│   ├── settings/          # Application settings
│   ├── superadmin/        # Admin panel
│   └── team/              # Team management
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── charts/           # Chart components
│   ├── onboarding/       # Onboarding components
│   ├── providers/        # Provider-specific components
│   └── shared/           # Shared components
├── lib/                   # Core libraries
│   ├── config/           # Configuration files
│   ├── services/         # Service layer
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── src/                   # Legacy source (to be migrated)
│   ├── components/       # Legacy components
│   ├── config/           # Legacy config
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # Legacy services
│   └── types/            # Legacy types
├── public/                # Static assets
└── styles/                # Global styles
```

### 🔧 Technical Stack

- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Custom components + Framer Motion
- **State Management**: React Context API
- **API**: RESTful + Server Actions
- **Authentication**: NextAuth.js
- **Database**: Prisma (planned)
- **Deployment**: Vercel

### 🚨 Known Issues & Solutions

#### 1. Import Path Resolution
- **Problem**: Mixed use of `@/` alias and relative imports causing build failures
- **Solution**: 
  - Use `@/` alias consistently for all imports
  - Configure `tsconfig.json` paths properly
  - Centralize all imports through barrel exports

#### 2. TypeScript Strict Mode Issues
- **Problem**: Type mismatches with motion components and strict checks
- **Solution**: Create proper type definitions and wrappers for third-party libraries

#### 3. Build Configuration
- **Issue**: Vercel builds fail with peer dependency conflicts
- **Solution**: Use `npm install --legacy-peer-deps` in vercel.json

### 📦 Key Dependencies

```json
{
  "next": "14.2.5",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.309.0",
  "recharts": "^2.10.4"
}
```

### 🎨 Design System

#### Colors
- Primary: Emerald (#10b981)
- Secondary: Purple (#9333ea)
- Accent: Blue (#3b82f6)
- Background: Black/Gray gradient
- Text: White/Gray scale

#### Components Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Naming Convention**: PascalCase for components, camelCase for functions
- **File Structure**: Component.tsx + Component.types.ts + Component.styles.ts

### 🔐 Security Best Practices

1. **API Keys**: Store in environment variables
2. **Authentication**: Implement proper JWT handling
3. **Input Validation**: Sanitize all user inputs
4. **CORS**: Configure properly for production
5. **Rate Limiting**: Implement on all API routes

### ⚡ Performance Optimization

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: Use Next.js Image component
3. **Caching**: Implement proper cache headers
4. **Bundle Size**: Keep under 200KB for initial load
5. **Lazy Loading**: Implement for non-critical components

### 🧪 Testing Strategy

1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: Cypress
3. **E2E Tests**: Playwright
4. **Performance**: Lighthouse CI
5. **Accessibility**: axe-core

### 📝 Development Workflow

1. **Branch Strategy**: main → develop → feature/*
2. **Commit Convention**: conventional commits
3. **Code Review**: Required for all PRs
4. **CI/CD**: GitHub Actions → Vercel
5. **Documentation**: JSDoc + README updates

### 🚀 Deployment Checklist

- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Check bundle size
- [ ] Update version
- [ ] Create release notes
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

### 💡 Architecture Decisions

1. **App Router over Pages Router**: Better performance and layouts
2. **TypeScript Strict Mode**: Catch errors early
3. **Tailwind CSS**: Rapid development with utility classes
4. **Context over Redux**: Simpler state management for this scale
5. **Vercel Deployment**: Optimal for Next.js

### 🔄 Migration Plan

1. **Phase 1**: Fix immediate build issues
2. **Phase 2**: Consolidate src/ and lib/ directories
3. **Phase 3**: Implement proper module system
4. **Phase 4**: Add comprehensive testing
5. **Phase 5**: Performance optimization

### 📊 Metrics to Track

- **Performance**: Core Web Vitals < 100ms
- **Bundle Size**: < 200KB initial
- **Type Coverage**: > 95%
- **Test Coverage**: > 80%
- **Lighthouse Score**: > 95

### 🎯 Current Focus Areas

1. Fix TypeScript build errors
2. Centralize configuration
3. Implement proper error boundaries
4. Add loading states
5. Optimize bundle size

### 🔗 Important Links

- **Repository**: https://github.com/peersclub/AIcostguardian.com
- **Deployment**: https://anthropic-quickstarts.vercel.app
- **Documentation**: /docs (to be created)

### 📌 Notes for Future Sessions

- Always check this file first when starting a new session
- Update this file with any architectural decisions
- Document any recurring issues and their solutions
- Keep track of performance metrics
- Note any security considerations

---
*Last Updated: January 2025*
*Version: 1.0.0*