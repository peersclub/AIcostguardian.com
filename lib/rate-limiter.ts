import { Ratelimit } from '@upstash/ratelimit'
import { cache } from './redis'
import { NextRequest } from 'next/server'

// Rate limit configurations for different endpoint types
export const rateLimitConfigs = {
  auth: {
    requests: 5,
    window: '1 m',
    message: 'Too many authentication attempts. Please try again later.',
  },
  ai: {
    requests: 30,
    window: '1 m',
    message: 'Too many AI requests. Please wait a moment before trying again.',
  },
  data: {
    requests: 100,
    window: '1 m',
    message: 'Too many data requests. Please slow down.',
  },
  upload: {
    requests: 10,
    window: '5 m',
    message: 'Too many upload attempts. Please wait before uploading more files.',
  },
  export: {
    requests: 20,
    window: '5 m',
    message: 'Too many export requests. Please wait before exporting again.',
  },
} as const

// Simple in-memory rate limiter for development
class SimpleRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async limit(identifier: string) {
    const now = Date.now()
    const record = this.requests.get(identifier)
    
    if (!record || now > record.resetTime) {
      // Start new window
      const resetTime = now + this.windowMs
      this.requests.set(identifier, { count: 1, resetTime })
      return {
        success: true,
        limit: this.maxRequests,
        reset: resetTime,
        remaining: this.maxRequests - 1,
      }
    }
    
    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.maxRequests,
        reset: record.resetTime,
        remaining: 0,
      }
    }
    
    // Increment count
    record.count++
    return {
      success: true,
      limit: this.maxRequests,
      reset: record.resetTime,
      remaining: this.maxRequests - record.count,
    }
  }
}

// Check if Redis is properly configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL !== '' &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== ''
)

// Create rate limiters for different endpoint types
const rateLimiters = isRedisConfigured ? {
  auth: new Ratelimit({
    redis: cache as any,
    limiter: Ratelimit.slidingWindow(
      rateLimitConfigs.auth.requests,
      rateLimitConfigs.auth.window
    ),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  ai: new Ratelimit({
    redis: cache as any,
    limiter: Ratelimit.slidingWindow(
      rateLimitConfigs.ai.requests,
      rateLimitConfigs.ai.window
    ),
    analytics: true,
    prefix: 'ratelimit:ai',
  }),
  data: new Ratelimit({
    redis: cache as any,
    limiter: Ratelimit.slidingWindow(
      rateLimitConfigs.data.requests,
      rateLimitConfigs.data.window
    ),
    analytics: true,
    prefix: 'ratelimit:data',
  }),
  upload: new Ratelimit({
    redis: cache as any,
    limiter: Ratelimit.slidingWindow(
      rateLimitConfigs.upload.requests,
      rateLimitConfigs.upload.window
    ),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),
  export: new Ratelimit({
    redis: cache as any,
    limiter: Ratelimit.slidingWindow(
      rateLimitConfigs.export.requests,
      rateLimitConfigs.export.window
    ),
    analytics: true,
    prefix: 'ratelimit:export',
  }),
} : {
  // Fallback to simple in-memory rate limiters
  auth: new SimpleRateLimiter(5, 60000),
  ai: new SimpleRateLimiter(30, 60000),
  data: new SimpleRateLimiter(100, 60000),
  upload: new SimpleRateLimiter(10, 300000),
  export: new SimpleRateLimiter(20, 300000),
}

// Get identifier for rate limiting (IP or user ID)
export function getRateLimitIdentifier(req: NextRequest, userId?: string): string {
  // Prefer user ID if available
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'anonymous'
  return `ip:${ip}`
}

// Main rate limiting function
export async function rateLimit(
  req: NextRequest,
  type: keyof typeof rateLimiters = 'data',
  userId?: string
) {
  const identifier = getRateLimitIdentifier(req, userId)
  const limiter = rateLimiters[type]
  
  const { success, limit, reset, remaining } = await limiter.limit(identifier)
  
  return {
    success,
    limit,
    reset,
    remaining,
    message: success ? undefined : rateLimitConfigs[type].message,
  }
}

// Middleware helper for rate limiting
export async function withRateLimit(
  req: NextRequest,
  type: keyof typeof rateLimiters = 'data',
  userId?: string
): Promise<{ success: boolean; response?: Response }> {
  const result = await rateLimit(req, type, userId)
  
  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: result.message,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }
  
  return { success: true }
}

// Per-organization rate limiting
export async function orgRateLimit(
  req: NextRequest,
  orgId: string,
  type: keyof typeof rateLimiters = 'data'
) {
  const identifier = `org:${orgId}`
  const limiter = rateLimiters[type]
  
  // Organizations get 2x the normal rate limit
  const multiplier = 2
  const { success, limit, reset, remaining } = await limiter.limit(identifier)
  
  return {
    success: remaining > -multiplier * rateLimitConfigs[type].requests,
    limit: limit * multiplier,
    reset,
    remaining: Math.max(0, remaining + multiplier * rateLimitConfigs[type].requests),
    message: success ? undefined : `Organization rate limit exceeded. Please wait before making more requests.`,
  }
}