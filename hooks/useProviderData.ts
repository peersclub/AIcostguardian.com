'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProviderConnectionStatus, UsageStats } from '@/lib/types/usage'
import { ApiResponse } from '@/lib/types/api'

interface UseProviderStatusOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useProviderStatus(
  provider: string,
  options: UseProviderStatusOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options
  
  const [status, setStatus] = useState<ProviderConnectionStatus>({
    isConfigured: false,
    isValid: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/${provider}/status`)
      const data: ApiResponse<ProviderConnectionStatus> = await response.json()
      
      if (data.success && data.data) {
        setStatus(data.data)
      } else {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to fetch status'
        setError(errorMessage)
      }
    } catch (err) {
      setError('Network error occurred')
      console.error(`Error fetching ${provider} status:`, err)
    } finally {
      setLoading(false)
    }
  }, [provider])

  useEffect(() => {
    fetchStatus()
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStatus, autoRefresh, refreshInterval])

  return { status, loading, error, refetch: fetchStatus }
}

interface UseUsageStatsOptions {
  timeRange?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useUsageStats(
  provider: string,
  options: UseUsageStatsOptions = {}
) {
  const { timeRange = '30d', autoRefresh = false, refreshInterval = 60000 } = options
  
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/${provider}/usage?timeRange=${timeRange}`
      )
      const data: ApiResponse<UsageStats> = await response.json()
      
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to fetch usage stats'
        setError(errorMessage)
      }
    } catch (err) {
      setError('Network error occurred')
      console.error(`Error fetching ${provider} usage stats:`, err)
    } finally {
      setLoading(false)
    }
  }, [provider, timeRange])

  useEffect(() => {
    fetchStats()
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, autoRefresh, refreshInterval])

  return { stats, loading, error, refetch: fetchStats }
}

interface UseApiKeyOptions {
  autoLoad?: boolean
}

export function useApiKey(provider: string, options: UseApiKeyOptions = {}) {
  const { autoLoad = true } = options
  
  const [apiKey, setApiKey] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadApiKey = useCallback(async () => {
    if (!autoLoad) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/settings/api-keys/${provider}`)
      const data: ApiResponse<{ key: string }> = await response.json()
      
      if (data.success && data.data) {
        setApiKey(data.data.key)
      }
    } catch (err) {
      setError('Failed to load API key')
      console.error(`Error loading ${provider} API key:`, err)
    } finally {
      setLoading(false)
    }
  }, [provider, autoLoad])

  const saveApiKey = useCallback(async (newKey: string) => {
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey })
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setApiKey(newKey)
        return true
      } else {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to save API key'
        setError(errorMessage)
        return false
      }
    } catch (err) {
      setError('Network error occurred')
      console.error(`Error saving ${provider} API key:`, err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [provider])

  const deleteApiKey = useCallback(async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'DELETE'
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setApiKey('')
        return true
      } else {
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to delete API key'
        setError(errorMessage)
        return false
      }
    } catch (err) {
      setError('Network error occurred')
      console.error(`Error deleting ${provider} API key:`, err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [provider])

  useEffect(() => {
    if (autoLoad) {
      loadApiKey()
    }
  }, [loadApiKey, autoLoad])

  return {
    apiKey,
    setApiKey,
    loading,
    error,
    isSaving,
    saveApiKey,
    deleteApiKey,
    reloadApiKey: loadApiKey
  }
}

// Hook for managing all providers at once
export function useAllProviders() {
  const providers = ['openai', 'claude', 'gemini', 'grok', 'perplexity', 'mistral']
  const [providersData, setProvidersData] = useState<Record<string, {
    status: ProviderConnectionStatus
    stats: UsageStats | null
  }>>({})
  const [loading, setLoading] = useState(true)

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    
    const results = await Promise.all(
      providers.map(async (provider) => {
        try {
          const [statusRes, statsRes] = await Promise.all([
            fetch(`/api/${provider}/status`),
            fetch(`/api/${provider}/usage?timeRange=30d`)
          ])
          
          const statusData: ApiResponse<ProviderConnectionStatus> = await statusRes.json()
          const statsData: ApiResponse<UsageStats> = await statsRes.json()
          
          return {
            provider,
            status: statusData.data || { isConfigured: false, isValid: false },
            stats: statsData.data || null
          }
        } catch (err) {
          console.error(`Error fetching data for ${provider}:`, err)
          return {
            provider,
            status: { isConfigured: false, isValid: false, error: 'Failed to fetch' },
            stats: null
          }
        }
      })
    )
    
    const dataMap = results.reduce((acc, { provider, status, stats }) => {
      acc[provider] = { status, stats }
      return acc
    }, {} as typeof providersData)
    
    setProvidersData(dataMap)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return { providersData, loading, refetch: fetchAllData }
}