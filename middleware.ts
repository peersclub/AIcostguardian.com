import { withAuth } from 'next-auth/middleware'
import { NextResponse, NextRequest } from 'next/server'
import { withRateLimit } from '@/lib/rate-limiter'
import { checkCSRF } from '@/lib/csrf'
import { getToken } from 'next-auth/jwt'

// Define which API paths need rate limiting and their types
const rateLimitPaths = {
  '/api/auth': 'auth',
  '/api/ai': 'ai',
  '/api/organization/members/bulk-upload': 'upload',
  '/api/export': 'export',
  '/api': 'data', // Default for all other API routes
} as const

async function applyRateLimit(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api')) {
    return null
  }

  // Find the most specific matching path
  let rateLimitType: 'auth' | 'ai' | 'data' | 'upload' | 'export' = 'data'
  
  for (const [path, type] of Object.entries(rateLimitPaths)) {
    if (pathname.startsWith(path)) {
      rateLimitType = type as any
      break
    }
  }

  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimitType)
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }
  
  return null
}

function addSecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://vercel.live wss://ws-us3.pusher.com",
    "frame-src 'self' https://accounts.google.com https://vercel.live",
    "worker-src 'self' blob:",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

export default withAuth(
  async function middleware(req) {
    const request = req as NextRequest
    const pathname = request.nextUrl.pathname
    
    // Apply rate limiting to API routes
    const rateLimitResponse = await applyRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Apply CSRF protection to API routes (except auth and csrf endpoints)
    // TEMPORARILY DISABLED: CSRF validation is causing site-wide issues
    // TODO: Re-enable after fixing client-side CSRF token handling
    const CSRF_ENABLED = false // Toggle this to enable/disable CSRF protection
    
    if (
      CSRF_ENABLED &&
      pathname.startsWith('/api') &&
      !pathname.startsWith('/api/auth') &&
      !pathname.startsWith('/api/csrf') &&
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
    ) {
      // Get user session for CSRF validation
      const token = await getToken({ req: request })
      if (token?.email) {
        const csrfCheck = await checkCSRF(request, token.email as string)
        if (!csrfCheck.valid) {
          return NextResponse.json(
            { error: csrfCheck.error },
            { status: 403 }
          )
        }
      }
    }
    
    // Create response
    const response = NextResponse.next()
    
    // Add security headers
    return addSecurityHeaders(response)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // List of protected routes that require authentication
        const isProtectedRoute = path.startsWith('/dashboard') ||
                                path.startsWith('/usage') ||
                                path.startsWith('/billing') ||
                                path.startsWith('/settings') ||
                                path.startsWith('/onboarding') ||
                                path.startsWith('/team') ||
                                path.startsWith('/analytics') ||
                                path.startsWith('/providers') ||
                                path.startsWith('/superadmin')
        
        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token
        }
        
        // Allow access to all other routes (public pages, auth pages, API routes)
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all routes except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}