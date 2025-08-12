import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth-config'

const CSRF_TOKEN_LENGTH = 32
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Verify CSRF token for state-changing operations
 */
export async function verifyCSRFToken(req: NextRequest): Promise<boolean> {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true
  }
  
  // Get token from header
  const headerToken = req.headers.get(CSRF_HEADER)
  if (!headerToken) {
    return false
  }
  
  // Get token from cookie
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value
  if (!cookieToken) {
    return false
  }
  
  // Verify tokens match (constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(headerToken),
    Buffer.from(cookieToken)
  )
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
  req: NextRequest
): Promise<NextResponse | null> {
  // Skip for API routes that don't need CSRF (e.g., webhooks with signatures)
  const pathname = req.nextUrl.pathname
  const skipPaths = [
    '/api/webhooks/',
    '/api/health',
    '/api/status',
  ]
  
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return null
  }
  
  // Verify CSRF token
  const isValid = await verifyCSRFToken(req)
  
  if (!isValid && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }
  
  return null
}

/**
 * Set CSRF token cookie
 */
export function setCSRFCookie(response: NextResponse, token?: string): void {
  const csrfToken = token || generateCSRFToken()
  
  response.cookies.set({
    name: CSRF_COOKIE,
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Get CSRF token from request
 */
export function getCSRFToken(req: NextRequest): string | undefined {
  return req.cookies.get(CSRF_COOKIE)?.value
}

/**
 * Middleware wrapper with CSRF protection
 */
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const csrfResponse = await csrfProtection(req)
    if (csrfResponse) {
      return csrfResponse
    }
    
    const response = await handler(req)
    
    // Set CSRF cookie if not present
    if (!req.cookies.get(CSRF_COOKIE)) {
      setCSRFCookie(response)
    }
    
    return response
  }
}