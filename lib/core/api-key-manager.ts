/**
 * Enhanced API Key Manager
 * Extends the base API key service with advanced features:
 * - Comprehensive error handling and retry logic
 * - Health monitoring and validation scheduling
 * - Rate limit detection and management
 * - Audit logging for compliance
 * - Fallback key support
 */

import { apiKeyService, Provider, ApiKeyValidation } from './api-key.service'
import { prisma } from '@/lib/prisma'

export interface ApiKeyHealth {
  provider: Provider
  status: 'healthy' | 'degraded' | 'failed'
  lastChecked: Date
  error?: string
  responseTime?: number
  rateLimit?: {
    remaining: number
    reset: Date
  }
}

export interface ApiKeyAuditLog {
  id: string
  userId: string
  organizationId: string
  action: 'create' | 'update' | 'delete' | 'validate' | 'use'
  provider: Provider
  success: boolean
  error?: string
  metadata?: any
  timestamp: Date
}

export interface ApiKeyError {
  code: 'INVALID_KEY' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'PROVIDER_ERROR' | 'NOT_FOUND'
  message: string
  provider: Provider
  retryable: boolean
  retryAfter?: number
}

class ApiKeyManager {
  private static instance: ApiKeyManager
  private healthCache: Map<string, ApiKeyHealth> = new Map()
  private rateLimitCache: Map<string, { reset: Date; remaining: number }> = new Map()
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    // Initialize the base service
    this.initializeHealthMonitoring()
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager()
    }
    return ApiKeyManager.instance
  }

  /**
   * Initialize background health monitoring
   */
  private initializeHealthMonitoring() {
    // Set up periodic health checks for active keys
    setInterval(() => {
      this.performHealthChecks().catch(console.error)
    }, this.HEALTH_CHECK_INTERVAL)
  }

  /**
   * Get an API key with enhanced error handling and fallback support
   */
  async getApiKeyWithFallback(
    userId: string,
    provider: Provider,
    organizationId?: string
  ): Promise<{ key: string; health?: ApiKeyHealth } | null> {
    try {
      // First, try to get the primary key
      const primaryKey = await apiKeyService.getApiKey(userId, provider, organizationId)
      
      if (primaryKey) {
        // Check health status
        const health = await this.checkKeyHealth(userId, provider, primaryKey)
        
        if (health.status === 'healthy') {
          await this.logAudit({
            userId,
            organizationId: organizationId || '',
            action: 'use',
            provider,
            success: true,
            timestamp: new Date()
          })
          return { key: primaryKey, health }
        }
        
        // If primary key is degraded, log warning but still return it
        if (health.status === 'degraded') {
          console.warn(`API key for ${provider} is degraded:`, health.error)
          return { key: primaryKey, health }
        }
      }

      // Try to find a fallback key from another org member
      if (organizationId) {
        const fallbackKey = await this.findFallbackKey(organizationId, provider, userId)
        if (fallbackKey) {
          console.log(`Using fallback API key for ${provider}`)
          return fallbackKey
        }
      }

      return null
    } catch (error) {
      console.error(`Error getting API key for ${provider}:`, error)
      await this.logAudit({
        userId,
        organizationId: organizationId || '',
        action: 'use',
        provider,
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      })
      throw this.createApiKeyError(provider, error as Error)
    }
  }

  /**
   * Validate an API key with comprehensive error detection
   */
  async validateApiKeyEnhanced(
    provider: Provider,
    key: string
  ): Promise<ApiKeyValidation & { health?: ApiKeyHealth }> {
    const startTime = Date.now()
    
    try {
      const validation = await apiKeyService.validateApiKey(provider, key)
      const responseTime = Date.now() - startTime
      
      const health: ApiKeyHealth = {
        provider,
        status: validation.isValid ? 'healthy' : 'failed',
        lastChecked: new Date(),
        responseTime,
        error: validation.error
      }

      // Store health status
      const cacheKey = `${provider}-${key.substring(0, 8)}`
      this.healthCache.set(cacheKey, health)

      return { ...validation, health }
    } catch (error) {
      const health: ApiKeyHealth = {
        provider,
        status: 'failed',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        error: (error as Error).message
      }

      return {
        isValid: false,
        error: this.parseProviderError(provider, error as Error),
        health
      }
    }
  }

  /**
   * Check the health of an API key
   */
  private async checkKeyHealth(
    userId: string,
    provider: Provider,
    key: string
  ): Promise<ApiKeyHealth> {
    const cacheKey = `${provider}-${userId}`
    const cached = this.healthCache.get(cacheKey)
    
    // Return cached health if recent
    if (cached && (Date.now() - cached.lastChecked.getTime()) < 60000) {
      return cached
    }

    // Perform health check
    const validation = await this.validateApiKeyEnhanced(provider, key)
    const health = validation.health || {
      provider,
      status: validation.isValid ? 'healthy' : 'failed',
      lastChecked: new Date(),
      error: validation.error
    }

    this.healthCache.set(cacheKey, health)
    return health
  }

  /**
   * Find a fallback API key from organization members
   */
  private async findFallbackKey(
    organizationId: string,
    provider: Provider,
    excludeUserId: string
  ): Promise<{ key: string; health?: ApiKeyHealth } | null> {
    try {
      const orgKeys = await prisma.apiKey.findMany({
        where: {
          organizationId,
          provider,
          isActive: true,
          userId: { not: excludeUserId }
        },
        orderBy: { lastUsed: 'desc' },
        take: 3 // Check up to 3 fallback keys
      })

      for (const orgKey of orgKeys) {
        const decryptedKey = await apiKeyService.getApiKey(
          orgKey.userId,
          provider as Provider,
          organizationId
        )
        
        if (decryptedKey) {
          const health = await this.checkKeyHealth(orgKey.userId, provider, decryptedKey)
          if (health.status === 'healthy' || health.status === 'degraded') {
            console.log(`Found working fallback key for ${provider}`)
            return { key: decryptedKey, health }
          }
        }
      }
    } catch (error) {
      console.error('Error finding fallback key:', error)
    }
    
    return null
  }

  /**
   * Parse provider-specific errors for better error messages
   */
  private parseProviderError(provider: Provider, error: Error): string {
    const message = error.message.toLowerCase()
    
    // Rate limit detection
    if (message.includes('rate limit') || message.includes('too many requests')) {
      this.updateRateLimit(provider, 0, new Date(Date.now() + 3600000)) // 1 hour
      return `Rate limited by ${provider}. Please wait before retrying.`
    }
    
    // Invalid key detection
    if (message.includes('unauthorized') || message.includes('401') || message.includes('invalid')) {
      return `Invalid API key for ${provider}. Please check your credentials.`
    }
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connect')) {
      return `Unable to connect to ${provider}. Please check your network connection.`
    }
    
    // Quota exceeded
    if (message.includes('quota') || message.includes('exceeded')) {
      return `Quota exceeded for ${provider}. Please upgrade your plan or wait for reset.`
    }
    
    return `Error with ${provider}: ${error.message}`
  }

  /**
   * Create a standardized API key error
   */
  private createApiKeyError(provider: Provider, error: Error): ApiKeyError {
    const message = error.message.toLowerCase()
    
    if (message.includes('rate limit')) {
      return {
        code: 'RATE_LIMITED',
        message: this.parseProviderError(provider, error),
        provider,
        retryable: true,
        retryAfter: 3600000 // 1 hour
      }
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: 'INVALID_KEY',
        message: this.parseProviderError(provider, error),
        provider,
        retryable: false
      }
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: this.parseProviderError(provider, error),
        provider,
        retryable: true,
        retryAfter: 5000 // 5 seconds
      }
    }
    
    return {
      code: 'PROVIDER_ERROR',
      message: this.parseProviderError(provider, error),
      provider,
      retryable: true,
      retryAfter: 30000 // 30 seconds
    }
  }

  /**
   * Update rate limit information
   */
  private updateRateLimit(provider: Provider, remaining: number, reset: Date) {
    this.rateLimitCache.set(provider, { remaining, reset })
  }

  /**
   * Check if a provider is rate limited
   */
  isRateLimited(provider: Provider): boolean {
    const rateLimit = this.rateLimitCache.get(provider)
    if (!rateLimit) return false
    
    if (Date.now() > rateLimit.reset.getTime()) {
      this.rateLimitCache.delete(provider)
      return false
    }
    
    return rateLimit.remaining === 0
  }

  /**
   * Get rate limit info for a provider
   */
  getRateLimitInfo(provider: Provider): { remaining: number; reset: Date } | null {
    return this.rateLimitCache.get(provider) || null
  }

  /**
   * Perform health checks on all active API keys
   */
  private async performHealthChecks() {
    try {
      // Get all active API keys
      const activeKeys = await prisma.apiKey.findMany({
        where: {
          isActive: true,
          lastUsed: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Used in last 7 days
          }
        },
        select: {
          id: true,
          userId: true,
          provider: true,
          organizationId: true
        }
      })

      // Check health of each key
      for (const key of activeKeys) {
        try {
          const apiKey = await apiKeyService.getApiKey(
            key.userId,
            key.provider as Provider,
            key.organizationId || undefined
          )
          
          if (apiKey) {
            await this.checkKeyHealth(key.userId, key.provider as Provider, apiKey)
          }
        } catch (error) {
          console.error(`Health check failed for ${key.provider}:`, error)
        }
      }
    } catch (error) {
      console.error('Error performing health checks:', error)
    }
  }

  /**
   * Log audit entry for compliance and debugging
   */
  private async logAudit(entry: Omit<ApiKeyAuditLog, 'id'>) {
    try {
      // In production, this would write to a proper audit log table
      // For now, we'll just log to console with structured format
      console.log('[API_KEY_AUDIT]', JSON.stringify({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }))
      
      // Optional: Store in database for production
      // await prisma.apiKeyAudit.create({ data: entry })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  /**
   * Get health status for all providers
   */
  getAllHealthStatuses(): Map<string, ApiKeyHealth> {
    return new Map(this.healthCache)
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCaches() {
    this.healthCache.clear()
    this.rateLimitCache.clear()
    apiKeyService.clearCache()
  }

  /**
   * Test all API keys for a user/organization
   */
  async testAllKeys(userId: string, organizationId?: string): Promise<Map<Provider, ApiKeyValidation>> {
    const results = new Map<Provider, ApiKeyValidation>()
    const providers: Provider[] = ['openai', 'claude', 'gemini', 'grok', 'perplexity', 'cohere', 'mistral']
    
    for (const provider of providers) {
      try {
        const key = await apiKeyService.getApiKey(userId, provider, organizationId)
        if (key) {
          const validation = await this.validateApiKeyEnhanced(provider, key)
          results.set(provider, validation)
          
          // Update last tested timestamp
          await prisma.apiKey.updateMany({
            where: {
              userId,
              provider,
              organizationId: organizationId || undefined
            },
            data: {
              lastTested: new Date()
            }
          })
        }
      } catch (error) {
        console.error(`Error testing ${provider} key:`, error)
        results.set(provider, {
          isValid: false,
          error: (error as Error).message
        })
      }
    }
    
    return results
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance()