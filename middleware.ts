import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Always allow access to auth pages and API routes
        if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
          return true
        }
        
        // Check if user is trying to access protected routes
        const isProtectedRoute = path.startsWith('/dashboard') ||
                                path.startsWith('/usage') ||
                                path.startsWith('/billing') ||
                                path.startsWith('/settings') ||
                                path.startsWith('/onboarding') ||
                                path.startsWith('/team') ||
                                path.startsWith('/analytics') ||
                                path.startsWith('/integration')
        
        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token
        }
        
        // Allow access to public routes
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (with extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}