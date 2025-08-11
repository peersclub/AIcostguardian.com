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

---
Last Updated: 2024-12-11
Generated during theme fixes and dark mode improvements