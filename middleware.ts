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
        
        // List of protected routes that require authentication
        const isProtectedRoute = path.startsWith('/dashboard') ||
                                path.startsWith('/usage') ||
                                path.startsWith('/billing') ||
                                path.startsWith('/settings') ||
                                path.startsWith('/onboarding') ||
                                path.startsWith('/team') ||
                                path.startsWith('/analytics') ||
                                path.startsWith('/integrations') ||
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
     * Match only the protected routes that need authentication:
     */
    '/dashboard/:path*',
    '/usage/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/team/:path*',
    '/analytics/:path*',
    '/integrations/:path*',
    '/providers/:path*',
    '/superadmin/:path*',
  ],
}