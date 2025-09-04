/**
 * React Hook for API Key Management
 * Provides a unified interface for all components to interact with API keys
 * Features:
 * - Real-time validation status
 * - Loading and error states
 * - Automatic retry logic
 * - Health monitoring UI
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Provider } from '@/lib/core/api-key.service'
import { toast } from 'sonner'

export interface ApiKeyStatus {
  provider: Provider
  isValid: boolean
  isLoading: boolean
  error?: string
  lastChecked?: Date
  model?: string
  health?: 'healthy' | 'degraded' | 'failed'
  rateLimit?: {
    remaining: number
    resetIn: string
  }
}

export interface UseApiKeysReturn {
  keys: Map<Provider, ApiKeyStatus>
  isLoading: boolean
  error: string | null
  
  // Actions
  saveKey: (provider: Provider, key: string) => Promise<boolean>
  deleteKey: (provider: Provider) => Promise<boolean>
  testKey: (provider: Provider) => Promise<boolean>
  testAllKeys: () => Promise<void>
  refreshKeys: () => Promise<void>
  
  // Utilities
  getKeyStatus: (provider: Provider) => ApiKeyStatus | undefined
  hasValidKey: (provider: Provider) => boolean
  getHealthyProviders: () => Provider[]
}

export function useApiKeys(): UseApiKeysReturn {
  const [keys, setKeys] = useState<Map<Provider, ApiKeyStatus>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch all API keys on mount
  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      
      const response = await fetch('/api/api-keys', {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      
      const data = await response.json()
      const newKeys = new Map<Provider, ApiKeyStatus>()
      
      // Process fetched keys
      data.keys?.forEach((key: any) => {
        newKeys.set(key.provider, {
          provider: key.provider,
          isValid: key.isActive,
          isLoading: false,
          lastChecked: key.lastTested ? new Date(key.lastTested) : undefined,
          health: key.isActive ? 'healthy' : 'failed'
        })
      })
      
      setKeys(newKeys)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching API keys:', err)
        setError(err.message || 'Failed to fetch API keys')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save or update an API key
  const saveKey = useCallback(async (provider: Provider, key: string): Promise<boolean> => {
    try {
      // Update UI to show loading
      setKeys(prev => {
        const updated = new Map(prev)
        updated.set(provider, {
          ...updated.get(provider) || { provider, isValid: false },
          isLoading: true,
          error: undefined
        })
        return updated
      })
      
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key')
      }
      
      // Update UI with success
      setKeys(prev => {
        const updated = new Map(prev)
        updated.set(provider, {
          provider,
          isValid: true,
          isLoading: false,
          lastChecked: new Date(),
          model: data.model,
          health: 'healthy'
        })
        return updated
      })
      
      toast.success(`${provider} API key saved successfully`)
      return true
    } catch (err: any) {
      // Update UI with error
      setKeys(prev => {
        const updated = new Map(prev)
        updated.set(provider, {
          ...updated.get(provider) || { provider, isValid: false },
          isLoading: false,
          error: err.message
        })
        return updated
      })
      
      toast.error(`Failed to save ${provider} key: ${err.message}`)
      return false
    }
  }, [])

  // Delete an API key
  const deleteKey = useCallback(async (provider: Provider): Promise<boolean> => {
    try {
      const response = await fetch(`/api/api-keys?provider=${provider}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete API key')
      }
      
      // Remove from state
      setKeys(prev => {
        const updated = new Map(prev)
        updated.delete(provider)
        return updated
      })
      
      toast.success(`${provider} API key deleted`)
      return true
    } catch (err: any) {
      toast.error(`Failed to delete ${provider} key: ${err.message}`)
      return false
    }
  }, [])

  // Test a specific API key
  const testKey = useCallback(async (provider: Provider): Promise<boolean> => {
    try {
      // Update UI to show testing
      setKeys(prev => {
        const updated = new Map(prev)
        const existing = updated.get(provider)
        if (existing) {
          updated.set(provider, { ...existing, isLoading: true })
        }
        return updated
      })
      
      const response = await fetch('/api/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      })
      
      const data = await response.json()
      
      // Update UI with test results
      setKeys(prev => {
        const updated = new Map(prev)
        updated.set(provider, {
          provider,
          isValid: data.isValid,
          isLoading: false,
          error: data.error,
          lastChecked: new Date(),
          model: data.model,
          health: data.isValid ? 'healthy' : 'failed'
        })
        return updated
      })
      
      if (data.isValid) {
        toast.success(`${provider} API key is valid`)
      } else {
        toast.error(`${provider} API key is invalid: ${data.error}`)
      }
      
      return data.isValid
    } catch (err: any) {
      setKeys(prev => {
        const updated = new Map(prev)
        const existing = updated.get(provider)
        if (existing) {
          updated.set(provider, {
            ...existing,
            isLoading: false,
            error: err.message,
            health: 'failed'
          })
        }
        return updated
      })
      
      toast.error(`Failed to test ${provider} key: ${err.message}`)
      return false
    }
  }, [])

  // Test all API keys
  const testAllKeys = useCallback(async () => {
    const providers = Array.from(keys.keys())
    const results = await Promise.allSettled(
      providers.map(provider => testKey(provider))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
    const failed = results.length - successful
    
    if (failed > 0) {
      toast.warning(`${successful} keys valid, ${failed} keys invalid or failed to test`)
    } else {
      toast.success(`All ${successful} API keys are valid`)
    }
  }, [keys, testKey])

  // Refresh all keys
  const refreshKeys = useCallback(async () => {
    await fetchKeys()
  }, [fetchKeys])

  // Get status for a specific provider
  const getKeyStatus = useCallback((provider: Provider): ApiKeyStatus | undefined => {
    return keys.get(provider)
  }, [keys])

  // Check if a provider has a valid key
  const hasValidKey = useCallback((provider: Provider): boolean => {
    const status = keys.get(provider)
    return status?.isValid === true
  }, [keys])

  // Get list of healthy providers
  const getHealthyProviders = useCallback((): Provider[] => {
    return Array.from(keys.entries())
      .filter(([_, status]) => status.health === 'healthy')
      .map(([provider]) => provider)
  }, [keys])

  // Initial load
  useEffect(() => {
    fetchKeys()
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchKeys])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchKeys()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchKeys])

  return {
    keys,
    isLoading,
    error,
    saveKey,
    deleteKey,
    testKey,
    testAllKeys,
    refreshKeys,
    getKeyStatus,
    hasValidKey,
    getHealthyProviders
  }
}

// Provider-specific hooks for convenience
export function useOpenAIKey() {
  const { getKeyStatus, hasValidKey, saveKey, testKey } = useApiKeys()
  const status = getKeyStatus('openai')
  
  return {
    hasKey: hasValidKey('openai'),
    isValid: status?.isValid || false,
    isLoading: status?.isLoading || false,
    error: status?.error,
    save: (key: string) => saveKey('openai', key),
    test: () => testKey('openai')
  }
}

export function useClaudeKey() {
  const { getKeyStatus, hasValidKey, saveKey, testKey } = useApiKeys()
  const status = getKeyStatus('claude')
  
  return {
    hasKey: hasValidKey('claude'),
    isValid: status?.isValid || false,
    isLoading: status?.isLoading || false,
    error: status?.error,
    save: (key: string) => saveKey('claude', key),
    test: () => testKey('claude')
  }
}

export function useGeminiKey() {
  const { getKeyStatus, hasValidKey, saveKey, testKey } = useApiKeys()
  const status = getKeyStatus('gemini')
  
  return {
    hasKey: hasValidKey('gemini'),
    isValid: status?.isValid || false,
    isLoading: status?.isLoading || false,
    error: status?.error,
    save: (key: string) => saveKey('gemini', key),
    test: () => testKey('gemini')
  }
}