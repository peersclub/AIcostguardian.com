/**
 * Security utilities and best practices
 */

import crypto from 'crypto'

// Environment variable validation
export function validateEnvironment() {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// API Key masking
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '***'
  const visibleChars = 4
  const masked = apiKey.substring(0, visibleChars) + 
                 '*'.repeat(Math.min(apiKey.length - visibleChars, 20))
  return masked
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number
  
  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup()
    }
    
    return true
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(time => now - time < this.windowMs)
      if (validAttempts.length === 0) {
        this.attempts.delete(key)
      } else {
        this.attempts.set(key, validAttempts)
      }
    }
  }
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// API key encryption for storage
export function encryptApiKey(apiKey: string, secret: string): string {
  const algorithm = 'aes-256-gcm'
  const salt = crypto.randomBytes(16)
  const key = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256')
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return salt.toString('hex') + ':' + 
         iv.toString('hex') + ':' + 
         authTag.toString('hex') + ':' + 
         encrypted
}

// API key decryption
export function decryptApiKey(encryptedData: string, secret: string): string {
  const algorithm = 'aes-256-gcm'
  const parts = encryptedData.split(':')
  
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format')
  }
  
  const salt = Buffer.from(parts[0], 'hex')
  const iv = Buffer.from(parts[1], 'hex')
  const authTag = Buffer.from(parts[2], 'hex')
  const encrypted = parts[3]
  
  const key = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256')
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Validate API request origin
export function validateOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false
  return allowedOrigins.includes(origin)
}

// SQL injection prevention helper
export function escapeSQLString(str: string): string {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0"
      case "\x08": return "\\b"
      case "\x09": return "\\t"
      case "\x1a": return "\\z"
      case "\n": return "\\n"
      case "\r": return "\\r"
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char
      default:
        return char
    }
  })
}