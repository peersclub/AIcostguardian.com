import httpClient from './httpClient'
import { ROUTES } from '@/config/constants'
import { 
  ProviderConnection, 
  ProviderCredentials, 
  ProviderTestResult,
  ProviderId 
} from '@/types/providers'
import { ApiResponse, ApiKeyResponse } from '@/types/api'

class ProvidersService {
  /**
   * Get all provider connections
   */
  async getConnections(): Promise<ApiResponse<ProviderConnection[]>> {
    return httpClient.get<ProviderConnection[]>(ROUTES.API.SETTINGS + '/api-keys')
  }

  /**
   * Get connection for a specific provider
   */
  async getConnection(providerId: ProviderId): Promise<ApiResponse<ProviderConnection>> {
    return httpClient.get<ProviderConnection>(`${ROUTES.API.SETTINGS}/${providerId}-key`)
  }

  /**
   * Test a provider API key
   */
  async testConnection(providerId: ProviderId, apiKey: string): Promise<ApiResponse<ProviderTestResult>> {
    const endpoint = `/api/${providerId}/test`
    return httpClient.post<ProviderTestResult>(endpoint, { apiKey })
  }

  /**
   * Save provider credentials
   */
  async saveCredentials(credentials: ProviderCredentials): Promise<ApiResponse<ApiKeyResponse>> {
    const endpoint = `${ROUTES.API.SETTINGS}/${credentials.providerId}-key`
    return httpClient.post<ApiKeyResponse>(endpoint, {
      apiKey: credentials.apiKey,
      organizationId: credentials.organizationId,
      projectId: credentials.projectId,
      region: credentials.region,
    })
  }

  /**
   * Update provider credentials
   */
  async updateCredentials(credentials: ProviderCredentials): Promise<ApiResponse<ApiKeyResponse>> {
    const endpoint = `${ROUTES.API.SETTINGS}/${credentials.providerId}-key`
    return httpClient.put<ApiKeyResponse>(endpoint, {
      apiKey: credentials.apiKey,
      organizationId: credentials.organizationId,
      projectId: credentials.projectId,
      region: credentials.region,
    })
  }

  /**
   * Remove provider connection
   */
  async removeConnection(providerId: ProviderId): Promise<ApiResponse<void>> {
    const endpoint = `${ROUTES.API.SETTINGS}/${providerId}-key`
    return httpClient.delete<void>(endpoint)
  }

  /**
   * Check provider status
   */
  async checkStatus(providerId: ProviderId): Promise<ApiResponse<ProviderConnection>> {
    const endpoint = `/api/${providerId}/status`
    return httpClient.get<ProviderConnection>(endpoint)
  }

  /**
   * Batch test multiple providers
   */
  async batchTestConnections(
    providers: Array<{ providerId: ProviderId; apiKey: string }>
  ): Promise<ApiResponse<Record<ProviderId, ProviderTestResult>>> {
    const results: Record<string, ProviderTestResult> = {}
    
    const promises = providers.map(async ({ providerId, apiKey }) => {
      const result = await this.testConnection(providerId, apiKey)
      return { providerId, result }
    })

    const responses = await Promise.allSettled(promises)
    
    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        const { providerId, result } = response.value
        if (result.success && result.data) {
          results[providerId] = result.data
        } else {
          results[providerId] = {
            success: false,
            isAdmin: false,
            message: result.error?.message || 'Test failed',
            error: result.error?.message,
          }
        }
      }
    })

    return {
      success: true,
      data: results as Record<ProviderId, ProviderTestResult>,
    }
  }

  /**
   * Get provider usage statistics
   */
  async getProviderUsage(providerId: ProviderId): Promise<ApiResponse<any>> {
    const endpoint = `/api/${providerId}/usage`
    return httpClient.get(endpoint)
  }

  /**
   * Get all providers usage
   */
  async getAllProvidersUsage(): Promise<ApiResponse<any>> {
    return httpClient.get('/api/usage/all')
  }

  /**
   * Validate API key format
   */
  validateApiKeyFormat(providerId: ProviderId, apiKey: string): boolean {
    const patterns: Record<string, RegExp> = {
      openai: /^sk-/,
      claude: /^sk-ant-/,
      gemini: /^AIza/,
      grok: /^xai-/,
      perplexity: /^pplx-/,
    }

    const pattern = patterns[providerId]
    return pattern ? pattern.test(apiKey) : false
  }

  /**
   * Check if API key is admin key
   */
  isAdminKey(providerId: ProviderId, apiKey: string): boolean {
    const adminPatterns: Record<string, RegExp> = {
      openai: /^sk-org-/,
      claude: /^sk-ant-api03-[\w-]{95}$/,
      grok: /^xai-org-/,
      perplexity: /^pplx-org-/,
    }

    const pattern = adminPatterns[providerId]
    if (pattern) {
      return pattern.test(apiKey)
    }

    // Special case for Gemini
    if (providerId === 'gemini') {
      return apiKey.includes('service-account') || apiKey.length > 50
    }

    return false
  }

  /**
   * Get recommended models for a provider
   */
  getRecommendedModels(providerId: ProviderId): string[] {
    const models: Record<string, string[]> = {
      openai: ['gpt-4-turbo', 'gpt-3.5-turbo'],
      claude: ['claude-3-opus', 'claude-3-sonnet'],
      gemini: ['gemini-pro', 'gemini-flash'],
      grok: ['grok-1'],
      perplexity: ['pplx-70b-online', 'pplx-7b-online'],
    }

    return models[providerId] || []
  }
}

export const providersService = new ProvidersService()
export default providersService