/**
 * Centralized Rate Limiting Service
 * Provides rate limiting for all API calls to prevent abuse and manage costs
 */

import { prisma } from '@/lib/prisma'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix?: string // Optional prefix for rate limit keys
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetTime: Date
  retryAfter?: number // Seconds until retry is allowed
}

// Default rate limits per provider
const PROVIDER_LIMITS: Record<string, RateLimitConfig> = {
  openai: { windowMs: 60000, maxRequests: 60 }, // 60 requests per minute
  claude: { windowMs: 60000, maxRequests: 50 }, // 50 requests per minute
  gemini: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
  grok: { windowMs: 60000, maxRequests: 40 }, // 40 requests per minute
  perplexity: { windowMs: 60000, maxRequests: 30 }, // 30 requests per minute
}

// User tier rate limits
const TIER_LIMITS: Record<string, RateLimitConfig> = {
  FREE: { windowMs: 3600000, maxRequests: 100 }, // 100 requests per hour
  STARTER: { windowMs: 3600000, maxRequests: 500 }, // 500 requests per hour
  GROWTH: { windowMs: 3600000, maxRequests: 2000 }, // 2000 requests per hour
  ENTERPRISE: { windowMs: 3600000, maxRequests: 10000 }, // 10000 requests per hour
}

class RateLimiterService {
  private static instance: RateLimiterService
  private memoryStore: Map<string, { count: number; resetTime: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Start cleanup interval to remove expired entries
    this.startCleanup()
  }

  static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService()
    }
    return RateLimiterService.instance
  }

  /**
   * Check if a request is allowed based on rate limits
   */
  async checkLimit(
    key: string,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const limitConfig = config || { windowMs: 60000, maxRequests: 100 }
    const now = Date.now()
    const windowStart = now - limitConfig.windowMs
    const resetTime = new Date(now + limitConfig.windowMs)

    // Get or create rate limit entry
    const entry = this.memoryStore.get(key)

    if (!entry || entry.resetTime < now) {
      // Create new window
      this.memoryStore.set(key, {
        count: 1,
        resetTime: now + limitConfig.windowMs
      })

      return {
        allowed: true,
        limit: limitConfig.maxRequests,
        remaining: limitConfig.maxRequests - 1,
        resetTime
      }
    }

    // Check if limit exceeded
    if (entry.count >= limitConfig.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      
      return {
        allowed: false,
        limit: limitConfig.maxRequests,
        remaining: 0,
        resetTime: new Date(entry.resetTime),
        retryAfter
      }
    }

    // Increment counter
    entry.count++
    this.memoryStore.set(key, entry)

    return {
      allowed: true,
      limit: limitConfig.maxRequests,
      remaining: limitConfig.maxRequests - entry.count,
      resetTime: new Date(entry.resetTime)
    }
  }

  /**
   * Check provider-specific rate limit
   */
  async checkProviderLimit(
    userId: string,
    provider: string
  ): Promise<RateLimitResult> {
    const config = PROVIDER_LIMITS[provider.toLowerCase()] || {
      windowMs: 60000,
      maxRequests: 50
    }

    const key = `provider:${provider}:${userId}`
    return this.checkLimit(key, config)
  }

  /**
   * Check user tier rate limit
   */
  async checkUserTierLimit(
    userId: string,
    organizationId?: string
  ): Promise<RateLimitResult> {
    try {
      // Get user's organization tier
      let tier = 'FREE'
      
      if (organizationId) {
        const org = await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { subscription: true }
        })
        tier = org?.subscription || 'FREE'
      }

      const config = TIER_LIMITS[tier] || TIER_LIMITS.FREE
      const key = `user:${userId}`
      
      return this.checkLimit(key, config)
    } catch (error) {
      console.error('Error checking user tier limit:', error)
      // Default to allowing the request on error
      return {
        allowed: true,
        limit: 100,
        remaining: 100,
        resetTime: new Date(Date.now() + 3600000)
      }
    }
  }

  /**
   * Check combined rate limits (provider + user tier)
   */
  async checkCombinedLimits(
    userId: string,
    provider: string,
    organizationId?: string
  ): Promise<RateLimitResult> {
    // Check provider limit
    const providerLimit = await this.checkProviderLimit(userId, provider)
    if (!providerLimit.allowed) {
      return providerLimit
    }

    // Check user tier limit
    const tierLimit = await this.checkUserTierLimit(userId, organizationId)
    if (!tierLimit.allowed) {
      return tierLimit
    }

    // Return the most restrictive limit info
    return {
      allowed: true,
      limit: Math.min(providerLimit.limit, tierLimit.limit),
      remaining: Math.min(providerLimit.remaining, tierLimit.remaining),
      resetTime: providerLimit.resetTime < tierLimit.resetTime 
        ? providerLimit.resetTime 
        : tierLimit.resetTime
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  resetLimit(key: string): void {
    this.memoryStore.delete(key)
  }

  /**
   * Reset all rate limits for a user
   */
  resetUserLimits(userId: string): void {
    const keysToDelete: string[] = []
    
    for (const key of Array.from(this.memoryStore.keys())) {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.memoryStore.delete(key))
  }

  /**
   * Get current limit status for a key
   */
  getLimitStatus(key: string, config?: RateLimitConfig): RateLimitResult {
    const limitConfig = config || { windowMs: 60000, maxRequests: 100 }
    const now = Date.now()
    const entry = this.memoryStore.get(key)

    if (!entry || entry.resetTime < now) {
      return {
        allowed: true,
        limit: limitConfig.maxRequests,
        remaining: limitConfig.maxRequests,
        resetTime: new Date(now + limitConfig.windowMs)
      }
    }

    const remaining = Math.max(0, limitConfig.maxRequests - entry.count)
    const allowed = remaining > 0

    return {
      allowed,
      limit: limitConfig.maxRequests,
      remaining,
      resetTime: new Date(entry.resetTime),
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  /**
   * Apply rate limit headers to response
   */
  applyRateLimitHeaders(
    headers: Headers,
    result: RateLimitResult
  ): void {
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.resetTime.toISOString())
    
    if (result.retryAfter) {
      headers.set('Retry-After', result.retryAfter.toString())
    }
  }

  /**
   * Create middleware for rate limiting
   */
  createMiddleware(config?: RateLimitConfig) {
    return async (req: Request) => {
      // Extract user ID from request (would need to be adapted based on auth method)
      const userId = req.headers.get('x-user-id') || 'anonymous'
      const result = await this.checkLimit(userId, config)

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: result.retryAfter,
            resetTime: result.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toISOString()
            }
          }
        )
      }

      return null // Continue to next middleware
    }
  }

  /**
   * Cleanup expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      const keysToDelete: string[] = []

      for (const [key, entry] of Array.from(this.memoryStore.entries())) {
        if (entry.resetTime < now) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.memoryStore.delete(key))
      
      if (keysToDelete.length > 0) {
        console.log(`Rate limiter: Cleaned up ${keysToDelete.length} expired entries`)
      }
    }, 5 * 60 * 1000)
  }

  /**
   * Stop the cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Get statistics about current rate limits
   */
  getStats(): {
    totalEntries: number
    activeWindows: number
    expiredWindows: number
  } {
    const now = Date.now()
    let active = 0
    let expired = 0

    for (const entry of Array.from(this.memoryStore.values())) {
      if (entry.resetTime >= now) {
        active++
      } else {
        expired++
      }
    }

    return {
      totalEntries: this.memoryStore.size,
      activeWindows: active,
      expiredWindows: expired
    }
  }
}

// Export singleton instance
export const rateLimiterService = RateLimiterService.getInstance()

// Export utility function for Express/Next.js middleware
export function withRateLimit(config?: RateLimitConfig) {
  return async function rateLimitMiddleware(
    req: any,
    res: any,
    next?: () => void
  ) {
    const userId = req.session?.user?.id || req.ip || 'anonymous'
    const result = await rateLimiterService.checkLimit(userId, config)

    // Add headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString())
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
    res.setHeader('X-RateLimit-Reset', result.resetTime.toISOString())

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter?.toString() || '60')
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please retry after ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        resetTime: result.resetTime
      })
    }

    if (next) next()
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    rateLimiterService.stopCleanup()
  })
}