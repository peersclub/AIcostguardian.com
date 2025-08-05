import { withAuth } from 'next-auth/middleware'

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is trying to access protected routes
        const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                                req.nextUrl.pathname.startsWith('/usage') ||
                                req.nextUrl.pathname.startsWith('/billing') ||
                                req.nextUrl.pathname.startsWith('/settings') ||
                                req.nextUrl.pathname.startsWith('/onboarding')
        
        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token
        }
        
        // Allow access to public routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}