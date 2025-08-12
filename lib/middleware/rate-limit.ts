import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth-config'
import { Redis } from 'ioredis'

// Initialize Redis client for rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
})

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  max: number       // Max requests per window
  message?: string  // Error message
  skipAuth?: boolean // Skip for authenticated users
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

// Default rate limit configurations for different endpoint types
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later',
  },
  
  // API key operations
  apiKeys: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many API key operations, please slow down',
  },
  
  // General API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests, please slow down',
    skipAuth: false,
  },
  
  // Chat/AI endpoints (more expensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: 'AI request limit exceeded, please wait before trying again',
  },
  
  // Admin operations
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Admin operation limit exceeded',
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 uploads per minute
    message: 'Upload limit exceeded, please wait',
  },
  
  // Search operations
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Search limit exceeded, please wait',
  },
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<NextResponse | null> {
  try {
    // Generate rate limit key
    const key = config.keyGenerator ? config.keyGenerator(req) : await getDefaultKey(req)
    const rateLimitKey = `rate_limit:${key}`
    
    // Get current count from Redis
    const current = await redis.get(rateLimitKey)
    const count = current ? parseInt(current, 10) : 0
    
    // Check if limit exceeded
    if (count >= config.max) {
      // Get TTL for retry-after header
      const ttl = await redis.ttl(rateLimitKey)
      
      return NextResponse.json(
        { 
          error: config.message || 'Too many requests',
          retryAfter: ttl > 0 ? ttl : config.windowMs / 1000,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + (ttl * 1000)).toISOString(),
            'Retry-After': ttl > 0 ? ttl.toString() : (config.windowMs / 1000).toString(),
          }
        }
      )
    }
    
    // Increment counter
    const pipeline = redis.pipeline()
    pipeline.incr(rateLimitKey)
    if (count === 0) {
      // Set expiry only on first request in window
      pipeline.expire(rateLimitKey, Math.ceil(config.windowMs / 1000))
    }
    await pipeline.exec()
    
    // Return null to continue processing
    return null
  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow request to continue (fail open)
    return null
  }
}

/**
 * Get default rate limit key based on IP and user
 */
async function getDefaultKey(req: NextRequest): Promise<string> {
  // Try to get user session
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      return `user:${session.user.id}`
    }
  } catch {
    // Session retrieval failed, use IP
  }
  
  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  return `ip:${ip}`
}

/**
 * Apply rate limiting to an API handler
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimit(req, config)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(req)
  }
}

/**
 * Rate limit by API key
 */
export async function rateLimitByApiKey(
  apiKey: string,
  config: RateLimitConfig = rateLimitConfigs.ai
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  const rateLimitKey = `rate_limit:api:${apiKey}`
  
  try {
    const current = await redis.get(rateLimitKey)
    const count = current ? parseInt(current, 10) : 0
    
    if (count >= config.max) {
      const ttl = await redis.ttl(rateLimitKey)
      return {
        allowed: false,
        remaining: 0,
        reset: new Date(Date.now() + (ttl * 1000)),
      }
    }
    
    const pipeline = redis.pipeline()
    pipeline.incr(rateLimitKey)
    if (count === 0) {
      pipeline.expire(rateLimitKey, Math.ceil(config.windowMs / 1000))
    }
    await pipeline.exec()
    
    return {
      allowed: true,
      remaining: config.max - count - 1,
      reset: new Date(Date.now() + config.windowMs),
    }
  } catch (error) {
    console.error('API key rate limit error:', error)
    // On error, allow request (fail open)
    return {
      allowed: true,
      remaining: config.max,
      reset: new Date(Date.now() + config.windowMs),
    }
  }
}

/**
 * Clear rate limit for a specific key (useful for testing or admin override)
 */
export async function clearRateLimit(key: string): Promise<void> {
  await redis.del(`rate_limit:${key}`)
}

/**
 * Get current rate limit status for a key
 */
export async function getRateLimitStatus(
  key: string,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<{ count: number; remaining: number; reset: Date }> {
  const rateLimitKey = `rate_limit:${key}`
  
  try {
    const current = await redis.get(rateLimitKey)
    const count = current ? parseInt(current, 10) : 0
    const ttl = await redis.ttl(rateLimitKey)
    
    return {
      count,
      remaining: Math.max(0, config.max - count),
      reset: ttl > 0 ? new Date(Date.now() + (ttl * 1000)) : new Date(Date.now() + config.windowMs),
    }
  } catch (error) {
    console.error('Rate limit status error:', error)
    return {
      count: 0,
      remaining: config.max,
      reset: new Date(Date.now() + config.windowMs),
    }
  }
}