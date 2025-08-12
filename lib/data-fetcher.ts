import { apiKeyManager, KeyType, KeyNotAvailableError, KeyExpiredError, KeyQuotaExceededError } from './api-key-manager'
import { decrypt } from './encryption'

interface FetchOptions {
  userId: string
  provider: string
  endpoint: string
  method?: string
  body?: any
  headers?: Record<string, string>
}

interface FetchResult<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
  headers?: Headers
}

class DataFetcher {
  private static instance: DataFetcher
  
  // Provider-specific base URLs
  private readonly baseUrls = {
    openai: {
      standard: 'https://api.openai.com/v1',
      usage: 'https://api.openai.com/v1/usage',
      admin: 'https://api.openai.com/v1/organization'
    },
    anthropic: {
      standard: 'https://api.anthropic.com/v1',
      usage: 'https://api.anthropic.com/v1/usage',
      admin: 'https://api.anthropic.com/v1/organizations'
    },
    google: {
      standard: 'https://generativelanguage.googleapis.com/v1',
      usage: 'https://generativelanguage.googleapis.com/v1/usage',
      admin: 'https://generativelanguage.googleapis.com/v1/admin'
    },
    perplexity: {
      standard: 'https://api.perplexity.ai',
      usage: 'https://api.perplexity.ai/usage',
      admin: 'https://api.perplexity.ai/admin'
    },
    xai: {
      standard: 'https://api.x.ai/v1',
      usage: 'https://api.x.ai/v1/usage',
      admin: 'https://api.x.ai/v1/admin'
    }
  }

  private constructor() {}

  static getInstance(): DataFetcher {
    if (!DataFetcher.instance) {
      DataFetcher.instance = new DataFetcher()
    }
    return DataFetcher.instance
  }

  async fetchProviderData<T = any>(options: FetchOptions): Promise<FetchResult<T>> {
    const { userId, provider, endpoint, method = 'GET', body, headers = {} } = options
    
    try {
      // Get a valid key for the provider
      const key = await this.getWorkingKey(userId, provider)
      
      if (!key) {
        throw new KeyNotAvailableError(provider)
      }

      // Decrypt the key
      const decryptedKey = decrypt(key.encryptedKey)
      
      // Determine the appropriate base URL based on key type
      const baseUrl = this.getBaseUrl(provider, key.type, endpoint)
      
      // Build the full URL
      const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
      
      // Set up headers based on provider
      const requestHeaders = this.buildHeaders(provider, decryptedKey, headers)
      
      // Make the request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      })

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`)
      }

      // Handle quota exceeded
      if (response.status === 402) {
        throw new KeyQuotaExceededError(provider)
      }

      // Handle expired key
      if (response.status === 401) {
        // Mark key as inactive
        await this.markKeyInactive(key.id)
        throw new KeyExpiredError(provider)
      }

      // Parse response
      const data = await response.json()

      // Update last used timestamp
      await this.updateKeyLastUsed(key.id)

      return {
        success: response.ok,
        data,
        statusCode: response.status,
        headers: response.headers,
        error: response.ok ? undefined : data.error?.message || 'Request failed'
      }

    } catch (error) {
      if (error instanceof KeyNotAvailableError || 
          error instanceof KeyExpiredError || 
          error instanceof KeyQuotaExceededError) {
        throw error
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }
    }
  }

  private async getWorkingKey(userId: string, provider: string) {
    const keys = await apiKeyManager.getKeys(userId, provider)
    
    // Try to find an admin key first for admin endpoints
    const adminKey = keys.find(k => k.isActive && k.type === KeyType.ADMIN)
    if (adminKey) return adminKey
    
    // Then try usage tracking keys
    const usageKey = keys.find(k => k.isActive && k.type === KeyType.USAGE_TRACKING)
    if (usageKey) return usageKey
    
    // Finally, any active key
    return keys.find(k => k.isActive)
  }

  private getBaseUrl(provider: string, keyType: KeyType, endpoint: string): string {
    const urls = this.baseUrls[provider as keyof typeof this.baseUrls]
    if (!urls) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // Determine which base URL to use based on endpoint pattern
    if (endpoint.includes('usage') || endpoint.includes('billing')) {
      return urls.usage || urls.standard
    }
    
    if (endpoint.includes('organization') || endpoint.includes('admin') || endpoint.includes('members')) {
      return urls.admin || urls.standard
    }
    
    return urls.standard
  }

  private buildHeaders(provider: string, key: string, additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }

    switch (provider.toLowerCase()) {
      case 'openai':
        headers['Authorization'] = `Bearer ${key}`
        break
      
      case 'anthropic':
        headers['x-api-key'] = key
        headers['anthropic-version'] = '2023-06-01'
        break
      
      case 'google':
        // Google uses API key in URL params, but we'll add it as a header too
        headers['X-Goog-Api-Key'] = key
        break
      
      case 'perplexity':
        headers['Authorization'] = `Bearer ${key}`
        break
      
      case 'xai':
        headers['Authorization'] = `Bearer ${key}`
        break
      
      default:
        headers['Authorization'] = `Bearer ${key}`
    }

    return headers
  }

  private async markKeyInactive(keyId: string): Promise<void> {
    try {
      await fetch(`/api/api-keys/${keyId}/deactivate`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to mark key as inactive:', error)
    }
  }

  private async updateKeyLastUsed(keyId: string): Promise<void> {
    try {
      await fetch(`/api/api-keys/${keyId}/used`, {
        method: 'POST'
      })
    } catch (error) {
      // Non-critical, don't throw
      console.error('Failed to update key last used:', error)
    }
  }

  // Specific methods for common operations
  async fetchUsageData(userId: string, provider: string, startDate?: Date, endDate?: Date): Promise<FetchResult> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate.toISOString())
    if (endDate) params.append('end_date', endDate.toISOString())
    
    const endpoint = params.toString() ? `/usage?${params}` : '/usage'
    
    return this.fetchProviderData({
      userId,
      provider,
      endpoint
    })
  }

  async fetchOrganizationData(userId: string, provider: string): Promise<FetchResult> {
    return this.fetchProviderData({
      userId,
      provider,
      endpoint: '/organization'
    })
  }

  async fetchModels(userId: string, provider: string): Promise<FetchResult> {
    const endpoint = provider === 'google' ? '/models' : '/models'
    
    return this.fetchProviderData({
      userId,
      provider,
      endpoint
    })
  }

  async testConnection(userId: string, provider: string): Promise<boolean> {
    try {
      const result = await this.fetchModels(userId, provider)
      return result.success
    } catch (error) {
      if (error instanceof KeyNotAvailableError) {
        return false
      }
      throw error
    }
  }

  // Batch fetch from multiple providers
  async fetchFromAllProviders<T = any>(
    userId: string,
    endpoint: string,
    providers?: string[]
  ): Promise<Map<string, FetchResult<T>>> {
    const targetProviders = providers || ['openai', 'anthropic', 'google', 'perplexity', 'xai']
    const results = new Map<string, FetchResult<T>>()
    
    await Promise.all(
      targetProviders.map(async (provider) => {
        try {
          const result = await this.fetchProviderData<T>({
            userId,
            provider,
            endpoint
          })
          results.set(provider, result)
        } catch (error) {
          results.set(provider, {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch'
          })
        }
      })
    )
    
    return results
  }
}

// Export singleton instance
export const dataFetcher = DataFetcher.getInstance()

// Helper function for API routes
export async function fetchWithApiKey<T = any>(
  userId: string,
  provider: string,
  endpoint: string,
  options?: Partial<FetchOptions>
): Promise<T> {
  const result = await dataFetcher.fetchProviderData<T>({
    userId,
    provider,
    endpoint,
    ...options
  })
  
  if (!result.success) {
    throw new Error(result.error || 'Request failed')
  }
  
  return result.data as T
}