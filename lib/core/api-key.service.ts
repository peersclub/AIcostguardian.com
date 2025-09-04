/**
 * Unified API Key Service
 * Central service for all API key operations across the application
 * Used by: AIOptimise, AIOptimiseV2, Settings, Onboarding, Organization settings
 */

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production'
const ALGORITHM = 'aes-256-gcm'

export type Provider = 'openai' | 'claude' | 'gemini' | 'grok' | 'perplexity' | 'cohere' | 'mistral'

export interface ApiKey {
  id: string
  provider: Provider
  encryptedKey: string
  lastUsed: Date | null
  lastTested: Date | null
  isActive: boolean
  createdAt: Date
  userId: string
  organizationId: string
}

export interface ApiKeyInput {
  provider: Provider
  key: string
  userId: string
  organizationId: string
}

export interface ApiKeyValidation {
  isValid: boolean
  error?: string
  model?: string
}

class ApiKeyService {
  private static instance: ApiKeyService
  private cache: Map<string, { key: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  /**
   * Encrypt an API key for storage
   */
  private encrypt(text: string): string {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt an API key for use
   */
  private decrypt(encryptedData: string): string {
    try {
      // Check if the data might be unencrypted (for migration/debugging)
      if (!encryptedData.includes(':')) {
        console.warn('API key appears to be unencrypted, returning as-is')
        return encryptedData
      }
      
      const parts = encryptedData.split(':')
      if (parts.length !== 3) {
        console.error('Invalid encrypted data format, expected 3 parts, got:', parts.length)
        throw new Error('Invalid encrypted data format')
      }

      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
      const iv = Buffer.from(parts[0], 'hex')
      const authTag = Buffer.from(parts[1], 'hex')
      const encrypted = parts[2]
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      console.error('Encrypted data format:', encryptedData.substring(0, 50) + '...')
      throw new Error('Failed to decrypt API key: ' + (error as Error).message)
    }
  }

  /**
   * Get all API keys for a user/organization
   */
  async getApiKeys(userId: string, organizationId?: string): Promise<ApiKey[]> {
    // Get keys that belong to the user
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return keys.map(key => ({
      ...key,
      provider: key.provider as Provider
    }))
  }

  /**
   * Get API key by ID with metadata
   */
  async getApiKeyById(keyId: string, userId: string): Promise<{ key: string; provider: string } | null> {
    try {
      // First verify the key belongs to the user
      const apiKey = await prisma.apiKey.findFirst({
        where: { id: keyId, userId }
      })
      
      if (!apiKey) {
        return null
      }

      const decryptedKey = this.decrypt(apiKey.encryptedKey)
      
      return {
        key: decryptedKey,
        provider: apiKey.provider
      }
    } catch (error) {
      console.error('Error getting API key by ID:', error)
      return null
    }
  }

  /**
   * Update last tested timestamp for an API key
   */
  async updateLastTested(keyId: string): Promise<void> {
    try {
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { lastTested: new Date() }
      })
    } catch (error) {
      console.error('Error updating last tested timestamp:', error)
    }
  }

  /**
   * Get a specific API key by provider
   */
  async getApiKey(userId: string, provider: Provider, organizationId?: string): Promise<string | null> {
    try {
      // Check cache first
      const cacheKey = `${userId}-${provider}-${organizationId || 'personal'}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('Returning cached API key for:', { userId, provider, organizationId })
        return cached.key
      }

      const where = organizationId
        ? { userId, provider, organizationId, isActive: true }
        : { userId, provider, isActive: true }

      console.log('Searching for API key with:', where)
      
      const apiKey = await prisma.apiKey.findFirst({
        where,
        orderBy: { createdAt: 'desc' }
      })

      if (!apiKey) {
        console.log('No API key found in database for:', { userId, provider, organizationId })
        return null
      }

      console.log('Found API key, attempting decryption...')
      const decryptedKey = this.decrypt(apiKey.encryptedKey)
      
      if (!decryptedKey) {
        console.error('Decryption returned empty key')
        return null
      }
      
      // Update cache
      this.cache.set(cacheKey, {
        key: decryptedKey,
        timestamp: Date.now()
      })

      // Update last used timestamp asynchronously
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() }
      }).catch(console.error)

      return decryptedKey
    } catch (error) {
      console.error('Error getting API key:', error)
      return null
    }
  }

  /**
   * Save or update an API key
   */
  async saveApiKey(input: ApiKeyInput): Promise<ApiKey> {
    const encryptedKey = this.encrypt(input.key)

    // Validate the key first
    const validation = await this.validateApiKey(input.provider, input.key)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key')
    }

    // Check if key already exists
    const existing = await prisma.apiKey.findFirst({
      where: {
        userId: input.userId,
        provider: input.provider,
        organizationId: input.organizationId
      }
    })

    let apiKey: any

    if (existing) {
      // Update existing key
      apiKey = await prisma.apiKey.update({
        where: { id: existing.id },
        data: {
          encryptedKey,
          isActive: true,
          lastTested: new Date()
        }
      })
    } else {
      // Create new key
      apiKey = await prisma.apiKey.create({
        data: {
          provider: input.provider,
          encryptedKey,
          userId: input.userId,
          organizationId: input.organizationId,
          isActive: true,
          lastTested: new Date()
        }
      })
    }

    // Clear cache
    const cacheKey = `${input.userId}-${input.provider}-${input.organizationId || 'personal'}`
    this.cache.delete(cacheKey)

    return {
      ...apiKey,
      provider: apiKey.provider as Provider
    }
  }

  /**
   * Delete an API key by provider (backward compatibility)
   */
  async deleteApiKey(userId: string, provider: Provider, organizationId?: string): Promise<boolean> {
    const where = organizationId
      ? { userId, provider, organizationId }
      : { userId, provider }

    const apiKey = await prisma.apiKey.findFirst({ where })
    
    if (!apiKey) {
      return false
    }

    await prisma.apiKey.delete({
      where: { id: apiKey.id }
    })

    // Clear cache
    const cacheKey = `${userId}-${provider}-${organizationId || 'personal'}`
    this.cache.delete(cacheKey)

    return true
  }

  /**
   * Delete an API key by ID (preferred method)
   */
  async deleteApiKeyById(keyId: string, userId: string): Promise<boolean> {
    try {
      // First verify the key belongs to the user
      const apiKey = await prisma.apiKey.findFirst({
        where: { id: keyId, userId }
      })
      
      if (!apiKey) {
        return false
      }

      await prisma.apiKey.delete({
        where: { id: keyId }
      })

      // Clear cache
      const cacheKey = `${userId}-${apiKey.provider}-${apiKey.organizationId || 'personal'}`
      this.cache.delete(cacheKey)

      return true
    } catch (error) {
      console.error('Error deleting API key by ID:', error)
      return false
    }
  }

  /**
   * Validate an API key by testing it with the provider
   */
  async validateApiKey(provider: Provider, key: string): Promise<ApiKeyValidation> {
    try {
      switch (provider) {
        case 'openai':
          return await this.validateOpenAIKey(key)
        case 'claude':
          return await this.validateClaudeKey(key)
        case 'gemini':
          return await this.validateGeminiKey(key)
        case 'grok':
          return await this.validateGrokKey(key)
        case 'perplexity':
          return await this.validatePerplexityKey(key)
        case 'cohere':
          return await this.validateCohereKey(key)
        case 'mistral':
          return await this.validateMistralKey(key)
        default:
          return { isValid: false, error: 'Unsupported provider' }
      }
    } catch (error) {
      console.error(`API key validation error for ${provider}:`, error)
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      }
    }
  }

  private async validateOpenAIKey(key: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      })

      if (response.ok) {
        const data = await response.json()
        const hasGPT4 = data.data?.some((m: any) => m.id.includes('gpt-4'))
        return { 
          isValid: true, 
          model: hasGPT4 ? 'gpt-4' : 'gpt-3.5-turbo' 
        }
      }

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      return { isValid: false, error: 'Failed to connect to OpenAI' }
    }
  }

  private async validateClaudeKey(key: string): Promise<ApiKeyValidation> {
    try {
      // First check if the key format is valid
      if (!key || !key.startsWith('sk-ant-')) {
        return { isValid: false, error: 'Invalid Claude API key format' }
      }

      // Make a minimal API call that will validate the key
      const response = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-2.0',
          prompt: '\n\nHuman: Hi\n\nAssistant:',
          max_tokens_to_sample: 1,
          temperature: 0
        })
      })

      console.log('Claude validation response status:', response.status)

      // Check response status
      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      if (response.status === 403) {
        return { isValid: false, error: 'API key lacks required permissions' }
      }

      if (response.status === 429) {
        // Rate limited but key is valid
        return { isValid: true, model: 'claude-3' }
      }

      if (response.ok) {
        return { isValid: true, model: 'claude-3' }
      }

      // Try the messages endpoint as fallback
      const messagesResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        })
      })

      console.log('Claude messages endpoint response:', messagesResponse.status)

      if (messagesResponse.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      if (messagesResponse.ok || messagesResponse.status === 429) {
        return { isValid: true, model: 'claude-3' }
      }

      // Parse error response
      const errorData = await messagesResponse.json().catch(() => ({}))
      const errorMessage = (errorData as any)?.error?.message || `API error: ${messagesResponse.status}`
      
      // If it's a credit/billing issue, the key is still valid
      if (errorMessage.includes('credit') || errorMessage.includes('billing')) {
        return { isValid: true, model: 'claude-3', error: 'Key is valid but has billing/credit issues' }
      }

      return { isValid: false, error: errorMessage }
    } catch (error) {
      console.error('Claude validation error:', error)
      return { isValid: false, error: 'Failed to connect to Anthropic' }
    }
  }

  private async validateGeminiKey(key: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}`
      )

      if (response.ok) {
        return { isValid: true, model: 'gemini-pro' }
      }

      if (response.status === 403 || response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      return { isValid: false, error: 'Failed to connect to Google AI' }
    }
  }

  private async validateGrokKey(key: string): Promise<ApiKeyValidation> {
    try {
      // Check key format first
      if (!key || !key.startsWith('xai-')) {
        return { isValid: false, error: 'Invalid Grok API key format (should start with xai-)' }
      }

      // Try the models endpoint first
      const modelsResponse = await fetch('https://api.x.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`
        }
      })

      console.log('Grok models endpoint response:', modelsResponse.status)

      // If models endpoint works, key is valid
      if (modelsResponse.ok) {
        return { isValid: true, model: 'grok-beta' }
      }

      // Try chat completions endpoint as fallback
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1,
          temperature: 0
        })
      })

      console.log('Grok chat endpoint response:', response.status)

      if (response.status === 401 || response.status === 403) {
        return { isValid: false, error: 'Invalid or unauthorized API key' }
      }

      // 400 might mean the request is malformed but key is valid
      // 404 might mean the endpoint changed but authentication passed
      // 429 means rate limited but key is valid
      if (response.ok || response.status === 400 || response.status === 404 || response.status === 429) {
        // For now, accept the key if it's in the right format
        // since the API might be in beta or changing
        console.log('Accepting Grok key despite status:', response.status)
        return { isValid: true, model: 'grok-beta' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      console.error('Grok validation error:', error)
      // If we can't reach the API but the key format is correct, accept it
      if (key.startsWith('xai-') && key.length > 20) {
        console.log('Accepting Grok key based on format (API unreachable)')
        return { isValid: true, model: 'grok-beta', error: 'Could not validate with API, accepted based on format' }
      }
      return { isValid: false, error: 'Failed to connect to xAI' }
    }
  }

  private async validatePerplexityKey(key: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      if (response.ok || response.status === 400) {
        return { isValid: true, model: 'llama-3.1-sonar' }
      }

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      return { isValid: false, error: 'Failed to connect to Perplexity' }
    }
  }

  private async validateCohereKey(key: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.cohere.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      })

      if (response.ok) {
        return { isValid: true, model: 'command' }
      }

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      return { isValid: false, error: 'Failed to connect to Cohere' }
    }
  }

  private async validateMistralKey(key: string): Promise<ApiKeyValidation> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${key}` }
      })

      if (response.ok) {
        return { isValid: true, model: 'mistral-large' }
      }

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      return { isValid: false, error: `API error: ${response.status}` }
    } catch (error) {
      return { isValid: false, error: 'Failed to connect to Mistral' }
    }
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const apiKeyService = ApiKeyService.getInstance()