import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/encryption'

export enum KeyType {
  USAGE_TRACKING = 'usage',
  ADMIN = 'admin',
  STANDARD = 'standard'
}

export interface ApiKey {
  id: string
  provider: string
  type: KeyType
  encryptedKey: string
  lastUsed?: Date
  lastTested?: Date
  isActive: boolean
  userId: string
  organizationId?: string
  metadata?: any
  createdAt?: Date
}

export interface ValidationResult {
  valid: boolean
  keyType: KeyType
  error?: string
  capabilities?: {
    models?: string[]
    rateLimit?: number
    quotaRemaining?: number
    hasAdminAccess?: boolean
  }
}

export interface TestResult {
  success: boolean
  response?: any
  latency?: number
  modelAccess?: string[]
  quotas?: {
    used: number
    limit: number
  }
  error?: string
}

export interface BatchValidationResult {
  results: Map<string, ValidationResult>
  errors: Map<string, string>
  summary: {
    total: number
    valid: number
    invalid: number
  }
}

// Provider-specific key patterns
const KEY_PATTERNS = {
  openai: {
    usage: /^sk-proj-/,
    admin: /^sk-admin-/,
    standard: /^sk-/
  },
  anthropic: {
    usage: /^sk-ant-api/,
    admin: /^sk-ant-admin-/,
    standard: /^sk-ant-/
  },
  google: {
    usage: /^AIza/,
    admin: /^admin_/,
    standard: /^AIza/
  },
  perplexity: {
    usage: /^pplx-/,
    admin: /^pplx-admin-/,
    standard: /^pplx-/
  },
  xai: {
    usage: /^xai-/,
    admin: /^xai-admin-/,
    standard: /^xai-/
  }
}

class ApiKeyManager {
  private static instance: ApiKeyManager
  private keyCache: Map<string, ApiKey[]> = new Map()
  private validationCache: Map<string, ValidationResult> = new Map()
  private lastRefresh: Date | null = null

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager()
    }
    return ApiKeyManager.instance
  }

  // Detect key type based on pattern
  private detectKeyType(provider: string, key: string): KeyType {
    const patterns = KEY_PATTERNS[provider as keyof typeof KEY_PATTERNS]
    if (!patterns) return KeyType.STANDARD

    if (patterns.admin.test(key)) return KeyType.ADMIN
    if (patterns.usage.test(key)) return KeyType.USAGE_TRACKING
    return KeyType.STANDARD
  }

  // Core validation function
  async validateKey(provider: string, key: string, type?: KeyType): Promise<ValidationResult> {
    try {
      // Check cache first
      const cacheKey = `${provider}:${key}`
      if (this.validationCache.has(cacheKey)) {
        const cached = this.validationCache.get(cacheKey)!
        // Cache for 5 minutes
        if (cached && this.lastRefresh && (Date.now() - this.lastRefresh.getTime()) < 5 * 60 * 1000) {
          return cached
        }
      }

      // Detect type if not provided
      const keyType = type || this.detectKeyType(provider, key)

      // Provider-specific validation
      let result: ValidationResult
      switch (provider.toLowerCase()) {
        case 'openai':
          result = await this.validateOpenAIKey(key, keyType)
          break
        case 'anthropic':
          result = await this.validateAnthropicKey(key, keyType)
          break
        case 'google':
          result = await this.validateGoogleKey(key, keyType)
          break
        case 'perplexity':
          result = await this.validatePerplexityKey(key, keyType)
          break
        case 'xai':
          result = await this.validateXAIKey(key, keyType)
          break
        default:
          result = { valid: false, keyType: KeyType.STANDARD, error: 'Unsupported provider' }
      }

      // Cache the result
      this.validationCache.set(cacheKey, result)
      return result

    } catch (error) {
      return {
        valid: false,
        keyType: KeyType.STANDARD,
        error: error instanceof Error ? error.message : 'Validation failed'
      }
    }
  }

  // Provider-specific validation methods
  private async validateOpenAIKey(key: string, type: KeyType): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const models = data.data?.map((m: any) => m.id) || []
        
        // Check for admin capabilities
        const hasAdminAccess = type === KeyType.ADMIN || key.startsWith('sk-admin-')
        
        return {
          valid: true,
          keyType: type,
          capabilities: {
            models,
            rateLimit: response.headers.get('x-ratelimit-limit') 
              ? parseInt(response.headers.get('x-ratelimit-limit')!) 
              : undefined,
            quotaRemaining: response.headers.get('x-ratelimit-remaining')
              ? parseInt(response.headers.get('x-ratelimit-remaining')!)
              : undefined,
            hasAdminAccess
          }
        }
      }

      return {
        valid: false,
        keyType: type,
        error: `Invalid key: ${response.status} ${response.statusText}`
      }
    } catch (error) {
      return {
        valid: false,
        keyType: type,
        error: error instanceof Error ? error.message : 'Failed to validate OpenAI key'
      }
    }
  }

  private async validateAnthropicKey(key: string, type: KeyType): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      // Check if key is valid (even if rate limited)
      if (response.status === 200 || response.status === 429) {
        return {
          valid: true,
          keyType: type,
          capabilities: {
            models: ['claude-3-opus-20240229', 'claude-3-sonnet-20241022', 'claude-3-haiku-20240307'],
            hasAdminAccess: type === KeyType.ADMIN
          }
        }
      }

      return {
        valid: false,
        keyType: type,
        error: `Invalid key: ${response.status}`
      }
    } catch (error) {
      return {
        valid: false,
        keyType: type,
        error: error instanceof Error ? error.message : 'Failed to validate Anthropic key'
      }
    }
  }

  private async validateGoogleKey(key: string, type: KeyType): Promise<ValidationResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`)
      
      if (response.ok) {
        const data = await response.json()
        const models = data.models?.map((m: any) => m.name) || []
        
        return {
          valid: true,
          keyType: type,
          capabilities: {
            models,
            hasAdminAccess: type === KeyType.ADMIN
          }
        }
      }

      return {
        valid: false,
        keyType: type,
        error: `Invalid key: ${response.status}`
      }
    } catch (error) {
      return {
        valid: false,
        keyType: type,
        error: error instanceof Error ? error.message : 'Failed to validate Google key'
      }
    }
  }

  private async validatePerplexityKey(key: string, type: KeyType): Promise<ValidationResult> {
    // Perplexity validation logic
    return {
      valid: true, // Placeholder
      keyType: type,
      capabilities: {
        models: ['sonar-pro', 'sonar', 'codellama-70b-instruct'],
        hasAdminAccess: type === KeyType.ADMIN
      }
    }
  }

  private async validateXAIKey(key: string, type: KeyType): Promise<ValidationResult> {
    // XAI validation logic
    return {
      valid: true, // Placeholder
      keyType: type,
      capabilities: {
        models: ['grok-beta'],
        hasAdminAccess: type === KeyType.ADMIN
      }
    }
  }

  // Store key in database
  async storeKey(userId: string, provider: string, key: string, type?: KeyType): Promise<void> {
    try {
      const keyType = type || this.detectKeyType(provider, key)
      const encryptedKey = encrypt(key)
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true }
      })
      
      const createData: any = {
        userId,
        provider: provider.toUpperCase(),
        encryptedKey,
        isActive: true
      }
      
      if (user?.organizationId) {
        createData.organizationId = user.organizationId
      }
      
      await prisma.apiKey.create({
        data: createData
      })

      // Clear cache
      this.keyCache.delete(userId)
    } catch (error) {
      throw new Error(`Failed to store key: ${error}`)
    }
  }

  // Get all keys for a user
  async getKeys(userId: string, provider?: string): Promise<ApiKey[]> {
    try {
      // Check cache
      if (!provider && this.keyCache.has(userId)) {
        return this.keyCache.get(userId)!
      }

      // For client-side, fetch from API
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/api-keys')
        if (!response.ok) {
          console.error('Failed to fetch API keys:', response.status)
          return []
        }
        
        const data = await response.json()
        const keys = data.keys || []
        
        // Filter by provider if specified
        const filteredKeys = provider 
          ? keys.filter((k: any) => k.provider.toLowerCase() === provider.toLowerCase())
          : keys
        
        // Map to ApiKey interface
        const apiKeys: ApiKey[] = filteredKeys.map((k: any) => ({
          id: k.id,
          provider: k.provider,
          encryptedKey: k.maskedKey || '', // Use masked key for client-side
          isActive: k.isActive,
          type: this.detectKeyType(k.provider.toLowerCase(), 'sk-dummy'),
          lastUsed: k.lastUsed ? new Date(k.lastUsed) : undefined,
          lastTested: k.lastTested ? new Date(k.lastTested) : undefined,
          createdAt: new Date(k.createdAt),
          userId: userId,
          organizationId: undefined
        }))
        
        // Cache if fetching all keys
        if (!provider) {
          this.keyCache.set(userId, apiKeys)
        }
        
        return apiKeys
      }
      
      // Server-side: use Prisma directly
      const where = provider 
        ? { userId, provider: provider.toUpperCase() }
        : { userId }

      const keys = await prisma.apiKey.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      const apiKeys = keys.map(key => ({
        id: key.id,
        provider: key.provider,
        type: this.detectKeyType(key.provider.toLowerCase(), 'sk-dummy'),
        encryptedKey: key.encryptedKey,
        lastUsed: key.lastUsed || undefined,
        lastTested: key.lastTested || undefined,
        isActive: key.isActive,
        userId: key.userId,
        organizationId: key.organizationId || undefined,
        createdAt: key.createdAt || undefined
      }))

      // Cache if getting all keys
      if (!provider) {
        this.keyCache.set(userId, apiKeys)
      }

      return apiKeys
    } catch (error) {
      console.error('Failed to get keys:', error)
      return []
    }
  }

  // Test API key functionality
  async testKey(provider: string, key: string): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      // Provider-specific test
      let result: TestResult
      switch (provider.toLowerCase()) {
        case 'openai':
          result = await this.testOpenAIKey(key)
          break
        case 'anthropic':
          result = await this.testAnthropicKey(key)
          break
        case 'google':
          result = await this.testGoogleKey(key)
          break
        default:
          result = { success: false, error: 'Unsupported provider for testing' }
      }

      result.latency = Date.now() - startTime
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        latency: Date.now() - startTime
      }
    }
  }

  private async testOpenAIKey(key: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say "test successful" in 3 words.' }],
          max_tokens: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          response: data.choices?.[0]?.message?.content,
          modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
        }
      }

      return {
        success: false,
        error: `Test failed: ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      }
    }
  }

  private async testAnthropicKey(key: string): Promise<TestResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'Say "test successful".' }],
          max_tokens: 10
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          response: data.content?.[0]?.text,
          modelAccess: ['claude-3-haiku-20240307', 'claude-3-sonnet-20241022', 'claude-3-opus-20240229']
        }
      }

      return {
        success: false,
        error: `Test failed: ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      }
    }
  }

  private async testGoogleKey(key: string): Promise<TestResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "test successful".' }]
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          response: data.candidates?.[0]?.content?.parts?.[0]?.text,
          modelAccess: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
        }
      }

      return {
        success: false,
        error: `Test failed: ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      }
    }
  }

  // Check availability of provider
  async checkAvailability(provider: string, userId: string): Promise<boolean> {
    try {
      const keys = await this.getKeys(userId, provider)
      return keys.some(key => key.isActive)
    } catch {
      return false
    }
  }

  // Get all working keys
  async getWorkingKeys(userId: string): Promise<Map<string, ApiKey>> {
    const workingKeys = new Map<string, ApiKey>()
    
    try {
      const allKeys = await this.getKeys(userId)
      
      for (const key of allKeys) {
        if (key.isActive) {
          // Get the first active key per provider
          if (!workingKeys.has(key.provider)) {
            workingKeys.set(key.provider, key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to get working keys:', error)
    }

    return workingKeys
  }

  // Refresh key status
  async refreshKeyStatus(userId: string): Promise<void> {
    try {
      const keys = await this.getKeys(userId)
      
      for (const key of keys) {
        const decryptedKey = decrypt(key.encryptedKey)
        const validation = await this.validateKey(key.provider.toLowerCase(), decryptedKey)
        
        // Update key status in database
        await prisma.apiKey.update({
          where: { id: key.id },
          data: {
            isActive: validation.valid,
            lastTested: new Date()
          }
        })
      }

      // Clear cache
      this.keyCache.delete(userId)
      this.lastRefresh = new Date()
    } catch (error) {
      console.error('Failed to refresh key status:', error)
    }
  }

  // Batch validation
  async validateBatch(keys: Array<{ provider: string; key: string }>): Promise<BatchValidationResult> {
    const results = new Map<string, ValidationResult>()
    const errors = new Map<string, string>()
    
    await Promise.all(
      keys.map(async ({ provider, key }) => {
        try {
          const result = await this.validateKey(provider, key)
          results.set(`${provider}:${key}`, result)
        } catch (error) {
          errors.set(`${provider}:${key}`, error instanceof Error ? error.message : 'Validation failed')
        }
      })
    )

    const validCount = Array.from(results.values()).filter(r => r.valid).length

    return {
      results,
      errors,
      summary: {
        total: keys.length,
        valid: validCount,
        invalid: keys.length - validCount
      }
    }
  }

  // Test all keys for a user
  async testAllKeys(userId: string): Promise<Map<string, TestResult>> {
    const results = new Map<string, TestResult>()
    
    try {
      const keys = await this.getKeys(userId)
      
      await Promise.all(
        keys.map(async (key) => {
          const decryptedKey = decrypt(key.encryptedKey)
          const result = await this.testKey(key.provider.toLowerCase(), decryptedKey)
          results.set(key.provider, result)
        })
      )
    } catch (error) {
      console.error('Failed to test all keys:', error)
    }

    return results
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance()

// Error classes
export class KeyNotAvailableError extends Error {
  constructor(public provider: string) {
    super(`No valid API key available for ${provider}`)
    this.name = 'KeyNotAvailableError'
  }
}

export class KeyExpiredError extends Error {
  constructor(public provider: string) {
    super(`API key expired for ${provider}`)
    this.name = 'KeyExpiredError'
  }
}

export class KeyQuotaExceededError extends Error {
  constructor(public provider: string) {
    super(`API quota exceeded for ${provider}`)
    this.name = 'KeyQuotaExceededError'
  }
}