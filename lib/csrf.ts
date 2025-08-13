import { NextRequest } from 'next/server'
import { cache } from './redis'

// In-memory storage fallback for CSRF tokens when Redis is not available
const inMemoryCSRFTokens = new Map<string, { token: string; expiry: number }>()

// Use Web Crypto API for Edge Runtime compatibility
const crypto = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : require('crypto').webcrypto)

const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_TTL = 3600 // 1 hour
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'

// Generate a new CSRF token
export async function generateCSRFToken(): Promise<string> {
  const buffer = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Store CSRF token
export async function storeCSRFToken(sessionId: string, token: string): Promise<void> {
  const key = `csrf:${sessionId}`
  try {
    await cache.set(key, token, { ex: CSRF_TOKEN_TTL })
  } catch (error) {
    // Fallback to in-memory storage
    console.warn('Failed to store CSRF token in Redis, using in-memory fallback')
    inMemoryCSRFTokens.set(key, {
      token,
      expiry: Date.now() + (CSRF_TOKEN_TTL * 1000)
    })
  }
}

// Validate CSRF token
export async function validateCSRFToken(
  sessionId: string,
  token: string
): Promise<boolean> {
  const key = `csrf:${sessionId}`
  let storedToken: string | null = null
  
  try {
    storedToken = await cache.get(key)
  } catch (error) {
    // Fallback to in-memory storage
    const inMemoryToken = inMemoryCSRFTokens.get(key)
    if (inMemoryToken && inMemoryToken.expiry > Date.now()) {
      storedToken = inMemoryToken.token
    }
  }
  
  if (!storedToken || storedToken !== token) {
    return false
  }
  
  try {
    // Refresh the token TTL on successful validation
    await cache.expire(key, CSRF_TOKEN_TTL)
  } catch (error) {
    // Update in-memory expiry
    const inMemoryToken = inMemoryCSRFTokens.get(key)
    if (inMemoryToken) {
      inMemoryToken.expiry = Date.now() + (CSRF_TOKEN_TTL * 1000)
    }
  }
  
  return true
}

// Get CSRF token from request
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  // Check header first (for AJAX requests)
  const headerToken = req.headers.get(CSRF_HEADER)
  if (headerToken) {
    return headerToken
  }
  
  // Check form data (for form submissions)
  const contentType = req.headers.get('content-type')
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    // This would need to be parsed from the body
    // For now, we'll rely on header-based CSRF tokens
  }
  
  return null
}

// Middleware to check CSRF token
export async function checkCSRF(
  req: NextRequest,
  sessionId: string
): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return { valid: true }
  }
  
  const token = getCSRFTokenFromRequest(req)
  
  if (!token) {
    return {
      valid: false,
      error: 'CSRF token missing',
    }
  }
  
  const isValid = await validateCSRFToken(sessionId, token)
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token',
    }
  }
  
  return { valid: true }
}

// Create a new CSRF token for a session
export async function createCSRFToken(sessionId: string): Promise<string> {
  const token = await generateCSRFToken()
  await storeCSRFToken(sessionId, token)
  return token
}

// Hook for React components to get CSRF token
export function useCSRFToken(): { token: string | null; header: string } {
  if (typeof window === 'undefined') {
    return { token: null, header: CSRF_HEADER }
  }
  
  // Get token from meta tag
  const metaTag = document.querySelector('meta[name="csrf-token"]')
  const token = metaTag?.getAttribute('content') || null
  
  return { token, header: CSRF_HEADER }
}