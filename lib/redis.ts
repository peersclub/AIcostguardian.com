import { Redis } from '@upstash/redis'

// Initialize Redis client for rate limiting and caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Fallback to in-memory storage if Redis is not configured
class InMemoryStore {
  private store: Map<string, { value: any; expiry?: number }> = new Map()

  async get(key: string) {
    const item = this.store.get(key)
    if (!item) return null
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  async set(key: string, value: any, options?: { ex?: number }) {
    const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined
    this.store.set(key, { value, expiry })
    return 'OK'
  }

  async del(key: string) {
    return this.store.delete(key) ? 1 : 0
  }

  async incr(key: string) {
    const current = await this.get(key)
    const newValue = (current || 0) + 1
    await this.set(key, newValue)
    return newValue
  }

  async expire(key: string, seconds: number) {
    const item = this.store.get(key)
    if (item) {
      item.expiry = Date.now() + seconds * 1000
      return 1
    }
    return 0
  }

  async ttl(key: string) {
    const item = this.store.get(key)
    if (!item || !item.expiry) return -1
    const ttl = Math.floor((item.expiry - Date.now()) / 1000)
    return ttl > 0 ? ttl : -2
  }
}

// Use in-memory store if Redis is not configured
const isRedisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

// Create a wrapper that implements the methods needed by rate limiter
class RedisCompatibleStore {
  private store: InMemoryStore | Redis

  constructor() {
    this.store = isRedisConfigured ? redis : new InMemoryStore()
  }

  async get(key: string) {
    return this.store.get(key)
  }

  async set(key: string, value: any, options?: { ex?: number }) {
    return this.store.set(key, value, options)
  }

  async del(key: string) {
    return this.store.del(key)
  }

  async incr(key: string) {
    return this.store.incr(key)
  }

  async expire(key: string, seconds: number) {
    return this.store.expire(key, seconds)
  }

  async ttl(key: string) {
    return this.store.ttl(key)
  }

  // Add evalsha stub for rate limiter compatibility
  async evalsha(...args: any[]) {
    // For in-memory store, we'll use a simple implementation
    if (!isRedisConfigured) {
      // This is a simplified implementation for development
      return null
    }
    return (redis as any).evalsha(...args)
  }

  // Add eval stub for rate limiter compatibility  
  async eval(...args: any[]) {
    // For in-memory store, we'll use a simple implementation
    if (!isRedisConfigured) {
      // This is a simplified implementation for development
      return null
    }
    return (redis as any).eval(...args)
  }
}

export const cache = new RedisCompatibleStore()

// Cache configuration
export const CACHE_TTL = {
  userSession: 3600,    // 1 hour
  apiKey: 1800,         // 30 minutes
  usage: 300,           // 5 minutes
  static: 86400,        // 24 hours
  rateLimit: 60,        // 1 minute
} as const

// Cache key generators
export const cacheKeys = {
  userSession: (userId: string) => `session:${userId}`,
  apiKey: (key: string) => `apikey:${key}`,
  usage: (userId: string, period: string) => `usage:${userId}:${period}`,
  rateLimit: (identifier: string, endpoint: string) => `ratelimit:${identifier}:${endpoint}`,
  organization: (orgId: string) => `org:${orgId}`,
  memberCount: (orgId: string) => `org:${orgId}:members`,
} as const

export default cache